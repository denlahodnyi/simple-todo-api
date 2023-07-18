const path = require('path');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const { login, authedRequest } = require('../requests');

function getUserIdByIndex(index) {
  return this.usersCollection[index]._id.toString();
}

describe('Users endpoints tests', () => {
  describe('POST /auth/signin', () => {
    it('returns user and token', async function () {
      const { email, password } = this.users[0];
      const response = await login(email, password);
      expect(response.status).to.equal(200);
      // eslint-disable-next-line no-unused-expressions
      expect(response.body.data.token).to.not.be.empty;
      // eslint-disable-next-line no-unused-expressions
      expect(response.body.data.user).to.not.be.empty;
    });
  });

  describe('GET /users', () => {
    it('returns all users', async function () {
      const response = await request(app).get('/api/v1/users');
      expect(response.status).to.equal(200);
      expect(response.body.data.users).to.have.lengthOf(
        this.usersCollection.length
      );
    });
  });

  describe('GET /users/:user_id', () => {
    it('returns requested user with only public fields (for unauthorized user)', async function () {
      const userId = getUserIdByIndex.call(this, 0);
      const response = await request(app).get(`/api/v1/users/${userId}`);
      expect(response.status).to.equal(200);
      expect(response.body.data.user._id).to.equal(userId);
      expect(response.body.data.user).to.not.have.all.keys(
        'password',
        'first_name',
        'last_name',
        'email',
        'verified'
      );
    });
    it('returns requested user with all fields (for authorized user)', async function () {
      const { email, password } = this.users[0];
      const userId = getUserIdByIndex.call(this, 0);
      const response = await authedRequest(
        request(app).get(`/api/v1/users/${userId}`),
        email,
        password
      );
      expect(response.status).to.equal(200);
      expect(response.body.data.user._id).to.equal(userId);
      expect(response.body.data.user).to.include.all.keys(
        'first_name',
        'last_name',
        'email',
        'verified'
      );
    });
  });

  describe('PATCH /users/:user_id', () => {
    const newData = {
      first_name: 'Jack',
      last_name: 'Paul',
      user_name: 'TheLastJedi09',
      email: 'newtest1@example.com',
    };

    it('prevents updating unauthorized user', async function () {
      const userId = getUserIdByIndex.call(this, 0);
      const response = await request(app)
        .patch(`/api/v1/users/${userId}`)
        .send(newData);
      expect(response.status).to.equal(401);
    });
    it('updates user', async function () {
      const { email, password } = this.users[0];
      const userId = getUserIdByIndex.call(this, 0);
      const response = await authedRequest(
        request(app).patch(`/api/v1/users/${userId}`).send(newData),
        email,
        password
      );
      expect(response.status).to.equal(200);
      expect(response.body.data.user).to.include(newData);
      // return previous email address
      const response2 = await authedRequest(
        request(app).patch(`/api/v1/users/${userId}`).send({ email }),
        newData.email,
        password
      );
      expect(response2.status).to.equal(200);
    });
  });

  describe('PUT /users/:user_id/avatars/upload', () => {
    it("prevents updating unauthorized user's avatar", async function () {
      const userId = getUserIdByIndex.call(this, 0);
      const response = await request(app)
        .put(`/api/v1/users/${userId}/avatars/upload`)
        .attach('avatar', path.resolve(__dirname, '../assets/sample.jpeg'));
      expect(response.status).to.equal(401);
    });
    it("updates user's avatar", async function () {
      const { email, password } = this.users[0];
      const userId = getUserIdByIndex.call(this, 0);
      const response = await authedRequest(
        request(app)
          .put(`/api/v1/users/${userId}/avatars/upload`)
          .attach('avatar', path.resolve(__dirname, '../assets/sample.jpeg')),
        email,
        password
      );
      expect(response.status).to.equal(200);
      expect(response.body.data.user.avatar_url).to.be.a('string');
    });
  });

  describe('GET /users/:user_id/avatars/:avatar_id', () => {
    it('returns image', async function () {
      const userId = getUserIdByIndex.call(this, 0);
      const userResponse = await request(app).get(`/api/v1/users/${userId}`);
      const avatarUrl = userResponse.body.data.user.avatar_url;
      expect(avatarUrl).to.be.a('string');
      const avatarUrlParts = avatarUrl.split('/');
      const avatarId = avatarUrlParts[avatarUrlParts.length - 1];
      const response = await request(app).get(
        `/api/v1/users/${userId}/avatars/${avatarId}`
      );
      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.match(/png|jpeg|jpg/);
      // eslint-disable-next-line no-unused-expressions
      expect(Buffer.isBuffer(response.body)).to.be.true;
    });
  });

  describe('PATCH /users/:user_id/password', () => {
    const newPassword = 'Wasd12345';
    it('prevents password update for unauthorized user', async function () {
      const { password } = this.users[0];
      const userId = getUserIdByIndex.call(this, 0);
      const response = await request(app)
        .patch(`/api/v1/users/${userId}/password`)
        .send({
          old_password: password,
          new_password: newPassword,
          new_password_confirm: newPassword,
        });
      expect(response.status).to.equal(401);
    });
    it('updates password', async function () {
      const { email, password } = this.users[0];
      const userId = getUserIdByIndex.call(this, 0);
      const response = await authedRequest(
        request(app).patch(`/api/v1/users/${userId}/password`).send({
          old_password: password,
          new_password: newPassword,
          new_password_confirm: newPassword,
        }),
        email,
        password
      );
      expect(response.status).to.equal(200);
      const loginRes2 = await login(email, password);
      expect(loginRes2.status).to.equal(400);
      const loginRes3 = await login(email, newPassword);
      expect(loginRes3.status).to.equal(200);
    });
  });

  describe('DELETE /users/:user_id', async () => {
    it('prevents deleting unauthorized user', async function () {
      const userId = getUserIdByIndex.call(this, 1);
      const response = await request(app).delete(`/api/v1/users/${userId}`);
      expect(response.status).to.equal(401);
    });
    it('deletes user', async function () {
      const { email, password } = this.users[1];
      const userId = getUserIdByIndex.call(this, 1);
      const response = await authedRequest(
        request(app).delete(`/api/v1/users/${userId}`),
        email,
        password
      );
      expect(response.status).to.equal(200);
      const userResponse = await request(app).get(`/api/v1/users/${userId}`);
      expect(userResponse.status).to.equal(404);
    });
  });
});
