/**
 * Created by denman on 11/3/2015.
 */

//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module,'*lectal-web*', 'config/conf');

//#core
var express = require('express');
var router = express.Router();
var _ = require('underscore');
var async = require('async');
var url = require('url');
var request = require('request');


//#middleware
var Checks = require('../middleware/checks');


// this route is for live debugging
router.get('/', Checks.isAdmin, function (req, res, next) {


    var response = {};
    response['process.env.NODE_ENV'] = process.env.NODE_ENV;
    response['process.pid'] = process.pid;
    response['process.uptime'] = process.uptime();
    response['process.argv'] = process.argv;
    //response['nconf.all'] = nconf.get();
    response['process.config'] = process.config;
    response['process.env'] = process.env;

    //res.temp = {status: 200, data: response};
    //next();

    res.status(200).json({success: response})

});

module.exports = router;