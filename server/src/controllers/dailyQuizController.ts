import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const getDailyQuestion = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let daily = await prisma.dailyQuestion.findUnique({
            where: { date: today },
            include: {
                question: {
                    select: {
                        id: true,
                        type: true,
                        difficulty: true,
                        questionText: true,
                        mediaUrl: true,
                        mediaType: true,
                        options: true,
                        animeReference: true,
                        timeLimitSeconds: true
                    }
                }
            }
        });

        // If no daily question exists yet, trigger rotation immediately (fail-safe)
        if (!daily) {
            await rotateDailyQuestion();
            daily = await prisma.dailyQuestion.findUnique({
                where: { date: today },
                include: { question: true }
            });
        }

        if (!daily) return res.status(404).json({ message: 'No daily question found' });

        // Check if user already answered
        const answered = await prisma.dailyAnswer.findUnique({
            where: {
                dailyQuestionId_userId: {
                    dailyQuestionId: daily.id,
                    userId
                }
            }
        });

        res.status(200).json({
            ...daily,
            isAnswered: !!answered,
            userAnswer: answered?.isCorrect === undefined ? null : { isCorrect: answered.isCorrect }
        });
    } catch (error) {
        console.error('Get daily error:', error);
        res.status(500).json({ message: 'Error fetching daily question' });
    }
};

export const submitDailyAnswer = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { dailyQuestionId, answer } = req.body;

        const daily = await prisma.dailyQuestion.findUnique({
            where: { id: dailyQuestionId },
            include: { question: true }
        });

        if (!daily) return res.status(404).json({ message: 'Daily question not found' });

        // Check already answered
        const existing = await prisma.dailyAnswer.findUnique({
            where: {
                dailyQuestionId_userId: { dailyQuestionId, userId }
            }
        });

        if (existing) return res.status(400).json({ message: 'Daily question already attempted' });

        const isCorrect = daily.question.correctAnswer === answer;
        const points = isCorrect ? 500 : 0; // Fixed high points for daily

        const result = await prisma.$transaction(async (tx) => {
            const daoAnswer = await tx.dailyAnswer.create({
                data: {
                    dailyQuestionId,
                    userId,
                    isCorrect,
                    pointsEarned: points
                }
            });

            // Update Global Stats
            await tx.dailyQuestion.update({
                where: { id: dailyQuestionId },
                data: {
                    totalAttempts: { increment: 1 },
                    correctAttempts: isCorrect ? { increment: 1 } : undefined
                }
            });

            // Update Streak
            await updateStreak(userId, isCorrect, tx);

            return daoAnswer;
        });

        res.status(200).json({ 
            isCorrect, 
            correctAnswer: isCorrect ? null : daily.question.correctAnswer,
            points 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting daily answer' });
    }
};

async function updateStreak(userId: string, isCorrect: boolean, tx: any) {
    const streak = await tx.userStreak.findUnique({ where: { userId } });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isCorrect) {
        // Reset streak on failure? Usually, daily questions only count IF answered.
        // If wrong, streak is interrupted.
        if (streak) {
            await tx.userStreak.update({
                where: { userId },
                data: { currentStreak: 0, lastAnsweredDate: today }
            });
        } else {
            await tx.userStreak.create({
                data: { userId, currentStreak: 0, lastAnsweredDate: today }
            });
        }
        return;
    }

    if (!streak) {
        await tx.userStreak.create({
            data: {
                userId,
                currentStreak: 1,
                longestStreak: 1,
                lastAnsweredDate: today
            }
        });
    } else {
        const lastDate = streak.lastAnsweredDate ? new Date(streak.lastAnsweredDate) : null;
        if (lastDate) lastDate.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let newCurrent = streak.currentStreak;
        if (lastDate && lastDate.getTime() === yesterday.getTime()) {
            newCurrent += 1;
        } else if (lastDate && lastDate.getTime() === today.getTime()) {
            // Already answered today, shouldn't happen due to transaction/unique constraint
        } else {
            // Streak broken
            newCurrent = 1;
        }

        await tx.userStreak.update({
            where: { userId },
            data: {
                currentStreak: newCurrent,
                longestStreak: Math.max(newCurrent, streak.longestStreak),
                lastAnsweredDate: today
            }
        });
    }
}

export async function rotateDailyQuestion() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Pick a random approved question that hasn't been a daily recently
    // (Simplification: pick any random question for now)
    const count = await prisma.question.count();
    const skip = Math.floor(Math.random() * count);
    const question = await prisma.question.findFirst({
        skip
    });

    if (question) {
        await prisma.dailyQuestion.upsert({
            where: { date: today },
            update: { questionId: question.id },
            create: {
                date: today,
                questionId: question.id
            }
        });
    }
}

export const getUserStreak = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const streak = await prisma.userStreak.findUnique({ where: { userId } });
        res.status(200).json(streak || { currentStreak: 0, longestStreak: 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching streak' });
    }
};
