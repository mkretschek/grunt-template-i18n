'use strict';

var _ = require('lodash');
var path = require('path');
var grunt = require('grunt');
var util = require('./util');


function Locale() {
  this.strings = {};
}


Locale.prototype.load = function (src) {
  if (Array.isArray(src)) {
    _.forEach(src, function (s) {
      this.load(s);
    }, this);

    return;
  }

  var ext = path.extname(src);

  grunt.verbose.write('Loading strings from ' + src + '...');
  try {
    switch (ext) {
      case '.yaml':
      case '.yml':
        _.merge(this.strings, grunt.file.readYAML(src));
        break;

      case '.json':
      case '.js':
        _.merge(this.strings, require(src));
        break;
    }

    grunt.verbose.ok();
  } catch (err) {
    grunt.verbose.error();
    grunt.fail.error(err.message);
  }
};


Locale.prototype.getPluralRule = function (id) {
  var plural = this.strings.plural || {};

  var rule = util.dig(plural, id);

  if (!rule) {
    grunt.log.warn('Plural rule not found: "' + id + '"');
  }

  return rule;
};


Locale.prototype.getString = function (id) {
  var string = util.dig(this.strings, id);

  if (!string) {
    grunt.log.warn('String not found: "' + id + '"');
    return id;
  }

  return string;
};



Locale.loadSources = function (src) {
  if (!src) {
    grunt.fail.warn('No locale file set (see `options.localeSrc`).');
  }

  var localeSrc = util.removeInvalidFiles(grunt.file.expand(src));
  grunt.verbose.writeln(localeSrc.length + ' locale file(s) found');

  if (!localeSrc.length) {
    grunt.fail.warn('Unable to find locale sources');
  }

  var locale = new Locale();
  locale.load(src);
  return locale;
};



module.exports = Locale;