const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("❌ CRITICAL: MONGODB_URI is not defined in environment variables!");
    return;
  }

  // In production environments (like Render / cloud containers), forcing custom DNS (8.8.8.8)
  // often gets blocked by cloud firewalls. Only apply custom DNS in local development if needed.
  if (process.env.NODE_ENV !== "production") {
    try {
      dns.setServers(["8.8.8.8", "8.8.4.4"]);
    } catch (e) {
      console.warn("Could not set custom DNS servers, using system default.");
    }
  }

  try {
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of hanging 30s
    });

    console.log(`✅ MongoDB connected successfully: ${connection.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);

    // If custom DNS caused a querySrv issue, fallback to system default DNS and retry
    try {
      console.log("Retrying MongoDB connection with system default DNS...");
      const connection = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB connected successfully on retry: ${connection.connection.host}`);
    } catch (retryError) {
      console.error(`❌ Retry also failed: ${retryError.message}`);
    }
  }
};

module.exports = connectDB;