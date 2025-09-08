import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import './index.css';
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import App from './App.jsx';
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";

const CLIENT_ID =import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          <AuthProvider>
            <App />
          </AuthProvider>
          <Toaster position="top-right" reverseOrder={false} />
        </GoogleOAuthProvider>
      </UserProvider>
    </BrowserRouter>
  </StrictMode>
);

