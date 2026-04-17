import { Router } from 'express';
import {
    getQuizzes, 
    startAttempt, 
    getNextQuestion, 
    submitAnswer, 
    getHallOfFame,
    getHallOfShame
} from '../controllers/quizController.js';
import {
    submitQuestion,
    getPendingSubmissions,
    voteOnSubmission,
    getMySubmissions
} from '../controllers/questionSubmissionController.js';
import {
    getDailyQuestion,
    submitDailyAnswer,
    getUserStreak
} from '../controllers/dailyQuizController.js';
import {
    getAnimeQuizRooms,
    getTournaments,
    joinTournament,
    getSeasonalGauntlet
} from '../controllers/tournamentController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { startQuizSchema, submitAnswerSchema, submitQuestionSchema, voteSubmissionSchema } from '../schemas/quizSchema.js';

const router = Router();

router.get('/', getQuizzes);
router.get('/hall-of-fame', getHallOfFame);
router.get('/hall-of-shame', getHallOfShame);
router.post('/start', authenticateToken, validate(startQuizSchema), startAttempt);
router.get('/attempt/:attemptId/question', authenticateToken, getNextQuestion);
router.post('/attempt/:attemptId/submit', authenticateToken, validate(submitAnswerSchema), submitAnswer);

// Community Submissions
router.post('/submissions', authenticateToken, validate(submitQuestionSchema), submitQuestion);
router.get('/submissions/pending', authenticateToken, getPendingSubmissions);
router.post('/submissions/:submissionId/vote', authenticateToken, validate(voteSubmissionSchema), voteOnSubmission);
router.get('/submissions/my', authenticateToken, getMySubmissions);

// Daily Quiz
router.get('/daily', authenticateToken, getDailyQuestion);
router.post('/daily/submit', authenticateToken, submitDailyAnswer);
router.get('/streak', authenticateToken, getUserStreak);

// Competition & Rooms
router.get('/rooms', authenticateToken, getAnimeQuizRooms);
router.get('/tournaments', authenticateToken, getTournaments);
router.post('/tournaments/join', authenticateToken, joinTournament);
router.get('/gauntlet/seasonal', authenticateToken, getSeasonalGauntlet);

export default router;
