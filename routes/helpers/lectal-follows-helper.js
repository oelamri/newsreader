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


function getLectalFollowers(data, cb) {

    var lectalAccessToken = data.token;
    var collection = data.collection;
    var handleId = data.handleId;
    var user = data.user;

    //TODO: followers will always be users, not topics so, maybe degenerify

    request.get({
        url: apiServerBaseUrl + '/v1/' + collection + '/by_id/' + handleId + '/props/followers',
        headers: _.extend({}, {
            'x-lectal-authorization': lectalAccessToken
        }),
        json: true,
        qs: {}
    }, function (err, response, body) {

        if (err) {
            log.error('Error fetching followers:', err);
            cb(err);
        }
        else {

            var msg;

            if (msg = body.success) {

                var follows = msg.follows || [];

                log.debug({'# follows count *before* filter:': follows.length});

                follows = follows.filter(function (follow) {
                    return follow; //note: don't remove - this ensures absolutely no errors in rendering
                });


                log.debug({'# follows count *after* filter:': follows.length});

                cb(null, follows);
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

function getLectalFollowing(data, cb) {

    var lectalAccessToken = data.token;
    var collection = data.collection;
    var handleId = data.handleId;
    var user = data.user;

    request.get({
        url: apiServerBaseUrl + '/v1/' + collection + '/by_id/' + handleId + '/props/following',
        headers: _.extend({}, {
            'x-lectal-authorization': lectalAccessToken || null
        }),
        json: true,
        qs: {}
    }, function (err, response, body) {

        if (err) {
            log.error('Error fetching lectal friends: ' + err);
            cb(err);
        }
        else {

            var msg;

            if (msg = body.success) {

                var follows = msg.follows || [];

                log.debug({'# follows count *before* filter:': follows.length});

                follows = follows.filter(function (follow) {
                    return follow; //note: don't remove - this ensures absolutely no errors in rendering
                });
);
                //}

                log.debug({'# follows count *after* filter:': follows.length});

                cb(null, follows);

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

    getLectalFollowing: getLectalFollowing,
    getLectalFollowers: getLectalFollowers

};
