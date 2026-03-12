import express from "express";
import { signup, login, googleSignIn } from "../controllers/authControllers.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.post("/google", googleSignIn);

export default router;
