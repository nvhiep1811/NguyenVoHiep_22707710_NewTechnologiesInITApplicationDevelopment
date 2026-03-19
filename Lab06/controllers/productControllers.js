const fs = require("fs");
const path = require("path");
const Product = require("../models/productModel");

const renderProductsPage = async (res, editProduct = null) => {
  const products = await Product.getAll();
  return res.render("product", { products, editProduct });
};

const handleError = (res, action, error) => {
  return res.status(500).send(`Error ${action}: ${error.message}`);
};

const getLocalImagePath = (imageUrl) => {
  if (!imageUrl || !imageUrl.startsWith("/images/")) {
    return null;
  }

  const fileName = path.basename(imageUrl);
  return path.join(__dirname, "..", "images", fileName);
};

const deleteImage = async (imageUrl) => {
  const imagePath = getLocalImagePath(imageUrl);
  if (!imagePath) {
    return;
  }

  try {
    await fs.promises.unlink(imagePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
};

// Render all products
exports.getAllProducts = async (req, res) => {
  try {
    await renderProductsPage(res);
  } catch (error) {
    handleError(res, "fetching products", error);
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    res.render("productDetail", { product });
  } catch (error) {
    handleError(res, "fetching products", error);
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const imageUrl = req.file ? `/images/${req.file.filename}` : null;

    const product = {
      name: req.body.name,
      price: req.body.price,
      unitInStock: req.body.unitInStock,
      image: imageUrl,
    };

    await Product.create(product);
    res.redirect("/products");
  } catch (error) {
    handleError(res, "creating product", error);
  }
};

// Render form to edit product
exports.editProductForm = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    await renderProductsPage(res, product);
  } catch (error) {
    handleError(res, "loading edit form", error);
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // If new image uploaded, delete old one
    if (req.file && product.image) {
      await deleteImage(product.image);
    }

    const updatedData = {
      name: req.body.name,
      price: req.body.price,
      unitInStock: req.body.unitInStock,
      image: req.file ? `/images/${req.file.filename}` : product.image,
    };

    await Product.update(req.params.id, updatedData);
    res.redirect("/products");
  } catch (error) {
    handleError(res, "updating product", error);
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Delete image file from local images folder
    if (product.image) {
      await deleteImage(product.image);
    }

    await Product.delete(req.params.id);
    res.redirect("/products");
  } catch (error) {
    handleError(res, "deleting product", error);
  }
};
