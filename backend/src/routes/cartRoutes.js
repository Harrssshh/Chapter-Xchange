// src/routes/cartRoutes.js
import express from "express";
import { addToCart, getCart, removeFromCart, clearCart } from "../controllers/cartControllers.js";
import { protect } from "../middleware/authmiddlewares.js";

const router = express.Router();

router.use(protect); // All routes below are protected

router.post("/add", addToCart);
router.get("/", getCart);
router.delete("/remove/:bookId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
