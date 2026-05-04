import express from 'express';
import { toggleVote } from '../controllers/voteController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/:postId', authenticateToken, toggleVote);

export default router;
