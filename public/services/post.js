app.factory('PostService', ['$http', '$q', 'CONFIG', 'AuthService', function ($http, $q, CONFIG, AuthService) {

    return {


        createPost: function (payload) {

            console.log('payload before being sent:', payload);


            return $http({
                method: 'POST',
                url: CONFIG.API.BASE_URL + '/1/posts',
                data: payload
            });
        },

        getPosts: function() {
            return $http({
                method: 'GET',
                url: CONFIG.API.BASE_URL + '/1/posts/initial_set'
            });
        },

        getNextPosts: function (postIds) {

            console.log('postIds in getNext:', postIds);

            return $http({
                method: 'GET',
                url: CONFIG.API.BASE_URL + '/1/posts/next_set',
                params: {
                    data: JSON.stringify({
                        postIds: postIds
                    })
                }
            });

        },
        upvote: function (USER, post) {

            if (!AuthService.isLoggedIn()) {
                //$location.url('/login');
                window.location.href = '/login';
                return;
            }

            var postId = post._id;
            var posterId = post.posterId;
            console.log('Upvoting this post with postId=' + postId + '...');

            if (USER) {

                var userId = USER._id;
                var hasUpvoted = post.isUpvoted;


                if (hasUpvoted) {
                    return $q.reject({message: 'user has already upvoted this post'});
                }
                else {
                    return makeUpvote();
                }


            }
            else {
                return $q.reject({error: 'no logged-in user, but non-existent user could still click an upvote button?'});
            }

            function makeUpvote() {
                return $http({
                    method: 'PUT',
                    url: CONFIG.API.BASE_URL + '/1/posts/by_id/' + postId + '/add_upvote',
                    data: {
                        posterId: posterId
                    },
                    params: {
                        data: JSON.stringify({
                            addNotification: true
                        })

                    }
                });

            }

        },

        unvote: function (USER, post) {

            if (!AuthService.isLoggedIn()) {
                //$location.url('/login');
                window.location.href = '/login';
                return;
            }

            var postId = post._id;
            var posterId = post.posterId;
            console.log('Upvoting this post with postId=' + postId + '...');

            if (USER) {

                var userId = USER._id;
                var hasUpvoted = post.isUpvoted;

                if (!hasUpvoted) {
                    return $q.reject({message: 'user has not upvoted this post yet, so deupvote is not possible...'});
                }
                else {
                    return makeUnvote();
                }

            }
            else {
                return $q.reject({error: 'no logged-in user, but non-existent user could still click an upvote/unvote button?'});
            }

            function makeUnvote() {
                return $http({
                    method: 'PUT',
                    url: CONFIG.API.BASE_URL + '/1/posts/by_id/' + postId + '/remove_upvote',
                    data: {
                        posterId: posterId
                    },
                    params: {
                        data: {
                            addNotification: true
                        }
                    }
                });

            }

        }
    }

}]);
