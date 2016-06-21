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
var ijson = require('idempotent-json');

//#caches
var caches = require('../caches');


module.exports = function (data, cb) {

    request.get({
        url: apiServerBaseUrl + '/v1/handle/blacklisted',
        json: true,
        headers: {
            'content-type': 'application/json'
        }
    }, function (err, response, body) {
        if (err) {
            log.error(err);
            cb(err);
        }
        else {
            body = ijson.parse(body);
            var msg;
            if (msg = body.error) {
                log.error(msg);
                cb(msg);
            }
            else if (msg = body.success) {
                caches.blacklistedHandles.setValue(_.map(msg || [], function (handleObj) {
                    return handleObj.handle;
                }));  //set handles to models sent back from request
                cb(null);
            }
            else {
                cb(new Error('bad API response'));
            }
        }
    });

};

