var assert = require('assert');


describe('@test-dep-check', function () {

    it('[test]', function (done) {

        var ndc = require('nodejs-dep-check');

        var result = ndc.run({
            verbose: true,
            ignorePaths: ['./node_modules', './public'],
            ignoreDirs: ['node_modules', 'test', 'gulpfile.js'],
            ignoreModules: ['colors/safe']
        });

        done(result);

    });

});