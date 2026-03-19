const express = require("express");
const router = express.Router();
const controller = require("../controllers/productControllers");
const upload = require("../middleware/upload");

// GET all products (homepage)
router.get("/", controller.getAllProducts);
router.get("/products", controller.getAllProducts);

// GET product details
router.get("/products/:id", controller.getProductById);

// POST create new product
router.post("/products", upload.single("image"), controller.createProduct);

// GET form to edit product
router.get("/products/edit/:id", controller.editProductForm);

// POST update product
router.post(
  "/products/update/:id",
  upload.single("image"),
  controller.updateProduct,
);

// POST delete product
router.post("/products/delete/:id", controller.deleteProduct);

module.exports = router;
