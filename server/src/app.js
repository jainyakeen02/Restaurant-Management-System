const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');

const restaurantRoutes = require("./routes/restaurant.routes");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const app = express();

// security middleware
app.use(helmet({ crossOriginResourcePolicy: false }));

// Enable cors for Vercel, localhost, and custom domains
app.use(
  cors({
    origin: true, // Reflects the origin of the requester (supports Vercel preview & production domains)
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//Parse incoming JSOn request
app.use(express.json({ limit: "10kb" }));

//Parse URL encoded data
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//HTTP request logger
app.use(morgan("dev"));

// Welcome / Root API Info Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to DineOps API Server 🍽️",
    status: "Online",
    healthCheck: "/api/health",
    version: "1.0.0",
    frontend: process.env.CLIENT_URL || "Set CLIENT_URL to your Vercel domain",
  });
});

// Health check route with database connectivity status
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatusMap = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting",
  };
  const isConnected = dbState === 1;

  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    message: isConnected
      ? "DineOps server is healthy and connected to MongoDB!"
      : "DineOps server is running, but MongoDB is not connected.",
    database: dbStatusMap[dbState] || "Unknown",
    hasMongoUriEnv: Boolean(process.env.MONGODB_URI),
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

const authRoutes = require("./routes/auth.routes");
const organizationRoutes = require("./routes/organization.routes");
const customerRoutes = require("./routes/customer.routes");

const adminRoutes = require("./routes/admin.routes");
const menuRoutes = require("./routes/menu.routes");
const billingRoutes = require("./routes/billing.routes");
const orderRoutes = require("./routes/order.routes");

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/orders", orderRoutes);

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;