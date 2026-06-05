import React from "react";
import toast from "react-hot-toast";
import { ShoppingCart, Heart, CheckCircle, XCircle, AlertCircle, Info } from "lucide-react";

const API_URL =
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : import.meta.env.VITE_API_URL || "https://chapter-xchange.onrender.com";

// ─────────────────────────────────────────────────────────
//  Cart Added Toast  (e-commerce "added to bag" style)
// ─────────────────────────────────────────────────────────
export const showCartToast = (book) => {
  const imageUrl = book?.image
    ? book.image.startsWith("/uploads")
      ? `${API_URL}${book.image}`
      : book.image
    : null;

  toast.custom(
    (t) => (
      <div
        className={`
          flex items-center gap-3 bg-white shadow-2xl border border-gray-100 rounded-2xl
          px-4 py-3 w-full max-w-sm pointer-events-auto
          transition-all duration-300
          ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
        `}
      >
        {/* Book thumbnail */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={book.title}
            className="w-12 h-16 object-cover rounded-xl flex-shrink-0 shadow-md border border-gray-100"
          />
        ) : (
          <div className="w-12 h-16 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
            <ShoppingCart className="h-5 w-5 text-blue-500" />
          </div>
        )}

        {/* Text */}
        <div className="flex-grow min-w-0">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Added to Cart
          </p>
          <p className="font-extrabold text-slate-800 text-sm leading-tight line-clamp-1">
            {book?.title}
          </p>
          <p className="text-gray-400 text-[11px] font-medium mt-0.5">
            {book?.isWillingToDonate || book?.price === 0
              ? "FREE"
              : `₹${book?.price}`}
          </p>
        </div>

        {/* CTA */}
        <a
          href="/cart"
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 px-3 py-2 bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          View Cart
        </a>
      </div>
    ),
    { duration: 4000, position: "top-right" }
  );
};

// ─────────────────────────────────────────────────────────
//  Already in Cart Toast
// ─────────────────────────────────────────────────────────
export const showAlreadyInCartToast = (book) => {
  toast.custom(
    (t) => (
      <div
        className={`
          flex items-center gap-3 bg-white shadow-2xl border border-amber-100 rounded-2xl
          px-4 py-3 w-full max-w-sm pointer-events-auto
          transition-all duration-300
          ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
        `}
        style={{ minWidth: 260 }}
      >
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-100">
          <ShoppingCart className="h-5 w-5 text-amber-500" />
        </div>
        <div className="flex-grow min-w-0">
          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-0.5">
            Already in Cart
          </p>
          <p className="font-bold text-slate-800 text-sm line-clamp-1">
            {book?.title}
          </p>
        </div>
        <a
          href="/cart"
          onClick={() => toast.dismiss(t.id)}
          className="flex-shrink-0 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-colors shadow-sm whitespace-nowrap"
        >
          Go to Cart
        </a>
      </div>
    ),
    { duration: 3500, position: "top-right" }
  );
};

// ─────────────────────────────────────────────────────────
//  Wishlist Toggle Toast
// ─────────────────────────────────────────────────────────
export const showWishlistToast = (added, bookTitle) => {
  toast.custom(
    (t) => (
      <div
        className={`
          flex items-center gap-3 bg-white shadow-xl border border-rose-100 rounded-2xl
          px-4 py-3 max-w-xs w-full pointer-events-auto
          transition-all duration-300
          ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}
        `}
      >
        <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-rose-100">
          <Heart className={`h-4.5 w-4.5 ${added ? "text-rose-500 fill-rose-500" : "text-gray-400"}`} />
        </div>
        <div className="flex-grow min-w-0">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${added ? "text-rose-500" : "text-gray-500"}`}>
            {added ? "Saved to Wishlist" : "Removed from Wishlist"}
          </p>
          <p className="font-bold text-slate-800 text-xs line-clamp-1">{bookTitle}</p>
        </div>
      </div>
    ),
    { duration: 2500, position: "top-right" }
  );
};

// ─────────────────────────────────────────────────────────
//  Generic themed toasts
// ─────────────────────────────────────────────────────────
export const showSuccess = (message) =>
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-white shadow-xl border border-emerald-100 rounded-2xl px-4 py-3 max-w-sm w-full pointer-events-auto transition-all duration-300 ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
      >
        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-emerald-100">
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="font-semibold text-slate-800 text-sm">{message}</p>
      </div>
    ),
    { duration: 3000, position: "top-right" }
  );

export const showError = (message) =>
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-white shadow-xl border border-red-100 rounded-2xl px-4 py-3 max-w-sm w-full pointer-events-auto transition-all duration-300 ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
      >
        <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-100">
          <XCircle className="h-5 w-5 text-red-500" />
        </div>
        <p className="font-semibold text-slate-800 text-sm">{message}</p>
      </div>
    ),
    { duration: 4000, position: "top-right" }
  );

export const showWarning = (message) =>
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-white shadow-xl border border-amber-100 rounded-2xl px-4 py-3 max-w-sm w-full pointer-events-auto transition-all duration-300 ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
      >
        <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-100">
          <AlertCircle className="h-5 w-5 text-amber-500" />
        </div>
        <p className="font-semibold text-slate-800 text-sm">{message}</p>
      </div>
    ),
    { duration: 3500, position: "top-right" }
  );

export const showInfo = (message) =>
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-white shadow-xl border border-blue-100 rounded-2xl px-4 py-3 max-w-sm w-full pointer-events-auto transition-all duration-300 ${t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"}`}
      >
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-100">
          <Info className="h-5 w-5 text-blue-500" />
        </div>
        <p className="font-semibold text-slate-800 text-sm">{message}</p>
      </div>
    ),
    { duration: 3000, position: "top-right" }
  );
