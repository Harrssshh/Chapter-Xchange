import express from "express";
import { 
  createExchangeRequest, 
  getIncomingExchangeRequests, 
  getOutgoingExchangeRequests, 
  respondToExchangeRequest,
  updateExchangeShipmentStatus
} from "../controllers/exchangeControllers.js";
import { protect } from "../middleware/authmiddlewares.js";

const router = express.Router();

// All exchange routes require authentication
router.use(protect);

router.post("/", createExchangeRequest);
router.get("/incoming", getIncomingExchangeRequests);
router.get("/outgoing", getOutgoingExchangeRequests);
router.put("/:id", respondToExchangeRequest);
router.put("/:id/shipment", updateExchangeShipmentStatus);

export default router;
