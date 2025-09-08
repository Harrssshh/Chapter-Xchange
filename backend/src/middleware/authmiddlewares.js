// src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // Match filename casing

export const protect = async (req, res, next) => {
  let token;

  try {
    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to request
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ success: false, message: "User not found" });
      }

      req.user = { userId: user._id, role: user.role }; // Only attach needed info
      next();
    } else {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(401).json({ success: false, message: "Not authorized, token failed" });
  }
};
