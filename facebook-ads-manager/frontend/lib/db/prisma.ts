import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Connection pooling configuration
export const getPrismaClient = () => {
  return prisma;
};

// Graceful shutdown
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};

process.on('beforeExit', async () => {
  await disconnectPrisma();
});

// Export type for Prisma Client
export type PrismaClientType = typeof prisma;
