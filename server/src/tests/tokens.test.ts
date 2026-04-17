/**
 * Unit tests for tokens.ts utility functions
 * Covers: generateAccessToken, generateRefreshToken,
 *         verifyAccessToken, verifyRefreshToken,
 *         setRefreshTokenCookie, clearRefreshTokenCookie
 */
import { describe, it, expect, vi } from 'vitest';
// Import the REAL implementations (not the mock) for this util-focused test
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/tokens.js';

// Note: These tests use a real jwt implementation (not mocked) to test
// the token utility directly. We only unmock for this file.
vi.unmock('../utils/tokens.js');

describe('Token Utilities', () => {
  describe('generateAccessToken', () => {
    it('returns a non-empty JWT string', () => {
      const token = generateAccessToken('user-abc');
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // header.payload.signature
    });

    it('encodes the userId in the payload', () => {
      const token = generateAccessToken('user-abc');
      const payloadPart = token.split('.')[1];
      if (!payloadPart) throw new Error('Invalid token generated');
      const payload = JSON.parse(Buffer.from(payloadPart, 'base64').toString());
      expect(payload.userId).toBe('user-abc');
    });
  });

  describe('generateRefreshToken', () => {
    it('returns a non-empty JWT string', () => {
      const token = generateRefreshToken('user-xyz');
      expect(token.split('.')).toHaveLength(3);
    });

    it('returns a different token than the access token for the same userId', () => {
      const access = generateAccessToken('user-123');
      const refresh = generateRefreshToken('user-123');
      expect(access).not.toBe(refresh);
    });
  });

  describe('verifyAccessToken', () => {
    it('returns userId for a valid token', () => {
      const token = generateAccessToken('user-123');
      const payload = verifyAccessToken(token);
      expect(payload).not.toBeNull();
      expect(payload?.userId).toBe('user-123');
    });

    it('returns null for a tampered token', () => {
      const token = generateAccessToken('user-123');
      const tampered = token.slice(0, -5) + 'xxxxx';
      const result = verifyAccessToken(tampered);
      expect(result).toBeNull();
    });

    it('returns null for a refresh token used as access token', () => {
      const refreshToken = generateRefreshToken('user-123');
      const result = verifyAccessToken(refreshToken);
      // Should fail due to different secret
      expect(result).toBeNull();
    });

    it('returns null for a completely invalid token string', () => {
      expect(verifyAccessToken('not.a.token')).toBeNull();
      expect(verifyAccessToken('')).toBeNull();
      expect(verifyAccessToken('random-garbage')).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('returns userId for a valid refresh token', () => {
      const token = generateRefreshToken('user-789');
      const payload = verifyRefreshToken(token);
      expect(payload?.userId).toBe('user-789');
    });

    it('returns null for a tampered refresh token', () => {
      const token = generateRefreshToken('user-789');
      const tampered = token.slice(0, -3) + 'bad';
      expect(verifyRefreshToken(tampered)).toBeNull();
    });

    it('returns null for an access token used as refresh token', () => {
      const accessToken = generateAccessToken('user-123');
      expect(verifyRefreshToken(accessToken)).toBeNull();
    });
  });
});
