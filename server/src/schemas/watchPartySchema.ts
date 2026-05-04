import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const createPartySchema = z.object({
  body: z.object({
    animeId: z.any(),
    animeTitle: z.string().max(300).transform(val => sanitizeInput(val)),
    animeCover: z.string().max(1000).transform(val => sanitizeInput(val)).optional(),
    isPrivate: z.boolean().optional(),
    maxParticipants: z.number().min(2).max(100).optional(),
    episodeNumber: z.number().optional(),
  }),
});

export const updatePartyStateSchema = z.object({
  params: z.object({
    code: z.string().length(6),
  }),
  body: z.object({
    status: z.enum(['WAITING', 'WATCHING', 'PAUSED', 'ENDED']).optional(),
    currentTime: z.number().optional(),
    episode: z.number().optional(),
  }),
});
