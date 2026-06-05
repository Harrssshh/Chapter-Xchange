import User from "../models/user.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password; 

    if (req.body.address) {
      user.address = {
        street: req.body.address.street !== undefined ? req.body.address.street : (user.address?.street || ""),
        city: req.body.address.city !== undefined ? req.body.address.city : (user.address?.city || ""),
        state: req.body.address.state !== undefined ? req.body.address.state : (user.address?.state || ""),
        postalCode: req.body.address.postalCode !== undefined ? req.body.address.postalCode : (user.address?.postalCode || ""),
        phone: req.body.address.phone !== undefined ? req.body.address.phone : (user.address?.phone || ""),
      };
    }

    await user.save();
    
    // Return updated user profile excluding password
    const updatedUser = await User.findById(user._id).select("-password");
    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
