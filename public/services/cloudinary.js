app.factory('CloudinaryService', function ($http, $q, $upload, CONFIG) {

    // Configure Cloudinary:
    // $.cloudinary.config({cloud_name: CONFIG.CLOUDINARY.CLOUD_NAME, api_key: CONFIG.CLOUDINARY.API_KEY});


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
    }

});