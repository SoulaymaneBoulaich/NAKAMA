import { z } from 'zod';
import { sanitizeInput } from '../utils/sanitizer.js';

export const updateMeSchema = z.object({
  body: z.object({
    bio: z.string()
      .max(500, 'Bio cannot exceed 500 characters')
      .transform(val => sanitizeInput(val))
      .optional()
      .nullable(),
    avatar: z.string().url().max(1000).optional().nullable(),
    banner: z.string().url().max(1000).optional().nullable(),
    fullName: z.string()
      .max(100, 'Full name cannot exceed 100 characters')
      .transform(val => sanitizeInput(val))
      .optional()
      .nullable(),
    phoneNumber: z.string()
      .max(20, 'Phone number cannot exceed 20 characters')
      .regex(/^[+0-9\s-]*$/, 'Invalid phone number format')
      .optional()
      .nullable(),
    location: z.string()
      .max(100, 'Location cannot exceed 100 characters')
      .transform(val => sanitizeInput(val))
      .optional()
      .nullable(),
  }),
});

export const searchUsersSchema = z.object({
  query: z.object({
    q: z.string().min(2).max(50).transform(val => sanitizeInput(val)),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});
