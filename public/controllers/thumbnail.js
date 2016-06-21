app.controller('ThumbnailController', ['$scope', '$rootScope', '$http', '$upload', '$timeout', 'FormVerificationService', 'ImageService', 'CloudinaryService',
function ($scope, $rootScope, $http, $upload, $timeout, FormVerificationService, ImageService, CloudinaryService) {

    // Main image and suggestions:
    $scope.image = null;
    $scope.suggestedImages = [];
    $scope.gettingImages = false;

    // For communicating state with DraftController:
    $scope.postIsPending;
    $scope.imageUploadInProgress = false;

    // For image suggestions:
    $scope.suggestionType;
    $scope.suggestionQuery;

    // Tells watcher to watch when done initializing:
    var initializingSuggestionQueryWatcher = true;

    // Gate for the watcher
    var suggestionQueryWatcherInterval = false;
    
    // Query copy
    var lastSuggestionQuery = '';
    var suggestionTimeoutDuration = 3000;
    var waitingToGetImages = true;

    function waitBeforeGettingImages() {
        // Prevents more timeouts from being created
        waitingToGetImages = false;

        // Catches the last inputted character and gets images
        var timeout = setTimeout(function() {
            getImages();
            waitingToGetImages = true;
        }, suggestionTimeoutDuration);
    }

    // Overrides the gate for the watcher every suggestionTimeoutDuration ms
    var timer = setInterval(function () {
        // Open the gate
        suggestionQueryWatcherInterval = true;
    }, suggestionTimeoutDuration);

    // Watch suggestionQuery for input changes
    $scope.$watch('suggestionQuery', function(query) {

        // Check first if initializing
        if(initializingSuggestionQueryWatcher || $scope.suggestionQuery.length < 2) {
            initializingSuggestionQueryWatcher = false;
            return;
        }
        // Check if the query has changed
        else if (lastSuggestionQuery != $scope.suggestionQuery) {

            // Check if we are already getting images
            if(suggestionQueryWatcherInterval) {
                getImages();
                // Tells the watcher we are getting images
                suggestionQueryWatcherInterval = false;
            } else {
                // Checks to see if we are already getting images
                if(waitingToGetImages) {
                    waitBeforeGettingImages();
                }
            }
            // Update the query copy
            lastSuggestionQuery = $scope.suggestionQuery;
        }
    });


    //TODO: Don't select image if there's nothing to select
    //TODO: Prevent uplading to cloudinary again if suggestion is already uploaded 

    $scope.addLocalImage = function (files) {

        // Get image selected on filesystem
        if (files && files[0]) {

            // Crop image and base64 encode it (has to be encoded for browser preview)
            ImageService.encodeImage(files[0], 800, 800, function (err, b64str) {
                if (err) {
                    console.error(err);
                }
                else {
                    // Create the suggestion object and add it to suggested images
                    var localImage = {
                        origin: 'local',
                        originalUrl: b64str
                    };
                    $scope.suggestedImages.push(localImage);

                    // Select new image
                    if($scope.suggestedImages.length) {
                        $scope.selectImage($scope.suggestedImages.length - 1);
                    }

                    $scope.$apply();
                }
            });
        }
    };

    $scope.selectImage = function (index) {

        // Deselect all image suggestions
        $scope.suggestedImages.forEach(function (suggestedImage) {
            suggestedImage.selected = false;
        });

        // Select the one clicked
        var selectedImage = $scope.suggestedImages[index];
        if(selectedImage){
            selectedImage.selected = true;
        }

        // Upload image to Cloudinary if it's local
        if (selectedImage && !selectedImage.cloudinaryUrl && selectedImage.origin == "local") {
            $scope.uploadImageToCloudinary(selectedImage, function(returnedImageUrl) {
                // Set returned image URL to selected image URL
                selectedImage.cloudinaryUrl = returnedImageUrl;

                // Set the main draft image to the selected image
                $scope.image = selectedImage.cloudinaryUrl;
                console.log("Selected image saved to Cloudinary: ", $scope.image);
            });
        }
        // Don't uplaod the image if it's crawled
        else {
            $scope.image = selectedImage.originalUrl;
            console.log("Crawled image URL: ", $scope.image);
        }
    };


    $scope.uploadImageToCloudinary = function (img, cb) {

        // Tell DraftController that upload is in progress to block POST /post
        $scope.imageUploadInProgress = true;

        // Set the file to be uploaded (both a base64 string and an image URL work)
        var file = img.originalUrl;

        CloudinaryService.uploadFile(file).then(function (resp) {

            if (resp.data && resp.data.url) {
                var returnedImageUrl = String(resp.data.url);
                cb(returnedImageUrl);

                //$scope.$apply();
                $scope.imageUploadInProgress = false;
            }
            else if (resp.data && resp.data.error) {
                $scope.imageUploadInProgress = false;
                img.uploadedToCloudinary = false;
                console.error(resp.data.error);
            }
            else {
                $scope.imageUploadInProgress = false;
                img.uploadedToCloudinary = false;
                console.error('Unexpected Cloudinary response:', resp);
            }

        }).catch(function (resp) {
            $scope.imageUploadInProgress = false;
            img.uploadedToCloudinary = false;
            console.error('ERROR:', resp);
        });
    };


    function getImages() {
        ImageService[$scope.suggestionType]($scope.suggestionQuery, function (err, response) {
            // Empty suggestedImages from the crawled images, keep uploaded ones
            for (var i = 0; i < $scope.suggestedImages.length; i++) {
                var obj = $scope.suggestedImages[i];
                if (obj.origin == 'crawled') {
                    $scope.suggestedImages.splice(i, 1);
                    i--;
                }
            }

            // Add crawled images to suggestedImages
            response.forEach(function (crawledImage) {
                crawledImage.origin = 'crawled'; // Add origin to know it was crawled
                $scope.suggestedImages.unshift(crawledImage);
            });

            // Select the first image crawled, if no uplaoded image is SELECTED
            //TODO: the crawl might yield no results, in which case there is no 0th element
            if (!_.where($scope.suggestedImages, {type: 'local', selected: true}).length) {
                $scope.selectImage(0);
            }

            // Update the scope
            $scope.$apply();
        });
    }

}]);