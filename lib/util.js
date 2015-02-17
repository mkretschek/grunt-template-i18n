'use strict';

var grunt = require('grunt');

exports.dig = function (obj, id) {
  var key, val, split;

  split = id.split('.');
  val = obj;

  var i = 0;

  while (
    (key = split[i]) &&
    (val && typeof val === 'object')
  ) {
    val = val[key];
    i += 1;
  }

  return val;
};

function defaultReplacer(val) {
  return val;
}

exports.processString = function (string, params, replacer) {
  replacer = replacer || defaultReplacer;

  return string.replace(/\{(\w+)}/g, function ($0, $1) {
    var val = params[$1];

    if (!val) {
      grunt.log.warn('No replacement found for {' + $1 + '}');
      return $0;
    }

    return replacer(val);
  });
};


exports.removeInvalidFiles = function (files) {
  return files.filter(function (file) {
    if (!grunt.file.exists(file)) {
      grunt.log.warn(file + ' not found. Removed.');
      return false;
    }

    return true;
  });
};