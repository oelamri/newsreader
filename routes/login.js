var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');

router.get('/', function(req, res) {
    if(req.isAuthenticated()) {
        if(req.user.checks.isSetup) {
            res.redirect('/');
        } else {
            res.redirect('/setup');
        }
    } else {
        res.redirect('/auth/twitter');
    }
});

module.exports = router;
