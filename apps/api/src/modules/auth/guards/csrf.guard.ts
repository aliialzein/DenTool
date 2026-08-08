import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const headerToken = request.headers['x-csrf-token'];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const cookieToken = request.cookies?.['x-csrf-token'];

    if (typeof headerToken !== 'string' || typeof cookieToken !== 'string') {
      throw new ForbiddenException('CSRF token missing');
    }

    if (headerToken !== cookieToken) {
      throw new ForbiddenException('CSRF token invalid');
    }

    return true;
  }
}
