import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const createPlaylistSchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(100, 'Title cannot exceed 100 characters')
      .transform(val => sanitizeInput(val)),
    description: z.string()
      .max(500, 'Description cannot exceed 500 characters')
      .transform(val => sanitizeInput(val))
      .optional(),
    visibility: z.enum(['PRIVATE', 'SHARED', 'PUBLIC']).optional(),
  }),
});

export const updatePlaylistSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    title: z.string()
      .min(1)
      .max(100)
      .transform(val => sanitizeInput(val))
      .optional(),
    description: z.string()
      .max(500)
      .transform(val => sanitizeInput(val))
      .optional(),
    visibility: z.enum(['PRIVATE', 'SHARED', 'PUBLIC']).optional(),
    coverUrl: z.string().optional(),
  }),
});

export const addEntrySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    animeId: z.string(),
    animeTitle: z.string().transform(val => sanitizeInput(val)),
    animeCover: z.string(),
    note: z.string()
      .max(200)
      .transform(val => sanitizeInput(val))
      .optional(),
  }),
});

export const addCommentSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    content: z.string()
      .min(1)
      .max(300)
      .transform(val => sanitizeInput(val)),
  }),
});
