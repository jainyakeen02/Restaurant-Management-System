const mongoose = require("mongoose");
const dns = require("dns");

// Force Node.js to use Google's Public DNS to avoid SRV lookup failures
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try{
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB connected: ${connection.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;