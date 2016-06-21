//#logging
var log = require('lectal-logger');

//#config
var config = require('univ-config')(module,'*lectal-web*', 'config/conf');
var serverConfig = config.get('lectal_env').lectal_web_server;
var constants = config.get('lectal_constants');
var cloudinaryConfig = constants.cloudinary;

//#core
var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var _ = require('underscore');
var path = require('path');
var async = require('async');
var cloudinary = require('cloudinary');


cloudinary.config({
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key,
    api_secret: cloudinaryConfig.api_secret
});

module.exports = {
	uploadImage: function(path) {
		log.debug('The file is HERE:', path);
		log.debug('Uploading to Cloudinary...');
		cloudinary.uploader.upload(path.filePath, function(result) { 
			log.debug('Back from Cloudinary:', result);
		}, { width: 150, height: 150, crop: 'fill', format: 'jpg' });
	}
};