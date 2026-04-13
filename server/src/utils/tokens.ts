import jwt from 'jsonwebtoken';
import type { Response } from 'express';

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your_access_token_secret_min_32_chars';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret_min_32_chars';

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const verifyAccessToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
};
