import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupTestDatabase, cleanupTestDatabase } from './helpers';
import { v4 as uuid } from 'uuid';

describe('Application Flow (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let authToken: string;

  const generateTestUser = () => ({
    email: `test.${uuid()}@example.com`,
    password: 'password123',
  });

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

  describe('Complete User Flow', () => {
    it('should complete the entire user journey', async () => {
      const testUser = generateTestUser();

      // 1. Register a new user
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('id');
      userId = registerResponse.body.id;

      // 2. Login with the new user
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
      authToken = loginResponse.body.access_token;

      // 3. Get user profile
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email', testUser.email);
        });

      // 4. Update password
      const newPassword = 'newpassword123';
      await request(app.getHttpServer())
        .patch(`/users/${userId}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: newPassword })
        .expect(200);

      // 5. Login with new password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...testUser, password: newPassword })
        .expect(200);

      // 6. Delete account
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // 7. Try to get deleted user without token (should be 401)
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(401);

      // 8. Try to get deleted user with a new token (should be 404)
      const newUser = generateTestUser();
      const newRegisterResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201);

      const newLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(newUser)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${newLoginResponse.body.access_token}`)
        .expect(404);
    });

    it('should handle error scenarios', async () => {
      const testUser = generateTestUser();

      // 1. Register a user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      // 2. Try to register with same email
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);

      // 3. Try to login with wrong password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...testUser, password: 'wrongpassword' })
        .expect(401);

      // 4. Try to access protected route without token
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);

      // 5. Try to access protected route with invalid token
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
}); 