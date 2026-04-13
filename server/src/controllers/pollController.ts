import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

// Removed local prisma = new PrismaClient()

export const votePoll = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const pollOptionId = req.params.pollOptionId as string;

    const option = await prisma.pollOption.findUnique({
      where: { id: pollOptionId },
      include: { poll: true }
    });

    if (!option) return res.status(404).json({ error: 'Option not found' });

    const poll = (option as any).poll;

    // Check if poll has expired
    if (poll.expiresAt && new Date() > poll.expiresAt) {
      return res.status(400).json({ error: 'Poll has expired' });
    }

    // Check if user already voted in THIS poll
    const existingVote = await prisma.pollVote.findFirst({
      where: {
        userId,
        pollOption: { pollId: option.pollId }
      }
    });

    if (existingVote) return res.status(400).json({ error: 'Already voted in this poll' });

    await prisma.$transaction([
      prisma.pollVote.create({
        data: { userId, pollOptionId }
      }),
      prisma.pollOption.update({
        where: { id: pollOptionId },
        data: { voteCount: { increment: 1 } }
      })
    ]);

    const updatedPoll = await prisma.poll.findUnique({
      where: { id: option.pollId },
      include: {
        options: {
          include: {
            votes: { select: { userId: true } }
          }
        }
      }
    });

    res.status(200).json(updatedPoll);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPollResults = async (req: Request, res: Response) => {
  try {
    const pollId = req.params.pollId as string;
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            votes: { select: { userId: true } }
          }
        }
      }
    });

    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
