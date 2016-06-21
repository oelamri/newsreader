var jwt = require('jwt-simple');
var secret = 'cantona07+';


module.exports = {

    generateToken: function (user) {
        return jwt.encode({
            //"userId": user.userId,
            "_id": user._id,
            "lectal-service": "lectal-web",
            "expiresOn": new Date(Date.now() + 43200000)  //expires in 12 hours
        }, secret);
    }

};