import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma.js';
import { calculateElo } from '../utils/elo.js';
import { updateQuestionStats } from '../controllers/quizController.js';

interface BattleQueueItem {
    socketId: string;
    userId: string;
    username: string;
    avatar?: string;
}

interface BattleState {
    battleId: string;
    questions: any[];
    currentQuestionIndex: number;
    participants: {
        userId: string;
        socketId: string;
        score: number;
        answers: any[];
    }[];
    timer: NodeJS.Timeout | null;
}

const queue: BattleQueueItem[] = [];
const activeBattles = new Map<string, BattleState>();

export const setupBattleSocket = (io: Server, socket: Socket) => {
    socket.on('join-battle-queue', async ({ userId, username, avatar }) => {
        // Prevent duplicate queue entries
        if (queue.find(item => item.userId === userId)) return;

        queue.push({ socketId: socket.id, userId, username, avatar });
        console.log(`[Queue] User ${username} joined. Queue size: ${queue.length}`);

        // Try to match
        if (queue.length >= 2) {
            const player1 = queue.shift()!;
            const player2 = queue.shift()!;
            await startBattle(io, player1, player2);
        }
    });

    socket.on('leave-battle-queue', ({ userId }) => {
        const index = queue.findIndex(item => item.userId === userId);
        if (index !== -1) queue.splice(index, 1);
    });

    socket.on('submit-battle-answer', async ({ battleId, userId, questionId, answer, responseTime }) => {
        const battle = activeBattles.get(battleId);
        if (!battle) return;

        const participant = battle.participants.find(p => p.userId === userId);
        if (!participant) return;

        // Prevent double submissions for same question
        if (participant.answers.find(a => a.questionId === questionId)) return;

        const currentQuestion = battle.questions[battle.currentQuestionIndex];
        const isCorrect = currentQuestion.correctAnswer === answer;
        const points = isCorrect ? Math.max(10, Math.floor(100 - (responseTime * 5))) : 0;

        participant.score += points;
        participant.answers.push({ questionId, isCorrect, responseTime, points });

        // Emit update to both
        io.to(battleId).emit('battle-score-update', {
            userId,
            score: participant.score,
            isCorrect
        });

        // Update Question Stats (Async)
        updateQuestionStats(questionId, isCorrect, responseTime).catch(err => 
            console.error('Battle stats update error:', err)
        );

        // Check if both answered current question
        const allAnswered = battle.participants.every(p => p.answers.length > battle.currentQuestionIndex);
        if (allAnswered) {
            moveToNextQuestion(io, battleId);
        }
    });

    socket.on('disconnect', () => {
        const index = queue.findIndex(item => item.socketId === socket.id);
        if (index !== -1) queue.splice(index, 1);
        
        // Handle mid-battle disconnect (simplified: other player wins)
        // In a real app, you'd add a 30s reconnect window.
    });
};

async function startBattle(io: Server, p1: BattleQueueItem, p2: BattleQueueItem) {
    try {
        // 1. Fetch 10 random approved questions
        const questions = await prisma.question.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' } // Randomize in production ideally
        });

        const battleCode = `BATTLE-${Math.random().toString(36).substring(7).toUpperCase()}`;

        // 2. Create Battle in DB
        const battle = await prisma.quizBattle.create({
            data: {
                code: battleCode,
                questions: questions.map(q => q.id),
                participants: {
                    create: [
                        { userId: p1.userId },
                        { userId: p2.userId }
                    ]
                }
            },
            include: { participants: true }
        });

        // 3. Initialize Memory State
        const battleState: BattleState = {
            battleId: battle.id,
            questions,
            currentQuestionIndex: 0,
            participants: [
                { userId: p1.userId, socketId: p1.socketId, score: 0, answers: [] },
                { userId: p2.userId, socketId: p2.socketId, score: 0, answers: [] }
            ],
            timer: null
        };

        activeBattles.set(battle.id, battleState);

        // 4. Force sockets into room
        const s1 = io.sockets.sockets.get(p1.socketId);
        const s2 = io.sockets.sockets.get(p2.socketId);
        s1?.join(battle.id);
        s2?.join(battle.id);

        io.to(battle.id).emit('match-found', {
            battleId: battle.id,
            opponent: {
                p1: { username: p1.username, avatar: p1.avatar },
                p2: { username: p2.username, avatar: p2.avatar }
            },
            firstQuestion: questions[0]
        });

        // Start safety timer for first question
        startQuestionTimer(io, battle.id);

    } catch (error) {
        console.error('Battle initialization error:', error);
    }
}

function moveToNextQuestion(io: Server, battleId: string) {
    const battle = activeBattles.get(battleId);
    if (!battle) return;

    if (battle.timer) clearTimeout(battle.timer);

    battle.currentQuestionIndex++;

    if (battle.currentQuestionIndex >= battle.questions.length) {
        endBattle(io, battleId);
    } else {
        io.to(battleId).emit('next-question', {
            question: battle.questions[battle.currentQuestionIndex],
            index: battle.currentQuestionIndex
        });
        startQuestionTimer(io, battleId);
    }
}

function startQuestionTimer(io: Server, battleId: string) {
    const battle = activeBattles.get(battleId);
    if (!battle) return;

    battle.timer = setTimeout(() => {
        // Auto-fail for those who didn't answer
        battle.participants.forEach(p => {
            if (p.answers.length <= battle.currentQuestionIndex) {
                p.answers.push({ questionId: battle.questions[battle.currentQuestionIndex].id, isCorrect: false, responseTime: 20, points: 0 });
            }
        });
        moveToNextQuestion(io, battleId);
    }, 22000); // 20s + buffer
}

async function endBattle(io: Server, battleId: string) {
    const battle = activeBattles.get(battleId);
    if (!battle) return;

    try {
        const p1Data = battle.participants[0];
        const p2Data = battle.participants[1];

        if (!p1Data || !p2Data) return;

        // Fetch current ELOs
        const [elo1, elo2] = await Promise.all([
            prisma.playerELO.upsert({ where: { userId: p1Data.userId }, update: {}, create: { userId: p1Data.userId } }),
            prisma.playerELO.upsert({ where: { userId: p2Data.userId }, update: {}, create: { userId: p2Data.userId } })
        ]);

        // Calculate Result (1 = win, 0.5 = draw, 0 = loss)
        let score1 = 0.5;
        if (p1Data.score > p2Data.score) score1 = 1;
        else if (p1Data.score < p2Data.score) score1 = 0;

        const eloResults = calculateElo(elo1.rating, elo2.rating, score1);

        // Update DB
        const winnerId = score1 === 1 ? p1Data.userId : score1 === 0 ? p2Data.userId : null;
        
        await prisma.$transaction([
            prisma.quizBattle.update({
                where: { id: battleId },
                data: { status: 'ENDED' }
            }),
            prisma.quizBattleParticipant.update({
                where: { battleId_userId: { battleId, userId: p1Data.userId } },
                data: { score: p1Data.score }
            }),
            prisma.quizBattleParticipant.update({
                where: { battleId_userId: { battleId, userId: p2Data.userId } },
                data: { score: p2Data.score }
            }),
            prisma.playerELO.update({
                where: { userId: p1Data.userId },
                data: { 
                    rating: eloResults.newRatingA,
                    wins: { increment: score1 === 1 ? 1 : 0 },
                    losses: { increment: score1 === 0 ? 1 : 0 },
                    draws: { increment: score1 === 0.5 ? 1 : 0 }
                }
            }),
            prisma.playerELO.update({
                where: { userId: p2Data.userId },
                data: { 
                    rating: eloResults.newRatingB,
                    wins: { increment: score1 === 0 ? 1 : 0 },
                    losses: { increment: score1 === 1 ? 1 : 0 },
                    draws: { increment: score1 === 0.5 ? 1 : 0 }
                }
            })
        ]);

        io.to(battleId).emit('battle-finished', {
            winnerId,
            p1: { userId: p1Data.userId, score: p1Data.score, ratingChange: eloResults.changeA, newRating: eloResults.newRatingA },
            p2: { userId: p2Data.userId, score: p2Data.score, ratingChange: eloResults.changeB, newRating: eloResults.newRatingB }
        });

        activeBattles.delete(battleId);
    } catch (error) {
        console.error('End battle calculation error:', error);
    }
}
