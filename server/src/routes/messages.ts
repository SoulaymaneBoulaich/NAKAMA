import { Router } from 'express';
import * as messagesController from '../controllers/messagesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, messagesController.getConversations);
router.post('/', authenticateToken, messagesController.startConversation);
router.get('/:id/messages', authenticateToken, messagesController.getMessages);

export default router;
