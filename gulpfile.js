'use strict';

var extend      = require('deep-extend');
var del         = require('del');
var browserSync = require('browser-sync');
var gulp        = require('gulp');
var $           = require('gulp-load-plugins')();
var Server      = require('karma').Server;
var webpack     = require('webpack-stream');
var argv        = require('yargs').argv;
var runSequence = require('run-sequence');
var webpackConfig = extend({}, require('./webpack.config.js'));

console.log('webpackConfig', webpackConfig);

// -------------------------------------------
// Configuration
// -------------------------------------------

var paths = {
  src      : __dirname + '/src',
  dist     : __dirname + '/dist',
  examples : __dirname + '/examples',
  bower    : __dirname + '/examples/bower_components'
};

var patterns = {
  js          : paths.src + '/**/*.js'
};

gulp.task('clean', function () {
  return del([
    paths.dist + '/**/*',
    paths.examples + '/dist/**/*'
  ]);
});

gulp.task('webpack', function() {
  return gulp.src(paths.src + '/main.js')
    .pipe(webpack(extend(webpackConfig, {
      output: {
        filename: 'labella.js',
        sourceMapFilename: '[file].map',
        library: 'labella',
        libraryTarget: 'umd',
        umdNamedDefine: false
      },
      devtool: argv.debug ? 'eval' : undefined
    })))
    .pipe(gulp.dest(paths.dist))
    .pipe(gulp.dest(paths.examples+'/dist'))
    .pipe($.uglify({
      report: 'min',
      mangle: true,
      compress: true, //true,
      preserveComments: false
    }))
    .pipe($.rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest(paths.dist))
    .pipe(gulp.dest(paths.examples+'/dist'));
});

/* Run test once and exit */
gulp.task('test', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done).start();
});

/* Watch for file changes and re-run tests on each change */
gulp.task('tdd', function (done) {
  new Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});

/* Start browser-sync */
gulp.task('browser-sync', ['build'], function() {
  browserSync.init({
    server: './examples',
    files: ['examples/**/*.*'],
    browser: 'google chrome',
    port: 7000,
  });
});

var buildTasks = [];

/* Build everything */
gulp.task('build', function(done){
  runSequence('clean', buildTasks.concat(['webpack']), done);
});

/* Watch for individual file changes and build as needed */
gulp.task('watch', ['build'], function(){
  buildTasks.forEach(function(task){
    gulp.watch(patterns[task], [task]);
  });

  gulp.watch(patterns.js, ['webpack']);
});

gulp.task('run', ['watch', 'browser-sync']);
gulp.task('default', ['run']);

/* Deployment */
gulp.task('gh-pages', ['build'], function() {
  return gulp.src(paths.examples + '/**/*')
    .pipe($.ghPages());
});

/* Add release tasks */
$.releaseTasks(gulp);