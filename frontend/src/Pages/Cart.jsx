import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { UserContext } from "../contexts/UserContext";
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  BookOpen, 
  Tag,
  Truck
} from "lucide-react";
import { showSuccess, showError, showWarning, showInfo } from "../components/Toast";

const Cart = () => {
  const navigate = useNavigate();
  const { user, token, updateCartCount } = useContext(UserContext);
  const [cartItems, setCartItems] = useState([]);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  // Shipping Address States
  const [addressName, setAddressName] = useState("");
  const [addressStreet, setAddressStreet] = useState("");
  const [addressCity, setAddressCity] = useState("");
  const [addressState, setAddressState] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [addressPhone, setAddressPhone] = useState("");

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [availabilityErrors, setAvailabilityErrors] = useState({});

  useEffect(() => {
    const validateCartAvailability = async () => {
      if (cartItems.length === 0) return;
      const errors = {};
      for (const item of cartItems) {
        try {
          const res = await fetch(`${API_URL}/api/books/${item._id}`);
          const data = await res.json();
          if (res.ok && data.book) {
            if (data.book.isAvailable === false) {
              errors[item._id] = "This book is no longer available.";
            }
          }
        } catch (err) {
          console.error("Error validating book availability:", err);
        }
      }
      setAvailabilityErrors(errors);
    };
    validateCartAvailability();
  }, [cartItems]);

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : import.meta.env.VITE_API_URL || "https://chapter-xchange.onrender.com";

  useEffect(() => {
    const fetchFreshProfile = async () => {
      const storedToken = token || localStorage.getItem("token");
      if (!storedToken) return;
      try {
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${storedToken}` }
        });
        const data = await res.json();
        if (res.ok) {
          setAddressName(data.name || "");
          if (data.address) {
            setAddressStreet(data.address.street || "");
            setAddressCity(data.address.city || "");
            setAddressState(data.address.state || "");
            setAddressPostalCode(data.address.postalCode || "");
            setAddressPhone(data.address.phone || "");
          }
        }
      } catch (err) {
        console.error("Error fetching fresh profile:", err);
      }
    };
    fetchFreshProfile();
  }, [token]);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter((item) => item._id !== id);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    updateCartCount();
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
    updateCartCount();
    handleRemoveCoupon();
  };

  const totalPrice = cartItems.reduce(
    (total, item) => {
      const isDon = item.isWillingToDonate || item.price === 0;
      return total + (isDon ? 0 : (item.price || 0));
    },
    0
  );

  // Auto-remove or re-evaluate coupons if cart details change
  useEffect(() => {
    if (appliedCoupon) {
      if (appliedCoupon === "CHAPTER20" && totalPrice < 500) {
        handleRemoveCoupon();
        setCouponError("Coupon CHAPTER20 removed: order subtotal fell below ₹500.");
      } else if (appliedCoupon === "BOOKWORM" && totalPrice < 400) {
        handleRemoveCoupon();
        setCouponError("Coupon BOOKWORM removed: order subtotal fell below ₹400.");
      }
    }
  }, [totalPrice, appliedCoupon]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplying(true);
    setCouponError("");
    setCouponSuccess("");

    // Simulate minor network latency for realistic feel
    setTimeout(() => {
      const code = couponInput.trim().toUpperCase();
      if (code === "WELCOME10") {
        setAppliedCoupon("WELCOME10");
        setCouponSuccess("Coupon WELCOME10 applied! 10% off subtotal.");
      } else if (code === "CHAPTER20") {
        if (totalPrice >= 500) {
          setAppliedCoupon("CHAPTER20");
          setCouponSuccess("Coupon CHAPTER20 applied! 20% off subtotal.");
        } else {
          setCouponError("This coupon is only valid for orders of ₹500 or more.");
        }
      } else if (code === "FREESHIP") {
        setAppliedCoupon("FREESHIP");
        setCouponSuccess("Coupon FREESHIP applied! Free shipping.");
      } else if (code === "BOOKWORM") {
        if (totalPrice >= 400) {
          setAppliedCoupon("BOOKWORM");
          setCouponSuccess("Coupon BOOKWORM applied! Flat ₹100 discount.");
        } else {
          setCouponError("This coupon is only valid for orders of ₹400 or more.");
        }
      } else {
        setCouponError("Invalid coupon code.");
      }
      setIsApplying(false);
    }, 500);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon("");
    setCouponInput("");
    setCouponSuccess("");
    setCouponError("");
  };

  const getDeliveryDateRange = () => {
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + 3);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 5);

    const options = { month: "short", day: "numeric", weekday: "short" };
    return {
      rangeStr: `${minDate.toLocaleDateString("en-US", options)} - ${maxDate.toLocaleDateString("en-US", options)}`,
      isoDate: maxDate.toISOString()
    };
  };

  const subtotal = totalPrice;

  let shippingAmount = 50;
  if (subtotal > 500 || appliedCoupon === "FREESHIP") {
    shippingAmount = 0;
  }

  const gstAmount = Math.round((subtotal + shippingAmount) * 0.05);

  let discountAmount = 0;
  if (appliedCoupon === "WELCOME10") {
    discountAmount = Math.round(subtotal * 0.10);
  } else if (appliedCoupon === "CHAPTER20") {
    discountAmount = Math.round(subtotal * 0.20);
  } else if (appliedCoupon === "BOOKWORM") {
    discountAmount = 100;
  }

  const finalTotal = subtotal + gstAmount + shippingAmount - discountAmount;
  const deliveryInfo = getDeliveryDateRange();

  const handleCheckout = async () => {
    const storedToken = token || localStorage.getItem("token");

    if (!storedToken) {
      showInfo("Please login to proceed.");
      navigate("/login");
      return;
    }

    if (!cartItems?.length) {
      showWarning("Your cart is empty.");
      return;
    }

    if (Object.keys(availabilityErrors).length > 0) {
      showError("Please remove sold/unavailable books from your cart before checking out.");
      return;
    }

    if (!addressName.trim() || !addressStreet.trim() || !addressCity.trim() || !addressState.trim() || !addressPostalCode.trim() || !addressPhone.trim()) {
      showWarning("Please enter a complete shipping address.");
      return;
    }

    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
        body: JSON.stringify({
          items: cartItems.map((b) => {
            const isDon = b.isWillingToDonate || b.price === 0;
            return {
              bookId: b._id,
              quantity: 1,
              price: isDon ? 0 : (b.price || 0),
              title: b.title,
            };
          }),
          shippingAddress: {
            name: addressName,
            street: addressStreet,
            city: addressCity,
            state: addressState,
            postalCode: addressPostalCode,
            phone: addressPhone,
          },
          subtotal,
          gstAmount,
          shippingAmount,
          discountAmount,
          couponCode: appliedCoupon,
          estimatedDeliveryDate: deliveryInfo.isoDate,
          totalAmount: finalTotal,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showError(data.message || "Checkout failed");
        setCheckoutLoading(false);
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      showError("An error occurred while processing your payment.");
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="max-w-md mx-auto text-center py-16 px-4 space-y-6">
          <div className="inline-flex p-5 bg-blue-50 text-blue-600 rounded-full shadow-inner animate-pulse">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800">Your shopping bag is empty</h2>
          <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed">
            Looks like you haven't added any books to swap or buy yet. Let's find some amazing reads inside the community bookshelf!
          </p>
          <div className="pt-2">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg hover:-translate-y-0.5"
            >
              Browse Books <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto py-8 px-4">
        
        {/* Navigation back path */}
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-slate-800 transition mb-6 uppercase tracking-wider group"
        >
          <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" /> Continue Shopping
        </Link>

        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight mb-8">
          Shopping Bag <span className="text-gray-400 font-medium text-lg">({cartItems.length} items)</span>
        </h1>

        {/* Split Grid checkout details */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left panel: Cart Items lists */}
          <div className="flex-grow w-full space-y-4">
            {cartItems.map((item) => {
              const isDon = item.isWillingToDonate || item.price === 0;
              return (
                <div
                  key={item._id}
                  className="group flex flex-col sm:flex-row items-center justify-between bg-white p-5 rounded-3xl border border-slate-100/80 shadow-sm hover:shadow-md hover:border-blue-100/50 transition duration-300 gap-4"
                >
                  {/* Image and Meta info */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={
                        item.image?.startsWith("http") 
                          ? item.image 
                          : `${import.meta.env.VITE_API_URL}${item.image}`
                      }
                      alt={item.title}
                      className="w-16 h-20 object-cover rounded-xl shadow-md border border-gray-100 group-hover:scale-105 transition-transform duration-300"
                    />
                    <div>
                      <h2 className="font-extrabold text-slate-800 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors">
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
                        {availabilityErrors[item._id] && (
                          <span className="px-2.5 py-0.5 bg-red-50 text-red-600 border border-red-150 rounded-lg text-[9px] uppercase font-bold tracking-wider animate-pulse">
                            No Longer Available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action button */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-50">
                    <div className="text-right">
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
                      onClick={() => removeFromCart(item._id)}
                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                      title="Remove from bag"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Shipping Address Form */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-extrabold text-gray-800 text-base pb-3 border-b border-gray-150 flex items-center gap-2">
                🚚 Shipping Address
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={addressName}
                    onChange={(e) => setAddressName(e.target.value)}
                    placeholder="Recipient Full Name"
                    className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={addressPhone}
                    onChange={(e) => setAddressPhone(e.target.value)}
                    placeholder="Phone number"
                    className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Street Address</label>
                  <input
                    type="text"
                    required
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="House No, Building, Street, Area"
                    className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-gray-400">City</label>
                  <input
                    type="text"
                    required
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="City"
                    className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
                  />
                </div>
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-gray-400">State / Region</label>
                  <input
                    type="text"
                    required
                    value={addressState}
                    onChange={(e) => setAddressState(e.target.value)}
                    placeholder="State"
                    className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1 text-left">
                  <label className="text-[10px] uppercase font-bold text-gray-400">Postal / ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={addressPostalCode}
                    onChange={(e) => setAddressPostalCode(e.target.value)}
                    placeholder="6-digit ZIP code"
                    className="p-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-white text-gray-700 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Clear Bag helper */}
            <div className="pt-3">
              <button
                className="flex items-center gap-1.5 px-4 py-2.5 border border-slate-200/80 hover:border-red-200 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-2xl text-xs font-bold transition-all bg-white hover:-translate-y-0.5 shadow-sm"
                onClick={clearCart}
              >
                <Trash2 className="h-3.5 w-3.5" /> Clear Shopping Bag
              </button>
            </div>
          </div>
          {/* Right panel: Summary checkout Card */}
          <aside className="w-full lg:w-96 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm sticky top-6 text-gray-800">
            <h3 className="font-bold text-gray-800 text-base pb-3 border-b border-gray-100 mb-4">
              Order Summary
            </h3>
            
            <div className="space-y-3.5 text-xs text-gray-500 font-medium pb-4 border-b border-gray-100">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="text-gray-800 font-semibold">₹ {subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span className="text-gray-800 font-semibold">₹ {gstAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Shipping Charges</span>
                {shippingAmount === 0 ? (
                  <span className="text-emerald-600 font-bold uppercase tracking-wider text-[10px] bg-emerald-50 px-2 py-0.5 rounded">
                    FREE
                  </span>
                ) : (
                  <span className="text-gray-800 font-semibold">₹ {shippingAmount}</span>
                )}
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100/50 p-2.5 rounded-xl transition-all duration-300">
                  <span className="flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Code: {appliedCoupon}
                  </span>
                  <span>- ₹ {discountAmount}</span>
                </div>
              )}
            </div>

            {/* Coupon Code section */}
            <div className="py-4 border-b border-gray-100">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={appliedCoupon !== ""}
                    placeholder={appliedCoupon ? `Code: ${appliedCoupon}` : "Promo code"}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400 font-semibold uppercase placeholder-gray-400 tracking-wider"
                  />
                  {appliedCoupon && (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-xs font-bold px-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {!appliedCoupon ? (
                  <button
                    type="submit"
                    disabled={isApplying || !couponInput.trim()}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {isApplying ? "..." : "Apply"}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-3 py-2 border border-red-200 hover:bg-red-50 text-red-600 rounded-xl text-xs font-bold transition-all"
                  >
                    Remove
                  </button>
                )}
              </form>
              {couponError && (
                <p className="mt-1.5 text-[10px] text-red-500 font-bold bg-red-50 border border-red-100/30 px-2.5 py-1 rounded-md">{couponError}</p>
              )}
              {couponSuccess && (
                <p className="mt-1.5 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/30 px-2.5 py-1 rounded-md">{couponSuccess}</p>
              )}
            </div>

            {/* Estimated Delivery Date */}
            <div className="py-4 border-b border-gray-100 flex items-start gap-2.5">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
                <p className="text-xs font-bold text-gray-700 mt-0.5">{deliveryInfo.rangeStr}</p>
              </div>
            </div>

            {/* Grand Total */}
            <div className="py-4 flex justify-between items-end mb-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Price</p>
                <p className="text-slate-800 font-black text-2xl mt-0.5">₹ {finalTotal}</p>
              </div>
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest text-[9px]">INR</span>
            </div>

            {/* Proceed to checkout button */}
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm tracking-wide shadow-lg shadow-blue-500/10 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="h-4 w-4" /> {checkoutLoading ? "Redirecting to Stripe..." : "Secure Checkout"}
            </button>

            {/* Trust Seals */}
            <div className="mt-5 space-y-2 pt-4 border-t border-gray-50 text-[10px] text-slate-400 font-semibold tracking-wide uppercase">
              <div className="flex items-center gap-2 justify-center">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> Powered by Stripe payments
              </div>
              <p className="text-center font-bold tracking-widest text-[8px] text-slate-300 uppercase">
                100% SECURE & ENCRYPTED
              </p>
            </div>
          </aside>

        </div>
      </div>
    </Layout>
  );
};

export default Cart;
