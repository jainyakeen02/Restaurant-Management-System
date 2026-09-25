const express = require("express");
const {
  getCategories, createCategory, deleteCategory,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem
} = require("../controllers/menu.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes for visitors / guests to explore menu
router.get("/categories", getCategories);
router.get("/items", getMenuItems);

// Protected admin routes
router.post("/categories", protect, authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), createCategory);
router.delete("/categories/:id", protect, authorize("SUPER_ADMIN"), deleteCategory);

router.post("/items", protect, authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), createMenuItem);
router.put("/items/:id", protect, authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), updateMenuItem);
router.delete("/items/:id", protect, authorize("SUPER_ADMIN"), deleteMenuItem);

module.exports = router;
