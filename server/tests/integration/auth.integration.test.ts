// Must set TEST_DB before any imports that use the database
process.env.TEST_DB = ':memory:';

import request from 'supertest';
import { initDb, closeDb } from '../../src/db/database';
import { createTestApp } from '../helpers/testApp';

const app = createTestApp();

beforeAll(() => {
  initDb();
});

afterAll(() => {
  closeDb();
});

describe('POST /api/auth/register', () => {
  test('returns 200 with token for valid data', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser1', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('userId');
    expect(res.body.username).toBe('testuser1');
  });

  test('returns 409 for duplicate username', async () => {
    // Register first time
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'duplicate_user', password: 'pass123' });

    // Register second time with same username
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'duplicate_user', password: 'pass456' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  test('returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'onlyusername' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    // Create a user to log in with
    await request(app)
      .post('/api/auth/register')
      .send({ username: 'logintest', password: 'correctpass' });
  });

  test('returns 200 with token for correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'logintest', password: 'correctpass' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'logintest', password: 'wrongpass' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });
});
