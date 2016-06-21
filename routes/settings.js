var express = require('express');
var router = express.Router();
var helpers =  require('./helpers');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');

router.get('/', Checks.isSetup, function (req, res) {
    res.render('settings.ejs', {
        data: JSON.stringify({
            user: helpers.user.simplifyUser(req.user),
            NODE_ENV: process.env.NODE_ENV,
            config: config.get('lectal_front_end_env')
        })
    });
});

module.exports = router;
