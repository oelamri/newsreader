app.controller('ItemController', function ($scope, $element, $http, UserService, TopicService, USER, SUBJECT, FOLLOWS) {

    $scope.isFollowing = $scope.content.isFollowing; // Checks if logged in user is follwing this user/topic

    console.log('FOLLOWS', FOLLOWS);
    $scope.follow = function (content) {

        var id = content._id;
        var kind = content.kind;

        switch (kind) {

            case 'user':

                if ($scope.isFollowing) {
                    UserService.unfollow(id).then(function (msg) {
                        console.log('Result from unfollow user action:',msg.data);
                        if (msg.data && msg.data.success && msg.data.success.nModified > 0) {
                            $scope.isFollowing = false;
                        }
                        else {
                            //do nothing
                        }
                    }).catch(function (err) {
                        console.error(err);
                    });
                }
                else {
                    UserService.follow(id).then(function (msg) {
                        console.log('Result from follow user action:',msg.data);
                        if (msg.data && msg.data.success && msg.data.success.nModified > 0) {
                            $scope.isFollowing = true;
                        }
                        else {
                            //do nothing
                        }
                    }).catch(function (err) {
                        console.error(err);
                    });
                }

                break;

            case 'topic':

                if ($scope.isFollowing) {
                    TopicService.unfollow(id).then(function (msg) {
                        console.log('Result from unfollow topic action:',msg.data);
                        if (msg.data && msg.data.success && msg.data.success.nModified > 0) {
                            $scope.isFollowing = false;
                        }
                    }).catch(function (err) {
                        console.error(err);
                    });
                }
                else {
                    TopicService.follow(id).then(function (msg) {
                        console.log('Result from follow topic action:',msg.data);
                        if (msg.data && msg.data.success && msg.data.success.nModified > 0) {
                            $scope.isFollowing = true;
                        }
                    }).catch(function (err) {
                        console.error(err);
                    });

                }
                break;
            default:
                throw new Error('no case matched');
        }
    };

});


