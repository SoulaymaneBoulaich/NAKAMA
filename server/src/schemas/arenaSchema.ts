import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const createArenaSchema = z.object({
  body: z.object({
    title: z.string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title cannot exceed 100 characters')
      .transform(val => sanitizeInput(val)),
    topic: z.string()
      .min(3, 'Topic must be at least 3 characters')
      .max(500, 'Topic cannot exceed 500 characters')
      .transform(val => sanitizeInput(val)),
    roundCount: z.number().min(1).max(10).optional(),
    timeLimitPerRound: z.number().min(30).max(600).optional(),
    totalTimeLimit: z.number().min(60).max(3600).optional(),
    maxDebaters: z.number().min(2).max(12).optional(),
    format: z.enum(['TEAMS', 'INDIVIDUALS']).optional(),
    strictRules: z.array(z.string()).optional(),
  }),
});
