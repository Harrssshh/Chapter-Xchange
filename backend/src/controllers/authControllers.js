// src/controllers/authController.js
import bcrypt from "bcrypt";
import User from "../models/user.js"; // Correct filename casing
import { generateToken } from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// =========================
// REGISTER (manual)
// =========================
export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN", // Default role
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      user,
      token,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =========================
// LOGIN (manual)
// =========================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // 2. If user was created via Google and no password is set
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created using Google login. Please use Google login instead."
      });
    }

    // 3. Verify password for manual login
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // 4. Generate JWT
    const token = generateToken(user._id, user.role);

    // 5. Return token and user data
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
    
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// =========================
// GOOGLE LOGIN
// =========================  
export const googleSignIn = async (req, res) => {
  try {
    const { token } = req.body; // <-- FIXED: Match frontend

    if (!token) return res.status(400).json({ message: "Google token is required" });

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email || !name) {
      return res.status(400).json({ message: "Google account missing required info" });
    }

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: null, // Google login, no password
        role: "ADMIN", // Default role
      });
    }

    const authToken = generateToken(user._id, user.role);

    res.status(200).json({ success: true, user, token: authToken });
  } catch (err) {
    console.error("Google sign-in error:", err);
    res.status(500).json({ message: "Google sign-in failed" });
  }
};