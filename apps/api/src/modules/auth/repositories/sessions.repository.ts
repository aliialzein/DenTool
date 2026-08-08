import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class SessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });
  }

  async findByTokenHash(tokenHash: string) {
    return this.prisma.session.findFirst({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async deleteSession(id: string) {
    return this.prisma.session.deleteMany({
      where: { id },
    });
  }

  async deleteAllUserSessions(userId: string) {
    return this.prisma.session.deleteMany({
      where: { userId },
    });
  }
}
