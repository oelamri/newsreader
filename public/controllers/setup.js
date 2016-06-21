app.controller('SetupController', function ($scope, /*USER,*/ /*MESSAGES,*/ FIELDS, IS_TWITTER_TAKEN, $upload, CONFIG, FormVerificationService, ImageService, CloudinaryService) {

    console.log(USER.picture.original);
    $scope.credentials = {
        email: USER.email,
        username: USER.username,
        fullname: USER.fullname,
        picture: USER.picture.original
    };

    // If username is not entered, then default to twitter username
    if(!IS_TWITTER_TAKEN) {
        $scope.credentials.username = USER.accounts && USER.accounts.twitter && USER.accounts.twitter.username ;
    }

    if(!$scope.credentials.fullname) {
        $scope.credentials.fullname = USER.accounts.twitter.displayName;
    }

    if(!$scope.credentials.picture) {
        $scope.credentials.picture = USER.accounts.twitter.picture;
    }

    // Error messages
    $scope.errorMessages = [];
    $scope.imageFile = '';
    $scope.imageUploadInProcess = false;
    $scope.profilePictureUploaded = false;

    if (MESSAGES && MESSAGES.length > 0) {
        for(var i = 0; i < MESSAGES.length; i++) {
            $scope.errorMessages.push(MESSAGES[i]);
        }
    }

    // Add credentials that come in from server
    if (FIELDS) {
        _.extend($scope.credentials, FIELDS);
    }

    // Setup form that goes to POST /setup
    var form = $('#setup');

    $scope.uploadProfilePicture = function (files, cb) {
        $scope.imageUploadInProcess = true;

        ImageService.encodeImage(files[0], 800, 800, function (err, result) {
            if (err) {
                console.error(err);
                $scope.errorMessages.push('There was an error uploading your picture.');
                $scope.imageUploadInProcess = false;
            }
            else {
                CloudinaryService.uploadFile(result).then(function (resp) {

                    $scope.credentials.picture = resp.data.url;
                    console.log('Response from cloudinary service:', resp.data.url);
                    $scope.imageUploadInProcess = false;

                }).catch(function (err) {

                    console.error(err);
                    $scope.errorMessages.push('There was an error uploading your picture.');
                    $scope.imageUploadInProcess = false;
                });

            }
        });
    };

    $scope.setup = function () {

        $scope.errorMessages = [];

        var emailValidationResponse = FormVerificationService.isValidEmail($scope.credentials.email);
        var usernameValidationResponse = FormVerificationService.isValidUsername($scope.credentials.username);
        var passwordValidationResponse = FormVerificationService.isValidPassword($scope.credentials.password);


        if(FormVerificationService.isValidImgUrl($scope.credentials.picture)) {
            $('#originalImgUrlPlaceholder').val($scope.credentials.picture);
        } else {
            $scope.errorMessages.push('Please upload a different image.');
            return;
        }

        if (emailValidationResponse !== true) {
            $scope.errorMessages.push(emailValidationResponse);
            return;
        }
        if ($scope.credentials.fullname === '') {
            $('#authbox-fullname').focus();
            $scope.errorMessages.push('Please enter your full name.');
            return;
        }
        if (usernameValidationResponse !== true) {
            $scope.errorMessages.push(usernameValidationResponse);
            return;
        }
        if (!$scope.profilePictureUploaded && false) {
            $scope.errorMessages.push('Please upload a profile picture.');
            return;
        }
        if (passwordValidationResponse !== true) {
            $scope.errorMessages.push(passwordValidationResponse);
            return;
        }
        
        
        form.submit();
    };

});

