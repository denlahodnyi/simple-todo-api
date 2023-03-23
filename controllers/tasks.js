const getAllTasks = (req, res) => {
  res.send('All tasks');
};

const getTask = (req, res) => {
  res.send('Get Task' + req.params.id);
};

const createTask = (req, res) => {
  res.send('Create task');
};

const updateTask = (req, res) => {
  res.send('Update task');
};

const deleteTask = (req, res) => {
  res.send('Delete task');
};

module.exports = { getAllTasks, getTask, createTask, updateTask, deleteTask };
