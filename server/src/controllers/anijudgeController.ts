import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { getStringParam, getStringQuery } from '../utils/params.js';

const generateArenaCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;
    
    while (!isUnique) {
        code = Array.from({ length: 6 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const existing = await prisma.arena.findUnique({ where: { code } });
        if (!existing) isUnique = true;
    }
    return code;
};

export const createArena = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { topic, roundCount, timerSeconds } = req.body;
        const hostId = req.userId!;

        if (!topic || topic.length > 200) {
            return res.status(400).json({ message: 'Topic is required (max 200 chars)' });
        }

        const validRounds = [3, 5, 7];
        const validTimers = [60, 120, 180];

        if (!validRounds.includes(Number(roundCount)) || !validTimers.includes(Number(timerSeconds))) {
            return res.status(400).json({ message: 'Invalid round count or timer' });
        }

        const code = await generateArenaCode();
        
        const arena = await prisma.arena.create({
            data: {
                code,
                topic,
                roundCount: Number(roundCount),
                timerSeconds: Number(timerSeconds),
                hostId,
                participants: {
                    create: {
                        userId: hostId,
                        team: 'TEAM_A'
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, username: true, avatar: true } }
                    }
                }
            }
        });

        res.status(201).json(arena);
    } catch (error) {
        console.error('Error creating arena:', error);
        res.status(500).json({ message: 'Error creating arena' });
    }
};

export const getArenaByCode = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const code = getStringParam(req.params.code);
        const arena = await prisma.arena.findUnique({
            where: { code: code.toUpperCase() },
            include: {
                host: { select: { id: true, username: true, avatar: true } },
                judge: { select: { id: true, username: true, avatar: true } },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, avatar: true } }
                    }
                },
                rounds: {
                    include: {
                        arguments: {
                            include: {
                                user: { select: { id: true, username: true, avatar: true } }
                            }
                        }
                    }
                }
            }
        });

        if (!arena) return res.status(404).json({ message: 'Arena not found' });
        res.status(200).json(arena);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching arena' });
    }
};

export const getHallOfFame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const page = Number(getStringQuery(req.query.page, '1')) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const arenas = await prisma.arena.findMany({
            where: { isArchived: true, status: 'COMPLETED' },
            include: {
                host: { select: { username: true } },
                judge: { select: { username: true } },
                _count: { select: { fameVotes: true } },
                participants: {
                    select: { team: true, user: { select: { username: true } } }
                }
            },
            orderBy: {
                fameVotes: {
                    _count: 'desc'
                }
            },
            take: limit,
            skip: skip
        });

        res.status(200).json(arenas);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hall of fame' });
    }
};

export const voteHallOfFame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const code = getStringParam(req.params.code);
        const userId = req.userId!;

        const arena = await prisma.arena.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!arena || !arena.isArchived) {
            return res.status(400).json({ message: 'Arena not eligible for votes' });
        }

        const existingVote = await prisma.hallOfFameVote.findUnique({
            where: {
                arenaId_userId: {
                    arenaId: arena.id,
                    userId
                }
            }
        });

        if (existingVote) {
            await prisma.hallOfFameVote.delete({ where: { id: existingVote.id } });
        } else {
            await prisma.hallOfFameVote.create({
                data: { arenaId: arena.id, userId }
            });
        }

        const count = await prisma.hallOfFameVote.count({ where: { arenaId: arena.id } });
        res.status(200).json({ voted: !existingVote, count });
    } catch (error) {
        res.status(500).json({ message: 'Error toggling vote' });
    }
};

export const getMyHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const arenas = await prisma.arena.findMany({
            where: {
                participants: { some: { userId } }
            },
            include: {
                participants: {
                    where: { userId },
                    select: { team: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Simple mapping of result for the user
        const history = arenas.map(a => {
            const myTeam = a.participants[0]?.team;
            let result = 'spectated';
            if (myTeam === 'JUDGE') result = 'judged';
            else if (a.status === 'COMPLETED') {
                if (a.winnerTeam === 'DRAW') result = 'drew';
                else if (a.winnerTeam === (myTeam as any)) result = 'won';
                else result = 'lost';
            } else {
                result = 'in-progress';
            }
            return { ...a, myResult: result };
        });

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};
