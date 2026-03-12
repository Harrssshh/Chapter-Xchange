import Cart from "../models/cart.js";
import Book from "../models/book.js";


export const getCart = async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.user.userId }).populate("bookId");
    res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch cart" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ success: false, message: "Book not found" });

    const existingItem = await Cart.findOne({ userId: req.user.userId, bookId });
    if (existingItem) return res.status(400).json({ success: false, message: "Book already in cart" });

    const cartItem = await Cart.create({ userId: req.user.userId, bookId });
    res.status(201).json({ success: true, cartItem });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, message: "Failed to add to cart" });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findById(id);
    if (!cartItem) return res.status(404).json({ success: false, message: "Cart item not found" });

    if (cartItem.userId.toString() !== req.user.userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await cartItem.deleteOne();
    res.status(200).json({ success: true, message: "Removed from cart" });
  } catch (err) {
    console.error("Remove cart error:", err);
    res.status(500).json({ success: false, message: "Failed to remove from cart" });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.deleteMany({ userId: req.user.userId });
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ success: false, message: "Failed to clear cart" });
  }
};