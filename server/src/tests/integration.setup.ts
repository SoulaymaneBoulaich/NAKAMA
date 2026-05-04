import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma.js';
import { execSync } from 'child_process';

beforeAll(async () => {
  // Ensure we are using the test database
  if (!process.env.DATABASE_URL?.includes('nakama')) {
    throw new Error('INTEGRATION TESTS MUST USE NAKAMA DATABASE');
  }

  console.log('Pushing schema to test database...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
});

beforeEach(async () => {
  // Ordered primarily for performance, but session_replication_role ensures safety
  const tables = [
    'dailyAnswer',
    'dailyQuestion',
    'quizAnswer', 
    'quizAttempt', 
    'questionStats', 
    'question',
    'quiz',
    'gauntletHallOfFame',
    'submissionVote',
    'questionSubmission',
    'user'
  ];

  // Temporarily disable foreign key checks for the session
  await prisma.$executeRaw`SET session_replication_role = 'replica';`;

  try {
    for (const table of tables) {
      await (prisma as any)[table].deleteMany();
    }
  } finally {
    // Re-enable foreign key checks
    await prisma.$executeRaw`SET session_replication_role = 'origin';`;
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
