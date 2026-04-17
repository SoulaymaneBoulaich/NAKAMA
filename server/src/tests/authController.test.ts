/**
 * Unit tests for authController.ts
 * Covers: signup, login, logout, refresh, forgotPassword, resetPassword
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signup, login, logout, refresh, forgotPassword, resetPassword } from '../controllers/authController.js';
import { prisma } from '../lib/prisma.js';
import { mockHash, mockCompare } from './setup.js';
import { mockRequest, mockResponse, FIXTURES } from './helpers.js';

const mockPrisma = prisma as any;

// ─────────────────────────────────────────────────────────────────────────────
// signup
// ─────────────────────────────────────────────────────────────────────────────
describe('signup', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = mockRequest({ body: { username: 'test' } });
    const res = mockResponse();
    await signup(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('required') }));
  });

  it('returns 400 when passwords do not match', async () => {
    const req = mockRequest({
      body: { username: 'user', email: 'a@b.com', password: 'pass1234', confirmPassword: 'different' },
    });
    const res = mockResponse();
    await signup(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Passwords do not match' }));
  });

  it('returns 400 when password is too short', async () => {
    const req = mockRequest({
      body: { username: 'user', email: 'a@b.com', password: '1234', confirmPassword: '1234' },
    });
    const res = mockResponse();
    await signup(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('8 characters') }),
    );
  });

  it('returns 400 when username or email already exists', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(FIXTURES.user);
    const req = mockRequest({
      body: { username: 'testuser', email: 'test@example.com', password: 'password123', confirmPassword: 'password123' },
    });
    const res = mockResponse();
    await signup(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Username or email already exists' }));
  });

  it('creates a user and returns 201 with accessToken', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ ...FIXTURES.user, privacySettings: {} });

    const req = mockRequest({
      body: { username: 'newuser', email: 'new@example.com', password: 'password123', confirmPassword: 'password123' },
    });
    const res = mockResponse();
    await signup(req, res as any);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = (res.json as any).mock.calls[0][0];
    expect(body).toHaveProperty('accessToken', 'mock-access-token');
    expect(body.user).not.toHaveProperty('passwordHash');
  });

  it('hashes the password with bcrypt before storing', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    mockPrisma.user.create.mockResolvedValue({ ...FIXTURES.user });

    const req = mockRequest({
      body: { username: 'newuser', email: 'new@example.com', password: 'password123', confirmPassword: 'password123' },
    });
    const res = mockResponse();
    await signup(req, res as any);

    expect(mockHash).toHaveBeenCalledWith('password123', 12);
  });

  it('returns 500 on unexpected database error', async () => {
    mockPrisma.user.findFirst.mockRejectedValue(new Error('DB connection lost'));
    const req = mockRequest({
      body: { username: 'u', email: 'e@e.com', password: 'password1', confirmPassword: 'password1' },
    });
    const res = mockResponse();
    await signup(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// login
// ─────────────────────────────────────────────────────────────────────────────
describe('login', () => {
  it('returns 400 when email/username or password is missing', async () => {
    const req = mockRequest({ body: { emailOrUsername: 'test' } });
    const res = mockResponse();
    await login(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 when user does not exist', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    const req = mockRequest({ body: { emailOrUsername: 'nobody', password: 'pass' } });
    const res = mockResponse();
    await login(req, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid credentials' }));
  });

  it('returns 401 when password does not match', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(FIXTURES.user);
    mockCompare.mockResolvedValueOnce(false);

    const req = mockRequest({ body: { emailOrUsername: 'testuser', password: 'wrongpass' } });
    const res = mockResponse();
    await login(req, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 with accessToken on valid credentials', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(FIXTURES.user);
    mockCompare.mockResolvedValueOnce(true);

    const req = mockRequest({ body: { emailOrUsername: 'testuser', password: 'password123' } });
    const res = mockResponse();
    await login(req, res as any);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body).toHaveProperty('accessToken', 'mock-access-token');
  });

  it('reactivates a soft-deleted account on successful login', async () => {
    const deactivatedUser = { ...FIXTURES.user, deactivatedAt: new Date('2023-01-01') };
    mockPrisma.user.findFirst.mockResolvedValue(deactivatedUser);
    mockCompare.mockResolvedValueOnce(true);
    mockPrisma.user.update.mockResolvedValue({ ...deactivatedUser, deactivatedAt: null });

    const req = mockRequest({ body: { emailOrUsername: 'testuser', password: 'password123' } });
    const res = mockResponse();
    await login(req, res as any);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { deactivatedAt: null } }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('never returns passwordHash in the response', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(FIXTURES.user);
    mockCompare.mockResolvedValueOnce(true);

    const req = mockRequest({ body: { emailOrUsername: 'testuser', password: 'password123' } });
    const res = mockResponse();
    await login(req, res as any);

    const body = (res.json as any).mock.calls[0][0];
    expect(body.user).not.toHaveProperty('passwordHash');
    expect(body.user).not.toHaveProperty('resetToken');
  });

  it('returns 500 on unexpected error', async () => {
    mockPrisma.user.findFirst.mockRejectedValue(new Error('timeout'));
    const req = mockRequest({ body: { emailOrUsername: 'user', password: 'pass' } });
    const res = mockResponse();
    await login(req, res as any);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// logout
// ─────────────────────────────────────────────────────────────────────────────
describe('logout', () => {
  it('clears the refresh token cookie and returns 200', async () => {
    const req = mockRequest();
    const res = mockResponse();
    await logout(req, res as any);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Logged out successfully' }));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// refresh
// ─────────────────────────────────────────────────────────────────────────────
describe('refresh', () => {
  it('returns 401 when refresh token cookie is missing', async () => {
    const req = mockRequest({ cookies: {} });
    const res = mockResponse();
    await refresh(req, res as any);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Refresh token missing' }));
  });

  it('returns 403 when refresh token is invalid', async () => {
    const { verifyRefreshToken } = await import('../utils/tokens.js');
    vi.mocked(verifyRefreshToken).mockReturnValueOnce(null);

    const req = mockRequest({ cookies: { refreshToken: 'bad-token' } });
    const res = mockResponse();
    await refresh(req, res as any);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('returns 404 when user no longer exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const req = mockRequest({ cookies: { refreshToken: 'valid-token' } });
    const res = mockResponse();
    await refresh(req, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 with new accessToken for valid refresh', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(FIXTURES.user);
    const req = mockRequest({ cookies: { refreshToken: 'valid-token' } });
    const res = mockResponse();
    await refresh(req, res as any);
    expect(res.status).toHaveBeenCalledWith(200);
    const body = (res.json as any).mock.calls[0][0];
    expect(body).toHaveProperty('accessToken', 'mock-access-token');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// forgotPassword
// ─────────────────────────────────────────────────────────────────────────────
describe('forgotPassword', () => {
  it('returns 400 when email is missing', async () => {
    const req = mockRequest({ body: {} });
    const res = mockResponse();
    await forgotPassword(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 even when user is not found (anti-enumeration)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const req = mockRequest({ body: { email: 'nobody@example.com' } });
    const res = mockResponse();
    await forgotPassword(req, res as any);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('stores a hashed reset token and returns 200 when user exists', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(FIXTURES.user);
    mockPrisma.user.update.mockResolvedValue(FIXTURES.user);

    const req = mockRequest({ body: { email: 'test@example.com' } });
    const res = mockResponse();
    await forgotPassword(req, res as any);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: FIXTURES.user.id },
        data: expect.objectContaining({ resetToken: expect.any(String) }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// resetPassword
// ─────────────────────────────────────────────────────────────────────────────
describe('resetPassword', () => {
  it('returns 400 when required fields are missing', async () => {
    const req = mockRequest({ body: { token: 'tok' } });
    const res = mockResponse();
    await resetPassword(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Token and new password are required' }),
    );
  });

  it('returns 400 when passwords do not match', async () => {
    const req = mockRequest({ body: { token: 'tok', newPassword: 'abc12345', confirmPassword: 'different' } });
    const res = mockResponse();
    await resetPassword(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Passwords do not match' }));
  });

  it('returns 400 when token is invalid or expired', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(null);
    const req = mockRequest({ body: { token: 'bad', newPassword: 'pass1234', confirmPassword: 'pass1234' } });
    const res = mockResponse();
    await resetPassword(req, res as any);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid or expired reset token' }),
    );
  });

  it('resets password and returns 200 for a valid token', async () => {
    mockPrisma.user.findFirst.mockResolvedValue(FIXTURES.user);
    mockPrisma.user.update.mockResolvedValue(FIXTURES.user);

    const req = mockRequest({ body: { token: 'validtoken', newPassword: 'newpass12', confirmPassword: 'newpass12' } });
    const res = mockResponse();
    await resetPassword(req, res as any);

    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ resetToken: null, resetTokenExpiry: null }),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Password reset successful' }));
  });
});
