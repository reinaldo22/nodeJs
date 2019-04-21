
module.exports = {
    eAdmin: function (req, res, next) {
        if (req.isAuthenticated() && req.user.eAdmin == 1) {
            return next();
        }

        req.flash("error_msg", "Você não tem permissão, entre em contato com o administrador");
        res.redirect("/");
    }
}