import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const followUser: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const unfollowUser: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getFollowers: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getFollowing: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=followController.d.ts.map