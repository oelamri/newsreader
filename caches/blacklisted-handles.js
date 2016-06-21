var _ = require('underscore');


var staticListOfBlacklistedHandles = ['setup', 'test', 'invites',
    'draft', 'topic', 'login_local', 'login_test', 'scripts', 'notifications',
    'logout', 'login', 'settings', 'search', 'favicon.ico'];

module.exports = {

    value: staticListOfBlacklistedHandles, //initial value set here

    setValue: function (handles) {
        this.value = _.union(_.flatten([handles]), staticListOfBlacklistedHandles); //remove any duplicate values
    },

    getValue: function () {
        return this.value;
    }

};