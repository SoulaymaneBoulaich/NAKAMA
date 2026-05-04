import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { sanitizeInput } from '../utils/sanitizer.js';

interface ArenaState {
    timer: NodeJS.Timeout | null;
    secondsRemaining: number;
    activeTeam: 'TEAM_A' | 'TEAM_B' | null;
}

const arenaStates = new Map<string, ArenaState>();

export const setupArenaSocket = (io: Server, socket: Socket) => {
    socket.on('join-arena', async ({ code, userId, team }) => {
        try {
            const safeCode = sanitizeInput(code).toUpperCase();
            const arena = await prisma.arena.findUnique({
                where: { code: safeCode },
                include: { participants: true }
            });

            if (!arena || arena.status !== 'WAITING') return;

            // Check if user is already in arena
            const existing = arena.participants.find(p => p.userId === userId);
            if (existing) {
                socket.join(arena.code);
                return;
            }

            // Check team space (max 3)
            const teamCount = arena.participants.filter(p => p.team === team).length;
            if (team !== 'JUDGE' && teamCount >= 3) {
                return socket.emit('error', 'Team is full');
            }

            // If judge was set by host, validate
            if (team === 'JUDGE' && arena.judgeId && arena.judgeId !== userId) {
                return socket.emit('error', 'Judge already assigned');
            }

            await prisma.arenaParticipant.create({
                data: {
                    arenaId: arena.id,
                    userId,
                    team
                }
            });

            socket.join(arena.code);
            const updatedArena = await prisma.arena.findUnique({
                where: { id: arena.id },
                include: { 
                    participants: { include: { user: { select: { id: true, username: true, avatar: true } } } },
                    judge: { select: { id: true, username: true, avatar: true } }
                }
            });

            io.to(arena.code).emit('arena-updated', updatedArena);
        } catch (error) {
            console.error('Socket join-arena error:', error);
        }
    });

    socket.on('set-judge', async ({ arenaId, judgeUserId, hostId }) => {
        try {
            const arena = await prisma.arena.findUnique({ where: { id: arenaId } });
            if (!arena || arena.hostId !== hostId) return;

            await prisma.arena.update({
                where: { id: arenaId },
                data: { judgeId: judgeUserId }
            });

            const updated = await prisma.arena.findUnique({ 
                where: { id: arenaId },
                include: { 
                    participants: { include: { user: { select: { id: true, username: true, avatar: true } } } },
                    judge: { select: { id: true, username: true, avatar: true } }
                }
            });
            io.to(arena.code).emit('arena-updated', updated);
        } catch (error) {}
    });

    socket.on('start-debate', async ({ arenaId, hostId }) => {
        try {
            const arena = await prisma.arena.findUnique({ 
                where: { id: arenaId },
                include: { participants: true }
            });

            if (!arena || arena.hostId !== hostId) return;
            
            const teamA = arena.participants.some(p => p.team === 'TEAM_A');
            const teamB = arena.participants.some(p => p.team === 'TEAM_B');
            const judge = !!arena.judgeId;

            if (!teamA || !teamB || !judge) return;

            const updated = await prisma.arena.update({
                where: { id: arenaId },
                data: { status: 'ACTIVE', currentRound: 1 },
                include: { 
                    participants: { include: { user: { select: { id: true, username: true, avatar: true } } } },
                    judge: { select: { id: true, username: true, avatar: true } }
                }
            });

            await prisma.debateRound.create({
                data: { arenaId, roundNumber: 1 }
            });

            io.to(arena.code).emit('debate-started', updated);
            startTimer(io, arena.code, arenaId, updated.timerSeconds, 'TEAM_A');
        } catch (error) {}
    });

    socket.on('submit-argument', async ({ arenaId, content, userId, team }) => {
        try {
            const arena = await prisma.arena.findUnique({
                where: { id: arenaId },
                include: { rounds: { orderBy: { roundNumber: 'desc' }, take: 1 } }
            });

            const state = arenaStates.get(arena?.code || '');
            if (!arena || !state || state.activeTeam !== team) return;

            const currentRound = arena.rounds[0];
            if (!currentRound) return;

            const safeContent = sanitizeInput(content);

            await prisma.debateArgument.create({
                data: {
                    roundId: currentRound.id,
                    userId,
                    team,
                    content: safeContent
                }
            });

            stopTimer(arena.code);

            // Logic for next turn
            if (team === 'TEAM_A') {
                startTimer(io, arena.code, arenaId, arena.timerSeconds, 'TEAM_B');
            } else {
                // Round complete
                if (arena.currentRound < arena.roundCount) {
                    io.to(arena.code).emit('judge-question-prompt', { judgeId: arena.judgeId });
                    arenaStates.set(arena.code, { ...state, activeTeam: null });
                } else {
                    io.to(arena.code).emit('awaiting-verdict', { judgeId: arena.judgeId });
                    arenaStates.set(arena.code, { ...state, activeTeam: null });
                }
            }

            const updatedArena = await prisma.arena.findUnique({
                where: { id: arenaId },
                include: {
                    rounds: {
                        include: {
                            arguments: { include: { user: { select: { id: true, username: true, avatar: true } } } }
                        }
                    }
                }
            });
            io.to(arena.code).emit('argument-submitted', updatedArena);
        } catch (error) {}
    });

    socket.on('submit-judge-question', async ({ arenaId, question, userId }) => {
        try {
            const arena = await prisma.arena.findUnique({ where: { id: arenaId } });
            if (!arena || arena.judgeId !== userId) return;

            const safeQuestion = sanitizeInput(question);

            const nextRoundNum = arena.currentRound + 1;
            await prisma.arena.update({
                where: { id: arenaId },
                data: { currentRound: nextRoundNum }
            });

            const round = await prisma.debateRound.create({
                data: { arenaId, roundNumber: nextRoundNum, judgeQuestion: safeQuestion }
            });

            io.to(arena.code).emit('new-round-started', { round, roundNumber: nextRoundNum });
            startTimer(io, arena.code, arenaId, arena.timerSeconds, 'TEAM_A');
        } catch (error) {}
    });

    socket.on('submit-verdict', async ({ arenaId, winnerTeam, verdictText, userId }) => {
        try {
            const arena = await prisma.arena.findUnique({ where: { id: arenaId } });
            if (!arena || arena.judgeId !== userId) return;

            const safeVerdictText = sanitizeInput(verdictText);

            const updated = await prisma.arena.update({
                where: { id: arenaId },
                data: {
                    status: 'COMPLETED',
                    winnerTeam,
                    verdictText: safeVerdictText,
                    isArchived: true
                }
            });

            io.to(arena.code).emit('debate-ended', updated);
            arenaStates.delete(arena.code);
        } catch (error) {}
    });

    socket.on('disconnect', () => {
        // Handle disconnect logic if needed, maybe notify room
    });
};
// ... (rest of file unchanged)

const startTimer = (io: Server, code: string, arenaId: string, seconds: number, team: 'TEAM_A' | 'TEAM_B') => {
    stopTimer(code);
    
    const state: ArenaState = {
        secondsRemaining: seconds,
        activeTeam: team,
        timer: setInterval(() => {
            const currentState = arenaStates.get(code);
            if (!currentState) return;

            currentState.secondsRemaining--;
            io.to(code).emit('timer-tick', { 
                secondsRemaining: currentState.secondsRemaining,
                activeTeam: team 
            });

            if (currentState.secondsRemaining <= 0) {
                stopTimer(code);
                // Auto-submit skip logic could go here, or just wait. 
                // For now, let's just emit timeout.
                io.to(code).emit('timer-timeout', { team });
            }
        }, 1000)
    };
    
    arenaStates.set(code, state);
};

const stopTimer = (code: string) => {
    const state = arenaStates.get(code);
    if (state?.timer) {
        clearInterval(state.timer);
    }
};
