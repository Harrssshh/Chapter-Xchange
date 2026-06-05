import express from "express";
import { signup, login, googleSignIn, forgotPassword, resetPassword } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleSignIn);

router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;
