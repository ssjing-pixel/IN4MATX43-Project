process.env.TEST_DB = ':memory:';

import request from 'supertest';
import { initDb, getDb, closeDb } from '../../src/db/database';
import { createTestApp } from '../helpers/testApp';
import bcrypt from 'bcryptjs';

const app = createTestApp();
let testUserId: number;

beforeAll(() => {
  initDb();
  // Insert a test user directly
  const db = getDb();
  const hash = bcrypt.hashSync('testpass', 10);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash, display_name, bio) VALUES (?, ?, ?, ?)'
  ).run('profile_tester', hash, 'Profile Tester', 'Test bio');
  testUserId = result.lastInsertRowid as number;
});

afterAll(() => {
  closeDb();
});

describe('GET /api/profile/:userId', () => {
  test('returns user data for existing user', async () => {
    const res = await request(app).get(`/api/profile/${testUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('profile_tester');
    expect(res.body.display_name).toBe('Profile Tester');
  });

  test('returns 404 for non-existent user', async () => {
    const res = await request(app).get('/api/profile/99999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });
});

describe('PUT /api/profile/:userId', () => {
  test('updates display name successfully', async () => {
    const res = await request(app)
      .put(`/api/profile/${testUserId}`)
      .send({ displayName: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.display_name).toBe('Updated Name');
  });
});
