import { z } from 'zod';

export const startQuizSchema = z.object({
  body: z.object({
    quizId: z.string().cuid('Invalid quiz ID'),
    isGauntlet: z.boolean().optional().default(false),
  }),
});

export const submitAnswerSchema = z.object({
  params: z.object({
    attemptId: z.string().cuid('Invalid attempt ID'),
  }),
  body: z.object({
    questionId: z.string().cuid('Invalid question ID'),
    answer: z.string().min(1, 'Answer is required'),
    timeSpent: z.number().min(0).max(300),
  }),
});

export const submitQuestionSchema = z.object({
  body: z.object({
    type: z.enum(['QA', 'SCREENSHOT', 'AUDIO', 'QUOTE', 'VOICE']),
    difficulty: z.enum(['GENIN', 'CHUNIN', 'JONIN', 'KAGE', 'LEGENDARY']),
    questionText: z.string().min(1, 'Question text is required').max(500),
    mediaUrl: z.string().url('Invalid media URL').optional().or(z.literal('')),
    mediaType: z.enum(['IMAGE', 'AUDIO', 'VIDEO']).optional(),
    options: z.array(z.string().min(1).max(200)).min(1, 'At least one option is required'),
    correctAnswer: z.string().min(1, 'Correct answer is required'),
    animeReference: z.string().min(1, 'Anime reference is required').max(100),
    timeLimitSeconds: z.number().int().min(5).max(60).default(15),
    communityId: z.string().cuid().optional(),
  }),
});

export const voteSubmissionSchema = z.object({
  params: z.object({
    submissionId: z.string().cuid('Invalid submission ID'),
  }),
  body: z.object({
    vote: z.enum(['APPROVE', 'REJECT']),
  }),
});
