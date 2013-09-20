/*
 * exit
 * https://github.com/cowboy/node-exit
 *
 * Copyright (c) 2013 "Cowboy" Ben Alman
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function exit(exitCode, streams) {
  if (!streams) { streams = [process.stdout, process.stderr]; }
  var drainCount = 0;
  // Actually exit if all streams are drained.
  function tryToExit() {
    if (drainCount === streams.length) {
      process.exit(exitCode);
    }
  }
  streams.forEach(function(stream) {
    // Prevent further writing.
    stream.write = function() {};
    // Count drained streams now, but monitor non-drained streams.
    if (stream.bufferSize === 0) {
      drainCount++;
    } else {
      stream.once('drain', function() {
        drainCount++;
        tryToExit();
      });
    }
  });
  // If all streams were already drained, exit now.
  tryToExit();
};
