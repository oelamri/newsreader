/**
 * Created by amills001c on 11/24/15.
 */

//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var constants = config.get('lectal_constants');
var LINKEDIN_CONFIG = constants.linkedin;

var lectalEnv = config.get('lectal_env');
var serverUrl = lectalEnv.lectal_web_server.getUrl();
var authUrl = serverUrl + '/auth/connect/linkedin/callback';

//#core
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var base64url = require('base64url');
var passport = require('passport');

//#npm
const request = require('request');

//#ijson
var ijson = require('idempotent-json');

//#models
var User = require('../models/user');

//#middleware
var Checks = require('../middleware/checks');

//#services
var fileHandler = require('../services/file-handler');
var imageHandler = require('../services/image-handler');


//#linkedin
var Linkedin = require('node-linkedin')(LINKEDIN_CONFIG.clientId, LINKEDIN_CONFIG.clientSecret, authUrl);


///////////////////////////////////////////////////////////////////////////////////////////////////


//TODO: session to true or false?
// note: session: false is set so that we don't save session data in memory on the server
router.get('/twitter', passport.authenticate('twitter', {session: true}), function (req, res) {

});


router.get('/twitter/callback',
    passport.authenticate('twitter', {
        session: true,
        //successRedirect: '/setup',
        failureRedirect: '/'
    }),
    // callback is necessary
    function (req, res, next) {
        if (req.user.checks.isSetup) {
            res.redirect('/');  //TODO: redirect to the actually desired url instead of just root
        }
        else {
            res.redirect('/setup');  //TODO: redirect to the actually desired url instead of just root
        }
    });


/*// send to facebook to do the authentication
 router.get('/facebook', passport.authenticate('facebook', {scope: 'email'}));


 router.get('/facebook/callback', // handle the callback after facebook has authenticated the user
 passport.authenticate('facebook', {
 successRedirect: '/',
 failureRedirect: '/charlie1'
 }));*/


/*router.get('/linkedin', passport.authenticate('linkedin', {

 //state: base64url(JSON.stringify('test'))

 state: true
 }));*/

router.get('/connect/facebook/callback', Checks.isLoggedIn,
    passport.authorize('facebook', {
        //successRedirect: '/profile',
        failureRedirect: '/fail'
    }), function (req, res, next) {

        //return res.redirect('/profile');

        res.render('auto-close.ejs', {});
    });

router.get('/connect_facebook', passport.authorize('facebook', {
    scope: ['email', 'publish_actions']
}));


router.get('/fail', function (req, res, next) {

    res.render('auto-close-error.ejs');

});

router.get('/connect/linkedin/callback', Checks.isLoggedIn,

    passport.authorize('linkedin', {
        //successRedirect: '/profile',
        failureRedirect: '/auth/fail'
    }), function (req, res, next) {
        // Successful authentication, redirect home.
        //Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function (err, results) {
        //
        //    if (err) {
        //        log.error('linkedin err', err);
        //        res.render('auto-close-error.ejs', {});
        //    }
        //    else {
        //        /**
        //         * Results have something like:
        //         * {"expires_in":5184000,"access_token":". . . ."}
        //         */
        //
        //        log.error('linkedin success', results);
        //
        //        req.user.linkedin.access_token = results.access_token;
        //
        //        res.render('auto-close.ejs', {});
        //        //return res.redirect('/profile');
        //    }
        //});

        log.debug('LINKEDIN_CONFIG.clientId', LINKEDIN_CONFIG.clientId);
        log.debug('auth code', req.query.code);

        var user = req.user;

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
                res.render('auto-close.ejs', {});
            }
            else {
                //sample :  { _total: 1,
                // values: [ 'https://media.licdn.com/mpr/mprx/0_Pj_hSt2ROJbAFXE6Puuaa1KRJdvl5vE6tWjSwPGBApq-CN4erDG2dz86ZE2' ] }

                log.debug('linkedin body:', body);
                if (Array.isArray(body.values) && user.accounts.linkedin) {
                    user.accounts.linkedin.picture = body.values[0];
                    user.save(function (err) {
                        if (err) {
                            log.error(err);
                        }
                        res.render('auto-close.ejs', {});
                    });
                }
                else {
                    res.render('auto-close.ejs', {});
                }

            }

        });

        /* request.post({
         url: 'https://www.linkedin.com/uas/oauth2/accessToken',
         json: true,
         body: {
         client_id: LINKEDIN_CONFIG.clientId,
         client_secret: LINKEDIN_CONFIG.clientSecret,
         grant_type: 'authorization_code', //The value of this field should always be:  authorization_code
         code: req.query.code,
         redirect_uri: '/auth/connect/linkedin/callback'
         },
         qs: {
         client_id: LINKEDIN_CONFIG.clientId,
         client_secret: LINKEDIN_CONFIG.clientSecret,
         grant_type: 'authorization_code', //The value of this field should always be:  authorization_code
         code: req.query.code,
         redirect_uri: req.get('origin') + '/auth/connect/linkedin/callback'
         }
         }, function (err, resp, body) {
         if (err) {
         log.error('linkedin err', err);
         res.render('auto-close-error.ejs', {});
         }
         else {
         /!**
         * Results have something like:
         * {"expires_in":5184000,"access_token":". . . ."}
         *!/

         body = ijson.parse(body);

         log.error('linkedin success', body);

         req.user.linkedin.access_token = body.access_token;

         res.render('auto-close.ejs', {});
         //return res.redirect('/profile');
         }
         });*/
    });


router.get('/connect_linkedin', Checks.isLoggedIn,

    function (req, res, next) {
        next();  //for debugging
    },
    passport.authorize('linkedin', {
        //scope: 'r_basicprofile+w_share',
        scope: ['r_emailaddress', 'r_basicprofile', 'w_share'],
        state: 'abcdefg' //DCEeFWf45A53sdfKef424
    }),
    function (req, res, next) {

        //return res.redirect('/profile');

    });


router.get('/connect/local', function (req, res) {
    res.render('connect-local.ejs', {message: req.flash('loginMessage')});
});

router.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));


//router.get('/connect/twitter', passport.authorize('twitter', { scope : 'email' }));
//
//
//router.get('/connect/twitter/callback',
//    passport.authorize('twitter', {
//        successRedirect : '/profile',
//        failureRedirect : '/'
//    }));


/*router.get('/connect/linkedin/callback',
 passport.authorize('linkedin', {
 //successRedirect: '/profile',
 failureRedirect: '/login'
 }), function(req,res,next){
 // Successful authentication, redirect home.
 Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function (err, results) {

 if (err) {
 log.error(err);
 }
 else {
 /!**
 * Results have something like:
 * {"expires_in":5184000,"access_token":". . . ."}
 *!/

 log.debug('linkedin oauth2 results:',results);

 req.user.linkedin.access_token = results.access_token;

 return res.redirect('/');
 }
 });
 });*/


/*router.get('/linkedin/callback',
 passport.authenticate('linkedin', {failureRedirect: '/', state: true}),
 function (req, res) {
 // Successful authentication, redirect home.
 Linkedin.auth.getAccessToken(res, req.query.code, req.query.state, function (err, results) {

 if (err) {
 console.error(err);
 }
 else {
 /!**
 * Results have something like:
 * {"expires_in":5184000,"access_token":". . . ."}
 *!/

 req.user.linkedin.access_token = results.access_token;

 return res.redirect('/');
 }
 });
 });*/


router.get('/unlink/facebook', Checks.isLoggedIn, function (req, res) { //TODO should be isSetup
    var user = req.user;
    if (user.accounts.facebook && user.accounts.facebook.token) {
        user.accounts.facebook.token = null;
        user.save(function (err) {
            if (err) {
                log.error(err);
            }
            res.redirect('/profile'); //TODO: make redirect to user.username instead...?
        });
    }
    else {
        res.redirect('/profile'); //TODO: make redirect to user.username instead...?
    }
});


router.get('/unlink/linkedin', Checks.isLoggedIn, function (req, res) { //TODO should be isSetup
    var user = req.user;
    if(user.accounts.linkedin && user.accounts.linkedin.token){
        user.accounts.linkedin.token = null;
        user.save(function (err) {
            if(err){
                log.error(err);
            }
            res.redirect('/profile');
        });
    }
    else{
        res.redirect('/profile');
    }

});


router.get('/unlink/google', function (req, res) {
    var user = req.user;
    user.google.token = null;
    user.save(function (err) {
        res.redirect('/profile');
    });
});


module.exports = router;