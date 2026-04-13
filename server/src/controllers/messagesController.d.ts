import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getConversations: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const startConversation: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getMessages: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=messagesController.d.ts.map