import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Health check endpoint for production monitoring
// Checks database, Redis, and external API connectivity

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    externalAPIs: ServiceHealth;
  };
  environment: string;
  version: string;
  uptime: number;
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
}

// Cache Prisma and Redis clients to avoid creating new connections on each request
let prisma: PrismaClient | null = null;
let redis: Redis | null = null;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

function getRedisClient() {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
    });
  }
  return redis;
}

async function checkDatabase(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: responseTime < 1000 ? 'up' : 'degraded',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const client = getRedisClient();

    // Ensure connection
    if (client.status !== 'ready') {
      await client.connect();
    }

    // Simple ping test
    await client.ping();

    // Test set/get operations
    const testKey = 'health_check_test';
    await client.set(testKey, 'ok', 'EX', 60);
    const result = await client.get(testKey);

    if (result !== 'ok') {
      throw new Error('Redis read/write test failed');
    }

    const responseTime = Date.now() - start;

    return {
      status: responseTime < 500 ? 'up' : 'degraded',
      responseTime,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown Redis error',
    };
  }
}

async function checkExternalAPIs(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    // Check if API keys are configured
    const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY;
    const hasFacebookKey = !!process.env.FACEBOOK_APP_ID && !!process.env.FACEBOOK_APP_SECRET;

    if (!hasAnthropicKey || !hasFacebookKey) {
      return {
        status: 'degraded',
        responseTime: Date.now() - start,
        error: 'Some API keys are not configured',
      };
    }

    // In production, you might want to make actual API calls here
    // For now, we just check if the keys are present
    return {
      status: 'up',
      responseTime: Date.now() - start,
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown external API error',
    };
  }
}

export async function GET() {
  const startTime = Date.now();

  try {
    // Run all health checks in parallel
    const [database, redis, externalAPIs] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkExternalAPIs(),
    ]);

    // Determine overall health status
    const allUp = [database, redis, externalAPIs].every((service) => service.status === 'up');
    const anyDown = [database, redis, externalAPIs].some((service) => service.status === 'down');

    const overallStatus: 'healthy' | 'degraded' | 'unhealthy' = anyDown
      ? 'unhealthy'
      : allUp
      ? 'healthy'
      : 'degraded';

    const result: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database,
        redis,
        externalAPIs,
      },
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    };

    // Return appropriate HTTP status code
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(result, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    const result: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'down', error: 'Health check failed' },
        redis: { status: 'down', error: 'Health check failed' },
        externalAPIs: { status: 'down', error: 'Health check failed' },
      },
      environment: process.env.NODE_ENV || 'unknown',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
    };

    return NextResponse.json(result, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

// Cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    if (prisma) {
      await prisma.$disconnect();
    }
    if (redis) {
      await redis.quit();
    }
  });
}
