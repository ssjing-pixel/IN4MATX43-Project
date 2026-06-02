process.env.TEST_DB = ':memory:';

import request from 'supertest';
import { initDb, getDb, closeDb } from '../../src/db/database';
import { createTestApp } from '../helpers/testApp';
import bcrypt from 'bcryptjs';

const app = createTestApp();
let testUserId: number;

beforeAll(() => {
  initDb();
  const db = getDb();
  const hash = bcrypt.hashSync('testpass', 10);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)'
  ).run('missions_tester', hash, 'Missions Tester');
  testUserId = result.lastInsertRowid as number;

  // Insert missions for the test user
  const insert = db.prepare(
    'INSERT INTO missions (user_id, mission_key, progress, completed) VALUES (?, ?, ?, ?)'
  );
  insert.run(testUserId, 'complete_profile', 0, 0);
  insert.run(testUserId, 'match_5_users', 2, 0);
  insert.run(testUserId, 'first_chat', 0, 0);
  insert.run(testUserId, 'earn_100_points', 10, 0);
});

afterAll(() => {
  closeDb();
});

describe('GET /api/missions/:userId', () => {
  test('returns array of missions for a user', async () => {
    const res = await request(app).get(`/api/missions/${testUserId}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('mission_key');
  });
});

describe('POST /api/missions/complete', () => {
  test('marks a mission as completed', async () => {
    const res = await request(app)
      .post('/api/missions/complete')
      .send({ userId: testUserId, missionKey: 'first_chat' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify it's actually marked as completed in the DB
    const db = getDb();
    const mission = db.prepare(
      'SELECT completed FROM missions WHERE user_id = ? AND mission_key = ?'
    ).get(testUserId, 'first_chat') as any;
    expect(mission.completed).toBe(1);
  });
});
