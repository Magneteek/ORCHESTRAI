# Performance Tuning Guide

Comprehensive guide for optimizing Facebook Ads Manager performance in production.

## Table of Contents

1. [Overview](#overview)
2. [Database Optimization](#database-optimization)
3. [Redis Configuration](#redis-configuration)
4. [Next.js Optimization](#next-js-optimization)
5. [Nginx Optimization](#nginx-optimization)
6. [System-Level Optimization](#system-level-optimization)
7. [Monitoring Performance](#monitoring-performance)
8. [Load Testing](#load-testing)

---

## Overview

### Performance Goals

- **Page Load Time**: < 2 seconds
- **API Response Time**: < 500ms
- **Database Queries**: < 100ms average
- **Cache Hit Ratio**: > 95%
- **Lighthouse Score**: > 90 all metrics

### Optimization Strategy

1. **Database**: Indexes, query optimization, connection pooling
2. **Caching**: Redis for sessions, API responses, computed data
3. **Frontend**: Code splitting, image optimization, prefetching
4. **Server**: Nginx caching, compression, HTTP/2
5. **System**: Resource allocation, kernel tuning

---

## Database Optimization

### 1. Index Analysis and Creation

```sql
-- Connect to database
psql -U fbads facebook_ads_manager

-- Check missing indexes
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
    AND n_distinct > 100
    AND correlation < 0.1
ORDER BY n_distinct DESC;

-- Create indexes on frequently queried columns
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Campaign_tenantId_idx"
    ON "Campaign"("tenantId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Campaign_status_idx"
    ON "Campaign"("status");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Campaign_userId_idx"
    ON "Campaign"("userId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Ad_adSetId_idx"
    ON "Ad"("adSetId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "AdSet_campaignId_idx"
    ON "AdSet"("campaignId");

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Campaign_tenant_status_idx"
    ON "Campaign"("tenantId", "status");

CREATE INDEX CONCURRENTLY IF NOT EXISTS "Campaign_user_created_idx"
    ON "Campaign"("userId", "createdAt" DESC);

-- Index for analytics queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "Analytics_campaign_date_idx"
    ON "Analytics"("campaignId", "date" DESC);

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 2. Query Optimization

```sql
-- Analyze slow queries
-- Enable slow query logging in postgresql.conf:
-- log_min_duration_statement = 1000  # Log queries > 1s

-- Analyze specific query
EXPLAIN ANALYZE
SELECT c.*, u.name as userName
FROM "Campaign" c
JOIN "User" u ON c."userId" = u.id
WHERE c."tenantId" = 'tenant-123'
    AND c."status" = 'ACTIVE'
ORDER BY c."createdAt" DESC
LIMIT 20;

-- Optimize with proper indexes and query structure
-- Use EXPLAIN ANALYZE to verify index usage

-- View query statistics
SELECT
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### 3. Connection Pooling

Configure Prisma connection pooling:

File: `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // Connection pool settings
  connection_limit = 20
  pool_timeout = 30
  connect_timeout = 10
}
```

Environment variables:

```env
# DATABASE_URL with pooling parameters
DATABASE_URL="postgresql://fbads:password@localhost:5432/facebook_ads_manager?connection_limit=20&pool_timeout=30"

# For production, consider using PgBouncer
# DATABASE_URL="postgresql://fbads:password@pgbouncer:6432/facebook_ads_manager"
```

### 4. Database Configuration

Edit PostgreSQL configuration for 4GB RAM droplet:

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

```conf
# Memory Configuration
shared_buffers = 1GB                    # 25% of RAM
effective_cache_size = 3GB              # 75% of RAM
maintenance_work_mem = 256MB
work_mem = 5MB                          # Per operation

# Checkpoint Configuration
checkpoint_completion_target = 0.9
wal_buffers = 16MB
min_wal_size = 1GB
max_wal_size = 4GB

# Planner Configuration
default_statistics_target = 100
random_page_cost = 1.1                  # For SSD
effective_io_concurrency = 200          # For SSD

# Connection Configuration
max_connections = 200

# Logging
log_min_duration_statement = 1000       # Log slow queries (>1s)
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Autovacuum (important for performance)
autovacuum = on
autovacuum_max_workers = 3
autovacuum_naptime = 1min
autovacuum_vacuum_threshold = 50
autovacuum_analyze_threshold = 50
```

Restart PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 5. Regular Maintenance

```sql
-- Vacuum and analyze (run weekly)
VACUUM ANALYZE;

-- For specific tables
VACUUM ANALYZE "Campaign";
VACUUM ANALYZE "AdSet";
VACUUM ANALYZE "Ad";

-- Reindex if needed (monthly)
REINDEX DATABASE facebook_ads_manager;

-- Update statistics
ANALYZE;
```

Create maintenance script:

```bash
#!/bin/bash
# /usr/local/bin/db-maintenance.sh

psql -U fbads facebook_ads_manager << EOF
-- Vacuum and analyze
VACUUM ANALYZE;

-- Check bloat
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_dead_tup AS dead_tuples
FROM pg_stat_user_tables
WHERE n_dead_tup > 1000
ORDER BY n_dead_tup DESC;
EOF
```

```bash
# Schedule weekly (Sunday 3 AM)
crontab -e
0 3 * * 0 /usr/local/bin/db-maintenance.sh >> /var/log/db-maintenance.log 2>&1
```

---

## Redis Configuration

### 1. Redis Configuration

```bash
sudo nano /etc/redis/redis.conf
```

```conf
# Memory Management
maxmemory 512mb
maxmemory-policy allkeys-lru          # Evict least recently used keys

# Persistence
save 900 1                             # Save after 900s if 1 key changed
save 300 10                            # Save after 300s if 10 keys changed
save 60 10000                          # Save after 60s if 10000 keys changed

appendonly yes                         # Enable AOF
appendfsync everysec                   # Fsync every second

# Performance
tcp-backlog 511
timeout 300
tcp-keepalive 300

# Slow log
slowlog-log-slower-than 10000         # Log operations > 10ms
slowlog-max-len 128

# Client output buffer limits
client-output-buffer-limit normal 0 0 0
client-output-buffer-limit replica 256mb 64mb 60
client-output-buffer-limit pubsub 32mb 8mb 60
```

Restart Redis:

```bash
sudo systemctl restart redis-server
```

### 2. Redis Caching Strategy

Implement caching in application:

File: `lib/redis.ts`

```typescript
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Cache wrapper function
export async function cacheWrapper<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  // Try to get from cache
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // Fetch and cache
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

// Common cache keys
export const CACHE_KEYS = {
  campaign: (id: string) => `campaign:${id}`,
  campaignList: (tenantId: string) => `campaigns:${tenantId}`,
  analytics: (campaignId: string, date: string) => `analytics:${campaignId}:${date}`,
  template: (id: string) => `template:${id}`,
  user: (id: string) => `user:${id}`,
};

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  short: 60,           // 1 minute
  medium: 300,         // 5 minutes
  long: 3600,          // 1 hour
  day: 86400,          // 24 hours
};

export { redis };
```

Usage example:

```typescript
// In API route
import { cacheWrapper, CACHE_KEYS, CACHE_TTL } from '@/lib/redis';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  const campaigns = await cacheWrapper(
    CACHE_KEYS.campaignList(tenantId),
    CACHE_TTL.medium,
    async () => {
      return await prisma.campaign.findMany({
        where: { tenantId },
        include: { adSets: true },
      });
    }
  );

  return Response.json(campaigns);
}
```

### 3. Cache Invalidation

```typescript
// lib/cache-invalidation.ts
import { redis, CACHE_KEYS } from './redis';

export async function invalidateCampaignCache(campaignId: string, tenantId: string) {
  await redis.del(CACHE_KEYS.campaign(campaignId));
  await redis.del(CACHE_KEYS.campaignList(tenantId));
}

export async function invalidateAnalyticsCache(campaignId: string) {
  // Delete all analytics cache for campaign
  const pattern = `analytics:${campaignId}:*`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### 4. Redis Monitoring

```bash
# Connect to Redis CLI
redis-cli

# Monitor commands
MONITOR

# Get statistics
INFO stats

# Check memory usage
INFO memory

# Check slow log
SLOWLOG GET 10

# Check key patterns
KEYS pattern*

# Count keys
DBSIZE

# Exit
exit
```

---

## Next.js Optimization

### 1. Build Configuration

File: `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for production
  output: 'standalone',

  // Image optimization
  images: {
    domains: ['facebook.com', 'fbcdn.net'],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression
  compress: true,

  // Production optimizations
  productionBrowserSourceMaps: false,

  // React strict mode
  reactStrictMode: true,

  // Bundle analyzer (development only)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },

  // Experimental features
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', 'recharts', 'd3'],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 2. Code Splitting

Implement dynamic imports for heavy components:

```typescript
// Instead of:
import HeavyComponent from '@/components/HeavyComponent';

// Use dynamic import:
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable SSR if not needed
});
```

### 3. Image Optimization

```typescript
import Image from 'next/image';

// Use Next.js Image component
<Image
  src="/campaign-banner.jpg"
  alt="Campaign"
  width={800}
  height={400}
  priority={false}
  loading="lazy"
  placeholder="blur"
/>
```

### 4. Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### 5. Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Configure in next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

---

## Nginx Optimization

### 1. Enable Compression

```nginx
# In nginx.conf or site config
http {
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/rss+xml
        font/truetype
        font/opentype
        application/vnd.ms-fontobject
        image/svg+xml;
    gzip_min_length 256;
}
```

### 2. Enable Caching

```nginx
server {
    # Static file caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js static files
    location /_next/static {
        proxy_pass http://facebook_ads_manager;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # API responses (short cache)
    location /api/ {
        proxy_pass http://facebook_ads_manager;
        proxy_cache_valid 200 5m;
        add_header X-Cache-Status $upstream_cache_status;
    }
}
```

### 3. Enable HTTP/2

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL optimization
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
}
```

### 4. Connection Optimization

```nginx
http {
    # Connection settings
    keepalive_timeout 65;
    keepalive_requests 100;

    # Upstream keepalive
    upstream facebook_ads_manager {
        server localhost:3001;
        keepalive 32;
    }

    # Buffer settings
    client_body_buffer_size 128k;
    client_max_body_size 10m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 16k;
}
```

---

## System-Level Optimization

### 1. Node.js Configuration

```bash
# Set Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=2048"  # 2GB

# Add to PM2 config
pm2 start npm --name "facebook-ads-manager" -- start \
  --node-args="--max-old-space-size=2048"
```

### 2. System Limits

```bash
# Increase file descriptors
sudo nano /etc/security/limits.conf

# Add:
* soft nofile 65536
* hard nofile 65536

# Apply immediately
ulimit -n 65536
```

### 3. Kernel Tuning

```bash
sudo nano /etc/sysctl.conf

# Add network optimizations:
net.core.somaxconn = 1024
net.ipv4.tcp_max_syn_backlog = 2048
net.ipv4.ip_local_port_range = 10000 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_tw_reuse = 1

# Apply changes
sudo sysctl -p
```

---

## Monitoring Performance

### 1. Performance Metrics Script

```bash
#!/bin/bash
# /usr/local/bin/performance-check.sh

echo "=== Performance Report ==="
echo "Generated: $(date)"
echo ""

# API response time
echo "API Response Time:"
curl -w "Total: %{time_total}s\n" -o /dev/null -s http://localhost:3001/api/health

# Database query time
echo ""
echo "Database Query Time:"
psql -U fbads facebook_ads_manager -c "\timing on" -c "SELECT COUNT(*) FROM \"Campaign\";"

# Cache hit ratio
echo ""
echo "Database Cache Hit Ratio:"
psql -U fbads facebook_ads_manager -c "SELECT round(blks_hit::numeric / (blks_hit + blks_read) * 100, 2) AS cache_hit_ratio FROM pg_stat_database WHERE datname = 'facebook_ads_manager';"

# Redis stats
echo ""
echo "Redis Stats:"
redis-cli INFO stats | grep "ops_per_sec"

# System resources
echo ""
echo "System Resources:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')%"
echo "Memory: $(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')"
echo "Disk: $(df -h / | awk 'NR==2{print $5}')"
```

### 2. Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 http://localhost:3001/api/campaigns

# Install k6 for advanced testing
curl -L https://github.com/grafana/k6/releases/download/v0.42.0/k6-v0.42.0-linux-amd64.tar.gz | tar xvz
sudo cp k6-v0.42.0-linux-amd64/k6 /usr/local/bin/
```

Load test script:

```javascript
// loadtest.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },  // Ramp up to 10 users
    { duration: '3m', target: 10 },  // Stay at 10 users
    { duration: '1m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
  },
};

export default function () {
  const res = http.get('http://localhost:3001/api/campaigns');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
```

```bash
# Run load test
k6 run loadtest.js
```

---

## Performance Checklist

- [ ] Database indexes created
- [ ] Query performance analyzed
- [ ] Connection pooling configured
- [ ] Redis caching implemented
- [ ] Next.js optimizations applied
- [ ] Nginx compression enabled
- [ ] Static file caching configured
- [ ] HTTP/2 enabled
- [ ] SSL optimized
- [ ] System limits increased
- [ ] Performance monitoring setup
- [ ] Load testing completed

---

## Additional Resources

- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [PostgreSQL Performance](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Optimization](https://redis.io/docs/manual/optimization/)
- [Nginx Tuning](https://www.nginx.com/blog/tuning-nginx/)
