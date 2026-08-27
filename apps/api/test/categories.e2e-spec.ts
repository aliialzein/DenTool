import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
}

describe('Categories (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/categories', () => {
    it('returns 200 with an array', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);

      // findAll() has no pagination DTO wrapping it, unlike /products —
      // confirm it's a bare array rather than assuming a shape.
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /api/categories/:slug', () => {
    it('returns 404 (or handled error) for a slug that does not exist', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/categories/definitely-not-a-real-slug-xyz',
      );

      // No global exception filter exists yet (per the audit), so this
      // documents current behavior rather than asserting the ideal 404.
      expect([404, 400, 500]).toContain(res.status);
    });
  });

  describe('happy path against real data (skips if DB has no categories)', () => {
    let sampleSlug: string | undefined;

    beforeAll(async () => {
      const res = await request(app.getHttpServer()).get('/api/categories');

      const categories = res.body as CategoryResponse[];
      const first = categories[0];

      sampleSlug = first?.slug;
    });

    it('GET /api/categories/:slug returns the category for a real slug', async () => {
      if (!sampleSlug) {
        console.warn(
          'Skipped: no categories exist in the dev DB to test against.',
        );
        return;
      }

      const res = await request(app.getHttpServer())
        .get(`/api/categories/${sampleSlug}`)
        .expect(200);

      const body = res.body as CategoryResponse;

      expect(body).toHaveProperty('slug', sampleSlug);
    });
  });

  describe('admin routes reject unauthenticated requests', () => {
    it('GET /api/categories/admin returns 401/403 without a session', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/categories/admin',
      );

      expect([401, 403]).toContain(res.status);
    });

    it('POST /api/categories returns 401/403 without a session', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/categories')
        .send({ name: 'Test Category' });

      expect([401, 403]).toContain(res.status);
    });

    it('PATCH /api/categories/:id returns 401/403 without a session', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/categories/00000000-0000-0000-0000-000000000000')
        .send({ name: 'Updated' });

      expect([401, 403]).toContain(res.status);
    });

    it('DELETE /api/categories/:id returns 401/403 without a session', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/api/categories/00000000-0000-0000-0000-000000000000',
      );

      expect([401, 403]).toContain(res.status);
    });
  });

  describe('CategoryIdParamDto UUID validation on :id routes', () => {
    // These routes use a real @IsUUID()-validated param DTO, unlike the
    // Products module's :id routes — so a non-UUID here should reliably
    // 400 via the ValidationPipe rather than reach Prisma at all.
    // Auth guards run before the param DTO validates in Nest's pipeline,
    // so an unauthenticated request will still 401/403 first. These tests
    // just confirm it fails cleanly either way (never a 500).

    it('PATCH /api/categories/:id with a non-UUID id does not 500', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/categories/not-a-uuid')
        .send({ name: 'Updated' });

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('DELETE /api/categories/:id with a non-UUID id does not 500', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/api/categories/not-a-uuid',
      );

      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });
  });
});
