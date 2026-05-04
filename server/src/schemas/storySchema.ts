import { z } from 'zod';
import { sanitizeInput, sanitizeRichText } from '../utils/sanitizer.js';

export const createStorySchema = z.object({
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(200, 'Title cannot exceed 200 characters')
      .transform(val => sanitizeInput(val)),
    description: z.string()
      .min(1, 'Description is required')
      .max(5000, 'Description cannot exceed 5000 characters')
      .transform(val => sanitizeRichText(val)),
    tags: z.any().optional(), // Handled in controller (JSON.parse or array)
    status: z.enum(['ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED']).optional(),
  }),
});

export const updateStorySchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid story ID'),
  }),
  body: z.object({
    title: z.string().max(200).transform(val => sanitizeInput(val)).optional(),
    description: z.string().max(5000).transform(val => sanitizeRichText(val)).optional(),
    tags: z.any().optional(),
    status: z.enum(['ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED']).optional(),
    isPublished: z.any().optional(),
    coverUrl: z.string().optional(),
  }),
});

export const createChapterSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid story ID'),
  }),
  body: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(200, 'Title cannot exceed 200 characters')
      .transform(val => sanitizeInput(val)),
    content: z.string()
      .min(1, 'Content is required')
      .max(50000, 'Chapter content cannot exceed 50000 characters')
      .transform(val => sanitizeRichText(val)),
    chapterNumber: z.number().int().optional(),
  }),
});

export const updateChapterSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid story ID'),
    chapterId: z.string().cuid('Invalid chapter ID'),
  }),
  body: z.object({
    title: z.string().max(200).transform(val => sanitizeInput(val)).optional(),
    content: z.string().max(50000).transform(val => sanitizeRichText(val)).optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const rateStorySchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid story ID'),
  }),
  body: z.object({
    score: z.number().min(1).max(10),
    review: z.string().max(1000).transform(val => sanitizeInput(val)).optional(),
  }),
});

export const addChapterCommentSchema = z.object({
  params: z.object({
    id: z.string().cuid('Invalid story ID'),
    chapterId: z.string().cuid('Invalid chapter ID'),
  }),
  body: z.object({
    content: z.string()
      .min(1, 'Comment is required')
      .max(500, 'Comment cannot exceed 500 characters')
      .transform(val => sanitizeInput(val)),
  }),
});
