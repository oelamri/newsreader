var https = require('https');
var http = require('http');
var log = require('lectal-logger');
var path = require('path');

var server = null;

var fs = require('fs');


function getServer(app) {

    if (server == null) {

        if(process.env.NODE_ENV === 'staging' || process.env.NODE_ENV === 'production'){
            //server = https.createServer(options, app).listen(app.get('port')); //TODO: https for production
            server = http.createServer(app).listen(app.get('port'));
        }
        else{
            server = http.createServer(app).listen(app.get('port'));
        }


        server.on('error', function (err) {
            log.error(err);
        });
    }

    return server;
}


module.exports = {
    getServer: getServer
};