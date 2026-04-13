import { PrismaClient, ActivityType } from '@prisma/client';
const prisma = new PrismaClient();
export const logActivity = async (userId, type, targetId, targetName, metadata) => {
    try {
        await prisma.activity.create({
            data: {
                userId,
                type,
                targetId,
                targetName,
                metadata: metadata || {},
            },
        });
    }
    catch (error) {
        console.error('Error logging activity:', error);
    }
};
//# sourceMappingURL=activityLogger.js.map