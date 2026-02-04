# Production Monitoring Guide

Comprehensive monitoring setup for the Facebook Ads Manager in production.

## Table of Contents

1. [Overview](#overview)
2. [Application Monitoring with PM2](#application-monitoring-with-pm2)
3. [Health Check System](#health-check-system)
4. [Log Management](#log-management)
5. [Database Monitoring](#database-monitoring)
6. [Performance Monitoring](#performance-monitoring)
7. [Uptime Monitoring](#uptime-monitoring)
8. [Error Tracking](#error-tracking)
9. [Alerting Configuration](#alerting-configuration)
10. [Monitoring Dashboard](#monitoring-dashboard)

---

## Overview

### Monitoring Strategy

**Four Pillars of Observability:**

1. **Metrics** - System and application performance data
2. **Logs** - Event and error records
3. **Traces** - Request flow through system
4. **Health Checks** - Service availability status

### Key Metrics to Monitor

- **Application**: Response time, error rate, throughput
- **Database**: Connection pool, query performance, disk usage
- **System**: CPU, memory, disk I/O, network
- **External APIs**: Facebook API rate limits, response times

---

## Application Monitoring with PM2

### 1. PM2 Real-Time Monitoring

```bash
# Start monitoring dashboard
pm2 monit

# View in terminal:
# - CPU usage per process
# - Memory usage per process
# - Logs in real-time
```

### 2. PM2 Status Dashboard

```bash
# View all processes
pm2 status

# Expected output:
┌────┬────────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┐
│ id │ name                   │ mode        │ ↺       │ status  │ cpu      │ memory │ user │           │          │
├────┼────────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┤
│ 0  │ facebook-ads-manager   │ fork        │ 0       │ online  │ 0%       │ 150 MB │ deploy│           │          │
└────┴────────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┘

# Detailed information
pm2 show facebook-ads-manager

# Process metrics
pm2 describe facebook-ads-manager
```

### 3. PM2 Log Monitoring

```bash
# View all logs
pm2 logs

# View specific application logs
pm2 logs facebook-ads-manager

# View only errors
pm2 logs facebook-ads-manager --err

# View last 100 lines
pm2 logs facebook-ads-manager --lines 100

# Follow logs in real-time
pm2 logs facebook-ads-manager --nostream

# Clear logs
pm2 flush facebook-ads-manager
```

### 4. PM2 Log Rotation Setup

```bash
# Install PM2 log rotation module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M        # Max size before rotation
pm2 set pm2-logrotate:retain 7            # Keep last 7 logs
pm2 set pm2-logrotate:compress true       # Compress rotated logs
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:rotateModule true   # Rotate PM2 module logs
pm2 set pm2-logrotate:workerInterval 30   # Check every 30 seconds

# Verify configuration
pm2 conf pm2-logrotate
```

### 5. PM2 Process Monitoring

```bash
# Monitor restarts
pm2 logs | grep "errored"

# Check restart count
pm2 list | grep "restart"

# View restart history
pm2 show facebook-ads-manager | grep "restart"

# Auto-restart on file changes (development only)
pm2 start npm --name "facebook-ads-manager" --watch -- start
```

### 6. PM2 Cluster Monitoring

If using cluster mode:

```bash
# Monitor cluster instances
pm2 list

# Scale cluster
pm2 scale facebook-ads-manager 4  # Scale to 4 instances

# Reload without downtime
pm2 reload facebook-ads-manager

# Graceful reload
pm2 gracefulReload facebook-ads-manager
```

---

## Health Check System

### 1. Health Check Endpoint

Create comprehensive health check:

File: `/app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: 'connected' | 'disconnected' | 'error';
    redis: 'connected' | 'disconnected' | 'error';
    facebook: 'authenticated' | 'unauthenticated' | 'error';
    disk: {
      status: 'ok' | 'warning' | 'critical';
      usage: string;
    };
    memory: {
      status: 'ok' | 'warning' | 'critical';
      usage: string;
    };
  };
  version: string;
}

async function checkDatabase(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'connected';
  } catch (error) {
    console.error('Database health check failed:', error);
    return 'error';
  }
}

async function checkRedis(): Promise<'connected' | 'disconnected' | 'error'> {
  try {
    await redis.ping();
    return 'connected';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return 'error';
  }
}

async function checkFacebook(): Promise<'authenticated' | 'unauthenticated' | 'error'> {
  try {
    // Check if Facebook API credentials exist
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      return 'unauthenticated';
    }
    return 'authenticated';
  } catch (error) {
    console.error('Facebook health check failed:', error);
    return 'error';
  }
}

function checkDisk(): { status: 'ok' | 'warning' | 'critical'; usage: string } {
  // Simplified - in production, use actual disk monitoring
  const usage = '45%';
  const usageNum = parseInt(usage);

  if (usageNum > 90) return { status: 'critical', usage };
  if (usageNum > 80) return { status: 'warning', usage };
  return { status: 'ok', usage };
}

function checkMemory(): { status: 'ok' | 'warning' | 'critical'; usage: string } {
  const used = process.memoryUsage();
  const totalMem = require('os').totalmem();
  const freeMem = require('os').freemem();
  const usedPercent = ((totalMem - freeMem) / totalMem) * 100;
  const usage = `${usedPercent.toFixed(1)}%`;

  if (usedPercent > 90) return { status: 'critical', usage };
  if (usedPercent > 80) return { status: 'warning', usage };
  return { status: 'ok', usage };
}

export async function GET() {
  const startTime = Date.now();

  try {
    const [database, redis, facebook] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkFacebook(),
    ]);

    const disk = checkDisk();
    const memory = checkMemory();

    // Determine overall status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (database === 'error' || redis === 'error') {
      status = 'unhealthy';
    } else if (
      database === 'disconnected' ||
      redis === 'disconnected' ||
      disk.status === 'critical' ||
      memory.status === 'critical'
    ) {
      status = 'degraded';
    }

    const healthCheck: HealthCheck = {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database,
        redis,
        facebook,
        disk,
        memory,
      },
      version: process.env.npm_package_version || '1.0.0',
    };

    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        ...healthCheck,
        responseTime: `${responseTime}ms`,
      },
      {
        status: status === 'healthy' ? 200 : status === 'degraded' ? 503 : 500,
      }
    );
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
```

### 2. Testing Health Endpoint

```bash
# Test health endpoint
curl http://localhost:3001/api/health | jq

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "uptime": 3600,
  "checks": {
    "database": "connected",
    "redis": "connected",
    "facebook": "authenticated",
    "disk": {
      "status": "ok",
      "usage": "45%"
    },
    "memory": {
      "status": "ok",
      "usage": "62.5%"
    }
  },
  "version": "1.0.0",
  "responseTime": "45ms"
}
```

### 3. Automated Health Checks

Create monitoring script:

```bash
#!/bin/bash
# /usr/local/bin/health-check.sh

HEALTH_URL="http://localhost:3001/api/health"
ALERT_EMAIL="admin@example.com"

response=$(curl -s -w "\n%{http_code}" "$HEALTH_URL")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" != "200" ]; then
    echo "Health check failed with status: $http_code"
    echo "Response: $body"

    # Send alert email
    echo "$body" | mail -s "Health Check Alert - Facebook Ads Manager" "$ALERT_EMAIL"

    exit 1
fi

echo "Health check passed"
exit 0
```

```bash
# Make executable
chmod +x /usr/local/bin/health-check.sh

# Add to cron (every 5 minutes)
crontab -e
*/5 * * * * /usr/local/bin/health-check.sh >> /var/log/health-check.log 2>&1
```

---

## Log Management

### 1. Application Logs

```bash
# PM2 logs location
ls -la ~/.pm2/logs/

# View logs
tail -f ~/.pm2/logs/facebook-ads-manager-out.log
tail -f ~/.pm2/logs/facebook-ads-manager-error.log
```

### 2. Nginx Logs

```bash
# Access log
tail -f /var/log/nginx/facebook-ads-manager.access.log

# Error log
tail -f /var/log/nginx/facebook-ads-manager.error.log

# Filter for errors only
grep "error" /var/log/nginx/facebook-ads-manager.error.log

# Filter by status code
awk '$9 >= 500' /var/log/nginx/facebook-ads-manager.access.log
```

### 3. PostgreSQL Logs

```bash
# View PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Filter for errors
sudo grep "ERROR" /var/log/postgresql/postgresql-15-main.log

# Filter slow queries (if logging enabled)
sudo grep "duration:" /var/log/postgresql/postgresql-15-main.log | awk '$NF > 1000'
```

### 4. Centralized Logging

For production, consider centralized logging:

```bash
# Option 1: Filebeat + ELK Stack
# Install Filebeat
curl -L -O https://artifacts.elastic.co/downloads/beats/filebeat/filebeat-8.5.0-amd64.deb
sudo dpkg -i filebeat-8.5.0-amd64.deb

# Configure Filebeat
sudo nano /etc/filebeat/filebeat.yml

# Option 2: Logrotate for local management
sudo nano /etc/logrotate.d/facebook-ads-manager
```

Logrotate configuration:

```
/var/log/nginx/facebook-ads-manager*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    prerotate
        if [ -d /etc/logrotate.d/httpd-prerotate ]; then \
            run-parts /etc/logrotate.d/httpd-prerotate; \
        fi
    endscript
    postrotate
        invoke-rc.d nginx rotate >/dev/null 2>&1
    endscript
}
```

---

## Database Monitoring

### 1. Connection Monitoring

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity WHERE datname = 'facebook_ads_manager';

-- Connection details
SELECT
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change
FROM pg_stat_activity
WHERE datname = 'facebook_ads_manager'
ORDER BY query_start DESC;

-- Long-running queries
SELECT
    pid,
    now() - query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE state != 'idle'
    AND now() - query_start > interval '5 minutes'
ORDER BY duration DESC;
```

### 2. Performance Metrics

```sql
-- Database statistics
SELECT
    numbackends AS connections,
    xact_commit AS commits,
    xact_rollback AS rollbacks,
    blks_read AS disk_reads,
    blks_hit AS cache_hits,
    round(blks_hit::numeric / (blks_hit + blks_read) * 100, 2) AS cache_hit_ratio,
    tup_returned AS rows_returned,
    tup_fetched AS rows_fetched
FROM pg_stat_database
WHERE datname = 'facebook_ads_manager';

-- Table statistics
SELECT
    schemaname,
    tablename,
    n_tup_ins AS inserts,
    n_tup_upd AS updates,
    n_tup_del AS deletes,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
ORDER BY n_live_tup DESC;

-- Index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan AS scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### 3. Disk Usage

```sql
-- Database size
SELECT
    pg_size_pretty(pg_database_size('facebook_ads_manager')) AS db_size;

-- Table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Largest tables and indexes
SELECT
    relname AS name,
    relkind AS type,
    pg_size_pretty(pg_total_relation_size(oid)) AS size
FROM pg_class
WHERE relkind IN ('r', 'i')
ORDER BY pg_total_relation_size(oid) DESC
LIMIT 20;
```

### 4. Database Monitoring Script

```bash
#!/bin/bash
# /usr/local/bin/db-monitor.sh

PGUSER="fbads"
PGDATABASE="facebook_ads_manager"

echo "=== Database Monitoring Report ==="
echo "Generated: $(date)"
echo ""

echo "Active Connections:"
psql -U $PGUSER -d $PGDATABASE -c "SELECT count(*) FROM pg_stat_activity WHERE datname = '$PGDATABASE';"

echo ""
echo "Long Running Queries:"
psql -U $PGUSER -d $PGDATABASE -c "SELECT pid, now() - query_start AS duration, LEFT(query, 50) FROM pg_stat_activity WHERE state != 'idle' AND now() - query_start > interval '1 minute';"

echo ""
echo "Database Size:"
psql -U $PGUSER -d $PGDATABASE -c "SELECT pg_size_pretty(pg_database_size('$PGDATABASE'));"

echo ""
echo "Cache Hit Ratio:"
psql -U $PGUSER -d $PGDATABASE -c "SELECT round(blks_hit::numeric / (blks_hit + blks_read) * 100, 2) AS cache_hit_ratio FROM pg_stat_database WHERE datname = '$PGDATABASE';"
```

```bash
# Make executable
chmod +x /usr/local/bin/db-monitor.sh

# Run hourly
crontab -e
0 * * * * /usr/local/bin/db-monitor.sh >> /var/log/db-monitor.log 2>&1
```

---

## Performance Monitoring

### 1. Application Performance

Monitor with Next.js built-in metrics:

File: `/app/api/metrics/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  const metrics = {
    uptime: process.uptime(),
    memory: {
      rss: process.memoryUsage().rss,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed,
      external: process.memoryUsage().external,
    },
    cpu: process.cpuUsage(),
    eventLoop: {
      // Add event loop lag monitoring if needed
    },
  };

  return NextResponse.json(metrics);
}
```

### 2. Response Time Monitoring

```bash
# Test response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Create curl-format.txt
cat > /tmp/curl-format.txt << 'EOF'
    time_namelookup:  %{time_namelookup}s\n
       time_connect:  %{time_connect}s\n
    time_appconnect:  %{time_appconnect}s\n
   time_pretransfer:  %{time_pretransfer}s\n
      time_redirect:  %{time_redirect}s\n
 time_starttransfer:  %{time_starttransfer}s\n
                    ----------\n
         time_total:  %{time_total}s\n
EOF
```

### 3. System Resource Monitoring

```bash
# CPU usage
top -b -n1 | grep "Cpu(s)"

# Memory usage
free -h

# Disk I/O
iostat -x 1 3

# Network traffic
iftop -t -s 5
```

---

## Uptime Monitoring

### 1. External Monitoring Services

Configure external uptime monitoring:

**UptimeRobot** (Free):
- Monitor: https://your-domain.com
- Monitor: https://your-domain.com/api/health
- Interval: 5 minutes
- Alert: Email/SMS on downtime

**Pingdom**:
- HTTP check
- Response time tracking
- Alert on failures

### 2. Self-Hosted Monitoring

Use simple uptime script:

```bash
#!/bin/bash
# /usr/local/bin/uptime-monitor.sh

URL="https://your-domain.com"
EXPECTED_STATUS=200
ALERT_EMAIL="admin@example.com"

response=$(curl -s -o /dev/null -w "%{http_code}" "$URL")

if [ "$response" != "$EXPECTED_STATUS" ]; then
    echo "Site is down! Status: $response" | \
        mail -s "ALERT: Site Down" "$ALERT_EMAIL"
    exit 1
fi

exit 0
```

```bash
# Run every minute
crontab -e
* * * * * /usr/local/bin/uptime-monitor.sh
```

---

## Error Tracking

### 1. Application Error Tracking

Add error tracking to application:

```typescript
// lib/error-tracker.ts
export function trackError(error: Error, context?: Record<string, any>) {
  console.error('Error:', error.message, context);

  // Log to file or external service
  // Sentry.captureException(error, { extra: context });
}
```

### 2. Error Rate Monitoring

```bash
# Count errors in last hour
pm2 logs facebook-ads-manager --err --lines 1000 | grep "Error" | wc -l

# Error rate script
#!/bin/bash
errors=$(pm2 logs facebook-ads-manager --err --lines 1000 --nostream | grep -c "Error")
echo "Error count (last 1000 lines): $errors"

if [ "$errors" -gt 100 ]; then
    echo "High error rate detected!" | mail -s "Error Alert" admin@example.com
fi
```

---

## Alerting Configuration

### 1. Email Alerts

Configure system to send email alerts:

```bash
# Install mailutils
sudo apt install -y mailutils

# Configure email relay (using SendGrid)
sudo nano /etc/postfix/main.cf

# Add:
relayhost = [smtp.sendgrid.net]:587
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous
smtp_tls_security_level = encrypt

# Create password file
sudo nano /etc/postfix/sasl_passwd
# Add: [smtp.sendgrid.net]:587 apikey:YOUR_SENDGRID_API_KEY

# Secure and update
sudo postmap /etc/postfix/sasl_passwd
sudo chmod 600 /etc/postfix/sasl_passwd
sudo systemctl restart postfix
```

### 2. Monitoring Alerts

```bash
# Alert script
#!/bin/bash
# /usr/local/bin/monitoring-alert.sh

# Check CPU
cpu_usage=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
if (( $(echo "$cpu_usage > 80" | bc -l) )); then
    echo "High CPU usage: $cpu_usage%" | mail -s "CPU Alert" admin@example.com
fi

# Check memory
mem_usage=$(free | grep Mem | awk '{print ($3/$2) * 100.0}')
if (( $(echo "$mem_usage > 80" | bc -l) )); then
    echo "High memory usage: $mem_usage%" | mail -s "Memory Alert" admin@example.com
fi

# Check disk
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -gt 80 ]; then
    echo "High disk usage: $disk_usage%" | mail -s "Disk Alert" admin@example.com
fi
```

---

## Monitoring Dashboard

### Simple Monitoring Dashboard

Create a simple monitoring dashboard:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Facebook Ads Manager - Monitoring</title>
    <meta http-equiv="refresh" content="30">
    <style>
        body { font-family: Arial; padding: 20px; }
        .metric { margin: 10px 0; }
        .healthy { color: green; }
        .warning { color: orange; }
        .error { color: red; }
    </style>
</head>
<body>
    <h1>Facebook Ads Manager - System Status</h1>
    <div id="status"></div>

    <script>
        fetch('/api/health')
            .then(res => res.json())
            .then(data => {
                document.getElementById('status').innerHTML = `
                    <div class="metric ${data.status}">
                        Status: ${data.status}
                    </div>
                    <div class="metric">
                        Uptime: ${Math.floor(data.uptime / 3600)}h
                    </div>
                    <div class="metric">
                        Database: ${data.checks.database}
                    </div>
                    <div class="metric">
                        Redis: ${data.checks.redis}
                    </div>
                `;
            });
    </script>
</body>
</html>
```

---

## Monitoring Checklist

Daily:
- [ ] Review error logs
- [ ] Check PM2 status
- [ ] Verify health endpoint

Weekly:
- [ ] Review performance metrics
- [ ] Check disk usage
- [ ] Verify backups

Monthly:
- [ ] Review monitoring alerts
- [ ] Update monitoring thresholds
- [ ] Test alerting system

---

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/monitoring/)
- [PostgreSQL Monitoring](https://www.postgresql.org/docs/current/monitoring.html)
- [Deployment Guide](./DEPLOYMENT.md)
