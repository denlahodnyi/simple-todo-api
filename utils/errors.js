const { StatusCodes: SC } = require('http-status-codes');

class CustomError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'CustomError';
    this.message = message;
    this.code = code;
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Resource was not found') {
    super(message);
    this.name = 'NotFound';
    this.code = SC.NOT_FOUND;
  }
}

class BadRequestError extends CustomError {
  constructor(message = 'Your request is not valid') {
    super(message);
    this.name = 'BadRequest';
    this.code = SC.BAD_REQUEST;
  }
}

class AccessError extends CustomError {
  constructor(message = 'Sorry, but you have no access to this resource') {
    super(message);
    this.name = 'AccessError';
    this.code = SC.FORBIDDEN;
  }
}

class AuthError extends CustomError {
  constructor(message = 'Authorization is required to get full access') {
    super(message);
    this.name = 'AuthError';
    this.code = SC.UNAUTHORIZED;
  }
}

module.exports = {
  AccessError,
  AuthError,
  BadRequestError,
  CustomError,
  NotFoundError,
};
