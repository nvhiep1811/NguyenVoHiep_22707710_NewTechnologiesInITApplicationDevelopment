const categoryService = require("../services/category.service");

// List categories
exports.index = async (req, res) => {
  try {
    const categories = await categoryService.list();
    res.render("categories", {
      categories,
      editingCategory: null,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("System error");
  }
};

// Create new category
exports.add = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.redirect("/categories?error=MissingName");
    }
    await categoryService.create({ name, description });
    res.redirect("/categories");
  } catch (error) {
    console.error("Error adding category:", error);
    res.redirect("/categories");
  }
};

// Show edit category view
exports.editPage = async (req, res) => {
  try {
    const categories = await categoryService.list();
    const editingCategory = await categoryService.getById(req.params.id);

    if (!editingCategory) {
      return res.redirect("/categories");
    }

    res.render("categories", {
      categories,
      editingCategory,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching category for edit:", error);
    res.redirect("/categories");
  }
};

// Update category
exports.edit = async (req, res) => {
  try {
    const { name, description } = req.body;
    await categoryService.update(req.params.id, { name, description });
    res.redirect("/categories");
  } catch (error) {
    console.error("Error updating category:", error);
    res.redirect("/categories");
  }
};

// Delete category
exports.del = async (req, res) => {
  try {
    await categoryService.remove(req.params.id);
    res.redirect("/categories");
  } catch (error) {
    console.error("Error deleting category:", error);
    res.redirect("/categories");
  }
};
