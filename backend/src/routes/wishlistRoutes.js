import express from "express";
import { getWishlist, toggleWishlist } from "../controllers/wishlistControllers.js";
import { protect } from "../middleware/authmiddlewares.js";

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);

export default router;
