import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly entries = new Map<string, RateLimitEntry>();
  private readonly maxRequests = 5;
  private readonly windowMs = 15 * 60 * 1000;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const endpoint = this.getEndpoint(request.path);
    const key = `${request.ip ?? 'unknown'}:${endpoint}`;
    const now = Date.now();

    const existing = this.entries.get(key);

    if (existing && existing.resetAt > now) {
      if (existing.count >= this.maxRequests) {
        throw new HttpException(
          'Too many requests',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      this.entries.set(key, {
        count: existing.count + 1,
        resetAt: existing.resetAt,
      });
      return true;
    }

    this.entries.set(key, {
      count: 1,
      resetAt: now + this.windowMs,
    });

    return true;
  }

  private getEndpoint(path: string): string {
    if (path.includes('/auth/login')) {
      return '/auth/login';
    }

    if (path.includes('/auth/logout')) {
      return '/auth/logout';
    }

    if (path.includes('/auth/forgot-password')) {
      return '/auth/forgot-password';
    }

    if (path.includes('/auth/verify-reset-otp')) {
      return '/auth/verify-reset-otp';
    }

    if (path.includes('/auth/reset-password')) {
      return '/auth/reset-password';
    }

    return path;
  }
}
