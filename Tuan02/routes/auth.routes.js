const express = require("express");
const router = express.Router();
const {redirectIfLoggedIn} = require("../middlewares/auth");
const authController = require("../controllers/auth.controller");

router.get("/login", redirectIfLoggedIn, authController.showLogin);
router.post("/login", redirectIfLoggedIn, authController.login);
router.post("/logout", authController.logout);

module.exports = router;
