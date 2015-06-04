// Karma things
var allTestFiles = [];
var TEST_REGEXP = /src\/.*\.(spec)\.js$/i;

var pathToModule = function(path) {
  return path.replace(/^\/base\/src\//, '').replace(/\.js$/, '');
};

Object.keys(window.__karma__.files).forEach(function(file) {
  if (TEST_REGEXP.test(file)) {
    // Normalize paths to RequireJS module names.
    allTestFiles.push(pathToModule(file));
  }
});

// Define paths to 3rd party libraries
require.config({
  // Karma serves files under /base, which is the "basePath" from your config file
  baseUrl: '/base/src',
  paths: {
    'd3':                    '../bower_components/d3/d3.min',
    'jquery':                '../bower_components/jquery/dist/jquery.min',
    // dev dependencies
    'chai':                  '../bower_components/chai/chai',
    'chai-as-promised':      '../bower_components/chai-as-promised/lib/chai-as-promised'
  },
  shim: {
    'chai':                   {exports: 'chai'},
    'chai-as-promised':       {deps: ['chai']}
  }
});

require(['chai'], function(chai){
  // attach chai expect to window so we can use in tests
  window.expect = chai.expect;

  require.config({
    // dynamically load all test files
    deps: allTestFiles,
    // we have to kickoff karma after all the test cases are loaded.
    callback: window.__karma__.start,
  });
});