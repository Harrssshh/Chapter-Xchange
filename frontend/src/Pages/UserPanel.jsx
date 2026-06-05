import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../contexts/UserContext";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { UserBookCardSkeleton, OrderRowSkeleton, SwapRowSkeleton } from "../components/BookSkeleton";
import { showSuccess, showError, showWarning, showInfo } from "../components/Toast";
import { 
  RotateCcw, 
  Check, 
  CheckCircle,
  X, 
  ArrowRight, 
  ArrowLeft,
  ArrowLeftRight, 
  BookMarked,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Truck,
  Package,
  ExternalLink,
  Sparkles
} from "lucide-react";

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5001"
  : import.meta.env.VITE_API_URL || "https://chapter-xchange.onrender.com";

const UserPanel = () => {
  const { user, setUser } = useContext(UserContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  // Profile edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPostalCode, setEditPostalCode] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditEmail(user.email || "");
      if (user.address) {
        setEditStreet(user.address.street || "");
        setEditCity(user.address.city || "");
        setEditState(user.address.state || "");
        setEditPostalCode(user.address.postalCode || "");
        setEditPhone(user.address.phone || "");
      } else {
        setEditStreet("");
        setEditCity("");
        setEditState("");
        setEditPostalCode("");
        setEditPhone("");
      }
    }
  }, [user, isEditing]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    setSaveLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          email: editEmail,
          address: {
            street: editStreet,
            city: editCity,
            state: editState,
            postalCode: editPostalCode,
            phone: editPhone
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess("Profile updated successfully!");
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsEditing(false);
      } else {
        showError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      showError("Error saving profile details");
    } finally {
      setSaveLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState(tabParam || "profile");
  const [myBooks, setMyBooks] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Swap Requests states
  const [incomingSwaps, setIncomingSwaps] = useState([]);
  const [outgoingSwaps, setOutgoingSwaps] = useState([]);
  const [swapsLoading, setSwapsLoading] = useState(false);

  // Sales states
  const [mySales, setMySales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);

  useEffect(() => {
    if (tabParam && ["profile", "books", "orders", "swaps", "sales"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const fetchBooksAndOrders = () => {
    const userId = user?._id || user?.id;
    if (userId) {
      setBooksLoading(true);
      fetch(`${API_URL}/api/books/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMyBooks(data);
          } else {
            setMyBooks(data.books || []);
          }
        })
        .catch((err) => console.error("Books fetch error:", err))
        .finally(() => setBooksLoading(false));

      setOrdersLoading(true);
      fetch(`${API_URL}/api/orders/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setMyOrders(data);
          } else {
            setMyOrders(data.orders || []);
          }
        })
        .catch((err) => console.error("Orders fetch error:", err))
        .finally(() => setOrdersLoading(false));
    }
  };

  const fetchSwaps = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSwapsLoading(true);
    try {
      // Fetch incoming requests
      const incRes = await fetch(`${API_URL}/api/exchanges/incoming`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const incData = await incRes.json();
      if (incRes.ok) setIncomingSwaps(incData.requests || []);

      // Fetch outgoing requests
      const outRes = await fetch(`${API_URL}/api/exchanges/outgoing`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const outData = await outRes.json();
      if (outRes.ok) setOutgoingSwaps(outData.requests || []);
    } catch (error) {
      console.error("Error fetching swap requests:", error);
    } finally {
      setSwapsLoading(false);
    }
  };

  const fetchSalesOrders = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setSalesLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders/seller`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMySales(data || []);
      }
    } catch (error) {
      console.error("Error fetching sales orders:", error);
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksAndOrders();
    fetchSwaps();
    fetchSalesOrders();
  }, [user]);

  // Re-fetch swaps/sales specifically when swapping tabs
  useEffect(() => {
    if (activeTab === "swaps") {
      fetchSwaps();
    } else if (activeTab === "sales") {
      fetchSalesOrders();
    }
  }, [activeTab]);

  const deleteBook = async (bookId) => {
    if (!window.confirm("Delete this book?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/books/${bookId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setMyBooks((prev) => prev.filter((book) => book._id !== bookId));
      } else {
        console.error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleRespondToSwap = async (requestId, status) => {
    if (!window.confirm(`Are you sure you want to ${status === "accepted" ? "accept" : "reject"} this swap offer?`)) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/exchanges/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess(`Swap request ${status}!`);
        fetchSwaps();
        fetchBooksAndOrders();
      } else {
        showError(data.message || "Failed to respond to swap request");
      }
    } catch (error) {
      console.error("Error responding to swap request:", error);
      showError("Something went wrong");
    }
  };

  const handleUpdateShipment = async (requestId, shipmentStatus, isSenderField, provider = "", tracking = "") => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/exchanges/${requestId}/shipment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shipmentStatus,
          shipmentProvider: provider,
          trackingCode: tracking
        })
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess("Shipment status updated!");
        fetchSwaps();
      } else {
        showError(data.message || "Failed to update shipment status");
      }
    } catch (error) {
      console.error("Error updating shipment status:", error);
    }
  };

  const handleUpdateOrderShipment = async (orderId, bookId, shipmentStatus, provider = "", tracking = "") => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/books/${bookId}/shipment`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          shipmentStatus,
          shipmentProvider: provider,
          trackingCode: tracking
        })
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess("Order shipment updated successfully!");
        fetchSalesOrders();
      } else {
        showError(data.message || "Failed to update shipment status");
      }
    } catch (error) {
      console.error("Error updating order shipment status:", error);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center max-w-sm space-y-4">
          <div className="inline-flex p-4 bg-gray-100 rounded-full text-slate-400">
            <Clock className="h-10 w-10 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">You are not logged in</h2>
          <p className="text-gray-500 text-sm">Please log in to view your profile shelf, trade orders, and direct swaps.</p>
          <Link to="/login" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md">
            Go to Login
          </Link>
        </div>
      </Layout>
    );
  }

  // Helper status styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "accepted":
        return "bg-emerald-100 border-emerald-200 text-emerald-800 font-extrabold";
      case "rejected":
        return "bg-red-100 border-red-200 text-red-800 font-bold";
      default:
        return "bg-amber-100 border-amber-200 text-amber-800 font-semibold";
    }
  };

  const renderShipmentTimeline = (status) => {
    const isShipped = status === "shipped" || status === "delivered";
    const isDelivered = status === "delivered";

    return (
      <div className="flex items-center justify-between w-full relative mb-5 mt-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100/50">
        {/* Step 1: Approved */}
        <div className="flex flex-col items-center z-10 flex-1">
          <div className="w-5.5 h-5.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-emerald-500/20">✓</div>
          <span className="text-[8px] font-black text-slate-600 mt-1 uppercase tracking-wider">Approved</span>
        </div>
        
        {/* Line 1 */}
        <div className="relative flex-grow -mt-3.5 h-[3px] bg-gray-100 rounded">
          <div className={`absolute top-0 left-0 h-full rounded transition-all duration-500 bg-indigo-500 ${isShipped ? 'w-full' : 'w-0'}`}></div>
        </div>
        
        {/* Step 2: Shipped */}
        <div className="flex flex-col items-center z-10 flex-1">
          <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center text-[9px] font-black transition-all duration-300 ${
            isShipped 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
              : 'bg-white text-slate-300 border-2 border-slate-100'
          }`}>
            <Truck className="h-3 w-3" />
          </div>
          <span className={`text-[8px] font-black mt-1 uppercase tracking-wider ${isShipped ? 'text-indigo-600 font-bold' : 'text-slate-300'}`}>Shipped</span>
        </div>
        
        {/* Line 2 */}
        <div className="relative flex-grow -mt-3.5 h-[3px] bg-gray-100 rounded">
          <div className={`absolute top-0 left-0 h-full rounded transition-all duration-500 bg-emerald-500 ${isDelivered ? 'w-full' : 'w-0'}`}></div>
        </div>
        
        {/* Step 3: Delivered */}
        <div className="flex flex-col items-center z-10 flex-1">
          <div className={`w-5.5 h-5.5 rounded-full flex items-center justify-center transition-all duration-300 ${
            isDelivered 
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
              : 'bg-white text-slate-300 border-2 border-slate-100'
          }`}>
            <Check className="h-3 w-3" />
          </div>
          <span className={`text-[8px] font-black mt-1 uppercase tracking-wider ${isDelivered ? 'text-emerald-500 font-bold' : 'text-slate-300'}`}>Received</span>
        </div>
      </div>
    );
  };

  const getTrackingUrl = (provider, code) => {
    if (!code || code === "N/A" || code.toLowerCase().includes("hand") || code.toLowerCase().includes("arrange")) return null;
    const normProv = provider?.toLowerCase() || "";
    const normCode = code.trim();
    
    if (normProv.includes("usps")) {
      return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${normCode}`;
    } else if (normProv.includes("fedex")) {
      return `https://www.fedex.com/apps/fedextrack/?tracknumbers=${normCode}`;
    } else if (normProv.includes("ups")) {
      return `https://www.ups.com/track?tracknum=${normCode}`;
    } else if (normProv.includes("dhl")) {
      return `https://www.dhl.com/en/express/tracking.html?AWB=${normCode}`;
    } else {
      // Fallback to universal tracking portal 17track (supports 500+ carriers)
      return `https://www.17track.net/en/track?nums=${normCode}`;
    }
  };

  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-10">
        
        {/* Navigation back path */}
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-slate-800 transition mb-6 uppercase tracking-wider group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" /> Back to Bookstore
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight mb-6 sm:mb-8">User Dashboard</h1>

      {/* Mobile-scrollable Tab Bar */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 mb-6 sm:mb-8 font-semibold text-sm -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => { setActiveTab("profile"); setSearchParams({ tab: "profile" }); }}
          className={`flex-shrink-0 pb-3 px-4 sm:px-6 transition-all border-b-2 whitespace-nowrap ${
            activeTab === "profile"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Profile
        </button>

        <button
          onClick={() => { setActiveTab("books"); setSearchParams({ tab: "books" }); }}
          className={`flex-shrink-0 pb-3 px-4 sm:px-6 transition-all border-b-2 whitespace-nowrap ${
            activeTab === "books"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          My Books
        </button>

        <button
          onClick={() => { setActiveTab("orders"); setSearchParams({ tab: "orders" }); }}
          className={`flex-shrink-0 pb-3 px-4 sm:px-6 transition-all border-b-2 whitespace-nowrap ${
            activeTab === "orders"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          My Orders
        </button>

        <button
          onClick={() => { setActiveTab("sales"); setSearchParams({ tab: "sales" }); }}
          className={`flex-shrink-0 pb-3 px-4 sm:px-6 transition-all border-b-2 whitespace-nowrap ${
            activeTab === "sales"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          My Sales
        </button>

        <button
          onClick={() => { setActiveTab("swaps"); setSearchParams({ tab: "swaps" }); }}
          className={`flex-shrink-0 pb-3 px-4 sm:px-6 transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "swaps"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Swap Requests
        </button>
      </div>

      {/* Tab Panels */}

      {/* 1. Profile Panel */}
      {activeTab === "profile" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm max-w-xl">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-left">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="p-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="p-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="p-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Street Address</label>
                <input
                  type="text"
                  required
                  value={editStreet}
                  onChange={(e) => setEditStreet(e.target.value)}
                  placeholder="House/Flat No, Area"
                  className="p-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">City</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">State</label>
                  <input
                    type="text"
                    required
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={editPostalCode}
                    onChange={(e) => setEditPostalCode(e.target.value)}
                    className="p-3 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white text-gray-700"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold uppercase hover:bg-gray-50 text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 disabled:bg-slate-350 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition"
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-left">
              <div className="space-y-3 text-sm text-gray-600 font-medium">
                <p className="flex justify-between border-b pb-2"><strong className="text-gray-800">Name:</strong> {user.name}</p>
                <p className="flex justify-between border-b pb-2"><strong className="text-gray-800">Email:</strong> {user.email}</p>
                <p className="flex justify-between border-b pb-2"><strong className="text-gray-800">Phone:</strong> {user.address?.phone || "Not Set"}</p>
                <p className="flex justify-between border-b pb-2">
                  <strong className="text-gray-800">Shipping Address:</strong> 
                  <span className="text-right max-w-[65%] text-xs font-semibold text-slate-700">
                    {user.address?.street 
                      ? `${user.address.street}, ${user.address.city}, ${user.address.state} - ${user.address.postalCode}` 
                      : "No address saved. Click Edit Profile below."}
                  </span>
                </p>
                <p className="flex justify-between"><strong className="text-gray-800">Joined:</strong> {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
              <div className="pt-3 border-t flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm"
                >
                  Edit Profile & Address
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. My Books Panel */}
      {activeTab === "books" && (
        <div>
          {booksLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <UserBookCardSkeleton key={i} />
              ))}
            </div>
          ) : myBooks.length === 0 ? (
            <div className="bg-gray-50 border border-dashed rounded-3xl p-12 text-center text-gray-400 font-medium">
              You haven't listed any books on your shelf yet. Let's list one!
              <Link to="/add-book" className="block text-blue-600 underline font-bold mt-3">
                List a Book &rarr;
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {myBooks.map((book) => (
                <li key={book._id} className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-800 line-clamp-1 leading-snug">{book.title}</h3>
                    <p className="text-gray-500 text-xs font-semibold mt-0.5">by {book.author}</p>
                    
                    <div className="flex gap-2 mt-3">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] uppercase font-bold tracking-wider">
                        {book.category}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] uppercase font-bold tracking-wider">
                        {book.condition}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between">
                    {book.price === 0 ? (
                      <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">FREE / DONATION</span>
                    ) : (
                      <span className="font-extrabold text-slate-800">₹{book.price}</span>
                    )}

                    <div className="flex gap-3 text-xs font-bold uppercase">
                      <Link
                        to={`/books/${book._id}`}
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        View
                      </Link> 
                      <button
                        onClick={() => deleteBook(book._id)}
                        className="text-red-600 hover:text-red-700 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 3. My Orders Panel */}
      {activeTab === "orders" && (
        <div>
          {ordersLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <OrderRowSkeleton key={i} />
              ))}
            </div>
          ) : myOrders.length === 0 ? (
            <div className="bg-gray-50 border border-dashed rounded-3xl p-12 text-center text-gray-400 font-medium">
              You haven't placed any orders or swap claims yet.
              <Link to="/browse" className="block text-blue-600 underline font-bold mt-3">
                Browse Books &rarr;
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {myOrders.map((order) => (
                <li key={order._id} className="bg-white p-5 border border-gray-100 rounded-2xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">Order #{order._id}</h3>
                      <p className="text-gray-400 text-xs font-semibold mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-full text-xs font-extrabold tracking-wide uppercase">
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <ul className="space-y-4">
                      {(order.books || []).map((item) => (
                        <li key={item.bookId?._id || item.bookId} className="border border-slate-100 p-4 rounded-2xl bg-slate-50/30 text-left space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-800 text-xs font-bold flex items-center gap-1.5">
                              <BookMarked className="h-4 w-4 text-indigo-500" />
                              {item.bookId?.title || item.title || "Book"}
                            </span>
                            <span className="text-slate-800 font-extrabold text-xs">₹{item.price}</span>
                          </div>

                          {/* Visual Shipment Timeline */}
                          {order.status === "paid" || order.status === "shipped" || order.status === "delivered" ? (
                            <div className="pt-2">
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                Shipment Status
                              </p>
                              {renderShipmentTimeline(item.shipmentStatus || "pending")}
                              
                              <div className="bg-white p-2.5 rounded-xl text-[9.5px] text-gray-500 space-y-0.5 font-semibold border border-slate-100/50 mt-2">
                                <p><span className="text-slate-400">Carrier:</span> {item.shipmentProvider || 'Pending Dispatch'}</p>
                                <p className="flex items-center flex-wrap">
                                  <span className="text-slate-400 mr-1">Tracking Code:</span> 
                                  <span>{item.trackingCode || 'N/A'}</span>
                                  {getTrackingUrl(item.shipmentProvider, item.trackingCode) && (
                                    <a
                                      href={getTrackingUrl(item.shipmentProvider, item.trackingCode)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="ml-2 px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-[8px] font-black uppercase rounded tracking-wide transition-colors inline-flex items-center gap-0.5"
                                    >
                                      Track Courier <ExternalLink className="h-2 w-2" />
                                    </a>
                                  )}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-1 rounded inline-block">
                              Awaiting Payment Approval / Webhook Notification
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-55 flex-wrap gap-4">
                      <div className="text-left max-w-full sm:max-w-[70%]">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Shipping Destination</span>
                        <p className="text-slate-700 text-xs font-semibold mt-0.5">
                          <strong>{order.shippingAddress?.name}</strong>: {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode} (Ph: {order.shippingAddress?.phone})
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 ml-auto">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Paid Amount</p>
                        <p className="font-black text-slate-800 text-lg">₹{order.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 3.5. My Sales Panel */}
      {activeTab === "sales" && (
        <div className="space-y-6">
          <h2 className="text-lg font-extrabold text-gray-800 pb-2 border-b">
            My Sales <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-extrabold">{mySales.length}</span>
          </h2>

          {salesLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <OrderRowSkeleton key={i} />
              ))}
            </div>
          ) : mySales.length === 0 ? (
            <div className="bg-gray-50 border border-dashed rounded-3xl p-12 text-center text-gray-400 font-medium">
              You haven't sold any books yet. Keep your listings active!
            </div>
          ) : (
            <ul className="space-y-6">
              {mySales.map((order) => {
                // Find all books in this order where the seller is the current user
                const sellerId = user?._id || user?.id;
                const mySoldItems = (order.books || []).filter(b => 
                  b.bookId && (b.bookId.seller?.toString() === sellerId.toString() || b.bookId === sellerId.toString())
                );

                return (
                  <li key={order._id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm space-y-4">
                    {/* Header: Buyer info */}
                    <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-left">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Received Order</span>
                        <h4 className="text-slate-800 text-sm font-bold mt-0.5">
                          Buyer: <span className="text-indigo-650 font-extrabold">{order.user?.name || "Community Member"}</span> 
                          <span className="text-gray-400 text-xs font-semibold ml-1.5">({order.user?.email})</span>
                        </h4>
                      </div>
                      <span className="text-gray-450 text-xs font-semibold">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="px-6 pb-6 space-y-6">
                      {/* Shipping Address details */}
                      <div className="bg-slate-50/50 p-4 rounded-2xl border border-gray-100 text-left">
                        <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block mb-1">Shipping Destination</span>
                        <p className="text-xs font-bold text-slate-800">{order.shippingAddress?.name}</p>
                        <p className="text-xs text-slate-650 font-medium">{order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}</p>
                        <p className="text-xs text-slate-500 font-semibold mt-1">Phone: {order.shippingAddress?.phone}</p>
                      </div>

                      {/* Items sold in this order and shipment form */}
                      <div className="space-y-5">
                        {mySoldItems.map((item) => (
                          <div key={item.bookId?._id || item.bookId} className="border border-slate-100 rounded-2xl p-4 bg-white space-y-4 text-left shadow-sm">
                            <div className="flex justify-between items-center border-b pb-2 border-slate-55">
                              <span className="text-slate-800 font-extrabold text-sm flex items-center gap-1.5"><BookMarked className="h-4.5 w-4.5 text-indigo-500" /> {item.bookId?.title || item.title}</span>
                              <span className="text-emerald-600 font-bold text-xs">₹{item.price}</span>
                            </div>

                            {/* Render visual timeline */}
                            {renderShipmentTimeline(item.shipmentStatus || "pending")}

                            {/* Shipment Form */}
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target);
                                handleUpdateOrderShipment(
                                  order._id, 
                                  item.bookId?._id || item.bookId, 
                                  formData.get("shipmentStatus"), 
                                  formData.get("shipmentProvider"), 
                                  formData.get("trackingCode")
                                );
                              }}
                              className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-50/50 p-3.5 rounded-xl border border-slate-100/50"
                            >
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase font-bold text-slate-400">Carrier / Method</label>
                                <input
                                  type="text"
                                  name="shipmentProvider"
                                  defaultValue={item.shipmentProvider || ""}
                                  placeholder="e.g. USPS, FedEx, Hand-Delivery"
                                  className="p-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 font-semibold focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[9px] uppercase font-bold text-slate-400">Tracking Code</label>
                                <input
                                  type="text"
                                  name="trackingCode"
                                  defaultValue={item.trackingCode || ""}
                                  placeholder="e.g. 94001000..."
                                  className="p-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 font-semibold focus:outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="flex flex-col gap-1 sm:col-span-1">
                                <label className="text-[9px] uppercase font-bold text-slate-400">Logistics Status</label>
                                <div className="flex gap-2">
                                  <select
                                    name="shipmentStatus"
                                    defaultValue={item.shipmentStatus || "pending"}
                                    className="p-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 font-bold focus:outline-none focus:border-blue-500 flex-grow"
                                  >
                                    <option value="pending">Pending Dispatch</option>
                                    <option value="shipped">Shipped / In Transit</option>
                                    <option value="delivered">Delivered / Received</option>
                                  </select>
                                  <button
                                    type="submit"
                                    className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase transition"
                                  >
                                    Update
                                  </button>
                                </div>
                              </div>
                            </form>
                          </div>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* 4. Swap Requests Panel (Direct swap trading!) */}
      {activeTab === "swaps" && (
        <div className="space-y-12">
          {/* A. Incoming Swap Offers (Offered to you) */}
          <div className="space-y-5">
            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 pb-2 border-b">
              Incoming Swap Offers <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-extrabold">{incomingSwaps.length}</span>
            </h2>

            {swapsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <SwapRowSkeleton key={i} />
                ))}
              </div>
            ) : incomingSwaps.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-10 text-center text-gray-400 font-medium italic">
                No incoming swap offers available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {incomingSwaps.map((req) => (
                  <div key={req._id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Header: Sender details and global status badge */}
                    <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-left">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Incoming Trade Offer</span>
                        <h4 className="text-slate-800 text-sm font-bold mt-0.5">
                          From: <span className="text-indigo-600 font-extrabold">{req.sender?.name || "Community Member"}</span> 
                          <span className="text-gray-400 text-xs font-semibold ml-1.5">({req.sender?.email})</span>
                        </h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black border shadow-sm ${getStatusBadge(req.status)}`}>
                        {req.status === "pending" ? "Pending Review" : req.status === "accepted" ? "Swapped" : "Declined"}
                      </span>
                    </div>

                    {/* Body: Two books barter grid (Plenty of spacing, cover thumbnails) */}
                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-8 bg-white">
                      {/* Left offered book */}
                      <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-gray-100/70 w-full md:w-[45%] flex-shrink-0 text-left">
                        <img
                          src={req.offeredBook?.image?.startsWith("http") ? req.offeredBook.image : `${API_URL}${req.offeredBook?.image}`}
                          alt={req.offeredBook?.title}
                          className="w-14 h-20 object-cover rounded-xl shadow-md border border-gray-150 flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded inline-block">They Offer in Return</span>
                          <h5 className="font-extrabold text-slate-800 text-xs line-clamp-1 leading-snug">{req.offeredBook?.title}</h5>
                          <p className="text-gray-400 text-[10px] font-semibold">by {req.offeredBook?.author}</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-gray-150 text-slate-500 text-[8px] uppercase font-bold rounded">
                            Condition: {req.offeredBook?.condition}
                          </span>
                        </div>
                      </div>

                      {/* Middle swap arrow decoration */}
                      <div className="flex-shrink-0 flex items-center justify-center bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full border-2 border-white shadow-md transform md:rotate-0 rotate-90 my-2 md:my-0">
                        <ArrowLeftRight className="h-5 w-5 animate-pulse" />
                      </div>

                      {/* Right wanted book */}
                      <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-gray-100/70 w-full md:w-[45%] flex-shrink-0 text-left">
                        <img
                          src={req.wantedBook?.image?.startsWith("http") ? req.wantedBook.image : `${API_URL}${req.wantedBook?.image}`}
                          alt={req.wantedBook?.title}
                          className="w-14 h-20 object-cover rounded-xl shadow-md border border-gray-150 flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded inline-block">Your Requested Book</span>
                          <h5 className="font-extrabold text-slate-800 text-xs line-clamp-1 leading-snug">{req.wantedBook?.title}</h5>
                          <p className="text-gray-400 text-[10px] font-semibold">by {req.wantedBook?.author}</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-gray-150 text-slate-500 text-[8px] uppercase font-bold rounded">
                            Condition: {req.wantedBook?.condition}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Action buttons (Only displayed if pending review) */}
                    {req.status === "pending" && (
                      <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                        <p className="text-[11px] text-gray-500 font-bold flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-yellow-500" /> Accepting this trade automatically swaps shelf ownerships of these books in the database.
                        </p>
                        <div className="flex gap-3 w-full sm:w-auto">
                          <button
                            onClick={() => handleRespondToSwap(req._id, "rejected")}
                            className="flex-1 sm:flex-initial px-5 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-sm"
                          >
                            Decline Trade
                          </button>
                          <button
                            onClick={() => handleRespondToSwap(req._id, "accepted")}
                            className="flex-1 sm:flex-initial px-6 py-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition shadow-md"
                          >
                            Accept Trade & Swap
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Shipment Tracker Block (Renders in its own spacious row if accepted) */}
                    {req.status === "accepted" && (
                      <div className="bg-slate-50/50 px-6 py-6 border-t border-gray-100 space-y-4 text-left">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Shipment & Handover Progress
                          </h5>
                          <span className="text-[9px] font-black text-indigo-650 bg-indigo-50/55 px-2 py-0.5 rounded-md">Logistics Panel</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* 1. Sender package status (Offered Book) */}
                          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Package className="h-4 w-4 text-indigo-500" /> Offered Book: <strong>{req.offeredBook?.title}</strong></span>
                            </div>
                            
                            {/* Render visual step timeline progress bar */}
                            {renderShipmentTimeline(req.senderShipmentStatus)}

                            <div className="bg-slate-50 p-2.5 rounded-xl text-[9px] text-gray-500 space-y-0.5 font-semibold">
                              <p><span className="text-slate-400">Carrier:</span> {req.senderShipmentProvider || 'Pending Dispatch'}</p>
                              <p className="flex items-center flex-wrap">
                                <span className="text-slate-400 mr-1">Tracking:</span> 
                                <span>{req.senderTrackingCode || 'N/A'}</span>
                                {getTrackingUrl(req.senderShipmentProvider, req.senderTrackingCode) && (
                                  <a
                                    href={getTrackingUrl(req.senderShipmentProvider, req.senderTrackingCode)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-[8px] font-black uppercase rounded tracking-wide transition-colors inline-flex items-center gap-0.5"
                                  >
                                    Track Courier <ExternalLink className="h-2 w-2" />
                                  </a>
                                )}
                              </p>
                            </div>
                            
                            {/* Receive confirmation button */}
                            {req.senderShipmentStatus === 'shipped' && (
                              <button
                                onClick={() => handleUpdateShipment(req._id, "delivered", true)}
                                className="mt-2 w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-650 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition shadow-md shadow-emerald-500/10 animate-pulse flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle className="h-3.5 w-3.5" /> Confirm Delivered & Received
                              </button>
                            )}
                          </div>

                          {/* 2. Receiver package status (Wanted Book) */}
                          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Package className="h-4 w-4 text-blue-500" /> Your Book: <strong>{req.wantedBook?.title}</strong></span>
                            </div>

                            {/* Render visual step timeline progress bar */}
                            {renderShipmentTimeline(req.receiverShipmentStatus)}

                            <div className="bg-slate-50 p-2.5 rounded-xl text-[9px] text-gray-500 space-y-0.5 font-semibold">
                              <p><span className="text-slate-400">Courier:</span> {req.receiverShipmentProvider || 'Pending Dispatch'}</p>
                              <p className="flex items-center flex-wrap">
                                <span className="text-slate-400 mr-1">Tracking:</span> 
                                <span>{req.receiverTrackingCode || 'N/A'}</span>
                                {getTrackingUrl(req.receiverShipmentProvider, req.receiverTrackingCode) && (
                                  <a
                                    href={getTrackingUrl(req.receiverShipmentProvider, req.receiverTrackingCode)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-[8px] font-black uppercase rounded tracking-wide transition-colors inline-flex items-center gap-0.5"
                                  >
                                    Track Courier <ExternalLink className="h-2 w-2" />
                                  </a>
                                )}
                              </p>
                            </div>
                            
                            {/* Shipment dispatch control */}
                            {req.receiverShipmentStatus !== 'delivered' && (
                              <ShipmentControl 
                                requestId={req._id}
                                currentStatus={req.receiverShipmentStatus}
                                onUpdate={(rid, stat, prov, trk) => handleUpdateShipment(rid, stat, false, prov, trk)}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* B. Outgoing Swap Requests (Requested by you) */}
          <div className="space-y-5">
            <h2 className="text-lg font-extrabold text-gray-800 flex items-center gap-2 pb-2 border-b">
              Outgoing Swap Requests <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-extrabold">{outgoingSwaps.length}</span>
            </h2>

            {outgoingSwaps.length === 0 ? (
              <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-10 text-center text-gray-400 font-medium italic">
                No swap requests sent yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {outgoingSwaps.map((req) => (
                  <div key={req._id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Header: Receiver details and status badge */}
                    <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex flex-wrap items-center justify-between gap-3 text-left">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outgoing Trade Request</span>
                        <h4 className="text-slate-800 text-sm font-bold mt-0.5">
                          To Owner: <span className="text-indigo-650 font-extrabold">{req.receiver?.name || "Community Member"}</span> 
                          <span className="text-gray-400 text-xs font-semibold ml-1.5">({req.receiver?.email})</span>
                        </h4>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black border shadow-sm ${getStatusBadge(req.status)}`}>
                        {req.status === "pending" ? "Pending Review" : req.status === "accepted" ? "Swapped" : "Declined"}
                      </span>
                    </div>

                    {/* Body: Two books barter grid */}
                    <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-8 bg-white">
                      {/* Left offered book */}
                      <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-gray-100/70 w-full md:w-[45%] flex-shrink-0 text-left">
                        <img
                          src={req.offeredBook?.image?.startsWith("http") ? req.offeredBook.image : `${API_URL}${req.offeredBook?.image}`}
                          alt={req.offeredBook?.title}
                          className="w-14 h-20 object-cover rounded-xl shadow-md border border-gray-150 flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded inline-block">You Offered in Return</span>
                          <h5 className="font-extrabold text-slate-800 text-xs line-clamp-1 leading-snug">{req.offeredBook?.title}</h5>
                          <p className="text-gray-400 text-[10px] font-semibold">by {req.offeredBook?.author}</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-gray-150 text-slate-500 text-[8px] uppercase font-bold rounded">
                            Condition: {req.offeredBook?.condition}
                          </span>
                        </div>
                      </div>

                      {/* Middle swap arrow icon */}
                      <div className="flex-shrink-0 flex items-center justify-center bg-indigo-50 text-indigo-600 w-12 h-12 rounded-full border-2 border-white shadow-md transform md:rotate-0 rotate-90 my-2 md:my-0">
                        <ArrowLeftRight className="h-5 w-5 animate-pulse" />
                      </div>

                      {/* Right wanted book */}
                      <div className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-gray-100/70 w-full md:w-[45%] flex-shrink-0 text-left">
                        <img
                          src={req.wantedBook?.image?.startsWith("http") ? req.wantedBook.image : `${API_URL}${req.wantedBook?.image}`}
                          alt={req.wantedBook?.title}
                          className="w-14 h-20 object-cover rounded-xl shadow-md border border-gray-150 flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded inline-block">Wanted Book Listing</span>
                          <h5 className="font-extrabold text-slate-800 text-xs line-clamp-1 leading-snug">{req.wantedBook?.title}</h5>
                          <p className="text-gray-400 text-[10px] font-semibold">by {req.wantedBook?.author}</p>
                          <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-gray-150 text-slate-500 text-[8px] uppercase font-bold rounded">
                            Condition: {req.wantedBook?.condition}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Shipment Tracker Block (Outgoing Requests) */}
                    {req.status === "accepted" && (
                      <div className="bg-slate-50/50 px-6 py-6 border-t border-gray-100 space-y-4 text-left">
                        <div className="flex items-center justify-between">
                          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Shipment & Handover Progress
                          </h5>
                          <span className="text-[9px] font-black text-indigo-650 bg-indigo-50/55 px-2 py-0.5 rounded-md">Logistics Panel</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 1. Sender package status (Offered Book) */}
                          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Package className="h-4 w-4 text-indigo-500" /> Your Book: <strong>{req.offeredBook?.title}</strong></span>
                            </div>

                            {/* Render visual step timeline progress bar */}
                            {renderShipmentTimeline(req.senderShipmentStatus)}

                            <div className="bg-slate-50 p-2.5 rounded-xl text-[9px] text-gray-500 space-y-0.5 font-semibold">
                              <p><span className="text-slate-400">Courier:</span> {req.senderShipmentProvider || 'Pending Dispatch'}</p>
                              <p className="flex items-center flex-wrap">
                                <span className="text-slate-400 mr-1">Tracking:</span> 
                                <span>{req.senderTrackingCode || 'N/A'}</span>
                                {getTrackingUrl(req.senderShipmentProvider, req.senderTrackingCode) && (
                                  <a
                                    href={getTrackingUrl(req.senderShipmentProvider, req.senderTrackingCode)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-655 text-[8px] font-black uppercase rounded tracking-wide transition-colors inline-flex items-center gap-0.5"
                                  >
                                    Track Courier <ExternalLink className="h-2 w-2" />
                                  </a>
                                )}
                              </p>
                            </div>
                            
                            {/* Shipment dispatch control */}
                            {req.senderShipmentStatus !== 'delivered' && (
                              <ShipmentControl 
                                requestId={req._id}
                                currentStatus={req.senderShipmentStatus}
                                onUpdate={(rid, stat, prov, trk) => handleUpdateShipment(rid, stat, true, prov, trk)}
                              />
                            )}
                          </div>

                          {/* 2. Receiver package status (Wanted Book) */}
                          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-sm space-y-3">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5"><Package className="h-4 w-4 text-blue-500" /> Wanted Book: <strong>{req.wantedBook?.title}</strong></span>
                            </div>

                            {/* Render visual step timeline progress bar */}
                            {renderShipmentTimeline(req.receiverShipmentStatus)}

                            <div className="bg-slate-50 p-2.5 rounded-xl text-[9px] text-gray-500 space-y-0.5 font-semibold">
                              <p><span className="text-slate-400">Courier:</span> {req.receiverShipmentProvider || 'Pending Dispatch'}</p>
                              <p className="flex items-center flex-wrap">
                                <span className="text-slate-400 mr-1">Tracking:</span> 
                                <span>{req.receiverTrackingCode || 'N/A'}</span>
                                {getTrackingUrl(req.receiverShipmentProvider, req.receiverTrackingCode) && (
                                  <a
                                    href={getTrackingUrl(req.receiverShipmentProvider, req.receiverTrackingCode)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-2 px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-650 text-[8px] font-black uppercase rounded tracking-wide transition-colors inline-flex items-center gap-0.5"
                                  >
                                    Track Courier <ExternalLink className="h-2 w-2" />
                                  </a>
                                )}
                              </p>
                            </div>
                            
                            {/* Receive confirmation button */}
                            {req.receiverShipmentStatus === 'shipped' && (
                              <button
                                onClick={() => handleUpdateShipment(req._id, "delivered", false)}
                                className="mt-2 w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-650 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition shadow-md shadow-emerald-500/10 animate-pulse"
                              >
                                Confirm Delivered & Received
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </Layout>
  );
};

// ShipmentControl sub-component to manage courier tracking numbers and handovers
const ShipmentControl = ({ requestId, currentStatus, onUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [provider, setProvider] = useState("");
  const [tracking, setTracking] = useState("");

  if (currentStatus === "shipped") {
    return (
      <div className="mt-2 text-center text-[10px] font-bold text-blue-600 animate-pulse uppercase tracking-wider">
        In Transit... Awaiting Partner Delivery Confirmation
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="mt-2 p-2 bg-slate-50 border border-gray-200 rounded-xl space-y-2 text-left animate-fadeIn">
        <div className="grid grid-cols-1 gap-1.5">
          <input
            type="text"
            placeholder="Courier (e.g. USPS, FedEx, Hand)"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="p-1.5 border border-gray-200 rounded-lg text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-bold bg-white"
          />
          <input
            type="text"
            placeholder="Tracking # or Delivery Note"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className="p-1.5 border border-gray-200 rounded-lg text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500/10 font-bold bg-white"
          />
        </div>
        <div className="flex gap-1.5 justify-end">
          <button
            onClick={() => setShowForm(false)}
            className="px-2 py-1 text-[9px] font-black text-gray-400 hover:text-gray-600 uppercase"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onUpdate(requestId, "shipped", provider || "Hand-delivery", tracking || "Handover arranged");
              setShowForm(false);
            }}
            className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-wider rounded-lg transition"
          >
            Confirm Ship
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowForm(true)}
      className="mt-2 w-full py-1.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition shadow-sm"
    >
      Mark as Shipped
    </button>
  );
};

export default UserPanel;