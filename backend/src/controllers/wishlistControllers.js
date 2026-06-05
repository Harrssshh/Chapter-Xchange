import Wishlist from "../models/wishlist.js";
import Book from "../models/book.js";

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "books",
      match: { isAvailable: { $ne: false } }, // only fetch available books
    });

    if (!wishlist) {
      // Return empty array format if no wishlist exists yet
      return res.status(200).json({ success: true, books: [] });
    }

    const filteredBooks = (wishlist.books || []).filter(b => b !== null);
    res.status(200).json({ success: true, books: filteredBooks });
  } catch (err) {
    console.error("Get wishlist error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch wishlist" });
  }
};

// Toggle book in user's wishlist (Add if not present, Remove if present)
export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ success: false, message: "Please provide a book ID" });
    }

    // Verify book exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: userId,
        books: [bookId],
      });
      return res.status(200).json({
        success: true,
        message: "Book added to wishlist",
        isAdded: true,
        books: wishlist.books,
      });
    }

    const index = wishlist.books.findIndex(id => id && id.toString() === bookId.toString());

    let isAdded = false;
    if (index === -1) {
      wishlist.books.push(bookId);
      isAdded = true;
    } else {
      wishlist.books.splice(index, 1);
    }

    await wishlist.save();

    res.status(200).json({
      success: true,
      message: isAdded ? "Book added to wishlist" : "Book removed from wishlist",
      isAdded,
      books: wishlist.books,
    });
  } catch (err) {
    console.error("Toggle wishlist error:", err);
    res.status(500).json({ success: false, message: "Failed to toggle wishlist" });
  }
};
