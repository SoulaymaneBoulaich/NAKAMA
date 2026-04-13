import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getRatingByAnimeId: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const upsertRating: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=ratingController.d.ts.map