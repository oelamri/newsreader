//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module, '*lectal-web*', 'config/conf');
var constants = config.get('lectal_constants');
var CLOUDINARY_CONFIG = constants.CLOUDINARY;

//#core
var _ = require('underscore');
var path = require('path');
var async = require('async');
var cloudinary = require('cloudinary');


function cloudinaryResponse(cb) {
    return function (result) { // Result comes back from Cloudinary as saved image object
        if (result.error) {
            cb(result.error);
        }
        else {
            log.debug({'Back from Cloudinary:': result});
            cb(null, result);
        }
    };
}


module.exports = {


    uploadImageViaURL: function (imageUrl, cb) {

        async.parallel({
            large: function (cb) {
                cloudinary.uploader.upload(imageUrl, cloudinaryResponse(cb), {
                    width: 700,
                    height: 600,
                    crop: 'fill',
                    format: 'jpg'
                });
            },
            medium: function (cb) {
                cloudinary.uploader.upload(imageUrl, cloudinaryResponse(cb), {
                    width: 400,
                    height: 400,
                    crop: 'fill',
                    format: 'jpg'
                });
            },
            square: function (cb) {
                cloudinary.uploader.upload(imageUrl, cloudinaryResponse(cb), {
                    width: 100,
                    height: 100,
                    crop: 'fill',
                    format: 'jpg'
                });
            }
        }, function complete(err, savedImage) {
            if (err) {
                log.error('cloudinary upload err:', err);
                cb(err);
            }
            else {
                cb(null, {
                    large: savedImage.large.url,
                    medium: savedImage.medium.url,
                    square: savedImage.square.url
                });
            }
        });
    }


};