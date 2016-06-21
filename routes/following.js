var express = require('express');
var router = express.Router();
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');
var helpers =  require('./helpers');
var async = require('async');


router.get('/', helpers.handle.isHashtagOrUsername, function (req, res, next) {

    var userId = req.user ? req.user._id : null;
    var handle = req.params.handle;
    var temp = req.lectalTemp;
    var conditions = temp.conditions;
    var collection = temp.collection;
    var handleId = temp._id;

    if (temp.kind !== 'user') {
        return next(new Error('topics (' + temp.name + ') arent following anything, only users do the following around here.'));
    }

    async.parallel([
        function (cb) {
            helpers.lectalFollows.getLectalFollowing({
                token: req.lectalAccessToken,
                collection: collection,
                handleId: handleId,
                user: req.user
            }, cb);
        }
    ], function complete(err, results) {

        var error = (err instanceof Error) ? err.stack : err;
        var follows = null;

        if (!error) {
            follows = results[0] || [];
            temp.counts.following = follows.length;
        }

        var timeRequired = (Date.now() - req.requestStart) + 'ms';

        res.render('follows.ejs', {
            data: JSON.stringify({
                timeRequired: timeRequired,
                error: error || null,
                user: helpers.user.simplifyUser(req.user),
                follows: follows || [],
                kind: temp.kind,
                handle: handle,
                _id: temp._id,
                name: temp.name,
                picture: temp.picture,
                isFollowing: temp.isFollowing,
                counts: temp.counts,
                NODE_ENV: process.env.NODE_ENV,
                config: config.get('lectal_front_end_env')
            })
        });
    });
});

module.exports = router;
