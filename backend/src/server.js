

// src/server.js
import app from "./app.js";

import dotenv from "dotenv";
import connectDB from "./config/db.js";

dotenv.config();

// MongoDB connection
connectDB();



const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

