import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { prisma } from '../lib/prisma.js';

describe('Quiz Integration Tests', () => {
  async function setupUserAndQuiz() {
    const username = `user_${Math.random().toString(36).slice(2, 7)}`;
    const userRes = await request(app)
      .post('/api/auth/signup')
      .send({
        username,
        email: `${username}@example.com`,
        password: 'Password123',
        confirmPassword: 'Password123'
      });

    if (userRes.status !== 201) {
      console.error('Signup failed in test:', userRes.body);
    }
    expect(userRes.status).toBe(201);
    const authToken = userRes.body.accessToken;
    expect(authToken).toBeDefined();

    const quiz = await prisma.quiz.create({
      data: {
        title: 'Integration Test Quiz',
        description: 'Testing the quiz flow',
        category: 'QA',
        difficulty: 'CHUNIN',
        questions: {
          create: [
            {
              type: 'QA',
              difficulty: 'CHUNIN',
              questionText: 'What is 1+1?',
              options: ['1', '2', '3', '4'],
              correctAnswer: '2',
              animeReference: 'Math',
              pointsBase: 100,
              timeLimitSeconds: 15
            }
          ]
        }
      }
    });

    return { authToken, quizId: quiz.id };
  }

  it('should start a quiz attempt', async () => {
    const { authToken, quizId } = await setupUserAndQuiz();
    
    const response = await request(app)
      .post('/api/quiz/start')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quizId });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('IN_PROGRESS');
  });

  it('should get context-wrapped questions', async () => {
    const { authToken, quizId } = await setupUserAndQuiz();
    
    const startRes = await request(app)
      .post('/api/quiz/start')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quizId });
    
    const attemptId = startRes.body.id;

    const response = await request(app)
      .get(`/api/quiz/attempt/${attemptId}/question`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.questionText).toBeDefined();
    expect(response.body.correctAnswer).toBeUndefined(); // Security check: field stripping
  });

  it('should submit a correct answer and update score', async () => {
    const { authToken, quizId } = await setupUserAndQuiz();
    
    const startRes = await request(app)
      .post('/api/quiz/start')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ quizId });
    
    const attemptId = startRes.body.id;

    const questionRes = await request(app)
      .get(`/api/quiz/attempt/${attemptId}/question`)
      .set('Authorization', `Bearer ${authToken}`);
    
    const questionId = questionRes.body.id;

    const response = await request(app)
      .post(`/api/quiz/attempt/${attemptId}/submit`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        questionId,
        answer: '2',
        timeSpent: 5
      });

    expect(response.status).toBe(200);
    expect(response.body.isCorrect).toBe(true);
    expect(response.body.points).toBeGreaterThan(0);
  });
});
