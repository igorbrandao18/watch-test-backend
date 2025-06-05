import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma.service';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;

  const userDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get(PrismaService);
    await app.init();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userDto);
    
    userId = registerResponse.body.id;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(userDto);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  describe('GET /users/:id', () => {
    it('should get user by id', () => {
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', userId);
          expect(res.body).toHaveProperty('email', userDto.email);
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should return 404 for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/users/nonexistent-id')
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

      // Try logging in with new password
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: userDto.email,
          password: newPassword,
        })
        .expect(200);
    });

    it('should not update password without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/users/${userId}/password`)
        .send({ password: newPassword })
        .expect(401);
    });

    it('should not update password of other users', async () => {
      // Create another user
      const otherUser = {
        email: 'other@example.com',
        password: 'password123',
      };
      const otherUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(otherUser);

      return request(app.getHttpServer())
        .patch(`/users/${otherUserResponse.body.id}/password`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: newPassword })
        .expect(403);
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Try to get deleted user
      return request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should not delete user without authentication', () => {
      return request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(401);
    });

    it('should not delete other users', async () => {
      // Create another user
      const otherUser = {
        email: 'other@example.com',
        password: 'password123',
      };
      const otherUserResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(otherUser);

      return request(app.getHttpServer())
        .delete(`/users/${otherUserResponse.body.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });
}); 