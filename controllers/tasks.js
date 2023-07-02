const { StatusCodes: SC } = require('http-status-codes');
const { stringify } = require('csv-stringify');
const Task = require('../models/Task');
const {
  asyncWrapper,
  getRequestUrl,
  getPaginationLinks,
  NotFoundError,
  BadRequestError,
} = require('../utils');

const NOT_FOUND_MESSAGE = 'Task not found';
const LIMIT = 10;

const getAllTasks = asyncWrapper(async (req, res) => {
  const {
    sort = '',
    title,
    completed,
    color,
    tags,
    tags_include: tagsInclude,
  } = req.query;
  const page = Number(req.query.page || 1);
  const limit = req.query.limit || LIMIT;
  const offset = (page - 1) * limit;
  const sortQuery = sort.split(', ').join(' ');
  const filterBy = {};

  if (completed != null) filterBy.completed = completed;
  if (title) filterBy.$text = { $search: title, $caseSensitive: false };
  if (color) filterBy.color = color;
  if (tags) filterBy.tags = tags.replace(/[()]/g, '').split(',');
  if (tagsInclude) {
    filterBy.tags = { $in: tagsInclude.replace(/[()]/g, '').split(',') };
  }
  // .lean() will search faster but return plain js objects
  const query = Task.find({ ...filterBy, user_id: req.user.user_id });
  const totalItems = await query.clone().countDocuments().lean();
  const tasks = await query
    .skip(offset)
    .limit(limit)
    .sort(sortQuery)
    .lean()
    .exec();
  const totalPages = Math.ceil(totalItems / limit);

  res.status(SC.OK).send({
    data: {
      tasks,
      pagination: {
        totalItems,
        totalPages,
        page,
        ...getPaginationLinks({
          uri: getRequestUrl(req).origin,
          page,
          limit,
          totalPages,
        }),
      },
    },
  });
});

const getTask = asyncWrapper(async (req, res) => {
  const task = await Task.findOne({
    _id: req.params.task_id,
    user_id: req.user.user_id,
  }).lean();

  if (!task) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  res.status(SC.OK).send({
    data: { task },
  });
});

const createTask = asyncWrapper(async (req, res) => {
  const task = await Task.create({
    ...req.body,
    user_id: req.user.user_id,
  });
  res.status(SC.CREATED).send({
    data: { task },
  });
});

const updateTask = asyncWrapper(async (req, res) => {
  const { _id, ...body } = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: req.params.task_id, user_id: req.user.user_id },
    body,
    {
      new: true, // return the modified document rather than the original
      runValidators: true,
    }
  );

  if (!task) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  res.status(SC.OK).send({
    data: { task },
  });
});

const deleteTask = asyncWrapper(async (req, res) => {
  const task = await Task.findOneAndDelete({
    _id: req.params.task_id,
    user_id: req.user.user_id,
  });

  if (!task) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  res.status(SC.OK).send({
    data: { task },
  });
});

const downloadTasks = asyncWrapper(async (req, res) => {
  const { ids } = req.body;

  if (!ids || ids.length === 0) {
    throw new BadRequestError('Ids must not be empty');
  }

  const tasks = await Task.find({
    _id: { $in: ids },
    user_id: req.user.user_id,
  });

  if (!tasks) {
    throw new NotFoundError('No tasks were found');
  }

  const stringifier = stringify({
    header: true,
    columns: {
      title: 'Title',
      completed: 'Completed',
      color: 'Color',
      description: 'Description',
      createdAt: 'Created at',
    },
  });

  res.attachment('tasks.csv');
  res.set('Content-Type', 'text/csv');
  stringifier.pipe(res);

  stringifier.on('error', (err) => {
    console.error('.csv stream error ', err.message);
  });
  stringifier.on('end', () => {
    console.log('.csv stream end');
  });

  tasks.forEach((task) => {
    stringifier.write({
      ...task.toObject(),
      completed: task.completed ? 'Yes' : 'No',
      createdAt: new Date(task.createdAt).toDateString(),
    });
  });

  stringifier.end();
});

module.exports = {
  createTask,
  deleteTask,
  downloadTasks,
  getAllTasks,
  getTask,
  updateTask,
};
