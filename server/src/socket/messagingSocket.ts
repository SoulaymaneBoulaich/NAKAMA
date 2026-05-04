import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { encrypt } from '../utils/encryption.js';

export const setupMessagingSocket = (io: Server, socket: Socket) => {
    socket.on('join-conversation', async ({ conversationId, userId }) => {
        try {
            // Validate participation
            const participant = await prisma.conversationParticipant.findUnique({
                where: {
                    conversationId_userId: { conversationId, userId }
                }
            });

            if (participant) {
                socket.join(conversationId);
            }
        } catch (error) {}
    });

    socket.on('send-message', async ({ conversationId, senderId, content }) => {
        try {
            // Encrypt content before storage
            const encryptedContent = encrypt(content);

            const message = await prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    content: encryptedContent
                },
                include: {
                    sender: { select: { id: true, username: true, avatar: true } }
                }
            });

            // Update conversation timestamp
            await prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() }
            });

            // Emit original content to recipients
            io.to(conversationId).emit('new-message', {
                ...message,
                content // Use original content for immediate display
            });
        } catch (error) {}
    });

    socket.on('typing', ({ conversationId, userId, username }) => {
        socket.to(conversationId).emit('typing-indicator', { conversationId, userId, username });
    });
};
