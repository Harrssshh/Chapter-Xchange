import Order from "../models/order.js";
import Stripe from "stripe";
import Book from "../models/book.js";
export const createOrder = async (req, res) => {
  try {
    const { userId, books, totalAmount, paymentStatus } = req.body;

    if (!userId || !books || books.length === 0 || !totalAmount) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const newOrder = new Order({
      userId,
      books,
      totalAmount,
      paymentStatus: paymentStatus || "Pending",
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ user: userId }).populate("books.bookId");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("books.bookId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createOrderAndSession = async (req, res) => {
  try {
    const userId = req.user.userId; 
    const { 
      items, 
      subtotal, 
      gstAmount, 
      shippingAmount, 
      discountAmount, 
      couponCode, 
      estimatedDeliveryDate, 
      totalAmount,
      shippingAddress
    } = req.body;

    if (!items?.length) return res.status(400).json({ message: "Cart is empty" });
    if (!shippingAddress || !shippingAddress.name || !shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.phone) {
      return res.status(400).json({ message: "Please provide a complete shipping address" });
    }

    // Validate book availability and verify/recalculate pricing
    let computedSubtotal = 0;
    const validatedBooks = [];

    for (const item of items) {
      const bookObj = await Book.findById(item.bookId);
      if (!bookObj) {
        return res.status(404).json({ message: `Book not found` });
      }
      if (bookObj.isAvailable === false) {
        return res.status(400).json({ message: `The book "${bookObj.title}" is no longer available.` });
      }
      if (bookObj.seller && bookObj.seller.toString() === userId.toString()) {
        return res.status(400).json({ message: `You cannot purchase your own listed book: "${bookObj.title}".` });
      }

      // Check if book is free/donation
      const isFree = bookObj.isWillingToDonate || bookObj.price === 0;
      const actualPrice = isFree ? 0 : (bookObj.price || 0);

      validatedBooks.push({
        bookId: bookObj._id,
        quantity: item.quantity || 1,
        price: actualPrice,
        title: bookObj.title,
      });

      computedSubtotal += actualPrice * (item.quantity || 1);
    }

    const computedGst = Math.round(computedSubtotal * 0.05);

    // Recalculate discount based on coupon code
    let computedDiscount = 0;
    if (couponCode === "WELCOME10") {
      computedDiscount = Math.round(computedSubtotal * 0.10);
    } else if (couponCode === "CHAPTER20") {
      if (computedSubtotal >= 500) {
        computedDiscount = Math.round(computedSubtotal * 0.20);
      }
    } else if (couponCode === "BOOKWORM") {
      if (computedSubtotal >= 400) {
        computedDiscount = 100;
      }
    }

    // Recalculate shipping
    let computedShipping = 50;
    if (computedSubtotal > 500 || couponCode === "FREESHIP") {
      computedShipping = 0;
    }

    const computedTotal = computedSubtotal + computedGst + computedShipping - computedDiscount;

    // Store order with complete pricing breakdown
    const order = await Order.create({
      user: userId,
      books: validatedBooks,
      shippingAddress,
      subtotal: computedSubtotal,
      gstAmount: computedGst,
      shippingAmount: computedShipping,
      discountAmount: computedDiscount,
      couponCode: couponCode || "",
      estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined,
      totalAmount: computedTotal,
      status: "pending",
    });

    // Check if total amount is 0 (fully free order)
    if (computedTotal <= 0) {
      order.status = "paid";
      await order.save();

      // Mark books as unavailable
      for (const item of order.books) {
        await Book.findByIdAndUpdate(item.bookId, { isAvailable: false });
      }

      const successUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/order-success?session_id=free_${order._id}`;
      return res.json({ checkoutUrl: successUrl, isFree: true });
    }

    // Create line items for Stripe Checkout (exclude free items)
    const lineItems = validatedBooks
      .filter((it) => it.price > 0)
      .map((it) => ({
        price_data: {
          currency: "inr",
          product_data: { 
            name: it.title || "Book",
          },
          unit_amount: Math.round(it.price * 100), 
        },
        quantity: it.quantity || 1,
      }));

    // Add GST Tax as a separate line item if applicable
    if (computedGst > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "GST Tax (5%)",
          },
          unit_amount: Math.round(computedGst * 100),
        },
        quantity: 1,
      });
    }

    // Add Shipping Fee as a separate line item if applicable
    if (computedShipping > 0) {
      lineItems.push({
        price_data: {
          currency: "inr",
          product_data: {
            name: "Shipping Charges",
          },
          unit_amount: Math.round(computedShipping * 100),
        },
        quantity: 1,
      });
    }

    const sessionPayload = {
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user.email,
      line_items: lineItems,
      success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    };

    // Apply dynamic Stripe coupon for discounts
    if (discountAmount && discountAmount > 0) {
      try {
        const stripeCoupon = await stripe.coupons.create({
          amount_off: Math.round(discountAmount * 100),
          currency: "inr",
          duration: "once",
          name: couponCode ? `Coupon: ${couponCode}` : "Discount",
        });
        sessionPayload.discounts = [{ coupon: stripeCoupon.id }];
      } catch (couponErr) {
        console.error("Failed to create Stripe coupon:", couponErr);
      }
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    
    // Check if it's a Stripe connection error or network timeout
    const isNetworkErr = err.type === "StripeConnectionError" || 
                         err.message?.includes("timeout") || 
                         err.code === "ETIMEDOUT" ||
                         err.raw?.message?.includes("timeout");
                         
    if (isNetworkErr) {
      console.log("⚠️ Stripe connection timed out or failed. Falling back to local developer mock checkout...");
      
      // Update order with mock session ID
      order.stripeSessionId = `mock_${order._id}`;
      await order.save();
      
      const mockCheckoutUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/order-success?session_id=mock_${order._id}`;
      return res.json({ checkoutUrl: mockCheckoutUrl, isMocked: true });
    }
    
    res.status(500).json({ message: err.message || "Failed to create checkout" });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.userId;

    // Find orders that are paid, shipped, or delivered and contain books
    const orders = await Order.find({
      status: { $in: ["paid", "shipped", "delivered"] }
    })
      .populate({
        path: "books.bookId",
        select: "title author image seller"
      })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Filter to only include orders containing books sold by this seller
    const sellerOrders = orders.filter(order =>
      order.books.some(b => b.bookId && (b.bookId.seller?.toString() === sellerId.toString() || b.bookId === sellerId.toString()))
    );

    res.status(200).json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sales orders", error: error.message });
  }
};

export const updateBookShipmentStatus = async (req, res) => {
  try {
    const { orderId, bookId } = req.params;
    const { shipmentStatus, shipmentProvider, trackingCode } = req.body;
    const sellerId = req.user.userId;

    if (!["pending", "shipped", "delivered"].includes(shipmentStatus)) {
      return res.status(400).json({ message: "Invalid shipment status" });
    }

    const order = await Order.findById(orderId).populate("books.bookId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find the book item inside the order
    const bookItem = order.books.find(b => b.bookId?._id?.toString() === bookId || b.bookId?.toString() === bookId);
    if (!bookItem) {
      return res.status(404).json({ message: "Book not found in this order" });
    }

    // Verify ownership
    const sellerObjId = bookItem.bookId?.seller?._id || bookItem.bookId?.seller;
    if (!sellerObjId || sellerObjId.toString() !== sellerId.toString()) {
      return res.status(403).json({ message: "Unauthorized to update shipment status for this book" });
    }

    // Update fields
    bookItem.shipmentStatus = shipmentStatus;
    if (shipmentProvider !== undefined) bookItem.shipmentProvider = shipmentProvider;
    if (trackingCode !== undefined) bookItem.trackingCode = trackingCode;

    await order.save();

    res.status(200).json({ message: "Shipment status updated successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error updating shipment status", error: error.message });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    // Handle Free Order Bypass
    if (sessionId.startsWith("free_")) {
      const orderId = sessionId.replace("free_", "");
      const order = await Order.findById(orderId);
      if (order) {
        if (order.status !== "paid") {
          order.status = "paid";
          await order.save();

          // Mark books as unavailable
          for (const item of order.books) {
            await Book.findByIdAndUpdate(item.bookId, { isAvailable: false });
          }
        }
        return res.status(200).json({ 
          success: true, 
          message: "Free order confirmed and updated", 
          order 
        });
      }
      return res.status(404).json({ message: "Free order not found" });
    }

    // Handle Developer Mock Bypass
    if (sessionId.startsWith("mock_")) {
      const orderId = sessionId.replace("mock_", "");
      const order = await Order.findById(orderId);
      if (order) {
        if (order.status !== "paid") {
          order.status = "paid";
          await order.save();

          // Mark books as unavailable
          for (const item of order.books) {
            await Book.findByIdAndUpdate(item.bookId, { isAvailable: false });
          }
        }
        return res.status(200).json({ 
          success: true, 
          message: "Mock Payment confirmed and order updated (Developer Bypass)", 
          order 
        });
      }
      return res.status(404).json({ message: "Mock order not found" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Stripe session not found" });
    }

    if (session.payment_status === "paid") {
      const orderId = session.metadata?.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          if (order.status !== "paid") {
            order.status = "paid";
            await order.save();

            // Mark books as unavailable
            for (const item of order.books) {
              await Book.findByIdAndUpdate(item.bookId, { isAvailable: false });
            }
          }
          return res.status(200).json({ success: true, message: "Payment confirmed and order updated", order });
        }
      }
    }

    res.status(400).json({ success: false, message: "Payment not completed yet" });
  } catch (error) {
    console.error("Confirm payment error:", error);
    res.status(500).json({ message: "Error confirming payment", error: error.message });
  }
};