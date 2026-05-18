// ROUTES INDEX

import express from 'express';
import eventRoutes from './eventRoutes.js';
import userRoutes from './userRoutes.js';

const router = express.Router();

router.use('/events', eventRoutes);
router.use('/users', userRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;
