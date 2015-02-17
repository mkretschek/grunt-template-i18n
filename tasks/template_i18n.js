/*
 * grunt-template-i18n
 * https://github.com/mkretschek/grunt-template-i18n
 *
 * Copyright (c) 2015 Mathias Kretschek
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var _ = require('lodash');
  var path = require('path');

  var Locale = require('../lib/locale');
  var Processor = require('../lib/processor');
  var util = require('../lib/util');

  grunt.registerMultiTask('template_i18n', 'Easy template internationalization.', function() {
    var options = this.options({
      localeSrc: null,
      pattern: Processor.DEFAULT_PATTERN,
      parser: Processor.DEFAULT_PARSER,
      processor: 'dot',
      pluralization: null,
      interpolation: null
    });

    var locale = Locale.loadSources(options.localeSrc);
    var processor = new Processor(locale, options);

    this.files.forEach(function (file) {
      if (!util.isDir(file.dest) && file.src.length > 1) {
        grunt.fail.warn(
          'Unable to process multiple source files into a single destination. ' +
          'Make sure your destination is a folder or that you have a single ' +
          'source file.'
        );
      }

      var sources = util.removeInvalidFiles(file.src);
      grunt.verbose.writeln(sources.length + ' source(s) found');

      sources.forEach(function (src) {
        grunt.verbose.write('Processing ' + src + '...');

        var dest = util.isDir(file.dest) ?
          path.join(file.dest, src) :
          file.dest;

        var content;

        try {
          content = grunt.file.read(src);
          grunt.file.write(dest, processor.process(content));
          grunt.verbose.ok();
        } catch (err) {
          grunt.verbose.error();
          grunt.log.error(err.message);
          grunt.fail.warn('Unable to internationalize ' + src);
        }

      });
    });
  });

};
