const { s3 } = require("../utils/aws");
const Product = require("../models/productModel");
require("dotenv").config();

// Delete image from S3
const deleteImage = async (imageUrl) => {
  const key = imageUrl.split(".amazonaws.com/")[1];

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};

// Render all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.render("product", { products, editProduct: null });
  } catch (error) {
    res.status(500).send("Error fetching products: " + error.message);
  }
};

// Render form to create new product
exports.createProductForm = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.render("product", { products, editProduct: null });
  } catch (error) {
    res.status(500).send("Error loading create form: " + error.message);
  }
};

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const imageUrl = req.file ? req.file.location : null;

    const product = {
      name: req.body.name,
      price: req.body.price,
      image: imageUrl,
    };

    await Product.create(product);
    res.redirect("/products");
  } catch (error) {
    res.status(500).send("Error creating product: " + error.message);
  }
};

// Render form to edit product
exports.editProductForm = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    const products = await Product.getAll();
    res.render("product", { products, editProduct: product });
  } catch (error) {
    res.status(500).send("Error loading edit form: " + error.message);
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
      image: req.file ? req.file.location : product.image,
    };

    await Product.update(req.params.id, updatedData);
    res.redirect("/products");
  } catch (error) {
    res.status(500).send("Error updating product: " + error.message);
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Delete image from S3
    if (product.image) {
      await deleteImage(product.image);
    }

    await Product.delete(req.params.id);
    res.redirect("/products");
  } catch (error) {
    res.status(500).send("Error deleting product: " + error.message);
  }
};
