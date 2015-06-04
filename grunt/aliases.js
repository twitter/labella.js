module.exports = {
  build: {
    description: 'Build distribution package.',
    tasks: [
      'clean:dist',
      'requirejs:dist',
      'concat:dist',
      'uglify:dist',
      'copy:dist',
      'clean:tmp'
    ]
  },

  clear: {
    description: 'Remove all distribution files.',
    tasks: ['clean:dist']
  },
  clearDev: {
    description: 'Remove all dependencies and build tools.',
    tasks: ['clean:dep']
  },

  'default': {
    description: 'Watch for changes and trigger builds.',
    tasks: ['build', 'connect:livereload', 'watch']
  },

  // Tasks related to test
  'test': ['karma:dev'],
  'test-ci': ['karma:ci'],

  // Tasks related to publishing
  'publish:patch': {
    description: 'Bundle code, bump version by 0.0.1 and publish to npm and bower',
    tasks: [
      'build',
      'bump:patch',
      'shell:publish'
    ]
  },
  'publish:minor': {
    description: 'Bundle code, bump version by 0.1 and publish to npm and bower',
    tasks: [
      'build',
      'bump:minor',
      'shell:publish'
    ]
  },
  'publish:major': {
    description: 'Bundle code, bump version by 1 and publish to npm and bower',
    tasks: [
      'build',
      'bump:major',
      'shell:publish'
    ]
  },
  'publish': ['publish:patch']
};