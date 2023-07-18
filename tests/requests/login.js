const request = require('supertest');
const app = require('../../app');

module.exports = async function login(email, password) {
  return request(app).post(`/api/v1/auth/signin`).send({ email, password });
};
