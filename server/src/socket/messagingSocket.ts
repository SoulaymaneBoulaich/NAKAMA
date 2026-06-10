import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { encrypt, decrypt } from '../utils/encryption.js';

export const setupMessagingSocket = (io: Server, socket: Socket) => {
    socket.on('join-conversation', async ({ conversationId, userId }) => {
        try {
            if (conversationId === 'mock-123') {
                socket.join(conversationId);
                return;
            }

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
            // Handle mock user testing
            if (conversationId === 'mock-123') {
                const mockMessage = {
                    id: Math.random().toString(36).substr(2, 9),
                    conversationId,
                    senderId,
                    content,
                    createdAt: new Date().toISOString(),
                    sender: {
                        id: senderId,
                        username: 'You', // Since it's from the current user
                        avatar: ''
                    }
                };
                
                io.to(conversationId).emit('new-message', mockMessage);
                
                // Simulate reply from the mock user
                setTimeout(() => {
                    io.to(conversationId).emit('typing-indicator', { conversationId, userId: 'user-999', username: 'Luffy_PirateKing' });
                    
                    setTimeout(() => {
                        const replyMessage = {
                            id: Math.random().toString(36).substr(2, 9),
                            conversationId,
                            senderId: 'user-999',
                            content: 'I will be the Pirate King! 🏴‍☠️',
                            createdAt: new Date().toISOString(),
                            sender: {
                                id: 'user-999',
                                username: 'Luffy_PirateKing',
                                avatar: ''
                            }
                        };
                        io.to(conversationId).emit('new-message', replyMessage);
                    }, 2000);
                }, 1000);
                
                return;
            }

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
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    });

    socket.on('typing', ({ conversationId, userId, username }) => {
        socket.to(conversationId).emit('typing-indicator', { conversationId, userId, username });
    });

    socket.on('vote-poll', async ({ conversationId, messageId, userId, optionIndex }) => {
        try {
            if (conversationId === 'mock-123') return; // Handled client-side optimally or mock only

            const message = await prisma.message.findUnique({ where: { id: messageId } });
            if (!message) return;

            const decryptedContent = decrypt(message.content);
            if (decryptedContent.startsWith('[POLL]')) {
                const pollData = JSON.parse(decryptedContent.replace('[POLL]', ''));
                const option = pollData.options[optionIndex];
                
                const hasVoted = option.votes.includes(userId);
                if (hasVoted) {
                    option.votes = option.votes.filter((id: string) => id !== userId);
                } else {
                    pollData.options.forEach((opt: any) => {
                        opt.votes = opt.votes.filter((id: string) => id !== userId);
                    });
                    option.votes.push(userId);
                }

                const updatedContent = '[POLL]' + JSON.stringify(pollData);
                const encryptedContent = encrypt(updatedContent);

                await prisma.message.update({
                    where: { id: messageId },
                    data: { content: encryptedContent }
                });

                io.to(conversationId).emit('message-updated', {
                    messageId,
                    content: updatedContent
                });
            }
        } catch (error) {
            console.error("Failed to vote poll:", error);
        }
    });

    // WebRTC Signaling
    socket.on('call-user', (data) => {
        socket.to(data.conversationId).emit('call-made', {
            offer: data.offer,
            callerId: data.callerId,
            callerName: data.callerName,
            isVideo: data.isVideo
        });
    });

    socket.on('make-answer', (data) => {
        socket.to(data.conversationId).emit('answer-made', {
            answer: data.answer,
            answererId: data.answererId
        });
    });

    socket.on('ice-candidate', (data) => {
        socket.to(data.conversationId).emit('ice-candidate', {
            candidate: data.candidate,
            senderId: data.senderId
        });
    });

    socket.on('end-call', (data) => {
        socket.to(data.conversationId).emit('call-ended', {
            endedBy: data.endedBy
        });
    });
    
    socket.on('reject-call', (data) => {
        socket.to(data.conversationId).emit('call-rejected', {
            rejectedBy: data.rejectedBy
        });
    });
};
