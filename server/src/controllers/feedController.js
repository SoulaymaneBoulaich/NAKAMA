import { prisma } from '../lib/prisma.js';
// Removed local prisma = new PrismaClient()
export const getTrendingFeed = async (req, res) => {
    try {
        const cursor = req.query.cursor;
        const limit = 20;
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const posts = await prisma.post.findMany({
            where: {
                createdAt: { gte: fortyEightHoursAgo },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                community: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
            orderBy: [
                { likes: { _count: 'desc' } },
                { comments: { _count: 'desc' } },
                { createdAt: 'desc' }
            ],
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
        });
        const nextCursor = posts.length === limit ? posts[posts.length - 1]?.id : null;
        res.status(200).json({
            posts,
            nextCursor
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const getFollowingFeed = async (req, res) => {
    try {
        const userId = req.userId;
        const cursor = req.query.cursor;
        const limit = 20;
        // Get IDs of users and communities followed
        const followedUsers = await prisma.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const joinedCommunities = await prisma.communityMember.findMany({
            where: { userId },
            select: { communityId: true },
        });
        const followingIds = followedUsers.map(f => f.followingId);
        const communityIds = joinedCommunities.map(c => c.communityId);
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { userId: { in: followingIds } },
                    { communityId: { in: communityIds } },
                    { userId: userId } // Include own posts too
                ],
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                    },
                },
                community: true,
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            ...(cursor && {
                skip: 1,
                cursor: { id: cursor },
            }),
        });
        const nextCursor = posts.length === limit ? posts[posts.length - 1]?.id : null;
        res.status(200).json({
            posts,
            nextCursor,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=feedController.js.map