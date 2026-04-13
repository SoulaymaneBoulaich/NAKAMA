import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const createArena: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getArenaByCode: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getHallOfFame: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const voteHallOfFame: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMyHistory: (req: AuthenticatedRequest, res: Response) => Promise<void>;
//# sourceMappingURL=anijudgeController.d.ts.map