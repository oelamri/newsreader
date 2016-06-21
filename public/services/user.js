app.factory('UserService', ['$http', '$q', 'CONFIG', 'USER', 'AuthService', function ($http, $q, CONFIG, USER, AuthService) {

    return {

        model: {},

        updateModel: function() {},

        getModel: function (userId) {
            return $http({   //used currently to reset value for USER
                method: 'GET',
                url: CONFIG.API.BASE_URL + '/1/users/by_id/' + userId
            });
        },

        follow: function (userId) {
            //question: why not use this insead of AuthService
            if (!(USER && USER.accounts.twitter)) {
                //$location.url('/login');
                window.location.href = '/login';
                return $q.reject({error: 'no logged-in user, but non-existent user could still click a follow button?'});
            }
            else {
                return $http({
                    method: 'PUT',
                    url: CONFIG.API.BASE_URL + '/1/users/add_follow/by_id/' + userId
                });
            }


        },

        unfollow: function (userId) {

            if (!AuthService.isLoggedIn()) {
                //$location.url('/login');
                window.location.href = '/login';
                return $q.reject({error: 'no logged-in user, but non-existent user could still click a follow button?'});
            }
            else {
                return $http({
                    method: 'PUT',
                    url: CONFIG.API.BASE_URL + '/1/users/add_unfollow/by_id/' + userId
                });
            }

        }

    }
}]);
