app.factory('AuthService', function (USER) {

    return {

        isLoggedIn: function () {
            return USER && USER.accounts;
        }

    }

});