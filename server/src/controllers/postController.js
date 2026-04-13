import { prisma } from '../lib/prisma.js';
import { createNotification } from '../services/notificationService.js';
// Removed local prisma = new PrismaClient()
export const createPost = async (req, res) => {
    try {
        const userId = req.userId;
        const { content, communityId, animeId } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const post = await prisma.post.create({
            data: {
                userId,
                content,
                imageUrl,
                communityId: communityId || null,
                animeId: animeId || null,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });
        res.status(201).json(post);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const post = await prisma.post.findUnique({
            where: { id: id },
        });
        if (!post || post.userId !== userId) {
            return res.status(404).json({ error: 'Post not found or unauthorized' });
        }
        await prisma.post.delete({
            where: { id: id },
        });
        res.status(200).json({ message: 'Post deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const toggleLike = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: { userId, postId: postId },
            },
        });
        if (existingLike) {
            await prisma.like.delete({
                where: {
                    userId_postId: { userId, postId: postId },
                },
            });
            return res.status(200).json({ liked: false });
        }
        else {
            await prisma.like.create({
                data: { userId, postId: postId },
            });
            // Notify post owner
            const post = await prisma.post.findUnique({
                where: { id: postId },
                select: { userId: true },
            });
            if (post && post.userId !== userId) {
                await createNotification({
                    recipientId: post.userId,
                    actorId: userId,
                    type: 'LIKE',
                    message: 'liked your post',
                    referenceId: postId
                });
            }
            return res.status(200).json({ liked: true });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const comments = await prisma.comment.findMany({
            where: { postId: postId },
            include: {
                user: {
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
        res.status(200).json(comments);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const createComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.userId;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }
        const comment = await prisma.comment.create({
            data: {
                postId: postId,
                userId,
                content,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
            },
        });
        // Notify post owner
        const post = await prisma.post.findUnique({
            where: { id: postId },
            select: { userId: true },
        });
        if (post && post.userId !== userId) {
            await createNotification({
                recipientId: post.userId,
                actorId: userId,
                type: 'COMMENT',
                message: 'commented on your post',
                referenceId: postId
            });
        }
        res.status(201).json(comment);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const comment = await prisma.comment.findUnique({
            where: { id: id },
        });
        if (!comment || comment.userId !== userId) {
            return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }
        await prisma.comment.delete({
            where: { id: id },
        });
        res.status(200).json({ message: 'Comment deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=postController.js.map