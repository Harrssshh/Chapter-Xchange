// src/routes/bookRoutes.js
import express from "express";
import multer from "multer";
import { addBook, getBooks, getBookById, updateBook, deleteBook,getUserBooks} from "../controllers/bookControllers.js";
import { protect } from "../middleware/authmiddlewares.js";
const router = express.Router();
// Memory storage for Cloudinary upload
const storage = multer.memoryStorage();
export const upload = multer({ storage }).single("image");


// Public Routes
router.get("/", getBooks);
router.get("/user/:userId", getUserBooks); // ✅ moved above `/:id`
router.get("/:id", getBookById);

// Protected (Only logged-in users)
router.post("/", protect, upload, addBook);
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);
router.get("/user/:userId", getUserBooks);

export default router;
