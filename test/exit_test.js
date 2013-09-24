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

var _which = require('which').sync;
function which(command) {
  try {
    _which(command);
    return command;
  } catch (err) {
    return false;
  }
}

// Look for grep first (any OS). If not found (but on Windows) look for find,
// which is Windows' horribly crippled grep alternative.
var grep = which('grep') || process.platform === 'win32' && which('find');

function normalizeLineEndings(s) {
  return s.replace(/\r?\n/g, '\n');
}

function run(command, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  command += ' 2>&1';
  if (options.pipe) {
    command += ' | ' + grep + ' "std"';
  }
  exec(command, function(error, stdout) {
    callback(command, error ? error.code : 0, normalizeLineEndings(stdout));
  });
}

function fixture(filename) {
  return normalizeLineEndings(String(fs.readFileSync(filename)));
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
  'grep': function(test) {
    test.expect(1);
    // Many unit tests depend on this.
    test.ok(grep, 'A suitable "grep" or "find" program was not found in the PATH.');
    test.done();
  },
  'stdout stderr': function(test) {
    var counts = [10, 100, 1000];
    var outputs = ['stdout stderr', 'stdout', 'stderr'];
    test.expect(counts.length * outputs.length * 2);
    async.eachSeries(counts, function(n, next) {
      async.eachSeries(outputs, function(o, next) {
        run('node log.js 0 ' + n + ' ' + o, {pipe: true}, function(command, code, actual) {
          var expected = fixture(n + '-' + o.replace(' ', '-') + '.txt');
          // Sometimes, the actual file lines are out of order on Windows.
          // But since the point of this lib is to drain the buffer and not
          // guarantee output order, we only test the length.
          test.equal(actual.length, expected.length, '(length) ' + command);
          // The "fail" lines in log.js should NOT be output!
          test.ok(actual.indexOf('fail') === -1, '(no more output after exit) ' + command);
          next();
        });
      }, next);
    }, test.done);
  },
  'exit codes': function(test) {
    var codes = [0, 1, 123];
    test.expect(codes.length);
    async.eachSeries(codes, function(n, next) {
      run('node log.js ' + n + ' 10 stdout stderr', {pipe: false}, function(command, code) {
        // The specified exit code should be passed through.
        test.equal(code, n, 'should have exited with ' + n + ' error code.');
        next();
      });
    }, test.done);
  },
};
