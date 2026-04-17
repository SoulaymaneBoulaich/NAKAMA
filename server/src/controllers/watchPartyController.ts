import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export const createParty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { animeId, animeTitle, animeCover, isPrivate, maxParticipants, episodeNumber } = req.body;
    const hostId = req.userId!;

    const code = nanoid();

    const party = await prisma.watchParty.create({
      data: {
        code,
        hostId,
        animeId: String(animeId),
        animeTitle,
        animeCover,
        isPrivate: isPrivate || false,
        maxParticipants: Number(maxParticipants) || 10,
        episodeNumber: episodeNumber ? Number(episodeNumber) : null,
        status: 'WAITING'
      }
    });

    // Automatically join host as a participant
    await prisma.watchPartyParticipant.create({
      data: {
        partyId: party.id,
        userId: hostId,
        isReady: true
      }
    });

    res.status(201).json(party);
  } catch (error) {
    console.error('Create party error:', error);
    res.status(500).json({ message: 'Error creating watch party' });
  }
};

export const getActiveParties = async (_req: any, res: Response) => {
  try {
    const parties = await prisma.watchParty.findMany({
      where: { 
        isPrivate: false,
        status: { in: ['WAITING', 'WATCHING'] }
      },
      include: {
        host: { select: { username: true, avatar: true } },
        participants: { 
          include: { user: { select: { avatar: true } } },
          take: 5 
        },
        _count: { select: { participants: true } }
      },
      orderBy: [
        { participants: { _count: 'desc' } }
      ],
      take: 20
    });

    res.status(200).json(parties);
  } catch (error) {
    console.error('Fetch active parties error:', error);
    res.status(500).json({ message: 'Error fetching parties' });
  }
};

export const getPartyByCode = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.params;
    const userId = req.userId; // Might be undefined if not logged in

    const party = await prisma.watchParty.findUnique({
      where: { code: String(code) },
      include: {
        host: { select: { username: true, avatar: true, id: true } },
        participants: { 
          include: { 
            user: { select: { username: true, avatar: true, id: true } } 
          } 
        },
        messages: {
          include: {
            user: { select: { username: true, avatar: true } }
          },
          orderBy: { createdAt: 'asc' },
          take: 50
        }
      }
    });

    if (!party) return res.status(404).json({ message: 'Party not found' });

    if (party.isPrivate && !userId) {
      return res.status(401).json({ message: 'Authentication required for private rooms' });
    }

    res.status(200).json(party);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching party' });
  }
};

export const updatePartyState = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { code } = req.params;
    const { status, currentTime, episode } = req.body;
    const userId = req.userId!;

    const party = await prisma.watchParty.findUnique({ where: { code: String(code) } });

    if (!party) return res.status(404).json({ message: 'Party not found' });

    // Only host can update base state in DB
    if (party.hostId !== userId) {
        return res.status(403).json({ message: 'Only host can update party state' });
    }

    const updated = await prisma.watchParty.update({
      where: { code: String(code) },
      data: { 
        status: status as any,
        currentTimestamp: Number(currentTime), 
        episodeNumber: episode ? Number(episode) : undefined
      }
    });


    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating party state' });
  }
};
