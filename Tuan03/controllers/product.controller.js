const productService = require("../services/product.service");
const categoryService = require("../services/category.service");

exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const filters = {
      search: req.query.search,
      categoryId: req.query.categoryId,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
    };

    const [{ items, totalPages }, categories] = await Promise.all([
      productService.list(filters, page),
      categoryService.list(),
    ]);

    res.render("products", {
      products: items,
      categories,
      query: req.query,
      currentPage: page,
      totalPages,
      editingProduct: null,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("System error");
  }
};

exports.add = async (req, res) => {
  try {
    const created = await productService.create(req.body);
    if (req.file) {
      try {
        await productService.updateImage(created.id, {
          buffer: req.file.buffer,
          contentType: req.file.mimetype,
        });
      } catch (e) {
        console.error("Error uploading image:", e);
      }
    }
    res.redirect("/");
  } catch (error) {
    console.error("Error adding product:", error);
    res.redirect("/");
  }
};

exports.editPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const [{ items, totalPages }, categories, editingProduct] =
      await Promise.all([
        productService.list({}, page),
        categoryService.list(),
        productService.getById(req.params.id),
      ]);

    if (!editingProduct) {
      return res.redirect("/");
    }

    res.render("products", {
      products: items,
      categories,
      editingProduct,
      query: {},
      currentPage: page,
      totalPages,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching product for edit:", error);
    res.redirect("/");
  }
};

exports.edit = async (req, res) => {
  try {
    await productService.update(req.params.id, req.body);
    if (req.file) {
      try {
        await productService.updateImage(req.params.id, {
          buffer: req.file.buffer,
          contentType: req.file.mimetype,
        });
      } catch (e) {
        console.error("Error uploading image:", e);
      }
    }
    res.redirect("/");
  } catch (error) {
    console.error("Error updating product:", error);
    res.redirect("/");
  }
};

exports.del = async (req, res) => {
  try {
    await productService.remove(req.params.id);
    res.redirect("/");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.redirect("/");
  }
};
