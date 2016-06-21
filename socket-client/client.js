var socketio = require('socket.io-client');

var socketClient = null;

function getClient(serverConfig) {

    if (socketClient == null) {

        socketClient = socketio(serverConfig.getUrl());
    }

    return socketClient;
}


module.exports = {
    getClient: getClient
};