import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { notFound, errorHandler } from "./middleware/errormiddlewares.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import webhookRoutes from "./routes/webHookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import exchangeRoutes from "./routes/exchangeRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

const app = express();


// ✅ Allowed frontend origins
const allowedOrigins = [
  "https://chapter-xchange.vercel.app",
  "http://localhost:5173"
];

// ✅ Proper CORS config
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

// ✅ Webhook routes (MUST be registered before express.json() body parser to receive raw buffer)
app.use("/api/webhooks", webhookRoutes);

// ✅ Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logger
app.use(morgan("dev"));


// ✅ Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/exchanges", exchangeRoutes);
app.use("/api/wishlist", wishlistRoutes);


// ✅ Error handling
app.use(notFound);
app.use(errorHandler);

export default app;