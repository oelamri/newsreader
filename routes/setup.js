var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');
var request = require('request');
var async = require('async');
var webServerConfig = config.get('lectal_env').lectal_web_server;
var webServerBaseUrl = webServerConfig.getLectalUrl();
var apiServerConfig = config.get('lectal_env').lectal_api_server;
var apiServerBaseUrl = apiServerConfig.getUrl();
// TO REMOVE
var ijson = require('idempotent-json');
var log = require('lectal-logger');



router.get('/', Checks.isLoggedIn, function (req, res) {
    const user = req.user;

    if (req.user.checks.isSetup) {
        res.redirect('/');
    }
    else {
        var twitterUsernameIsTaken = false;
        async.parallel([
            function checkIfUsernameExists(cb) {
                if (!user.accounts || !user.accounts.twitter || !user.accounts.twitter.username) {
                    log.error('Twitter.username not defined for user', user);
                    cb(null);
                }
                else {
                    request.get({
                        url: apiServerBaseUrl + '/v1/misc/does_handle_exist/' + user.accounts.twitter.username,
                        json: true,
                        headers: {
                            'content-type': 'application/json',
                            'x-lectal-authorization': req.lectalAccessToken || null
                        }
                    }, function (err, response, body) {
                        if (err) {
                            log.error(err.stack);
                            cb(null);
                        }
                        else {
                            body = ijson.parse(body);
                            if (body.error) {
                                log.error(body);
                                cb(null);
                            }
                            else if (body.success) {
                                if (!body.success.handleIsAvailable) {
                                    log.warn('username is taken for user', user, 'username/handle =>', user.twitter.username);
                                    twitterUsernameIsTaken = true;
                                }
                                cb(null);
                            }
                            else {
                                err = new Error('unexpected API response');
                                log.error(err);
                                cb(null);
                            }
                        }
                    });
                }

            }

        ], function complete(err, results) {

            var error = (err instanceof Error) ? err.stack : err;

            var timeRequired = (Date.now() - req.requestStart) + 'ms';

            log.debug('twitterUsernameIsTaken:', twitterUsernameIsTaken);

            res.render('index.ejs', {
                data: JSON.stringify({
                    timeRequired: timeRequired,
                    error: error,
                    twitterUsernameIsTaken: twitterUsernameIsTaken,
                    user: helpers.user.simplifyUser(req.user),
                    NODE_ENV: process.env.NODE_ENV,
                    config: config.get('lectal_front_end_env')
                })
            });
        });
    }
});


router.post('/', Checks.isLoggedIn, function (req, res, next) {

    req.setupErrorMessages = [];
    req.setupInternalErrors = [];

    var body = req.body;
    var email = String(body.email);
    var fullname = String(body.fullname);
    var username = String(body.username);

    var user = req.user;
    user.fullname = fullname;
    user.passwordPreHash = String(body.password); // note: passwordPreHash is temporary property on the user model, that *doesn't* get saved to DB
    user.picture = user.picture || {};


    if (!email) { //we cant set this property until we verify email is available
        req.setupErrorMessages.push('no email sent to web server');
    }

    if (!username) {  //we cant set this property until we verify username/handle is available
        req.setupErrorMessages.push('no username sent to web server');
    }

    if (!user.fullname) {
        req.setupErrorMessages.push('no fullname sent to web server');
    }

    if (!user.passwordPreHash) {
        req.setupErrorMessages.push('no password sent to web server');
    }

    var imgUrl = String(body.originalImgUrlPlaceholder);

    var $err = null;
    try {
        imgUrl = URL.parse(imgUrl);
    }
    catch (err) {
        $err = err;
    }
    finally {
        if ($err || req.setupErrorMessages.length > 0) {
            return res.render('index.ejs', {
                data: JSON.stringify({
                    errors: ['Bad image url'],
                    messages: ['Bad image url'],
                    user: helpers.user.simplifyUser(req.user),
                    NODE_ENV: process.env.NODE_ENV,
                    config: config.get('lectal_front_end_env')
                })
            });
        }
    }

    imgUrl = imgUrl.href;

    async.parallel([

            function getUrlsFromCloudinary(cb) {

                //if the user selects a new image, then we need to try again
                if (String(imgUrl) === String(user.picture.original) && user.picture.large && user.picture.medium && user.picture.square) {
                    log.info({msg: 'user already saved this image, so no need to do it again.'});
                    cb(null);
                }
                else {

                    log.info({msg: 'url provided in setup to cloudinary:' + imgUrl});

                    helpers.cloudinary.uploadImageViaURL(imgUrl, function (err, result) {
                        if (err) {
                            log.error(err);
                            req.setupInternalErrors.push(err.message);
                            cb(null);
                        }
                        else if (result) {
                            //TODO should we overwrite the picture that Twitter provides?
                            user.picture.original = imgUrl;
                            user.picture.large = result.large;
                            user.picture.medium = result.medium;
                            //user.picture.square = result.square; //TODO: no square?
                            cb(null);
                        }
                        else {
                            err = new Error('Unexpected API response via Cloudinary').stack;
                            log.error(err);
                            req.setupInternalErrors.push(err.message);
                            cb(null);
                        }
                    });
                }

            },
            function attemptToInsertNewEmailAddress(cb) { //we might be able to remove this call given the call to insert new handle

                if (user.email && String(user.email) === String(email)) {
                    //note: we don't want to reattempt an insert if the user model already has a username because it will fail and give us a false negative
                    cb(null);
                }
                else {
                    request.post({
                        url: apiServerBaseUrl + '/v1/emails/insert_email',
                        json: true,
                        headers: {
                            'content-type': 'application/json',
                            'x-lectal-authorization': req.lectalAccessToken || null
                        },
                        body: {
                            email: email,
                            userId: user._id
                        }
                    }, function (err, response, body) {
                        if (err) {
                            log.error(err.stack);
                            req.setupInternalErrors.push(err.message);
                            cb(null);
                        }
                        else {
                            body = ijson.parse(body);
                            if (body.error) {
                                log.error(body.error);
                                req.setupErrorMessages.push('That email address is already in use.');
                                cb(null);
                            }
                            else if (body.success) {
                                user.email = email;
                                cb(null);
                            }
                            else {
                                err = new Error('unexpected API response');
                                log.error(err);
                                req.setupInternalErrors.push(err.message);
                                cb(null);
                            }
                        }
                    });
                }

            },

            function attemptToInsertNewHandle(cb) {

                if (user.username && String(user.username).toLowerCase() === String(username).toLowerCase()) {
                    //we don't want to reattempt an insert if the user model already has a username because it will fail and give us a false negative
                    cb(null);
                }
                else {
                    request.post({
                        url: apiServerBaseUrl + '/v1/handle/insert_handle',
                        json: true,
                        headers: {
                            'content-type': 'application/json',
                            'x-lectal-authorization': req.lectalAccessToken || null
                        },
                        body: {
                            handle: username,
                            kind: 'user'
                        }
                    }, function (err, response, body) {
                        if (err) {
                            log.error(err);
                            req.setupInternalErrors.push(err.message);
                            cb(null);
                        }
                        else {
                            body = ijson.parse(body);
                            if (body.error) {
                                log.error(body.error);
                                req.setupErrorMessages.push('That username is already taken.');
                                cb(null);
                            }
                            else if (body.success) {
                                user.username = username;
                                cb(null);
                            }
                            else {
                                err = new Error('unexpected API response');
                                log.error(err);
                                req.setupInternalErrors.push(err.message);
                                cb(null);
                            }
                        }
                    });
                }
            }

        ],
        function complete(err, results) {

            if (err) {
                log.error('Fix this ASAP part 1:' + err.stack);
            }

            var errors = (results || []).filter(function (result) {
                return result;  //there should be no results, so each item should be undefined/null
            });

            if (errors.length > 0) {
                log.error('Fix this ASAP part 2:' + err.stack);
            }

            var isSetup = true;
            if (req.setupInternalErrors.length > 0 || req.setupErrorMessages.length > 0) {
                isSetup = false;
            }

            //NOTE: we always attempt to save user, even if there is an error, then when they retry, we won't retry for cloudinary or reinsert handle/email
            async.parallel([
                function (cb) {
                    user.checks.isSetup = isSetup;
                    user.save(function (err) {
                        cb(err);
                    });
                }
            ], function complete(err, results) {

                if (err) {
                    log.error(err);
                    req.setupInternalErrors.push(err.message);
                }

                if (req.setupInternalErrors.length > 0 || req.setupErrorMessages.length > 0) {

                    log.warn({setupInternalErrors: req.setupInternalErrors});
                    log.warn({setupErrorMessages: req.setupErrorMessages});

                    res.render('index.ejs', {
                        data: JSON.stringify({
                            errors: req.setupInternalErrors,
                            messages: req.setupErrorMessages,
                            user: helpers.user.simplifyUser(req.user),
                            NODE_ENV: process.env.NODE_ENV,
                            config: config.get('lectal_front_end_env')
                        })
                    });

                }
                else {
                    setImmediate(function () { // http response should be sent back before sending the email, no need to wait
                        helpers.email.postVerificationEmail({
                            email: user.email,
                            token: req.lectalAccessToken || null
                        });
                    });

                    res.redirect(webServerBaseUrl);
                }

            });
        }
    );
});

module.exports = router;
