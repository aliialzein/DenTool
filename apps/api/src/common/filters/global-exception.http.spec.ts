import {
  Controller,
  Get,
  INestApplication,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { GlobalExceptionFilter } from './global-exception.filter';

interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  details?: unknown;
}

@Controller('errors')
class TestErrorsController {
  @Get('product-not-found')
  productNotFound() {
    throw new NotFoundException({
      code: 'PRODUCT_NOT_FOUND',
      message: 'Product not found.',
    });
  }

  @Get('unauthorized')
  unauthorized() {
    throw new UnauthorizedException('Invalid credentials');
  }

  @Get('unexpected')
  unexpected() {
    throw new Error('Unexpected failure');
  }
}

describe('GlobalExceptionFilter HTTP integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestErrorsController],
    }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return the custom application error code', async () => {
    const response = await request(app.getHttpServer())
      .get('/errors/product-not-found')
      .expect(404);

    const body = response.body as ErrorResponse;

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      }),
    );

    expect(typeof body.timestamp).toBe('string');
  });

  it('should generate a default code for normal Nest exceptions', async () => {
    const response = await request(app.getHttpServer())
      .get('/errors/unauthorized')
      .expect(401);

    const body = response.body as ErrorResponse;

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      }),
    );

    expect(typeof body.timestamp).toBe('string');
  });

  it('should hide unexpected internal error details', async () => {
    const response = await request(app.getHttpServer())
      .get('/errors/unexpected')
      .expect(500);

    const body = response.body as ErrorResponse;

    expect(body).toEqual(
      expect.objectContaining({
        statusCode: 500,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred.',
      }),
    );

    expect(typeof body.timestamp).toBe('string');

    expect(body.message).not.toContain('Unexpected failure');
  });
});
