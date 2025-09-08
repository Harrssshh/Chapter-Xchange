// src/routes/userRoutes.js
import express from "express";
import { getProfile, updateProfile } from "../controllers/userControllers.js";
import { protect } from "../middleware/authmiddlewares.js";

const router = express.Router();

// Protected
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
