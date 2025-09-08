// src/routes/authRoutes.js
import express from "express";
import { signup, login, googleSignIn } from "../controllers/authControllers.js";

const router = express.Router();

// Manual authentication
router.post("/signup", signup);
router.post("/login", login);

// Google OAuth login
router.post("/google", googleSignIn);

export default router;
