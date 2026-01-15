const bcrypt = require("bcrypt");
const db = require("../db/mysql");

exports.showLogin = (req, res) => {
  res.render("login", { error: null });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  const user = rows[0];
  if (!user)
    return res.render("login", { error: "Sai tài khoản hoặc mật khẩu" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.render("login", { error: "Sai tài khoản hoặc mật khẩu" });

  req.session.user = { id: user.id, username: user.username };
  res.redirect("/");
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
};
