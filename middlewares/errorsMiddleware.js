const mongoose = require('mongoose');
const { StatusCodes: SC } = require('http-status-codes');

const parseError = (error) => {
  let code;
  let message;

  if (
    error instanceof mongoose.Error.ValidationError ||
    error instanceof mongoose.Error.ValidatorError
  ) {
    code = SC.BAD_REQUEST;
    message = error.message;
  }
  if (error instanceof mongoose.Error.CastError) {
    code = SC.BAD_REQUEST;
    message = `Invalid \`${error.path}\` field`;
  }
  if (error?.code) {
    code = error.code;
    message = error.message;
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
  console.log('⚠️ ' + err);
  let { code = SC.INTERNAL_SERVER_ERROR, message = 'Something went wrong!' } =
    parseError(err);
  let errors = err.errors ? formatErrors(err.errors) : null;

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
