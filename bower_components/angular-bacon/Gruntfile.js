module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    // Task configuration.
    coffee: {
      lib: {
        expand: true,
        flatten: true,
        cwd: 'src',
        src: '*.coffee',
        dest: 'dist',
        ext: '.js'
      },
      test: {
        expand: true,
        flatten: true,
        cwd: 'test',
        src: '*.coffee',
        dest: 'test',
        ext: '.js'        
      }
    },
    jasmine: {
      spec: {
        src: 'dist/angular-bacon.js',
        options: {
          specs: 'test/angular-bacon-spec.js',
          vendor: [
            'components/bacon/dist/Bacon.js',
            'components/angular/angular.js',
            'components/angular-mocks/angular-mocks.js'
          ]
        }
      }
    },
    clean: {
      release: [ "dist" ]
    },
    uglify: {
      options: {
      },
      dist: {
        src: '<%= coffee.lib.dest %>/*.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    }
  });

  // Default task.
  grunt.registerTask('test', ['coffee', 'jasmine']);
  grunt.registerTask('default', ['clean','test', 'uglify']);

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jasmine');

};