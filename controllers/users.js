const { StatusCodes: SC } = require('http-status-codes');
const { User } = require('../models/User');
const {
  asyncWrapper,
  validatePassword,
  comparePasswords,
  hashPassword,
  throwIfNotAuthorized,
  NotFoundError,
  BadRequestError,
} = require('../utils');

const NOT_FOUND_MESSAGE = 'User not found';

// @TODO: add password reset

const getAllUsers = asyncWrapper(async (req, res) => {
  const projection = {
    user_name: 1,
    avatar_url: 1,
    createdAt: 1,
    updatedAt: 1,
  };
  const users = await User.find({}, projection).lean();
  res.status(SC.OK).send({
    data: { users },
  });
});

const getUser = asyncWrapper(async (req, res) => {
  const isOwner = req.user.user_id === req.params.id;
  const projection = {
    user_name: 1,
    avatar_url: 1,
    createdAt: 1,
    updatedAt: 1,
  };

  if (isOwner)
    Object.assign(projection, {
      email: 1,
      first_name: 1,
      last_name: 1,
      verified: 1,
    });

  const user = await User.findById(req.params.id, projection).lean();

  if (!user) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  res.status(SC.OK).send({ data: { user } });
});

const updateUser = asyncWrapper(async (req, res) => {
  const { password, ...body } = req.body;

  throwIfNotAuthorized(req, req.params.user_id);

  const user = await User.findByIdAndUpdate(req.params.user_id, body, {
    runValidators: true,
  }).select({
    user_name: 1,
    avatar_url: 1,
    createdAt: 1,
    updatedAt: 1,
    email: 1,
    first_name: 1,
    last_name: 1,
    verified: 1,
  });

  if (!user) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  res.status(SC.OK).send({ data: { user } });
});

const updateUserPassword = asyncWrapper(async (req, res) => {
  const {
    old_password: oldPwd,
    new_password: newPwd,
    new_password_confirm: newPwdConfirm,
  } = req.body;

  throwIfNotAuthorized(req, req.params.user_id);

  const user = await User.findById(req.params.user_id).lean();

  if (!oldPwd || !newPwd || !newPwdConfirm) {
    throw new BadRequestError('Please, provide all data');
  }
  if (newPwd !== newPwdConfirm) {
    throw new BadRequestError("Passwords don't match");
  }

  const match = await comparePasswords(oldPwd, user.password);

  if (!match) {
    throw new BadRequestError('Wrong current password');
  }

  const passwordValidation = validatePassword(newPwd);

  if (!passwordValidation.valid) {
    throw new BadRequestError(passwordValidation.message);
  }

  const hash = await hashPassword(newPwd);
  const updatedUser = await User.findByIdAndUpdate(req.params.user_id, {
    password: hash,
  });

  res.status(SC.OK).send({ data: { status: 'success' } });
});

const deleteUser = asyncWrapper(async (req, res) => {
  throwIfNotAuthorized(req, req.params.user_id);

  const user = await User.findByIdAndDelete(req.params.user_id);

  if (!user) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  res.status(SC.OK).send({ data: { user } });
});

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserPassword,
};
