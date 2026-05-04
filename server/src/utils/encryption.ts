import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY || '', 'hex');
const IV_LENGTH = 16;

/**
 * Encrypts a string using AES-256-CBC.
 * Returns a string in the format: iv:encryptedData
 */
export const encrypt = (text: string): string => {
  if (!text) return '';
  if (KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
};

/**
 * Decrypts a string encrypted by the above function.
 */
export const decrypt = (encryptedText: string): string => {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  if (KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be a 32-byte hex string');
  }

  try {
    const [ivHex, encryptedData] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    // If decryption fails, it might be legacy plain text or corrupted data.
    // In a strict environment, we should throw, but for migration we might return as is.
    return encryptedText;
  }
};
