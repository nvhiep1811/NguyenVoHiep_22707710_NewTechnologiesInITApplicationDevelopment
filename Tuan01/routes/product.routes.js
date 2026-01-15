const express = require("express");
const router = express.Router();
const db = require("../db/mysql");
const { requireLogin } = require("../middlewares/auth");
const productController = require("../controllers/product.controller");

// Home
router.get("/", requireLogin, productController.index);

// Add product
router.post("/add", requireLogin, productController.add);

// GET /edit/:id
router.get("/edit/:id", requireLogin, productController.editPage);

// Edit product
router.post("/edit/:id", requireLogin, productController.edit);
// Delete product
router.post("/delete/:id", requireLogin, productController.del);

module.exports = router;
