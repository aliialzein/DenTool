import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined at Prisma initialization');
    }

    try {
      const parsedUrl = new URL(databaseUrl);

      console.log('[Prisma] Database configuration:', {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        database: parsedUrl.pathname,
        sslmode: parsedUrl.searchParams.get('sslmode'),
        pgbouncer: parsedUrl.searchParams.get('pgbouncer'),
      });
    } catch {
      throw new Error('DATABASE_URL is not a valid PostgreSQL URL');
    }

    const adapter = new PrismaPg({
      connectionString: databaseUrl,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
