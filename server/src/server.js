require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 6000;
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`DineOps server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();