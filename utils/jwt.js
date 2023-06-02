const jwt = require('jsonwebtoken');

const { TokenExpiredError, JsonWebTokenError } = jwt;
const { JWT_SECRET, JWT_EXPIRES_IN } = process.env;

const signToken = (payload, options = {}) =>
  new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        ...options,
      },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });

const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

module.exports = {
  signToken,
  verifyToken,
  TokenExpiredError,
  JsonWebTokenError,
};
