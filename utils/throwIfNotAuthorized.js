const { AccessError } = require('./errors');

module.exports = (request) => {
  const { user, params } = request || {};
  const isOwner = user?.user_id && params?.id && user.user_id === params.id;
  if (!isOwner) throw new AccessError();
};
