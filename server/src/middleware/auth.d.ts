import type { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    userId?: string;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const optionalAuthenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const authRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
//# sourceMappingURL=auth.d.ts.map