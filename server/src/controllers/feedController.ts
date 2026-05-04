import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

const POST_INCLUDE = (userId?: string) => ({
  user: {
    select: {
      id: true,
      username: true,
      avatar: true,
    },
  },
  community: {
    select: {
      id: true,
      name: true,
      slug: true,
      avatarUrl: true,
    }
  },
  _count: {
    select: {
      likes: true,
      comments: true,
    },
  },
  ...(userId && {
    votes: {
      where: { userId },
      take: 1,
    },
  }),
});

const mapPostsWithVote = (posts: any[]) => {
  return posts.map(post => {
    const userVote = post.votes?.[0]?.type || null;
    const { votes, ...rest } = post;
    return { ...rest, userVote };
  });
};

export const getTrendingFeed = async (req: Request, res: Response) => {
  try {
    const cursor = req.query.cursor as string | undefined;
    const limit = 20;
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    // Optional userId if authenticated
    const userId = (req as any).userId; 

    const posts = await prisma.post.findMany({
      where: {
        createdAt: { gte: fortyEightHoursAgo },
      },
      include: POST_INCLUDE(userId),
      orderBy: [
        { upvoteCount: 'desc' }, // Use new upvoteCount for trending
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
      posts: mapPostsWithVote(posts),
      nextCursor
    });
  } catch (error) {
    console.error('[FeedController] Trending Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFollowingFeed = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const cursor = req.query.cursor as string | undefined;
    const limit = 20;

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
          { userId: userId }
        ],
      },
      include: POST_INCLUDE(userId),
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const nextCursor = posts.length === limit ? posts[posts.length - 1]?.id : null;

    res.status(200).json({
      posts: mapPostsWithVote(posts),
      nextCursor,
    });
  } catch (error) {
    console.error('[FeedController] Following Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCommunitiesFeed = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const cursor = req.query.cursor as string | undefined;
    const limit = 20;

    const joinedCommunities = await prisma.communityMember.findMany({
      where: { userId },
      select: { communityId: true },
    });

    const communityIds = joinedCommunities.map(c => c.communityId);

    const posts = await prisma.post.findMany({
      where: {
        communityId: { in: communityIds },
      },
      include: POST_INCLUDE(userId),
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor && {
        skip: 1,
        cursor: { id: cursor },
      }),
    });

    const nextCursor = posts.length === limit ? posts[posts.length - 1]?.id : null;

    res.status(200).json({
      posts: mapPostsWithVote(posts),
      nextCursor,
    });
  } catch (error) {
    console.error('[FeedController] Communities Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
