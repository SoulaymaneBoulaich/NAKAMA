import express from 'express';
import { getTrendingFeed, getFollowingFeed } from '../controllers/feedController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
router.get('/trending', getTrendingFeed);
router.get('/following', authenticateToken, getFollowingFeed);
export default router;
//# sourceMappingURL=feedRoutes.js.map