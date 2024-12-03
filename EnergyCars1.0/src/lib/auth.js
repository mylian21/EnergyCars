module.exports = {
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()){
            return next();
        }
        return res.redirect('/acceso')
    },

    isnoLoggedIn(req, res, next) {
        if (!req.isAuthenticated()){
            return next();
        }
        return res.redirect('/perfil')
    }
};