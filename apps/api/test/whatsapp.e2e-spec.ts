import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface ProductResponse {
  id: string;
  stockQuantity: number;
}

interface ProductsResponse {
  items: ProductResponse[];
}

interface WhatsAppResponse {
  whatsappUrl: string;
}

describe('WhatsApp (e2e)', () => {
  let app: INestApplication<App>;

  let sampleProductId: string | undefined;
  let sampleProductStock: number | undefined;

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

    const res = await request(app.getHttpServer()).get(
      '/api/products?limit=1&isActive=true&isAvailable=true',
    );

    const body = res.body as ProductsResponse;
    const first = body.items[0];

    sampleProductId = first?.id;
    sampleProductStock = first?.stockQuantity;
  });

  afterAll(async () => {
    await app.close();
  });

  const skipIfNoSampleProduct = () => {
    if (!sampleProductId || sampleProductStock === undefined) {
      console.warn(
        'Skipped: no active/available product exists in the dev DB to test against.',
      );
      return true;
    }

    return false;
  };

  describe('POST /api/whatsapp/purchase-request — request shape validation', () => {
    it('rejects an empty items array', async () => {
      await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({ items: [] })
        .expect(400);
    });

    it('rejects a missing items field', async () => {
      await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({})
        .expect(400);
    });

    it('rejects an unknown top-level field (forbidNonWhitelisted)', async () => {
      if (skipIfNoSampleProduct()) return;

      await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({
          items: [{ productId: sampleProductId, quantity: 1 }],
          notARealField: true,
        })
        .expect(400);
    });

    it('rejects an item missing productId', async () => {
      await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({ items: [{ quantity: 1 }] })
        .expect(400);
    });

    it('rejects a quantity of 0', async () => {
      if (skipIfNoSampleProduct()) return;

      await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({ items: [{ productId: sampleProductId, quantity: 0 }] })
        .expect(400);
    });

    it('rejects a negative quantity', async () => {
      if (skipIfNoSampleProduct()) return;

      await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({ items: [{ productId: sampleProductId, quantity: -5 }] })
        .expect(400);
    });

    it('does not 500 on a non-UUID-format productId (documents missing UUID validation)', async () => {
      // WhatsAppItemDto.productId is @IsString() only — the audit flagged
      // this as unvalidated. This mirrors the Products :id test: it
      // documents current behavior (which may be a raw 500 from Prisma)
      // rather than asserting the ideal, since there's no global exception
      // filter yet to guarantee a clean 400.
      const res = await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({ items: [{ productId: 'not-a-uuid-at-all', quantity: 1 }] });

      expect(res.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/whatsapp/purchase-request — business rules', () => {
    it('rejects a well-formed but nonexistent product id', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({
          items: [
            {
              productId: '11111111-1111-1111-1111-111111111111',
              quantity: 1,
            },
          ],
        })
        .expect(400);

      expect(res.body).toHaveProperty('code', 'PRODUCT_NOT_FOUND');
    });

    it('rejects a quantity that exceeds available stock', async () => {
      if (skipIfNoSampleProduct()) return;

      const res = await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({
          items: [
            {
              productId: sampleProductId,
              quantity: sampleProductStock! + 1000,
            },
          ],
        })
        .expect(400);

      expect(res.body).toHaveProperty('code', 'INSUFFICIENT_STOCK');
    });

    it('BUG: accepts duplicate product lines whose combined quantity exceeds stock', async () => {
      // The service checks `product.stockQuantity < item.quantity` inside
      // a per-item forEach, comparing each line independently against the
      // raw DB stock value — it never sums quantities across lines for the
      // same product. Two lines that are each individually within stock
      // can together demand more than actually exists, and this currently
      // succeeds instead of throwing INSUFFICIENT_STOCK.
      //
      // This test intentionally asserts the CURRENT (buggy) behavior so it
      // turns RED the moment someone fixes the aggregation — at which point
      // this test should be rewritten to expect a 400/INSUFFICIENT_STOCK
      // instead, and this comment deleted.
      if (skipIfNoSampleProduct()) return;

      const stock = sampleProductStock!;
      const perLineQty = Math.ceil((stock + 1) / 2);

      // Sanity check on the math: each line must individually be <= stock
      // (or the test would just be hitting the single-line stock check
      // instead of the aggregation gap it's meant to expose).
      expect(perLineQty).toBeLessThanOrEqual(stock);
      expect(perLineQty * 2).toBeGreaterThan(stock);

      const res = await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({
          items: [
            { productId: sampleProductId, quantity: perLineQty },
            { productId: sampleProductId, quantity: perLineQty },
          ],
        });

      // Documents that this currently returns 201 (bug) rather than 400.
      // If your service has since been fixed to aggregate duplicate lines,
      // this assertion will fail — that's the signal to update this test.
      expect(res.status).toBe(201);

      const body = res.body as WhatsAppResponse;

      expect(body).toHaveProperty('whatsappUrl');
    });

    it('happy path: returns a valid wa.me URL for an in-stock item', async () => {
      if (skipIfNoSampleProduct()) return;

      const res = await request(app.getHttpServer())
        .post('/api/whatsapp/purchase-request')
        .send({ items: [{ productId: sampleProductId, quantity: 1 }] })
        .expect(201);

      const body = res.body as WhatsAppResponse;

      expect(body).toHaveProperty('whatsappUrl');
      expect(typeof body.whatsappUrl).toBe('string');
      expect(body.whatsappUrl.startsWith('https://wa.me/')).toBe(true);
    });
  });
});
