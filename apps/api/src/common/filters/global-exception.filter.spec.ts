import {
  ArgumentsHost,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { GlobalExceptionFilter } from './global-exception.filter';
interface ErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

describe('GlobalExceptionFilter', () => {
  const filter = new GlobalExceptionFilter();

  const createMockHost = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({
      json,
    });

    const response = {
      status,
    };

    const request = {
      method: 'GET',
      url: '/api/test',
    };

    const switchToHttp = jest.fn().mockReturnValue({
      getResponse: () => response,
      getRequest: () => request,
    });

    const host = {
      switchToHttp,
    } as unknown as ArgumentsHost;

    return {
      host,
      status,
      json,
    };
  };

  it('should preserve application error codes', () => {
    const { host, status, json } = createMockHost();

    filter.catch(
      new NotFoundException({
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(404);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        code: 'PRODUCT_NOT_FOUND',
        message: 'Product not found.',
      }),
    );

    const jsonMock = json as jest.Mock<void, [ErrorResponse]>;
    const response = jsonMock.mock.calls[0]?.[0];

    expect(response).toBeDefined();
    expect(response?.timestamp).toEqual(expect.any(String));
  });

  it('should generate default codes for simple exceptions', () => {
    const { host, status, json } = createMockHost();

    filter.catch(new UnauthorizedException('Invalid credentials'), host);

    expect(status).toHaveBeenCalledWith(401);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Invalid credentials',
      }),
    );
  });

  it('should preserve additional error details', () => {
    const { host, json } = createMockHost();

    filter.catch(
      new ConflictException({
        code: 'CATEGORY_NOT_EMPTY',
        message: 'Category cannot be deleted.',
        categoryId: '123',
      }),
      host,
    );

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        code: 'CATEGORY_NOT_EMPTY',
        message: 'Category cannot be deleted.',
        details: {
          categoryId: '123',
        },
      }),
    );
  });
});
