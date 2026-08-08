/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { SESSION_COOKIE_NAME } from '../constants/auth.constants';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { authUser?: unknown }>();
    const sessionToken = request.cookies?.[SESSION_COOKIE_NAME];

    const user = await this.authService.getCurrentUser(sessionToken);

    if (!user) {
      throw new UnauthorizedException();
    }

    request.authUser = user;

    return true;
  }
}
