import { prisma } from '../lib/prisma.js';
// Removed local prisma = new PrismaClient()
export const getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            include: {
                actor: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.userId;
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.status(200).json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const notification = await prisma.notification.findUnique({
            where: { id: id },
        });
        if (!notification || notification.userId !== userId) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        const updated = await prisma.notification.update({
            where: { id: id },
            data: { isRead: true },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=notificationController.js.map