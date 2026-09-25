const express = require("express");
const {
  register,
  login,
  customerRegister,
  customerLogin,
  adminLogin,
  ownerLogin,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

// Customer dedicated routes
router.post("/customer/register", customerRegister);
router.post("/customer/login", customerLogin);

// Admin dedicated routes
router.post("/admin/login", adminLogin);

// Branch / Owner route (Name + Code)
router.post("/owner-login", ownerLogin);

// Generic / legacy routes
router.post("/register", register);
router.post("/login", login);

// Password recovery
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;

