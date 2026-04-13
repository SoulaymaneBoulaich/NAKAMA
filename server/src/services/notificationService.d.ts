export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'COMMUNITY_JOIN' | 'SYSTEM';
interface CreateNotificationParams {
    recipientId: string;
    actorId?: string;
    type: NotificationType;
    referenceId?: string;
    message: string;
}
export declare const createNotification: ({ recipientId, actorId, type, referenceId, message }: CreateNotificationParams) => Promise<{
    id: string;
    createdAt: Date;
    userId: string;
    actorId: string | null;
    type: string;
    message: string;
    isRead: boolean;
    referenceId: string | null;
} | undefined>;
export {};
//# sourceMappingURL=notificationService.d.ts.map