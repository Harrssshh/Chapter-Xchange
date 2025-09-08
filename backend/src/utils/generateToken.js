// src/utils/generateToken.js
import jwt from "jsonwebtoken";

// Generate JWT token
// Payload: { userId, role }
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,       // Make sure this is defined in your .env
    { expiresIn: "7d" }           // Token validity (7 days)
  );
};
