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


function getNotifications(data, cb) {

    var userId = data._id;
    var lectalAccessToken = data.token;

    request.get({
        url: apiServerBaseUrl + '/v1/users/by_id/' + userId + '/notifications/next_set',
        headers: _.extend({}, {
            'x-lectal-authorization': lectalAccessToken || null
        }),
        qs: {
            data: JSON.stringify({
                count: 30
            })
        }
    }, function (err, response, body) {

        if (err) {
            cb(new Error('Error fetching notifs: ' + err));
        }
        else {

            try {
                body = JSON.parse(body);
            }
            catch (err) {
                console.error('error parsing body: ', body);
                return cb(err);
            }

            if (body.success) {
                cb(null, body.success.notifications || []);
            }
            else if (body.error) {
                log.error({'body.error:': body.error});
                cb(new Error(body.error));
            }
            else {
                cb(new Error('API config error'));
            }
        }
    });
}


module.exports = {
    getNotifications: getNotifications
};
