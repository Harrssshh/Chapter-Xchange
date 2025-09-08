import express from "express";
import { getUserOrders } from "../controllers/orderControllers.js";
import { createOrderAndSession } from "../controllers/orderControllers.js";
import { protect } from "../middleware/authmiddlewares.js";
const router = express.Router();

// Fetch orders of a specific user
router.get("/user/:userId", getUserOrders);
router.post("/", protect, createOrderAndSession);
export default router;
