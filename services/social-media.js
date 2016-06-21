//NOT BEING USED
var logger = require('lectal-logger');
var config = require('univ-config')(module,'*lectal-web*', 'config/conf');
var constants = config.get('lectal_constants');
var fb = require('fb');
var Twit = require('twit');
var twitterConfig = constants.twitter;
var twitterToken = constants.twitter_token;


function makeTwit(oauthDetails) {
    return new Twit({
        consumer_key: twitterConfig.appId,
        consumer_secret: twitterConfig.appSecret,
        access_token: oauthDetails.token,
        access_token_secret: oauthDetails.secret
    });
}


module.exports = {
    postToService: function (service, user, post, cb) {
        switch ((service || '').toLowerCase()) {
            case 'facebook':
                return module.exports.postToFacebook(user, post, cb);
            case 'twitter':
                return module.exports.postToTwitter(user, post, cb);
        }

        cb(new Error('Unhandled service: ' + service));
    },

    postToFacebook: function (user, post, cb) {
        if (!user.accounts.facebook.token) {
            return cb(new Error('Not authenticated with Facebook.'));
        }

        fb.api('/me/feed', 'POST', {
            access_token: user.accounts.facebook.token,
            message: post.string
        }, function (res) {
            if (!res || res.error_msg) {
                return cb(res && res.error_msg || new Error());
            }
            cb(null, res);
        });
    },

    postToTwitter: function (user, post, cb) {
        logger.debug('POST TO TWITTER POST:', post);

        if (!(user.twitter && user.twitter.token)) {
            cb(new Error('Not authenticated with Twitter.'));
        }
        else {
            makeTwit(user.twitter).post('statuses/update', {status: [post.string, post.link].join(' ')}, function (err, data) {
                if (err) {
                    return cb(err);
                }
                cb(null, data);
            });
        }
    },

    postToLectalTwitter: function (post, cb) {
        var statusMessage = [post.string, post.shortUrl].join(' ');

        makeTwit(twitterToken).post('statuses/update', {status: statusMessage}, function (err, data) {
            if (err) {
                return cb(err);
            }
            cb(null, data);
        });
    }
};