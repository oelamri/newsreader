
module.exports = {

    ignoreCountsInHandleRequest: function(req, res, next) {
        req.ignoreCountsInHandleRequest = true;
        next();
    }

};
