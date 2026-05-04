import { Router } from 'express';
import * as anijudgeController from '../controllers/anijudgeController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createArenaSchema } from '../schemas/arenaSchema.js';

const router = Router();

router.post('/', authenticateToken, validate(createArenaSchema), anijudgeController.createArena);
router.get('/hall-of-fame', optionalAuthenticateToken, anijudgeController.getHallOfFame);
router.get('/my-history', authenticateToken, anijudgeController.getMyHistory);
router.get('/:code', optionalAuthenticateToken, anijudgeController.getArenaByCode);
router.post('/:code/vote-fame', authenticateToken, anijudgeController.voteHallOfFame);

export default router;
