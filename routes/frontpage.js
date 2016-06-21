var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var async = require('async');

router.get('/', function (req, res) {

    var conditions = {
        'post-conditions': {
            $and: [
                {
                    dateCreated: {
                        $lt: new Date()
                    }
                }
            ]
        }
    };

    async.parallel([
        function (cb) {
            helpers.posts.getInitialPosts({
                conditions: conditions,
                token: req.lectalAccessToken,
                count: 450
            }, cb);
        }

    ], function (err, results) {

        var error = (err instanceof Error) ? err.stack : err;

        if (error) {
            log.error(err);
        }

        var postData = results[0] || {};
        var timeRequired = (Date.now() - req.requestStart) + 'ms';

        res.render('index.ejs', {
            data: JSON.stringify({
                timeRequired: timeRequired,
                error: error || null,
                user: helpers.user.simplifyUser(req.user),
                posts: postData.posts || [],
                remainingPosts: postData.remainingPosts || [],
                NODE_ENV: process.env.NODE_ENV,
                config: config.get('lectal_front_end_env')
            })
        });
    });
});

module.exports = router;