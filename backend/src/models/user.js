// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant", // Optional if you use multi-tenancy
    },
    googleId: {
      type: String,
      default: null, // If logged in using Google OAuth
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
