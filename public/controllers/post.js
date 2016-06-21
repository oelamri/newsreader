app.controller('PostController', function (USER, $scope, $window, PostService) {

    $scope.isUpvoted = $scope.post.isUpvoted;
    $scope.upvoteCount = $scope.post.upvoteCount;

    $scope.goToLink = function () {
        $window.location.href = ($scope.post.shortUrl);
    };

    // Generating the thumbnail
    var topics = _.filter($scope.post.content || [], function (topic) {
        return topic["kind"] == "topic";
    });

    if(topics.length > 0){
        $scope.thumbnail = topics[0].topic.picture;
    }

    $scope.upvote = function () {


        if ($scope.isUpvoted) {

            PostService.unvote(USER, $scope.post).then(function (msg) {
                if (msg.data && msg.data.success && msg.data.success.nModified > 0) {
                    $scope.isUpvoted = false;
                    $scope.upvoteCount--;
                    $scope.post.isUpvoted = false;
                }
            }).catch(function (err) {
                console.error(err);
            });
        }
        else {

            PostService.upvote(USER, $scope.post).then(function (msg) {
                if (msg.data && msg.data.success && msg.data.success.nModified > 0) {
                    $scope.isUpvoted = true;
                    $scope.post.isUpvoted = true;
                    $scope.upvoteCount++;
                }
            }).catch(function (err) {
                console.error(err);
            });
        }

    };

});