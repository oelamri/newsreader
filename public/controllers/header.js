app.controller('HeaderController', function ($scope, $element, $http, HeaderService, UserService, TopicService, USER, SUBJECT) {

    $scope.subject = SUBJECT;
    $scope.user = USER;
    console.log('SUBJECT',SUBJECT);
    $scope.isFollowing = SUBJECT.isFollowing; // Initializes value with value from server - this for checking if logged in user is follwing this user/topic
    $scope.isOwnProfile = HeaderService.isOwnProfile();

    $scope.follow = function (kind, id) {

        switch (kind) {

            case 'user':

                if ($scope.isFollowing) {
                    console.log('Soon to be unfollowing user with id=' + id);
                    UserService.unfollow(id).then(function (msg) {
                        console.log('Result from unfollow user action:',msg.data);
                        if (msg.data && msg.data.success && msg.data.success.nModified > 0) {
                            $scope.isFollowing = false;
                            SUBJECT.counts.followers--;
                        }
                    }).catch(function (err) {
                        console.error(err);
                    });
                }
                else {
                    console.log('Soon to be following user with id=' + id);
                    UserService.follow(id).then(function (msg) {
                        console.log('Result from follow user action:',msg.data);
                        if (msg.data && msg.data.success && msg.data.success.nModified > 0) {
                            $scope.isFollowing = true;
                            SUBJECT.counts.followers++;
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
                            SUBJECT.counts.followers--;
                        }
                    }).catch(function (err) {
                        console.error(err);
                    });
                }
                else {
                    console.log('Soon to be following topic with id=' + id);
                    TopicService.follow(id).then(function (msg) {
                        console.log('Result from follow topic action:',msg.data);
                        if (msg.data && msg.data.success && msg.data.success.nModified > 0) {
                            $scope.isFollowing = true;
                            SUBJECT.counts.followers++;
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

    /* Twitter link for topics */
    if ($scope.subject.kind == 'topic') {
        $scope.twitterLink = "http://twitter.com/home/status=Follow ";// + $scope.subject.name + "(#" + $scope.subject.handle + ") on @LectalHQ at lectal.com/" + $scope.subject.handle;
    }


});
