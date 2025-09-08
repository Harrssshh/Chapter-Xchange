import Navbar from "./Navbar";
import React from "react";
 
const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container  mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 Chapter Exchange Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

