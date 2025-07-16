import request from 'supertest';
import app from '../index';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: { contains: 'test' }
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: { contains: 'test' }
      }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject registration with existing email', async () => {
      const userData = {
        username: 'testuser2',
        email: 'test@example.com', // Same email as above
        password: 'TestPassword123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_EXISTS');
    });

    it('should reject registration with invalid password', async () => {
      const userData = {
        username: 'testuser3',
        email: 'test3@example.com',
        password: 'weak' // Too weak
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        emailOrUsername: 'test@example.com',
        password: 'TestPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.emailOrUsername);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject login with invalid credentials', async () => {
      const loginData = {
        emailOrUsername: 'test@example.com',
        password: 'WrongPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'test@example.com',
          password: 'TestPassword123'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.passwordHash).toBeUndefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          emailOrUsername: 'test@example.com',
          password: 'TestPassword123'
        });
      
      authToken = loginResponse.body.data.token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Logged out successfully');
    });

    it('should reject subsequent requests with invalidated token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});