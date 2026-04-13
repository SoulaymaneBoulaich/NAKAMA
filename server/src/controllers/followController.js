import { ActivityType } from '@prisma/client';
import { logActivity } from '../utils/activityLogger.js';
import { prisma } from '../lib/prisma.js';
import { getStringParam } from '../utils/params.js';
// Removed local prisma = new PrismaClient()
export const followUser = async (req, res) => {
    try {
        const followerId = req.userId;
        const followingId = getStringParam(req.params.userId);
        if (followerId === followingId) {
            return res.status(400).json({ message: 'Cannot follow yourself' });
        }
        const followingUser = await prisma.user.findUnique({
            where: { id: followingId }
        });
        if (!followingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        const follow = await prisma.follow.upsert({
            where: {
                followerId_followingId: { followerId, followingId }
            },
            update: {},
            create: { followerId, followingId }
        });
        // Log activity
        await logActivity(followerId, ActivityType.FOLLOW, followingId, followingUser.username);
        res.status(201).json(follow);
    }
    catch (error) {
        res.status(500).json({ message: 'Error following user' });
    }
};
export const unfollowUser = async (req, res) => {
    try {
        const followerId = req.userId;
        const followingId = getStringParam(req.params.userId);
        await prisma.follow.deleteMany({
            where: { followerId, followingId }
        });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Error unfollowing user' });
    }
};
export const getFollowers = async (req, res) => {
    try {
        const username = getStringParam(req.params.username);
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const followers = await prisma.follow.findMany({
            where: { followingId: user.id },
            include: {
                follower: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        bio: true,
                    }
                }
            }
        });
        res.status(200).json(followers.map(f => f.follower));
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching followers' });
    }
};
export const getFollowing = async (req, res) => {
    try {
        const username = getStringParam(req.params.username);
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true }
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const following = await prisma.follow.findMany({
            where: { followerId: user.id },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        avatar: true,
                        bio: true,
                    }
                }
            }
        });
        res.status(200).json(following.map(f => f.following));
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching following' });
    }
};
//# sourceMappingURL=followController.js.map