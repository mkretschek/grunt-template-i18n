/*
 * grunt-template-i18n
 * https://github.com/mkretschek/grunt-template-i18n
 *
 * Copyright (c) 2015 Mathias Kretschek
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    template_i18n: {

      // Test the plugin's default options
      default_options: {
        options: {
          localeSrc: 'test/fixtures/en.yml'
        },
        files: [{
          src: 'test/fixtures/test.dot',
          dest: 'tmp/default_options.dot'
        }]
      },

      // Test the doT processor
      dot_processor: {
        options: {
          localeSrc: 'test/fixtures/en.yml',
          processor: 'dot'
        },
        files: [{
          src: 'test/fixtures/test.dot',
          dest: 'tmp/dot_processor.dot'
        }]
      },

      // Test the EJS processor
      ejs_processor: {
        options: {
          localeSrc: 'test/fixtures/en.yml',
          processor: 'ejs'
        },
        files: [{
          src: 'test/fixtures/test.ejs',
          dest: 'tmp/ejs_processor.ejs'
        }]
      },

      // Test the underscore template processor
      underscore_processor: {
        options: {
          localeSrc: 'test/fixtures/en.yml',
          processor: 'underscore'
        },
        files: [{
          src: 'test/fixtures/test.underscore.html',
          dest: 'tmp/underscore_processor.html'
        }]
      },

      // Test a custom pattern and parser
      custom_pattern: {
        options: {
          processor: 'dot',
          localeSrc: 'test/fixtures/en.yml',
          pattern: /foobarbaz/g,
          parser: function () {
            return {
              id: 'test.interpolation',
              params: {
                foo: 'bar'
              }
            }
          }
        },
        files: [{
          src: 'test/fixtures/custom_pattern.dot',
          dest: 'tmp/custom_pattern.dot'
        }]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'template_i18n', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
