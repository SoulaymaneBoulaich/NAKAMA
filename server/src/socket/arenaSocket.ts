import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { sanitizeInput } from '../utils/sanitizer.js';
import { logger } from '../utils/logger.js';

interface ArenaState {
    timer: NodeJS.Timeout | null;
    secondsRemaining: number;
    activeTeam: 'TEAM_A' | 'TEAM_B' | 'NONE';
    arenaId: string;
    isPaused: boolean;
    totalPauseTimeUsed: number; // in seconds
    lastTickTime: number;
    turnOrderMode: 'SIMULTANEOUS' | 'TURN_BASED';
    currentRoundId: string;
    roundNumber: number;
    teamArgumentCounts: Record<string, number>;
    isCardsActivated: boolean;
    activeCards: {
        id: string;
        type: string;
        userId?: string;
        targetTeam?: 'TEAM_A' | 'TEAM_B' | 'DRAW';
        targetUserId?: string;
        activationTime?: number;
    }[];
    isHalftimeReached: boolean;
    frozenTeams: { TEAM_A?: number; TEAM_B?: number };
    bannedWords: string[];
}

const arenaStates = new Map<string, ArenaState>();

export const setupArenaSocket = (io: Server, socket: Socket) => {
    
    socket.on('join-arena', async ({ code, userId }) => {
        const safeCode = sanitizeInput(code).toUpperCase();
        socket.join(`arena-${safeCode}`);
        logger.info(`User ${userId} joined arena: ${safeCode}`);
        
        const arena = await prisma.debateArena.findUnique({
            where: { code: safeCode },
            include: {
                participants: { 
                    include: { 
                        user: { 
                            select: { 
                                id: true, 
                                username: true, 
                                avatar: true, 
                                banExpiresAt: true,
                                debateStats: {
                                    select: { seasonPoints: true }
                                }
                            } 
                        } 
                    } 
                },
                rounds: { 
                    include: { 
                        arguments: { include: { user: { select: { id: true, username: true, avatar: true } } } } 
                    },
                    orderBy: { roundNumber: 'asc' }
                },
                violations: { include: { user: { select: { username: true } } } },
                mvpUser: { select: { id: true, username: true, avatar: true } }
            }
        });

        if (arena) {
            // Check for active ban (Chapter 17.3.3)
            const participant = arena.participants.find(p => p.userId === userId);
            if (participant?.user.banExpiresAt && participant.user.banExpiresAt > new Date()) {
                socket.emit('error', `You are currently banned from AniJudge until ${participant.user.banExpiresAt.toLocaleString()}`);
                return;
            }

            socket.emit('arena-updated', arena);
            
            const state = arenaStates.get(safeCode);
            if (state) {
                socket.emit('timer-tick', { 
                    secondsRemaining: state.secondsRemaining,
                    activeTeam: state.activeTeam,
                    isPaused: state.isPaused,
                    turnOrderMode: state.turnOrderMode
                });
            }
        }
    });

    socket.on('assign-captain', async ({ arenaId, userId, team }) => {
        try {
            // Check if team already has a captain
            const existingCaptain = await prisma.debateParticipant.findFirst({
                where: { arenaId, role: team, isCaptain: true }
            });

            if (existingCaptain) {
                await prisma.debateParticipant.update({
                    where: { id: existingCaptain.id },
                    data: { isCaptain: false }
                });
            }

            const participant = await prisma.debateParticipant.update({
                where: { arenaId_userId: { arenaId, userId } },
                data: { isCaptain: true }
            });

            const arena = await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { participants: { include: { user: true } } }
            });

            if (arena) {
                io.to(`arena-${arena.code}`).emit('arena-updated', arena);
                io.to(`arena-${arena.code}`).emit('system-message', {
                    message: `${participant.userId} is now Captain for ${team}`
                });
            }
        } catch (error) {
            logger.error('Error assigning captain:', error);
        }
    });

    socket.on('request-pause', async ({ arenaId, userId, reason }) => {
        const participant = await prisma.debateParticipant.findUnique({
            where: { arenaId_userId: { arenaId, userId } },
            include: { arena: true }
        });

        if (participant && (participant.isCaptain || participant.role === 'JUDGE')) {
            const arena = participant.arena;
            const state = arenaStates.get(arena.code);

            if (state && !state.isPaused) {
                if (participant.role !== 'JUDGE' && participant.pauseRequestsUsed >= 2) {
                    socket.emit('error', 'No pause requests remaining');
                    return;
                }

                if (arena.totalPauseTimeUsed >= 300) { // 5 minutes limit
                    socket.emit('error', 'Total pause time limit reached');
                    return;
                }

                state.isPaused = true;
                if (participant.role !== 'JUDGE') {
                    await prisma.debateParticipant.update({
                        where: { id: participant.id },
                        data: { pauseRequestsUsed: { increment: 1 } }
                    });
                }

                io.to(`arena-${arena.code}`).emit('debate-paused', { 
                    by: userId, 
                    reason,
                    totalPauseTimeUsed: arena.totalPauseTimeUsed 
                });
                
                io.to(`arena-${arena.code}`).emit('timer-tick', { 
                    secondsRemaining: state.secondsRemaining,
                    activeTeam: state.activeTeam,
                    isPaused: true
                });
            }
        }
    });

    socket.on('start-debate', async ({ arenaId, userId }) => {
        try {
            const arena = await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { participants: true }
            });

            if (arena && arena.judgeId === userId) {
                // Update Arena Status
                await prisma.debateArena.update({
                    where: { id: arenaId },
                    data: { status: 'ACTIVE' }
                });

                // Create first round
                const firstRound = await prisma.debateRound.create({
                    data: {
                        arenaId,
                        roundNumber: 1,
                        status: 'ANNOUNCING_SUBTOPIC'
                    }
                });

                const updatedArena = await prisma.debateArena.findUnique({
                    where: { id: arenaId },
                    include: { 
                        participants: { include: { user: true } }, 
                        rounds: { include: { arguments: true }, orderBy: { roundNumber: 'asc' } } 
                    }
                });

                io.to(`arena-${arena.code}`).emit('arena-updated', updatedArena);
                io.to(`arena-${arena.code}`).emit('system-message', {
                    message: "The Arena has been activated. Arbiter, please announce the first subtopic."
                });
            }
        } catch (error) {
            logger.error('Error starting debate:', error);
        }
    });

    socket.on('announce-subtopic', async ({ arenaId, subtopic, userId }) => {
        try {
            const arena = await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { rounds: true }
            });

            if (arena && arena.judgeId === userId) {
                const currentRound = arena.rounds.find(r => r.status === 'ANNOUNCING_SUBTOPIC');
                if (!currentRound) return;

                const updatedRound = await prisma.debateRound.update({
                    where: { id: currentRound.id },
                    data: { subtopic, status: 'ACTIVE' }
                });

                io.to(`arena-${arena.code}`).emit('subtopic-announced', { subtopic, roundId: updatedRound.id });
                
                // Start the timer automatically
                const duration = arena.timeLimitPerRound;
                startArenaTimer(io, arena.code, arena.id, duration, 'TEAM_A', arena.turnOrderMode as any, updatedRound.id, updatedRound.roundNumber);
            }
        } catch (error) {
            logger.error('Error announcing subtopic:', error);
        }
    });

    socket.on('extend-round', async ({ arenaId, userId }) => {
        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId },
            include: { participants: true }
        });

        if (arena && arena.judgeId === userId) {
            if (arena.extensionsUsed >= 3) {
                socket.emit('error', 'Maximum extensions reached');
                return;
            }

            const state = arenaStates.get(arena.code);
            if (state) {
                state.secondsRemaining += 60;
                await prisma.debateArena.update({
                    where: { id: arenaId },
                    data: { extensionsUsed: { increment: 1 } }
                });

                io.to(`arena-${arena.code}`).emit('round-extended', { by: userId, seconds: 60 });
                io.to(`arena-${arena.code}`).emit('timer-tick', { 
                    secondsRemaining: state.secondsRemaining,
                    activeTeam: state.activeTeam,
                    isPaused: state.isPaused,
                    turnOrderMode: state.turnOrderMode
                });
            }
        }
    });

    socket.on('submit-argument', async ({ arenaId, roundId, userId, team, content, mediaUrls }) => {
        const arena = await prisma.debateArena.findUnique({ where: { id: arenaId } });
        if (!arena) return;

        const state = arenaStates.get(arena.code);
        if (!state || state.isPaused) {
            socket.emit('error', 'Debate is paused');
            return;
        }

        // Banned Words Check
        const containsBannedWord = state.bannedWords.some(word => 
            content.toLowerCase().includes(word.toLowerCase())
        );

        if (containsBannedWord) {
            socket.emit('error', 'Your argument contains banned words and was blocked.');
            // Trigger automatic signal issuance (Chapter 18)
            return;
        }

        // Enforce turn order in TURN_BASED mode
        if (state.turnOrderMode === 'TURN_BASED' && state.activeTeam !== team) {
            socket.emit('error', `It is not ${team}'s turn`);
            return;
        }

        // Check if team is frozen (Freeze Debaters Card)
        const frozenUntil = state.frozenTeams[team as 'TEAM_A' | 'TEAM_B'];
        if (frozenUntil && Date.now() < frozenUntil) {
            socket.emit('error', 'Your team is currently frozen by a card effect!');
            return;
        }

        try {
            const argument = await prisma.debateArgument.create({
                data: {
                    roundId,
                    userId,
                    team,
                    content,
                    mediaUrls: mediaUrls || []
                },
                include: { user: { select: { id: true, username: true, avatar: true } } }
            });

            // Increment argument count
            state.teamArgumentCounts[team] = (state.teamArgumentCounts[team] || 0) + 1;

            io.to(`arena-${arena.code}`).emit('argument-submitted', { argument, teamArgumentCounts: state.teamArgumentCounts });

        } catch (error) {
            logger.error('Error submitting argument:', error);
        }
    });

    socket.on('issue-violation', async ({ arenaId, judgeId, participantId, type, severity, comment }) => {
        try {
            const participant = await prisma.debateParticipant.findUnique({
                where: { id: participantId },
                include: { user: true }
            });

            if (!participant) return;

            const penaltyPoints = severity === 'SEVERE' ? 20 : severity === 'MODERATE' ? 10 : 5;

            await prisma.debateViolation.create({
                data: {
                    arenaId,
                    userId: participant.userId,
                    reason: `${type}: ${comment}`,
                    penaltyPoints
                }
            });

            // Deduct points from participant
            const updatedParticipant = await prisma.debateParticipant.update({
                where: { id: participantId },
                data: { pointsInArena: { decrement: penaltyPoints } },
                include: { user: true }
            });

            const arena = await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { participants: { include: { user: true } }, violations: { include: { user: true } } }
            });

            if (arena) {
                io.to(`arena-${arena.code}`).emit('arena-updated', arena);
                io.to(`arena-${arena.code}`).emit('system-message', {
                    type: 'VIOLATION',
                    content: `${updatedParticipant.user.username} received a ${severity} violation for ${type}. Penalty: -${penaltyPoints} points.`
                });
            }
        } catch (error) {
            logger.error('Error issuing violation:', error);
        }
    });

    socket.on('submit-round-scores', async ({ arenaId, roundId, userId, scores, winnerTeam }) => {
        try {
            const judge = await prisma.debateParticipant.findUnique({
                where: { arenaId_userId: { arenaId, userId } }
            });

            if (!judge || judge.role !== 'JUDGE') return;

            const arena = await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { participants: true, rounds: { where: { id: roundId } } }
            });
            if (!arena || !arena.rounds[0]) return;

            const currentRound = arena.rounds[0];
            const state = arenaStates.get(arena.code);
            const teamCounts = state?.teamArgumentCounts || {};
            
            // Modifier flags
            const isDoubleRound = currentRound.isDoubleRound;
            const isSilenceRound = currentRound.isSilenceRound;
            const roundMultiplier = isDoubleRound ? 2 : 1;

            // 1. Individual Scores + Media Bonuses + Modifiers
            let teamAFinal = 0;
            let teamBFinal = 0;

            for (const score of scores) {
                const basePoints = (score.logicScore + score.evidenceScore + score.counterScore + score.clarityScore) * roundMultiplier;
                const mediaBonus = (score.mediaBonusType === 'PHOTO' ? 3 : score.mediaBonusType === 'VIDEO' ? 4 : score.mediaBonusType === 'REFERENCE' ? 5 : 0) * roundMultiplier;
                
                let finalIndividualPoints = basePoints + mediaBonus;

                // Card: 2X Points
                const doublePointsCard = state?.activeCards.find(c => c.type === 'DOUBLE_POINTS' && c.userId === score.participantUserId);
                if (doublePointsCard) finalIndividualPoints *= 2;

                // Card: Shield
                const shieldCard = state?.activeCards.find(c => c.type === 'SHIELD' && c.targetUserId === score.participantUserId);
                if (shieldCard && finalIndividualPoints < 0) finalIndividualPoints = 0;

                // Card: Steal (Post-assignment transfer logic)
                const stealCards = state?.activeCards.filter(c => c.type === 'STEAL');
                stealCards?.forEach(card => {
                    if (card.targetUserId === score.participantUserId) finalIndividualPoints -= 2;
                    if (card.userId === score.participantUserId) finalIndividualPoints += 2;
                });

                // Individual Range Clamp (Post-modifiers)
                const maxRange = 5 * roundMultiplier * (doublePointsCard ? 2 : 1);
                const minRange = -5 * roundMultiplier;
                if (finalIndividualPoints > maxRange) finalIndividualPoints = maxRange;
                if (finalIndividualPoints < minRange) finalIndividualPoints = minRange;

                await prisma.debateRoundScore.upsert({
                    where: { roundId_userId: { roundId, userId: score.participantUserId } },
                    update: { points: finalIndividualPoints, logicScore: score.logicScore, evidenceScore: score.evidenceScore, counterScore: score.counterScore, clarityScore: score.clarityScore },
                    create: { roundId, userId: score.participantUserId, points: finalIndividualPoints, logicScore: score.logicScore, evidenceScore: score.evidenceScore, counterScore: score.counterScore, clarityScore: score.clarityScore }
                });

                if (score.team === 'TEAM_A') teamAFinal += finalIndividualPoints;
                if (score.team === 'TEAM_B') teamBFinal += finalIndividualPoints;
            }

            // Chapter 21: Solo Debater Handicap
            const teamAParticipants = arena.participants.filter(p => p.role === 'TEAM_A');
            const teamBParticipants = arena.participants.filter(p => p.role === 'TEAM_B');
            const isTeamASolo = teamAParticipants.length === 1 && teamBParticipants.length >= 2;
            const isTeamBSolo = teamBParticipants.length === 1 && teamAParticipants.length >= 2;

            if (isTeamASolo) teamAFinal += 2 * roundMultiplier;
            if (isTeamBSolo) teamBFinal += 2 * roundMultiplier;

            // 2. Win/Loss Bonuses
            const teamAIndividualMax = Math.max(...scores.filter((s: any) => s.team === 'TEAM_A').map((s: any) => s.logicScore + s.evidenceScore + s.counterScore + s.clarityScore), -10);
            const teamBIndividualMax = Math.max(...scores.filter((s: any) => s.team === 'TEAM_B').map((s: any) => s.logicScore + s.evidenceScore + s.counterScore + s.clarityScore), -10);

            if (winnerTeam === 'TEAM_A') {
                teamAFinal += 15 * roundMultiplier;
                if (!isSilenceRound && teamBIndividualMax < 5) teamBFinal -= 5 * roundMultiplier; // Loss penalty
            } else if (winnerTeam === 'TEAM_B') {
                teamBFinal += 15 * roundMultiplier;
                if (!isSilenceRound && teamAIndividualMax < 5) teamAFinal -= 5 * roundMultiplier; // Loss penalty
            }

            // 3. Penalties
            if (!isSilenceRound) {
                const teamAFailedMin = (teamCounts['TEAM_A'] || 0) < 3;
                const teamBFailedMin = (teamCounts['TEAM_B'] || 0) < 3;
                if (teamAFailedMin) teamAFinal -= 10 * roundMultiplier;
                if (teamBFailedMin) teamBFinal -= 10 * roundMultiplier;
            }

            // 4. Progressive Round Caps
            const caps = [15, 20, 25, 30, 35];
            const currentCap = (caps[state?.roundNumber || 1 - 1] || 35) * roundMultiplier;

            if (teamAFinal > currentCap) teamAFinal = currentCap;
            if (teamBFinal > currentCap) teamBFinal = currentCap;

            // Update Database and Broadcast
            await prisma.debateParticipant.updateMany({ where: { arenaId, role: 'TEAM_A' }, data: { pointsInArena: { increment: teamAFinal } } });
            await prisma.debateParticipant.updateMany({ where: { arenaId, role: 'TEAM_B' }, data: { pointsInArena: { increment: teamBFinal } } });

            // Seasonal Points (Chapter 25.1.1)
            for (const score of scores) {
                await prisma.userDebateStats.update({
                    where: { userId: score.participantUserId },
                    data: { 
                        seasonPoints: { increment: score.points },
                        totalPoints: { increment: score.points }
                    }
                });
            }

            await prisma.debateRound.update({ where: { id: roundId }, data: { status: 'COMPLETED', winnerTeam } });

            io.to(`arena-${arena.code}`).emit('round-completed', { roundId, winnerTeam, teamAFinal, teamBFinal });

            // Next Round Logic...
            const nextRoundNumber = (state?.roundNumber || 0) + 1;
            if (nextRoundNumber <= arena.roundCount) {
                await prisma.debateRound.create({ data: { arenaId, roundNumber: nextRoundNumber, status: 'ANNOUNCING_SUBTOPIC' } });
            } else {
                // Check for Tie (Book Six Chapter 22)
                const teamAOverall = arena.participants.filter(p => p.role === 'TEAM_A').reduce((acc, p) => acc + p.pointsInArena, 0);
                const teamBOverall = arena.participants.filter(p => p.role === 'TEAM_B').reduce((acc, p) => acc + p.pointsInArena, 0);

                if (teamAOverall === teamBOverall) {
                    if (arena.tieBreakerEnabled) {
                        await prisma.debateRound.create({ 
                            data: { 
                                arenaId, 
                                roundNumber: nextRoundNumber, 
                                status: 'SUDDEN_DEATH',
                                subtopic: 'SUDDEN DEATH: FINAL CLASH'
                            } 
                        });
                        io.to(`arena-${arena.code}`).emit('sudden-death-triggered', { message: 'SCORES ARE TIED. SUDDEN DEATH COMMENCING.' });
                    } else {
                        // End in draw
                        socket.emit('debate-ended', { winnerTeam: 'DRAW', message: 'Debate ended in a draw.' });
                    }
                }
            }

            io.to(`arena-${arena.code}`).emit('arena-updated', await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { participants: { include: { user: true } }, rounds: true }
            }));

        } catch (error) {
            logger.error('Error submitting round scores:', error);
        }
    });

    socket.on('activate-cards', async ({ arenaId, activate }: { arenaId: string; activate: boolean }) => {
        const state = arenaStates.get(arenaId);
        if (!state) return;

        const arena = await prisma.debateArena.findUnique({
            where: { id: arenaId },
            include: { participants: { include: { user: true } } }
        });

        if (!arena || arena.judgeId !== (socket as any).data.userId) return;

        if (activate) {
            await prisma.debateArena.update({
                where: { id: arenaId },
                data: { 
                    isCardsActivated: true,
                    status: 'ACTIVE'
                }
            });

            state.isCardsActivated = true;
            io.to(arenaId).emit('cards-activated', { arenaId });
            io.to(arenaId).emit('arena-updated', await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { 
                    host: true,
                    judge: true,
                    coJudge: true,
                    participants: { include: { user: { include: { debateStats: true } } } },
                    rounds: { include: { arguments: { include: { user: true } }, scores: true } },
                    violations: { include: { participant: { include: { user: true } } } }
                }
            }));
        } else {
            // Just resume without cards
            io.to(arenaId).emit('debate-resumed', { arenaId });
        }
    });

    socket.on('submit-verdict', async ({ arenaId, userId, winnerTeam, verdictText, bestEvidenceUserId, mostImprovedUserId }) => {
        try {
            const arena = await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { 
                    participants: { include: { user: { include: { debateStats: true } } } }, 
                    rounds: { include: { scores: true } },
                    violations: true
                }
            });

            if (!arena || arena.judgeId !== userId) return;

            // 1. Calculate Individual Totals (Raw scores + Media bonuses)
            const participantTotals: { [userId: string]: number } = {};
            arena.participants.filter(p => p.role === 'TEAM_A' || p.role === 'TEAM_B').forEach(p => {
                const total = arena.rounds.reduce((sum, round) => {
                    const score = round.scores.find(s => s.userId === p.userId);
                    return sum + (score ? (score.logicScore + score.evidenceScore + score.counterScore + score.clarityScore + score.mediaBonusPoints) : 0);
                }, 0);
                participantTotals[p.userId] = total;
            });

            // 2. Identify MVP and Lowest Performer (Chapter 28)
            const scores = Object.values(participantTotals);
            const maxScore = Math.max(...scores);
            const minScore = Math.min(...scores);

            const mvpUserIds = Object.keys(participantTotals).filter(uid => participantTotals[uid] === maxScore);
            const lowestPerformerUserIds = Object.keys(participantTotals).filter(uid => participantTotals[uid] === minScore);

            // 3. Check Judge Clean Game (Chapter 29)
            // Judge is clean if they received 0 yellow/red signals during THIS debate
            // (Assuming violations with userId = judgeId are tracked)
            const judgeViolations = arena.violations.filter(v => v.userId === arena.judgeId);
            const isCleanGame = judgeViolations.length === 0;

            // 4. Update Arena State
            const updatedArena = await prisma.debateArena.update({
                where: { id: arenaId },
                data: { 
                    status: 'COMPLETED',
                    winnerTeam,
                    verdictText,
                    mvpUserId: mvpUserIds[0], // Primary MVP for record
                    bestEvidenceUserId,
                    mostImprovedUserId,
                    lowestPerformerUserId: lowestPerformerUserIds[0],
                    isCleanGame
                },
                include: { participants: { include: { user: true } }, rounds: { include: { scores: true } } }
            });

            // 5. Update All Participants' Stats (Chapter 27.4 & 28)
            for (const p of updatedArena.participants) {
                if (p.role === 'TEAM_A' || p.role === 'TEAM_B') {
                    const isWinner = p.role === winnerTeam;
                    const isMVP = mvpUserIds.includes(p.userId);
                    const isLowest = lowestPerformerUserIds.includes(p.userId);
                    const isBestEvidence = p.userId === bestEvidenceUserId;
                    const isMostImproved = p.userId === mostImprovedUserId;

                    // Award points calculation (Chapter 28)
                    let bonusPoints = 0;
                    if (isMVP) bonusPoints += 5;
                    if (isBestEvidence) bonusPoints += 3;
                    if (isMostImproved) bonusPoints += 2;
                    if (isLowest) bonusPoints -= 5;

                    // Team result points (Chapter 27.4.2)
                    const result = winnerTeam === 'DRAW' ? 'DRAW' : (isWinner ? 'WIN' : 'LOSS');

                    await prisma.userDebateStats.upsert({
                        where: { userId: p.userId },
                        update: {
                            totalDebates: { increment: 1 },
                            wins: { increment: result === 'WIN' ? 1 : 0 },
                            losses: { increment: result === 'LOSS' ? 1 : 0 },
                            draws: { increment: result === 'DRAW' ? 1 : 0 },
                            seasonPoints: { increment: participantTotals[p.userId] + (isWinner ? 10 : 0) + bonusPoints },
                            totalPoints: { increment: participantTotals[p.userId] + (isWinner ? 10 : 0) + bonusPoints },
                            mvpCount: { increment: isMVP ? 1 : 0 }
                        },
                        create: {
                            userId: p.userId,
                            totalDebates: 1,
                            wins: result === 'WIN' ? 1 : 0,
                            losses: result === 'LOSS' ? 1 : 0,
                            draws: result === 'DRAW' ? 1 : 0,
                            seasonPoints: participantTotals[p.userId] + (isWinner ? 10 : 0) + bonusPoints,
                            totalPoints: participantTotals[p.userId] + (isWinner ? 10 : 0) + bonusPoints,
                            mvpCount: isMVP ? 1 : 0
                        }
                    });

                    // Create Debate Record
                    await prisma.debateRecord.create({
                        data: {
                            userId: p.userId,
                            arenaId: updatedArena.id,
                            role: 'DEBATER',
                            result: result as any,
                            pointsEarned: participantTotals[p.userId] + (isWinner ? 10 : 0) + (bonusPoints > 0 ? bonusPoints : 0),
                            pointsLost: bonusPoints < 0 ? Math.abs(bonusPoints) : 0,
                            netPoints: participantTotals[p.userId] + (isWinner ? 10 : 0) + bonusPoints
                        }
                    });

                } else if (p.role === 'JUDGE') {
                    // Judge Bonus (Chapter 29)
                    let judgePointBonus = 50; // Base completion bonus
                    let blueSignIncrement = 0;
                    let extraBonus = 0;

                    if (isCleanGame) {
                        judgePointBonus += 20;
                        blueSignIncrement = 1;
                    }

                    // Check for 3 Blue Signs bonus
                    const currentStats = await prisma.userDebateStats.findUnique({ where: { userId: p.userId } });
                    const newBlueSigns = (currentStats?.blueSigns || 0) + blueSignIncrement;
                    
                    let finalBlueSigns = newBlueSigns;
                    if (newBlueSigns >= 3) {
                        extraBonus = 11;
                        finalBlueSigns = 0; // Reset as per Chapter 29.2.3
                    }

                    await prisma.userDebateStats.upsert({
                        where: { userId: p.userId },
                        update: {
                            totalDebates: { increment: 1 },
                            judgePoints: { increment: judgePointBonus + extraBonus },
                            cleanGamesCount: { increment: isCleanGame ? 1 : 0 },
                            blueSigns: finalBlueSigns,
                            lastJudgedAt: new Date()
                        },
                        create: {
                            userId: p.userId,
                            totalDebates: 1,
                            judgePoints: judgePointBonus + extraBonus,
                            cleanGamesCount: isCleanGame ? 1 : 0,
                            blueSigns: finalBlueSigns,
                            lastJudgedAt: new Date()
                        }
                    });

                    // Record for Judge
                    await prisma.debateRecord.create({
                        data: {
                            userId: p.userId,
                            arenaId: updatedArena.id,
                            role: 'JUDGE',
                            result: 'DRAW', // Judge doesn't win/lose
                            pointsEarned: judgePointBonus + extraBonus,
                            pointsLost: 0,
                            netPoints: judgePointBonus + extraBonus
                        }
                    });
                }
            }

            // 6. Hall of Fame (Book Seven 30.4)
            if (updatedArena.rounds.length >= 3) {
                // Determine top individual
                const topUserId = Object.keys(participantTotals).reduce((a, b) => participantTotals[a] > participantTotals[b] ? a : b);
                await prisma.hallOfFameEntry.upsert({
                    where: { arenaId: updatedArena.id },
                    update: { score: participantTotals[topUserId] },
                    create: {
                        arenaId: updatedArena.id,
                        userId: topUserId,
                        score: participantTotals[topUserId],
                        featuredAt: new Date()
                    }
                });
            }

            io.to(`arena-${updatedArena.code}`).emit('debate-ended', updatedArena);
            arenaStates.delete(updatedArena.code);

        } catch (error) {
            logger.error('Error submitting verdict:', error);
        }
    });

    socket.on('declare-ghost-round', async ({ arenaId, option }: { arenaId: string; option: 'REPEAT' | 'SKIP' | 'END' }) => {
        try {
            const arena = await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { rounds: true }
            });

            if (!arena || arena.judgeId !== (socket as any).data.userId) return;

            const currentRound = arena.rounds.find(r => r.status === 'ACTIVE');
            if (!currentRound) return;

            if (option === 'REPEAT') {
                await prisma.debateRound.update({
                    where: { id: currentRound.id },
                    data: { status: 'ANNOUNCING_SUBTOPIC' } // Reset round
                });
                io.to(`arena-${arena.code}`).emit('ghost-round-action', { action: 'REPEAT', message: 'Round was a ghost round. Repeating subtopic.' });
            } else if (option === 'SKIP') {
                await prisma.debateRound.update({
                    where: { id: currentRound.id },
                    data: { status: 'COMPLETED', winnerTeam: 'DRAW' }
                });
                const nextRoundNumber = currentRound.roundNumber + 1;
                if (nextRoundNumber <= arena.roundCount) {
                    await prisma.debateRound.create({ data: { arenaId, roundNumber: nextRoundNumber, status: 'ANNOUNCING_SUBTOPIC' } });
                }
                io.to(`arena-${arena.code}`).emit('ghost-round-action', { action: 'SKIP', message: 'Ghost round skipped. Moving to next subtopic.' });
            } else if (option === 'END') {
                await prisma.debateArena.update({ where: { id: arenaId }, data: { status: 'COMPLETED', verdictText: 'Debate ended early due to consecutive ghost rounds.' } });
                io.to(`arena-${arena.code}`).emit('debate-ended', { winnerTeam: 'DRAW', message: 'Debate ended due to inactivity.' });
            }

            io.to(`arena-${arena.code}`).emit('arena-updated', await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { participants: { include: { user: true } }, rounds: true }
            }));
        } catch (error) {
            logger.error('Error handling ghost round:', error);
        }
    });

    socket.on('promote-co-judge', async ({ arenaId }) => {
        try {
            const arena = await prisma.debateArena.findUnique({
                where: { id: arenaId }
            });

            if (!arena || !arena.coJudgeId) return;

            // Only allow if original judge is disconnected or explicitly promotes
            // For now, let's allow it if called
            await prisma.debateArena.update({
                where: { id: arenaId },
                data: { judgeId: arena.coJudgeId, coJudgeId: null }
            });

            io.to(`arena-${arena.code}`).emit('judge-promoted', { newJudgeId: arena.coJudgeId });
            io.to(`arena-${arena.code}`).emit('arena-updated', await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { participants: { include: { user: true } }, rounds: true }
            }));
        } catch (error) {
            logger.error('Error promoting co-judge:', error);
        }
    });
    socket.on('buy-card', async ({ arenaId, cardType, targetTeam, targetUserId }: { 
        arenaId: string; 
        cardType: string; 
        targetTeam?: 'TEAM_A' | 'TEAM_B' | 'DRAW';
        targetUserId?: string;
    }) => {
        const state = arenaStates.get(arenaId);
        if (!state || !state.isCardsActivated) return;

        const costs: Record<string, number> = { 'FREEZE_DEBATERS': 3, 'DOUBLE_POINTS': 4, 'SKIP_SUBJECT': 5, 'SHIELD': 4, 'STEAL': 6 };
        const cost = costs[cardType];
        if (!cost) return;

        const stats = await prisma.userDebateStats.findUnique({ where: { userId: (socket as any).data.userId } });
        if (!stats || stats.totalPoints < cost) {
            socket.emit('error', { message: 'Insufficient points.' });
            return;
        }

        await prisma.userDebateStats.update({ where: { userId: (socket as any).data.userId }, data: { totalPoints: { decrement: cost } } });

        const newCard = await prisma.debateCard.create({
            data: { arenaId, roundNumber: state.roundNumber, userId: (socket as any).data.userId, type: cardType as any, targetTeam: targetTeam as any, targetUserId }
        });

        state.activeCards.push({ id: newCard.id, type: cardType, userId: (socket as any).data.userId, targetTeam, targetUserId });
        io.to(`arena-${arenaId}`).emit('card-purchased', { username: (socket as any).data.username, cardType });
    });

    socket.on('issue-signal', async (payload) => {
        await issueSignal(io, payload);
    });

    socket.on('leave-debate', async (payload) => {
        await handleVoluntaryQuit(io, socket, payload);
    });
};

export const startArenaTimer = (io: Server, code: string, arenaId: string, seconds: number, team: 'TEAM_A' | 'TEAM_B' | 'NONE', mode: 'SIMULTANEOUS' | 'TURN_BASED' = 'SIMULTANEOUS', roundId: string, roundNumber: number) => {
    const room = `arena-${code.toUpperCase()}`;
    const existing = arenaStates.get(code);
    if (existing?.timer) clearInterval(existing.timer);

    const state: ArenaState = {
        arenaId,
        secondsRemaining: mode === 'TURN_BASED' ? 60 : seconds,
        activeTeam: team,
        isPaused: false,
        totalPauseTimeUsed: existing?.totalPauseTimeUsed || 0,
        lastTickTime: Date.now(),
        turnOrderMode: mode,
        currentRoundId: roundId,
        roundNumber: roundNumber,
        teamArgumentCounts: existing?.teamArgumentCounts || {},
        isCardsActivated: false,
        activeCards: [],
        isHalftimeReached: false,
        frozenTeams: {},
        bannedWords: [],
        timer: setInterval(async () => {
            const currentState = arenaStates.get(code);
            if (!currentState || currentState.isPaused) return;

            // Book Six: Solo Debater / Ghost Round Check
            const arena = await prisma.debateArena.findUnique({ 
                where: { id: arenaId },
                include: { participants: true }
            });
            
            if (arena) {
                const teamAPount = arena.participants.filter(p => p.role === 'TEAM_A').length;
                const teamBCount = arena.participants.filter(p => p.role === 'TEAM_B').length;

                // Solo Debater Time Bonus (Chapter 21.1.2)
                const activeTeamCount = currentState.activeTeam === 'TEAM_A' ? teamAPount : teamBCount;
                const opposingTeamCount = currentState.activeTeam === 'TEAM_A' ? teamBCount : teamAPount;

                if (activeTeamCount === 1 && opposingTeamCount >= 2 && currentState.secondsRemaining === (mode === 'TURN_BASED' ? 60 : seconds)) {
                    currentState.secondsRemaining = Math.floor(currentState.secondsRemaining * 1.5);
                    io.to(room).emit('system-message', { message: `Solo Debater Bonus Activated: +50% Time granted to ${currentState.activeTeam}` });
                }

                // Ghost Round Skip (Chapter 21.2)
                if (activeTeamCount === 0 && opposingTeamCount > 0) {
                    io.to(room).emit('system-message', { message: `Ghost Round detected for ${currentState.activeTeam}. Skipping turn.` });
                    currentState.secondsRemaining = 0; // Trigger transition immediately
                }
            }

            // Initialize banned words if empty (sync with DB)
            if (currentState.bannedWords.length === 0) {
                const arena = await prisma.debateArena.findUnique({ where: { id: arenaId } });
                if (arena) currentState.bannedWords = arena.bannedWords;
            }

            currentState.secondsRemaining--;
            currentState.lastTickTime = Date.now();

            // Halftime Calculation: Total rounds * seconds / 2
            const totalScheduledSeconds = (await prisma.debateArena.findUnique({ where: { id: arenaId } }))?.roundCount! * seconds;
            const currentElapsedSeconds = (currentState.roundNumber - 1) * seconds + (seconds - currentState.secondsRemaining);
            
            if (currentElapsedSeconds >= totalScheduledSeconds / 2 && !currentState.isHalftimeReached) {
                currentState.isHalftimeReached = true;
                currentState.isPaused = true;
                io.to(room).emit('halftime-reached', { message: '[HALFTIME – CARD ACTIVATION] Deciding whether to activate cards...' });
                await prisma.debateArena.update({ where: { id: arenaId }, data: { status: 'PAUSED' } });
            }

            io.to(room).emit('timer-tick', { 
                secondsRemaining: currentState.secondsRemaining,
                activeTeam: currentState.activeTeam,
                isPaused: false,
                turnOrderMode: currentState.turnOrderMode
            });

            if (currentState.secondsRemaining <= 0) {
                if (currentState.timer) clearInterval(currentState.timer);
                // Transition logic...
            }
        }, 1000)
    };
    
    arenaStates.set(code, state);
};

export const issueSignal = async (io: Server, { arenaId, userId, targetUserId, type, reason }: any) => {
    try {
        const targetStats = await prisma.userDebateStats.upsert({
            where: { userId: targetUserId },
            update: {},
            create: { userId: targetUserId }
        });

        let banDuration = 0;
        let finalType = type; // YELLOW, RED, GREEN

        if (type === 'YELLOW') {
            await prisma.userDebateStats.update({
                where: { userId: targetUserId },
                data: { yellowSignals: { increment: 1 } }
            });
            
            // 3 Yellows = 1 Red (Chapter 17.2.4)
            const updatedStats = await prisma.userDebateStats.findUnique({ where: { userId: targetUserId } });
            if (updatedStats && updatedStats.yellowSignals >= 3) {
                finalType = 'RED';
                await prisma.userDebateStats.update({
                    where: { userId: targetUserId },
                    data: { yellowSignals: 0, redSignals: { increment: 1 } }
                });
            }
        } else if (type === 'RED') {
            await prisma.userDebateStats.update({
                where: { userId: targetUserId },
                data: { redSignals: { increment: 1 } }
            });
        } else if (type === 'GREEN') {
            await prisma.userDebateStats.update({
                where: { userId: targetUserId },
                data: { greenSignals: { increment: 1 } }
            });
        }

        // Handle Red Signal Consequences (Chapter 17.3.5)
        if (finalType === 'RED') {
            const stats = await prisma.userDebateStats.findUnique({ where: { userId: targetUserId } });
            if (stats) {
                if (stats.redSignals === 1) banDuration = 24 * 60 * 60 * 1000; // 24h
                else if (stats.redSignals === 2) banDuration = 7 * 24 * 60 * 60 * 1000; // 7d
                else if (stats.redSignals >= 3) banDuration = 999 * 365 * 24 * 60 * 60 * 1000; // Permanent
            }

            await prisma.user.update({
                where: { id: targetUserId },
                data: { banExpiresAt: new Date(Date.now() + banDuration) }
            });

            // Eject from arena
            io.to(`arena-${arenaId}`).emit('user-ejected', { userId: targetUserId, reason });
        }

        await prisma.debateViolation.create({
            data: { arenaId, userId: targetUserId, reason: `[${finalType}] ${reason}`, penaltyPoints: finalType === 'RED' ? 10 : 0 }
        });

        const arena = await prisma.debateArena.findUnique({ 
            where: { id: arenaId },
            include: { participants: { include: { user: true } }, rounds: true, violations: true }
        });
        if (arena) {
            io.to(`arena-${arena.code}`).emit('signal-issued', { targetUserId, type: finalType, reason });
            io.to(`arena-${arena.code}`).emit('arena-updated', arena);
        }
    } catch (error) {
        logger.error('Error issuing signal:', error);
    }
};

export const handleVoluntaryQuit = async (io: Server, socket: Socket, { arenaId, userId }: any) => {
    try {
        const participant = await prisma.debateParticipant.findUnique({
            where: { arenaId_userId: { arenaId, userId } },
            include: { user: true }
        });

        if (!participant) return;

        // Voluntary Quit Penalty (Chapter 19.2)
        const penalty = participant.isCaptain ? 20 : 10;
        await prisma.debateParticipant.update({
            where: { id: participant.id },
            data: { pointsInArena: { decrement: penalty } }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { quitStrikes: { increment: 1 } }
        });

        // 3-quit ban threshold (Chapter 19.2.5)
        const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
        if (updatedUser && updatedUser.quitStrikes >= 3) {
            await prisma.user.update({
                where: { id: userId },
                data: { 
                    quitStrikes: 0,
                    banExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3-day ban
                }
            });
        }

        const arena = await prisma.debateArena.findUnique({ where: { id: arenaId } });
        if (arena) {
            io.to(`arena-${arena.code}`).emit('system-message', { message: `${participant.user.username} has voluntarily quit. Penalty: -${penalty} pts.` });
            socket.leave(`arena-${arena.code}`);
        }
    } catch (error) {
        logger.error('Error leaving debate:', error);
    }
};

export const stopArenaTimer = (code: string) => {
    const state = arenaStates.get(code);
    if (state?.timer) clearInterval(state.timer);
    arenaStates.delete(code);
};
