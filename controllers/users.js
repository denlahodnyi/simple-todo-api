const fs = require('fs/promises');
const { StatusCodes: SC } = require('http-status-codes');
const { User } = require('../models/User');
const { UserAvatar } = require('../models/UserAvatar');
const { sendPasswordResetMail } = require('../services/email');
const {
  BadRequestError,
  NotFoundError,
  asyncWrapper,
  comparePasswords,
  getPaginationLinks,
  getRequestUrl,
  hashPassword,
  signToken,
  throwIfNotAuthorized,
  validatePassword,
  verifyToken,
} = require('../utils');

const NOT_FOUND_MESSAGE = 'User not found';
const LIMIT = 10;

const getAllUsers = asyncWrapper(async (req, res) => {
  const { sort = '', user_name: userName } = req.query;
  const { origin, pathname } = getRequestUrl(req);
  const uri = origin + pathname;
  const page = Number(req.query.page || 1);
  const limit = req.query.limit || LIMIT;
  const offset = (page - 1) * limit;
  const sortQuery = sort.split(', ').join(' ');
  const filterBy = {};

  if (userName) filterBy.user_name = userName;

  const query = User.find({ ...filterBy }).excludePrivateFields();
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
  const isOwner = req.user?.user_id === req.params.user_id;
  const query = User.findById(req.params.user_id);
  if (!isOwner) query.excludePrivateFields();
  const user = await query.lean();

  if (!user) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  res.status(SC.OK).send({ data: { user } });
});

const getUserAvatar = asyncWrapper(async (req, res) => {
  const avatar = await UserAvatar.findOne({
    _id: req.params.avatar_id,
    user_id: req.params.user_id,
  });

  if (!avatar) {
    throw new NotFoundError('No avatar found for current user');
  }

  res.set('Content-Type', avatar.type);
  res.status(SC.OK).send(avatar.data);
});

const updateUser = asyncWrapper(async (req, res) => {
  const { _id, password, verified, ...body } = req.body;

  throwIfNotAuthorized(req, req.params.user_id);

  const user = await User.findByIdAndUpdate(req.params.user_id, body, {
    new: true, // return the modified document rather than the original
    runValidators: true,
  });

  if (!user) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  res.status(SC.OK).send({ data: { user } });
});

const updateUserAvatar = asyncWrapper(async (req, res) => {
  throwIfNotAuthorized(req, req.params.user_id);
  const { origin, pathname } = getRequestUrl(req);
  const uri = origin + pathname.replace('/upload', '');
  const buffer = await fs.readFile(req.file.path);
  const body = {
    data: buffer,
    user_id: req.params.user_id,
    type: req.file.mimetype,
    name: req.file.filename,
  };

  const user = await User.findById(req.params.user_id);

  if (!user) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  let avatar = await UserAvatar.findOneAndReplace(
    { user_id: req.params.user_id },
    body,
    {
      new: true, // return the modified document rather than the original
      runValidators: true,
    }
  );

  if (!avatar) {
    avatar = await UserAvatar.create(body);
  }

  user.avatar_url = `${uri}/${avatar._id}`;
  user.save(); // update user avatar_url
  fs.unlink(req.file.path); // remove file from /uploads

  res.status(SC.OK).send({ data: { user } });
});

const updateUserPassword = asyncWrapper(async (req, res) => {
  const {
    old_password: oldPwd,
    new_password: newPwd,
    new_password_confirm: newPwdConfirm,
  } = req.body;

  throwIfNotAuthorized(req, req.params.user_id);

  const user = await User.findById(req.params.user_id, '+password').lean();

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

  // related docs will be removed at scheme level
  const user = await User.findByIdAndDelete(req.params.user_id);

  if (!user) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  res.status(SC.OK).send({ data: { user } });
});

const resetPassword = asyncWrapper(async (req, res) => {
  const { token } = req.query;
  const { email, password: newPassword } = req.body;

  if (token) {
    const { user_id: userId } = verifyToken(token);
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError(NOT_FOUND_MESSAGE);
    if (!newPassword) throw BadRequestError('Please, provide new password');

    const passwordValidation = validatePassword(newPassword);

    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.message);
    }

    const hash = await hashPassword(newPassword);

    await User.findByIdAndUpdate(userId, {password: hash})
    res.status(SC.OK).send({data:{status:'success', message: 'Password was successfully updated'}})
  } else {
    if (!email) throw new BadRequestError('Please, provide email address');
    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError(NOT_FOUND_MESSAGE);

    const newToken = await signToken({ user_id: user._id });
    await sendPasswordResetMail(email, newToken);
    res
      .status(SC.OK)
      .send({ data: { status: 'success', message: 'Check your mail box' } });
  }
});

module.exports = {
  deleteUser,
  getAllUsers,
  getUser,
  getUserAvatar,
  resetPassword,
  updateUser,
  updateUserAvatar,
  updateUserPassword,
};
