var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');
var request = require('request');
var async = require('async');
var log = require('lectal-logger');

router.get('/', function(req, res) {
    var user = req.user;

    async.parallel([
        function getLatestFacebookData(cb) {
            if (!user.accounts.facebook || !user.accounts.facebook.id) {
                cb(null);
            }
            else {
                request.get({
                    url: 'https://graph.facebook.com/v2.5/' + user.accounts.facebook.id,
                    json: true,
                    qs: {
                        access_token: user.accounts.facebook.token
                    }
                }, function (err, resp, body) {

                    if (err) {
                        log.error(err);
                        cb(null);
                    }
                    else {
                        log.debug('facebook body:', body);
                        cb(null, body);
                    }
                });
            }
        },
        function getLatestLinkedInData(cb) {
            if (!user.accounts.linkedin || !user.accounts.linkedin.id) {
                cb(null);
            }
            else {
                request.get({
                    url: 'https://api.linkedin.com/v1/people/id=' + user.accounts.linkedin.id,
                    json: true,
                    qs: {
                        format: 'json'
                    },
                    headers: {
                        Authorization: 'Bearer ' + user.accounts.linkedin.token
                    }
                }, function (err, resp, body) {

                    if (err) {
                        log.error(err);
                        cb(null);
                    }
                    else {
                        log.debug('linkedin body:', body);
                        cb(null, body);
                    }
                });
            }
        },
        function getLatestPicture(cb) {
            if (!user.accounts.linkedin || !user.accounts.linkedin.id) {
                cb(null);
            }
            else {
                request.get({
                    url: 'https://api.linkedin.com/v1/people/' + user.accounts.linkedin.id + '/picture-urls::(original)',
                    json: true,
                    headers: {
                        Authorization: 'Bearer ' + user.accounts.linkedin.token
                    },
                    qs: {
                        format: 'json'
                    }
                }, function (err, resp, body) {
                    if (err) {
                        log.error(err);
                        cb(null);
                    }
                    else {
                        //sample :  { _total: 1,
                        // values: [ 'https://media.licdn.com/mpr/mprx/0_Pj_hSt2ROJbAFXE6Puuaa1KRJdvl5vE6tWjSwPGBApq-CN4erDG2dz86ZE2' ] }

                        log.debug('linkedin body:', body);
                        if (Array.isArray(body.values) && user.accounts.linkedin) {
                            user.accounts.linkedin.picture = body.values[0];
                        }
                        cb(null, body);
                    }

                });
            }

        }
    ], function complete(err, results) {

        var errors = [err];

        user.save(function (err) {
            if (err) {
                log.error(err);
            }
            res.render('index.ejs', {
                data: JSON.stringify({
                    errors: errors,
                    user: helpers.user.simplifyUser(req.user),
                    NODE_ENV: process.env.NODE_ENV,
                    config: config.get('lectal_front_end_env')
                })
            });
        });
    });
});

module.exports = router;
