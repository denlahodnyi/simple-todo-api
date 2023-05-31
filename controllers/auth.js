const { StatusCodes: SC } = require('http-status-codes');
const bcrypt = require('bcrypt');
const { User } = require('../models/User');
const { sendUserVerificationMail } = require('../services/email');
const {
  asyncWrapper,
  signToken,
  verifyToken,
  validatePassword,
  validateEmail,
  BadRequestError,
  NotFoundError,
  CustomError,
  AccessError,
} = require('../utils');

const SALT_ROUNDS = 10;

const signin = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please, provide email and password');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError("User doesn't exist");
  }
  if (!user.verified) {
    throw new AccessError('Please, verify your user before proceeding');
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new BadRequestError('Wrong password');
  }

  const token = await signToken({ user_id: user._id });
  res.status(SC.OK).send({ data: { user, token } });
});

const signup = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Please, provide email and password');
  }

  const passwordValidation = validatePassword(password);

  if (!passwordValidation.valid) {
    throw new BadRequestError(passwordValidation.message);
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email, password: hash });
  const token = await signToken({ user_id: user._id });
  await sendUserVerificationMail(email, token);
  res.status(SC.OK).send({ data: { status: 'success' } });
});

const verify = asyncWrapper(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    throw new BadRequestError('Invalid verification link');
  }

  const { user_id: userId } = verifyToken(token);

  if (!userId) {
    throw new BadRequestError('Invalid verification token');
  }

  const user = await User.findById(userId).lean();

  if (!user) {
    throw new NotFoundError('User not found');
  }
  if (user.verified) {
    throw new CustomError('User is verified', SC.GONE);
  }

  const updatedUser = await User.updateOne({ _id: userId }, { verified: true });
  res.status(SC.OK).send({ data: { status: 'success' } });
});

const resendVerify = asyncWrapper(async (req, res) => {
  const { email } = req.body;

  if (!email || !validateEmail(email)) {
    throw new BadRequestError('Email is invalid');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new NotFoundError('User with such email is not found');
  }
  if (user.verified) {
    throw new CustomError('User is verified', SC.GONE);
  }

  const token = await signToken({ user_id: user._id });
  await sendUserVerificationMail(email, token);
  res.status(SC.OK).send({ data: { status: 'success' } });
});

module.exports = { signin, signup, verify, resendVerify };
