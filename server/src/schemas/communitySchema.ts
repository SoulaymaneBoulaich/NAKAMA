import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const createCommunitySchema = z.object({
  body: z.object({
    name: z.string()
      .min(3, 'Name must be at least 3 characters')
      .max(50, 'Name cannot exceed 50 characters')
      .transform(val => sanitizeInput(val)),
    description: z.string()
      .max(1000, 'Description cannot exceed 1000 characters')
      .transform(val => sanitizeInput(val))
      .optional(),
    category: z.string().optional(),
    bannerUrl: z.string().optional(),
    avatarUrl: z.string().optional(),
    rules: z.array(z.string().max(500).transform(val => sanitizeInput(val))).optional(),
  }),
});

export const updateCommunitySchema = z.object({
  params: z.object({
    slug: z.string(),
  }),
  body: z.object({
    description: z.string()
      .max(1000)
      .transform(val => sanitizeInput(val))
      .optional(),
    category: z.string().optional(),
    bannerUrl: z.string().optional(),
    avatarUrl: z.string().optional(),
    rules: z.array(z.string().max(500).transform(val => sanitizeInput(val))).optional(),
  }),
});
