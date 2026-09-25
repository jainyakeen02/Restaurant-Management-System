const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Customer = require("../models/customer.model");
const {
  createCustomerOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/order.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// Optional authentication: attaches user if token is present, but doesn't block guests
const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next();

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "dineops_super_secret_key_2026"
    );
    if (decoded.role === "CUSTOMER" || decoded.isCustomer) {
      req.user = await Customer.findById(decoded.id);
      if (req.user) req.user.role = "CUSTOMER";
    } else {
      req.user = await User.findById(decoded.id);
    }
  } catch (err) {
    // Continue as guest
  }
  next();
};

// ─── Public / Customer Routes ──────────────────────────────────────────────────

// 1. Create / Place Order
router.post("/", optionalAuth, createCustomerOrder);

// 2. Customer: Get my past orders
router.get("/my-orders", protect, getMyOrders);

// 3. Track order by ID or Bill Number
router.get("/track/:id", getOrderById);
router.get("/:id", (req, res, next) => {
  // If requesting list of orders with auth, pass through or handle id
  if (req.params.id === "all" || req.params.id === "list") {
    return getAllOrders(req, res, next);
  }
  return getOrderById(req, res, next);
});

// ─── Staff & Admin Routes ─────────────────────────────────────────────────────

// 4. Admin / Branch orders list
router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN", "ORGANIZATION_OWNER", "FRANCHISE_OWNER", "RESTAURANT_ADMIN", "MANAGER", "CASHIER"),
  getAllOrders
);

// 5. Update order status
router.patch(
  "/:id/status",
  protect,
  authorize("SUPER_ADMIN", "ORGANIZATION_OWNER", "FRANCHISE_OWNER", "RESTAURANT_ADMIN", "MANAGER", "KITCHEN_STAFF"),
  updateOrderStatus
);

module.exports = router;
