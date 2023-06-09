const { AccessError } = require('./errors');

module.exports = (request, userId, errorMessage) => {
  const { user } = request || {};
  const isOwner = user?.user_id && userId && user.user_id === userId;
  if (!isOwner) throw new AccessError(errorMessage);
};
