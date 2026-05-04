import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const createArenaSchema = z.object({
  body: z.object({
    topic: z.string()
      .min(3, 'Topic must be at least 3 characters')
      .max(200, 'Topic cannot exceed 200 characters')
      .transform(val => sanitizeInput(val)),
    roundCount: z.number().refine(val => [3, 5, 7].includes(val), {
      message: 'Round count must be 3, 5, or 7',
    }),
    timerSeconds: z.number().refine(val => [60, 120, 180].includes(val), {
      message: 'Timer must be 60, 120, or 180 seconds',
    }),
  }),
});
