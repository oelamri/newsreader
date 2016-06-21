var log = require('lectal-logger');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var passport = require('passport');
var http = require('http');
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var request = require('request');

var async = require('async');
var URL = require('url');
var Checks = require('../middleware/checks');
var Markers = require('../middleware/markers');
var User = require('../models/user');
var defaultHeader = require('../config/default-header');
var helpers = require('./helpers');



router.use('/frontpage', require('./frontpage'));
router.use('/', require('./frontpage'));
router.use('/logout', require('./logout'));
router.use('/login', require('./login'));
router.use('/login_local', require('./login_local'));
router.use('/draft', require('./draft'));
router.use('/settings', require('./settings')); // Need to be tested
router.use('/setup', require('./setup')); // Need to test POST
router.use('/notifications', require('./notifications'));
router.use('/invites', require('./invites'));
router.use('/newsfeed', require('./newsfeed'));
router.use('/profile', require('./profile'));
router.use('/:handle', require('./handle'));
router.use('/:handle/followers', require('./followers'));
router.use('/:handle/following', require('./following'));
router.use('/following', require('./following'));
router.use('/followers', require('./followers'));

// Test routes #begin

router.get('/hello', Checks.isLoggedIn, function (req, res) {
    res.render('index.ejs', {
        data: JSON.stringify({
            user: helpers.user.simplifyUser(req.user),
            NODE_ENV: process.env.NODE_ENV,
            config: config.get('lectal_front_end_env')
        })
    });
});

router.get('/test', function (req, res) {
    res.render('index.ejs', {
        data: JSON.stringify({
            user: helpers.user.simplifyUser(req.user),
            NODE_ENV: process.env.NODE_ENV,
            config: config.get('lectal_front_end_env')
        })
    });
});

// Test routes #end

module.exports = router;
