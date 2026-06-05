import Navbar from "./Navbar";
import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
      <Navbar />
      <main className="flex-grow w-full max-w-[100vw] overflow-x-hidden px-4 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      <footer className="bg-white border-t border-gray-100 py-5">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2025 <span className="font-semibold text-gray-700">Chapter Exchange Hub</span>. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
