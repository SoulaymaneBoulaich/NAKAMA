import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getEntries: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const createEntry: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const updateEntry: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteEntry: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=entryController.d.ts.map