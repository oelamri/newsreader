app.controller('TopicController', ['$scope', '$http', 'FormVerificationService', 'AutosuggestService', 'TopicService',
    function ($scope, $http, FormVerificationService, AutosuggestService, TopicService) {

    // New topic schema:
    $scope.newTopic = {
        name: '',
        hashtag: '',
        picture: ''
    };

    $scope.topicObject = null;
    $scope.errorMessages = [];
    $scope.suggestedImages = [];

    // Thumbnail tells us if it's uploading an image so we can block POST /topic
    $scope.imageUploadInProgress;

    // Signals if a topic is being uploaded
    $scope.topicIsPending = false;

    $scope.cancelNewTopic = function () {
        $scope.topicObject = false;
        $scope.emptyForm();
        $scope.showNewTopicForm = false;
    };

    $scope.emptyForm = function () {
        $scope.newTopic.name = '';
        $scope.newTopic.hashtag = '';
        $scope.newTopic.picture = null;
    };

    // Validates inputs and sends POST /topic
    $scope.addNewTopic = function () {
        // Empty error messages:
        $scope.errorMessages = [];

        /* VALIDATION */
        // Check if the topic name is valid
        if (!$scope.newTopic || !$scope.newTopic.name) {
            $('#authbox-fullname').focus();
            $scope.errorMessages.push('Please enter a full name for the topic.');
            return false;
        }

        // Check if the hashtag is valid
        var hashtagValidationResponse = FormVerificationService.isValidHashtag($scope.newTopic.hashtag || '');

        if($scope.newTopic.hashtag.indexOf('#') > -1){
            $scope.newTopic.hashtag = $scope.newTopic.hashtag.slice(1);
        }

        // Check if an image is selected
        if (!$scope.newTopic.picture) {
            $scope.errorMessages.push('Please upload a picture for this topic.');
            return false;
        }

        // Flag upload pending
        $scope.topicIsPending = true;

        console.log("Image upload in progress: ", $scope.imageUploadInProgress);

        // Stop post request until the image comes back from Cloudinary
        var timer = setInterval(function () {
            if (!$scope.imageUploadInProgress) {
                // POST /topic
                TopicService.createNewTopic($scope.newTopic, function (err, data) {
                    if (err) {
                        console.error(err);
                        $scope.errorMessages = data.errorMessages;
                        $scope.topicIsPending = false; // Flag upload as no longer pending
                    }
                    else {
                        console.log('data:',data);
                        AutosuggestService.clearCache();
                        $scope.emptyForm();
                        $scope.topicObject = {
                            topicId: data._id,
                            name: data.name,
                            hashtag: data.hashtag,
                            picture: data.picture.large
                        };
                        $scope.topicIsPending = false; // Flag upload as no longer pending
                    }

                });
                clearInterval(timer);
            }
        }, 500);


    };
}]);
