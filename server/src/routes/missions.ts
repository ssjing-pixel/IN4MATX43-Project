import { Router, Request, Response } from 'express';
import { getDb } from '../db/database';

const router = Router();

const MISSION_DEFINITIONS: Record<string, { name: string; description: string; goal: number; timeRemaining: string; points: number }> = {
  complete_profile: {
    name: 'Finish creating your profile.',
    description: 'Add a bio, avatar, and at least 3 interests to complete your profile.',
    goal: 1,
    timeRemaining: '2 days left',
    points: 50
  },
  match_5_users: {
    name: 'Match with 5 different users.',
    description: 'Connect with 5 users who share your interests.',
    goal: 5,
    timeRemaining: '5 days left',
    points: 100
  },
  first_chat: {
    name: 'Send your first chat request.',
    description: 'Start a conversation with someone nearby.',
    goal: 1,
    timeRemaining: '7 days left',
    points: 25
  },
  earn_100_points: {
    name: 'Earn 100 points.',
    description: 'Complete missions and connect with others to earn points.',
    goal: 100,
    timeRemaining: '30 days left',
    points: 150
  }
};

router.get('/:userId', (req: Request, res: Response) => {
  const db = getDb();
  const missions = db.prepare(
    'SELECT * FROM missions WHERE user_id = ?'
  ).all(req.params.userId) as any[];

  const result = missions.map(m => ({
    ...m,
    ...MISSION_DEFINITIONS[m.mission_key],
    completed: m.completed === 1
  }));

  return res.json(result);
});

router.post('/complete', (req: Request, res: Response) => {
  const { userId, missionKey } = req.body;
  if (!userId || !missionKey) return res.status(400).json({ error: 'userId and missionKey required' });

  const db = getDb();
  const mission = db.prepare(
    'SELECT * FROM missions WHERE user_id = ? AND mission_key = ?'
  ).get(userId, missionKey) as any;

  if (!mission) return res.status(404).json({ error: 'Mission not found' });

  const def = MISSION_DEFINITIONS[missionKey];
  if (def) {
    db.prepare('UPDATE users SET points = points + ? WHERE id = ?').run(def.points, userId);
  }

  db.prepare(
    "UPDATE missions SET completed = 1, completed_at = datetime('now') WHERE user_id = ? AND mission_key = ?"
  ).run(userId, missionKey);

  return res.json({ success: true });
});

router.put('/progress', (req: Request, res: Response) => {
  const { userId, missionKey, progress } = req.body;
  if (!userId || !missionKey || progress === undefined) {
    return res.status(400).json({ error: 'userId, missionKey, progress required' });
  }

  const db = getDb();
  db.prepare(
    'UPDATE missions SET progress = ? WHERE user_id = ? AND mission_key = ?'
  ).run(progress, userId, missionKey);

  return res.json({ success: true });
});

export default router;
