import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

// Helper to check access
const canAccessPlaylist = async (playlistId: string, userId: string | undefined) => {
  const playlist = await prisma.playlist.findUnique({
    where: { id: playlistId },
    include: {
      collaborators: {
        select: { userId: true }
      }
    }
  });

  if (!playlist) return { allowed: false, error: 'Playlist not found', status: 404 };

  if (playlist.visibility === 'PUBLIC') return { allowed: true, playlist };

  if (!userId) return { allowed: false, error: 'Unauthorized', status: 401 };

  const isOwner = playlist.userId === userId;
  const isCollaborator = playlist.collaborators.some(c => c.userId === userId);

  if (isOwner || isCollaborator) return { allowed: true, playlist };

  return { allowed: false, error: 'Forbidden', status: 403 };
};

// GET /api/playlists - Owned by user
export const getMyPlaylists = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            entries: true,
            collaborators: true,
            follows: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/playlists/public
export const getPublicPlaylists = async (req: Request, res: Response) => {
  try {
    const { search, sort, page = '1' } = req.query;
    const limit = 20;
    const skip = (Number(page) - 1) * limit;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'trending') {
      orderBy = { follows: { _count: 'desc' } };
    } else if (sort === 'mostFollowed') {
      orderBy = { follows: { _count: 'desc' } };
    }

    const playlists = await prisma.playlist.findMany({
      where: {
        visibility: 'PUBLIC',
        ...(search && {
          OR: [
            { title: { contains: String(search), mode: 'insensitive' } },
            { description: { contains: String(search), mode: 'insensitive' } }
          ]
        })
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        _count: {
          select: {
            entries: true,
            follows: true
          }
        }
      },
      orderBy,
      take: limit,
      skip
    });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/playlists/featured
export const getFeaturedPlaylists = async (req: Request, res: Response) => {
  try {
    const playlists = await prisma.playlist.findMany({
      where: {
        visibility: 'PUBLIC'
      },
      include: {
        user: {
          select: { id: true, username: true, avatar: true }
        },
        entries: {
          take: 3,
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            entries: true,
            follows: true
          }
        }
      },
      orderBy: { follows: { _count: 'desc' } },
      take: 4
    });

    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/playlists/:id
export const getPlaylistById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const { allowed, playlist, error, status } = await canAccessPlaylist(String(id), userId);
    if (!allowed) return res.status(status!).json({ error });

    const fullPlaylist = await prisma.playlist.findUnique({
      where: { id: String(id) },
      include: {
        user: { select: { id: true, username: true, avatar: true } },
        entries: {
          orderBy: { order: 'asc' },
          include: { addedBy: { select: { id: true, username: true, avatar: true } } }
        },
        collaborators: {
          include: { user: { select: { id: true, username: true, avatar: true } } }
        },
        _count: {
          select: { follows: true }
        }
      }
    });

    res.json(fullPlaylist);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/playlists
export const createPlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, description, visibility } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const playlist = await prisma.playlist.create({
      data: {
        userId,
        title,
        description,
        visibility: (visibility as any) || 'PRIVATE'
      }
    });

    res.status(201).json(playlist);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/playlists/:id
export const updatePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { title, description, visibility, coverUrl } = req.body;

    const playlist = await prisma.playlist.findUnique({ where: { id: String(id) } });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const updated = await prisma.playlist.update({
      where: { id: String(id) },
      data: { 
        title, 
        description, 
        visibility: visibility as any, 
        coverUrl 
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/playlists/:id
export const deletePlaylist = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const playlist = await prisma.playlist.findUnique({ where: { id: String(id) } });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.playlist.delete({ where: { id: String(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/playlists/:id/entries
export const addEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { animeId, animeTitle, animeCover, note } = req.body;

    const { allowed, playlist, error, status } = await canAccessPlaylist(String(id), userId);
    if (!allowed || !playlist) return res.status(status!).json({ error });

    // Check if owner or collaborator
    const isOwner = playlist.userId === userId;
    const isCollaborator = playlist.collaborators?.some(c => c.userId === userId);
    if (!isOwner && !isCollaborator) return res.status(403).json({ error: 'Forbidden' });

    // Get max order
    const maxOrder = await prisma.playlistEntry.aggregate({
      where: { playlistId: String(id) },
      _max: { order: true }
    });

    const entry = await prisma.playlistEntry.create({
      data: {
        playlistId: String(id),
        animeId: String(animeId),
        animeTitle,
        animeCover,
        userId,
        note,
        order: (maxOrder?._max?.order || 0) + 1
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    // Unique constraint error check
    if ((error as any).code === 'P2002') {
      return res.status(400).json({ error: 'Anime already in playlist' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/playlists/:id/entries/:entryId
export const removeEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, entryId } = req.params;
    const userId = req.userId!;

    const { allowed, playlist, error, status } = await canAccessPlaylist(String(id), userId);
    if (!allowed || !playlist) return res.status(status!).json({ error });

    const isOwner = playlist.userId === userId;
    const isCollaborator = playlist.collaborators?.some(c => c.userId === userId);
    if (!isOwner && !isCollaborator) return res.status(403).json({ error: 'Forbidden' });

    await prisma.playlistEntry.delete({ where: { id: String(entryId) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/playlists/:id/entries/reorder
export const reorderEntries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { orders } = req.body; // Array of { id, order }

    const playlist = await prisma.playlist.findUnique({ where: { id: String(id) } });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.$transaction(
      orders.map((o: { id: string, order: number }) => 
        prisma.playlistEntry.update({
          where: { id: o.id },
          data: { order: o.order }
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/playlists/:id/collaborators
export const addCollaborator = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { username } = req.body;

    const playlist = await prisma.playlist.findUnique({ where: { id: String(id) } });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const userToAdd = await prisma.user.findUnique({ where: { username } });
    if (!userToAdd) return res.status(404).json({ error: 'User not found' });

    await prisma.playlistCollaborator.create({
      data: { playlistId: String(id), userId: userToAdd.id }
    });

    const collaborators = await prisma.playlistCollaborator.findMany({
      where: { playlistId: String(id) },
      include: { user: { select: { id: true, username: true, avatar: true } } }
    });

    res.json(collaborators);
  } catch (error) {
    if ((error as any).code === 'P2002') return res.status(400).json({ error: 'Already a collaborator' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/playlists/:id/collaborators/:userId
export const removeCollaborator = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id, userId: collaboratorId } = req.params;
    const userId = req.userId!;

    const playlist = await prisma.playlist.findUnique({ where: { id: String(id) } });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.playlistCollaborator.delete({
      where: { playlistId_userId: { playlistId: String(id), userId: String(collaboratorId) } }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/playlists/:id/follow
export const toggleFollow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const playlist = await prisma.playlist.findUnique({ where: { id: String(id) } });
    if (!playlist) return res.status(404).json({ error: 'Playlist not found' });
    if (playlist.userId === userId) return res.status(400).json({ error: 'Cannot follow own playlist' });

    const existingFollow = await prisma.playlistFollow.findUnique({
      where: { playlistId_userId: { playlistId: String(id), userId: String(userId) } }
    });

    if (existingFollow) {
      await prisma.playlistFollow.delete({
        where: { playlistId_userId: { playlistId: String(id), userId } }
      });
      return res.json({ following: false });
    } else {
      await prisma.playlistFollow.create({
        data: { playlistId: String(id), userId }
      });
      return res.json({ following: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/playlists/:id/comments
export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const comments = await prisma.playlistComment.findMany({
      where: { playlistId: String(id) },
      include: { user: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/playlists/:id/comments
export const addComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { content } = req.body;

    if (!content || content.length > 300) return res.status(400).json({ error: 'Invalid content' });

    const { allowed, status, error } = await canAccessPlaylist(String(id), userId);
    if (!allowed) return res.status(status!).json({ error });

    const comment = await prisma.playlistComment.create({
      data: { playlistId: String(id), userId, content: String(content) }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/playlists/comments/:commentId
export const deleteComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = req.userId!;

    const comment = await prisma.playlistComment.findUnique({ where: { id: String(commentId) } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.playlistComment.delete({ where: { id: String(commentId) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
