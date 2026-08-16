const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const restaurantRoutes = require("./routes/restaurant.routes");

const app = express();

// security middleware
app.use(helmet());

//Enable cors
app.use(cors());

//Parse incoming JSOn request
app.use(express.json());

//Parse URL encoded data
app.use(express.urlencoded({ extended: true}));

//HTTP request logger
app.use(morgan("dev"));

//Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DineOps server is running!!",
  });
});

app.use("/api/restaurants", restaurantRoutes);

module.exports = app;