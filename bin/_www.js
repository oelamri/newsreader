//#logging
var log = require('lectal-logger');

process.on('uncaughtException', function handleUncaughtException(err) {

    if (log) {
        log.error({'uncaughtException': err.stack});
        console.error(err.stack);
    }
    else {
        console.error(err.stack);
    }

    if (process.env.NODE_ENV === 'production') {
    }
    else {
        throw err;
    }
});

process.on('exit', function exitHook(code) {

    if (log) {
        log.info({'exiting with code': code});
    }
    else {
        console.log('exiting with code', code, '...');
    }
});



log.info('Lectal-Web runtime NODE_ENV:', process.env.NODE_ENV);
var _ = require('underscore');
var async = require('async');
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var serverConfig = config.get('lectal_env').lectal_web_server;
var apiServerConfig = config.get('lectal_env').lectal_api_server;
var oplogServerConfig = config.get('lectal_env').lectal_oplog_server;

var blacklistedRoutes = require('../lib/find-blacklist-handles');


async.series([

    function (cb) {

        var db = require('../db/mongo');

        cb = _.once(cb);

        db.once('error', function (err) {
            cb(err);
        });

        db.once('open', function (msg) {
            cb(null, msg);
        });

    },

    function (cb) {

        async.parallel([
            function (cb) {

                cb = _.once(cb);

                var to = setTimeout(function () {
                    log.debug('Socket connection to oplog server timed out - we may not be connected to the oplog server.');
                    cb(null);
                }, 2000);

                var socketClient = require('../socket-client/client').getClient(oplogServerConfig);

                socketClient.once('connect', function () {
                    clearTimeout(to);
                    log.debug('Socket client connection made to Oplog server.');
                    cb(null);
                });
                socketClient.once('connect_error', function (err) {
                    clearTimeout(to);
                    log.debug('Socket client to Oplog server connection error: ' + err.stack);
                    cb(null);
                });

            },
            function (cb) {

                cb = _.once(cb);

                var to = setTimeout(function () {
                    log.debug('Operation timed-out - Could not retrieve blacklisted route names from API server.');
                    cb(null);
                }, 2000);

                //pull in blacklisted routes which will be supplied by socket events for the remainder of the time this server is live
                blacklistedRoutes({}, function (err) {
                    clearTimeout(to);
                    if (err) {
                        log.trace(err);
                    }
                    cb(null);
                });
            },
            function (cb) {

                var models = require('../models');

                async.each(Object.keys(models), function (key, cb) {
                    var Model = models[key];
                    Model.ensureIndexes(function (err) {
                        cb(err);
                    });
                }, function complete(err) {
                    cb(err);
                });

            }

        ], function complete(err) {
            cb(err);
        });
    }
],
function complete(err) {
    if (err) {
        throw err;
    }
    else {

        var app = require('../app');
        app.set('port', serverConfig.port);

        var server = require('../server/http-server').getServer(app);

        server.once('listening', function () {
            require('../lib/socket-client-events');
            log.info('Web server listening on port: ' + app.get('port'));
        });

        server.once('error', function (err) {
            log.error('Web server experienced error ' + err.stack);
        });
    }
});


