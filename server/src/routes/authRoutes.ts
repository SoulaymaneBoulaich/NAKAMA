import { Router } from 'express';
import { signup, login, logout, refresh, forgotPassword, resetPassword } from '../controllers/authController.js';
import { authRateLimiter } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/authSchema.js';

const router = Router();

// Apply rate limiter to all auth routes
router.use(authRateLimiter);

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

export default router;
