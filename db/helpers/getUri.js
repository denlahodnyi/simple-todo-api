const { USER_NAME, PASSWORD, DB_NAME, CLUSTER_NAME } = process.env;

module.exports = () =>
  `mongodb+srv://${USER_NAME}:${PASSWORD}@${CLUSTER_NAME}/${DB_NAME}?retryWrites=true&w=majority`;
