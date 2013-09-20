# exit [![Build Status](https://secure.travis-ci.org/cowboy/node-exit.png?branch=master)](http://travis-ci.org/cowboy/node-exit)

A replacement for process.exit that ensures stdio are fully drained before exiting.

## Getting Started
Install the module with: `npm install exit`

```javascript
var exit = require('exit');

// These lines should appear in the output.
console.log("foo");
console.error("bar");

// process.exit(5);
exit(5);

// These lines shouldn't appear in the output.
console.log("foo");
console.error("bar");
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_

## License
Copyright (c) 2013 "Cowboy" Ben Alman  
Licensed under the MIT license.
