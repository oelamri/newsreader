var log = require('lectal-logger');


function mapUser(user){

    var $user = {};

    if (user) {

        user = user.toJSON();

        Object.keys(user).map(function (key) {
            switch (key) {
                case 'notifications':
                    $user['notifications'] = user['notifications'].length;
                    break;
                case 'following':
                    $user['following'] = user['following'].length;
                    break;
                case 'followers':
                    $user['followers'] = user['followers'].length;
                    break;
                default:
                    $user[key] = user[key];
            }
        });
    }
    else{
        $user = null;
    }

    return $user;
}


module.exports = function logRequestInfo(req, res, next) {


    log.debug('\n\n\n');
    log.debug('New request:');
    log.debug('_______________________________________________________________');
    log.debug('req.method:', req.method);
    log.debug('req.originalUrl:', req.originalUrl);
    log.debug('req.path:', req.path);
    log.debug('req.BODY:', req.body);
    log.debug('req.user:', mapUser(req.user));
    log.debug('req.headers:', req.headers);
    log.debug('req.params:', req.params);
    log.debug('req.query:', req.query);
    log.debug('req.secret:', req.secret);
    log.debug('req.session:', req.session);
    log.debug('req.session.id:', req.session.id);
    log.debug('req.cookies:', req.cookies);
    log.debug('(end of req info)');
    log.debug('\n');

    next();

};