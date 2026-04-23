import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Singleton pattern para PrismaClient
// Buena práctica: evita múltiples conexiones en hot-reload (desarrollo)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.IS_PRODUCTION || env.IS_TEST ? ['error'] : ['error', 'warn'],
  });

if (!env.IS_PRODUCTION) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
