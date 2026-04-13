import { Router } from 'express';
import { getNews, getTrending, getHero, getPopular, getCharacter } from '../controllers/publicController.js';

const router = Router();

router.get('/news', getNews);
router.get('/trending', getTrending);
router.get('/hero', getHero);
router.get('/popular', getPopular);
router.get('/character', getCharacter);

export default router;
