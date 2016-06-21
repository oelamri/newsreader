var Bitly = require('bitly');

var bitly = new Bitly('lectal', 'R_9a799277721c4faba002ecd1c7bb1e6b');

module.exports = {
    shorten: function (url, cb) {
        return bitly.shorten(url, function (err, response) {
            if (err) { return cb(err); }
            return cb(null, response.data.url);
        });
    },
};
