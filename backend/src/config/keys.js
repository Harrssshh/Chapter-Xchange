
// src/config/keys.js
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

export const config = {
  PORT: process.env.PORT || 5001,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || "defaultsecret",
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
};
