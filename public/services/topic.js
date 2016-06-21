app.factory('TopicService', function ($http, $q, $location, CONFIG, USER, AuthService) {

    return {


        createNewTopic: function (data, cb) {
            
            var data = JSON.stringify({
                        hashtag: data.hashtag,  //in this post request we attempt to insert new handle pertaining to this topic's hashtag
                        picture: {
                            original: data.picture
                        }
                    });
            $http({
                method: 'POST',
                url: CONFIG.API.BASE_URL + '/1/topics',
                data: data,
                params: {
                    data
                }
            }).then(function (resp) {   //TODO: convert this to then/catch
                if (resp.data && resp.data.success) {
                    cb(null, resp.data.success);
                }
                else if (resp.data && resp.data.error) {
                    cb(new Error(resp.data.error));
                }
                else {
                    console.error(new Error('unexpected API response'));
                }
            }).catch(function (resp) {
                if (resp.data && resp.data.error) {
                    cb(new Error('API error'), resp.data.error)
                }
                else {
                    cb(new Error('wtf'));
                }
            });
        },

        follow: function (topicId) {

            if (!AuthService.isLoggedIn()) {
                //$location.url('/login');
                window.location.href = '/login';
                return $q.reject({error: 'no logged in user, but non-existent user could still click a follow button?'});
            }
            else {

                console.log('About to follow topicId=',topicId);
                return $http({
                    method: 'PUT',
                    url: CONFIG.API.BASE_URL + '/1/topics/follow/by_id/' + topicId
                });
            }

        },
        unfollow: function (topicId) {

            if (!AuthService.isLoggedIn()) {
                //$location.url('/login');
                window.location.href = '/login';
                return $q.reject({error: 'no logged in user, but non-existent user could still click a unfollow button?'});
            }
            else {

                console.log('About to unfollow topicId=',topicId);

                return $http({
                    method: 'PUT',
                    url: CONFIG.API.BASE_URL + '/1/topics/unfollow/by_id/' + topicId
                });
            }
        }
    }
});
