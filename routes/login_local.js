var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var passport = require('passport');

router.get('/', function(req, res) {
    if (req.isAuthenticated()) {
        if (req.user.checks.isSetup) {
            res.redirect('/');
        }
        else {
            res.redirect('/setup');
        }
    }
    else {

        //note: https://gist.github.com/brianmacarthur/a4e3e0093d368aa8e423
        res.locals.sessionFlash = req.session.sessionFlash;
        delete req.session.sessionFlash;

        res.render('login.ejs', {
            data: JSON.stringify({
                _session_Flash: req.session.sessionFlash || {no: 'value'},
                NODE_ENV: process.env.NODE_ENV,
                config: config.get('lectal_front_end_env')
            })
        });
    }
});

router.post('/', 
    function(req, res, next) {
        req.flash('signupMessage', 'choco');
        next();
    },
    passport.authenticate('local-login', {
        session: true, //TODO: check this value
        successRedirect: '/', // redirect to the secure profile section
        failureRedirect: '/login_local', // redirect back to the signup page if there is an error
        failureFlash: 'Invalid username or password.'  // allow flash messages
    }),
    function (req, res, next) {
        
});

module.exports = router;
