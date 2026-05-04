import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const createPostSchema = z.object({
  body: z.object({
    content: z.string()
      .min(1, 'Content is required')
      .max(2000, 'Post content cannot exceed 2000 characters')
      .transform(val => sanitizeInput(val)),
    communityId: z.string().cuid().optional().nullable(),
    animeId: z.string().optional().nullable(),
  }),
});

export const createCommentSchema = z.object({
  params: z.object({
    postId: z.string().cuid('Invalid post ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Content is required')
      .max(1000, 'Comment cannot exceed 1000 characters')
      .transform(val => sanitizeInput(val)),
  }),
});
