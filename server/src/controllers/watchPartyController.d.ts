import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const createParty: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getActiveParties: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const getPartyByCode: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updatePartyState: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=watchPartyController.d.ts.map