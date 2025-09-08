import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Layout from "../components/Layout";
import { Eye, EyeOff } from "lucide-react";
import { UserContext } from "../contexts/UserContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(UserContext); // ✅ Get login function from context

  // ------------------------
  // Manual email/password login
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // ✅ Immediately update context and localStorage
      login(data.user, data.token);

      alert("Logged in successfully!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------
  // Google login
  // ------------------------
  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) return;

    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:5001/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");

      // ✅ Immediately update context and localStorage
      login(data.user, data.token);

      alert("Logged in with Google!");
      navigate("/");
    } catch (err) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    alert("Google login failed. Please try again.");
  };
  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="bg-white rounded-xl shadow border border-gray-200 w-full max-w-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-1">Login</h2>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Google login */}
              <div className="flex justify-center mb-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                />
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Link to="/forgot-password" className="text-blue-600 hover:underline text-sm">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex flex-col">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 rounded-md text-white font-medium ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 hover:underline">Sign up</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
