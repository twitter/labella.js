module.exports = {
  // clean temporary folder
  tmp: {
    files: [{
      dot: true,
      src: ['<%= yeoman.tmp %>/*']
    }]
  },
  // clean distribution
  dist: {
    files: [{
      dot: true,
      src: ['<%= yeoman.dist %>/*']
    }]
  },
  // clean dependencies
  dep: {
    files: [{
      dot: true,
      src: ['node_modules', 'bower_components']
    }]
  }
};