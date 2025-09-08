// src/controllers/userController.js
import User from "../models/user.js";

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields if provided
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password; // Hash in pre-save hook if using mongoose

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
