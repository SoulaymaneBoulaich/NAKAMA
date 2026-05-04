import { Router } from 'express';
import { getRatingByAnimeId, upsertRating } from '../controllers/ratingController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upsertRatingSchema } from '../schemas/ratingSchema.js';

const router = Router();

router.get('/:animeId', authenticateToken, getRatingByAnimeId);
router.post('/', authenticateToken, validate(upsertRatingSchema), upsertRating);

export default router;
