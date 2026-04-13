import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type NotificationType = 'LIKE' | 'COMMENT' | 'FOLLOW' | 'COMMUNITY_JOIN' | 'SYSTEM';

interface CreateNotificationParams {
  recipientId: string;
  actorId?: string;
  type: NotificationType;
  referenceId?: string; // ID of the post, comment, etc.
  message: string;
}

export const createNotification = async ({
  recipientId,
  actorId,
  type,
  referenceId,
  message
}: CreateNotificationParams) => {
  // Don't notify if actor is same as recipient
  if (actorId === recipientId) return;

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
  } catch (error) {
    console.error('Error creating notification:', error);
    // Silent fail for notifications to not break core logic
  }
};
