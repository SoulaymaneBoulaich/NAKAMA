import { prisma } from '../lib/prisma.js';
import { getStringParam, getStringQuery } from '../utils/params.js';
export const getConversations = async (req, res) => {
    try {
        const userId = req.userId;
        const conversations = await prisma.conversationParticipant.findMany({
            where: { userId },
            include: {
                conversation: {
                    include: {
                        participants: {
                            where: { userId: { not: userId } },
                            include: {
                                user: { select: { id: true, username: true, avatar: true } }
                            }
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1,
                            include: {
                                sender: { select: { username: true } }
                            }
                        }
                    }
                }
            },
            orderBy: {
                conversation: { updatedAt: 'desc' }
            }
        });
        // Filter and map to a cleaner response
        const formatted = conversations.map(p => {
            const otherParticipant = p.conversation.participants[0]?.user;
            const lastMessage = p.conversation.messages[0];
            return {
                id: p.conversation.id,
                otherUser: otherParticipant,
                lastMessage: lastMessage ? {
                    content: lastMessage.content,
                    createdAt: lastMessage.createdAt,
                    senderUsername: lastMessage.sender.username
                } : null,
                updatedAt: p.conversation.updatedAt,
                unreadCount: 0 // Will implement logic or placeholder
            };
        });
        res.status(200).json(formatted);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching conversations' });
    }
};
export const startConversation = async (req, res) => {
    try {
        const userId = req.userId;
        const { username } = req.body;
        if (!username)
            return res.status(400).json({ message: 'Username is required' });
        const otherUser = await prisma.user.findUnique({ where: { username } });
        if (!otherUser)
            return res.status(404).json({ message: 'User not found' });
        if (otherUser.id === userId)
            return res.status(400).json({ message: 'Cannot message yourself' });
        // Check for existing conversation
        const existing = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId } } },
                    { participants: { some: { userId: otherUser.id } } }
                ]
            },
            include: {
                participants: {
                    where: { userId: { not: userId } },
                    include: { user: { select: { id: true, username: true, avatar: true } } }
                }
            }
        });
        if (existing) {
            return res.status(200).json(existing);
        }
        const newConversation = await prisma.conversation.create({
            data: {
                participants: {
                    create: [
                        { userId },
                        { userId: otherUser.id }
                    ]
                }
            },
            include: {
                participants: {
                    where: { userId: { not: userId } },
                    include: { user: { select: { id: true, username: true, avatar: true } } }
                }
            }
        });
        res.status(201).json(newConversation);
    }
    catch (error) {
        res.status(500).json({ message: 'Error starting conversation' });
    }
};
export const getMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const conversationId = getStringParam(req.params.id);
        const cursor = getStringQuery(req.query.cursor, '');
        // Validate participation
        const participant = await prisma.conversationParticipant.findUnique({
            where: {
                conversationId_userId: { conversationId, userId }
            }
        });
        if (!participant)
            return res.status(403).json({ message: 'Not a participant' });
        // Fetch messages
        const messages = await prisma.message.findMany({
            where: { conversationId },
            take: 50,
            skip: cursor ? 1 : 0,
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' },
            include: {
                sender: { select: { id: true, username: true, avatar: true } }
            }
        });
        // Update lastReadAt
        await prisma.conversationParticipant.update({
            where: { id: participant.id },
            data: { lastReadAt: new Date() }
        });
        res.status(200).json(messages);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
};
//# sourceMappingURL=messagesController.js.map