const express = require("express");
const { body } = require("express-validator");
const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
} = require("../controllers/customer.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// All customer routes require authentication
router.use(protect);

router.post(
  "/",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("email").optional().isEmail().withMessage("Please provide a valid email"),
  ],
  createCustomer
);

router.get("/", getCustomers);
router.get("/:id", getCustomerById);

router.patch(
  "/:id",
  [
    body("email").optional().isEmail().withMessage("Please provide a valid email"),
  ],
  updateCustomer
);

module.exports = router;
