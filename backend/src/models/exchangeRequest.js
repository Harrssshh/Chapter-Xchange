import mongoose from "mongoose";

const exchangeRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    wantedBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    offeredBook: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    senderShipmentStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
    receiverShipmentStatus: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
    senderTrackingCode: {
      type: String,
      default: "",
    },
    receiverTrackingCode: {
      type: String,
      default: "",
    },
    senderShipmentProvider: {
      type: String,
      default: "",
    },
    receiverShipmentProvider: {
      type: String,
      default: "",
    },

  },
  { timestamps: true }
);

const ExchangeRequest = mongoose.model("ExchangeRequest", exchangeRequestSchema);
export default ExchangeRequest;
