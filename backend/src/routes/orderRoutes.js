import express from "express";
import { 
  getUserOrders, 
  createOrderAndSession, 
  getSellerOrders, 
  updateBookShipmentStatus,
  confirmPayment
} from "../controllers/orderControllers.js";
import { protect } from "../middleware/authmiddlewares.js";
const router = express.Router();

router.get("/user/:userId", getUserOrders);
router.get("/seller", protect, getSellerOrders);
router.post("/", protect, createOrderAndSession);
router.post("/confirm-payment", protect, confirmPayment);
router.put("/:orderId/books/:bookId/shipment", protect, updateBookShipmentStatus);

export default router;
