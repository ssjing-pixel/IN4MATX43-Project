import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_PATH = process.env.TEST_DB || path.join(__dirname, '../../commonground.db');

let db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    if (DB_PATH !== ':memory:') {
      db.pragma('journal_mode = WAL');
    }
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = undefined;
  }
}

export function initDb(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      bio TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      interests TEXT DEFAULT '[]',
      range_miles REAL DEFAULT 5.0,
      visible INTEGER DEFAULT 1,
      points INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS location_updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS chat_channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user1_id) REFERENCES users(id),
      FOREIGN KEY (user2_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (channel_id) REFERENCES chat_channels(id),
      FOREIGN KEY (sender_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      friend_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (friend_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      mission_key TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  seedDatabase(db);
}

function seedDatabase(db: Database.Database): void {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (existingUsers.count > 0) return;

  const hash1 = bcrypt.hashSync('password123', 10);
  const hash2 = bcrypt.hashSync('password123', 10);
  const hash3 = bcrypt.hashSync('password123', 10);
  const hash4 = bcrypt.hashSync('password123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, display_name, bio, interests, range_miles, visible, points)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const u1 = insertUser.run('elaine_k', hash1, 'Elaine K.', 'Love hiking and photography!', JSON.stringify(['hiking','photography','coffee','fitness']), 5, 1, 120);
  const u2 = insertUser.run('gisele_d', hash2, 'Gisele D.', 'Coffee lover and gamer.', JSON.stringify(['gaming','coffee','coding','anime']), 3, 1, 85);
  const u3 = insertUser.run('jenny_t', hash3, 'Jenny T.', 'Bookworm and music fan.', JSON.stringify(['reading','music','crafts','art']), 7, 1, 200);
  const u4 = insertUser.run('demo_user', hash4, 'Demo User', 'Just exploring!', JSON.stringify(['hiking','gaming','music']), 5, 1, 50);

  const userId1 = u1.lastInsertRowid as number;
  const userId2 = u2.lastInsertRowid as number;
  const userId3 = u3.lastInsertRowid as number;
  const userId4 = u4.lastInsertRowid as number;

  // Seed locations near UCI (33.6405, -117.8443)
  const insertLoc = db.prepare('INSERT INTO location_updates (user_id, lat, lng) VALUES (?, ?, ?)');
  insertLoc.run(userId1, 33.6430, -117.8420);
  insertLoc.run(userId2, 33.6380, -117.8460);
  insertLoc.run(userId3, 33.6450, -117.8480);
  insertLoc.run(userId4, 33.6405, -117.8443);

  // Seed friendships
  const insertFriend = db.prepare('INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, ?)');
  insertFriend.run(userId4, userId1, 'accepted');
  insertFriend.run(userId1, userId4, 'accepted');
  insertFriend.run(userId4, userId2, 'accepted');
  insertFriend.run(userId2, userId4, 'accepted');
  insertFriend.run(userId4, userId3, 'accepted');
  insertFriend.run(userId3, userId4, 'accepted');

  // Seed chat channels and messages
  const insertChannel = db.prepare('INSERT INTO chat_channels (user1_id, user2_id) VALUES (?, ?)');
  const ch1 = insertChannel.run(userId4, userId1);
  const ch2 = insertChannel.run(userId4, userId2);

  const insertMsg = db.prepare('INSERT INTO messages (channel_id, sender_id, content) VALUES (?, ?, ?)');
  insertMsg.run(ch1.lastInsertRowid, userId1, 'Hey! Want to go hiking this weekend?');
  insertMsg.run(ch1.lastInsertRowid, userId4, 'Sure! Where do you have in mind?');
  insertMsg.run(ch1.lastInsertRowid, userId1, 'How about Laguna Beach trails?');
  insertMsg.run(ch2.lastInsertRowid, userId2, 'Up for some gaming tonight?');
  insertMsg.run(ch2.lastInsertRowid, userId4, 'Definitely! What are we playing?');

  // Seed missions for demo_user
  const insertMission = db.prepare('INSERT INTO missions (user_id, mission_key, progress, completed) VALUES (?, ?, ?, ?)');
  insertMission.run(userId4, 'complete_profile', 1, 0);
  insertMission.run(userId4, 'match_5_users', 3, 0);
  insertMission.run(userId4, 'first_chat', 0, 0);
  insertMission.run(userId4, 'earn_100_points', 50, 0);
}
