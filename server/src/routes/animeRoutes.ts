import { Router } from 'express';
import { 
  searchAnime, 
  getAnimeDetails,
  getTopAnime,
  getSeasonalAnime,
  getGenres,
  discoverAnime,
  getRecommendations
} from '../controllers/animeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/search', searchAnime);
router.get('/top', getTopAnime);
router.get('/seasonal', getSeasonalAnime);
router.get('/genres', getGenres);
router.get('/discover', discoverAnime);
router.get('/recommendations', authenticateToken, getRecommendations);
router.get('/:id', getAnimeDetails);


export default router;
