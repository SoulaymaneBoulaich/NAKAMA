import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import * as recs from '../services/recommendationEngine.js';

// Removed local prisma = new PrismaClient()

export const getEntries = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.query;
    const userId = req.userId!;

    const entries = await prisma.animeEntry.findMany({
      where: {
        userId,
        ...(status ? { status: status as any } : {})
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entries' });
  }
};

export const createEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { animeId, status, episodeProgress } = req.body;
    const userId = req.userId!;

    const entry = await prisma.animeEntry.upsert({
      where: { userId_animeId: { userId, animeId: String(animeId) } },
      update: { status: status as any, episodeProgress },
      create: { userId, animeId: String(animeId), status: status as any, episodeProgress }
    });

    // Record interaction
    if (status === 'COMPLETED') {
      recs.recordInteraction(userId, String(animeId), 'COMPLETED').catch(console.error);
    } else if (status === 'DROPPED') {
      recs.recordInteraction(userId, String(animeId), 'DROPPED').catch(console.error);
    } else {
      recs.recordInteraction(userId, String(animeId), 'ADDED_TO_LIST').catch(console.error);
    }

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error creating entry' });
  }
};

export const updateEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, episodeProgress, rewatchCount, startDate, endDate, privateNotes } = req.body;
    const userId = req.userId!;

    const entry = await prisma.animeEntry.findUnique({ where: { id: id as string } });
    if (!entry || entry.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const updateData: any = {};
    if (status) updateData.status = status as any;
    if (episodeProgress !== undefined) updateData.episodeProgress = Number(episodeProgress);
    if (rewatchCount !== undefined) updateData.rewatchCount = Number(rewatchCount);
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (privateNotes !== undefined) updateData.privateNotes = privateNotes;

    const updatedEntry = await prisma.animeEntry.update({
      where: { id: String(id) },
      data: updateData
    });

    // Record interaction if status changed
    if (status === 'COMPLETED') {
      recs.recordInteraction(userId, updatedEntry.animeId, 'COMPLETED').catch(console.error);
    } else if (status === 'DROPPED') {
      recs.recordInteraction(userId, updatedEntry.animeId, 'DROPPED').catch(console.error);
    }

    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(500).json({ message: 'Error updating entry' });
  }
};

export const deleteEntry = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const entry = await prisma.animeEntry.findUnique({ where: { id: String(id) } });
    if (!entry || entry.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await prisma.animeEntry.delete({ where: { id: String(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting entry' });
  }
};
