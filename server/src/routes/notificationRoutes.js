import express from 'express';
import { getNotifications, markAllAsRead, markAsRead } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';
const router = express.Router();
router.use(authenticateToken);
router.get('/', getNotifications);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
export default router;
//# sourceMappingURL=notificationRoutes.js.map