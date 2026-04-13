import { Router } from 'express';
import { 
  browseCommunities, 
  getCommunity, 
  createCommunity, 
  getCommunityPosts, 
  joinCommunity, 
  leaveCommunity, 
  updateCommunity, 
  removeMember,
  getMembers,
  getUserCommunities
} from '../controllers/communityController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', browseCommunities);
router.get('/:slug', getCommunity);
router.get('/:slug/posts', getCommunityPosts);
router.get('/:slug/members', getMembers);
router.get('/user/joined', authenticateToken, getUserCommunities);

router.post('/', authenticateToken, createCommunity);
router.post('/:slug/join', authenticateToken, joinCommunity);
router.delete('/:slug/leave', authenticateToken, leaveCommunity);
router.put('/:slug', authenticateToken, updateCommunity);
router.delete('/:slug/members/:userId', authenticateToken, removeMember);

export default router;
