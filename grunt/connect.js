// The actual grunt server settings
module.exports = {
  options: {
    port: 9000,
    livereload: 35729,
    // Change this to 'localhost' to access the server only from the same computer
    // Change to '0.0.0.0' to also access from mobile, etc.
    hostname: 'localhost'
  },
  livereload: {
    options: {
      open: true,
      base: [
        '<%= yeoman.app %>'
      ]
    }
  }
};