import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, User, Heart, BookOpen, ChevronDown } from "lucide-react";
import { UserContext } from "../contexts/UserContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, cartCount } = useContext(UserContext);
  const navigate = useNavigate();

  const closeAll = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeAll();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={closeAll}>
            <img src="/logo.png" alt="ChapterExchange Logo" className="h-10 w-auto object-contain" />
            <span className="font-bold text-lg hidden sm:inline">ChapterExchange</span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">Home</Link>
            <Link to="/browse" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">Browse Books</Link>
            {user && (
              <Link to="/add-book" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition">Add Book</Link>
            )}
            {user && (
              <Link to="/wishlist" className="px-3 py-2 text-sm font-medium flex items-center gap-1.5 text-gray-600 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition">
                <Heart className="h-4 w-4 text-rose-500 fill-rose-500" /> Wishlist
              </Link>
            )}
          </div>

          {/* Desktop Right: Cart + User */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition flex items-center gap-1.5 text-sm font-medium">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[9px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-bold px-1">
                  {cartCount}
                </span>
              )}
            </Link>

            {!user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <Link to="/login">
                  <button className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 font-medium transition">Login</button>
                </Link>
                <Link to="/signup">
                  <button className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg hover:bg-blue-600 font-medium transition">Sign Up</button>
                </Link>
              </div>
            ) : (
              <div className="relative pl-2 border-l border-gray-200">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black uppercase flex-shrink-0">
                    {user?.name?.[0] || "U"}
                  </div>
                  <span className="max-w-[80px] truncate">{user?.name?.split(" ")[0]}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-bold text-gray-800 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <Link to="/user" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition" onClick={closeAll}>
                      <User className="h-4 w-4 text-gray-400" /> Dashboard
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition" onClick={closeAll}>
                      <Heart className="h-4 w-4 text-rose-400" /> Wishlist
                    </Link>
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition font-semibold">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Right: Cart icon + Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-blue-600 rounded-lg transition" onClick={closeAll}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[9px] min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-0.5">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => { setIsMenuOpen(!isMenuOpen); setIsUserMenuOpen(false); }}
              className="p-2 rounded-lg hover:bg-gray-100 transition text-gray-700"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-down Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-3 space-y-1">
            <Link to="/" className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition" onClick={closeAll}>
              🏠 Home
            </Link>
            <Link to="/browse" className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition" onClick={closeAll}>
              <BookOpen className="h-4 w-4 text-blue-500" /> Browse Books
            </Link>

            {user && (
              <>
                <Link to="/add-book" className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition" onClick={closeAll}>
                  ➕ Add Book
                </Link>
                <Link to="/wishlist" className="flex items-center gap-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-rose-50 rounded-xl transition" onClick={closeAll}>
                  <Heart className="h-4 w-4 text-rose-500 fill-rose-500" /> Wishlist
                </Link>
              </>
            )}

            <div className="border-t border-gray-100 pt-2 mt-2">
              {!user ? (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={closeAll}>
                    <button className="w-full py-3 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">Login</button>
                  </Link>
                  <Link to="/signup" onClick={closeAll}>
                    <button className="w-full py-3 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition">Sign Up</button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 px-3 py-3 mb-1">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-black uppercase flex-shrink-0">
                      {user?.name?.[0] || "U"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/user" className="flex items-center gap-2 px-3 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition" onClick={closeAll}>
                    <User className="h-4 w-4 text-gray-400" /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition mt-1"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop to close user dropdown on desktop */}
      {isUserMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
      )}
    </nav>
  );
};

export default Navbar;