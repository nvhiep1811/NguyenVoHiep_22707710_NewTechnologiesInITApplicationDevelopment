function requireLogin(req, res, next) {
  if (req.session?.user) return next();
  return res.redirect("/login");
}

function redirectIfLoggedIn(req, res, next) {
  if (req.session?.user) return res.redirect("/");
  return next();
}

function isAdmin(req, res, next) {
  if (req.session?.user && req.session.user.role === "admin") {
    return next();
  }
  return res.status(403).send("Forbidden.");
}

module.exports = { requireLogin, redirectIfLoggedIn, isAdmin };
