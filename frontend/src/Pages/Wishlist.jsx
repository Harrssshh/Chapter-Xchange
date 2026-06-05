import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { UserContext } from "../contexts/UserContext";
import { Heart, ShoppingCart, ArrowLeft, BookOpen, Trash2 } from "lucide-react";
import BookSkeleton, { WishlistRowSkeleton } from "../components/BookSkeleton";
import { showCartToast, showAlreadyInCartToast, showError } from "../components/Toast";

const Wishlist = () => {
  const { token, updateCartCount } = useContext(UserContext);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : import.meta.env.VITE_API_URL || "https://chapter-xchange.onrender.com";

  const fetchWishlist = async () => {
    const storedToken = token || localStorage.getItem("token");
    if (!storedToken) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/wishlist`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setWishlistItems(data.books || []);
      } else {
        setError(data.message || "Failed to load wishlist");
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError("Server error loading wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [token]);

  const toggleWishlist = async (bookId) => {
    const storedToken = token || localStorage.getItem("token");
    if (!storedToken) return;

    try {
      const res = await fetch(`${API_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify({ bookId }),
      });

      if (res.ok) {
        setWishlistItems((prev) => prev.filter((item) => item._id !== bookId));
      }
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  const handleAddToCart = (book) => {
    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    if (existingCart.some((item) => item._id === book._id)) {
      showAlreadyInCartToast(book);
      return;
    }

    const updatedCart = [...existingCart, book];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    updateCartCount();
    showCartToast(book);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Breadcrumbs */}
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-slate-800 transition mb-6 uppercase tracking-wider group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-8 flex items-center gap-2">
          <Heart className="h-8 w-8 text-rose-500 fill-rose-500" /> My Wishlist
          <span className="text-gray-400 font-medium text-lg">
            {loading ? "" : `(${wishlistItems.length} items)`}
          </span>
        </h1>

        {error && (
          <div className="bg-red-50 text-red-500 border border-red-150 p-4 rounded-2xl text-sm font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <WishlistRowSkeleton key={i} />
            ))}
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-4 space-y-6">
            <div className="inline-flex p-5 bg-rose-50 text-rose-500 rounded-full shadow-inner animate-pulse">
              <Heart className="h-10 w-10 fill-rose-100" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-800">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
              Find books you love while browsing, and add them to your wishlist to check them out later!
            </p>
            <div className="pt-2">
              <Link
                to="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg hover:-translate-y-0.5"
              >
                Browse Books
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Wishlist Items List */}
            <div className="md:col-span-2 space-y-4">
              {wishlistItems.map((item) => {
                const isDon = item.isWillingToDonate || item.price === 0;
                return (
                  <div
                    key={item._id}
                    className="group flex flex-col sm:flex-row items-center justify-between bg-white p-5 rounded-3xl border border-slate-100/80 shadow-sm hover:shadow-md hover:border-blue-100/50 transition duration-300 gap-4"
                  >
                    {/* Image and Meta Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={
                          item.image?.startsWith("http")
                            ? item.image
                            : `${API_URL}${item.image}`
                        }
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded-xl shadow-md border border-gray-100 group-hover:scale-105 transition-transform duration-300"
                        onClick={() => navigate(`/books/${item._id}`)}
                        style={{ cursor: "pointer" }}
                      />
                      <div className="text-left">
                        <h2
                          className="font-extrabold text-slate-800 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors cursor-pointer"
                          onClick={() => navigate(`/books/${item._id}`)}
                        >
                          {item.title}
                        </h2>
                        <p className="text-gray-500 text-xs font-semibold mb-2">by {item.author}</p>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2.5 py-0.5 bg-blue-50/80 text-blue-600 border border-blue-100/50 rounded-lg text-[9px] uppercase font-bold tracking-wider">
                            {item.category || "General"}
                          </span>
                          <span className="px-2.5 py-0.5 bg-purple-50/80 text-purple-600 border border-purple-100/50 rounded-lg text-[9px] uppercase font-bold tracking-wider">
                            {item.condition}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing, Add To Cart, and Action Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                      <div className="text-right pr-4">
                        {isDon ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-sm">
                            <BookOpen className="h-3 w-3" /> FREE
                          </span>
                        ) : (
                          <p className="font-extrabold text-slate-800 text-lg flex items-center gap-0.5">
                            ₹{item.price}
                          </p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
                      </button>

                      <button
                        onClick={() => toggleWishlist(item._id)}
                        className="p-2.5 bg-rose-50 hover:bg-rose-105 text-rose-600 rounded-xl transition-all duration-200"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Wishlist;
