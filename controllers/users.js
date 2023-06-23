const { StatusCodes: SC } = require('http-status-codes');
const { User } = require('../models/User');
const {
  asyncWrapper,
  validatePassword,
  comparePasswords,
  hashPassword,
  throwIfNotAuthorized,
  getPaginationLinks,
  getRequestUrl,
  NotFoundError,
  BadRequestError,
} = require('../utils');

const NOT_FOUND_MESSAGE = 'User not found';
const LIMIT = 10;

// @TODO: add password reset

const getAllUsers = asyncWrapper(async (req, res) => {
  const { sort = '', user_name: userName } = req.query;
  const { origin, pathname } = getRequestUrl(req);
  const uri = origin + pathname;
  const page = Number(req.query.page || 1);
  const limit = req.query.limit || LIMIT;
  const offset = (page - 1) * limit;
  const sortQuery = sort.split(', ').join(' ');
  const filterBy = {};
  const projection = {
    user_name: 1,
    avatar_url: 1,
    createdAt: 1,
    updatedAt: 1,
  };

  if (userName) filterBy.user_name = userName;

  const query = User.find({ ...filterBy }, projection);
  const totalItems = await query.clone().countDocuments().lean();
  const users = await query.skip(offset).limit(limit).sort(sortQuery).lean();
  const totalPages = Math.ceil(totalItems / limit);

  res.status(SC.OK).send({
    data: {
      users,
      pagination: {
        totalItems,
        totalPages,
        page,
        ...getPaginationLinks({
          uri,
          page,
          limit,
          totalPages,
        }),
      },
    },
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
  const { _id, password, ...body } = req.body;

  throwIfNotAuthorized(req, req.params.user_id);

  const user = await User.findByIdAndUpdate(req.params.user_id, body, {
    new: true, // return the modified document rather than the original
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

  // TODO: delete related tasks

  res.status(SC.OK).send({ data: { user } });
});

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserPassword,
};
