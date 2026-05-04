import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const createEntrySchema = z.object({
  body: z.object({
    animeId: z.union([z.string(), z.number()]),
    status: z.enum(['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH']),
    episodeProgress: z.number().min(0).optional(),
  }),
});

export const updateEntrySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    status: z.enum(['WATCHING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_WATCH']).optional(),
    episodeProgress: z.number().min(0).optional(),
    rewatchCount: z.number().min(0).optional(),
    startDate: z.string().datetime().optional().nullable(),
    endDate: z.string().datetime().optional().nullable(),
    privateNotes: z.string()
      .max(1000, 'Notes cannot exceed 1000 characters')
      .transform(val => sanitizeInput(val))
      .optional()
      .nullable(),
  }),
});
