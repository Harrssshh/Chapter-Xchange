
// src/app.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config/keys.js";
import connectDB from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errormiddlewares.js";
import orderRoutes from "./routes/orderRoutes.js";
// Routes
import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import webhookRoutes from "./routes/webHookRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userRoutes from "./routes/userRoutes.js";
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "../uploads"); // <-- go up one level
app.use("/uploads", express.static(uploadsPath));

app.use("/api/webhooks", webhookRoutes);
// Middleware
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:5173", // local dev
  "https://your-frontend.vercel.app" // production frontend
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));



// Database Connection
connectDB();
// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);



export default app;