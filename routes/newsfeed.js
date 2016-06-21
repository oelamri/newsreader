var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');
var async = require('async');
var _ = require('underscore');

router.get('/', Checks.isSetup, function (req, res, next) {

    if (!req.user) {
        return res.redirect('/login');
    }

    async.parallel([function (cb) {

        var following = _.pluck(req.user.following.filter(function (follow) {
            return follow && follow.kind && String(follow.kind).toUpperCase() === 'USER';
        }), 'followeeId');

        helpers.posts.getInitialPosts({
            token: req.lectalAccessToken,
            conditions: {
                'post-conditions': {
                    $and: [
                        {
                            posterId: {
                                $in: following
                            }
                        },
                        {
                            dateCreated: {
                                $lt: new Date()
                            }
                        }
                    ]
                }
            }
        }, cb);

    }], function complete(err, results) {

        var error = (err instanceof Error) ? err.stack : String(err);

        var postData = results[0] || {};
        var posts = postData.posts;
        var remainingPosts = postData.remainingPosts;

        var timeRequired = (Date.now() - req.requestStart) + 'ms';

        res.render('feed.ejs', {
            data: JSON.stringify({
                timeRequired: timeRequired,
                error: error || null,
                user: helpers.user.simplifyUser(req.user),
                posts: posts || [],
                remainingPosts: remainingPosts || [],
                NODE_ENV: process.env.NODE_ENV,
                config: config.get('lectal_front_end_env')
            })
        });
    });

});

module.exports = router;
