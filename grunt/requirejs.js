module.exports = {
  dist: {
    // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
    options: {
      baseUrl: '<%= yeoman.src %>',
      name: '<%= yeoman.outputName %>',
      out:  '<%= yeoman.tmp %>/<%= yeoman.outputName %>_unwrapped.js',
      optimize: 'none',
      // TODO: Figure out how to make sourcemaps work with grunt-usemin
      // https://github.com/yeoman/grunt-usemin/issues/30
      // generateSourceMaps: true,
      // required to support SourceMaps
      // http://requirejs.org/docs/errors.html#sourcemapcomments
      preserveLicenseComments: true,
      useStrict: false,
      wrap: false,
      uglify2: {},
      paths: {
        'd3': 'empty:',
        'lodash': '../bower_components/lodash'
      },
      skipModuleInsertion: true,
      onBuildWrite: function (moduleName, path, contents) {
        return module.require('amdclean').clean({code: contents, wrap:{start:'', end:''}});
      }
    }
  }
};