import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { sanitizeInput } from '../utils/sanitizer.js';
import { logger } from '../utils/logger.js';

interface ArenaState {
    timer: NodeJS.Timeout | null;
    secondsRemaining: number;
    activeTeam: 'TEAM_A' | 'TEAM_B' | 'NONE';
    arenaId: string;
}

const arenaStates = new Map<string, ArenaState>();

export const setupArenaSocket = (io: Server, socket: Socket) => {
    
    socket.on('join-arena', async ({ code, userId }) => {
        const safeCode = sanitizeInput(code).toUpperCase();
        socket.join(`arena-${safeCode}`);
        logger.info(`User ${userId} joined arena: ${safeCode}`);
        
        // Sync state to the joining user
        const arena = await prisma.debateArena.findUnique({
            where: { code: safeCode },
            include: {
                participants: { include: { user: { select: { id: true, username: true, avatar: true } } } },
                judge: { select: { id: true, username: true, avatar: true } },
                violations: { include: { participant: { include: { user: { select: { username: true } } } } } },
                rounds: { 
                    include: { 
                        arguments: { include: { user: { select: { id: true, username: true, avatar: true } } } } 
                    },
                    orderBy: { roundNumber: 'asc' }
                }
            }
        });

        if (arena) {
            socket.emit('arena-updated', arena);
            
            // If active, send current timer
            const state = arenaStates.get(safeCode);
            if (state) {
                socket.emit('timer-tick', { 
                    secondsRemaining: state.secondsRemaining,
                    activeTeam: state.activeTeam 
                });
            }
        }
    });

    socket.on('start-debate', async ({ arenaId, hostId }) => {
        const arena = await prisma.debateArena.findUnique({ where: { id: arenaId } });
        if (arena && arena.hostId === hostId) {
            // Logic handled by controller, but we can trigger timer start here if needed
            // Actually, the controller should probably be the one updating the DB and then 
            // the socket just broadcasts.
            // But since timers are in-memory, we need this.
        }
    });

    socket.on('submit-argument', async (data) => {
        // Broadcaster for real-time feed
        // The actual DB save is in the controller (via REST) or we can do it here.
        // For NAKAMA, we prefer REST for state-changes and Sockets for notifications.
        // However, for high-intensity debate, socket-submission is faster.
        // Let's assume the controller handled the DB and we just need to broadcast 'argument-submitted'.
    });

    socket.on('issue-violation', async ({ arenaId, participantId, type, severity, comment }) => {
        // Broadcast violation
        const arena = await prisma.debateArena.findUnique({ 
            where: { id: arenaId },
            select: { code: true }
        });
        if (arena) {
            const updatedArena = await prisma.debateArena.findUnique({
                where: { id: arenaId },
                include: { 
                    participants: { include: { user: true } },
                    violations: { include: { participant: { include: { user: true } } } } 
                }
            });
            io.to(`arena-${arena.code}`).emit('violation-issued', updatedArena);
        }
    });

    socket.on('grant-extra-time', async ({ arenaId, team, seconds }) => {
        const arena = await prisma.debateArena.findUnique({ where: { id: arenaId } });
        if (arena) {
            const state = arenaStates.get(arena.code);
            if (state && state.activeTeam === team) {
                state.secondsRemaining += seconds;
                io.to(`arena-${arena.code}`).emit('timer-tick', { 
                    secondsRemaining: state.secondsRemaining,
                    activeTeam: state.activeTeam 
                });
                io.to(`arena-${arena.code}`).emit('time-granted', { team, seconds });
            }
        }
    });

    // Helper to start timer from outside if needed (e.g. from controller)
    // We'll expose this via a custom event or a singleton
};

export const startArenaTimer = (io: Server, code: string, arenaId: string, seconds: number, team: 'TEAM_A' | 'TEAM_B') => {
    const room = `arena-${code.toUpperCase()}`;
    
    // Stop existing
    const existing = arenaStates.get(code);
    if (existing?.timer) clearInterval(existing.timer);

    const state: ArenaState = {
        arenaId,
        secondsRemaining: seconds,
        activeTeam: team,
        timer: setInterval(async () => {
            const currentState = arenaStates.get(code);
            if (!currentState) return;

            currentState.secondsRemaining--;
            io.to(room).emit('timer-tick', { 
                secondsRemaining: currentState.secondsRemaining,
                activeTeam: team 
            });

            if (currentState.secondsRemaining <= 0) {
                if (currentState.timer) clearInterval(currentState.timer);
                arenaStates.delete(code);
                io.to(room).emit('timer-timeout', { team });
            }
        }, 1000)
    };
    
    arenaStates.set(code, state);
};

export const stopArenaTimer = (code: string) => {
    const state = arenaStates.get(code);
    if (state?.timer) clearInterval(state.timer);
    arenaStates.delete(code);
};
