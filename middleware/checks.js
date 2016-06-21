var log = require('lectal-logger');

module.exports = {

    isLoggedIn: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/login');
        }
    },

    isSetup: function (req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.checks.isSetup) {
                return next();
            } else {
                res.redirect('/setup');
            }
        } else {
            res.redirect('/login');
        }
    },

    isVerified: function (req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.checks.isVerified) {
                return next();
            } else {
                res.redirect('/setup');
            }
        } else {
            res.redirect('/setup');
        }
    },


    isInBeta: function (req, res, next) {

        if (req.isAuthenticated()) {

            if (req.user.checks.inBeta && req.user.checks.isSetup) {
                next();
            } else if (req.user.checks.inBeta) {
                log.error('User is inBeta but is not isSetup =>',req.user);
                res.redirect('/');
            }
            else if (req.user.checks.isSetup) {
                res.redirect('/');
            }
            else {
                res.redirect('/');
            }
        } else {
            res.redirect('/login');
        }
    },


    isAdmin: function (req, res, next) {
        if (req.isAuthenticated()) {
            if (req.user.checks.isAdmin) {
                 next();
            } else {
                res.redirect('/');
            }
        } else {
            res.redirect('/login');
        }
    }

};
