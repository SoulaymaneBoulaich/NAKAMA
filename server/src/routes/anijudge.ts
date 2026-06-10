import { Router } from 'express';
import * as anijudgeController from '../controllers/anijudgeController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createArenaSchema } from '../schemas/arenaSchema.js';

const router = Router();

// Lobby & Discovery
router.post('/', authenticateToken, validate(createArenaSchema), anijudgeController.createArena);
router.get('/live', optionalAuthenticateToken, anijudgeController.getLiveArenas);
router.get('/hall-of-fame', optionalAuthenticateToken, anijudgeController.getHallOfFame);
router.get('/my-records', authenticateToken, anijudgeController.getMyRecords);

// Arena Operations
router.get('/:code', optionalAuthenticateToken, anijudgeController.joinArena);
router.post('/:code/join', authenticateToken, anijudgeController.joinArenaPost);

// Judge & Admin Controls
router.post('/:arenaId/judge-request', authenticateToken, anijudgeController.requestJudge);
router.post('/:arenaId/handle-judge-request', authenticateToken, anijudgeController.handleJudgeRequest);
router.post('/:arenaId/start', authenticateToken, anijudgeController.startDebate);
router.post('/:arenaId/next-turn', authenticateToken, anijudgeController.nextTurn);
router.post('/:arenaId/add-time', authenticateToken, anijudgeController.addTime);
router.post('/:arenaId/end-round', authenticateToken, anijudgeController.endRound);
router.post('/:arenaId/verdict', authenticateToken, anijudgeController.submitVerdict);
router.post('/:arenaId/violation', authenticateToken, anijudgeController.issueViolation);

// Content
router.post('/:arenaId/argument', authenticateToken, anijudgeController.submitArgument);
router.post('/:arenaId/penalize-argument', authenticateToken, anijudgeController.penalizeArgument);

// Social
router.post('/hall-of-fame/:entryId/vote', authenticateToken, anijudgeController.voteHallOfFame);

// Post-Game (Book Eight)
router.post('/appeals', authenticateToken, anijudgeController.submitAppeal);
router.get('/appeals/all', authenticateToken, anijudgeController.getAppeals); // Should have admin check
router.patch('/appeals/:id/resolve', authenticateToken, anijudgeController.resolveAppeal);

export default router;
