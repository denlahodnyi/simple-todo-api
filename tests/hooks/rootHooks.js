const dropCollections = require('../../db/helpers/dropCollections');
const seedTestUsers = require('../../db/helpers/seedUsers');
const seedTestTasks = require('../../db/helpers/seedTasks');

const users = [
  {
    email: 'test1@example.com',
    password: 'Qwerty123',
    first_name: 'John',
    last_name: 'Dow',
  },
  {
    email: 'test2@example.com',
    password: 'Qwerty123',
    first_name: 'Tom',
    last_name: 'Basil',
  },
];

const tasks = [
  {
    title: 'Clean the bathroom',
    description: 'Reprehenderit do ipsum irure magna ipsum qui sunt qui qui.',
  },
  {
    title: 'Buy new shoes',
    description:
      'Consectetur irure ipsum enim anim commodo velit tempor reprehenderit dolore irure ut labore enim.',
  },
];

exports.mochaHooks = {
  beforeAll: [
    async function () {
      console.log('Mocha root hook setup');
      try {
        await dropCollections();
        this.users = users;
        this.usersCollection = await seedTestUsers(users);
        const userId = this.usersCollection[0]._id;
        const tasksWithUID = tasks.map((task) => ({
          ...task,
          user_id: userId,
        }));
        this.tasksCollection = [await seedTestTasks(tasksWithUID)];
      } catch (error) {
        console.log('mochaHooks', error);
      }
    },
  ],
};
