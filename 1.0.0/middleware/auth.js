module.exports = {
  isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
  },
  isGuest(req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect("/feed");
  }
};