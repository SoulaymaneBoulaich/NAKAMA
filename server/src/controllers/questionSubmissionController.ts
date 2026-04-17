import type { Response } from 'express';
import { prisma } from '../lib/prisma.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { Prisma } from '@prisma/client';
import type { QuizType, QuizDifficulty, MediaType, SubmissionStatus, SubmissionVoteType } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const submitQuestion = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { 
            type, 
            difficulty, 
            questionText, 
            mediaUrl, 
            mediaType, 
            options, 
            correctAnswer, 
            animeReference, 
            timeLimitSeconds,
            communityId 
        } = req.body;


        const submission = await prisma.questionSubmission.create({
            data: {
                submittedBy: userId,
                type: type as QuizType,
                difficulty: difficulty as QuizDifficulty,
                questionText,
                mediaUrl,
                mediaType: mediaType as MediaType,
                options,
                correctAnswer,
                animeReference,
                timeLimitSeconds: timeLimitSeconds || 15,
                communityId,
                status: 'PENDING'
            }
        });

        res.status(201).json(submission);
    } catch (error) {
        logger.error('Submit question error:', error);
        res.status(500).json({ message: 'Error submitting question' });
    }
};

export const getPendingSubmissions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        
        // Fetch submissions the user hasn't voted on yet
        const submissions = await prisma.questionSubmission.findMany({
            where: {
                status: 'PENDING',
                submittedBy: { not: userId }, // Don't vote on own
                votes: {
                    none: { userId }
                }
            },
            include: {
                user: { select: { username: true, avatar: true } }
            },
            take: 20,
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching submissions' });
    }
};

export const voteOnSubmission = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const submissionId = req.params.submissionId as string;
        const { vote } = req.body; // APPROVE or REJECT

        // Check if already voted
        const existingVote = await prisma.submissionVote.findUnique({
            where: {
                submissionId_userId: { submissionId, userId }
            }
        });

        if (existingVote) {
            return res.status(400).json({ message: 'Already voted on this submission' });
        }

        const voteValue = vote as SubmissionVoteType;

        // Perform vote and check threshold in a transaction
        const result = await prisma.$transaction(async (tx) => {
            const v = await tx.submissionVote.create({
                data: { submissionId, userId, vote: voteValue }
            });

            // Update vote counts
            const submission = await tx.questionSubmission.update({
                where: { id: submissionId },
                data: {
                    approvalVotes: voteValue === 'APPROVE' ? { increment: 1 } : undefined,
                    rejectionVotes: voteValue === 'REJECT' ? { increment: 1 } : undefined
                }
            });

            // Threshold Check: 10 Approvals -> AUTO APPROVE
            if (submission.approvalVotes >= 10 && submission.status === 'PENDING') {
                const updated = await tx.questionSubmission.update({
                    where: { id: submissionId },
                    data: { status: 'APPROVED', reviewedAt: new Date() }
                });

                // Create the actual Question
                const question = await tx.question.create({
                    data: {
                        type: updated.type,
                        difficulty: updated.difficulty,
                        questionText: updated.questionText,
                        mediaUrl: updated.mediaUrl,
                        mediaType: updated.mediaType,
                        options: updated.options,
                        correctAnswer: updated.correctAnswer,
                        animeReference: updated.animeReference,
                        timeLimitSeconds: updated.timeLimitSeconds,
                        pointsBase: updated.difficulty === 'GENIN' ? 100 : updated.difficulty === 'CHUNIN' ? 250 : updated.difficulty === 'JONIN' ? 500 : updated.difficulty === 'KAGE' ? 1000 : 2500,
                        stats: {
                            create: {
                                totalServed: 0,
                                totalCorrect: 0
                            }
                        }
                    }
                });

                // Update QuizArchitect Badge for creator
                await checkQuizArchitectBadge(updated.submittedBy, tx);

                return { vote: v, status: 'APPROVED', questionId: question.id };
            }

            // Threshold Check: 5 Rejections -> AUTO REJECT
            if (submission.rejectionVotes >= 5 && submission.status === 'PENDING') {
                await tx.questionSubmission.update({
                    where: { id: submissionId },
                    data: { status: 'REJECTED', reviewedAt: new Date() }
                });
                return { vote: v, status: 'REJECTED' };
            }

            return { vote: v, status: 'PENDING' };
        });

        res.status(200).json(result);
    } catch (error) {
        logger.error('Vote error:', { error, submissionId: req.params.submissionId, userId: req.userId });
        res.status(500).json({ message: 'Error processing vote' });
    }
};

async function checkQuizArchitectBadge(userId: string, tx: Prisma.TransactionClient) {
    const approvedCount = await tx.questionSubmission.count({
        where: { submittedBy: userId, status: 'APPROVED' }
    });

    const badge = await tx.quizArchitectBadge.findUnique({ where: { userId } });

    if (!badge && approvedCount >= 5) {
        await tx.quizArchitectBadge.create({
            data: {
                userId,
                title: 'Quiz Architect',
                level: 1,
                questionsApproved: approvedCount
            }
        });
        
        // Push notification
        await tx.notification.create({
            data: {
                userId,
                type: 'BADGE_EARNED',
                message: 'You have earned the "Quiz Architect" badge! Your questions are now part of NAKAMA.',
                referenceId: 'QUIZ_ARCHITECT'
            }
        });
    } else if (badge) {
        await tx.quizArchitectBadge.update({
            where: { userId },
            data: { questionsApproved: approvedCount }
        });
    }
}

export const getMySubmissions = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const submissions = await prisma.questionSubmission.findMany({
            where: { submittedBy: userId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your submissions' });
    }
};
