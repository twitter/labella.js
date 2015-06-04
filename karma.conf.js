// Karma configuration
// Generated on Fri Aug 15 2014 23:01:08 GMT-0700 (PDT)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'requirejs'],

    // list of files / patterns to load in the browser
    files: [
      'test/karma-main.js',
      {pattern: 'bower_components/**/*.js', included: false},
      {pattern: 'bower_components/**/*.min.js', included: false},
      {pattern: 'src/**/*.js', included: false}
    ],

    // list of files to exclude
    exclude: [
      'src/prefix.js',
      'src/suffix.js',
      'coverage/**/*.js'
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'src/**/*[!spec].js':  ['coverage']
    },

    // test results reporter to use
    // possible values: 'dots', 'progress', 'mocha', 'coverage'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['mocha', 'coverage'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [
      'PhantomJS',
      // 'Chrome',
      // 'Firefox'
    ],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
