const express = require("express");
const { getAdminStats, getBranchStats } = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

const router = express.Router();

router.use(protect);

// Platform-wide stats (Super Admin only)
router.get("/stats", authorize("SUPER_ADMIN"), getAdminStats);

// Branch-specific analytics (Branch Owner only)
router.get("/branch-stats", authorize("FRANCHISE_OWNER"), getBranchStats);

module.exports = router;

