var Busboy = require('busboy');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var RE_MIME = /^(?:multipart\/.+)$/i;

function hasBody(req) {
  var encoding = 'transfer-encoding' in req.headers,
      length = 'content-length' in req.headers && req.headers['content-length'] !== '0';
  return encoding || length;
}

function mime(req) {
  var str = req.headers['content-type'] || '';
  return str.split(';')[0];
}

function noop() {}

module.exports = function (options) {
    options = _.clone(options || {});

    if (!options.tmpDir) {
        console.error('busboy middleware requires tmpDir');
        process.exit(1);
    }

    return function (req, res, next) {
        if ( req.method === 'GET' || req.method === 'HEAD' || !hasBody(req) ||
            !RE_MIME.test(mime(req)) ) { return next(); }

        options.headers = req.headers;
        var busboy = new Busboy(options);
        req.pipe(busboy);

        req.body = req.body || {};
        req.files = req.files || [];

        busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated) {
            req.body[fieldname] = val;
        });

        var tasks = 1;
        function done() { if (--tasks === 0) { next(); } }

        busboy.on('file', function (field, stream, origname) {
            ++tasks;
            var extension = path.extname(origname || '');
            var filePath = path.join(options.tmpDir, crypto.randomBytes(12).toString('hex') + extension);
            var writeStream = fs.createWriteStream(filePath);
            stream.pipe(writeStream)
            .on('error', function () {
                fs.unlink(filePath);
                done();
            }).on('finish', function () {
                req.files.push({
                    field: field,
                    filePath: filePath,
                    origname: origname,
                });
                done();
            });
        });

        // monkey-patch res.end to unlink the tmp files
        var oldEnd = res.end;
        res.end = function () {
            if (req.files) { _.pluck(req.files, 'filePath').forEach(function (filePath) { fs.unlink(filePath, noop); }); }
            oldEnd.apply(res, arguments);
        };

        busboy.on('finish', done);
    };
};
