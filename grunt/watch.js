module.exports = {
  options: {
    livereload: true
  },
  // if src or script change, rebuild and signal page reload
  scripts: {
    files: ['src/**/*.js'],
    tasks: ['build']
  },
  examples: {
    files: ['examples/**/*.js', 'examples/**/*.html'],
    tasks: [],
  }
};