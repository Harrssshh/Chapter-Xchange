import axios from "axios";

const API = axios.create({ baseURL: `${import.meta.env.VITE_API_URL}`});

export const loginUser = async (email, password) => {
  const res = await API.post("/api/auth/login", { email, password });
  return res.data;
};

export const signupUser = async (name, email, password) => {
  const res = await API.post("/api/auth/signup", { name, email, password });
  return res.data;
};

export const googleLogin = async (token) => {
  const res = await API.post("/api/auth/google", { token });
  return res.data;
};

export const logoutUser = async () => {
  const res = await API.post("/api/auth/logout");
  return res.data;
};
