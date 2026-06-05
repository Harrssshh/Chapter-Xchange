import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(storedCart.length);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    updateCartCount();
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setToken(null);
        setUser(null);
      }
      updateCartCount();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData, jwtToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    setUser(userData);
    setToken(jwtToken);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("cart");
    setUser(null);
    setToken(null); 
    updateCartCount();
  };

  return (
    <UserContext.Provider value={{ user, token, setUser, login, logout, cartCount, updateCartCount }}>
      {children}
    </UserContext.Provider>
  );
};