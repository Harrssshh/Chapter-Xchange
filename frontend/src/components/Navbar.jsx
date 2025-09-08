import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User } from "lucide-react";
import { UserContext } from "../contexts/UserContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useContext(UserContext); // Use context
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setIsUserMenuOpen(!isUserMenuOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl">ChapterExchange</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="px-3 py-2 hover:text-primary">Home</Link>
            <Link to="/browse" className="px-3 py-2 hover:text-primary">Browse Books</Link>

            {/* ✅ Show Add Book only if logged in */}
            {user && (
              <Link
                to="/add-book"
                className="px-3 py-2 hover:text-primary"
              >
                Add Book
              </Link>
            )}

            <Link to="/cart" className="px-3 py-2 flex items-center gap-1 hover:text-primary">
              <ShoppingCart className="h-5 w-5" /> Cart
            </Link>

            {!user ? (
              <div className="pl-4 border-l flex items-center space-x-2">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">Login</button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 text-sm bg-primary text-white bg-black rounded-lg hover:bg-primary/90">Sign Up</button>
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleUserMenu}
                  className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-100"
                >
                  <User className="h-5 w-5" />
                  <span>{user?.name?.split(" ")[0]}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2">
                    <div className="px-4 py-2 border-b">
                      <p className="text-sm font-semibold">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>

                    {/* Profile Link */}
                    <Link
                      to="/user"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>

                    {/* My Books Link */}
                    <Link
                      to="/my-books"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      My Books
                    </Link>

                    {/* Orders Link */}
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Orders
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-gray-700 hover:text-primary">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3 space-y-2">
            <Link to="/" className="block px-3 py-2 hover:text-primary" onClick={toggleMenu}>Home</Link>
            <Link to="/browse" className="block px-3 py-2 hover:text-primary" onClick={toggleMenu}>Browse Books</Link>

            {/* ✅ Show Add Book only if logged in (Mobile) */}
            {user && (
              <Link
                to="/add-book"
                className="block px-3 py-2 hover:text-primary"
                onClick={toggleMenu}
              >
                Add Book
              </Link>
            )}

            <Link to="/cart" className="flex items-center gap-1 px-3 py-2 hover:text-primary" onClick={toggleMenu}>
              <ShoppingCart className="h-5 w-5" /> Cart
            </Link>

            {!user ? (
              <div className="pt-2 border-t flex flex-col space-y-2">
                <Link to="/login" onClick={toggleMenu}>
                  <button className="w-full px-4 py-2 border rounded-lg hover:bg-gray-100">Login</button>
                </Link>
                <Link to="/signup" onClick={toggleMenu}>
                  <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">Sign Up</button>
                </Link>
              </div>
            ) : (
              <div className="pt-2 border-t">
                <p className="px-3 py-2 font-semibold">{user.name}</p>
                <Link to="/my-books" className="block px-3 py-2 text-sm hover:bg-gray-100" onClick={toggleMenu}>My Books</Link>
                <Link to="/orders" className="block px-3 py-2 text-sm hover:bg-gray-100" onClick={toggleMenu}>Orders</Link>
                <button
                  onClick={() => { handleLogout(); toggleMenu(); }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
