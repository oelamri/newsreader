var gulp = require('gulp');
var config = require('./gulp.config')();
var less = require('gulp-less');
var autoprefix = require('gulp-autoprefixer');
var $ = require('gulp-load-plugins')({lazy: true});
var defaultHeader = require('./config/default-header');
var nodemon = require('gulp-nodemon');

var argv = process.env.argv;
var $node_env = process.env.NODE_ENV;


gulp.task('less', function () {
   gulp.src('public/styles/main.less')
      .pipe(less({compress: true}))
      .pipe(autoprefix())
      .pipe(gulp.dest('public/styles'));
});



gulp.task('watch', function () {
   gulp.watch('public/styles/sheets/*.less', ['less']);
});


var startFile = null;

if(/^DEV_/.test(String($node_env).toUpperCase())){
   startFile = 'bin/_www';
}
else{
   startFile = 'bin/_www';
}


gulp.task('nodemon', [], function () {

   nodemon({

      script: startFile,
      ext: 'js',
      ignore: ['public/*', '*.git/*', '*.idea/*', 'gulpfile.js'],
      args: [], //TODO: Add these from command line
      nodeArgs: ['--harmony'],
      env: {
         NODE_ENV: $node_env
      }

   }).on('restart', []);

});


// New stuff

gulp.task('wiredep', function() {
   var options = config.getWiredepDefaultOptions();
   var wiredep = require('wiredep').stream;

   return gulp
         .src(config.index)
         .pipe(wiredep(options))
         .pipe($.inject(gulp.src(config.clientjs), {ignorePath: '/public/'}))
         .pipe(gulp.dest('./views/includes/'));
});

gulp.task('uglify', function() {
   return gulp
         .src(config.clientjs)
         .pipe($.ngAnnotate())
         .pipe($.concat('app.js'))
         .pipe($.uglify())
         .pipe(gulp.dest(config.client + 'scripts/'));
});






