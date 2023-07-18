const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { expect } = require('chai');
const request = require('supertest');
const sandbox = require('sinon').createSandbox();
const app = require('../../app');

let mongoServer;

const dummyUsers = [
  {
    _id: '11111',
    user_name: 'X123',
    avatar_url: 'someurl',
  },
  {
    _id: '22222',
    user_name: 'X222',
    avatar_url: 'someurl',
  },
];

function stubbedFindHook(response) {
  before(() => {
    sandbox.stub(mongoose.Query.prototype, 'then').callsFake(function (cb) {
      if (/count/.test(this.op)) cb(response.length);
      else if (/find/.test(this.op)) cb(response);
      else cb(null);
    });
  });
  after(() => {
    sandbox.restore();
  });
}

describe('Users unit tests', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });
  after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('GET /users', () => {
    stubbedFindHook(dummyUsers);

    it('returns response with users and pagination', async () => {
      const response = await request(app).get('/api/v1/users');
      expect(response.headers['content-type']).to.match(/json/);
      expect(response.status).to.equal(200);
      expect(response.body)
        .to.be.an('object')
        .that.have.property('data')
        .that.have.keys('users', 'pagination');
      expect(response.body.data.users).to.have.deep.members(dummyUsers);
      expect(response.body.data.pagination)
        .to.deep.include({
          totalItems: dummyUsers.length,
          totalPages: 1,
          page: 1,
        })
        .and.to.have.keys('self', 'first', 'last', 'previous', 'next');
    });
  });

  describe('GET /users/:user_id', () => {
    stubbedFindHook(dummyUsers[0]);

    it('returns user', async () => {
      const testUser = dummyUsers[0];
      const response = await request(app).get(`/api/v1/users/${testUser._id}`);
      expect(response.headers['content-type']).to.match(/json/);
      expect(response.status).to.equal(200);
      expect(response.body)
        .to.be.an('object')
        .that.have.property('data')
        .that.have.keys('user');
      expect(response.body.data.user).to.be.deep.equal(testUser);
    });
  });
});
