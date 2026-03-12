import express from "express";
import { upload } from "../middleware/uploads.js";
import { addBook, getBooks, getBookById, updateBook, deleteBook,getUserBooks} from "../controllers/bookControllers.js";
import { protect } from "../middleware/authmiddlewares.js";
const router = express.Router();

router.get("/", getBooks);
router.get("/user/:userId", getUserBooks); 
router.get("/:id", getBookById);

router.post("/", protect, upload, addBook);
router.put("/:id", protect, updateBook);
router.delete("/:id", protect, deleteBook);
router.get("/user/:userId", getUserBooks);

export default router;
