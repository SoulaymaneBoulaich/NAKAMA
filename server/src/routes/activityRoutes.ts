import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import * as activityService from '../services/activityService.js';

const router = Router();

// Start a new activity session
router.post('/session/start', authenticateToken, async (req, res) => {
  try {
    const { initialPage } = req.body;
    const session = await activityService.startSession((req as any).userId, initialPage || '/');
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to start activity session' });
  }
});

// Update session heartbeat
router.post('/session/:id/heartbeat', authenticateToken, async (req, res) => {
  try {
    const { activeSeconds } = req.body;
    const session = await activityService.updateHeartbeat(req.params.id, activeSeconds || 0);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update heartbeat' });
  }
});

// Log page view
router.post('/session/:id/page-view', authenticateToken, async (req, res) => {
  try {
    const { url } = req.body;
    const session = await activityService.logPageView(req.params.id, url);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to log page view' });
  }
});

// Get user activity summary (private)
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const summary = await activityService.getUserActivitySummary((req as any).userId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch activity summary' });
  }
});

export default router;
