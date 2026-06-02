import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/database';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'commonground_secret_key_2024';

router.post('/register', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const db = getDb();
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const password_hash = bcrypt.hashSync(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash, display_name) VALUES (?, ?, ?)'
  ).run(username, password_hash, username);

  const userId = result.lastInsertRowid as number;

  // Seed missions for new user
  const insertMission = db.prepare('INSERT INTO missions (user_id, mission_key, progress, completed) VALUES (?, ?, ?, ?)');
  insertMission.run(userId, 'complete_profile', 0, 0);
  insertMission.run(userId, 'match_5_users', 0, 0);
  insertMission.run(userId, 'first_chat', 0, 0);
  insertMission.run(userId, 'earn_100_points', 0, 0);

  const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, userId, username });
});

router.post('/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, userId: user.id, username: user.username });
});

export default router;
