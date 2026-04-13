import express, { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/anishots
 * Fetch all active anishots from following and public
 */
router.get('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    
    // Fetch anishots from users the user follows, plus public ones
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true }
    });
    
    const followingIds = following.map(f => f.followingId);
    
    const anishots = await prisma.aniShot.findMany({
      where: {
        OR: [
          { userId: userId },
          { userId: { in: followingIds } },
          { user: { isPrivate: false } }
        ],
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(anishots);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/anishots
 * Create a new anishot
 */
router.post('/', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { content, mediaUrl, animeId, animeTitle, animeCover, type } = req.body;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const anishot = await prisma.aniShot.create({
      data: {
        userId,
        content: content || null,
        mediaUrl: mediaUrl || null,
        animeId: animeId ? String(animeId) : null,
        animeTitle: animeTitle || null,
        animeCover: animeCover || null,
        type: type || 'THOUGHT',
        expiresAt
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true
          }
        }
      }
    });

    res.status(201).json(anishot);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/anishots/:id
 */
router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const anishot = await prisma.aniShot.findUnique({
      where: { id: String(id) }
    });

    if (!anishot) {
      return res.status(404).json({ error: 'AniShot not found' });
    }

    if (anishot.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.aniShot.delete({
      where: { id: String(id) }
    });

    res.status(200).json({ message: 'AniShot deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
