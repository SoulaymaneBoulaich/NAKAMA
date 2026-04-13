import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getTrendingFeed: (req: Request, res: Response) => Promise<void>;
export declare const getFollowingFeed: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=feedController.d.ts.map