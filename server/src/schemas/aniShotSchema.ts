import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const createAniShotSchema = z.object({
  body: z.object({
    content: z.string()
      .max(200, 'Content cannot exceed 200 characters')
      .transform(val => sanitizeInput(val))
      .optional()
      .nullable(),
    mediaUrl: z.string().max(1000).optional().nullable(),
    animeId: z.union([z.string(), z.number()]).optional().nullable(),
    animeTitle: z.string().transform(val => sanitizeInput(val)).optional().nullable(),
    animeCover: z.string().optional().nullable(),
    type: z.enum(['THOUGHT', 'WATCHING', 'COMPLETED', 'DROPPED', 'HYPE']).optional(),
  }),
});
