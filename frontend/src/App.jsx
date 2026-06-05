import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./Pages/Index";
import NotFound from "./Pages/NotFound";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import AddBook from "./Pages/AddBook";
import BrowseBooks from "./Pages/BrowseBooks";
import BookDetails from "./Pages/BookDetails"; 
import Cart from "./Pages/Cart"; 
import UserPanel from "./Pages/UserPanel";
import UserProfile from "./Pages/UserProfile";
import ForgotPassword from "./Pages/ForgotPassword";
import ResetPassword from "./Pages/ResetPassword";
import Wishlist from "./Pages/Wishlist";
import OrderSuccess from "./Pages/OrderSuccess";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/browse" element={<BrowseBooks />} />
        <Route path="/add-book" element={<AddBook />} />
        <Route path="/books/:id" element={<BookDetails />} /> 
        <Route path="/user" element={<UserPanel />} />
        <Route path="/profile" element={<Navigate to="/user?tab=profile" replace />} />
        <Route path="/my-books" element={<Navigate to="/user?tab=books" replace />} />
        <Route path="/orders" element={<Navigate to="/user?tab=orders" replace />} />
        <Route path="/cart" element={<Cart />} /> 
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/wishlist" element={<Wishlist />} /> 
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
  </QueryClientProvider>
);

export default App;
