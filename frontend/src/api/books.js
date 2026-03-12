import axios from "axios";

const API = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api/cart` });


export const getBooks = async () => {
  const { data } = await API.get("/books");
  return data;
};

export const getBookById = async (id) => {
  const { data } = await API.get(`/books/${id}`);
  return data;
};

export const addBook = async (book, token) => {
  const { data } = await API.post("/books", book, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const updateBook = async (id, updatedBook, token) => {
  const { data } = await API.put(`/books/${id}`, updatedBook, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteBook = async (id, token) => {
  const { data } = await API.delete(`/books/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
