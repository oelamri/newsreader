//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module,'*lectal-web*', 'config/conf');
var authConstants = require('../config/auth-constants');

//#core
var jwt = require('jwt-simple');

//#models
var User = require('../models/user');



module.exports = function lectalWebAuth(data, cb) {

    var token = data.cookie;
    var auth;

    if (!token) {
        return cb(null, authConstants.NO_TOKEN_PRESENT);
    }
    else {

        try {
            auth = jwt.decode(token, 'cantona07+');
        }
        catch (err) {
            return cb(err);
        }

        if (typeof auth === 'object') {

            var userId = auth.userId;
            var expiresOn = String(auth.expiresOn);
            var expiredDate;

            try {
                expiredDate = Date.parse(expiresOn);
            }
            catch (err) {
                return cb(err);
            }

            if (new Date() > expiredDate) {
                //req.lectalAccessTokenIsExpired = true;
                //next(); //let the request go through, but there will be no logged in user
                cb(null, authConstants.TOKEN_EXPIRED);
            }
            else if (!userId) {
                cb(null, authConstants.BAD_TOKEN_MISSING_USERID);
            }
            else {

                if(userId === 'beach'){
                    cb(null, authConstants.BEACH_USER);
                }
                else{
                    User.findOne({
                        _id: userId
                    }, function (err, model) {
                        if (err) {
                            cb(err);
                        }
                        else if (model) {
                            cb(null, authConstants.JWT_TOKEN_SUCCESS, model);
                        }
                        else {
                            log.warn('warning in app middleware: no registered user model with userId=' + userId);
                            cb(null, authConstants.NO_USER_WITH_GIVEN_ID);
                        }
                    });
                }
            }

        }
        else {
            cb(null, authConstants.BAD_TOKEN_NOT_AN_OBJECT);
        }

    }

};