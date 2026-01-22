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
    const created = await productService.create(req.body);
    if (req.file) {
        try {
            await productService.updateImage(created.id, {
                buffer: req.file.buffer,
                contentType: req.file.mimetype,
            });
        } catch (e) {
            console.error(e);
        }
    }
    res.redirect("/");
};

exports.editPage = async (req, res) => {
    const products = await productService.list();
    const editingProduct = await productService.getById(req.params.id);
    res.render("products", {products, editingProduct, user: req.session.user});
};

exports.edit = async (req, res) => {
    await productService.update(req.params.id, req.body);
    if (req.file) {
        try {
            await productService.updateImage(req.params.id, {
                buffer: req.file.buffer,
                contentType: req.file.mimetype,
            });
        } catch (e) {
            console.error(e);
        }
    }
    res.redirect("/");
};

exports.del = async (req, res) => {
    await productService.remove(req.params.id);
    res.redirect("/");
};
