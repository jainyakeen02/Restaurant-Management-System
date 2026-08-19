const express = require("express");
const { register, login, ownerLogin } = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/owner-login", ownerLogin);

module.exports = router;

