const express = require("express");
const {
  getCategories, createCategory, deleteCategory,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem
} = require("../controllers/menu.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

// Categories
router.get("/categories", getCategories);
router.post("/categories", authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), createCategory);
router.delete("/categories/:id", authorize("SUPER_ADMIN"), deleteCategory);

// Items
router.get("/items", getMenuItems);
router.post("/items", authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), createMenuItem);
router.put("/items/:id", authorize("SUPER_ADMIN", "ORGANIZATION_OWNER"), updateMenuItem);
router.delete("/items/:id", authorize("SUPER_ADMIN"), deleteMenuItem);

module.exports = router;
