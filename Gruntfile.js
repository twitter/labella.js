/* jshint ignore:start */

'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks and config automatically
  // Read: https://github.com/firstandthird/load-grunt-config
  require('load-grunt-config')(grunt, {
    postProcess: function(config){
      // Project settings
      config.yeoman = {
        // Configurable paths
        root       : '.',
        src        : 'src',
        test       : 'test',
        tmp        : 'tmp',
        dist       : 'dist',
        outputName : 'labella'
      };
      return config;
    }
  });

  // For task aliases, see grunt/aliases.js
};