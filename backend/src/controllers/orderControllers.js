import Order from "../models/order.js";
import Stripe from "stripe";
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

    const orders = await Order.find({ userId }).populate("books.bookId");

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
    const { items, totalAmount } = req.body;

    if (!items?.length) return res.status(400).json({ message: "Cart is empty" });

    const order = await Order.create({
      user: userId,
      books: items.map(item => ({
      bookId: item.bookId,
      quantity: item.quantity,
      price: item.price,
      })),
      totalAmount,
      status: "pending",
      });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.user.email,
      line_items: items.map((it) => ({
        price_data: {
          currency: "inr",
          product_data: { name: it.title || "Book" },
          unit_amount: it.price * 100, 
        },
        quantity: it.quantity,
      })),
      success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    order.stripeSessionId = session.id;
    await order.save();

    res.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("Stripe session error:", err);
    res.status(500).json({ message: "Failed to create checkout" });
  }
};