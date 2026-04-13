import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import {
  generateAccessToken,
  generateRefreshToken,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  verifyRefreshToken,
} from '../utils/tokens.js';

// Removed local prisma = new PrismaClient()

const filterUser = (user: any) => {
  const { passwordHash, resetToken, resetTokenExpiry, ...filteredUser } = user;
  return filteredUser;
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        privacySettings: { create: {} }, // Default all false
      },
      include: { privacySettings: true },
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({ user: filterUser(user), accessToken });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { emailOrUsername, password } = req.body;

    if (!emailOrUsername || !password) {
      return res.status(400).json({ message: 'Email/Username and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reactivate if soft deleted
    if (user.deactivatedAt) {
      await prisma.user.update({
        where: { id: user.id },
        data: { deactivatedAt: null }
      });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({ user: filterUser(user), accessToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  clearRefreshTokenCookie(res);
  res.status(200).json({ message: 'Logged out successfully' });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const accessToken = generateAccessToken(user.id);
  res.status(200).json({ user: filterUser(user), accessToken });
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't leak exists status, but logic says log it if it existed. 
      // For now, let's just return 200 regardless.
      return res.status(200).json({ message: 'If an account exists with that email, a password reset link has been sent' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    // Note: Prisma schema needs these fields if we want to store them in User model. 
    // Or we create a PasswordReset model. Since Prompt 1 didn't specify reset fields in User,
    // I should add them or use a separate table.
    // I'll add them to User model temporarily in next step or use separate model. 
    // User requested "stores hashed version in DB".
    
    // I'll update the schema in an ephemeral step if needed, but let's assume User has them for now
    // and I'll add them to the User model in a moment.

    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: expiry,
      }
    });

    console.log(`PASSWORD RESET LINK: http://localhost:5173/reset-password/${resetToken}`);

    res.status(200).json({ message: 'If an account exists with that email, a password reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await (prisma.user as any).findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: { gt: new Date() },
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await (prisma.user as any).update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      }
    });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
