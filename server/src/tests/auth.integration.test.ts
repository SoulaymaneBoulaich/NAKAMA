import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { prisma } from '../lib/prisma.js';

describe('Auth Integration Tests', () => {
  const testUser = {
    username: 'testuser_int',
    email: 'test_int@example.com',
    password: 'Password123',
    confirmPassword: 'Password123'
  };

  it('should sign up a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.user).toBeDefined();
    expect(response.body.user.username).toBe(testUser.username);
    expect(response.body.accessToken).toBeDefined();
    expect(response.headers['set-cookie']).toBeDefined();
  });

  it('should fail to sign up with duplicate email', async () => {
    // Setup: Ensure user exists first because database is cleared BEFORE each test
    await request(app).post('/api/auth/signup').send(testUser);

    const response = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/exists/i || /already/i);
  });

  it('should log in successfully', async () => {
    // Setup: Create user specifically for this test
    const loginUser = {
      username: 'login_test',
      email: 'login@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    };
    await request(app).post('/api/auth/signup').send(loginUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: loginUser.email,
        password: loginUser.password
      });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
  });

  it('should fail login with wrong password', async () => {
    // Setup: Create user specifically for this test
    const failUser = {
      username: 'fail_login',
      email: 'fail@example.com',
      password: 'Password123',
      confirmPassword: 'Password123'
    };
    await request(app).post('/api/auth/signup').send(failUser);

    const response = await request(app)
      .post('/api/auth/login')
      .send({
        emailOrUsername: failUser.email,
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid/i);
  });

  it('should fail validation with invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/signup')
      .send({
        ...testUser,
        email: 'not-an-email'
      });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].path).toBe('body.email');
  });
});
