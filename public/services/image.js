app.factory('ImageService', ['$q', '$http', '$upload', 'CONFIG', function ($q,  $http, $upload, CONFIG) {

    return {

        uploadUrl: function (imgUrl) {

            $.cloudinary.uploader.upload(imageUrl, function cloudinaryResponse(result) {
                // Result comes back from Cloudinary as saved image object

                if (result.error) {
                    console.error(result);
                    cb(result.error, result);
                }
                else {
                    console.log('Back from Cloudinary: ', result.publicId, result.url);
                    cb(null, result);
                }

            }, {
                width: 700,
                height: 700,
                //width: 200,
                //height: 200,
                crop: 'fill',
                format: 'jpg'
            });
        },

        uploadFile: function (img) {

            if (img) {
                return $upload.upload({
                    url: 'https://api.cloudinary.com/v1_1/' + CONFIG.CLOUDINARY.CLOUD_NAME + '/upload',
                    data: {
                        upload_preset: 'egtzo9rg',
                        file: img
                        //'transformation': 'c_limit,h_1000,w_1000/fl_relative,l_my_watermark,w_0.5',
                    },
                    fields: {
                        //'transformation': 'c_limit,h_1000,w_1000/fl_relative,l_my_watermark,w_0.5',
                        tags: 'm$$$$yphotoalbum', //TODO fill in these values with correct values
                        context: 'photo=tarzan'
                    },
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'lectal-authorization': undefined
                    },
                    withCredentials: false

                });
            }
            else {
                return $q.reject(new Error('no image passed to cloudinary service'));
            }
        },

        fetch: function (imgUrl) {
            return 'http://res.cloudinary.com/' + CONFIG.CLOUDINARY.CLOUD_NAME + '/image/fetch/' + imgUrl
        },

        crawl: function (urlVar, callback) {

            var url = null;
            try {
                url = new URL(urlVar);
            }
            catch (err) {
                console.error(urlVar + ' => is not a valid url string\n' + err);
                return;
            }

            // Make call to API to get crawled images
            $http({
                method: 'POST',
                url: CONFIG.API.BASE_URL + '/1/images/crawl',
                dataType: 'json',
                data: {
                    domain: url.hostname,
                    url: url.href
                }
            }).then(function (resp) {
                if (resp.data && resp.data.success) {
                    outputImages(resp.data.success, callback);
                    console.log("Image URL's: ", resp.data.success);
                }
                else if (resp.data.error) {
                    console.error(resp.data.error);
                }
                else {
                    console.error(new Error('Unexpected server response:' + resp));
                }

            }).catch(function (err) {
                console.error(err);
            });
        },

        search: function (query, callback) {
            $http({
                url: CONFIG.API.BASE_URL + '/1/images/search',
                method: 'GET',
                params: {
                    'data': JSON.stringify({query: query})
                }
            }).then(
                function success(resp) {

                    if(resp.data && resp.data.success) {
                        console.log('bingSearch resp:', resp.data.success);

                        // Clean Bing response data
                        var bingResponse = [];
                        _.each(resp.data.success, function(imgObj) {
                           bingResponse.push(imgObj.MediaUrl);
                        });
                        outputImages(bingResponse, callback);
                    }
                },
                function error(err) {
                    console.log('bingSearch err:', err);
                }
            );
        },

        encodeImage: function (file, maxWidth, maxHeight, cb) {

            //TODO: actually use maxWidth/maxHeight instead of hardcoding below

            var reader = new FileReader();

            reader.onload = function () {

                var tempImage = new Image();

                tempImage.onload = function () {
                    var height = tempImage.height;
                    var width = tempImage.width;
                    if (height > 800) { // Max height for our purposes is 100 pixels
                        width = width / (height / 800);
                        height = 800;
                    }
                    if (width > 800) { // Max width for our purposes is 150 pixels
                        height = height / (width / 800);
                        width = 800;
                    }
                    var c = document.createElement('canvas');
                    c.width = width;
                    c.height = height;
                    var ctx = c.getContext('2d');
                    ctx.drawImage(tempImage, 0, 0, width, height);
                    var b64str = c.toDataURL('image/jpeg'); // grab a base64 copy of the resized image as a jpeg

                    cb(null, b64str);
                };

                tempImage.src = reader.result; // to get the base64 result
            };

            reader.readAsDataURL(file);
        },

        getBase64Image: function (img) {
            // Create an empty canvas element
            var canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Copy the image contents to the canvas
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Get the data-URL formatted image
            // Firefox supports PNG and JPEG. You could check img.src to
            // guess the original format, but be aware the using 'image/jpg'
            // will re-encode the image.
            var dataURL = String(canvas.toDataURL('image/jpeg')); //TODO: need to check extensions in imageURL

            return dataURL.replace(/^data:image\/(png|jpg);base64,/, '');
        }
    };

    function outputImages(imageURLArray, callback) {

        var images = [];

        async.each(imageURLArray, function (item, cb) {
            cb = _.once(cb);

            // Creating an image tag
            var imageTag = new Image();
            imageTag.src = item;

            imageTag.onload = function () {
                // Getting area
                var imageArea = (imageTag.naturalWidth * imageTag.naturalHeight) || (imageTag.width * imageTag.height);

                if (imageArea < 1000000  && imageArea > 1000) {
                    images.push({
                        imageObject: imageTag,
                        originalUrl: item,
                        area: imageArea
                    });
                    console.log('imageArea: ', imageArea);
                    console.log('image array:', images);
                }
                cb(null);
            };


        }, function complete(err) {
            console.log('Images presorted: ', images);
            // Sort created images by width descending
            callback(err, images.sort(function (a, b) {
                return (a.area || 1) - (b.area || 1);
            }).slice(0, 5)); // Get largest 5
        });
    }

}]);
