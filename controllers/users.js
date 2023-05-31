const { StatusCodes: SC } = require('http-status-codes');
const { User } = require('../models/User');
const { asyncWrapper, NotFoundError, CustomError } = require('../utils');

const NOT_FOUND_MESSAGE = 'User not found';

// @TODO: add password reset

const getAllUsers = asyncWrapper(async (req, res) => {
  // @TODO: return only public fields
  const users = await User.find({}).lean();
  res.status(SC.OK).send({
    data: { users },
  });
});

const getUser = asyncWrapper(async (req, res) => {});

const updateUser = asyncWrapper(async (req, res) => {});

// @TODO: delete tasks
const deleteUser = asyncWrapper(async (req, res) => {});

module.exports = {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
};
