import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { getStringParam, getStringQuery } from '../utils/params.js';

// Helper to check story access
const getStoryWithAccess = async (storyId: string, userId: string | undefined) => {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    include: {
      owner: { select: { id: true, username: true, avatar: true } },
      collaborators: {
        include: { user: { select: { id: true, username: true, avatar: true } } }
      },
      _count: {
        select: { chapters: true, ratings: true, follows: true }
      }
    }
  });

  if (!story) return { allowed: false, error: 'Story not found', status: 404 };

  if (story.isPublished) return { allowed: true, story };

  if (!userId) return { allowed: false, error: 'Unauthorized', status: 401 };

  const isOwner = story.ownerId === userId;
  const isCollaborator = story.collaborators.some(c => c.userId === userId);

  if (isOwner || isCollaborator) return { allowed: true, story };

  return { allowed: false, error: 'Forbidden', status: 403 };
};

// GET /api/stories (public)
export const browseStories = async (req: Request, res: Response) => {
  try {
    const search = getStringQuery(req.query.search, '');
    const tag = getStringQuery(req.query.tag, '');
    const sort = getStringQuery(req.query.sort, '');
    const status = getStringQuery(req.query.status, '');
    const page = getStringQuery(req.query.page, '1');
    const limit = 20;
    const skip = (Number(page) - 1) * limit;

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'mostRead') {
      orderBy = { totalViews: 'desc' };
    } else if (sort === 'topRated') {
      // This is trickier with Prisma, usually requires an aggregation or a stored average
      // For now, let's sort by rating count as a proxy or we'd need a raw query
      orderBy = { ratings: { _count: 'desc' } };
    }

    const stories = await prisma.story.findMany({
      where: {
        isPublished: true,
        ...(status && { status: status as any }),
        ...(tag && { tags: { has: String(tag) } }),
        ...(search && {
          OR: [
            { title: { contains: String(search || ''), mode: 'insensitive' } },
            { description: { contains: String(search || ''), mode: 'insensitive' } },
            { tags: { hasSome: [String(search)] } }
          ]
        })
      },
      include: {
        owner: { select: { id: true, username: true, avatar: true } },
        collaborators: {
          select: { creditLabel: true, user: { select: { username: true } } }
        },
        _count: {
          select: { chapters: true, ratings: true }
        }
      },
      orderBy,
      take: limit,
      skip
    });

    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stories/:id (public)
export const getStoryById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId;

    const { allowed, story, error, status } = await getStoryWithAccess(id, userId);

    // Get average rating
    const ratingsSummary = await prisma.storyRating.aggregate({
      where: { storyId: id as string },
      _avg: { score: true }
    });

    res.json({
      ...story,
      averageRating: ratingsSummary._avg?.score || 0
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stories/:id/chapters (public)
export const getChapters = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = getStringParam(req.params.id);
    const userId = req.userId;

    const { allowed, story, error, status } = await getStoryWithAccess(id, userId);
    if (!allowed || !story) return res.status(status!).json({ error });

    const isOwner = userId === story.ownerId;
    const isCollaborator = story.collaborators.some(c => c.userId === userId);

    const chapters = await prisma.chapter.findMany({
      where: {
        storyId: id,
        ...((!isOwner && !isCollaborator) && { isPublished: true })
      },
      orderBy: { chapterNumber: 'asc' },
      select: {
        id: true,
        title: true,
        chapterNumber: true,
        wordCount: true,
        isPublished: true,
        publishedAt: true,
        createdAt: true
      }
    });

    res.json(chapters);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stories/:id/chapters/:chapterId (public)
export const getChapterById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = getStringParam(req.params.id);
    const chapterId = getStringParam(req.params.chapterId);
    const userId = req.userId;

    const { allowed, story, error, status } = await getStoryWithAccess(id, userId);
    if (!allowed || !story) return res.status(status!).json({ error });

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        author: { select: { id: true, username: true, avatar: true } }
      }
    });

    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    const isOwner = userId === story.ownerId;
    const isCollaborator = story.collaborators.some(c => c.userId === userId);

    if (!chapter.isPublished && !isOwner && !isCollaborator) {
      return res.status(403).json({ error: 'Chapter is not published' });
    }

    res.json(chapter);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stories/mine (authenticated)
export const getMyStories = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const stories = await prisma.story.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { collaborators: { some: { userId } } }
        ]
      },
      include: {
        _count: { select: { chapters: true, ratings: true, follows: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });
    res.json(stories);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/stories
export const createStory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, description, tags, status } = req.body;
    const coverUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });

    const story = await prisma.story.create({
      data: {
        ownerId: userId,
        title,
        description,
        coverUrl,
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
        status: status || 'ONGOING',
        isPublished: false
      }
    });

    res.status(201).json(story);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/stories/:id
export const updateStory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const userId = req.userId!;
    const { title, description, tags, status, isPublished } = req.body;
    const coverUrl = req.file ? `/uploads/${req.file.filename}` : req.body.coverUrl;

    const story = await prisma.story.findUnique({ 
      where: { id: id as string },
      include: { 
        _count: { 
          select: { 
            chapters: { where: { isPublished: true } } 
          } 
        } 
      }
    });

    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });

    if (isPublished === 'true' && (story as any)._count.chapters === 0) {
      return res.status(400).json({ error: 'Cannot publish story without at least one published chapter' });
    }

    const updated = await prisma.story.update({
      where: { id: id as string },
      data: { 
        title, 
        description, 
        coverUrl, 
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : undefined, 
        status: status as any, 
        isPublished: isPublished === 'true' || isPublished === true 
      }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/stories/:id
export const deleteStory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = getStringParam(req.params.id);
    const userId = req.userId!;

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.story.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/stories/:id/collaborators
export const addCollaborator = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;
    const { username, creditLabel } = req.body;

    const story = await prisma.story.findUnique({ where: { id: id as string } });
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const userToAdd = await prisma.user.findUnique({ where: { username: username as string } });
    if (!userToAdd) return res.status(404).json({ error: 'User not found' });

    const collaborator = await prisma.storyCollaborator.create({
      data: { storyId: String(id), userId: userToAdd.id, creditLabel: String(creditLabel) }
    });

    res.status(201).json(collaborator);
  } catch (error) {
    if ((error as any).code === 'P2002') return res.status(400).json({ error: 'Already a collaborator' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/stories/:id/collaborators/:userId
export const removeCollaborator = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const collaboratorId = req.params.userId as string;
    const userId = req.userId!;

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.storyCollaborator.delete({
      where: { storyId_userId: { storyId: id as string, userId: collaboratorId as string } }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/stories/:id/chapters
export const createChapter = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = getStringParam(req.params.id);
    const userId = req.userId!;
    const { title, content, chapterNumber } = req.body;

    const story = await prisma.story.findUnique({ 
      where: { id: id as string },
      include: { collaborators: true }
    });

    if (!story) return res.status(404).json({ error: 'Story not found' });
    
    const isOwner = story.ownerId === userId;
    const isCollaborator = story.collaborators.some((c: any) => c.userId === userId);
    if (!isOwner && !isCollaborator) return res.status(403).json({ error: 'Forbidden' });

    const wordCount = content ? String(content).trim().split(/\s+/).filter(Boolean).length : 0;
    
    let finalChapterNumber = chapterNumber;
    if (!finalChapterNumber) {
      const maxChapter = await prisma.chapter.aggregate({
        where: { storyId: id as string },
        _max: { chapterNumber: true }
      });
      finalChapterNumber = (maxChapter._max?.chapterNumber || 0) + 1;
    }

    const chapter = await prisma.chapter.create({
      data: {
        storyId: id as string,
        authorId: userId,
        title: title as string,
        content: content as string,
        chapterNumber: finalChapterNumber,
        wordCount,
        isPublished: false
      }
    });

    // Update story stats
    await prisma.story.update({
      where: { id: id as string },
      data: {
        totalChapters: { increment: 1 },
        totalWords: { increment: wordCount }
      }
    });

    res.status(201).json(chapter);
  } catch (error) {
    if ((error as any).code === 'P2002') return res.status(400).json({ error: 'Chapter number already exists' });
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/stories/:id/chapters/:chapterId
export const updateChapter = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = getStringParam(req.params.id);
    const chapterId = getStringParam(req.params.chapterId);
    const userId = req.userId!;
    const { title, content, isPublished } = req.body;

    const chapter = await prisma.chapter.findUnique({ 
      where: { id: chapterId as string },
      include: { story: { select: { ownerId: true } } }
    });

    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });
    
    const isOwner = chapter.story.ownerId === userId;
    const isAuthor = chapter.authorId === userId;
    if (!isOwner && !isAuthor) return res.status(403).json({ error: 'Forbidden' });

    const oldWordCount = chapter.wordCount;
    const newWordCount = content ? String(content).trim().split(/\s+/).filter(Boolean).length : 0;

    const data: any = { title, content, isPublished };
    if (isPublished && !chapter.isPublished) {
      data.publishedAt = new Date();
    }

    const updated = await prisma.chapter.update({
      where: { id: String(chapterId) },
      data: {
         ...data,
         wordCount: content ? newWordCount : undefined
      }
    });

    // Update story total words if content changed
    if (content) {
      await prisma.story.update({
        where: { id: id as string },
        data: { totalWords: { increment: newWordCount - oldWordCount } }
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/stories/:id/chapters/:chapterId
export const deleteChapter = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = getStringParam(req.params.id);
    const chapterId = getStringParam(req.params.chapterId);
    const userId = req.userId!;

    const story = await prisma.story.findUnique({ where: { id: id as string } });
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.ownerId !== userId) return res.status(403).json({ error: 'Forbidden' });

    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId as string } });
    if (!chapter) return res.status(404).json({ error: 'Chapter not found' });

    await prisma.chapter.delete({ where: { id: chapterId as string } });

    // Update story stats
    await prisma.story.update({
      where: { id: id as string },
      data: {
        totalChapters: { decrement: 1 },
        totalWords: { decrement: chapter.wordCount }
      }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/stories/:id/rate
export const rateStory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = getStringParam(req.params.id);
    const { score, review } = req.body;
    const userId = req.userId!;

    if (score < 1 || score > 10) return res.status(400).json({ error: 'Score must be between 1 and 10' });

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.ownerId === userId) return res.status(400).json({ error: 'Cannot rate your own story' });

    const rating = await prisma.storyRating.upsert({
      where: { storyId_userId: { storyId: id, userId } },
      update: { score: Number(score), review: review as string },
      create: { storyId: id, userId, score: Number(score), review: review as string }
    });

    res.json(rating);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /api/stories/:id/ratings
export const getRatings = async (req: Request, res: Response) => {
  try {
    const id = getStringParam(req.params.id);
    const page = getStringQuery(req.query.page, '1');
    const limit = 10;
    const skip = (Number(page) - 1) * limit;

    const ratings = await prisma.storyRating.findMany({
      where: { storyId: id as string },
      include: { user: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/stories/:id/chapters/:chapterId/comments
export const addChapterComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const chapterId = getStringParam(req.params.chapterId);
    const userId = req.userId!;
    const { content } = req.body;

    if (!content || content.length > 500) return res.status(400).json({ error: 'Comment must be 1-500 characters' });

    const comment = await prisma.chapterComment.create({
      data: { chapterId: chapterId as string, userId, content: content as string }
    });

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/stories/chapters/comments/:commentId
export const deleteChapterComment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const commentId = getStringParam(req.params.commentId);
    const userId = req.userId!;

    const comment = await prisma.chapterComment.findUnique({ where: { id: commentId as string } });
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== userId) return res.status(403).json({ error: 'Forbidden' });

    await prisma.chapterComment.delete({ where: { id: commentId as string } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/stories/:id/follow
export const toggleFollow = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = getStringParam(req.params.id);
    const userId = req.userId!;

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.ownerId === userId) return res.status(400).json({ error: 'Cannot follow your own story' });

    const existing = await prisma.storyFollow.findUnique({
      where: { storyId_userId: { storyId: id, userId } }
    });

    if (existing) {
      await prisma.storyFollow.delete({
        where: { storyId_userId: { storyId: id, userId } }
      });
      res.json({ following: false });
    } else {
      await prisma.storyFollow.create({
        data: { storyId: id, userId }
      });
      res.json({ following: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
