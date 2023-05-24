const mongoose = require('mongoose');

const { USER_NAME, PASSWORD, DB_NAME, CLUSTER_NAME } = process.env;

const uri = `mongodb+srv://${USER_NAME}:${PASSWORD}@${CLUSTER_NAME}/${DB_NAME}?retryWrites=true&w=majority`;

const connect = async () => {
  return mongoose.connect(uri);
};

module.exports = connect;
