import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        <Route path="/user" element={<UserProfile />} />   
        <Route path="/cart" element={<Cart />} /> 
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
  </QueryClientProvider>
);

export default App;
