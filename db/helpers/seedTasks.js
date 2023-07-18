const Task = require('../../models/Task');

module.exports = async function seedTestUsers(initialTasks) {
  const tasks = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const task of initialTasks) {
    tasks.push({
      ...task,
    });
  }
  return Task.insertMany(tasks);
};
