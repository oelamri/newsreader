//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var webServerConfig = config.get('lectal_env').lectal_web_server;
var apiServerConfig = config.get('lectal_env').lectal_api_server;
var apiServerBaseUrl = apiServerConfig.getUrl();


//#core
var _ = require('underscore');
var request = require('request');

//#project
var caches = require('../../caches');

var handleFormat = /^[A-Za-z0-9_]{1,25}$/;

function sanitizeHandle(handle) {
    return handleFormat.test(handle);
}


function isHashtagOrUsername(req, res, next) {

    var handle = req.params.handle;

    request.get({
        url: apiServerBaseUrl + '/v1/misc/is_topic_or_user/' + handle,
        headers: _.extend({}, {
            'x-lectal-authorization': req.lectalAccessToken
        }),
        qs: {}
    }, function (err, response, body) {

        if (err) {
            next(new Error('Error fetching user/topic info: \n' + err.stack));
        }
        else {

            try {
                body = JSON.parse(body);
            }
            catch (err) {
                console.error(err);
                return next(err);
            }

            var msg;
            var exit = false;
            var temp = req.lectalTemp = {};

            if (msg = body.success) {

                temp.counts = {
                    posts: msg.postCount || 0,
                    followers: msg.followerCount || 0,
                    following: msg.followingCount || 0
                };

                switch (msg.kind) {

                    case 'user':
                        temp.kind = 'user';
                        temp.collection = 'users';
                        temp._id = msg.model._id;
                        temp.name = msg.model.fullname;
                        temp.picture = msg.model.picture;
                        temp.isFollowing = msg.isFollowing;
                        break;

                    case 'topic':
                        temp.kind = 'topic';
                        temp.collection = 'topics';
                        temp._id = msg.model._id;
                        temp.name = msg.model.name;
                        temp.picture = msg.model.picture;
                        temp.isFollowing = msg.isFollowing;
                        break;

                    default:
                        exit = true;
                }

                if (exit) {
                    return next(new Error('bad data from API server'));
                }
                else {
                    next();
                }
            }
            else if (msg = body.error) {
                next(new Error(JSON.stringify(msg)));
            }
            else {
                next(new Error('bad response from API server'));
            }
        }
    });
}

function filterHandles(req, res, next) {

    var handle = String(req.params.handle).toLowerCase();

    var blacklistedHandles = caches.blacklistedHandles.value;  //need to re-evaluate this because it will get updated during runtime

    if (_.contains(blacklistedHandles, handle)) {
        log.info('handle is blacklisted:', handle, 'ignoring this route request');
        next(new Error('handle is blacklisted:' + handle));
        //now do nothing, request has probably already been sent back anyway
    }
    else if (!sanitizeHandle(handle)) {
        log.warn('handle had unexpected characters:', handle);
        next(new Error('handle had unexpected characters - ' + handle));
    }
    else {
        log.debug('handle is being processed:', handle);
        next();
    }

}

module.exports = {
    filterHandles: filterHandles,
    isHashtagOrUsername: isHashtagOrUsername,
    sanitizeHandle: sanitizeHandle
};