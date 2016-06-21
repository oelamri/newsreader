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


function getInitialPosts(data, cb) {

    var count = data.count;
    var conditions = data.conditions;
    var lectalAccessToken = data.token;

    request.get({
        url: apiServerBaseUrl + '/v1/posts/initial_set',
        headers: _.extend({}, {
            'x-lectal-authorization': lectalAccessToken || null
        }),
        json: true,
        qs: {
            data: JSON.stringify({
                count: count,
                conditions: conditions
            })
        }
    }, function (err, response, body) {

        if (err) {
            return cb(err);
        }
        else {

            var msg;

            if (msg = body.success) {

                var filteredOutPosts = [];

                var posts = msg.posts;

                log.debug('# posts count *before* filter:', posts.length);

                posts = (posts || []).filter(function (post) {
                    if (post /*&& post.url*/ && post.picture && post.thumbnail && post.poster && post.poster.picture) { //note: don't remove - this ensures absolutely no errors in rendering
                        return true;
                    }
                    filteredOutPosts.push(post);
                });

                log.debug('# posts count *after* filter:', posts.length);
                log.debug('posts that were filterout:', JSON.stringify(filteredOutPosts));

                cb(null, {
                    posts: posts,
                    remainingPosts: msg.remainingPosts
                });
            }
            else if (msg = body.error) {
                cb(new Error(JSON.stringify(msg)));
            }
            else {
                cb(new Error('API server problem'));
            }
        }
    });
}


module.exports = {
    getInitialPosts: getInitialPosts
};