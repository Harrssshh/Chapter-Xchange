import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/user.js"; 
import { generateToken } from "../utils/generateToken.js";
import { OAuth2Client } from "google-auth-library";
import { sendEmail } from "../utils/sendEmail.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "ADMIN", 
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


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account was created using Google login. Please use Google login instead."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id, user.role);

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


export const googleSignIn = async (req, res) => {
  try {
    const { token } = req.body; 

    if (!token) return res.status(400).json({ message: "Google token is required" });

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    if (!email || !name) {
      return res.status(400).json({ message: "Google account missing required info" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: null, 
        role: "ADMIN", 
      });
    }

    const authToken = generateToken(user._id, user.role);

    res.status(200).json({ success: true, user, token: authToken });
  } catch (err) {
    console.error("Google sign-in error:", err);
    res.status(500).json({ message: "Google sign-in failed" });
  }
};

// ✅ 4. Forgot Password - Send recovery link via email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Please provide an email address" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "No user found with that email address" });
    }

    // Generate secure random reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set database fields
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    await user.save();

    // Reset password URL
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${resetToken}`;

    // Send recover email
    const emailSubject = "🔑 Password Reset Request - ChapterExchange";
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #eee; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
        <h2 style="color: #4f46e5; margin-top: 0;">Password Reset Request</h2>
        <p>Hello <strong>${user.name}</strong>,</p>
        <p>You are receiving this email because you (or someone else) requested a password reset for your account on ChapterExchange.</p>
        
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 12px 0; font-size: 13px; color: #475569;">This password reset link is valid for only <strong>10 minutes</strong>.</p>
          <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Reset Password</a>
        </div>
        
        <p style="font-size: 12px; color: #64748b;">If you did not request this reset, please ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 0;">Happy reading,<br/>The ChapterExchange Hub Team</p>
      </div>
    `;

    const emailSent = await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
    });

    if (!emailSent) {
      user.resetPasswordToken = null;
      user.resetPasswordExpire = null;
      await user.save();
      return res.status(500).json({ success: false, message: "Email could not be sent. Please try again later." });
    }

    res.status(200).json({ success: true, message: "Password reset link sent to your email successfully" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ success: false, message: "Server error sending password reset link" });
  }
};

// ✅ 5. Reset Password - Set new password in DB
export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ success: false, message: "Please provide a new password" });
    }

    // Hash token to compare with DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired password reset token" });
    }

    // Hash the new password and save
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpire = null;

    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ success: false, message: "Server error resetting password" });
  }
};