import Stripe from "stripe";
import Order from "../models/order.js";
import Book from "../models/book.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️  Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;

      if (orderId) {
        const order = await Order.findByIdAndUpdate(orderId, { status: "paid" }, { new: true });
        if (order && order.books) {
          for (const item of order.books) {
            await Book.findByIdAndUpdate(item.bookId, { isAvailable: false });
          }
        }
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    return res.status(500).send("Webhook handler failed");
  }
};
