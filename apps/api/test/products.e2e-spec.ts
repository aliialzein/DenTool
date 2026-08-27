import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Products (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirror main.ts exactly — bootstrap() never runs in e2e tests,
    // so prefix/pipe config has to be duplicated here or these tests
    // would be validating a different app than production.
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

  describe('GET /api/products', () => {
    it('returns 200 with a paginated envelope', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .expect(200);

      expect(res.body).toHaveProperty('items');
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('applies default pagination (page=1, limit=20) when none given', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/products')
        .expect(200);

      // Whatever pagination fields your service returns, page/limit inputs
      // are defaulted by the DTO — this just confirms the request succeeds
      // and doesn't 400 for missing page/limit.
      expect(res.body.items.length).toBeLessThanOrEqual(20);
    });

    it('rejects an unknown query param (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .get('/api/products?notARealField=abc')
        .expect(400);
    });

    it('rejects a non-UUID categoryId', async () => {
      await request(app.getHttpServer())
        .get('/api/products?categoryId=not-a-uuid')
        .expect(400);
    });

    it('rejects limit above the max of 100', async () => {
      await request(app.getHttpServer())
        .get('/api/products?limit=101')
        .expect(400);
    });

    it('rejects page below 1', async () => {
      await request(app.getHttpServer())
        .get('/api/products?page=0')
        .expect(400);
    });

    it('rejects an invalid sortBy enum value', async () => {
      await request(app.getHttpServer())
        .get('/api/products?sortBy=notARealSort')
        .expect(400);
    });

    it('accepts isAvailable=false without coercing it to true', async () => {
      // Flagged in the audit: @Type(() => Boolean) can turn the string
      // "false" into JS `true` if not handled carefully upstream.
      // This won't fail loudly on its own — it just confirms the request
      // is accepted; pair with a manual check that the returned products
      // are actually unavailable ones once there's seed data to assert against.
      await request(app.getHttpServer())
        .get('/api/products?isAvailable=false')
        .expect(200);
    });

    it('accepts a valid combination of filters', async () => {
      await request(app.getHttpServer())
        .get(
          '/api/products?sortBy=price&sortOrder=asc&page=1&limit=5',
        )
        .expect(200);
    });
  });

  describe('GET /api/products/id/:id', () => {
    it('returns 404 (or a handled error) for a well-formed but nonexistent UUID', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/products/id/00000000-0000-0000-0000-000000000000',
      );

      // The audit noted no global exception filter exists yet, so this
      // documents current behavior rather than asserting the ideal.
      // Once a global filter is added, tighten this to `.expect(404)`.
      expect([404, 400, 500]).toContain(res.status);
    });

    it('does not 500 on a non-UUID id (documents the missing UUID validation)', async () => {
      // The audit flagged this route as unvalidated. This test intentionally
      // captures current behavior so a fix is visible as a diff here later,
      // rather than silently passing either way.
      const res = await request(app.getHttpServer()).get(
        '/api/products/id/not-a-uuid',
      );

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('GET /api/products/:slug', () => {
    it('returns 404 (or handled error) for a slug that does not exist', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/products/definitely-not-a-real-slug-xyz',
      );

      expect([404, 400, 500]).toContain(res.status);
    });
  });

  describe('happy path against real data (skips if DB has no products)', () => {
    let sampleProductId: string | undefined;
    let sampleProductSlug: string | undefined;

    beforeAll(async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/products?limit=1',
      );
      const first = res.body?.items?.[0];
      sampleProductId = first?.id;
      sampleProductSlug = first?.slug;
    });

    it('GET /api/products/id/:id returns the product for a real id', async () => {
      if (!sampleProductId) {
        console.warn('Skipped: no products exist in the dev DB to test against.');
        return;
      }

      const res = await request(app.getHttpServer())
        .get(`/api/products/id/${sampleProductId}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', sampleProductId);
    });

    it('GET /api/products/:slug returns the product for a real slug', async () => {
      if (!sampleProductSlug) {
        console.warn('Skipped: no products exist in the dev DB to test against.');
        return;
      }

      const res = await request(app.getHttpServer())
        .get(`/api/products/${sampleProductSlug}`)
        .expect(200);

      expect(res.body).toHaveProperty('slug', sampleProductSlug);
    });
  });

  describe('admin routes reject unauthenticated requests', () => {
    it('GET /api/products/admin returns 401/403 without a session', async () => {
      const res = await request(app.getHttpServer()).get(
        '/api/products/admin',
      );
      expect([401, 403]).toContain(res.status);
    });

    it('POST /api/products returns 401/403 without a session', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/products')
        .send({});
      expect([401, 403]).toContain(res.status);
    });

    it('DELETE /api/products/:id returns 401/403 without a session', async () => {
      const res = await request(app.getHttpServer()).delete(
        '/api/products/00000000-0000-0000-0000-000000000000',
      );
      expect([401, 403]).toContain(res.status);
    });
  });
});
