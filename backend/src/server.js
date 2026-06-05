import "dotenv/config";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import app from "./app.js";
import connectDB from "./config/db.js";

connectDB();



const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

