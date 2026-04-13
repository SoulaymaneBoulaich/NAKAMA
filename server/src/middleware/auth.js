import rateLimit from 'express-rate-limit';
import { verifyAccessToken } from '../utils/tokens.js';
export const authenticateToken = (req, res, next) => {
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
export const optionalAuthenticateToken = (req, res, next) => {
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
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
});
//# sourceMappingURL=auth.js.map