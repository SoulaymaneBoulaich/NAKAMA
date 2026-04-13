import { Router } from 'express';
import * as followController from '../controllers/followController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.post('/:userId/follow', authenticateToken, followController.followUser);
router.post('/:userId/unfollow', authenticateToken, followController.unfollowUser);
router.get('/:username/followers', followController.getFollowers);
router.get('/:username/following', followController.getFollowing);
export default router;
//# sourceMappingURL=followRoutes.js.map