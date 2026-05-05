import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import { beforeAll, afterAll, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma.js';
import { execSync } from 'child_process';

beforeAll(async () => {
  if (!process.env.DATABASE_URL?.includes('nakama')) {
    throw new Error('INTEGRATION TESTS MUST USE NAKAMA DATABASE');
  }

  console.log('Pushing schema to test database...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
});

beforeEach(async () => {
  // Disable ALL FK constraints + ALL triggers fully
  await prisma.$executeRawUnsafe(`SET session_replication_role = 'replica';`);

  try {
    // DELETE IN CORRECT ORDER → from leaf → root
    await prisma.dailyAnswer.deleteMany();
    await prisma.quizAnswer.deleteMany();
    await prisma.quizAttempt.deleteMany();
    await prisma.questionStats.deleteMany();

    await prisma.dailyQuestion.deleteMany(); // depends on Question

    await prisma.questionSubmission.deleteMany();
    await prisma.submissionVote.deleteMany();
    await prisma.gauntletHallOfFame.deleteMany();

    await prisma.question.deleteMany(); // parent of dailyQuestion
    await prisma.quiz.deleteMany();

    await prisma.user.deleteMany();
  } finally {
    // Re-enable constraints
    await prisma.$executeRawUnsafe(`SET session_replication_role = 'origin';`);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
