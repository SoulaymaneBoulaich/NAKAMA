/**
 * Global test setup — auto-mocks Prisma and external services
 * so tests never hit a real database or 3rd-party API.
 */
import { vi, afterEach } from 'vitest';

// ── Prisma Mock ──────────────────────────────────────────────
vi.mock('../lib/prisma.js', () => {
  const mockPrisma = {
    user: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    quiz: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    quizAttempt: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    quizAnswer: {
      create: vi.fn(),
      count: vi.fn(),
    },
    question: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    questionStats: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    questionSubmission: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    submissionVote: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    quizArchitectBadge: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    gauntletHallOfFame: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    quizLeaderboard: {
      create: vi.fn(),
    },
    notification: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (fn: any) => {
      return fn(mockPrisma);
    }),
  };
  return { prisma: mockPrisma };
});

// ── Token Utils Mock ─────────────────────────────────────────
vi.mock('../utils/tokens.js', () => ({
  generateAccessToken: vi.fn(() => 'mock-access-token'),
  generateRefreshToken: vi.fn(() => 'mock-refresh-token'),
  setRefreshTokenCookie: vi.fn(),
  clearRefreshTokenCookie: vi.fn(),
  verifyRefreshToken: vi.fn(() => ({ userId: 'mock-user-id' })),
  verifyAccessToken: vi.fn(() => ({ userId: 'mock-user-id' })),
}));

// ── bcryptjs Mock ─────────────────────────────────────────────
const mockHash = vi.fn(async () => 'hashed-password');
const mockCompare = vi.fn(async () => true);

vi.mock('bcryptjs', () => ({
  default: {
    hash: mockHash,
    compare: mockCompare,
  },
  hash: mockHash,
  compare: mockCompare,
}));

export { mockHash, mockCompare };

// Reset all mocks between tests
afterEach(() => {
  vi.clearAllMocks();
});
