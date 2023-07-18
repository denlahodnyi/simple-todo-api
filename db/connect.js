const mongoose = require('mongoose');
const getUri = require('./helpers/getUri');

const connectionStatus = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

const connect = async () => {
  const mongooseInstance = await mongoose.connect(getUri());
  console.log(
    `🗄️  DB: ${connectionStatus[mongooseInstance.connection.readyState]}`
  );
  return mongooseInstance;
};

module.exports = connect;
