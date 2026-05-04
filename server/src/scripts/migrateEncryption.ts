import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const KEY = ENCRYPTION_KEY ? Buffer.from(ENCRYPTION_KEY, 'hex') : Buffer.alloc(0);
const IV_LENGTH = 16;

const encrypt = (text: string): string => {
  if (!text) return '';
  if (KEY.length !== 32) throw new Error('ENCRYPTION_KEY must be a 32-byte hex string');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};

async function migrate() {
  console.log('🚀 Starting legacy data encryption migration...');

  try {
    // 1. Migrate Messages
    const messages = await prisma.message.findMany({
      where: {
        NOT: {
          content: { contains: ':' }
        }
      }
    });

    console.log(`💬 Found ${messages.length} plaintext messages to encrypt.`);

    for (const message of messages) {
      if (!message.content.includes(':')) {
        await prisma.message.update({
          where: { id: message.id },
          data: { content: encrypt(message.content) }
        });
      }
    }
    console.log('✅ Messages migration complete.');

    // 2. Migrate User Phone Numbers
    const users = await prisma.user.findMany({
      where: {
        phoneNumber: { not: null },
        NOT: {
          phoneNumber: { contains: ':' }
        }
      }
    });

    console.log(`📞 Found ${users.length} plaintext phone numbers to encrypt.`);

    for (const user of users) {
      if (user.phoneNumber && !user.phoneNumber.includes(':')) {
        await prisma.user.update({
          where: { id: user.id },
          data: { phoneNumber: encrypt(user.phoneNumber) }
        });
      }
    }
    console.log('✅ Users migration complete.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrate();
