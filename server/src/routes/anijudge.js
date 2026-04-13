import { Router } from 'express';
import * as anijudgeController from '../controllers/anijudgeController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
const router = Router();
router.post('/', authenticateToken, anijudgeController.createArena);
router.get('/hall-of-fame', optionalAuthenticateToken, anijudgeController.getHallOfFame);
router.get('/my-history', authenticateToken, anijudgeController.getMyHistory);
router.get('/:code', optionalAuthenticateToken, anijudgeController.getArenaByCode);
router.post('/:code/vote-fame', authenticateToken, anijudgeController.voteHallOfFame);
export default router;
//# sourceMappingURL=anijudge.js.map