module.exports = {
  dist: {
    src: [
      '<%= yeoman.src %>/prefix.js',
      '<%= yeoman.tmp %>/<%= yeoman.outputName %>_unwrapped.js',
      '<%= yeoman.src %>/suffix.js'
    ],
    dest: '<%= yeoman.dist %>/<%= yeoman.outputName %>.js',
  }
};