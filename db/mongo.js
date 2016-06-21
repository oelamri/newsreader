//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var constants = config.get('lectal_constants');
var lectalEnv = config.get('lectal_env');
var mongoDBUrl = lectalEnv.mongodb_url;

//#core
var mongoose = require('mongoose');

var db = mongoose.connection;

mongoose.connect(mongoDBUrl, function (err) {
    if (err) {
        console.error(err);
        throw err;
    }
});

if (process.env.NODE_ENV !== 'production') {
    mongoose.set('debug', function (coll, method, query, doc) {
        log.debug('query executed:', coll, method, query, doc);
    });
}


db.once('open', function () {
    log.info('mongodb connected.');
});


module.exports = db;