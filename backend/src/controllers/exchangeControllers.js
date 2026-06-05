import ExchangeRequest from "../models/exchangeRequest.js";
import Book from "../models/book.js";
import User from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";

// ✅ 1. Create a Swap/Exchange Request
export const createExchangeRequest = async (req, res) => {
  try {
    const { receiver, wantedBook, offeredBook } = req.body;
    const sender = req.user.userId;

    if (!receiver || !wantedBook || !offeredBook) {
      return res.status(400).json({ success: false, message: "Missing required swap parameters" });
    }

    // Verify book ownerships
    const wantedBookObj = await Book.findById(wantedBook);
    const offeredBookObj = await Book.findById(offeredBook);

    if (!wantedBookObj) {
      return res.status(404).json({ success: false, message: "Requested book not found" });
    }
    if (!offeredBookObj) {
      return res.status(404).json({ success: false, message: "Offered book not found" });
    }

    if (wantedBookObj.isAvailable === false) {
      return res.status(400).json({ success: false, message: "The requested book is no longer available" });
    }
    if (offeredBookObj.isAvailable === false) {
      return res.status(400).json({ success: false, message: "The offered book is no longer available" });
    }

    // Verify offered book belongs to sender
    if (offeredBookObj.seller.toString() !== sender.toString()) {
      return res.status(403).json({ success: false, message: "You do not own the offered book" });
    }

    // Verify wanted book belongs to receiver
    if (wantedBookObj.seller.toString() !== receiver.toString()) {
      return res.status(400).json({ success: false, message: "The requested book is not owned by the specified receiver" });
    }

    // Check for existing pending request for these same books
    const existing = await ExchangeRequest.findOne({
      sender,
      receiver,
      wantedBook,
      offeredBook,
      status: "pending",
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "A pending swap request for these books already exists" });
    }

    const swapRequest = await ExchangeRequest.create({
      sender,
      receiver,
      wantedBook,
      offeredBook,
      status: "pending",
    });

    // ✉️ Send email notification to wanted book owner (receiver) asynchronously
    const receiverUser = await User.findById(receiver);
    const senderUser = await User.findById(sender);

    if (receiverUser && senderUser) {
      sendEmail({
        to: receiverUser.email,
        subject: `🔁 New Book Swap Request: "${wantedBookObj.title}" on ChapterExchange!`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <h2 style="color: #2563eb; margin-top: 0;">New Swap Offer! 🔁</h2>
            <p>Hello <strong>${receiverUser.name}</strong>,</p>
            <p>Great news! <strong>${senderUser.name}</strong> wants to trade one of their books in exchange for yours:</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">YOUR BOOK:</p>
              <p style="margin: 0 0 15px 0; font-size: 15px; font-weight: bold; color: #1e293b;">${wantedBookObj.title} <span style="font-size: 12px; color: #64748b; font-weight: normal;">by ${wantedBookObj.author}</span></p>
              
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #4f46e5; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">OFFERED BOOK (IN RETURN):</p>
              <p style="margin: 0; font-size: 15px; font-weight: bold; color: #1e293b;">${offeredBookObj.title} <span style="font-size: 12px; color: #64748b; font-weight: normal;">by ${offeredBookObj.author}</span></p>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #475569;"><strong>Condition:</strong> ${offeredBookObj.condition.toUpperCase()}</p>
            </div>
            
            <p>Head to your <strong>User Dashboard</strong> under the <strong>Swap Requests</strong> tab to accept or decline the offer.</p>
            <div style="margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/user?tab=swaps" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">View Swap Offer</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Happy Swapping!<br/>The ChapterExchange Hub Team</p>
          </div>
        `
      }).catch(err => console.error("Error sending swap offer email:", err));
    }

    res.status(201).json({ success: true, message: "Swap request sent successfully", swapRequest });
  } catch (err) {
    console.error("Create swap request error:", err);
    res.status(500).json({ success: false, message: "Server error creating swap request" });
  }
};

// ✅ 2. Get Incoming Swap Requests (where current user is the receiver)
export const getIncomingExchangeRequests = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const requests = await ExchangeRequest.find({ receiver: userId })
      .populate("sender", "name email")
      .populate("wantedBook", "title author image condition category price")
      .populate("offeredBook", "title author image condition category price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error("Get incoming swap requests error:", err);
    res.status(500).json({ success: false, message: "Server error fetching swap requests" });
  }
};

// ✅ 3. Get Outgoing Swap Requests (where current user is the sender)
export const getOutgoingExchangeRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await ExchangeRequest.find({ sender: userId })
      .populate("receiver", "name email")
      .populate("wantedBook", "title author image condition category price")
      .populate("offeredBook", "title author image condition category price")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (err) {
    console.error("Get outgoing swap requests error:", err);
    res.status(500).json({ success: false, message: "Server error fetching swap requests" });
  }
};

// ✅ 4. Respond to Swap Request (Accept or Reject)
export const respondToExchangeRequest = async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' | 'rejected'
    const requestId = req.params.id;
    const userId = req.user.userId;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status response" });
    }

    const swapRequest = await ExchangeRequest.findById(requestId);

    if (!swapRequest) {
      return res.status(404).json({ success: false, message: "Swap request not found" });
    }

    // Verify that the current user is the receiver
    if (swapRequest.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized to respond to this request" });
    }

    if (swapRequest.status !== "pending") {
      return res.status(400).json({ success: false, message: "This request has already been processed" });
    }

    swapRequest.status = status;
    await swapRequest.save();

    // Fetch resources before database changes for email population
    const senderUser = await User.findById(swapRequest.sender);
    const receiverUser = await User.findById(swapRequest.receiver);
    const wantedBookObj = await Book.findById(swapRequest.wantedBook);
    const offeredBookObj = await Book.findById(swapRequest.offeredBook);

    // If accepted, swap the book ownerships and mark them as unavailable (swapped)
    if (status === "accepted") {
      if (!wantedBookObj || !offeredBookObj) {
        return res.status(404).json({ success: false, message: "One of the swap books could not be found" });
      }
      if (wantedBookObj.isAvailable === false) {
        return res.status(400).json({ success: false, message: `The book "${wantedBookObj.title}" is no longer available` });
      }
      if (offeredBookObj.isAvailable === false) {
        return res.status(400).json({ success: false, message: `The book "${offeredBookObj.title}" is no longer available` });
      }

      if (wantedBookObj && offeredBookObj) {
        // Swap seller IDs
        const originalWantedSeller = wantedBookObj.seller.toString();
        const originalOfferedSeller = offeredBookObj.seller.toString();

        wantedBookObj.seller = originalOfferedSeller;
        offeredBookObj.seller = originalWantedSeller;
        wantedBookObj.isAvailable = false;
        offeredBookObj.isAvailable = false;

        await wantedBookObj.save();
        await offeredBookObj.save();

        // Auto-reject any other competing pending requests for either of these books
        await ExchangeRequest.updateMany(
          {
            _id: { $ne: swapRequest._id },
            status: "pending",
            $or: [
              { wantedBook: swapRequest.wantedBook },
              { offeredBook: swapRequest.wantedBook },
              { wantedBook: swapRequest.offeredBook },
              { offeredBook: swapRequest.offeredBook }
            ]
          },
          { status: "rejected" }
        );
      }
    }

    // ✉️ Send follow-up email response to the trade sender asynchronously
    if (senderUser && receiverUser && wantedBookObj && offeredBookObj) {
      const isAccepted = status === "accepted";
      const subject = isAccepted 
        ? `✅ Book Swap Accepted: "${wantedBookObj.title}" is Yours!`
        : `❌ Book Swap Update: Offer Declined`;
        
      const htmlContent = isAccepted
        ? `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <h2 style="color: #16a34a; margin-top: 0;">Swap Approved! 🎉</h2>
            <p>Hello <strong>${senderUser.name}</strong>,</p>
            <p>Incredible news! <strong>${receiverUser.name}</strong> has **accepted** your book swap offer!</p>
            
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #166534;"><strong>THE SWAP IS COMPLETED:</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 15px; font-weight: bold; color: #1e293b;">
                You traded your book <strong>"${offeredBookObj.title}"</strong> for their book <strong>"${wantedBookObj.title}"</strong>!
              </p>
            </div>
            
            <p>The book ownerships have been automatically transferred on the platform shelf. You can now coordinate the swap pickup or delivery with them directly.</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Contact Details:</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #1e293b;"><strong>Owner Name:</strong> ${receiverUser.name}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #1e293b;"><strong>Owner Email:</strong> <a href="mailto:${receiverUser.email}" style="color: #2563eb;">${receiverUser.email}</a></p>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Happy Reading!<br/>The ChapterExchange Hub Team</p>
          </div>
        `
        : `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <h2 style="color: #dc2626; margin-top: 0;">Swap Offer Update ❌</h2>
            <p>Hello <strong>${senderUser.name}</strong>,</p>
            <p>We wanted to let you know that <strong>${receiverUser.name}</strong> has declined your swap offer for their book <strong>"${wantedBookObj.title}"</strong>.</p>
            <p>Don't worry, your book <strong>"${offeredBookObj.title}"</strong> remains safely on your shelf, and there are plenty of other books in the community library to browse!</p>
            
            <div style="margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/browse" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Browse Other Books</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Happy Swapping!<br/>The ChapterExchange Hub Team</p>
          </div>
        `;

      sendEmail({
        to: senderUser.email,
        subject,
        html: htmlContent
      }).catch(err => console.error("Error sending swap response email:", err));
    }

    res.status(200).json({ 
      success: true, 
      message: `Swap request ${status} successfully`, 
      swapRequest 
    });
  } catch (err) {
    console.error("Respond to swap request error:", err);
    res.status(500).json({ success: false, message: "Server error responding to swap request" });
  }
};

// ✅ 5. Update Swap Shipment Status & Send Tracking Emails
export const updateExchangeShipmentStatus = async (req, res) => {
  try {
    const { shipmentStatus, trackingCode, shipmentProvider } = req.body;
    const requestId = req.params.id;
    const userId = req.user.userId;

    if (!["pending", "shipped", "delivered"].includes(shipmentStatus)) {
      return res.status(400).json({ success: false, message: "Invalid shipment status" });
    }

    const swapRequest = await ExchangeRequest.findById(requestId);
    if (!swapRequest) {
      return res.status(404).json({ success: false, message: "Swap request not found" });
    }

    if (swapRequest.status !== "accepted") {
      return res.status(400).json({ success: false, message: "Cannot track shipping for non-accepted swap requests" });
    }

    const isSender = swapRequest.sender.toString() === userId.toString();
    const isReceiver = swapRequest.receiver.toString() === userId.toString();

    if (!isSender && !isReceiver) {
      return res.status(403).json({ success: false, message: "Unauthorized to update shipment status" });
    }

    // Fetch books & user records for notification alerts
    const senderUser = await User.findById(swapRequest.sender);
    const receiverUser = await User.findById(swapRequest.receiver);
    const wantedBookObj = await Book.findById(swapRequest.wantedBook);
    const offeredBookObj = await Book.findById(swapRequest.offeredBook);

    if (isSender) {
      // Current user is Sender: updating shipping for their Offered Book
      swapRequest.senderShipmentStatus = shipmentStatus;
      if (trackingCode !== undefined) swapRequest.senderTrackingCode = trackingCode;
      if (shipmentProvider !== undefined) swapRequest.senderShipmentProvider = shipmentProvider;

      // Email the Receiver (Wanted Book Owner) about Sender's shipping update
      if (receiverUser && senderUser && offeredBookObj) {
        const subject = `🚚 Shipping Update: "${offeredBookObj.title}" is ${shipmentStatus.toUpperCase()}!`;
        const html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <h2 style="color: #4f46e5; margin-top: 0;">Courier Transit Alert! 🚚</h2>
            <p>Hello <strong>${receiverUser.name}</strong>,</p>
            <p>Great news! <strong>${senderUser.name}</strong> has updated the shipment status for their book <strong>"${offeredBookObj.title}"</strong>:</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">SHIPMENT STATUS:</p>
              <p style="margin: 0 0 15px 0; font-size: 15px; font-weight: bold; color: ${shipmentStatus === 'delivered' ? '#16a34a' : '#2563eb'};">
                ${shipmentStatus === 'delivered' ? '🎉 DELIVERED & RECEIVED' : '🚚 SHIPPED & IN TRANSIT'}
              </p>
              
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">COURIER PROVIDER:</p>
              <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: bold; color: #1e293b;">${shipmentProvider || 'Hand-Delivery / Pickup'}</p>
              
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">TRACKING NUMBER:</p>
              <p style="margin: 0; font-size: 14px; font-weight: bold; font-family: monospace; color: #1e293b;">${trackingCode || 'N/A'}</p>
            </div>
            
            <p>You can track both packages inside your <strong>User Dashboard</strong> under the <strong>Swap Requests</strong> tab.</p>
            <div style="margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/user?tab=swaps" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">View Tracking Timeline</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Safe Trading!<br/>The ChapterExchange Hub Team</p>
          </div>
        `;
        sendEmail({ to: receiverUser.email, subject, html }).catch(err => console.error("Error sending shipment email:", err));
      }
    } else {
      // Current user is Receiver: updating shipping for their Wanted Book
      swapRequest.receiverShipmentStatus = shipmentStatus;
      if (trackingCode !== undefined) swapRequest.receiverTrackingCode = trackingCode;
      if (shipmentProvider !== undefined) swapRequest.receiverShipmentProvider = shipmentProvider;

      // Email the Sender about Receiver's shipping update
      if (senderUser && receiverUser && wantedBookObj) {
        const subject = `🚚 Shipping Update: "${wantedBookObj.title}" is ${shipmentStatus.toUpperCase()}!`;
        const html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <h2 style="color: #4f46e5; margin-top: 0;">Courier Transit Alert! 🚚</h2>
            <p>Hello <strong>${senderUser.name}</strong>,</p>
            <p>Great news! <strong>${receiverUser.name}</strong> has updated the shipment status for their book <strong>"${wantedBookObj.title}"</strong>:</p>
            
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">SHIPMENT STATUS:</p>
              <p style="margin: 0 0 15px 0; font-size: 15px; font-weight: bold; color: ${shipmentStatus === 'delivered' ? '#16a34a' : '#2563eb'};">
                ${shipmentStatus === 'delivered' ? '🎉 DELIVERED & RECEIVED' : '🚚 SHIPPED & IN TRANSIT'}
              </p>
              
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">COURIER PROVIDER:</p>
              <p style="margin: 0 0 15px 0; font-size: 14px; font-weight: bold; color: #1e293b;">${shipmentProvider || 'Hand-Delivery / Pickup'}</p>
              
              <p style="margin: 0 0 5px 0; font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">TRACKING NUMBER:</p>
              <p style="margin: 0; font-size: 14px; font-weight: bold; font-family: monospace; color: #1e293b;">${trackingCode || 'N/A'}</p>
            </div>
            
            <p>You can track both packages inside your <strong>User Dashboard</strong> under the <strong>Swap Requests</strong> tab.</p>
            <div style="margin: 25px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/user?tab=swaps" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">View Tracking Timeline</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="font-size: 12px; color: #94a3b8; margin-bottom: 0;">Safe Trading!<br/>The ChapterExchange Hub Team</p>
          </div>
        `;
        sendEmail({ to: senderUser.email, subject, html }).catch(err => console.error("Error sending shipment email:", err));
      }
    }

    await swapRequest.save();
    res.status(200).json({ success: true, message: "Shipment details updated successfully", swapRequest });
  } catch (err) {
    console.error("Update shipment error:", err);
    res.status(500).json({ success: false, message: "Server error updating shipment details" });
  }
};
