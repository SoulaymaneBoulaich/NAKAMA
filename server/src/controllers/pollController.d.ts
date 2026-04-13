import type { Request, Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const votePoll: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPollResults: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=pollController.d.ts.map