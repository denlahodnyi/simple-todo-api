const path = require('path');
const { expect } = require('chai');
const request = require('supertest');
const app = require('../../app');
const { login, authedRequest } = require('../requests');

describe('Tasks endpoints tests', () => {
  describe('GET /tasks', () => {
    it("doesn't return tasks for unauthorized users", async () => {
      const response = await request(app).get(`/api/v1/tasks`);
      expect(response.status).to.equal(401);
    });
    it("returns all user's tasks with pagination (authorized)", async function () {
      const { email, password } = this.users[0];
      const tasksList = this.tasksCollection[0];
      const response = await authedRequest(
        request(app).get(`/api/v1/tasks`),
        email,
        password
      );
      expect(response.status).to.equal(200);
      expect(response.body.data.tasks).to.have.lengthOf(tasksList.length);
      expect(response.body.data.pagination)
        .to.deep.include({
          totalItems: tasksList.length,
          totalPages: 1,
          page: 1,
        })
        .and.to.have.keys('self', 'first', 'last', 'previous', 'next');
    });
  });

  describe('GET /tasks/:task_id', () => {
    it("doesn't return task for unauthorized users", async function () {
      const taskId = this.tasksCollection[0][0]._id.toString();
      const response = await request(app).get(`/api/v1/tasks/${taskId}`);
      expect(response.status).to.equal(401);
    });
    it("returns 404 if task doesn't exist", async function () {
      const { email, password } = this.users[0];
      const taskId = '64b6c11171f8924e4e401234';
      const response = await authedRequest(
        request(app).get(`/api/v1/tasks/${taskId}`),
        email,
        password
      );
      expect(response.status).to.equal(404);
    });
    it('returns task (authorized)', async function () {
      const { email, password } = this.users[0];
      const taskId = this.tasksCollection[0][0]._id.toString();
      const response = await authedRequest(
        request(app).get(`/api/v1/tasks/${taskId}`),
        email,
        password
      );
      expect(response.status).to.equal(200);
      expect(response.body.data.task._id).to.be.equal(taskId);
    });
  });

  describe('POST /tasks', () => {
    const newTask = {
      title: 'My new task',
      description: 'Make some chores',
    };

    it("doesn't create task for unauthorized user", async () => {
      const response = await request(app).post('/api/v1/tasks').send(newTask);
      expect(response.status).to.equal(401);
    });
    it('creates task (authorized)', async function () {
      const { email, password } = this.users[0];
      const response = await authedRequest(
        request(app).post('/api/v1/tasks').send(newTask),
        email,
        password
      );
      expect(response.status).to.equal(201);
      expect(response.body.data.task).to.include(newTask);
      const taskResponse = await authedRequest(
        request(app).get(`/api/v1/tasks/${response.body.data.task._id}`),
        email,
        password
      );
      expect(taskResponse.status).to.equal(200);
    });
  });

  describe('PUT /tasks/:task_id', () => {
    const newData = { completed: true, color: '#CECECE', tags: ['starred'] };

    it("doesn't update task for unauthorized user", async function () {
      const taskId = this.tasksCollection[0][0]._id;
      const response = await request(app)
        .put(`/api/v1/tasks/${taskId}`)
        .send(newData);
      expect(response.status).to.equal(401);
    });
    it('updates task', async function () {
      const { email, password } = this.users[0];
      const taskId = this.tasksCollection[0][0]._id;
      const response = await authedRequest(
        request(app).put(`/api/v1/tasks/${taskId}`).send(newData),
        email,
        password
      );
      expect(response.status).to.equal(200);
      const taskResponse = await authedRequest(
        request(app).get(`/api/v1/tasks/${taskId}`),
        email,
        password
      );
      expect(taskResponse.body.data.task).to.deep.include(newData);
    });
  });

  describe('POST /tasks/download', () => {
    it('download', async function () {
      const { email, password } = this.users[0];
      const ids = this.tasksCollection[0].map((task) => task._id.toString());
      const response = await authedRequest(
        request(app).post('/api/v1/tasks/download').send({
          ids,
        }),
        email,
        password
      );
      expect(response.status).to.equal(200);
      expect(response.headers['content-type']).to.match(/text\/csv/);
    });
  });

  describe('DELETE /tasks/:task_id', () => {
    it("doesn't delete tasks for unauthorized users", async function () {
      const taskId = this.tasksCollection[0][0]._id;
      const response = await request(app).delete(`/api/v1/tasks/${taskId}`);
      expect(response.status).to.equal(401);
    });
    it('deletes task', async function () {
      const { email, password } = this.users[0];
      const taskId = this.tasksCollection[0][0]._id;
      const response = await authedRequest(
        request(app).delete(`/api/v1/tasks/${taskId}`),
        email,
        password
      );
      expect(response.status).to.equal(200);
      const taskResponse = await authedRequest(
        request(app).get(`/api/v1/tasks/${taskId}`),
        email,
        password
      );
      expect(taskResponse.status).to.equal(404);
    });
  });
});
