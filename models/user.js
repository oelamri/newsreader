var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
var imagePlugin = require('./plugins/image');
var _ = require('underscore');
var FormValidation = require('../services/form-validation');
var completions = require('./plugins/completions');
var publicJSON = require('./plugins/public-json');
var bcrypt2 = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var REQUIRED_PASSWORD_LENGTH = 8;


var userSchema = new mongoose.Schema({

    email: String,
    password: String,
    username: String,
    fullname: String,

    picture: {
        original: String,
        large: String,
        medium: String
    },

    accounts: {

        twitter: {
            id: String,
            username: String,
            name: String,
            picture: String,
            token: String,
            tokenCreatedAt: Date,
            secret: String
        },

        facebook: {
            id: String,
            username: String,
            name: String,
            picture: String,
            token: String,
            tokenCreatedAt: Date,
            secret: String
        },

        linkedin: {
            id: String,
            username: String,
            name: String,
            picture: String,
            token: String,
            tokenCreatedAt: Date,
            secret: String
        }
    },

    following: [{
        kind: String,
        followeeId: Schema.Types.ObjectId, // topicId or userId
        dateCreated: {
            type: Date,
            default: Date.now()
        }
    }],


    followers: [{
        followerId: Schema.Types.ObjectId,
        dateCreated: {
            type: Date,
            default: Date.now()
        }
    }],

    notifications: [{
        message: {
            who: [Schema.Types.ObjectId],
            did: String,
            what: {
                kind:  String, // Post or user
                id: Schema.Types.ObjectId
            }
        },

        isRead: Boolean,

        dateCreated: {
            type: Date,
            default: Date.now()
        },
        dateUpdated: {
            type: Date,
            default: Date.now()
        }
    }],

    checks: {

        isVerified: {
            type: Boolean,
            default: false
        },

        isSetup: {
            type: Boolean,
            default: false
        },

        isAdmin: {
            type: Boolean,
            default: false
        },

        isBlocked: {
            type: Boolean,
            default: false
        },

        isDisabled: {
            type: Boolean,
            default: false
        },

        inBeta: {
            type: Boolean,
            default: false
        }
    },

    createdBy: Schema.Types.ObjectId,
    dateCreated: {
        type: Date,
        default: Date.now()
    },

    updatedBy: Schema.Types.ObjectId,
    dateUpdated: {
        type: Date,
        default: Date.now()
    }

});

userSchema.pre('save', function (cb) {

    var self = this;

    if (self.passwordPreHash) { // This temp property should only be defined when saving a new password

        bcrypt2.hash(self.passwordPreHash, SALT_WORK_FACTOR, function (err, hash) {
            if (err) {
                console.error(err);
                cb(err);
            }
            else if (hash == null) {
                cb(new Error('null/undefined hash'));
            }
            else {
                self.password = hash;
                cb(null);
            }
        });
    }
    else {
        cb(null);
    }

});

userSchema.statics.findByEmailAndPassword = function (email, password, cb) {

    this.findOne({email: email}, function (err, user) {
        if (err) {
            return cb(err);
        }
        else if (!user) {
            return cb();
        }
        else {
            bcrypt.compare(password, user.passwordHash, function (err, res) {
                return cb(err, res ? user : null);
            });
        }

    });

};

userSchema.methods = {
    generateHash: function (password) {
        return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
    },

    validPassword: function (candidate) {
        return bcrypt2.compareSync(candidate, this.password);
    },

    validateGuestPassword: function (pwd) {
        return pwd === this.password;
    }
};

userSchema.plugin(completions, {
    name: 'fullname',
    handle: 'username',
    id: '_id',
    searchOn: ['fullname', 'username'],
    query: {
        inBeta: true
    }
});

userSchema.plugin(imagePlugin, {
    required: false
});

userSchema.plugin(publicJSON, {
    publicFields: ['username', 'fullname', 'picture'],
    multisetFields: ['username', 'fullname', 'picture']
});

module.exports = mongoose.model('User', userSchema);
