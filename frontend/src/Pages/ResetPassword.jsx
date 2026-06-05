import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Lock, CheckCircle2, ArrowRight, BookOpen, AlertCircle } from "lucide-react";
import Layout from "../components/Layout";

const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5001"
  : import.meta.env.VITE_API_URL || "https://chapter-xchange.onrender.com";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage(data.message || "Your password has been successfully updated!");
        // Auto-redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        setError(data.message || "Invalid or expired password reset link.");
      }
    } catch (err) {
      console.error("Reset password frontend error:", err);
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
              <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Password Reset Complete</h2>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Your credentials have been securely updated. You will be automatically redirected to the login screen shortly to sign in.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-50 hover:to-teal-500 text-white rounded-2xl text-sm font-bold transition-all shadow-md shadow-emerald-500/10"
                >
                  Go to Login Now <ArrowRight className="h-4 w-4" />
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
                
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Create New Password</h2>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  Please enter your new password below. Make sure it is at least 6 characters and satisfies your standard security requirements.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl text-xs font-bold border border-rose-100 flex items-start gap-2.5 animate-shake">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password field */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      type="password"
                      id="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm font-semibold transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* Confirm Password field */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      type="password"
                      id="confirmPassword"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-slate-200 focus:border-indigo-500 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm font-semibold transition-all placeholder:text-slate-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-50 hover:to-blue-500 disabled:from-slate-200 disabled:to-slate-200 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Reset Password & Sign In"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;
