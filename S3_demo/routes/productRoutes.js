const express = require("express");
const router = express.Router();
const productController = require("../controllers/productControllers");
const upload = require("../middleware/upload");

// GET all products (homepage)
router.get("/", productController.getAllProducts);
router.get("/products", productController.getAllProducts);

// GET form to create new product
router.get("/products/new", productController.createProductForm);

// POST create new product
router.post(
  "/products",
  upload.single("image"),
  productController.createProduct,
);

// GET form to edit product
router.get("/products/edit/:id", productController.editProductForm);

// POST update product
router.post(
  "/products/update/:id",
  upload.single("image"),
  productController.updateProduct,
);

// POST delete product
router.post("/products/delete/:id", productController.deleteProduct);

module.exports = router;
