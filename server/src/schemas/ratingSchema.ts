import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const upsertRatingSchema = z.object({
  body: z.object({
    animeId: z.union([z.string(), z.number()]),
    animation: z.number().min(0).max(10).optional(),
    characters: z.number().min(0).max(10).optional(),
    buildUp: z.number().min(0).max(10).optional(),
    story: z.number().min(0).max(10).optional(),
    feeling: z.number().min(0).max(10).optional(),
    ending: z.number().min(0).max(10).optional(),
    review: z.string()
      .max(2000, 'Review cannot exceed 2000 characters')
      .transform(val => sanitizeInput(val))
      .optional()
      .nullable(),
  }),
});
