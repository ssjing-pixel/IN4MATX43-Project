import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDb, getDb } from './db/database';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import locationRoutes from './routes/location';
import friendRoutes from './routes/friends';
import chatRoutes from './routes/chat';
import missionRoutes from './routes/missions';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Initialize DB
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/nearby', (req, res) => {
  // Redirect to location/nearby
  req.url = '/nearby' + (req.url === '/' ? '' : req.url);
  locationRoutes(req, res, () => {});
});
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/missions', missionRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Socket.io
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_channel', (channelId: number) => {
    socket.join(`channel_${channelId}`);
  });

  socket.on('leave_channel', (channelId: number) => {
    socket.leave(`channel_${channelId}`);
  });

  socket.on('send_message', (data: { channelId: number; senderId: number; content: string }) => {
    const { channelId, senderId, content } = data;
    if (!channelId || !senderId || !content?.trim()) return;

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

    io.to(`channel_${channelId}`).emit('new_message', message);

    // Update first_chat mission progress
    const mission = db.prepare(
      "SELECT * FROM missions WHERE user_id = ? AND mission_key = 'first_chat'"
    ).get(senderId) as any;
    if (mission && !mission.completed) {
      db.prepare("UPDATE missions SET progress = 1, completed = 1, completed_at = datetime('now') WHERE user_id = ? AND mission_key = 'first_chat'").run(senderId);
      db.prepare('UPDATE users SET points = points + 25 WHERE id = ?').run(senderId);
      io.to(`channel_${channelId}`).emit('mission_completed', { missionKey: 'first_chat', userId: senderId });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`CommonGround server running on http://localhost:${PORT}`);
});
