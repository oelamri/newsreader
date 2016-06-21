app.controller('FrontpageController', function ($scope, $window, $cookies, $element, FormVerificationService, PostService) {

    $scope.posts = []; // 9 initial
    var remainingPostIds = []; // Array of remaining post ids

    PostService.getPosts().then(function(response) {
        for(var i = 0; i < response.data.initialPosts.length; i++) {
            $scope.posts.push(response.data.initialPosts[i]);
        }
        for(var i =0; i < response.data.remainingPostIds.length; i++) {
            remainingPostIds.push(response.data.remainingPostIds[i]);
        }
        console.log('posts', $scope.posts);
        console.log('remainingPostIds:', remainingPostIds);
    });





    $scope.goToLink = function (url) {
        $window.open(url);
    };

    $scope.canPost = true; // False when an API call is in progress
    $scope.invalidEmailSubmitted = false;
    $scope.inputEmail = ''; // From the form ng-model





    var bottomBuffer = 50;  //if desktop, should be 200, if it's mobile, not sure

    // console.log('remaining posts:', remainingPostIds);

    var win = angular.element($window);

    win.bind('scroll', function () {
        var bottom = $element.position().top + $element.outerHeight(true);
        if (win.scrollTop() + win.height() > bottom - bottomBuffer) {
            if (remainingPostIds.length > 0) {
                console.log('remainingPostIds in win.bind(scroll)', remainingPostIds);
                $scope.fetchNextPosts(remainingPostIds.splice(0, 9)); //note: remove 9 posts from remaining and then fetch those 9 from server
            }
            else {
                console.log('(no remaining posts to retrieve from server)');
            }
        }
    });

    $scope.fetchNextPosts = function (postIds) {
        console.log('fetchNextPosts postIds:', postIds);
        PostService.getNextPosts(postIds).success(function (response) {
            console.log('POSTS RETRIEVED: ', response);
            var posts;
            if (posts = response.success) {
                posts.filter(function (post) {
                    return post && post.picture && post.thumbnail && post.poster && post.poster.picture; //note: this ensures absolutely no errors in rendering
                }).forEach(function (post) {
                    $scope.posts.push(post); //note: add new posts to feed
                });
            }
            else {
                console.error(response.error);
            }

        }).error(function (err) {
            console.error('ERROR GETTING NEXT POSTS: ', err);
        });
    };

    $scope.fetchNextTopicPosts = function (postIds) {
        console.log('fetchNextTopicPosts postIds:', postIds);
        PostService.getNextPosts(postIds).success(function (response) {
            var posts;
            if (posts = response.success) {
                posts.filter(function (post) {
                    return post && post.picture && post.thumbnail && post.poster && post.poster.picture; //note: this ensures absolutely no errors in rendering
                }).forEach(function (post) {
                    $scope.posts.unshift(post); //note: add new posts to feed
                });
            }
            else {
                console.error(response.error);
            }

        }).error(function (err) {
            console.error(err);
        });
    };

});