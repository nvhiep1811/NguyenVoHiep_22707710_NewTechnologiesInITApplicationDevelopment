const { s3 } = require("../utils/aws");
const Product = require("../models/productModel");

const renderProductsPage = async (res, editProduct = null) => {
  const products = await Product.getAll();
  return res.render("product", { products, editProduct });
};

const handleError = (res, action, error) => {
  return res.status(500).send(`Error ${action}: ${error.message}`);
};

// Delete image from S3
const deleteImage = async (imageUrl) => {
  if (!imageUrl) return;
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
    await renderProductsPage(res);
  } catch (error) {
    handleError(res, "fetching products", error);
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
      image: req.file ? req.file.location : product.image,
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

    // Delete image from S3
    if (product.image) {
      await deleteImage(product.image);
    }

    await Product.delete(req.params.id);
    res.redirect("/products");
  } catch (error) {
    handleError(res, "deleting product", error);
  }
};
