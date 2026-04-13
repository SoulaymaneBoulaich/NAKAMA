import { PrismaClient, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();

export const logActivity = async (
  userId: string,
  type: ActivityType,
  targetId?: string,
  targetName?: string,
  metadata?: any
) => {
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
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
