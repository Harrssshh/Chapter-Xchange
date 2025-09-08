import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5001/api/cart" });

// Get user cart
export const getCart = async (userId) => {
  const res = await API.get(`/${userId}`);
  return res.data;
};

// Add book to cart
export const addToCart = async (userId, bookId) => {
  const res = await API.post("/", { userId, bookId });
  return res.data;
};

// Remove book from cart
export const removeFromCart = async (userId, bookId) => {
  const res = await API.delete("/", { data: { userId, bookId } });
  return res.data;
};
