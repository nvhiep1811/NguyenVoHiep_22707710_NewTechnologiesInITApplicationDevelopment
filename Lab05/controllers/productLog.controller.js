const productLogService = require("../services/productLog.service");
const productService = require("../services/product.service");

// Display all logs
exports.index = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const { items, totalPages } = await productLogService.list(page);

    // Get product names for each log
    const logsWithDetails = await Promise.all(
      items.map(async (log) => {
        const product = await productService.getById(log.productId);
        return {
          ...log,
          productName: product ? product.name : "Unknown Product",
        };
      }),
    );

    res.render("productLogs", {
      logs: logsWithDetails,
      currentPage: page,
      totalPages,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error fetching product logs:", error);
    res.status(500).send("System error");
  }
};

// View logs for specific product
exports.byProduct = async (req, res) => {
  try {
    const logs = await productLogService.getByProductId(req.params.productId);
    const product = await productService.getById(req.params.productId);

    res.render("productLogs", {
      logs,
      currentPage: 1,
      totalPages: 1,
      user: req.session.user,
      filterProduct: product,
    });
  } catch (error) {
    console.error("Error fetching product logs:", error);
    res.redirect("/logs");
  }
};
