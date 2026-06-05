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
          required: true, 
        },
        title: {
          type: String, 
        },
        shipmentStatus: {
          type: String,
          enum: ["pending", "shipped", "delivered"],
          default: "pending",
        },
        shipmentProvider: {
          type: String,
          default: "",
        },
        trackingCode: {
          type: String,
          default: "",
        },
      },
    ],

    subtotal: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    shippingAmount: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    couponCode: {
      type: String,
      default: "",
    },

    estimatedDeliveryDate: {
      type: Date,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "canceled"],
      default: "pending",
    },

    stripeSessionId: {
      type: String, 
    },
    shippingAddress: {
      name: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
