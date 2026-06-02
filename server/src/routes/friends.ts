import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

router.get('/search', (req: Request, res: Response) => {
  const { q, userId } = req.query as { q: string; userId: string };
  if (!q) return res.json([]);

  const db = getDb();
  const results = db.prepare(`
    SELECT id, username, display_name, avatar, interests
    FROM users
    WHERE (username LIKE ? OR display_name LIKE ?) AND id != ?
    LIMIT 10
  `).all(`%${q}%`, `%${q}%`, userId || 0) as any[];

  return res.json(results.map(u => ({
    ...u,
    interests: JSON.parse(u.interests || '[]'),
  })));
});

router.get('/:userId', (req: Request, res: Response) => {
  const db = getDb();
  const friends = db.prepare(`
    SELECT u.id, u.display_name, u.avatar, u.interests, f.status, f.id as friend_record_id
    FROM friends f
    JOIN users u ON u.id = f.friend_id
    WHERE f.user_id = ? AND f.status = 'accepted'
  `).all(req.params.userId) as any[];

  const result = friends.map(f => ({
    ...f,
    interests: JSON.parse(f.interests || '[]')
  }));

  return res.json(result);
});

router.put('/accept/:id', (req: Request, res: Response) => {
  const db = getDb();
  const record = db.prepare('SELECT * FROM friends WHERE id = ?').get(req.params.id) as any;
  if (!record) return res.status(404).json({ error: 'Request not found' });

  db.prepare('UPDATE friends SET status = ? WHERE id = ?').run('accepted', req.params.id);
  const reverse = db.prepare('SELECT id FROM friends WHERE user_id = ? AND friend_id = ?').get(record.friend_id, record.user_id);
  if (!reverse) {
    db.prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)').run(record.friend_id, record.user_id, 'accepted');
  } else {
    db.prepare('UPDATE friends SET status = ? WHERE id = ?').run('accepted', (reverse as any).id);
  }
  return res.json({ success: true });
});

router.post('/request', (req: Request, res: Response) => {
  const { userId, friendId, fromUserId, toUserId } = req.body;
  const uid = userId || fromUserId;
  const fid = friendId || toUserId;
  if (!uid || !fid) return res.status(400).json({ error: 'userId and friendId required' });

  const db = getDb();
  const existing = db.prepare(
    'SELECT id FROM friends WHERE user_id = ? AND friend_id = ?'
  ).get(uid, fid);

  if (existing) return res.status(409).json({ error: 'Request already exists' });

  db.prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)').run(uid, fid, 'pending');
  return res.json({ success: true });
});

router.put('/request/:id', (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'status must be accepted or declined' });
  }

  const db = getDb();
  const record = db.prepare('SELECT * FROM friends WHERE id = ?').get(req.params.id) as any;
  if (!record) return res.status(404).json({ error: 'Request not found' });

  db.prepare('UPDATE friends SET status = ? WHERE id = ?').run(status, req.params.id);

  if (status === 'accepted') {
    // Create reverse friendship
    const reverse = db.prepare(
      'SELECT id FROM friends WHERE user_id = ? AND friend_id = ?'
    ).get(record.friend_id, record.user_id);
    if (!reverse) {
      db.prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)').run(
        record.friend_id, record.user_id, 'accepted'
      );
    } else {
      db.prepare('UPDATE friends SET status = ? WHERE id = ?').run('accepted', (reverse as any).id);
    }
  }

  return res.json({ success: true });
});

export default router;
