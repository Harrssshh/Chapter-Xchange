import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle2, BookOpen } from "lucide-react";
import Layout from "../components/Layout";

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5001"
  : import.meta.env.VITE_API_URL || "https://chapter-xchange.onrender.com";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage(data.message || "A reset link has been dispatched to your email address.");
      } else {
        setError(data.message || "Failed to submit request. Please try again.");
      }
    } catch (err) {
      console.error("Forgot password frontend error:", err);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-50 to-slate-100/50">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transition-all duration-300 hover:shadow-indigo-500/5">
          {success ? (
            /* Success State */
            <div className="p-8 sm:p-10 text-center space-y-6">
              <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-full animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Check Your Inbox</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  We have dispatched a password reset link to <span className="font-semibold text-slate-700">{email}</span>. Please click the link inside the email to complete the reset.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <p className="text-slate-400 text-xs">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-indigo-600 text-white rounded-2xl text-sm font-bold transition-all shadow-md shadow-slate-900/10 hover:shadow-indigo-500/20"
                >
                  <ArrowLeft className="h-4 w-4" /> Return to Login
                </Link>
              </div>
            </div>
          ) : (
            /* Form State */
            <div className="p-8 sm:p-10 space-y-6">
              {/* Heading */}
              <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-600/20">
                    <BookOpen className="h-4.5 w-4.5" />
                  </div>
                  <span className="text-sm font-black text-indigo-600 tracking-widest">ChapterExchange</span>
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Forgot Password?</h2>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  No worries! Enter your registered email and we will send you a secure link to reset your password.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold border border-rose-100 animate-shake">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm font-semibold transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:from-slate-200 disabled:to-slate-200 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Send Password Reset Link"
                  )}
                </button>
              </form>

              {/* Back to Login Anchor */}
              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors group"
                >
                  <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-0.5 transition-transform" /> Back to Sign In
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
