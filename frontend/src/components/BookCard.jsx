import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Tag, Heart } from "lucide-react";
import { UserContext } from "../contexts/UserContext";
import { showWishlistToast, showInfo } from "../components/Toast";

const BookCard = ({ book }) => {
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);
  const [isLiked, setIsLiked] = useState(false);

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : import.meta.env.VITE_API_URL || "https://chapter-xchange.onrender.com";

  useEffect(() => {
    const checkWishlistStatus = async () => {
      const storedToken = token || localStorage.getItem("token");
      if (!storedToken || !user) return;
      try {
        const res = await fetch(`${API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const data = await res.json();
        if (res.ok) {
          const list = data.books || [];
          setIsLiked(list.some(item => item && item._id === book._id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkWishlistStatus();
  }, [book._id, token, user]);

  const handleToggleLike = async (e) => {
    e.stopPropagation();
    const storedToken = token || localStorage.getItem("token");
    if (!storedToken) {
      showInfo("Please login to save books to your wishlist.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/wishlist/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`
        },
        body: JSON.stringify({ bookId: book._id })
      });
      const data = await res.json();
      if (res.ok) {
        setIsLiked(data.isAdded);
        showWishlistToast(data.isAdded, book.title);
      } else {
        showInfo(data.message || "Failed to update wishlist");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDetails = () => {
    navigate(`/books/${book._id || book.id}`); 
  };

  // Determine condition styling
  const getConditionStyle = (cond) => {
    const normCond = cond?.toLowerCase() || "";
    if (normCond.includes("new")) {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    } else if (normCond.includes("good")) {
      return "bg-teal-50 text-teal-700 border-teal-200";
    } else if (normCond.includes("acceptable")) {
      return "bg-amber-50 text-amber-700 border-amber-200";
    } else {
      return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const isDonation = book.isWillingToDonate || book.price === 0;

  return (
    <div
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col h-full cursor-pointer"
      onClick={handleViewDetails} 
    >
      {/* Cover Image Wrapper */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-50">
        <img
          src={
            book.image
              ? book.image.startsWith("/uploads")
                ? `${API_URL}${book.image}`
                : book.image
              : "/default-book.jpg"
          }
          alt={book.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
        />

        {book.isAvailable === false && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all duration-300">
            <span className="bg-red-600 text-white text-[11px] font-black tracking-widest px-4 py-2 rounded-xl border border-red-500 shadow-lg uppercase animate-pulse">
              SOLD
            </span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        {user && (
          <button
            onClick={handleToggleLike}
            className="absolute top-3 right-3 z-10 p-2 bg-white/85 backdrop-blur-sm hover:bg-white rounded-full shadow-md transition duration-200 cursor-pointer"
            title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`h-4.5 w-4.5 transition-colors ${isLiked ? "text-rose-500 fill-rose-500" : "text-gray-400 hover:text-rose-500"}`} />
          </button>
        )}

        {/* Dynamic Badge Overlays */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none">
          {isDonation ? (
            <span className="bg-emerald-500/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md tracking-wide flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> FREE
            </span>
          ) : (
            <span className="bg-blue-600/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md tracking-wide flex items-center gap-1">
              <Tag className="h-3 w-3" /> ₹{book.price}
            </span>
          )}
        </div>
      </div>

      {/* Details Container */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title and Author */}
        <div className="mb-3">
          <h3 className="font-bold text-gray-800 text-base line-clamp-1 group-hover:text-blue-600 transition-colors duration-200 mb-1">
            {book.title}
          </h3>
          <p className="text-gray-500 text-xs font-medium line-clamp-1">by {book.author}</p>
        </div>

        {/* Category and Condition Badges */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t border-gray-50 text-xs">
          <span className="px-2.5 py-1 bg-gray-100/80 text-gray-600 font-medium rounded-md uppercase tracking-wider text-[10px]">
            {book.category || "General"}
          </span>
          <span className={`px-2.5 py-1 font-semibold rounded-md border text-[10px] uppercase tracking-wider ${getConditionStyle(book.condition)}`}>
            {book.condition}
          </span>
        </div>

        {/* Action Button */}
        {book.isAvailable === false ? (
          <button
            disabled
            className="mt-4 w-full bg-red-50 text-red-600 border border-red-200 rounded-xl py-2.5 text-xs font-bold tracking-wide cursor-not-allowed shadow-sm uppercase"
          >
            SOLD / OUT OF STOCK
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleViewDetails();
            }}
            className="mt-4 w-full bg-slate-900 hover:bg-blue-600 text-white rounded-xl py-2.5 text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

export default BookCard;
