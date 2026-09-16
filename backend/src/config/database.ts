/**
 * Prisma client singleton with connection pooling configuration.
 * Uses a single instance across the application to avoid connection exhaustion.
 */

import { PrismaClient } from '@prisma/client';
import { env } from './env';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.isDevelopment) {
  globalForPrisma.prisma = prisma;
}
