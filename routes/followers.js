var express = require('express');
var router = express.Router();
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');
var helpers =  require('./helpers');
var async = require('async');


router.get('/', helpers.handle.isHashtagOrUsername, function (req, res) {

    var userId = req.user ? req.user._id : null;
    var handle = req.params.handle;
    var temp = req.lectalTemp;
    var conditions = temp.conditions;
    var collection = temp.collection;
    var handleId = temp._id;

    async.parallel([function (cb) {

        helpers.lectalFollows.getLectalFollowers({
            token: req.lectalAccessToken,
            handleId: handleId,
            collection: collection,
            user: req.user
        }, cb);

    }], function complete(err, results) {

        var error = (err instanceof Error) ? err.stack : err;

        var follows = null;

        if (!error) {
            follows = results[0] || [];
            temp.counts.followers = follows.length;
        }

        var timeRequired = (Date.now() - req.requestStart) + 'ms';

        res.render('follows.ejs', {
            data: JSON.stringify({
                timeRequired: timeRequired,
                error: error || null,
                user: helpers.user.simplifyUser(req.user),
                follows: follows,
                kind: temp.kind,
                _id: temp._id,
                handle: handle,
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
