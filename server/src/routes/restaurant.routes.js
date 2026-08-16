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

router.use(protect);

router.get("/", getRestaurants);
router.post("/", authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), createRestaurant);
router.get("/:id", getRestaurantById);
router.put("/:id", authorize("SUPER_ADMIN", "ORGANIZATION_OWNER", "RESTAURANT_ADMIN"), updateRestaurant);
router.patch("/:id/deactivate", authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), deactivateRestaurant);

module.exports = router;