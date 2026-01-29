const express = require("express");
const router = express.Router();
const productLogController = require("../controllers/productLog.controller");

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.role === "admin") {
    return next();
  }
  res.status(403).send("Access denied. Admin only.");
};

router.get("/", isAdmin, productLogController.index);
router.get("/product/:productId", isAdmin, productLogController.byProduct);

module.exports = router;
