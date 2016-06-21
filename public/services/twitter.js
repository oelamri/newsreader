app.factory('TwitterService', function ($http, ConfigService) {

    return {

        postDirectMessage: function (userId, messageText) {
            return $http({
                method: 'POST',
                url: ConfigService.api.baseUrl + '/v1/twitter/direct_message/by_user_id/' + userId,
                data: {
                    text: messageText
                },
                params: {}
            });

        }


    }

});