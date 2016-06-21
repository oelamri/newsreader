app.controller('FeedController', function ($scope, $window, $cookies, $element, FormVerificationService, NewsletterService, PostService) {

    $scope.posts = POSTS.initial;
    console.log('Initial Posts: ', $scope.posts);

    var remainingPosts = POSTS.remaining; //contains the ids of full posts yet to be retrieved from the API

    $scope.goToLink = function (url) {
        $window.open(url);
    };

    $scope.collapseMessageOne = function () { // Welcome message
        $cookies['clickedMessageOne'] = true;
    };
    $scope.collapseMessageTwo = function () { // Twitter follow message
        $cookies['clickedMessageTwo'] = true;
    };
    $scope.collapseMessageThree = function () { // Newsletter form
        $cookies['clickedMessageThree'] = true;
    };

    $scope.canPost = true; // False when an API call is in progress
    $scope.invalidEmailSubmitted = false;
    $scope.inputEmail = ''; // From the form ng-model

    $scope.subscribeToNewsletter = function () {

        var emailValidationResponse = FormVerificationService.isValidEmail($scope.inputEmail);
        if (emailValidationResponse !== true && $scope.canPost == true) {
            $scope.invalidEmailSubmitted = true;
            console.log('Wrong email.');
            $element['input'].select();
            return;
        }

        $scope.canPost = false;

        NewsletterService.submitEmail($scope.inputEmail).success(function (err, result) {
            $scope.collapseMessageThree();
            $scope.invalidEmailSubmitted = true;
            console.log('Correct email.');
        }).error(function (err) {
            console.error('ERROR:', err);
        });
    };

    $scope.clickedMessageOne = $cookies['clickedMessageOne'];
    $scope.clickedMessageTwo = $cookies['clickedMessageTwo'];
    $scope.clickedMessageThree = $cookies['clickedMessageThree'];


    $scope.upvotePost = function (postId) {
        console.log('upvoting post with id:', postId);
        var post = _.where($scope.posts, {_id: postId});
        if (post && post.upvotes) {
            post.upvotes.push({});
        }
        else if (post) {
            post.upvotes = [];
            post.upvotes.push({});
        }
    };


    $scope.$watch(function () {
        return $cookies['clickedMessageOne']
    }, function (newValue) {
        $scope.clickedMessageOne = newValue;
    });
    $scope.$watch(function () {
        return $cookies['clickedMessageTwo']
    }, function (newValue) {
        $scope.clickedMessageTwo = newValue;
    });
    $scope.$watch(function () {
        return $cookies['clickedMessageThree']
    }, function (newValue) {
        $scope.clickedMessageThree = newValue;
    });


    var bottomBuffer = 50;  //if desktop, should be 200, if it's mobile, not sure

    console.log('remaining posts:', remainingPosts);

    var win = angular.element($window);

    win.bind('scroll', function () {
        var bottom = $element.position().top + $element.outerHeight(true);
        if (win.scrollTop() + win.height() > bottom - bottomBuffer) {
            if (remainingPosts.length > 0) {
                $scope.fetchNextPosts(remainingPosts.splice(0, 9)); //note: remove 9 posts from remaining and then fetch those 9 from server
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