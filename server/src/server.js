require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 6000;
const startServer = async() => {
  await connectDB();
  app.listen(PORT, () => {
     console.log(`DineOps server is running on port ${PORT}`);
     // This actually starts the Http server.
     });
};

startServer();