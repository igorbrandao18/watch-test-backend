import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupTestDatabase, cleanupTestDatabase } from './helpers';
import { PrismaClient } from '../generated/prisma';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  let authToken: string;

  const testUser = {
    email: 'test@example.com',
    password: 'test123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = await setupTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await app.close();
  });

  describe('/movies/popular (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/movies/popular')
        .expect(401);
    });

    it('should return popular movies', () => {
      return request(app.getHttpServer())
        .get('/movies/popular')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('title');
        });
    });
  });

  describe('/movies/:id (GET)', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer())
        .get('/movies/123')
        .expect(401);
    });

    it('should return movie details', async () => {
      const popularMovies = await request(app.getHttpServer())
        .get('/movies/popular')
        .set('Authorization', `Bearer ${authToken}`);

      const movieId = popularMovies.body[0].id;

      return request(app.getHttpServer())
        .get(`/movies/${movieId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', movieId);
          expect(res.body).toHaveProperty('title');
          expect(res.body).toHaveProperty('overview');
        });
    });

    it('should return 404 for non-existent movie', () => {
      return request(app.getHttpServer())
        .get('/movies/999999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
}); 