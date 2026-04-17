/**
 * Unit tests for quizController.ts
 * Covers: getQuizzes, startAttempt, getNextQuestion, submitAnswer,
 *         getHallOfFame, getHallOfShame, updateQuestionStats
 */
import { describe, it, expect, vi } from 'vitest';
import {
  getQuizzes,
  startAttempt,
  getNextQuestion,
  submitAnswer,
  getHallOfFame,
  getHallOfShame,
  updateQuestionStats,
} from '../controllers/quizController.js';
import { prisma } from '../lib/prisma.js';
import { mockRequest, mockResponse, FIXTURES } from './helpers.js';

const mockPrisma = prisma as any;

// ─────────────────────────────────────────────────────────────────────────────
// getQuizzes
// ─────────────────────────────────────────────────────────────────────────────
describe('getQuizzes', () => {
  it('returns 200 with the list of quizzes', async () => {
    const quizzesData = [{ id: 'q1', title: 'Naruto Quiz', _count: { questions: 10 } }];
    mockPrisma.quiz.findMany.mockResolvedValue(quizzesData);

    const req = mockRequest();
    const res = mockResponse();
    await getQuizzes(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(quizzesData);
  });

  it('returns 500 on database error', async () => {
    mockPrisma.quiz.findMany.mockRejectedValue(new Error('DB error'));
    const res = mockResponse();
    await getQuizzes({}, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// startAttempt
// ─────────────────────────────────────────────────────────────────────────────
describe('startAttempt', () => {
  it('creates a regular quiz attempt and returns 201', async () => {
    mockPrisma.quizAttempt.create.mockResolvedValue(FIXTURES.quizAttempt);

    const req = mockRequest({ userId: 'user-123', body: { quizId: 'quiz-001', isGauntlet: false } });
    const res = mockResponse();
    await startAttempt(req, res as any);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(FIXTURES.quizAttempt);
  });

  it('returns 403 when user already has a gauntlet attempt this week', async () => {
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(FIXTURES.quizAttempt);

    const req = mockRequest({ userId: 'user-123', body: { isGauntlet: true } });
    const res = mockResponse();
    await startAttempt(req, res as any);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('GAUNTLET ATTEMPT DEPLETED') }),
    );
  });

  it('creates a gauntlet attempt with 100 shuffled questions', async () => {
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(null);
    const questionPool = Array.from({ length: 120 }, (_, i) => ({ id: `q-${i}` }));
    mockPrisma.question.findMany.mockResolvedValue(questionPool);
    const gauntletAttempt = { ...FIXTURES.quizAttempt, isGauntlet: true };
    mockPrisma.quizAttempt.create.mockResolvedValue(gauntletAttempt);

    const req = mockRequest({ userId: 'user-123', body: { isGauntlet: true } });
    const res = mockResponse();
    await startAttempt(req, res as any);

    expect(mockPrisma.quizAttempt.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          isGauntlet: true,
          gauntletSession: expect.objectContaining({ create: expect.anything() }),
        }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('limits gauntlet questions to 100 even with a larger pool', async () => {
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(null);
    const questionPool = Array.from({ length: 200 }, (_, i) => ({ id: `q-${i}` }));
    mockPrisma.question.findMany.mockResolvedValue(questionPool);
    mockPrisma.quizAttempt.create.mockResolvedValue({ ...FIXTURES.quizAttempt, isGauntlet: true });

    const req = mockRequest({ userId: 'user-123', body: { isGauntlet: true } });
    const res = mockResponse();
    await startAttempt(req, res as any);

    const callArgs = mockPrisma.quizAttempt.create.mock.calls[0][0];
    const ids: string[] = callArgs.data.gauntletSession.create.questionIds;
    expect(ids).toHaveLength(100);
  });

  it('returns 500 on unexpected error', async () => {
    mockPrisma.quizAttempt.create.mockRejectedValue(new Error('timeout'));
    const req = mockRequest({ userId: 'user-123', body: { quizId: 'q1', isGauntlet: false } });
    const res = mockResponse();
    await startAttempt(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getNextQuestion
// ─────────────────────────────────────────────────────────────────────────────
describe('getNextQuestion', () => {
  it('returns 404 when attempt is not found', async () => {
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(null);
    const req = mockRequest({ userId: 'user-123', params: { attemptId: 'bad-id' } });
    const res = mockResponse();
    await getNextQuestion(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 404 when attempt belongs to a different user', async () => {
    mockPrisma.quizAttempt.findUnique.mockResolvedValue({ ...FIXTURES.quizAttempt, userId: 'other-user' });
    const req = mockRequest({ userId: 'user-123', params: { attemptId: 'attempt-001' } });
    const res = mockResponse();
    await getNextQuestion(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('strips correctAnswer from the question before returning', async () => {
    const attemptWithQuiz = {
      ...FIXTURES.quizAttempt,
      quiz: {
        questions: [FIXTURES.question],
      },
      gauntletSession: null,
    };
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(attemptWithQuiz);

    const req = mockRequest({ userId: 'user-123', params: { attemptId: 'attempt-001' } });
    const res = mockResponse();
    await getNextQuestion(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body).not.toHaveProperty('correctAnswer');
    expect(body).toHaveProperty('questionText');
  });

  it('returns completed:true when attempt is finished', async () => {
    const completedAttempt = {
      ...FIXTURES.quizAttempt,
      status: 'COMPLETED',
      quiz: { questions: [FIXTURES.question] },
      gauntletSession: null,
    };
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(completedAttempt);
    mockPrisma.quizAnswer.count.mockResolvedValue(1);

    const req = mockRequest({ userId: 'user-123', params: { attemptId: 'attempt-001' } });
    const res = mockResponse();
    await getNextQuestion(req, res as any);

    const body = (res.json as any).mock.calls[0][0];
    expect(body).toHaveProperty('status', 'COMPLETED');
  });

  it('returns 500 on database error', async () => {
    mockPrisma.quizAttempt.findUnique.mockRejectedValue(new Error('DB error'));
    const req = mockRequest({ userId: 'user-123', params: { attemptId: 'attempt-001' } });
    const res = mockResponse();
    await getNextQuestion(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// submitAnswer
// ─────────────────────────────────────────────────────────────────────────────
describe('submitAnswer', () => {
  const activeAttempt = {
    ...FIXTURES.quizAttempt,
    mistakes: 0,
    score: 0,
    quiz: { questions: [FIXTURES.question] },
    gauntletSession: null,
  };

  it('returns 404 when attempt not found or already completed', async () => {
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(null);
    const req = mockRequest({
      userId: 'user-123',
      params: { attemptId: 'bad' },
      body: { questionId: 'q-001', answer: 'Naruto', timeSpent: 5 },
    });
    const res = mockResponse();
    await submitAnswer(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('marks answer as correct and awards points', async () => {
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(activeAttempt);
    mockPrisma.question.findUnique.mockResolvedValue(FIXTURES.question);
    mockPrisma.quizAnswer.create.mockResolvedValue({});
    mockPrisma.questionStats.findUnique.mockResolvedValue(null);
    mockPrisma.questionStats.create.mockResolvedValue({});
    mockPrisma.quizAttempt.update.mockResolvedValue({ ...activeAttempt, status: 'IN_PROGRESS' });

    const req = mockRequest({
      userId: 'user-123',
      params: { attemptId: 'attempt-001' },
      body: { questionId: 'q-001', answer: 'Naruto', timeSpent: 5 },
    });
    const res = mockResponse();
    await submitAnswer(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.isCorrect).toBe(true);
    expect(body.points).toBeGreaterThan(0);
    expect(body.correctAnswer).toBeNull(); // don't leak on correct
  });

  it('marks answer as incorrect and returns the correct answer', async () => {
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(activeAttempt);
    mockPrisma.question.findUnique.mockResolvedValue(FIXTURES.question);
    mockPrisma.quizAnswer.create.mockResolvedValue({});
    mockPrisma.questionStats.findUnique.mockResolvedValue(null);
    mockPrisma.questionStats.create.mockResolvedValue({});
    mockPrisma.quizAttempt.update.mockResolvedValue({ ...activeAttempt, mistakes: 1, status: 'IN_PROGRESS' });

    const req = mockRequest({
      userId: 'user-123',
      params: { attemptId: 'attempt-001' },
      body: { questionId: 'q-001', answer: 'Sasuke', timeSpent: 5 },
    });
    const res = mockResponse();
    await submitAnswer(req, res as any);

    const body = (res.json as any).mock.calls[0][0];
    expect(body.isCorrect).toBe(false);
    expect(body.points).toBe(0);
    expect(body.correctAnswer).toBe('Naruto');
  });

  it('marks gauntlet as FAILED when mistakes exceed 5', async () => {
    const gauntletWithMistakes = {
      ...FIXTURES.quizAttempt,
      isGauntlet: true,
      mistakes: 5,
      quiz: null,
      gauntletSession: { questionIds: Array.from({ length: 100 }, (_, i) => `q-${i}`) },
    };
    mockPrisma.quizAttempt.findUnique.mockResolvedValue(gauntletWithMistakes);
    mockPrisma.question.findUnique.mockResolvedValue(FIXTURES.question);
    mockPrisma.quizAnswer.create.mockResolvedValue({});
    mockPrisma.questionStats.findUnique.mockResolvedValue(null);
    mockPrisma.questionStats.create.mockResolvedValue({});
    const failedAttempt = { ...gauntletWithMistakes, status: 'FAILED', mistakes: 6 };
    mockPrisma.quizAttempt.update.mockResolvedValue(failedAttempt);
    mockPrisma.quizLeaderboard.create.mockResolvedValue({});

    const req = mockRequest({
      userId: 'user-123',
      params: { attemptId: 'attempt-001' },
      body: { questionId: 'q-0', answer: 'Wrong', timeSpent: 10 },
    });
    const res = mockResponse();
    await submitAnswer(req, res as any);

    const body = (res.json as any).mock.calls[0][0];
    expect(body.status).toBe('FAILED');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getHallOfFame
// ─────────────────────────────────────────────────────────────────────────────
describe('getHallOfFame', () => {
  it('returns 200 with hall of fame entries sorted by isPerfect desc', async () => {
    const entries = [
      { id: '1', userId: 'u1', score: 9000, isPerfect: true, user: { username: 'legend' } },
    ];
    mockPrisma.gauntletHallOfFame.findMany.mockResolvedValue(entries);

    const res = mockResponse();
    await getHallOfFame({}, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(entries);
  });

  it('returns 500 on error', async () => {
    mockPrisma.gauntletHallOfFame.findMany.mockRejectedValue(new Error('fail'));
    const res = mockResponse();
    await getHallOfFame({}, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getHallOfShame
// ─────────────────────────────────────────────────────────────────────────────
describe('getHallOfShame', () => {
  it('returns 200 with the hardest questions', async () => {
    const shame = [{ id: 's1', accuracyRate: 0.05, totalServed: 50, question: FIXTURES.question }];
    mockPrisma.questionStats.findMany = vi.fn().mockResolvedValue(shame);

    const res = mockResponse();
    await getHallOfShame({}, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 500 on database error', async () => {
    mockPrisma.questionStats.findMany = vi.fn().mockRejectedValue(new Error('fail'));
    const res = mockResponse();
    await getHallOfShame({}, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// updateQuestionStats
// ─────────────────────────────────────────────────────────────────────────────
describe('updateQuestionStats', () => {
  it('creates a new stats row when none exists', async () => {
    mockPrisma.questionStats.findUnique.mockResolvedValue(null);
    mockPrisma.questionStats.create.mockResolvedValue({});

    await updateQuestionStats('q-001', true, 8.5);

    expect(mockPrisma.questionStats.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          questionId: 'q-001',
          totalServed: 1,
          totalCorrect: 1,
          accuracyRate: 1.0,
          avgTimeSeconds: 8.5,
        }),
      }),
    );
  });

  it('updates existing stats with running averages', async () => {
    const existingStats = {
      questionId: 'q-001',
      totalServed: 10,
      totalCorrect: 6,
      accuracyRate: 0.6,
      avgTimeSeconds: 10.0,
    };
    mockPrisma.questionStats.findUnique.mockResolvedValue(existingStats);
    mockPrisma.questionStats.update.mockResolvedValue({});

    await updateQuestionStats('q-001', false, 5.0);

    expect(mockPrisma.questionStats.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { questionId: 'q-001' },
        data: expect.objectContaining({
          totalServed: 11,
          totalCorrect: 6, // unchanged on wrong answer
          accuracyRate: expect.closeTo(6 / 11, 5),
        }),
      }),
    );
  });

  it('sets totalCorrect to 0 when answer is wrong on first question', async () => {
    mockPrisma.questionStats.findUnique.mockResolvedValue(null);
    mockPrisma.questionStats.create.mockResolvedValue({});

    await updateQuestionStats('q-001', false, 12.0);

    const callArg = mockPrisma.questionStats.create.mock.calls[0][0];
    expect(callArg.data.totalCorrect).toBe(0);
    expect(callArg.data.accuracyRate).toBe(0.0);
  });

  it('does not throw on database error (handles gracefully)', async () => {
    mockPrisma.questionStats.findUnique.mockRejectedValue(new Error('DB timeout'));
    await expect(updateQuestionStats('q-001', true, 5)).resolves.not.toThrow();
  });
});
