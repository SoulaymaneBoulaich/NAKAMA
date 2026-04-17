/**
 * Shared test helpers: mock request/response factories and common fixtures.
 */
import { vi } from 'vitest';
import type { Request, Response } from 'express';

// ── Response mock ─────────────────────────────────────────────
export function mockResponse(): Partial<Response> & {
  statusCode: number;
  body: unknown;
} {
  const res: any = {
    statusCode: 200,
    body: null,
  };
  res.status = vi.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = vi.fn((data: unknown) => {
    res.body = data;
    return res;
  });
  res.cookie = vi.fn(() => res);
  res.clearCookie = vi.fn(() => res);
  return res;
}

// ── Request mock ──────────────────────────────────────────────
export function mockRequest(overrides: Partial<Request & { userId?: string }> = {}): any {
  return {
    body: {},
    params: {},
    query: {},
    cookies: {},
    headers: {},
    userId: undefined,
    ...overrides,
  };
}

// ── Common fixtures ───────────────────────────────────────────
export const FIXTURES = {
  user: {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    avatar: null,
    banner: null,
    bio: null,
    fullName: null,
    phoneNumber: null,
    location: null,
    language: 'English',
    timezone: 'UTC',
    theme: 'Monochrome',
    typography: 'Sans-Serif',
    accentColor: 'Red',
    layoutDensity: 'COMFORTABLE',
    isPrivate: false,
    isPremium: false,
    searchIndexable: true,
    showOnlineStatus: true,
    showActivityStatus: true,
    deactivatedAt: null,
    resetToken: null,
    resetTokenExpiry: null,
    isUltraNakama: false,
    ultraNakamaExpiresAt: null,
    isNakamaLeader: false,
    nakamaLeaderSince: null,
    gauntletFrameUrl: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    privacySettings: null,
  },

  question: {
    id: 'q-001',
    quizId: 'quiz-001',
    type: 'QA',
    difficulty: 'GENIN',
    questionText: 'Who is Naruto?',
    mediaUrl: null,
    mediaType: null,
    options: ['Naruto', 'Sasuke', 'Sakura', 'Kakashi'],
    correctAnswer: 'Naruto',
    animeReference: 'Naruto',
    timeLimitSeconds: 15,
    pointsBase: 100,
    createdAt: new Date('2024-01-01'),
  },

  submission: {
    id: 'sub-001',
    submittedBy: 'user-123',
    communityId: null,
    type: 'QA',
    difficulty: 'GENIN',
    questionText: 'Who is Luffy?',
    mediaUrl: null,
    mediaType: null,
    options: ['Luffy', 'Zoro', 'Sanji', 'Nami'],
    correctAnswer: 'Luffy',
    animeReference: 'One Piece',
    timeLimitSeconds: 15,
    status: 'PENDING',
    approvalVotes: 0,
    rejectionVotes: 0,
    reviewedAt: null,
    createdAt: new Date('2024-01-01'),
    user: { username: 'testuser', avatar: null },
  },

  quizAttempt: {
    id: 'attempt-001',
    userId: 'user-123',
    quizId: 'quiz-001',
    isGauntlet: false,
    status: 'IN_PROGRESS',
    currentQuestion: 0,
    score: 0,
    mistakes: 0,
    totalAnswered: 0,
    weekNumber: 16,
    yearNumber: 2024,
    startedAt: new Date('2024-01-01'),
    completedAt: null,
  },
};
