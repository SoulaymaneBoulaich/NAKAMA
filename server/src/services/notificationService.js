import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const createNotification = async ({ recipientId, actorId, type, referenceId, message }) => {
    // Don't notify if actor is same as recipient
    if (actorId === recipientId)
        return;
    try {
        return await prisma.notification.create({
            data: {
                userId: recipientId,
                actorId: actorId || null,
                type,
                message,
                referenceId: referenceId || null,
                isRead: false
            }
        });
    }
    catch (error) {
        console.error('Error creating notification:', error);
        // Silent fail for notifications to not break core logic
    }
};
//# sourceMappingURL=notificationService.js.map