import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.js';
export declare const getNotifications: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const markAllAsRead: (req: AuthenticatedRequest, res: Response) => Promise<void>;
export declare const markAsRead: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=notificationController.d.ts.map