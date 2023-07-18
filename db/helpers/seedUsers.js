const { User } = require('../../models/User');
const { hashPassword, generateUsername } = require('../../utils');

module.exports = async function seedTestUsers(initialUsers) {
  const users = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const user of initialUsers) {
    users.push({
      ...user,
      user_name: generateUsername(user.email),
      password: await hashPassword(user.password),
      verified: true,
    });
  }
  return User.insertMany(users);
};
