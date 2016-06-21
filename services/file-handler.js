var log = require('lectal-logger');

var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var _ = require('underscore');
var path = require('path');
var crypto = require('crypto');
var async = require('async');
var cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: 'hec1xjapp',
    api_key: '242428125318612',
    api_secret: 'vdcRZKzMXIrdI7hbz_9MEwxNwds'
});

function cloudinaryToNode(done) {
    return function (result) {
        if (result.error) {
            log.error(result.error);
            done(result.error);
        }
        else {
            log.debug('Back from Cloudinary:', result);
            done(null, result);
        }
    };
}

var SIZE_SMALL = 100, SIZE_MEDIUM = 300;

var FileHandler = module.exports = {
    toFsPath: function (urlPath) {
        return path.join(__dirname, '../public/', urlPath);
    },

    uploadImageFor: function (req, Model, cb) {
        var tasks = 0;

        var file = req.files && req.files.length === 1 && req.files[0];
        if (!file) {
            return cb(new Error());
        }

        log.debug('UPLOADING IMAGE HERE: ', file.filePath);

        gm(file.filePath)
            .size(function (err, size) {
                if (err) {
                    return cb(err);
                }

                log.debug('THE SIZE FROM GM IS: ', size);

                // crop it to a square
                var dim = Math.min(size.width, size.height);
                this.crop(dim, dim, (size.width - dim) / 2, (size.height - dim) / 2);

                // save small, medium and original
                this.stream(function (err, stdout, stderr) {
                    if (err) {
                        return cb(err);
                    }

                    async.parallel({
                        original: function (done) {
                            log.debug('ATTEMPTIMG TO UPLOAD TO CLOUDINARY');
                            cloudinary.uploader.upload(file.filePath, cloudinaryToNode(done));
                        },
                        small: function (done) {
                            var stream = cloudinary.uploader.upload_stream(cloudinaryToNode(done));
                            gm(stdout).resize(SIZE_SMALL, SIZE_SMALL).stream()
                                .on('data', stream.write).on('end', stream.end);
                        },
                        medium: function (done) {
                            var stream = cloudinary.uploader.upload_stream(cloudinaryToNode(done));
                            gm(stdout).resize(SIZE_MEDIUM, SIZE_MEDIUM).stream()
                                .on('data', stream.write).on('end', stream.end);
                        }
                    }, function (err, obj) {
                        if (err) {
                            console.error(err);
                            return cb(err);
                        }
                        cb(err, {
                            small: obj.small.url,
                            medium: obj.medium.url,
                            original: obj.original.url
                        });
                    });
                });
            });
    }
};
