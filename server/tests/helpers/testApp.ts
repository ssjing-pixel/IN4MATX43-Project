/**
 * Creates a fresh Express app backed by an in-memory SQLite DB for integration tests.
 * Set process.env.TEST_DB = ':memory:' BEFORE importing this module.
 */
import express from 'express';
import authRoutes from '../../src/routes/auth';
import profileRoutes from '../../src/routes/profile';
import missionRoutes from '../../src/routes/missions';
import locationRoutes from '../../src/routes/location';

export function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/missions', missionRoutes);
  app.use('/api/location', locationRoutes);
  return app;
}
