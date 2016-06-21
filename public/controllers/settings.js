app.controller('SettingsController', function($scope, UserService, ImageService, CloudinaryService, USER) {
    $scope.user = USER;

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
                    $scope.user.picture.original = resp.data.url;
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

});
