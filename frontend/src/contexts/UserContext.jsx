import React, { createContext, useState, useEffect } from "react";

// Create context
export const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // ✅ add token state

  // Load user & token from localStorage on initial render
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Update user/token when localStorage changes (multi-tab support)
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
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = (userData, jwtToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", jwtToken);
    setUser(userData);
    setToken(jwtToken); // ✅ save token in state too
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null); // ✅ clear token
  };

  return (
    <UserContext.Provider value={{ user, token, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};