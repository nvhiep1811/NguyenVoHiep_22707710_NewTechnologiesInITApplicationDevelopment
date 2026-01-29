const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { requireLogin, isAdmin } = require("../middlewares/auth");

router.get("/categories", requireLogin, categoryController.index);
router.post("/categories/add", requireLogin, isAdmin, categoryController.add);
router.get("/categories/edit/:id", requireLogin, isAdmin, categoryController.editPage);
router.post("/categories/edit/:id", requireLogin, isAdmin, categoryController.edit);
router.post("/categories/delete/:id", requireLogin, isAdmin, categoryController.del);

module.exports = router;
