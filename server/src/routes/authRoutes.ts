import { Router } from 'express';
import { signup, login, logout, refresh, forgotPassword, resetPassword } from '../controllers/authController.js';
import { loginRateLimiter, signupRateLimiter } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/authSchema.js';

const router = Router();

router.post('/signup', signupRateLimiter, validate(signupSchema), signup);
router.post('/login', loginRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.post('/refresh', refresh);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);

export default router;
