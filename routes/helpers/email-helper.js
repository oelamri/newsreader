
//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var webServerConfig = config.get('lectal_env').lectal_web_server;
var apiServerConfig = config.get('lectal_env').lectal_api_server;
var apiServerBaseUrl = apiServerConfig.getUrl();

//#core
var request = require('request');
var ijson = require('idempotent-json');


function postVerificationEmail(data) {

    var email = data.email;
    var token = data.token;


    log.debug({'email being posted to API server:': email});

    request.post({
        json: true,
        headers: {
            'content-type': 'application/json',
            'x-lectal-authorization': token
        },
        url: apiServerBaseUrl + '/v1/verify',
        body: {
            email: email
        }
    }, function (err, response, body) {

        if (err) {
            log.error({'verification email had an error': err.stack});
            return;
        }

        body = ijson.parse(body);

        if (msg = body.success) {
            log.debug({'verification email was successfully sent': email});
        }
        else if (msg = body.error) {
            log.warn({'verification email was *not* successfully sent:': email});
        }
        else {
            log.error({'unexpected API response when sending this email for verification:': email});
        }

    });
}

module.exports = {
    postVerificationEmail: postVerificationEmail
};