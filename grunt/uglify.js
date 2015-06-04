module.exports = {
  dist: {
    files: {
      '<%= yeoman.dist %>/<%= yeoman.outputName %>.min.js': [
        '<%= yeoman.dist %>/<%= yeoman.outputName %>.js'
      ]
    },
    options:{
      report: 'min',
      mangle: true,
      compress: true,
      preserveComments: false
    }
  }
};