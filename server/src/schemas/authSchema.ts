import { z } from 'zod';

// Basic field schemas to be reused
const usernameSchema = z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');
const emailSchema = z.string().email();
const passwordSchema = z.string().min(8).max(100);

export const signupSchema = z.object({
  body: z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
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
    email: emailSchema,
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(1),
  }),
  body: z.object({
    password: passwordSchema,
  }),
});
