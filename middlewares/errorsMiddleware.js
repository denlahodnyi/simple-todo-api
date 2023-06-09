const mongoose = require('mongoose');
const { StatusCodes: SC } = require('http-status-codes');
const { JsonWebTokenError, TokenExpiredError } = require('../utils');

const parseError = (error) => {
  let code;
  let message = error?.message;

  if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.ValidatorError ||
    error instanceof JsonWebTokenError
  ) {
    code = SC.BAD_REQUEST;
  }
  if (error instanceof mongoose.Error.CastError) {
    code = SC.BAD_REQUEST;
    message = `Invalid \`${error.path}\` field`;
  }
  if (error instanceof mongoose.Error.CastError) {
    code = SC.BAD_REQUEST;
    message = `Invalid \`${error.path}\` field`;
  }
  if (error instanceof TokenExpiredError) {
    code = SC.UNAUTHORIZED;
  }
  if (error?.code && error.code !== 11000) {
    // The 11000 code is a duplicate key error
    code = error.code;
  }

  return { code, message };
};

const formatErrors = (errorsObj) => {
  const entries = Object.entries(errorsObj);
  return entries.reduce((prev, [key, obj]) => {
    const result = { ...prev };
    if (result[key]) {
      result[key].push({ message: parseError(obj).message });
    } else {
      result[key] = [{ message: parseError(obj).message }];
    }
    return result;
  }, {});
};

const errorMiddleware = (err, req, res, next) => {
  console.log(`⚠️ ${err}`);
  const parsedErr = parseError(err);
  const code = parsedErr.code || SC.INTERNAL_SERVER_ERROR;
  const errors = err.errors ? formatErrors(err.errors) : null;
  let message = parsedErr.message || 'Something went wrong!';

  if (errors && Object.keys(errors).length) message = null;

  res.status(code).send({
    error: {
      code,
      message,
      errors,
    },
  });
};

module.exports = errorMiddleware;
