import { Router } from 'express';
import { votePoll, getPollResults } from '../controllers/pollController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = Router();
router.get('/:pollId', getPollResults);
router.post('/vote/:pollOptionId', authenticateToken, votePoll);
export default router;
//# sourceMappingURL=pollRoutes.js.map