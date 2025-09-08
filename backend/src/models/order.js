// backend/src/models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
 {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    books: [
      {
        bookId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Book",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        price: {
          type: Number,
          required: true, // Store price at purchase time
        },
        title: {
          type: String, // optional, nice for displaying in Stripe
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true, // in INR (rupees)
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled"],
      default: "pending",
    },

    stripeSessionId: {
      type: String, // To link the order with Stripe session
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
