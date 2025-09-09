import axios from "axios";

const API = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}/api/cart` });


// Get all books
export const getBooks = async () => {
  const { data } = await API.get("/books");
  return data;
};

// Get single book by ID
export const getBookById = async (id) => {
  const { data } = await API.get(`/books/${id}`);
  return data;
};

// Add book (requires auth token)
export const addBook = async (book, token) => {
  const { data } = await API.post("/books", book, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Update book
export const updateBook = async (id, updatedBook, token) => {
  const { data } = await API.put(`/books/${id}`, updatedBook, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Delete book
export const deleteBook = async (id, token) => {
  const { data } = await API.delete(`/books/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
