const express = require("express");
const router = express.Router();
const {requireLogin} = require("../middlewares/auth");
const productController = require("../controllers/product.controller");
const multer = require("multer");
const upload = multer({storage: multer.memoryStorage()});

// Home
router.get("/", requireLogin, productController.index);

// Add product
router.post(
    "/add",
    requireLogin,
    upload.single("image"),
    productController.add,
);

// GET /edit/:id
router.get("/edit/:id", requireLogin, productController.editPage);

// Edit product
router.post(
    "/edit/:id",
    requireLogin,
    upload.single("image"),
    productController.edit,
);
// Delete product
router.post("/delete/:id", requireLogin, productController.del);

module.exports = router;
