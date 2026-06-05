import React, { useEffect, useContext, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import { UserContext } from "../contexts/UserContext";
import { CheckCircle, ArrowRight, ShoppingBag, Calendar, Heart, AlertCircle, Loader } from "lucide-react";

const OrderSuccess = () => {
  const { updateCartCount } = useContext(UserContext);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [isConfirming, setIsConfirming] = useState(true);
  const [confirmError, setConfirmError] = useState("");

  const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5001"
    : import.meta.env.VITE_API_URL || "https://chapter-xchange.onrender.com";

  useEffect(() => {
    // Clear cart on mount
    localStorage.removeItem("cart");
    updateCartCount();

    const verifyPayment = async () => {
      if (!sessionId) {
        setIsConfirming(false);
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${API_URL}/api/orders/confirm-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId })
        });
        const data = await res.json();
        if (res.ok) {
          setIsConfirming(false);
        } else {
          setConfirmError(data.message || "Failed to confirm payment with server.");
          setIsConfirming(false);
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        setConfirmError("Network error occurred while verifying payment.");
        setIsConfirming(false);
      }
    };
    verifyPayment();
  }, [sessionId, updateCartCount]);

  return (
    <Layout>
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-slate-100 p-8 sm:p-10 rounded-3xl shadow-xl space-y-6">
          
          {isConfirming ? (
            /* 1. Loading/Verification State */
            <div className="py-8 space-y-4 flex flex-col items-center justify-center min-h-[200px]">
              <Loader className="w-10 h-10 text-indigo-650 animate-spin" />
              <h2 className="text-xl font-bold text-slate-800">Verifying Payment Status...</h2>
              <p className="text-gray-400 text-xs font-semibold max-w-xs leading-relaxed">
                We are securing your checkout session with Stripe. Please do not close or reload this page.
              </p>
            </div>
          ) : confirmError ? (
            /* 2. Error/Warning State */
            <div className="space-y-6">
              <div className="inline-flex p-4 bg-amber-50 text-amber-600 rounded-full shadow-inner animate-pulse">
                <AlertCircle className="h-14 w-14" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payment Verification Issue</h2>
                <p className="text-gray-500 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
                  {confirmError}
                </p>
              </div>
              <p className="text-[11px] text-amber-700 bg-amber-50/50 p-3 rounded-xl border border-amber-100/30">
                If your card has been debited, do not worry. Your order will be activated as soon as the Stripe payment server notifies our database.
              </p>
            </div>
          ) : (
            /* 3. Successful Confirmation State */
            <div className="space-y-6 animate-fadeIn">
              <div className="inline-flex p-4 bg-emerald-50 text-emerald-500 rounded-full shadow-inner animate-bounce mt-2">
                <CheckCircle className="h-16 w-16" />
              </div>

              <div className="space-y-2">
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                  Order Activated!
                </h1>
                <p className="text-gray-500 text-sm font-medium max-w-sm mx-auto leading-relaxed">
                  Thank you for your purchase. Your payment was confirmed, and the books have been removed from browse shelves.
                </p>
              </div>
            </div>
          )}

          {sessionId && (
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-[11px] text-slate-500 font-semibold space-y-1">
              <span className="text-slate-400 block uppercase tracking-widest text-[9px] mb-1">
                Transaction Session ID
              </span>
              <span className="font-mono text-slate-700 select-all block break-all">
                {sessionId}
              </span>
            </div>
          )}

          {/* Quick Informational Grid */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 bg-blue-50/40 border border-blue-100/30 rounded-2xl text-left space-y-1">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800">Fast Delivery</h3>
              <p className="text-[10px] text-gray-500 font-medium">Estimated arrival is 3-5 business days.</p>
            </div>
            <div className="p-4 bg-purple-50/40 border border-purple-100/30 rounded-2xl text-left space-y-1">
              <Heart className="h-5 w-5 text-purple-600" />
              <h3 className="text-xs font-bold text-slate-800">Support Reader</h3>
              <p className="text-[10px] text-gray-500 font-medium">Your purchase supports community shelf sharing.</p>
            </div>
          </div>

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center">
            <Link
              to="/user?tab=orders"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-4 w-4" /> View My Orders
            </Link>
            <Link
              to="/browse"
              className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all hover:-translate-y-0.5"
            >
              Continue Browsing <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
