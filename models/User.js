const mongoose = require('mongoose');
const { StatusCodes: SC } = require('http-status-codes');
const { CustomError, validateEmail, validateUsername } = require('../utils');
const { USERNAME_LENGTH } = require('../config');

const UserSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (val) => validateEmail(val),
        message: 'Email validation failed',
      },
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    first_name: {
      type: String,
      trim: true,
      default: null,
    },
    last_name: {
      type: String,
      trim: true,
      default: null,
    },
    user_name: {
      type: String,
      index: {
        type: 'text',
        unique: true,
        partialFilterExpression: { user_name: { $type: 'string' } },
      },
      trim: true,
      minLength: [
        3,
        `Username is too short. At least 3 characters are required`,
      ],
      maxLength: [
        USERNAME_LENGTH,
        `Username is too long. Only ${USERNAME_LENGTH} characters are allowed`,
      ],
      validate: {
        validator: (val) => validateUsername(val),
        message: 'Username must only contain letters, numbers, and underscores',
      },
      default: null,
    },
    avatar_url: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

UserSchema.post(/save|update/i, (error, doc, next) => {
  if (error.name === 'MongoServerError' && error.code === 11000) {
    if (error.keyPattern.email) {
      next(new CustomError('User already exists', SC.CONFLICT));
    } else if (error.keyPattern.user_name) {
      next(new CustomError('Username is already taken', SC.CONFLICT));
    } else {
      next(error);
    }
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User, UserSchema };
