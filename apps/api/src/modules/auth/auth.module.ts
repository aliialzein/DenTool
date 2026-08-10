import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersRepository } from './repositories/users.repository';
import { SessionsRepository } from './repositories/sessions.repository';
import { SessionGuard } from './guards/session.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    UsersRepository,
    SessionsRepository,
    SessionGuard,
    RateLimitGuard,
    CsrfGuard,
    AdminGuard,
  ],
  exports: [SessionGuard, CsrfGuard, AdminGuard],
})
export class AuthModule {}
