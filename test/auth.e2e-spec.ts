import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupTestDatabase, cleanupTestDatabase } from './helpers';
import { v4 as uuid } from 'uuid';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    await setupTestDatabase();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await cleanupTestDatabase();
  });

  const generateTestUser = () => ({
    email: `test.${uuid()}@example.com`,
    password: 'password123',
  });

  describe('POST /auth/register', () => {
    it('should register a new user', () => {
      const user = generateTestUser();
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email', user.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should not register a user with existing email', async () => {
      const user = generateTestUser();
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(201);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(user)
        .expect(409);
    });

    it('should not register a user with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'invalid-email', password: 'password123' })
        .expect(400);
    });

    it('should not register a user with short password', () => {
      const user = generateTestUser();
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...user, password: '12345' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = generateTestUser();
      // Create a test user for login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
      expect(response.body.user).not.toHaveProperty('password');

      authToken = response.body.access_token;
    });

    it('should not login with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...testUser, password: 'wrongpassword' })
        .expect(401);
    });

    it('should not login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: testUser.password })
        .expect(401);
    });
  });

  describe('GET /auth/profile', () => {
    let testUser;

    beforeEach(async () => {
      testUser = generateTestUser();
      // Create a test user and get token
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser);

      authToken = response.body.access_token;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', testUser.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should not get profile without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should not get profile with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
}); 