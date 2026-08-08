import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { SESSION_TTL_MS, ARGON2_OPTIONS } from './constants/auth.constants';
import { SessionsRepository } from './repositories/sessions.repository';
import { UsersRepository } from './repositories/users.repository';
import { hashPassword, verifyPassword } from './utils/password.util';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import { hashSessionToken } from './utils/session.util';

interface FailedLoginAttempt {
  count: number;
  resetAt: number;
}

@Injectable()
export class AuthService {
  private readonly failedLoginAttempts = new Map<string, FailedLoginAttempt>();
  private readonly maxFailedAttempts = 5;
  private readonly failedAttemptWindowMs = 15 * 60 * 1000;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly sessionsRepository: SessionsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await verifyPassword(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }

  async validateUserWithAttemptTracking(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();

    if (this.isEmailLocked(normalizedEmail)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      const user = await this.validateUser(email, password);
      this.clearFailedAttempts(normalizedEmail);
      return user;
    } catch (error) {
      this.recordFailedAttempt(normalizedEmail);
      throw error;
    }
  }

  async createSession(userId: string) {
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashSessionToken(rawToken);
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await this.sessionsRepository.createSession(userId, tokenHash, expiresAt);

    return { rawToken, expiresAt };
  }

  async getCurrentUser(
    sessionToken: string | undefined,
  ): Promise<AuthenticatedUser | null> {
    if (!sessionToken) {
      return null;
    }

    const sessionHash = hashSessionToken(sessionToken);
    const session = await this.sessionsRepository.findByTokenHash(sessionHash);

    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      await this.sessionsRepository.deleteSession(session.id);
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
    };
  }

  async logout(sessionToken: string | undefined) {
    if (!sessionToken) {
      return;
    }

    const sessionHash = hashSessionToken(sessionToken);
    const session = await this.sessionsRepository.findByTokenHash(sessionHash);

    if (session) {
      await this.sessionsRepository.deleteSession(session.id);
    }
  }

  async forgotPassword(email: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (user) {
      const otp = this.generateOtp();
      const otpHash = await argon2.hash(otp, ARGON2_OPTIONS);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await this.prisma.passwordReset.create({
        data: {
          userId: user.id,
          otpHash,
          expiresAt,
          attempts: 0,
        },
      });
    }

    return {
      message:
        'If an account exists with this email, you will receive a password reset link',
    };
  }

  async verifyResetOtp(email: string, otp: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Reset OTP expired');
    }

    if (resetRecord.attempts >= 3) {
      throw new UnauthorizedException('Too many OTP attempts');
    }

    const isOtpValid = await argon2.verify(resetRecord.otpHash, otp);

    if (!isOtpValid) {
      await this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { attempts: resetRecord.attempts + 1 },
      });
      throw new UnauthorizedException('Invalid OTP');
    }

    await this.prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { verifiedAt: new Date() },
    });

    return { verified: true };
  }

  async resetPassword(email: string, otp: string, newPassword: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Reset OTP expired');
    }

    if (!resetRecord.verifiedAt) {
      throw new UnauthorizedException('OTP not verified');
    }

    const isOtpValid = await argon2.verify(resetRecord.otpHash, otp);

    if (!isOtpValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const passwordHash = await hashPassword(newPassword);

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      await tx.passwordReset.deleteMany({
        where: { userId: user.id },
      });
      await tx.session.deleteMany({
        where: { userId: user.id },
      });
    });

    return { success: true };
  }

  async cleanupExpiredSessions() {
    await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  private isEmailLocked(normalizedEmail: string): boolean {
    const now = Date.now();
    const attempt = this.failedLoginAttempts.get(normalizedEmail);

    if (!attempt) {
      return false;
    }

    if (attempt.resetAt <= now) {
      this.failedLoginAttempts.delete(normalizedEmail);
      return false;
    }

    return attempt.count >= this.maxFailedAttempts;
  }

  private recordFailedAttempt(normalizedEmail: string): void {
    const now = Date.now();
    const existing = this.failedLoginAttempts.get(normalizedEmail);

    if (existing && existing.resetAt > now) {
      this.failedLoginAttempts.set(normalizedEmail, {
        count: existing.count + 1,
        resetAt: existing.resetAt,
      });
    } else {
      this.failedLoginAttempts.set(normalizedEmail, {
        count: 1,
        resetAt: now + this.failedAttemptWindowMs,
      });
    }
  }

  private clearFailedAttempts(normalizedEmail: string): void {
    this.failedLoginAttempts.delete(normalizedEmail);
  }

  private generateOtp() {
    return randomBytes(3).toString('hex').toUpperCase();
  }
}
