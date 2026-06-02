import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

router.get('/:userId', (req: Request, res: Response) => {
  const db = getDb();
  const user = db.prepare(
    'SELECT id, username, display_name, bio, avatar, interests, range_miles, visible, points, created_at FROM users WHERE id = ?'
  ).get(req.params.userId) as any;

  if (!user) return res.status(404).json({ error: 'User not found' });

  user.interests = JSON.parse(user.interests || '[]');
  return res.json(user);
});

router.put('/:userId', (req: Request, res: Response) => {
  const db = getDb();
  const { displayName, bio, avatar, interests, range_miles, visible } = req.body;

  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updates: string[] = [];
  const params: any[] = [];

  if (displayName !== undefined) { updates.push('display_name = ?'); params.push(displayName); }
  if (bio !== undefined) { updates.push('bio = ?'); params.push(bio); }
  if (avatar !== undefined) { updates.push('avatar = ?'); params.push(avatar); }
  if (interests !== undefined) { updates.push('interests = ?'); params.push(JSON.stringify(interests)); }
  if (range_miles !== undefined) { updates.push('range_miles = ?'); params.push(range_miles); }
  if (visible !== undefined) { updates.push('visible = ?'); params.push(visible ? 1 : 0); }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  params.push(req.params.userId);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare(
    'SELECT id, username, display_name, bio, avatar, interests, range_miles, visible, points FROM users WHERE id = ?'
  ).get(req.params.userId) as any;
  updated.interests = JSON.parse(updated.interests || '[]');

  return res.json(updated);
});

export default router;
