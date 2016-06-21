app.controller('DraftController', ['$scope', '$rootScope', '$http', '$upload', /*'USER', */'FormVerificationService', '$window', 'CONFIG', 'PostService', 'UserService',
    function ($scope, $rootScope, $http, $upload, /*USER,*/ FormVerificationService, $window, CONFIG, PostService, UserService) {
        console.log('CONFIG:', CONFIG);
        // Post body:
        $scope.link = '';
        $scope.image;
        $scope.summary = {
            contenteditable: {},
            counter: {}
        };

        // For topic:
        $scope.showNewTopicForm = false;
        $scope.newTopicObject = null;

        // For loader:
        $scope.postIsPending = false;
        $scope.imageUploadInProgress;

        // For errors:
        $scope.errorMessages = [];

        // For social media:
        // Picture and ID come from angular constant from server side
        /*
        $scope.shareOn = {
            twitter: {
                selected: false,
                id: USER.accounts.twitter && USER.accounts.twitter.id,   //if USER.accounts.twitter exists it will return USER.accounts.twitter.id
                picture: USER.accounts.twitter && USER.accounts.twitter.picture
            },
            facebook: {
                selected: false,
                id: USER.accounts.facebook && USER.accounts.facebook.id,
                picture: USER.accounts.facebook && USER.accounts.facebook.picture
            },
            linkedin: {
                selected: false,
                id: USER.accounts.linkedin && USER.accounts.linkedin.id,
                picture: USER.accounts.linkedin && USER.accounts.linkedin.picture
            }
        };
        */

        //note: this might be an improvement: http://stackoverflow.com/questions/5240428/javascript-how-can-a-parent-window-know-that-its-child-window-closed
        $scope.addSocialMediaService = function (platform) {
            var childWindow = window.open('/auth/connect_' + platform);
            var timer = setInterval(function () {
                if (childWindow.closed) {
                    updateUSERValue(platform);
                    $scope.shareOn[platform].selected = true;
                    clearInterval(timer);
                }
            }, 500);
        };


        function updateUSERValue(platform) {
            UserService.getModel(USER._id).then(function (resp) {

                var successData = resp.data.success;
                if (successData) {
                    $scope.shareOn[platform].id = successData.accounts[platform].id;
                    $scope.shareOn[platform].picture = successData.accounts[platform].picture;
                }
                else if (resp.data.error) {
                    console.error(data);
                }
                else {
                    console.error(new Error('Bad API response, ask Alex' + data).stack);
                }
            }).catch(function (error) {
                console.log(error);
            });
        }

        // Submits the post
        $scope.post = function () {

            // Empty error messages
            $scope.errorMessages = [];

            // Validate URL
            var urlValidation = FormVerificationService.isValidUrl($scope.link);
            if (urlValidation !== true) {
                $scope.errorMessages.push(urlValidation);
                return;
            }

            // Check summary for errors
            if ($scope.summary.errorMessages && $scope.summary.errorMessages.length > 0) {
                $scope.errorMessages.push.apply($scope.errorMessages, $scope.summary.errorMessages);
                return;
            }

            // If the image is set or it's currently uploading to Cloudinary
            if ($scope.image || $scope.imageUploadInProgress) {
                $scope.makePostRequest();
            } else {
                $scope.errorMessages.push('Please choose a picture.');
                return;
            }

        };

        // Send POST /post request to server
        $scope.makePostRequest = function () {

            // Tell controller that POST is in progress
            $scope.postIsPending = true;

            // Wait for image upload on thumbnail to finish before sending the post
            var timer = setInterval(function () {
                if (!$scope.imageUploadInProgress) {
                    var payload = makePostPayload();

                    console.log('Post payload:', payload);

                    PostService.createPost(payload)
                        .then(function (resp) {
                            if (resp.data && resp.data.success) {
                                console.log('POST /post success data:', resp.data.success);

                                // Redirect the user to see their new post
                                document.location.href = '/profile';
                            }
                            else if (resp.data && resp.data.error) {
                                console.error(data.error);
                                // Remove overlay loader
                                $scope.postIsPending = false;
                                // Add server error message to UI
                                $scope.errorMessages.push(data.error);
                            }
                            else {
                                console.error(resp);
                                console.error(new Error('unexpected server response'));
                            }
                        })
                        .catch(function (err) {
                            console.error(err);
                            if (data && data.errorMessages) {
                                $scope.errorMessages = data.errorMessages;
                            }
                            else {
                                // Remove overlay loader
                                $scope.postIsPending = false;
                                // Add server error message to UI
                                $scope.errorMessages.push('There was an internal error saving the post.');
                            }
                        });
                    clearInterval(timer);
                }
            }, 500);

        };

        // Creates post body
        function makePostPayload() {

            // Add image and URL to payload
            var payload = {
                picture: $scope.image,
                link: $scope.link,
                platforms: []
            };

            // Add social media platforms to payload
            Object.keys($scope.shareOn).forEach(function (key) {
                var platform = $scope.shareOn[key];
                if (platform.selected) {
                    payload.platforms.push(key);
                }
            });

            // Add summary to post payload
            var contenteditable = $scope.summary.contenteditable.data;
            payload.summary = _.filter(contenteditable.map(function (token) {
                if (token.type === 'tag') {
                    console.log('A topic:', token);
                    return {
                        kind: 'topic',
                        id: token.objectID,
                        content: token.text
                    };
                }
                else {
                    return {
                        kind: 'string',
                        content: token.text
                    };
                }
            }), _.property('content'));

            payload.string = _.pluck(payload.summary, 'content').join('');

            console.log('Generated post payload:', payload);

            return payload;
        }
    }]);