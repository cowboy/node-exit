var errorCode = process.argv[2];
var max = process.argv[3];
var modes = process.argv.slice(4);

function stdout(message) {
  if (modes.indexOf('stdout') === -1) { return; }
  process.stdout.write('[stdout] ' + message + '\n');
}

function stderr(message) {
  if (modes.indexOf('stderr') === -1) { return; }
  process.stderr.write('[stderr] ' + message + '\n');
}

for (var i = 0; i < max; i++) {
  stdout('testing ' + i);
  stderr('testing ' + i);
}

process.exit(errorCode);

stdout('this should not display');
stderr('this should not display');
