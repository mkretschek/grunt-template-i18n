'use strict';

var _ = require('lodash');
var grunt = require('grunt');
var util = require('../util');

var DEFAULT_PATTERN = /i18n\((\w+(?:\.\w+)*)(?:,\s*([^)]+))?\)/g;

var Processors = {
  dot: './dot',
  ejs: './ejs',
  underscore: './ejs'
};

function Processor(locale, options) {
  this.locale = locale;
  this.options = _.extend({}, Processor.DefaultOptions, options || {});

  this.sub = getSubProcessor(
    this.options.processor,
    this.options.interpolation,
    this.options.pluralization
  );
}

Processor.DefaultOptions = {
  pattern: DEFAULT_PATTERN,
  parser: defaultParser,
  processor: 'dot',
  interpolation: null,
  pluralization: null
};

Processor.prototype.process = function (content) {
  var self = this;

  if (!content) {
    return content;
  }

  return content.replace(this.options.pattern, function () {
    var data = self.options.parser.apply(self, arguments);
    return self._process(data.id, data.params);
  });
};


Processor.prototype._process = function (id, params) {
  var string = this.locale.getString(id);

  if (!_.isString(string) && params.n !== undefined) {
    return this.pluralization(string, params);
  }

  return this.processString(string, params);
};

Processor.prototype.processString = function (string, params) {
  var self = this;
  return util.processString(string, params, function () {
    return self.interpolation.apply(self, arguments);
  });
};

Processor.prototype.processRule = util.processString;

Processor.prototype.pluralization = function (strings, params) {
  return this.sub.pluralization.call(this, strings, params);
};

Processor.prototype.interpolation = function (val) {
  return this.sub.interpolation.call(this, val);
};


function getSubProcessor(id, interpolation, pluralization) {
  var processor;

  if (_.isObject(id)) {
    return id;
  }

  if (id) {
    processor = Processors[id];
    if (processor && _.isString(processor)) {
      try {
        processor = require(processor);
      } catch (err) {
        grunt.verbose.warn('Unable to load module "' + processor + '"');

        try {
          processor = require(id);
        } catch (err) {
          grunt.verbose.warn('Unable to load module "' + id + '"');
        }
      }
    }
  }

  if (!processor || _.isString(processor)) {
    processor = Object.create(null);
  } else {
    // Protect the original processor
    processor = Object.create(processor);
  }

  if (interpolation) {
    processor.interpolation = interpolation;
  }

  if (!processor.interpolation) {
    grunt.fail.warn(
      'Missing interpolation builder. Either select a valid `processor` ' +
      'or set an `interpolation` function.'
    );
  }

  if (pluralization) {
    processor.pluralization = pluralization;
  }

  if (!processor.pluralization) {
    grunt.fail.warn(
      'Missing pluralization builder. Either select a valid `processor` ' +
      'or set a `pluralization` function.'
    );
  }

  return processor;
}


function defaultParser(match, id, params) {
  return {
    id: id,
    params: parseParams(params)
  };
}

function parseParams(params) {
  if (!params || typeof params !== 'string') {
    return {};
  }

  if (params[0] === '{') {
    return JSON.parse(params.replace(/([\w\.]+)/g, '"$1"'));
  }

  if (/^([\w\.]+)$/.test(params)) {
    return {n: params};
  }

  throw(new Error('Invalid params: ' + params));
}


module.exports = Processor;