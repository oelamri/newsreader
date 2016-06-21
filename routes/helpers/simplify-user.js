var log = require('lectal-logger');
var config = require('univ-config')(module,'*lectal-web*', 'config/conf');
var _ = require('underscore');


// Remove sensitive user data from model before sending to client
function simplifyUser(user) {

    log.debug('Before simplifyUser():', user);

    if(user) {
      delete user.password;
      delete user.dateUpdated;
      delete user.dateCreated;

      var accounts = ['facebook', 'linkedin', 'twitter'];

      for(var i = 0; i < accounts.length; i++) {
        if(user.accounts[accounts[i]]) {
          removeSensitiveData(user, accounts[i]);
        }
      }
    }

    log.debug('After simplifyUser():', user);
    return user;
}

function removeSensitiveData(user, platform) {
  delete user.accounts[platform].secret;
  delete user.accounts[platform].token;
  delete user.accounts[platform].tokenCreatedAt;
}

module.exports = { 
  simplifyUser: simplifyUser
};