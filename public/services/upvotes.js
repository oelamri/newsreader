app.factory('UpvoteService', function ($http, CONFIG) {

    return {

        addUpvote: function (postId, userId, queryObj) {
            return $http({
                method: 'PUT',
                url: CONFIG.API.BASE_URL + '/1/posts/' + postId,
                data: {
                    "$push": {
                        "upvotes": userId
                    }
                },
                params: queryObj || {}
            });

        },

        removeUpvote: function (postId, userId, queryObj) {
            return $http({
                method: 'PUT',
                url: CONFIG.API.BASE_URL + '/1/posts/' + postId,
                data: {
                    "$pull": {
                        "upvotes": userId
                    }
                },
                params: queryObj || {}
            });

        },

        getUpvoteCount: function (postId, queryObj) {
            //same as "getUpvotesForOnePost" just get the array size afterwards
            //probably never need count without array of user ids anyway
        },


        getUpvotes: function (postId, queryObj) {
            return $http({
                method: 'POST',
                url: CONFIG.API.BASE_URL + '/1/posts/' + postId + '/props',
                data: {
                    _id: 0,
                    upvotes: 1
                },
                params: queryObj || {}
            });
        }

    }

});