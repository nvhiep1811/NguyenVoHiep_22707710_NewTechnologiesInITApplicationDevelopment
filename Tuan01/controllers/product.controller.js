const productService = require("../services/product.service");

exports.index = async (req, res) => {
  const products = await productService.list();
  res.render("products", {
    products,
    editingProduct: null,
    user: req.session.user,
  });
};

exports.add = async (req, res) => {
  await productService.create(req.body);
  res.redirect("/");
};

exports.editPage = async (req, res) => {
  const products = await productService.list();
  const editingProduct = await productService.getById(req.params.id);
  res.render("products", { products, editingProduct, user: req.session.user });
};

exports.edit = async (req, res) => {
  await productService.update(req.params.id, req.body);
  res.redirect("/");
};

exports.del = async (req, res) => {
  await productService.remove(req.params.id);
  res.redirect("/");
};
