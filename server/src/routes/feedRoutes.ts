import express from 'express';
import { getTrendingFeed, getFollowingFeed, getCommunitiesFeed } from '../controllers/feedController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/trending', getTrendingFeed);
router.get('/following', authenticateToken, getFollowingFeed);
router.get('/communities', authenticateToken, getCommunitiesFeed);

export default router;
