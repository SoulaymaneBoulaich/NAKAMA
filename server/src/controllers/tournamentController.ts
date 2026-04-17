import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import * as jikan from '../services/jikanService.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const getAnimeQuizRooms = async (req: Request, res: Response) => {
    try {
        // Fetch top seasonal anime to suggest as "Active Rooms"
        const seasonal = await jikan.getSeasonalAnime(10);
        
        // Ensure rooms exist in DB for these anime to track stats
        for (const anime of seasonal) {
            await prisma.animeQuizRoom.upsert({
                where: { animeId: String(anime.mal_id) },
                update: {},
                create: {
                    animeId: String(anime.mal_id),
                    animeTitle: anime.title,
                    animeCover: anime.images.jpg.image_url,
                    roomSlug: anime.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, '')
                }
            });
        }

        const rooms = await prisma.animeQuizRoom.findMany({
            include: {
                _count: {
                    select: { questions: true }
                }
            },
            orderBy: { totalAttempts: 'desc' },
            take: 20
        });

        res.status(200).json(rooms);
    } catch (error) {
        console.error('Get rooms error:', error);
        res.status(500).json({ message: 'Error fetching quiz rooms' });
    }
};

export const getTournaments = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const tournaments = await prisma.tournament.findMany({
            where: {
                endDate: { gt: now },
                status: { not: 'ENDED' }
            },
            include: {
                _count: {
                    select: { participants: true }
                }
            },
            orderBy: { startDate: 'asc' }
        });
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tournaments' });
    }
};

export const joinTournament = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { tournamentId } = req.body;

        const tournament = await prisma.tournament.findUnique({
            where: { id: tournamentId }
        });

        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });
        if (tournament.status !== 'REGISTRATION') return res.status(400).json({ message: 'Registration closed' });

        const participant = await prisma.tournamentParticipant.create({
            data: {
                tournamentId,
                userId
            }
        });

        res.status(201).json(participant);
    } catch (error) {
        res.status(500).json({ message: 'Error joining tournament' });
    }
};

export const getSeasonalGauntlet = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const gauntlet = await (prisma as any).seasonalGauntlet.findFirst({
            where: {
                startDate: { lte: now },
                endDate: { gte: now }
            },
            include: {
                attempts: {
                    orderBy: { score: 'desc' },
                    take: 10,
                    include: { user: { select: { username: true, avatar: true } } }
                }
            }
        });
        res.status(200).json(gauntlet);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gauntlet' });
    }
};
