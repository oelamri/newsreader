//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module,'*lectal-web*', 'config/conf');


//#project
var ee = require('../events/event-bus');
var socketClient = require('../socket-client/client').getClient();


socketClient.on('handles', function (data) {

    log.info('data from handles:',data);

});