import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().email(),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

export const loginSchema = z.object({
  body: z.object({
    emailOrUsername: z.string().min(1),
    password: z.string().min(1),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
  body: z.object({
    password: z.string().min(8).max(100),
  }),
});
