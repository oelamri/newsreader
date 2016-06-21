var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');

router.get('/', function(req, res, next) {
    req.logout();
    res.redirect('/');
});

module.exports = router;
