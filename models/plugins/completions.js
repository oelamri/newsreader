var regexp = require('../../services/regexp');

module.exports = function (schema, options) {
    options = options || {};

    var fields = {
        name: options.name || 'name',
        names: options.names || 'names',
        id: options.id || 'topicId',
        image: options.image || 'image',
        handle: options.handle || 'handle',
    };

    fields.searchOn = options.searchOn || [fields.name];

    schema.add({names: [String] });

    schema.statics = schema.statics || {};

    schema.statics.findCompletions = function (string, cb) {
        var Model = this;
        var terms = string.split(/\s+/).filter(function (str) { return !!str; });

        var andPart = terms.map(function (term) {
            return {
                names: new RegExp('^' + regexp.quote(term),'i')
            };
        });

        if (options.query) { andPart.push(options.query); }

        if (andPart.length < 1) { return cb(null, []); }
        var query = andPart.length === 1 ? andPart[0] : {$and: andPart};

        return this.find(query,{},{limit: 100}).lean().exec(function (err, instances) {
            if (err) { return cb(err); }
            cb(err, instances.map(function (inst) {
                var obj = {
                    name: inst[fields.name],
                    handle: inst[fields.handle],
                    names: inst[fields.names],
                    model: Model.modelName,
                    image: inst.image,
                };

                obj[fields.id] = inst[fields.id];

                return obj;
            }));
        });
    };

    schema.pre('save', function (next) {
        var self = this;
        var names = {};

        fields.searchOn.forEach(function (field) {
            var value = self[field];
            if (value) {
                names[value] = 1;
                value.replace(/([A-Z]+)/g, ' $1').replace(/^\x20+/,'').split(/\x20+/).forEach(function (part) {
                    names[part] = 1;
                });
            }
        });

        this.names = Object.keys(names);
        next();
    });
};

