import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupTestDatabase, cleanupTestDatabase } from './helpers';
import { v4 as uuid } from 'uuid';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let userId: string;
  let authToken: string;
  let testUser;

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

  beforeEach(async () => {
    // Create a test user and get token
    testUser = generateTestUser();
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(200);

    authToken = loginResponse.body.access_token;
  });

  describe('GET /users/:id', () => {
    it('should get user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(401);
    });
  });

  describe('PATCH /users/:id/password', () => {
    const newPassword = 'newpassword123';

    it('should update user password', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${userId}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: newPassword })
        .expect(200);

      // Try to login with new password
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: newPassword })
        .expect(200);
    });

    it('should not update password without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/password`)
        .send({ password: newPassword })
        .expect(401);
    });

    it('should not update password of other users', () => {
      return request(app.getHttpServer())
        .patch('/users/other-user-id/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: newPassword })
        .expect(403);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      // Delete the user
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to get deleted user without token (should be 401)
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(401);

      // Try to get deleted user with token (should be 404)
      const newUser = generateTestUser();
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(newUser)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(newUser)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${loginResponse.body.access_token}`)
        .expect(404);
    });

    it('should not delete user without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(401);
    });

    it('should not delete other users', () => {
      return request(app.getHttpServer())
        .delete('/users/other-user-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
}); 