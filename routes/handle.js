var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');
var async = require('async');
var log = require('lectal-logger');

router.get('/', helpers.handle.filterHandles, /*helpers.handle.isHashtagOrUsername,*/ function (req, res, next) {
    log.debug('Handle request:', req);

    var count = 450; //note: default to 450 but also handle the fact that 0 is falsy
    var userId = req.user ? req.user._id : null;
    var handle = req.params.handle;


    // Look 

    var temp = req.lectalTemp;
    var conditions = {};

    var exit = false;

    switch (temp.kind) {
        case 'user':
            conditions['post-conditions'] = {
                $and: [
                    {
                        dateCreated: {
                            $lt: new Date()
                        }
                    },
                    {
                        posterId: temp._id
                    }
                ]
            };
            break;
        case 'topic':
            conditions['post-conditions'] = {
                $and: [
                    {
                        dateCreated: {
                            $lt: new Date()
                        }
                    },
                    {
                        $and: [
                            {
                                'content.kind': 'topic'
                            },
                            {
                                'content.topicId': temp._id
                            }
                        ]
                    }
                ]
            };
            break;
        default:
            exit = true; //no conditions? can't play the game
    }

    if (exit) {
        return next(new Error('no handle case matched'));
    }

    async.parallel([function (cb) {

        if (req.user && String(req.user.username).toUpperCase() !== String(handle).toUpperCase()) {
            cb(null);
        }
        else {
            helpers.twitter.getTwitterFollowers({
                count: count,
                token: req.lectalAccessToken
            }, cb);
        }

    }, function (cb) {

        helpers.posts.getInitialPosts({
            conditions: conditions,
            token: req.lectalAccessToken
        }, cb);

    }], function complete(err, results) {

        var error = (err instanceof Error) ? err.stack : err;

        var posts = null;
        var remainingPosts = null;
        var twitterFollowers = null;

        if (!error) {

            twitterFollowers = results[0] || [];

            var postData = results[1] || {};
            posts = postData.posts;
            remainingPosts = postData.remainingPosts;

        }

        var timeRequired = (Date.now() - req.requestStart) + 'ms';

        log.debug('!!!!!!!!!!!!******isFollowing value:*******!!!!!!!!!!!', temp.isFollowing);

        res.render('profile.ejs', {
            data: JSON.stringify({
                timeRequired: timeRequired,
                error: error || null,
                user: helpers.user.simplifyUser(req.user),
                twitterFollowers: twitterFollowers || [],
                posts: posts || [],
                remainingPosts: remainingPosts || [],
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
