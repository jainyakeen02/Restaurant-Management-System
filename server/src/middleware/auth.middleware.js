const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Customer = require("../models/customer.model");

// Protect routes
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dineops_super_secret_key_2026"
    );

    if (decoded.role === "CUSTOMER" || decoded.isCustomer) {
      req.user = await Customer.findById(decoded.id);
      if (req.user) {
        req.user.role = "CUSTOMER";
      } else {
        // Fallback check in User collection for legacy accounts
        req.user = await User.findById(decoded.id);
      }
    } else {
      req.user = await User.findById(decoded.id);
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
