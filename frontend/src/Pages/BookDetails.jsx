import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { BookDetailsSkeleton } from "../components/BookSkeleton";
import { showCartToast, showAlreadyInCartToast, showWishlistToast, showSuccess, showError, showWarning, showInfo } from "../components/Toast";
import { UserContext } from "../contexts/UserContext";
import { 
  ShoppingCart, 
  ArrowLeft, 
  User, 
  X, 
  ShieldCheck, 
  RotateCcw, 
  Sparkles, 
  BookOpen,
  Tag,
  Heart
} from "lucide-react";

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5001"
  : import.meta.env.VITE_API_URL || "https://chapter-xchange.onrender.com";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(UserContext);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Swap Request system states
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [myBooks, setMyBooks] = useState([]);
  const [myBooksLoading, setMyBooksLoading] = useState(false);
  const [selectedOfferedBookId, setSelectedOfferedBookId] = useState("");
  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      const storedToken = token || localStorage.getItem("token");
      if (!storedToken || !user || !id) return;
      try {
        const res = await fetch(`${API_URL}/api/wishlist`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          const list = data.books || [];
          setIsLiked(list.some(item => item && item._id === id));
        }
      } catch (err) {
        console.error("Error checking wishlist status:", err);
      }
    };
    checkWishlist();
  }, [id, token, user]);

  const handleToggleLike = async () => {
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
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify({ bookId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsLiked(data.isAdded);
        showWishlistToast(data.isAdded, book?.title);
      } else {
        showError(data.message || "Failed to update wishlist");
      }
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/books/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch book");

        setBook(data.book);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id, token]);

  const handleAddToCart = () => {
    if (!user) {
      showInfo("Please log in to add items to your cart.");
      navigate("/login");
      return;
    }

    const existingCart = JSON.parse(localStorage.getItem("cart")) || [];
    // Prevent adding duplicates
    if (existingCart.some(item => item._id === book._id)) {
      showAlreadyInCartToast(book);
      return;
    }

    const updatedCart = [...existingCart, book];
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    showCartToast(book);
  };

  const handleSwapClick = () => {
    if (!user) {
      showInfo("Please log in to make swap requests.");
      navigate("/login");
      return;
    }
    openSwapModal();
  };

  const openSwapModal = async () => {
    setIsSwapModalOpen(true);
    setMyBooksLoading(true);
    try {
      const userId = user?._id || user?.id;
      const res = await fetch(`${API_URL}/api/books/user/${userId}`);
      const data = await res.json();
      if (res.ok) {
        setMyBooks(data || []);
      } else {
        console.error("Failed to load user books");
      }
    } catch (err) {
      console.error("Error loading user books for swap:", err);
    } finally {
      setMyBooksLoading(false);
    }
  };

  const handleConfirmSwap = async () => {
    if (!selectedOfferedBookId) {
      showWarning("Please select one of your books to offer in swap.");
      return;
    }

    setIsSubmittingSwap(true);
    try {
      const receiverId = book.seller?._id || book.seller;
      const res = await fetch(`${API_URL}/api/exchanges`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiver: receiverId,
          wantedBook: book._id,
          offeredBook: selectedOfferedBookId,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess("Swap request sent! The owner will review your offer.");
        setIsSwapModalOpen(false);
        setSelectedOfferedBookId("");
      } else {
        showError(data.message || "Failed to submit swap request");
      }
    } catch (err) {
      console.error("Error submitting swap request:", err);
      showError("Something went wrong. Please try again.");
    } finally {
      setIsSubmittingSwap(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <BookDetailsSkeleton />
      </Layout>
    );
  }

  if (error || !book) {
    return (
      <Layout>
        <div className="max-w-xl mx-auto text-center py-16 px-4 space-y-4">
          <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-full">
            <X className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Oops! Book not found.</h2>
          <p className="text-gray-500 text-sm">{error || "The book listing you are looking for does not exist or has been deleted."}</p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-xs font-bold uppercase transition-colors shadow-md"
          >
            <ArrowLeft className="h-4 w-4" /> Return to Browse
          </Link>
        </div>
      </Layout>
    );
  }

  const isDonation = book.isWillingToDonate || book.price === 0;
  const isOwnBook = user && (book.seller?._id || book.seller) === (user?._id || user?.id);

  // Determine condition styles
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

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Navigation Breadcrumb */}
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-slate-800 transition mb-8 uppercase tracking-wider group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" /> Back to Browse
        </Link>

        {/* 2-Column Product Detail Layout */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
          {/* Left Column: Book Cover Display */}
          <div className="w-full md:w-2/5 max-w-sm mx-auto md:mx-0 flex-shrink-0">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-gray-100 bg-gray-50 group">
              <img
                src={
                  book.image?.startsWith("http")
                    ? book.image
                    : `${API_URL}${book.image}`
                }
                alt={book.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
              />
              {isDonation && (
                <span className="absolute top-4 left-4 bg-emerald-500/95 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md tracking-wide">
                  FREE DONATION
                </span>
              )}
            </div>
          </div>

          {/* Right Column: Title and Details */}
          <div className="flex-grow w-full space-y-6">
            
            {/* Header info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-600 font-bold rounded-lg text-[10px] uppercase tracking-wider">
                  {book.category || "General"}
                </span>
                <span className={`px-2.5 py-1 font-semibold rounded-lg border text-[10px] uppercase tracking-wider ${getConditionStyle(book.condition)}`}>
                  {book.condition}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 leading-tight">
                {book.title}
              </h1>
              <p className="text-gray-500 text-lg mt-1 font-medium">by {book.author}</p>
            </div>

            {/* Pricing Section */}
            <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">Listing Price</p>
                {isDonation ? (
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black text-2xl">
                    <BookOpen className="h-6 w-6" /> FREE / DONATION
                  </div>
                ) : (
                  <div className="text-slate-800 font-black text-3xl flex items-center">
                    ₹ {book.price}
                  </div>
                )}
              </div>
              
              {/* Secondary Listing Tag */}
              <div className="text-right">
                <span className={`inline-block py-1.5 px-3 rounded-full text-xs font-bold tracking-wider uppercase border shadow-sm ${
                  isDonation 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                    : "bg-blue-50 border-blue-200 text-blue-700"
                }`}>
                  {isDonation ? "Claim Free" : "For Exchange"}
                </span>
              </div>
            </div>

            {/* Book Description */}
            {book.description && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-white/40 p-4 rounded-xl border border-gray-50">
                  {book.description}
                </p>
              </div>
            )}

            {/* Ownership Meta */}
            <div className="flex items-center gap-3 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Book Owner</p>
                <p className="text-slate-800 text-sm font-bold">{book.seller?.name || "Community Member"}</p>
              </div>
            </div>

             {/* Add to Cart Actions */}
            <div className="pt-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 border-t border-gray-100 w-full">
              {book.isAvailable === false ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="flex-grow p-4 bg-red-50 border border-red-100 rounded-2xl text-center">
                    <p className="text-red-600 text-sm font-bold uppercase tracking-wider">
                      SOLD / NO LONGER AVAILABLE
                    </p>
                    <p className="text-slate-500 text-xs mt-1 font-medium">
                      This book has already been purchased or swapped by another reader.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 w-full">
                    {!isDonation ? (
                      <>
                        <button
                          disabled
                          className="flex-grow sm:flex-grow-0 sm:w-52 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-2xl font-bold text-sm tracking-wide cursor-not-allowed"
                        >
                          <ShoppingCart className="h-4.5 w-4.5" /> Out of Stock
                        </button>

                        {user && (
                          <button
                            onClick={handleToggleLike}
                            className="p-3.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-2xl transition-all flex items-center justify-center shadow-sm"
                            title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart className={`h-5 w-5 transition-colors ${isLiked ? "text-rose-500 fill-rose-500" : "text-gray-400"}`} />
                          </button>
                        )}

                        <button
                          disabled
                          className="flex-grow sm:flex-grow-0 sm:w-52 flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-2xl font-bold text-sm tracking-wide cursor-not-allowed"
                        >
                          <RotateCcw className="h-4.5 w-4.5 rotate-180" /> Request Swap
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          disabled
                          className="flex-grow sm:flex-grow-0 sm:w-60 flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-100 text-gray-400 border border-gray-200 rounded-2xl font-bold text-sm tracking-wide cursor-not-allowed"
                        >
                          <BookOpen className="h-4.5 w-4.5" /> Claim Donation (Out of Stock)
                        </button>

                        {user && (
                          <button
                            onClick={handleToggleLike}
                            className="p-3.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-2xl transition-all flex items-center justify-center shadow-sm"
                            title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart className={`h-5 w-5 transition-colors ${isLiked ? "text-rose-500 fill-rose-500" : "text-gray-400"}`} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ) : isOwnBook ? (
                <div className="flex-grow p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center">
                  <p className="text-slate-500 text-sm font-semibold">
                    This is your listed book. You can manage or delete it in your dashboard shelf.
                  </p>
                  <Link
                    to="/user?tab=books"
                    className="text-blue-600 hover:text-blue-700 text-xs font-bold underline mt-1.5 inline-block uppercase tracking-wider"
                  >
                    Go to My Shelf &rarr;
                  </Link>
                </div>
              ) : !isDonation ? (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-amber-500/10 hover:-translate-y-0.5"
                  >
                    <ShoppingCart className="h-4.5 w-4.5" /> Add to Cart
                  </button>

                  {user && (
                    <button
                      onClick={handleToggleLike}
                      className="p-3.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-2xl transition-all flex items-center justify-center shadow-sm"
                      title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`h-5 w-5 transition-colors ${isLiked ? "text-rose-500 fill-rose-500" : "text-gray-400"}`} />
                    </button>
                  )}

                  <button
                    onClick={handleSwapClick}
                    className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-indigo-500/10 hover:-translate-y-0.5"
                  >
                    <RotateCcw className="h-4.5 w-4.5 rotate-180" /> Request Swap
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleAddToCart}
                    className="flex-grow sm:flex-grow-0 sm:w-60 flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5"
                  >
                    <BookOpen className="h-4.5 w-4.5" /> Claim Donation (Add)
                  </button>

                  {user && (
                    <button
                      onClick={handleToggleLike}
                      className="p-3.5 border border-slate-200 hover:border-rose-200 hover:bg-rose-50 text-gray-500 hover:text-rose-600 rounded-2xl transition-all flex items-center justify-center shadow-sm"
                      title={isLiked ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart className={`h-5 w-5 transition-colors ${isLiked ? "text-rose-500 fill-rose-500" : "text-gray-400"}`} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Guarantee Badge footer */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-gray-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="h-5 w-5 text-emerald-500" /> Secure Exchange
              </div>
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="h-5 w-5 text-purple-500" /> Hand-checked Info
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw className="h-5 w-5 text-blue-500" /> Easy Return swop
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Swap Selection Modal */}
      {isSwapModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center" aria-modal="true" role="dialog">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsSwapModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full mx-3 sm:mx-4 overflow-hidden border border-gray-100 z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
            {/* Header */}
            <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <RotateCcw className="h-5 w-5 rotate-180" /> Offer a Book for Swap
              </h2>
              <button 
                onClick={() => setIsSwapModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Scrollable Books Grid */}
            <div className="flex-grow p-6 overflow-y-auto space-y-4">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                Select one of your books to trade for <span className="text-slate-800 font-bold">"{book.title}"</span>:
              </p>

              {myBooksLoading ? (
                <div className="py-12 flex flex-col items-center justify-center">
                  <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-500 text-xs font-semibold mt-2">Loading your shelf...</p>
                </div>
              ) : myBooks.length === 0 ? (
                <div className="py-8 text-center bg-gray-50 rounded-2xl p-6 border border-dashed border-gray-200">
                  <p className="text-gray-500 text-sm font-medium mb-3">You don't have any books listed on your shelf yet.</p>
                  <Link
                    to="/add-book"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
                  >
                    Add a Book First
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {myBooks.map((myBook) => {
                    const isSelected = selectedOfferedBookId === myBook._id;
                    return (
                      <div
                        key={myBook._id}
                        onClick={() => setSelectedOfferedBookId(myBook._id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? "border-blue-600 bg-blue-50/50 shadow-sm"
                            : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              myBook.image
                                ? myBook.image.startsWith("/uploads")
                                  ? `${API_URL}${myBook.image}`
                                  : myBook.image
                                : "/default-book.jpg"
                            }
                            alt={myBook.title}
                            className="w-10 h-13 object-cover rounded-lg shadow-sm flex-shrink-0"
                          />
                          <div className="text-left">
                            <h4 className="font-bold text-slate-800 text-sm line-clamp-1 leading-tight">{myBook.title}</h4>
                            <p className="text-gray-500 text-xs font-medium mt-0.5">by {myBook.author}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-[9px] uppercase font-bold rounded">
                              {myBook.condition}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <input
                            type="radio"
                            name="offeredBook"
                            checked={isSelected}
                            onChange={() => setSelectedOfferedBookId(myBook._id)}
                            className="h-4.5 w-4.5 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSwapModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSwap}
                disabled={isSubmittingSwap || myBooks.length === 0}
                className="px-6 py-2.5 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                {isSubmittingSwap ? "Sending Offer..." : "Confirm Swap Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default BookDetails;
