import express from "express";
import { stripeWebhook } from "../controllers/webHookControllers.js";

const router = express.Router();
// raw body for Stripe
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
