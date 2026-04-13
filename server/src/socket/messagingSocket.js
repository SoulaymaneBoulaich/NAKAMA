import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
export const setupMessagingSocket = (io, socket) => {
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
        }
        catch (error) { }
    });
    socket.on('send-message', async ({ conversationId, senderId, content }) => {
        try {
            const message = await prisma.message.create({
                data: {
                    conversationId,
                    senderId,
                    content
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
            io.to(conversationId).emit('new-message', message);
        }
        catch (error) { }
    });
    socket.on('typing', ({ conversationId, userId, username }) => {
        socket.to(conversationId).emit('typing-indicator', { conversationId, userId, username });
    });
};
//# sourceMappingURL=messagingSocket.js.map