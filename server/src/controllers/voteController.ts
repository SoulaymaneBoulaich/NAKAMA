import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const toggleVote = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const { type } = req.body; // 'UP' or 'DOWN'
    const userId = req.userId!;

    if (!['UP', 'DOWN'].includes(type)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingVote) {
      if (existingVote.type === type) {
        // Toggle OFF: same type
        await prisma.$transaction([
          prisma.vote.delete({
            where: { id: existingVote.id },
          }),
          prisma.post.update({
            where: { id: postId },
            data: {
              [type === 'UP' ? 'upvoteCount' : 'downvoteCount']: { decrement: 1 },
            },
          }),
        ]);
        
        const updatedPost = await prisma.post.findUnique({
          where: { id: postId },
          select: { upvoteCount: true, downvoteCount: true },
        });

        return res.json({
          userVote: null,
          upvotes: updatedPost?.upvoteCount || 0,
          downvotes: updatedPost?.downvoteCount || 0,
          netScore: (updatedPost?.upvoteCount || 0) - (updatedPost?.downvoteCount || 0),
        });
      } else {
        // Switch type: opposite type
        const oldType = existingVote.type;
        await prisma.$transaction([
          prisma.vote.update({
            where: { id: existingVote.id },
            data: { type },
          }),
          prisma.post.update({
            where: { id: postId },
            data: {
              [oldType === 'UP' ? 'upvoteCount' : 'downvoteCount']: { decrement: 1 },
              [type === 'UP' ? 'upvoteCount' : 'downvoteCount']: { increment: 1 },
            },
          }),
        ]);

        const updatedPost = await prisma.post.findUnique({
          where: { id: postId },
          select: { upvoteCount: true, downvoteCount: true },
        });

        return res.json({
          userVote: type,
          upvotes: updatedPost?.upvoteCount || 0,
          downvotes: updatedPost?.downvoteCount || 0,
          netScore: (updatedPost?.upvoteCount || 0) - (updatedPost?.downvoteCount || 0),
        });
      }
    } else {
      // New Vote
      await prisma.$transaction([
        prisma.vote.create({
          data: {
            userId,
            postId,
            type,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: {
            [type === 'UP' ? 'upvoteCount' : 'downvoteCount']: { increment: 1 },
          },
        }),
      ]);

      const updatedPost = await prisma.post.findUnique({
        where: { id: postId },
        select: { upvoteCount: true, downvoteCount: true },
      });

      return res.json({
        userVote: type,
        upvotes: updatedPost?.upvoteCount || 0,
        downvotes: updatedPost?.downvoteCount || 0,
        netScore: (updatedPost?.upvoteCount || 0) - (updatedPost?.downvoteCount || 0),
      });
    }
  } catch (error) {
    console.error('[VoteController] Error toggling vote:', error);
    res.status(500).json({ error: 'Failed to process vote' });
  }
};
