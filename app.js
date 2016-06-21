//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');


//#core
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const util = require('util');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const logfmt = require('logfmt');
const busboy = require('./middleware/busboy');
const path = require('path');
const device = require('express-device');
const async = require('async');
const domain = require('domain');

//#project
const tokenGen = require('./services/token-gen');
const lectalTokenAuth = require('./lib/lectal-web-auth');
const authConstants = require('./config/auth-constants');
const reqLogging = require('./middleware/logging/request-logging');

//#middleware
var rlm = require('./middleware/rate-limit');

//TODO: add ability to whitelist / blacklist


var app = express();


var reqId = 0;

app.use(function (req, res, next) {
    req.lectalReqId = reqId++;
    req.requestStart = Date.now();
    next();
});

app.use(morgan('combined', {
    skip: function (req, res) {
        return res.statusCode < 400
    }
}));

app.use(cookieParser());

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(device.capture());
app.use(busboy({
    tmpDir: path.resolve(__dirname, 'tmp'),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
}));


app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(process.cwd() + '/public'));
app.set('view engine', 'ejs');
app.use(flash());


app.set('trust proxy', 1); // trust first proxy


app.use(function (req, res, next) {

    var d = domain.create();

    d.on('error', function (err) {
        log.error(err);
        this.exit(); //exit from current domain
        if (!res.headersSent) {
            res.json({error: err.stack});
        }
    });

    d.run(function () {
        req.lectalDomain = d;
        next();
    });

});



if (process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production') {
    app.use(cookieSession({
        name: 'lectal-cookie-todd',
        //secret: 'Bartholomew-the-Apostle',
        domain: '.lectal.com',
        secure: false,
        maxAge: 400000000,
        cookie: {
            name: 'lectal-cookie-todd',
            //secret: 'Bartholomew-the-Apostle',
            domain: '.lectal.com',
            secure: false,
            maxAge: 400000000
        },
        keys: ['key1', 'key2']
    }));
}
else {

    //DO NOT DELETE!!

    app.use(cookieSession({
        name: 'lectal-cookie-dev',
        secure: false,
        maxAge: 400000000,
        cookie: {
            name: 'lectal-cookie-dev',
            secure: false,
            maxAge: 400000000
        },
        keys: ['key1', 'key2']
    }));


}


app.use(passport.initialize());
app.use(passport.session());


require('./config/passport')();


app.use(function (req, res, next) {

    if (req.device.type !== 'desktop') {
        res.redirect('http://mobile.lectal.com')
    }
    else {
        next();
    }

});

if (process.env.NODE_ENV !== 'production') {
    app.use(reqLogging);
}



app.use(function (req, res, next) {

    if (req.user) {
        req.lectalAccessToken = tokenGen.generateToken(req.user);
        log.debug('Lectal access token:', req.lectalAccessToken);
    }
    else {
        req.lectalAccessToken = tokenGen.generateToken({_id: 'beach'}); ///anything that wont be an actual userId
    }

    next();

});



app.use('/auth', require('./routes/auth'));
app.use('/', require('./routes/index'));
app.use('/info', require('./routes/info'));


app.use(function (req, res, next) {
    try {
        req.lectalDomain.exit(); //exit from the current domain explicitly
    }
    catch (err) {
        log.error(err);
    }
    finally {
        next();
    }
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next({status: 404, error: new Error(util.format('404: Not Found => ', req.method, req.originalUrl))});
});


app.use(function (err, req, res, next) {

    try {
        req.lectalDomain.exit(); //exit from the current domain explicitly
    }
    catch (err) {
        //log.error(err);
    }


    if (err.error && err.status) { //deconstruct err object
        var status = String(err.status);
        err = err.error;
        err.status = status;
    }


    if (res.headersSent) {
        log.error(err);
    }
    else {
        if (app.get('env') === 'production') {
            res.status(err.status || 500).json({
                error: 'sorry the web server experienced an error serving your priority request'
            });
        }
        else {
            res.status(err.status || 500).json({
                error: {
                    message: 'Lectal web error',
                    trace: err.stack || err
                }
            });
        }
    }
});


module.exports = app;