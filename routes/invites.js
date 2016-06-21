var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');
var async = require('async');

router.get('/', Checks.isSetup, function (req, res, next) {

    // We use async.parallel architecture in case we need to add parallel requests later
    async.parallel([
        function (cb) {
            helpers.twitter.getTwitterFollowers({
                token: req.lectalAccessToken
            }, cb);
        }
    ], function complete(err, results) {

        var error = (err instanceof Error) ? err.stack : err;

        var twitterFollowers = (results[0] || []).map(function (follower) {
            follower.picture = {};
            follower.picture.medium = follower.profile_image_url;
            return follower;
        });

        var timeRequired = (Date.now() - req.requestStart) + 'ms';

        res.render('invites.ejs', {
            data: JSON.stringify({
                timeRequired: timeRequired,
                error: error || null,
                user: helpers.user.simplifyUser(req.user),
                twitterFollowers: twitterFollowers,
                NODE_ENV: process.env.NODE_ENV,
                config: config.get('lectal_front_end_env')
            })
        });
    });
});

module.exports = router;
