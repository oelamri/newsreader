var _ = require('underscore');

module.exports = function (schema, options) {
    options = options || {};
    _.extend(schema.methods || (schema.methods = {}), {
        toPublicJSON: function () {
            if (!options.publicFields) { return this.toJSON(); }
            return _.pick(this.toJSON(), options.publicFields);
        },
        setMultiple: function (data) {
            _.extend(this, _.pick(data||{}, options.multisetFields || []));
        },
    });
};