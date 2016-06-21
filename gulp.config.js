module.exports = function() {
  var client = './public/';
  var includes = './views/includes/';
  
  var config = {

    // All ng js files
    clientjs: [
      client + 'main.js',
      client + 'routes.js',
      client + '/constants/*.js',
      client + 'services/*.js',
      client + 'controllers/*.js',
      client + 'directives/*.js',
      '!' + client + 'bower_components/**/*.js',
      '!' + client + 'vendor/**/*.js',
      '!' + client + 'plugins/**/*.js'
    ],

    // Dependencies
    includes: includes,
    index: includes + 'dependencies.ejs',
    
    // Main css
    maincss: client + 'styles/main.css',

    // Public folder and scripts
    client: client,
    vendorScripts: client + 'scripts/vendor/',

    // Bower and NPM locations
    bower: {
      json: require('./bower.json'),
      directory: './public/bower_components/',
      ignore: '../../public'
    }

  };

  config.getWiredepDefaultOptions = function() {
    return options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignore
    };
  };

  return config;
};