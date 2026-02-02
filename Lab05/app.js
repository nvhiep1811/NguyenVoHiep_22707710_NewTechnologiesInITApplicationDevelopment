const express = require("express");
const path = require("path");
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));
const session = require("express-session");

app.use(
  session({
    secret: "replace-with-a-better-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 },
  }),
);

const authRoutes = require("./routes/auth.routes");
app.use("/", authRoutes);

const productRoutes = require("./routes/product.routes");
app.use("/", productRoutes);

const categoryRoutes = require("./routes/category.routes");
app.use("/", categoryRoutes);

const productLogRoutes = require("./routes/productLog.routes");
app.use("/logs", productLogRoutes);

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
