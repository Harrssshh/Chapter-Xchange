import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { Eye, EyeOff } from "lucide-react";
import { signupUser, googleLogin } from "../api/auth"; 
import { UserContext } from "../contexts/UserContext"; // ✅ Import UserContext

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { login } = useContext(UserContext); // ✅ Use login from context

  // Initialize Google Identity SDK button
  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: "outline", size: "large", width: "100%" }
      );
    }
  }, []);

  // ------------------------
  // GOOGLE SIGNUP
  // ------------------------
  const handleGoogleResponse = async (response) => {
    try {
      setIsLoading(true);
      const data = await googleLogin(response.credential); // sends tokenId to backend

      // ✅ Backend should return { user, token }
      if (data.success) {
        login(data.user, data.token); // auto-login immediately
        navigate("/"); // redirect to home
      } else {
        alert(data.message || "Google signup failed");
      }
    } catch (err) {
      alert(err.message || "Google signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ------------------------
  // MANUAL SIGNUP
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await signupUser(name, email, password);

      // ✅ Backend should return { user, token }
      if (data.success) {
        login(data.user, data.token); // auto-login immediately
        navigate("/"); // redirect to home
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      alert(err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="bg-white rounded-xl shadow border border-gray-200 w-full max-w-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold mb-1">Create an Account</h2>
            <p className="text-gray-600">Enter your information to create an account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-4">
              {/* Google login button */}
              <div id="googleBtn" className="mb-4"></div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                <label htmlFor="password" className="text-sm font-medium">Password</label>
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

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                {isLoading ? "Creating account..." : "Sign Up"}
              </button>
              <p className="mt-4 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
