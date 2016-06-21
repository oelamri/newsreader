var express = require('express');
var router = express.Router();
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var Checks = require('../middleware/checks');

router.get('/', Checks.isSetup, function (req, res, next) {

    if (req.user) {
        res.redirect('/' + req.user.username);
    }
    else {
        res.redirect('/login');
    }
});

module.exports = router;
