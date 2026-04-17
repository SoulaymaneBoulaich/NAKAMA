import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { QuizAttemptStatus } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const getQuizzes = async (_req: any, res: Response) => {
    try {
        const quizzes = await prisma.quiz.findMany({
            include: {
                _count: { select: { questions: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching quizzes' });
    }
};

export const startAttempt = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { quizId, isGauntlet } = req.body;

        const now = new Date();
        const year = now.getUTCFullYear();
        const week = getWeekNumber(now);

        if (isGauntlet) {
            // Check for existing weekly attempt
            const existing = await prisma.quizAttempt.findUnique({
                where: {
                    userId_isGauntlet_weekNumber_yearNumber: {
                        userId,
                        isGauntlet: true,
                        weekNumber: week,
                        yearNumber: year
                    }
                }
            });

            if (existing) {
                return res.status(403).json({ message: 'GAUNTLET ATTEMPT DEPLETED FOR THIS CYCLE' });
            }

            // Pick 100 random questions for Gauntlet
            const allQuestions = await prisma.question.findMany({
                   where: { difficulty: { in: ['JONIN', 'KAGE', 'LEGENDARY'] } },
                   select: { id: true }
            });
            const shuffled = allQuestions.sort(() => 0.5 - Math.random()).slice(0, 100);

            const attempt = await prisma.quizAttempt.create({
                data: {
                    userId,
                    isGauntlet: true,
                    weekNumber: week,
                    yearNumber: year,
                    status: 'IN_PROGRESS',
                    gauntletSession: {
                        create: {
                            questionIds: shuffled.map(q => q.id)
                        }
                    }
                }
            });

            return res.status(201).json(attempt);
        } else {
            // Regular quiz
            const attempt = await prisma.quizAttempt.create({
                data: {
                    userId,
                    quizId,
                    isGauntlet: false,
                    weekNumber: week,
                    yearNumber: year,
                    status: 'IN_PROGRESS'
                }
            });
            return res.status(201).json(attempt);
        }
    } catch (error) {
        logger.error('Start attempt error:', error);
        res.status(500).json({ message: 'Error starting attempt' });
    }
};

export const getNextQuestion = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const attemptId = req.params.attemptId as string;
        const userId = req.userId!;

        const attempt = await prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: { 
                quiz: { include: { questions: { orderBy: { createdAt: 'asc' } } } },
                gauntletSession: true
            }
        });

        if (!attempt || attempt.userId !== userId) {
            return res.status(404).json({ message: 'Attempt not found' });
        }

        if (attempt.status !== 'IN_PROGRESS') {
            const correctCount = await prisma.quizAnswer.count({
                where: { attemptId, isCorrect: true }
            });
            const totalCount = attempt.isGauntlet ? 100 : (attempt.quiz?.questions.length || 0);

            return res.status(200).json({ 
                status: attempt.status,
                totalScore: attempt.score,
                questionsCount: totalCount,
                accuracy: Math.round((correctCount / totalCount) * 100),
                unlockedStatus: attempt.isGauntlet && attempt.status === 'COMPLETED' ? (attempt.mistakes === 0 ? 'NAKAMA_LEADER' : 'ULTRA_NAKAMA') : null
            });
        }

        let question;
        if (attempt.isGauntlet) {
            const questionIds = (attempt as any).gauntletSession?.questionIds as string[];
            const questionId = questionIds[attempt.currentQuestion];
            if (!questionId) return res.status(200).json({ completed: true });
            
            question = await prisma.question.findUnique({ where: { id: questionId } });
        } else {
            question = (attempt as any).quiz?.questions[attempt.currentQuestion];
        }

        if (!question) {
            return res.status(200).json({ completed: true });
        }

        // Strip correct answer
        const { correctAnswer, ...safeQuestion } = question as any;
        res.status(200).json({ ...safeQuestion, currentIndex: attempt.currentQuestion, total: attempt.isGauntlet ? 100 : ((attempt as any).quiz?.questions.length || 0) });
    } catch (error) {
        logger.error('getNextQuestion error:', { error, attemptId: req.params.attemptId });
        res.status(500).json({ message: 'Error fetching question' });
    }
};

export const submitAnswer = async (req: AuthenticatedRequest, res: Response) => {
    const startTime = performance.now();
    try {
        const attemptId = req.params.attemptId as string;
        const { questionId, answer, timeSpent } = req.body;
        const userId = req.userId!;

        const attempt = await prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: { 
                gauntletSession: true,
                quiz: { include: { questions: true } }
            }
        });

        if (!attempt || attempt.userId !== userId || attempt.status !== 'IN_PROGRESS') {
            return res.status(404).json({ message: 'Active attempt not found' });
        }

        const question = await prisma.question.findUnique({ where: { id: questionId } });
        if (!question) return res.status(404).json({ message: 'Question not found' });

        const isCorrect = question.correctAnswer === answer;
        const points = isCorrect ? Math.max(0, question.pointsBase - Math.floor(timeSpent)) : 0;

        await prisma.quizAnswer.create({
            data: {
                attemptId,
                questionId,
                selectedAnswer: answer,
                isCorrect,
                timeSpentSeconds: timeSpent,
                pointsEarned: points
            }
        });

        // UPDATE QUESTION STATS
        await updateQuestionStats(questionId, isCorrect, timeSpent);

        const newMistakes = attempt.mistakes + (isCorrect ? 0 : 1);
        const newScore = attempt.score + points;
        const newCount = attempt.currentQuestion + 1;

        // Check for fail conditions (Gauntlet: > 5 mistakes)
        let newStatus: QuizAttemptStatus = 'IN_PROGRESS';
        if (attempt.isGauntlet && newMistakes > 5) {
            newStatus = 'FAILED';
        }

        // Check for completion
        const total = attempt.isGauntlet ? 100 : ((attempt as any).quiz?.questions.length || 0);
        if (newCount >= total && newStatus === 'IN_PROGRESS') {
            newStatus = 'COMPLETED';
        }

        const updated = await prisma.quizAttempt.update({
            where: { id: attemptId },
            data: {
                currentQuestion: newCount,
                score: newScore,
                mistakes: newMistakes,
                totalAnswered: newCount,
                status: newStatus,
                completedAt: newStatus !== 'IN_PROGRESS' ? new Date() : null
            }
        });

        // HANDLE COMPLETION LOGIC (Badges, Hall of Fame)
        if (newStatus === 'COMPLETED' || newStatus === 'FAILED') {
            await handleCompletion(updated);
        }

        const duration = performance.now() - startTime;
        logger.info(`Quiz answer submitted in ${duration.toFixed(2)}ms`, {
            attemptId,
            userId,
            duration,
        });

        res.status(200).json({ 
            isCorrect, 
            correctAnswer: isCorrect ? null : question.correctAnswer,
            points,
            status: newStatus 
        });

    } catch (error) {
        logger.error('submitAnswer error:', { error, attemptId: req.params.attemptId, questionId: req.body.questionId });
        res.status(500).json({ message: 'Error submitting answer' });
    }
};

async function handleCompletion(attempt: any) {
    try {
        // 1. Update Leaderboard
        await prisma.quizLeaderboard.create({
            data: {
                userId: attempt.userId,
                quizId: attempt.quizId,
                isGauntlet: attempt.isGauntlet,
                score: attempt.score,
                correctAnswers: attempt.totalAnswered - attempt.mistakes,
                mistakes: attempt.mistakes,
                weekNumber: attempt.weekNumber,
                yearNumber: attempt.yearNumber
            }
        });

        // 2. Gauntlet specific rewards
        if (attempt.isGauntlet && attempt.status === 'COMPLETED') {
            const isPerfect = attempt.mistakes === 0;

            // Add to Hall of Fame
            await prisma.gauntletHallOfFame.create({
                data: {
                    userId: attempt.userId,
                    attemptId: attempt.id,
                    score: attempt.score,
                    mistakes: attempt.mistakes,
                    isPerfect
                }
            });

            // Update User Status
            if (isPerfect) {
                await prisma.user.update({
                    where: { id: attempt.userId },
                    data: {
                        isNakamaLeader: true,
                        nakamaLeaderSince: new Date()
                    }
                });
            } else if (attempt.mistakes <= 5) {
                const expires = new Date();
                expires.setUTCDate(expires.getUTCDate() + 7); // 1 week duration
                await prisma.user.update({
                    where: { id: attempt.userId },
                    data: {
                        isUltraNakama: true,
                        ultraNakamaExpiresAt: expires
                    }
                });
            }
        }
    } catch (error) {
        logger.error('Quiz handleCompletion error:', error);
    }
}

function getWeekNumber(d: Date) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return weekNo;
}

export const getHallOfFame = async (_req: any, res: Response) => {
    try {
        const hall = await prisma.gauntletHallOfFame.findMany({
            include: {
                user: { select: { username: true, avatar: true, id: true } }
            },
            orderBy: [
                { isPerfect: 'desc' },
                { score: 'desc' }
            ],
            take: 20
        });
        res.status(200).json(hall);
    } catch (error) {
        logger.error('getHallOfFame error:', error);
        res.status(500).json({ message: 'Error fetching Hall of Fame' });
    }
};

export const getHallOfShame = async (_req: any, res: Response) => {
    try {
        // Questions with > 20 attempts and lowest accuracy
        const shame = await prisma.questionStats.findMany({
            where: {
                totalServed: { gt: 10 }
            },
            include: {
                question: {
                    select: {
                        id: true,
                        questionText: true,
                        difficulty: true,
                        animeReference: true,
                        type: true
                    }
                }
            },
            orderBy: { accuracyRate: 'asc' },
            take: 10
        });
        res.status(200).json(shame);
    } catch (error) {
        logger.error('getHallOfShame error:', error);
        res.status(500).json({ message: 'Error fetching Hall of Shame' });
    }
};

export async function updateQuestionStats(questionId: string, isCorrect: boolean, timeSpent: number) {
    try {
        const stats = await prisma.questionStats.findUnique({ where: { questionId } });
        if (!stats) {
            await prisma.questionStats.create({
                data: {
                    questionId,
                    totalServed: 1,
                    totalCorrect: isCorrect ? 1 : 0,
                    accuracyRate: isCorrect ? 1.0 : 0.0,
                    avgTimeSeconds: timeSpent
                }
            });
        } else {
            const newTotal = stats.totalServed + 1;
            const newCorrect = stats.totalCorrect + (isCorrect ? 1 : 0);
            const newAvgTime = (stats.avgTimeSeconds * stats.totalServed + timeSpent) / newTotal;
            
            await prisma.questionStats.update({
                where: { questionId },
                data: {
                    totalServed: newTotal,
                    totalCorrect: newCorrect,
                    accuracyRate: newCorrect / newTotal,
                    avgTimeSeconds: newAvgTime
                }
            });

            // LOGIC: DYNAMIC DIFFICULTY ADJUSTMENT
            // If accuracy < 20% and not yet LEGENDARY -> move up?
            // Actually, usually we just flag them for review or keep stats.
        }
    } catch (error) {
        logger.error('Update stats error:', error);
    }
}
