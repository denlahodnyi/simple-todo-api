// Example: https://github.com/mochajs/mocha/blob/master/example/config/.mocharc.js

module.exports = {
  timeout: 6000, // required for mongodb-memory-server
  ui: 'bdd',
  spec: ['./**/*.test.js'],
  ignore: ['./node_modules/**/*'],
  'watch-files': './**/*.test.js',
};
