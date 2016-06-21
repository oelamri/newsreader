//#config
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var redisConfig = config.get('lectal_env').redis_server;
var Redis = require('ioredis');


//logging
var log = require('lectal-logger');

const RateLimiter = require('curtain');


var rlm = new RateLimiter({
    redis: {
        host: redisConfig.host,
        port: redisConfig.port,
        password: redisConfig.password
    }
});


module.exports = rlm;