const mongoose = require('mongoose');
const { StatusCodes: SC } = require('http-status-codes');
const { CustomError, validateEmail } = require('../utils');

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
        unique: true,
        partialFilterExpression: { user_name: { $type: 'string' } },
      },
      trim: true,
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

UserSchema.post('save', (error, doc, next) => {
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
