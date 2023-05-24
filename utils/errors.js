const { StatusCodes: SC } = require('http-status-codes');

class CustomError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Resource was not found') {
    super(message);
    this.name = 'NotFound';
    this.code = SC.NOT_FOUND;
  }
}

module.exports = {
  CustomError,
  NotFoundError,
};
