var _ = require('underscore');

module.exports = function (schema, options) {
    var required = _.has(options||{},'required') ? !!options.required : true;

    schema.add({
        image: {
            small: {
                type: String
            },
            medium: {
                type: String
            },
            original: {
                type: String
            },
        }
    });
};

