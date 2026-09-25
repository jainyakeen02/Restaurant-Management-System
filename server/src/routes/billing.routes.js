const express = require("express");
const {
  getMenuForBranch,
  createWalkInOrder,
  getBranchOrders,
  updateOrderStatus,
  markOrderPaid,
  getKitchenOrders,
  getDeskNotifications,
} = require("../controllers/billing.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// All billing routes require authentication + FRANCHISE_OWNER role
router.use(protect);
router.use(authorize("FRANCHISE_OWNER"));

// Menu for POS
router.get("/menu", getMenuForBranch);

// Orders CRUD
router.post("/orders", createWalkInOrder);
router.get("/orders", getBranchOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.patch("/orders/:id/pay", markOrderPaid);

// Kitchen display
router.get("/kitchen", getKitchenOrders);

// Desk notifications — orders recently marked READY
router.get("/notifications", getDeskNotifications);

module.exports = router;
