import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma.js';
import { execSync } from 'child_process';

beforeAll(async () => {
  // Ensure we are using the test database
  if (!process.env.DATABASE_URL?.includes('NAKAMA_TEST')) {
    throw new Error('INTEGRATION TESTS MUST USE NAKAMA_TEST DATABASE');
  }

  console.log('Pushing schema to test database...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
});

beforeEach(async () => {
  // Clear tables before each test (Ordered by dependency)
  const tables = [
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

  for (const table of tables) {
    await (prisma as any)[table].deleteMany();
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
