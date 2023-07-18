const login = require('./login');

module.exports = async (req, email, password) => {
  const loginRes = await login(email, password);
  return req.auth(loginRes.body.data.token, { type: 'bearer' });
};
