const { verifyToken, AuthError } = require('../utils');

const authMw = (options) => (req, res, next) => {
  const { publicLike = false } = options || {};
  const { authorization = '' } = req.headers;
  const token = authorization.split(' ')[1];

  if (!publicLike && (!authorization || !token)) {
    throw new AuthError();
  }

  if (token) {
    const user = verifyToken(token);
    req.token = token;
    req.user = user;
  }

  next();
};

module.exports = { authMw };
