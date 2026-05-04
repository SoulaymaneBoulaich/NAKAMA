import type { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyAccessToken } from '../utils/tokens.js';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired access token' });
  }

  req.userId = payload.userId;
  next();
};

export const optionalAuthenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const payload = verifyAccessToken(token);
    if (payload) {
      req.userId = payload.userId;
    }
  }

  next();
};

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // 20 attempts for login
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Excessive login attempts, please try again in 15 minutes.' },
});

export const signupRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 attempts for signup (more relaxed for dev/testing)
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many account creation attempts, please try again later.' },
});
