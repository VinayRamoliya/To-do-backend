const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');

let app;
let mongoServer;

describe('Task API', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret_for_jest_only';
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    await connectDB(process.env.MONGODB_URI);
    ({ app } = require('../src/index'));
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (mongoServer) await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.collection('tasks').deleteMany({});
    await mongoose.connection.collection('users').deleteMany({});
  });

  it('creates a task for an authenticated user', async () => {
    const passwordHash = await bcrypt.hash('secret123', 10);
    const user = await User.create({
      email: 'tester@example.com',
      passwordHash,
      name: 'Tester',
    });
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET);

    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Write integration test',
        description: 'Cover task creation',
        priority: 'high',
        status: 'pending',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Write integration test');
    expect(res.body.description).toBe('Cover task creation');
    expect(res.body.priority).toBe('high');
    expect(res.body.status).toBe('pending');
    expect(res.body.user).toBeDefined();
  });
});
