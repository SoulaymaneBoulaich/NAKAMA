import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const submitQuestionSchema = z.object({
  body: z.object({
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'ORDERING', 'IMAGE_GUESS']),
    difficulty: z.enum(['GENIN', 'CHUNIN', 'JONIN', 'KAGE', 'HOKAGE']),
    questionText: z.string()
      .min(5, 'Question text is too short')
      .max(500, 'Question text is too long')
      .transform(val => sanitizeInput(val)),
    mediaUrl: z.string().max(1000).optional(),
    mediaType: z.enum(['IMAGE', 'VIDEO', 'NONE']).optional(),
    options: z.array(z.string().max(200).transform(val => sanitizeInput(val))).optional(),
    correctAnswer: z.string()
      .min(1)
      .max(200)
      .transform(val => sanitizeInput(val)),
    animeReference: z.string()
      .max(100)
      .transform(val => sanitizeInput(val))
      .optional(),
    timeLimitSeconds: z.number().min(5).max(60).optional(),
    communityId: z.string().optional(),
  }),
});

export const voteOnSubmissionSchema = z.object({
  params: z.object({
    submissionId: z.string().cuid(),
  }),
  body: z.object({
    vote: z.enum(['APPROVE', 'REJECT']),
  }),
});
