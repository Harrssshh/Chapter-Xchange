import axios from "axios";

const API = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api/cart` });
export const getCart = async (userId) => {
  const res = await API.get(`/${userId}`);
  return res.data;
};

export const addToCart = async (userId, bookId) => {
  const res = await API.post("/", { userId, bookId });
  return res.data;
};

export const removeFromCart = async (userId, bookId) => {
  const res = await API.delete("/", { data: { userId, bookId } });
  return res.data;
};
