import { Router } from 'express';
import { 
  searchAnime, 
  getAnimeDetails,
  getTopAnime,
  getSeasonalAnime,
  getGenres,
  discoverAnime,
  getRecommendations,
  getStudioDetails
} from '../controllers/animeController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/search', optionalAuthenticateToken, searchAnime);
router.get('/top', getTopAnime);
router.get('/seasonal', getSeasonalAnime);
router.get('/genres', getGenres);
router.get('/discover', discoverAnime);
router.get('/recommendations', authenticateToken, getRecommendations);
router.get('/studios/:id', getStudioDetails);
router.get('/:id', optionalAuthenticateToken, getAnimeDetails);


export default router;
