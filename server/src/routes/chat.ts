import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

router.get('/channels/:userId', (req: Request, res: Response) => {
  const db = getDb();
  const channels = db.prepare(`
    SELECT cc.id, cc.user1_id, cc.user2_id, cc.created_at,
           u1.display_name as user1_name, u1.avatar as user1_avatar,
           u2.display_name as user2_name, u2.avatar as user2_avatar,
           (SELECT content FROM messages WHERE channel_id = cc.id ORDER BY id DESC LIMIT 1) as last_message,
           (SELECT created_at FROM messages WHERE channel_id = cc.id ORDER BY id DESC LIMIT 1) as last_message_at
    FROM chat_channels cc
    JOIN users u1 ON u1.id = cc.user1_id
    JOIN users u2 ON u2.id = cc.user2_id
    WHERE cc.user1_id = ? OR cc.user2_id = ?
    ORDER BY last_message_at DESC
  `).all(req.params.userId, req.params.userId) as any[];

  return res.json(channels);
});

router.get('/messages/:channelId', (req: Request, res: Response) => {
  const db = getDb();
  const messages = db.prepare(`
    SELECT m.id, m.channel_id, m.sender_id, m.content, m.created_at,
           u.display_name as sender_name, u.avatar as sender_avatar
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.channel_id = ?
    ORDER BY m.id ASC
  `).all(req.params.channelId) as any[];

  return res.json(messages);
});

router.post('/channel', (req: Request, res: Response) => {
  // Support both naming conventions
  const userId = req.body.userId || req.body.user1Id;
  const friendId = req.body.friendId || req.body.user2Id;
  if (!userId || !friendId) return res.status(400).json({ error: 'userId and friendId required' });

  const db = getDb();
  const existing = db.prepare(`
    SELECT id FROM chat_channels
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
  `).get(userId, friendId, friendId, userId) as any;

  if (existing) return res.json({ channelId: existing.id, id: existing.id });

  const result = db.prepare(
    'INSERT INTO chat_channels (user1_id, user2_id) VALUES (?, ?)'
  ).run(userId, friendId);

  const id = result.lastInsertRowid;
  return res.json({ channelId: id, id });
});

router.post('/message', (req: Request, res: Response) => {
  const { channelId, senderId, content } = req.body;
  if (!channelId || !senderId || !content?.trim()) {
    return res.status(400).json({ error: 'channelId, senderId, content required' });
  }

  const db = getDb();
  const result = db.prepare(
    'INSERT INTO messages (channel_id, sender_id, content) VALUES (?, ?, ?)'
  ).run(channelId, senderId, content.trim());

  const message = db.prepare(`
    SELECT m.id, m.channel_id, m.sender_id, m.content, m.created_at,
           u.display_name as sender_name, u.avatar as sender_avatar
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.id = ?
  `).get(result.lastInsertRowid) as any;

  return res.json(message);
});

export default router;
