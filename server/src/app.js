const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const restaurantRoutes = require("./routes/restaurant.routes");
const { errorHandler, notFoundHandler } = require("./middleware/error.middleware");

const app = express();

// security middleware
app.use(helmet());

//Enable cors
app.use(cors());

//Parse incoming JSOn request
app.use(express.json({ limit: "10kb" }));

//Parse URL encoded data
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

//HTTP request logger
app.use(morgan("dev"));

//Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DineOps server is running!!",
  });
});

const authRoutes = require("./routes/auth.routes");
const organizationRoutes = require("./routes/organization.routes");
const customerRoutes = require("./routes/customer.routes");

const adminRoutes = require("./routes/admin.routes");
const menuRoutes = require("./routes/menu.routes");

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/menu", menuRoutes);

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

module.exports = app;