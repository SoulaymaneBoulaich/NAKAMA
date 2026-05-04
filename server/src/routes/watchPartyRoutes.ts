import { Router } from 'express';
import { 
  createParty, 
  getActiveParties, 
  getPartyByCode, 
  updatePartyState 
} from '../controllers/watchPartyController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createPartySchema, updatePartyStateSchema } from '../schemas/watchPartySchema.js';

const router = Router();

router.post('/', authenticateToken, validate(createPartySchema), createParty);
router.get('/active', getActiveParties);
router.get('/:code', getPartyByCode);
router.patch('/:code/state', authenticateToken, validate(updatePartyStateSchema), updatePartyState);

export default router;
