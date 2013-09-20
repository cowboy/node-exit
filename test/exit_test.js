'use strict';

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

var fs = require('fs');
var exec = require('child_process').exec;
var async = require('async');
var jsdiff = require('diff');

function run(command, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  command += ' 2>&1';
  if (options.pipe) {
    command += ' | ' + (process.platform === 'win32' ? 'find' : 'grep') + ' "std"';
  }
  exec(command, function(error, stdout) {
    callback(error ? error.code : 0, stdout);
  });
}

function showDiff(actual, expected) {
  actual = actual.replace(/\r\n/g, '\n');
  expected = expected.replace(/\r\n/g, '\n');
  if (actual === expected) {
    return true;
  } else {
    return jsdiff.diffLines(expected, actual).map(function(d) {
      if (d.removed) {
        return '**EXPECTED** ' + d.value;
      } else if (d.added) {
        return '**UNEXPECTED** ' + d.value;
      }
    }).filter(Boolean).join('');
  }
}

function fixture(filename) {
  return String(fs.readFileSync(filename));
}

exports['exit'] = {
  setUp: function(done) {
    this.origCwd = process.cwd();
    process.chdir('test/fixtures');
    done();
  },
  tearDown: function(done) {
    process.chdir(this.origCwd);
    done();
  },
  'stdout stderr': function(test) {
    var counts = [10, 100, 1000];
    test.expect(counts.length);
    async.eachSeries(counts, function(n, next) {
      var command = 'node log.js 0 ' + n + ' stdout stderr';
      run(command, {pipe: true}, function(code, actual) {
        var expected = fixture(n + '-stdout-stderr.txt');
        test.equal(true, showDiff(actual, expected), command);
        next();
      });
    }, test.done);
  },
  'stdout': function(test) {
    var counts = [10, 100, 1000];
    test.expect(counts.length);
    async.eachSeries(counts, function(n, next) {
      var command = 'node log.js 0 ' + n + ' stdout';
      run(command, {pipe: true}, function(code, actual) {
        var expected = fixture(n + '-stdout.txt');
        test.equal(true, showDiff(actual, expected), command);
        next();
      });
    }, test.done);
  },
  'stderr': function(test) {
    var counts = [10, 100, 1000];
    test.expect(counts.length);
    async.eachSeries(counts, function(n, next) {
      var command = 'node log.js 0 ' + n + ' stderr';
      run(command, {pipe: true}, function(code, actual) {
        var expected = fixture(n + '-stderr.txt');
        test.equal(true, showDiff(actual, expected), command);
        next();
      });
    }, test.done);
  },
  'exit codes': function(test) {
    var codes = [0, 1, 123];
    test.expect(codes.length * 2);
    async.eachSeries(codes, function(n, next) {
      var command = 'node log.js ' + n + ' 10 stdout stderr';
      run(command, {pipe: false}, function(code, actual) {
        test.equal(code, n, 'should have exited with ' + n + ' error code.');
        var expected = fixture('10-stdout-stderr.txt');
        test.equal(true, showDiff(actual, expected), command);
        next();
      });
    }, test.done);
  },
};
