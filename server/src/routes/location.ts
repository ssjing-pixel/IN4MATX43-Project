import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';
import { haversineDistance } from '../utils/distance';

const router = Router();

router.post('/', (req: Request, res: Response) => {
  const { userId, lat, lng } = req.body;
  if (!userId || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'userId, lat, lng required' });
  }

  const db = getDb();
  db.prepare('INSERT INTO location_updates (user_id, lat, lng) VALUES (?, ?, ?)').run(userId, lat, lng);

  const user = db.prepare('SELECT range_miles, interests FROM users WHERE id = ?').get(userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });

  const myInterests: string[] = JSON.parse(user.interests || '[]');

  // Get all other visible users with their latest location
  const others = db.prepare(`
    SELECT u.id, u.display_name, u.avatar, u.interests,
           lu.lat, lu.lng
    FROM users u
    JOIN location_updates lu ON lu.user_id = u.id
    WHERE u.id != ? AND u.visible = 1
    AND lu.id = (SELECT MAX(id) FROM location_updates WHERE user_id = u.id)
  `).all(userId) as any[];

  const nearby = others
    .map(o => {
      const dist = haversineDistance(lat, lng, o.lat, o.lng);
      const interests: string[] = JSON.parse(o.interests || '[]');
      const shared = interests.filter(i => myInterests.includes(i));
      return { ...o, distance: dist, sharedInterests: shared, interests };
    })
    .filter(o => o.distance <= user.range_miles);

  return res.json({ nearby });
});

router.get('/nearby', (req: Request, res: Response) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const db = getDb();
  const user = db.prepare('SELECT range_miles, interests FROM users WHERE id = ?').get(userId) as any;
  if (!user) return res.status(404).json({ error: 'User not found' });

  const lastLoc = db.prepare(
    'SELECT lat, lng FROM location_updates WHERE user_id = ? ORDER BY id DESC LIMIT 1'
  ).get(userId) as any;

  if (!lastLoc) return res.json({ nearby: [] });

  const myInterests: string[] = JSON.parse(user.interests || '[]');

  const others = db.prepare(`
    SELECT u.id, u.display_name, u.avatar, u.interests,
           lu.lat, lu.lng
    FROM users u
    JOIN location_updates lu ON lu.user_id = u.id
    WHERE u.id != ? AND u.visible = 1
    AND lu.id = (SELECT MAX(id) FROM location_updates WHERE user_id = u.id)
  `).all(userId) as any[];

  const nearby = others.map(o => {
    const dist = haversineDistance(lastLoc.lat, lastLoc.lng, o.lat, o.lng);
    const interests: string[] = JSON.parse(o.interests || '[]');
    const shared = interests.filter(i => myInterests.includes(i));
    return { ...o, distance: dist, sharedInterests: shared, interests };
  }).filter(o => o.distance <= user.range_miles);

  return res.json({ nearby, userLocation: lastLoc });
});

export default router;
