const express = require("express");
const {
  getOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
} = require("../controllers/organization.controller");

const router = express.Router();

router.get("/", getOrganizations);
router.post("/", createOrganization);
router.get("/:id", getOrganizationById);
router.put("/:id", updateOrganization);

module.exports = router;
