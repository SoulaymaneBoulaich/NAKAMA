/**
 * Unit tests for questionSubmissionController.ts
 * Covers: submitQuestion, getPendingSubmissions, voteOnSubmission,
 *         getMySubmissions
 */
import { describe, it, expect, vi } from 'vitest';
import {
  submitQuestion,
  getPendingSubmissions,
  voteOnSubmission,
  getMySubmissions,
} from '../controllers/questionSubmissionController.js';
import { prisma } from '../lib/prisma.js';
import { mockRequest, mockResponse, FIXTURES } from './helpers.js';

const mockPrisma = prisma as any;

// ─────────────────────────────────────────────────────────────────────────────
// submitQuestion
// ─────────────────────────────────────────────────────────────────────────────
describe('submitQuestion', () => {
  it('returns 400 when options array is missing', async () => {
    const req = mockRequest({ userId: 'user-123', body: { questionText: 'Who?' } });
    const res = mockResponse();
    await submitQuestion(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Exactly 4 options are required' }),
    );
  });

  it('returns 400 when options array has fewer than 4 elements', async () => {
    const req = mockRequest({
      userId: 'user-123',
      body: { questionText: 'Who?', options: ['A', 'B', 'C'] },
    });
    const res = mockResponse();
    await submitQuestion(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when options array has more than 4 elements', async () => {
    const req = mockRequest({
      userId: 'user-123',
      body: { questionText: 'Who?', options: ['A', 'B', 'C', 'D', 'E'] },
    });
    const res = mockResponse();
    await submitQuestion(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('creates a submission with PENDING status and returns 201', async () => {
    mockPrisma.questionSubmission.create.mockResolvedValue(FIXTURES.submission);

    const req = mockRequest({
      userId: 'user-123',
      body: {
        type: 'QA',
        difficulty: 'GENIN',
        questionText: 'Who is Luffy?',
        options: ['Luffy', 'Zoro', 'Sanji', 'Nami'],
        correctAnswer: 'Luffy',
        animeReference: 'One Piece',
        timeLimitSeconds: 15,
      },
    });
    const res = mockResponse();
    await submitQuestion(req, res as any);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockPrisma.questionSubmission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PENDING', submittedBy: 'user-123' }),
      }),
    );
  });

  it('defaults timeLimitSeconds to 15 when not provided', async () => {
    mockPrisma.questionSubmission.create.mockResolvedValue(FIXTURES.submission);

    const req = mockRequest({
      userId: 'user-123',
      body: {
        type: 'QA',
        difficulty: 'GENIN',
        questionText: 'Q?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        animeReference: 'Any',
      },
    });
    const res = mockResponse();
    await submitQuestion(req, res as any);

    const callData = mockPrisma.questionSubmission.create.mock.calls[0][0].data;
    expect(callData.timeLimitSeconds).toBe(15);
  });

  it('returns 500 on database error', async () => {
    mockPrisma.questionSubmission.create.mockRejectedValue(new Error('DB error'));
    const req = mockRequest({
      userId: 'user-123',
      body: { options: ['A', 'B', 'C', 'D'], questionText: 'Q?', correctAnswer: 'A' },
    });
    const res = mockResponse();
    await submitQuestion(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getPendingSubmissions
// ─────────────────────────────────────────────────────────────────────────────
describe('getPendingSubmissions', () => {
  it('returns 200 with pending submissions the user has not voted on', async () => {
    mockPrisma.questionSubmission.findMany.mockResolvedValue([FIXTURES.submission]);

    const req = mockRequest({ userId: 'user-123' });
    const res = mockResponse();
    await getPendingSubmissions(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([FIXTURES.submission]);
    // Verify query filters out user's own submissions
    expect(mockPrisma.questionSubmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: 'PENDING',
          submittedBy: expect.objectContaining({ not: 'user-123' }),
        }),
      }),
    );
  });

  it('limits results to 20', async () => {
    mockPrisma.questionSubmission.findMany.mockResolvedValue([]);
    const req = mockRequest({ userId: 'user-123' });
    const res = mockResponse();
    await getPendingSubmissions(req, res as any);

    expect(mockPrisma.questionSubmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 20 }),
    );
  });

  it('returns 500 on database error', async () => {
    mockPrisma.questionSubmission.findMany.mockRejectedValue(new Error('fail'));
    const req = mockRequest({ userId: 'user-123' });
    const res = mockResponse();
    await getPendingSubmissions(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// voteOnSubmission
// ─────────────────────────────────────────────────────────────────────────────
describe('voteOnSubmission', () => {
  it('returns 400 when user has already voted', async () => {
    mockPrisma.submissionVote.findUnique.mockResolvedValue({ id: 'vote-1' });

    const req = mockRequest({
      userId: 'user-123',
      params: { submissionId: 'sub-001' },
      body: { vote: 'APPROVE' },
    });
    const res = mockResponse();
    await voteOnSubmission(req, res as any);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Already voted on this submission' }),
    );
  });

  it('executes vote in a transaction and returns 200', async () => {
    mockPrisma.submissionVote.findUnique.mockResolvedValue(null);

    const voteResult = { id: 'vote-new', vote: 'APPROVE' };
    const submissionAfterVote = { ...FIXTURES.submission, approvalVotes: 1, status: 'PENDING' };
    mockPrisma.submissionVote.create.mockResolvedValue(voteResult);
    mockPrisma.questionSubmission.update.mockResolvedValue(submissionAfterVote);

    const req = mockRequest({
      userId: 'user-123',
      params: { submissionId: 'sub-001' },
      body: { vote: 'APPROVE' },
    });
    const res = mockResponse();
    await voteOnSubmission(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body).toHaveProperty('status', 'PENDING');
  });

  it('auto-approves and creates a question after 10 APPROVE votes', async () => {
    mockPrisma.submissionVote.findUnique.mockResolvedValue(null);

    const voteResult = { id: 'vote-new', vote: 'APPROVE' };
    const submissionAt10 = { ...FIXTURES.submission, approvalVotes: 10, status: 'PENDING' };
    const approvedSubmission = { ...FIXTURES.submission, status: 'APPROVED' };
    const newQuestion = { id: 'q-999' };

    mockPrisma.submissionVote.create.mockResolvedValue(voteResult);
    mockPrisma.questionSubmission.update
      .mockResolvedValueOnce(submissionAt10)   // First call: increment vote count
      .mockResolvedValueOnce(approvedSubmission); // Second call: set APPROVED
    mockPrisma.question = { create: vi.fn().mockResolvedValue(newQuestion) };
    // Badge check
    mockPrisma.questionSubmission.count.mockResolvedValue(5);
    mockPrisma.quizArchitectBadge.findUnique.mockResolvedValue(null);
    mockPrisma.quizArchitectBadge.create.mockResolvedValue({});
    mockPrisma.notification.create.mockResolvedValue({});

    const req = mockRequest({
      userId: 'user-123',
      params: { submissionId: 'sub-001' },
      body: { vote: 'APPROVE' },
    });
    const res = mockResponse();
    await voteOnSubmission(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.status).toBe('APPROVED');
    expect(body).toHaveProperty('questionId', 'q-999');
  });

  it('auto-rejects after 5 REJECT votes', async () => {
    mockPrisma.submissionVote.findUnique.mockResolvedValue(null);

    const voteResult = { id: 'vote-new', vote: 'REJECT' };
    const submissionAt5 = { ...FIXTURES.submission, rejectionVotes: 5, status: 'PENDING' };

    mockPrisma.submissionVote.create.mockResolvedValue(voteResult);
    mockPrisma.questionSubmission.update
      .mockResolvedValueOnce(submissionAt5)
      .mockResolvedValueOnce({ ...FIXTURES.submission, status: 'REJECTED' });

    const req = mockRequest({
      userId: 'user-123',
      params: { submissionId: 'sub-001' },
      body: { vote: 'REJECT' },
    });
    const res = mockResponse();
    await voteOnSubmission(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body.status).toBe('REJECTED');
  });

  it('only increments approvalVotes when vote is APPROVE', async () => {
    mockPrisma.submissionVote.findUnique.mockResolvedValue(null);
    mockPrisma.submissionVote.create.mockResolvedValue({});
    mockPrisma.questionSubmission.update.mockResolvedValue({
      ...FIXTURES.submission,
      approvalVotes: 1,
      rejectionVotes: 0,
    });

    const req = mockRequest({
      userId: 'user-123',
      params: { submissionId: 'sub-001' },
      body: { vote: 'APPROVE' },
    });
    const res = mockResponse();
    await voteOnSubmission(req, res as any);

    const updateCall = mockPrisma.questionSubmission.update.mock.calls[0][0];
    expect(updateCall.data.approvalVotes).toEqual({ increment: 1 });
    expect(updateCall.data.rejectionVotes).toBeUndefined();
  });

  it('returns 500 on unexpected error', async () => {
    mockPrisma.submissionVote.findUnique.mockRejectedValue(new Error('fail'));
    const req = mockRequest({
      userId: 'user-123',
      params: { submissionId: 'sub-001' },
      body: { vote: 'APPROVE' },
    });
    const res = mockResponse();
    await voteOnSubmission(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getMySubmissions
// ─────────────────────────────────────────────────────────────────────────────
describe('getMySubmissions', () => {
  it('returns 200 with all submissions by the current user', async () => {
    mockPrisma.questionSubmission.findMany.mockResolvedValue([FIXTURES.submission]);

    const req = mockRequest({ userId: 'user-123' });
    const res = mockResponse();
    await getMySubmissions(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([FIXTURES.submission]);
    expect(mockPrisma.questionSubmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { submittedBy: 'user-123' } }),
    );
  });

  it('returns empty array when user has no submissions', async () => {
    mockPrisma.questionSubmission.findMany.mockResolvedValue([]);
    const req = mockRequest({ userId: 'user-123' });
    const res = mockResponse();
    await getMySubmissions(req, res as any);
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('returns 500 on database error', async () => {
    mockPrisma.questionSubmission.findMany.mockRejectedValue(new Error('fail'));
    const req = mockRequest({ userId: 'user-123' });
    const res = mockResponse();
    await getMySubmissions(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
