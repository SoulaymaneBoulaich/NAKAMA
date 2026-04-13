import { Router } from 'express';
import { getRatingByAnimeId, upsertRating } from '../controllers/ratingController.js';
const router = Router();
router.get('/:animeId', getRatingByAnimeId);
router.post('/', upsertRating);
export default router;
//# sourceMappingURL=ratingRoutes.js.map