const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashPassword = async (password, salt = SALT_ROUNDS) =>
  bcrypt.hash(password, salt);

const comparePasswords = async (password, passwordToCompareWith) =>
  bcrypt.compare(password, passwordToCompareWith);

module.exports = { hashPassword, comparePasswords };
