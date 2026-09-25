const express = require("express");
const {
  getRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deactivateRestaurant,
} = require("../controllers/restaurant.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes for visitors / guests to view branches
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

// Protected admin routes
router.post("/", protect, authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), createRestaurant);
router.put("/:id", protect, authorize("SUPER_ADMIN", "ORGANIZATION_OWNER", "RESTAURANT_ADMIN"), updateRestaurant);
router.patch("/:id/deactivate", protect, authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), deactivateRestaurant);

module.exports = router;