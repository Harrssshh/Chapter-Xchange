import Stripe from "stripe";
import Order from "../models/order.js";

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
        await Order.findByIdAndUpdate(orderId, { status: "paid" });
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error("Webhook handling error:", err);
    return res.status(500).send("Webhook handler failed");
  }
};
