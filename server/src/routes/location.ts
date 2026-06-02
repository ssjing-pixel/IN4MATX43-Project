import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

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
