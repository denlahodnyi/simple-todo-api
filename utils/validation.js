const validator = require('validator');

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MIN_NUMBERS = 1;
const PASSWORD_MIN_LOWER = 1;
const PASSWORD_MIN_UPPER = 1;

const validatePassword = (password) => {
  const valid = validator.isStrongPassword(password, {
    minLength: PASSWORD_MIN_LENGTH,
    minLowercase: PASSWORD_MIN_LOWER,
    minUppercase: PASSWORD_MIN_UPPER,
    minNumbers: PASSWORD_MIN_NUMBERS,
    minSymbols: 0,
  });

  return {
    valid,
    message: `Password validation failed. Must contain at least ${PASSWORD_MIN_LENGTH} characters, ${PASSWORD_MIN_UPPER} uppercase letter, ${PASSWORD_MIN_LOWER} lowercase and ${PASSWORD_MIN_NUMBERS} number${
      PASSWORD_MIN_NUMBERS > 1 ? 's' : ''
    }`,
  };
};

const validateEmail = (email) => validator.isEmail(email);

const validateUsername = (username) => /^\w*$/i.test(username);

module.exports = {
  validatePassword,
  validateEmail,
  validateUsername,
};
