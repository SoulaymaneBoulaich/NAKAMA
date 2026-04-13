import { ActivityType } from '@prisma/client';
export declare const logActivity: (userId: string, type: ActivityType, targetId?: string, targetName?: string, metadata?: any) => Promise<void>;
//# sourceMappingURL=activityLogger.d.ts.map