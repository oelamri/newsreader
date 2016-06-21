var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');
var async = require('async');

router.get('/', Checks.isSetup, function (req, res, next) {

    if (!req.user) {
        return res.redirect('/login');
    }

    var userId = req.user._id;

    async.parallel([
        function (cb) {
            helpers.notifications.getNotifications({
                _id: userId,
                token: req.lectalAccessToken
            }, cb);
        }
    ], function complete(err, results) {

        var error = (err instanceof Error) ? err.stack : err;

        if (error) {
            log.error(error);
        }

        var notifications = results[0] || [];

        var timeRequired = (Date.now() - req.requestStart) + 'ms';

        res.render('notifications.ejs', {
            data: JSON.stringify({
                timeRequired: timeRequired,
                error: error || null,
                notifications: notifications,
                user: helpers.user.simplifyUser(req.user),
                NODE_ENV: process.env.NODE_ENV,
                config: config.get('lectal_front_end_env')
            })
        });
    })
});

module.exports = router;
