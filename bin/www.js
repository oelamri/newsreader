//#core
var cluster = require('cluster');
var http = require('http');
var numCPUs = require('os').cpus().length;
var async = require('async');
var colors = require('colors/safe');
var _ = require('underscore');


//#core
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');

//#logging
var log = require('lectal-logger');

var blacklistedRoutes = require('../lib/find-blacklist-handles');


if (cluster.isMaster) {

    log.info({'Runtime NODE_ENV:': process.env.NODE_ENV});

    process.on('uncaughtException', function handleUncaughtException(err) {
        if (log) {
            log.error({uncaughtException: err.stack});
        }
        else {
            console.error('uncaughtException:', err.stack);
        }

        if (process.env.NODE_ENV === 'production') {
        }
        else {
            throw err; //this should crash the server
        }
    });

    process.on('exit', function exitHook(code) {

        log.info({'exiting with code': code});

    });

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker, code, signal) {
        log.warn('worker ' + worker.process.pid + ' died');
    });

}
else {


    process.on('uncaughtException', function handleUncaughtException(err) {

        if (log) {
            log.error({uncaughtException: err.stack});
        }
        else {
            console.error('uncaughtException:', err.stack);
        }

        if (process.env.NODE_ENV === 'production') {
        }
        else {
            throw err; //this should crash the server
        }
    });

    process.on('exit', function exitHook(code) {

        log.warn({'worker is exiting with code': code});

    });


    //TODO: add ensure indexes check to this
    async.series([

            function (cb) {

                var db = require('../db/mongo');

                cb = _.once(cb);

                db.on('error', function (err) {
                    cb(err);
                });

                db.on('open', function (msg) {
                    cb(null, msg);
                });

            },

            function (cb) {

                async.parallel([
                    function (cb) {
                        //pick up blacklisted routes from API
                        blacklistedRoutes({}, function (err) {
                            cb(err);
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
                log.error(err.stack);
                throw err;
            }
            else {
                log.info('blacklisted routes:', blacklistedRoutes.blacklistedHandles);
                var serverConfig = config.get('lectal_env').lectal_web_server;
                var app = require('../app');
                app.listen(serverConfig.port, function (err) {

                    if (err) {
                        console.error(err);
                    }
                    else {
                        console.log('Listening on port ' + serverConfig.port);
                    }
                });
            }
        });


}