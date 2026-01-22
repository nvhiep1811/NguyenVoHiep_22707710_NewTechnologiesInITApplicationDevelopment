function requireLogin(req, res, next) {
    if (req.session?.user) return next();
    return res.redirect("/login");
}

function redirectIfLoggedIn(req, res, next) {
    if (req.session?.user) return res.redirect("/");
    return next();
}

module.exports = {requireLogin, redirectIfLoggedIn};
