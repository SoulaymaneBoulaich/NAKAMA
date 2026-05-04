import { Router } from 'express';
import { getEntries, createEntry, updateEntry, deleteEntry } from '../controllers/entryController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createEntrySchema, updateEntrySchema } from '../schemas/entrySchema.js';

const router = Router();

router.get('/', authenticateToken, getEntries);
router.post('/', authenticateToken, validate(createEntrySchema), createEntry);
router.put('/:id', authenticateToken, validate(updateEntrySchema), updateEntry);
router.delete('/:id', authenticateToken, deleteEntry);

export default router;
