const { StatusCodes: SC } = require('http-status-codes');
const Task = require('../models/Task');
const { asyncWrapper, NotFoundError } = require('../utils');
const NOT_FOUND_MESSAGE = 'Task not found';

const getAllTasks = asyncWrapper(async (req, res) => {
  // .lean() will search faster but return plain js objects
  const tasks = await Task.find({}).lean();
  res.status(SC.OK).send({
    data: { tasks },
  });
});

const getTask = asyncWrapper(async (req, res) => {
  const task = await Task.findById(req.params.id).lean();
  if (!task) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  res.status(SC.OK).send({
    data: { task },
  });
});

const createTask = asyncWrapper(async (req, res) => {
  const task = await Task.create(req.body);
  res.status(SC.CREATED).send({
    data: { task },
  });
});

const updateTask = asyncWrapper(async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // return the modified document rather than the original
    runValidators: true,
  });
  if (!task) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  res.status(SC.OK).send({
    data: { task },
  });
});

const deleteTask = asyncWrapper(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  res.status(SC.OK).send({
    data: { task },
  });
});

module.exports = { getAllTasks, getTask, createTask, updateTask, deleteTask };
