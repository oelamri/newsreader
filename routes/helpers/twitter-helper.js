//#logging
var logger = require('lectal-logger');

//#config
var config = require('univ-config')(module,'*lectal-web*', 'config/conf');
var webServerConfig = config.get('lectal_env').lectal_web_server;
var apiServerConfig = config.get('lectal_env').lectal_api_server;
var apiServerBaseUrl = apiServerConfig.getUrl();


//#core
var _ = require('underscore');
var request = require('request');
var ijson = require('idempotent-json');
var async = require('async');


function getTwitterFriends(data, cb) {

    var lectalAccessToken = data.token;

    request.get({
        url: apiServerBaseUrl + '/v1/twitter/friends_list_cursor',
        headers: _.extend({}, {
            'x-lectal-authorization': lectalAccessToken || null
        }),
        qs: {
            data: JSON.stringify({
                cursorNum: 1
            })
        }
    }, function (err, response, body) {

        if (err) {
            cb(new Error('Error fetching Twitter friends: ' + err));
        }
        else {

            try {
                body = JSON.parse(body);
            }
            catch (err) {
                console.error('error parsing body: ', body);
                return cb(err);
            }

            var msg;

            if (msg = body.success) {
                cb(null, msg);
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


function getTwitterFollowers(data, cb) {

    var lectalAccessToken = data.token;

    request.get({
        url: apiServerBaseUrl + '/v1/twitter/followers_list_cursor',
        headers: _.extend({}, {
            'x-lectal-authorization': lectalAccessToken || null
        }),
        qs: {
            data: JSON.stringify({
                cursorNum: 1
            })
        }
    }, function (err, response, body) {

        if (err) {
            cb(new Error('Error fetching Twitter followers: ' + err));
        }
        else {

            try {
                body = JSON.parse(body);
            }
            catch (err) {
                console.error('error parsing body: ', body);
                return cb(err);
            }

            var msg;

            if (msg = body.success) {
                cb(null, msg);
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
    getTwitterFriends: getTwitterFriends,
    getTwitterFollowers: getTwitterFollowers
};