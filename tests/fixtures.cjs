const startServer = require('../server/startServer');

exports.mochaGlobalSetup = async function () {
  console.log('Mocha global setup');
  this.server = await startServer();
};

exports.mochaGlobalTeardown = async function () {
  console.log('Mocha global teardown');
  await this.server?.stop();
};
