import { Router } from 'express';
import { signup, login, logout, refresh, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/auth.js';

const router = Router();

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
