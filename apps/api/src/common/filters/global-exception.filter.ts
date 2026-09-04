import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { LoggerService } from '@nestjs/common';
import { Request, Response } from 'express';

import { ApiErrorResponse } from '../types/api-error-response.type';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'An unexpected error occurred.';
    let details: unknown;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      this.logger.warn(
        `HTTP ${statusCode} on ${request.method} ${request.url}`,
        GlobalExceptionFilter.name,
      );

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        code = this.getDefaultErrorCode(statusCode);
      } else {
        const errorResponse = exceptionResponse as Record<string, unknown>;

        if (typeof errorResponse.code === 'string') {
          code = errorResponse.code;
        } else {
          code = this.getDefaultErrorCode(statusCode);
        }

        if (typeof errorResponse.message === 'string') {
          message = errorResponse.message;
        } else if (Array.isArray(errorResponse.message)) {
          message = 'Validation failed.';
          details = {
            errors: errorResponse.message,
          };
        }

        const additionalDetails = Object.fromEntries(
          Object.entries(errorResponse).filter(
            ([key]) =>
              !['statusCode', 'code', 'message', 'error'].includes(key),
          ),
        );

        if (Object.keys(additionalDetails).length > 0) {
          details = {
            ...(typeof details === 'object' && details !== null ? details : {}),
            ...additionalDetails,
          };
        }
      }
    } else {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : undefined,
        GlobalExceptionFilter.name,
      );
    }

    const errorResponse: ApiErrorResponse = {
      statusCode,
      code,
      message,
      timestamp,
      ...(details !== undefined && { details }),
    };

    response.status(statusCode).json(errorResponse);
  }

  private getDefaultErrorCode(statusCode: number): string {
    const errorCodes: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
    };

    return errorCodes[statusCode] ?? 'HTTP_ERROR';
  }
}
