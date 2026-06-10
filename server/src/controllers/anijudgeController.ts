import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { getStringParam, getStringQuery } from '../utils/params.js';
import { logger } from '../utils/logger.js';
import { Server } from 'socket.io';
import { addMinutes, isAfter, subHours } from 'date-fns';

const generateArenaCode = async () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    let isUnique = false;
    
    while (!isUnique) {
        code = Array.from({ length: 8 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const existing = await prisma.debateArena.findUnique({ where: { code } });
        if (!existing) isUnique = true;
    }
    return code;
};

export const createArena = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { 
            title, topic, roundCount, timeLimitPerRound, totalTimeLimit, 
            maxDebaters, format, strictRules, isPublic,
            cardsAllowed, canPurchaseCards, audienceVoting, turnOrderMode, bannedWords
        } = req.body;
        // 1. Check for Active Ban (Chapter 34)
        const user = await prisma.user.findUnique({
            where: { id: adminId },
            include: { debateStats: true }
        });

        if (user?.banExpiresAt && isAfter(user.banExpiresAt, new Date())) {
            return res.status(403).json({ message: `You are currently banned until ${user.banExpiresAt.toLocaleString()}` });
        }

        // 2. Check Judge Cooldown (Chapter 33.1)
        if (user?.debateStats?.lastJudgedAt) {
            const cooldownEnd = addMinutes(user.debateStats.lastJudgedAt, 15);
            if (isAfter(cooldownEnd, new Date())) {
                return res.status(429).json({ message: `Judge cooldown active. You can create a new room at ${cooldownEnd.toLocaleTimeString()}` });
            }
        }

        // 3. Check Active Room Limit for Free Tier (Chapter 33.3)
        if (!user?.isPremium) {
            const activeRoomsCount = await prisma.debateArena.count({
                where: { 
                    judgeId: adminId,
                    status: { in: ['LOBBY', 'ACTIVE', 'PAUSED'] }
                }
            });

            if (activeRoomsCount >= 3) {
                return res.status(403).json({ message: 'Active room limit (3) reached for free tier. Close a room to create another.' });
            }
        }

        const code = await generateArenaCode();
        
        const arena = await prisma.debateArena.create({
            data: {
                code,
                title,
                topic,
                roundCount: Number(roundCount) || 3,
                timeLimitPerRound: Number(timeLimitPerRound) || 120,
                totalTimeLimit: Number(totalTimeLimit) || 600,
                maxDebaters: Number(maxDebaters) || 6,
                format: format || 'TEAMS',
                strictRules: strictRules || [],
                isPublic: isPublic !== undefined ? isPublic : true,
                cardsAllowed: !!cardsAllowed,
                canPurchaseCards: !!canPurchaseCards,
                audienceVoting: !!audienceVoting,
                turnOrderMode: turnOrderMode || 'SIMULTANEOUS',
                bannedWords: bannedWords || [],
                adminId,
                judgeId: adminId, // Creator is judge by default
                participants: {
                    create: {
                        userId: adminId,
                        role: 'JUDGE',
                        isAdmin: true
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

        // Initialize/Update stats
        await prisma.userDebateStats.upsert({
            where: { userId: adminId },
            update: { lastJudgedAt: new Date() }, // Actually should be updated when debate ENDS, but for cooldown we set it here
            create: { userId: adminId, lastJudgedAt: new Date() }
        });

        res.status(201).json(arena);
    } catch (error) {
        logger.error('Error creating arena:', error);
        res.status(500).json({ message: 'Error creating arena' });
    }
};

export const joinArena = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const code = getStringParam(req.params.code).toUpperCase();
        const arena = await prisma.debateArena.findUnique({
            where: { code },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, username: true, avatar: true } }
                    }
                }
            }
        });

        if (!arena) return res.status(404).json({ message: 'Arena not found' });
        if (arena.status !== 'LOBBY' && !arena.participants.some(p => p.userId === req.userId)) {
             // Allow joining if already a participant or if it's a lobby
             // If not a participant and not lobby, can join as spectator if public
             if (!arena.isPublic) {
                 return res.status(403).json({ message: 'This debate is private and already in progress' });
             }
        }

        res.status(200).json(arena);
    } catch (error) {
        res.status(500).json({ message: 'Error joining arena' });
    }
};

export const joinArenaPost = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const code = getStringParam(req.params.code).toUpperCase();
        const { role } = req.body;
        const userId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { code },
            include: { participants: true }
        });

        if (!arena) return res.status(404).json({ message: 'Arena not found' });
        if (arena.status !== 'LOBBY') return res.status(400).json({ message: 'Arena already started' });

        const existing = arena.participants.find(p => p.userId === userId);
        if (existing) {
            return res.status(200).json({ message: 'Already joined', participant: existing });
        }

        if (role !== 'SPECTATOR') {
            const debaters = arena.participants.filter(p => p.role === 'TEAM_A' || p.role === 'TEAM_B');
            if (debaters.length >= arena.maxDebaters) {
                return res.status(400).json({ message: 'Arena is full' });
            }
        }

        const participant = await prisma.debateParticipant.create({
            data: {
                arenaId: arena.id,
                userId,
                role
            },
            include: {
                user: { select: { id: true, username: true, avatar: true } }
            }
        });

        res.status(201).json(participant);
    } catch (error) {
        res.status(500).json({ message: 'Error joining arena' });
    }
};

export const requestJudge = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const userId = req.userId!;

        const participant = await prisma.debateParticipant.findUnique({
            where: { arenaId_userId: { arenaId, userId } }
        });

        if (!participant || (participant.role !== 'TEAM_A' && participant.role !== 'TEAM_B')) {
            return res.status(403).json({ message: 'Only debaters can request judge role' });
        }

        const request = await prisma.judgeRequest.create({
            data: {
                arenaId,
                requesterId: userId
            }
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error requesting judge role' });
    }
};

export const handleJudgeRequest = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const { requestId, action } = req.body;
        const userId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId },
            include: { participants: true }
        });

        if (!arena || arena.adminId !== userId) {
            return res.status(403).json({ message: 'Only admin can handle judge requests' });
        }

        const judgeReq = await prisma.judgeRequest.findUnique({
            where: { id: requestId }
        });

        if (!judgeReq || judgeReq.status !== 'PENDING') {
            return res.status(404).json({ message: 'Request not found or already handled' });
        }

        if (action === 'ACCEPT') {
            const requesterId = judgeReq.requesterId;
            const requesterParticipant = arena.participants.find(p => p.userId === requesterId);
            const adminParticipant = arena.participants.find(p => p.userId === userId);

            if (!requesterParticipant || !adminParticipant) {
                return res.status(400).json({ message: 'Participants not found' });
            }

            await prisma.$transaction([
                prisma.judgeRequest.update({
                    where: { id: requestId },
                    data: { status: 'ACCEPTED' }
                }),
                prisma.debateParticipant.update({
                    where: { id: requesterParticipant.id },
                    data: { role: 'JUDGE' }
                }),
                prisma.debateParticipant.update({
                    where: { id: adminParticipant.id },
                    data: { role: requesterParticipant.role } // Admin takes the requester's old role
                }),
                prisma.debateArena.update({
                    where: { id: arenaId },
                    data: { judgeId: requesterId }
                })
            ]);
        } else {
            await prisma.judgeRequest.update({
                where: { id: requestId },
                data: { status: 'REJECTED' }
            });
        }

        const updatedArena = await prisma.debateArena.findUnique({
            where: { id: arenaId },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, username: true, avatar: true } }
                    }
                }
            }
        });

        res.status(200).json(updatedArena);
    } catch (error) {
        res.status(500).json({ message: 'Error handling judge request' });
    }
};

export const issueViolation = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const { userId, reason, penaltyPoints } = req.body;
        const judgeId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId }
        });

        if (!arena || (arena.judgeId !== judgeId && arena.adminId !== judgeId)) {
            return res.status(403).json({ message: 'Only judge or admin can issue violations' });
        }

        const violation = await prisma.debateViolation.create({
            data: {
                arenaId,
                userId,
                reason,
                penaltyPoints: penaltyPoints || 5
            }
        });

        await prisma.userDebateStats.update({
            where: { userId },
            data: {
                totalPoints: { decrement: penaltyPoints || 5 }
            }
        });

        res.status(201).json(violation);
    } catch (error) {
        res.status(500).json({ message: 'Error issuing violation' });
    }
};

export const startDebate = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const adminId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId },
            include: { participants: true }
        });

        if (!arena || arena.adminId !== adminId) {
            return res.status(403).json({ message: 'Only admin can start the debate' });
        }

        const teamA = arena.participants.some(p => p.role === 'TEAM_A');
        const teamB = arena.participants.some(p => p.role === 'TEAM_B');
        const hasJudge = !!arena.judgeId;

        if (!teamA || !teamB || !hasJudge) {
            return res.status(400).json({ message: 'Need at least 1 per team and a judge' });
        }

        const updatedArena = await prisma.debateArena.update({
            where: { id: arenaId },
            data: {
                status: 'ACTIVE',
                currentRound: 1,
                currentTeamTurn: 'TEAM_A'
            },
            include: {
                participants: { include: { user: { select: { id: true, username: true, avatar: true } } } },
                judge: { select: { id: true, username: true, avatar: true } },
                rounds: { include: { arguments: true } }
            }
        });

        await prisma.debateRound.create({
            data: {
                arenaId,
                roundNumber: 1,
                startedAt: new Date()
            }
        });

        const io: Server = req.app.get('io');
        const arenaNamespace = io.of('/arena');
        arenaNamespace.to(`arena-${updatedArena.code}`).emit('debate-started', updatedArena);
        startArenaTimer(arenaNamespace, updatedArena.code, updatedArena.id, updatedArena.timeLimitPerRound, 'TEAM_A');

        res.status(200).json(updatedArena);
    } catch (error) {
        res.status(500).json({ message: 'Error starting debate' });
    }
};

export const submitArgument = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const { content, mediaUrls, mediaTypes } = req.body;
        const userId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId },
            include: { 
                participants: true,
                rounds: { orderBy: { roundNumber: 'desc' }, take: 1 }
            }
        });

        if (!arena || arena.status !== 'ACTIVE') {
            return res.status(400).json({ message: 'Arena is not active' });
        }

        const participant = arena.participants.find(p => p.userId === userId);
        if (!participant || (participant.role !== 'TEAM_A' && participant.role !== 'TEAM_B')) {
            return res.status(403).json({ message: 'Only debaters can submit arguments' });
        }

        if (arena.currentTeamTurn !== participant.role) {
            return res.status(403).json({ message: 'It is not your team\'s turn' });
        }

        if (!content || content.length > 1500) {
            return res.status(400).json({ message: 'Content is required (max 1500 chars)' });
        }

        const round = arena.rounds[0];
        if (!round) return res.status(400).json({ message: 'Current round not found' });

        const argument = await prisma.debateArgument.create({
            data: {
                roundId: round.id,
                userId,
                team: participant.role as any,
                content,
                mediaUrls: mediaUrls || [],
                mediaTypes: mediaTypes || []
            },
            include: { user: { select: { id: true, username: true, avatar: true } } }
        });

        const io: Server = req.app.get('io');
        const arenaNamespace = io.of('/arena');
        
        // Fetch updated arena to broadcast
        const updatedArena = await prisma.debateArena.findUnique({
            where: { id: arenaId },
            include: {
                rounds: { 
                    include: { 
                        arguments: { include: { user: { select: { id: true, username: true, avatar: true } } } } 
                    }
                }
            }
        });

        arenaNamespace.to(`arena-${arena.code}`).emit('argument-submitted', updatedArena);

        res.status(201).json(argument);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting argument' });
    }
};

export const penalizeArgument = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const { argumentId, penalty, reason } = req.body;
        const judgeId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId }
        });

        if (!arena || arena.judgeId !== judgeId) {
            return res.status(403).json({ message: 'Only judge can penalize arguments' });
        }

        const argument = await prisma.debateArgument.update({
            where: { id: argumentId },
            data: {
                isValid: false,
                pointPenalty: Number(penalty) || 1
            }
        });

        res.status(200).json(argument);
    } catch (error) {
        res.status(500).json({ message: 'Error penalizing argument' });
    }
};

export const nextTurn = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const judgeId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId }
        });

        if (!arena || arena.judgeId !== judgeId) {
            return res.status(403).json({ message: 'Only judge can change turns' });
        }

        const nextTurn = arena.currentTeamTurn === 'TEAM_A' ? 'TEAM_B' : 'TEAM_A';

        const updated = await prisma.debateArena.update({
            where: { id: arenaId },
            data: { currentTeamTurn: nextTurn }
        });

        const io: Server = req.app.get('io');
        const arenaNamespace = io.of('/arena');
        arenaNamespace.to(`arena-${arena.code}`).emit('turn-changed', updated);
        startArenaTimer(arenaNamespace, arena.code, arena.id, arena.timeLimitPerRound + (arena.roundExtraTime || 0), nextTurn as any);

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error switching turn' });
    }
};

export const addTime = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const { seconds } = req.body;
        const judgeId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId }
        });

        if (!arena || arena.judgeId !== judgeId) {
            return res.status(403).json({ message: 'Only judge can add time' });
        }

        const updated = await prisma.debateArena.update({
            where: { id: arenaId },
            data: { roundExtraTime: { increment: Number(seconds) } }
        });

        const io: Server = req.app.get('io');
        const arenaNamespace = io.of('/arena');
        // The startArenaTimer in socket handles the increment if we call it or we can just update state
        // For simplicity, we trigger a 'time-granted' event and the client can react or we sync timer here
        arenaNamespace.to(`arena-${arena.code}`).emit('time-granted', { team: arena.currentTeamTurn, seconds: Number(seconds) });

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Error adding time' });
    }
};

export const endRound = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const judgeId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId },
            include: { rounds: { orderBy: { roundNumber: 'desc' }, take: 1 } }
        });

        if (!arena || arena.judgeId !== judgeId) {
            return res.status(403).json({ message: 'Only judge can end round' });
        }

        const currentRound = arena.rounds[0];
        if (currentRound) {
            await prisma.debateRound.update({
                where: { id: currentRound.id },
                data: { endedAt: new Date() }
            });
        }

        let updatedArena;
        if (arena.currentRound < arena.roundCount) {
            const nextRoundNum = arena.currentRound + 1;
            updatedArena = await prisma.debateArena.update({
                where: { id: arenaId },
                data: { 
                    currentRound: nextRoundNum,
                    roundExtraTime: 0,
                    currentTeamTurn: 'TEAM_A'
                }
            });

            await prisma.debateRound.create({
                data: {
                    arenaId,
                    roundNumber: nextRoundNum,
                    startedAt: new Date()
                }
            });
        } else {
            updatedArena = await prisma.debateArena.update({
                where: { id: arenaId },
                data: { status: 'PAUSED' } // Wait for verdict
            });
            stopArenaTimer(arena.code);
        }

        const io: Server = req.app.get('io');
        const arenaNamespace = io.of('/arena');
        arenaNamespace.to(`arena-${arena.code}`).emit('round-ended', updatedArena);

        res.status(200).json(updatedArena);
    } catch (error) {
        res.status(500).json({ message: 'Error ending round' });
    }
};

export const submitVerdict = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const arenaId = getStringParam(req.params.arenaId);
        const { winnerTeam, verdictText } = req.body;
        const judgeId = req.userId!;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId },
            include: { participants: true }
        });

        if (!arena || arena.judgeId !== judgeId) {
            return res.status(403).json({ message: 'Only judge can submit verdict' });
        }

        const updatedArena = await prisma.debateArena.update({
            where: { id: arenaId },
            data: {
                status: 'COMPLETED',
                winnerTeam,
                verdictText
            }
        });

        // Award points and create records
        for (const p of arena.participants) {
            let result: 'WIN' | 'LOSS' | 'DRAW' = 'DRAW';
            let pointsEarned = 0;
            let pointsLost = 0;

            if (winnerTeam === 'DRAW') {
                result = 'DRAW';
                pointsEarned = 5;
            } else if (p.role === 'JUDGE') {
                result = 'WIN'; // Judge always "wins" participation
                pointsEarned = 15 + (verdictText ? 10 : 0);
            } else if (p.role === winnerTeam) {
                result = 'WIN';
                pointsEarned = 10 * arena.roundCount;
            } else if (p.role === 'TEAM_A' || p.role === 'TEAM_B') {
                result = 'LOSS';
                pointsEarned = 2 * arena.roundCount;
            } else {
                continue; // Spectators don't get points
            }

            // Deduct violation points
            const violations = await prisma.debateViolation.findMany({
                where: { arenaId, userId: p.userId }
            });
            pointsLost = violations.reduce((sum, v) => sum + v.penaltyPoints, 0);

            const netPoints = pointsEarned - pointsLost;

            await prisma.debateRecord.create({
                data: {
                    userId: p.userId,
                    arenaId,
                    result,
                    role: p.role === 'JUDGE' ? 'JUDGE' : 'DEBATER',
                    pointsEarned,
                    pointsLost,
                    netPoints
                }
            });

            const statsUpdate: any = {
                totalDebates: { increment: 1 },
                totalPoints: { increment: netPoints }
            };

            if (result === 'WIN') {
                statsUpdate.wins = { increment: 1 };
                statsUpdate.winStreak = { increment: 1 };
            } else if (result === 'LOSS') {
                statsUpdate.losses = { increment: 1 };
                statsUpdate.winStreak = 0;
            } else {
                statsUpdate.draws = { increment: 1 };
            }

            await prisma.userDebateStats.update({
                where: { userId: p.userId },
                data: statsUpdate
            });

            // Update bestWinStreak
            const currentStats = await prisma.userDebateStats.findUnique({ where: { userId: p.userId } });
            if (currentStats && currentStats.winStreak > currentStats.bestWinStreak) {
                await prisma.userDebateStats.update({
                    where: { userId: p.userId },
                    data: { bestWinStreak: currentStats.winStreak }
                });
            }
        }

        // Hall of Fame Entry if qualified
        // Logic: Winner has perfect score (no violations)
        if (winnerTeam !== 'DRAW') {
             const winners = arena.participants.filter(p => p.role === winnerTeam);
             for (const w of winners) {
                 const violationCount = await prisma.debateViolation.count({ where: { arenaId, userId: w.userId } });
                 if (violationCount === 0 && arena.roundCount >= 3) {
                     await prisma.hallOfFameEntry.create({
                         data: {
                             userId: w.userId,
                             arenaId,
                             score: 10 * arena.roundCount,
                             featuredAt: new Date()
                         }
                     }).catch(() => {}); // Already exists or other error
                 }
             }
        }

        const io: Server = req.app.get('io');
        const arenaNamespace = io.of('/arena');
        arenaNamespace.to(`arena-${arena.code}`).emit('debate-ended', updatedArena);
        stopArenaTimer(arena.code);

        res.status(200).json(updatedArena);
    } catch (error) {
        logger.error('Error submitting verdict:', error);
        res.status(500).json({ message: 'Error submitting verdict' });
    }
};

export const getHallOfFame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const topUsers = await prisma.userDebateStats.findMany({
            include: {
                user: { select: { id: true, username: true, avatar: true, bio: true, equippedBackground: true } }
            },
            orderBy: { totalPoints: 'desc' },
            take: 50
        });

        res.status(200).json(topUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching hall of fame' });
    }
};

export const getMyRecords = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const stats = await prisma.userDebateStats.findUnique({
            where: { userId }
        });

        const records = await prisma.debateRecord.findMany({
            where: { userId },
            include: { arena: true },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // AI Recommendation logic
        let recommendation = "Participate in more debates to get personalized AI insights.";
        if (stats && stats.totalDebates > 0) {
            const winRate = (stats.wins / stats.totalDebates) * 100;
            const violations = await prisma.debateViolation.count({ where: { userId } });
            
            if (violations > 5) {
                recommendation = "Reduce violations. Each one costs -5 points and damages your record.";
            } else if (winRate > 70) {
                recommendation = "Your dominance is clear. Challenge top-ranked debaters to climb higher.";
            } else if (winRate >= 50) {
                recommendation = "Solid performance. Focus on structured arguments to minimize penalties.";
            } else if (winRate >= 30) {
                recommendation = "Study the Hall of Fame debates. Pattern recognition is your next skill.";
            } else if (winRate < 30) {
                recommendation = "Every loss is data. Review your argument structure and debate more frequently.";
            } else if (stats.draws > stats.wins) {
                recommendation = "You are close but not closing. Work on your final round arguments.";
            }
        }

        res.status(200).json({ stats, records, recommendation });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching records' });
    }
};

export const voteHallOfFame = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const entryId = getStringParam(req.params.entryId);
        const userId = req.userId!;

        const existingVote = await prisma.hallOfFameVote.findUnique({
            where: { entryId_userId: { entryId, userId } }
        });

        if (existingVote) {
            await prisma.hallOfFameVote.delete({ where: { id: existingVote.id } });
            await prisma.hallOfFameEntry.update({
                where: { id: entryId },
                data: { upvotes: { decrement: 1 } }
            });
            res.status(200).json({ voted: false, count: -1 });
        } else {
            await prisma.hallOfFameVote.create({
                data: { entryId, userId }
            });
            await prisma.hallOfFameEntry.update({
                where: { id: entryId },
                data: { upvotes: { increment: 1 } }
            });
            res.status(200).json({ voted: true, count: 1 });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error voting' });
    }
};

export const getLiveArenas = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const liveArenas = await prisma.debateArena.findMany({
            where: { 
                status: 'ACTIVE',
                isPublic: true
            },
            include: {
                _count: { select: { participants: true } }
            }
        });

        res.status(200).json(liveArenas);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching live arenas' });
    }
};

export const submitAppeal = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { arenaId, reason, ruleViolated, description, evidenceUrls, desiredOutcome } = req.body;

        if (!arenaId || !reason || !ruleViolated || !description || !desiredOutcome) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check for 24h limit (Chapter 31.1.3)
        const arena = await prisma.debateArena.findUnique({ where: { id: arenaId } });
        if (!arena || arena.status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Only completed debates can be appealed' });
        }

        const appealWindowEnd = addMinutes(arena.updatedAt, 1440); // 24 hours
        if (isAfter(new Date(), appealWindowEnd)) {
            return res.status(403).json({ message: 'Appeal window (24h) has expired' });
        }

        // Check if user is appeal banned (Chapter 31.4.3)
        const stats = await prisma.userDebateStats.findUnique({ where: { userId } });
        if (stats?.appealBannedUntil && isAfter(stats.appealBannedUntil, new Date())) {
            return res.status(403).json({ message: `You are banned from filing appeals until ${stats.appealBannedUntil.toLocaleString()}` });
        }

        const appeal = await prisma.debateAppeal.create({
            data: {
                arenaId,
                userId,
                reason,
                ruleViolated,
                description,
                evidenceUrls: evidenceUrls || [],
                desiredOutcome,
                status: 'PENDING'
            }
        });

        res.status(201).json(appeal);
    } catch (error) {
        logger.error('Error submitting appeal:', error);
        res.status(500).json({ message: 'Error submitting appeal' });
    }
};

export const getAppeals = async (req: AuthenticatedRequest, res: Response) => {
    try {
        // Should be admin check here
        const appeals = await prisma.debateAppeal.findMany({
            include: { 
                user: { select: { username: true } }, 
                arena: { select: { title: true, code: true } } 
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(appeals);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching appeals' });
    }
};

export const resolveAppeal = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status, adminResponse } = req.body; // status: GRANTED | DENIED

        const appeal = await prisma.debateAppeal.update({
            where: { id },
            data: { 
                status, 
                adminResponse,
                adminId: req.userId
            },
            include: { user: true }
        });

        // If DENIED and deemed false appeal, apply penalty (Chapter 31.4.3)
        // (This would need a 'isFalse' flag in body)
        if (status === 'DENIED' && req.body.isFalseAppeal) {
            // Update stats, maybe increment a falseAppealsCount
            // For now, just apply signal
            await prisma.userDebateStats.update({
                where: { userId: appeal.userId },
                data: { yellowSignals: { increment: 1 } }
            });
        }

        res.json(appeal);
    } catch (error) {
        res.status(500).json({ message: 'Error resolving appeal' });
    }
};
