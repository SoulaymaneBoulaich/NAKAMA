import { Router } from 'express';
import { 
  createParty, 
  getActiveParties, 
  getPartyByCode, 
  updatePartyState 
} from '../controllers/watchPartyController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, createParty);
router.get('/active', getActiveParties);
router.get('/:code', getPartyByCode);
router.patch('/:code/state', authenticateToken, updatePartyState);

export default router;
