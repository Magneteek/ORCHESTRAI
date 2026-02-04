# Troubleshooting Guide

Common issues and solutions for Facebook Ads Manager deployment and operations.

## Table of Contents

1. [Database Issues](#database-issues)
2. [Application Errors](#application-errors)
3. [Facebook API Issues](#facebook-api-issues)
4. [Performance Problems](#performance-problems)
5. [Migration Failures](#migration-failures)
6. [PM2 Crashes](#pm2-crashes)
7. [Nginx Configuration Issues](#nginx-configuration-issues)
8. [Redis Connection Problems](#redis-connection-problems)
9. [SSL Certificate Issues](#ssl-certificate-issues)
10. [Common Error Messages](#common-error-messages)

---

## Database Issues

### Cannot Connect to Database

**Symptoms:**
- Error: `ECONNREFUSED` or `Connection refused`
- Application fails to start
- Health check shows database disconnected

**Solutions:**

1. Check PostgreSQL is running:
```bash
sudo systemctl status postgresql

# If not running, start it
sudo systemctl start postgresql
```

2. Verify connection string:
```bash
# Check .env.production
cat .env.production | grep DATABASE_URL

# Test connection
psql -U fbads -d facebook_ads_manager -c "SELECT 1;"
```

3. Check PostgreSQL logs:
```bash
sudo tail -50 /var/log/postgresql/postgresql-15-main.log
```

4. Verify PostgreSQL is listening:
```bash
sudo netstat -tlnp | grep 5432

# Check pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Should have:
# local   all             fbads                                   md5
# host    all             fbads           127.0.0.1/32            md5
```

5. Reset PostgreSQL password:
```bash
sudo -u postgres psql
ALTER USER fbads WITH PASSWORD 'new_password';
\q

# Update .env.production with new password
```

### Database Connection Pool Exhausted

**Symptoms:**
- Error: `Too many connections`
- Slow application response
- Timeout errors

**Solutions:**

1. Check active connections:
```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'facebook_ads_manager';
```

2. Kill idle connections:
```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'facebook_ads_manager'
    AND state = 'idle'
    AND state_change < now() - interval '10 minutes';
```

3. Increase connection limit:
```bash
sudo nano /etc/postgresql/15/main/postgresql.conf

# Increase max_connections
max_connections = 300

sudo systemctl restart postgresql
```

4. Configure Prisma connection pooling:
```env
DATABASE_URL="postgresql://fbads:password@localhost:5432/facebook_ads_manager?connection_limit=20&pool_timeout=30"
```

### Slow Query Performance

**Symptoms:**
- Slow page loads
- Database queries taking > 1 second
- High CPU usage on database server

**Solutions:**

1. Identify slow queries:
```sql
-- Enable slow query logging
sudo nano /etc/postgresql/15/main/postgresql.conf
log_min_duration_statement = 1000

-- Check logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log | grep "duration:"
```

2. Analyze query execution:
```sql
EXPLAIN ANALYZE
SELECT * FROM "Campaign" WHERE "tenantId" = 'tenant-123';
```

3. Add missing indexes:
```sql
-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0;

-- Create index
CREATE INDEX CONCURRENTLY "Campaign_tenantId_idx" ON "Campaign"("tenantId");
```

4. Run database maintenance:
```sql
VACUUM ANALYZE;
REINDEX DATABASE facebook_ads_manager;
```

### Migration Lock Issues

**Symptoms:**
- Migration hangs indefinitely
- Error: `Migration engine is locked`
- Cannot run new migrations

**Solutions:**

1. Check for locks:
```sql
SELECT
    pid,
    usename,
    query,
    state,
    wait_event
FROM pg_stat_activity
WHERE datname = 'facebook_ads_manager'
    AND query LIKE '%prisma%';
```

2. Kill blocking process:
```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'facebook_ads_manager'
    AND state = 'active'
    AND query LIKE '%ALTER TABLE%';
```

3. Reset migration lock:
```bash
# Delete migration lock file
rm -f node_modules/.prisma/client/migration_lock.toml

# Reset migration state
npx prisma migrate resolve --rolled-back [migration-name]
```

---

## Application Errors

### Application Won't Start

**Symptoms:**
- PM2 shows status as `errored`
- Application crashes immediately
- Error in PM2 logs

**Solutions:**

1. Check PM2 logs:
```bash
pm2 logs facebook-ads-manager --err --lines 50
```

2. Common issues and fixes:

**Port already in use:**
```bash
# Find process using port 3001
sudo lsof -i :3001

# Kill process
sudo kill -9 [PID]

# Restart application
pm2 restart facebook-ads-manager
```

**Missing environment variables:**
```bash
# Check .env.production exists
ls -la .env.production

# Verify required variables
grep -E "DATABASE_URL|NEXTAUTH_SECRET|FACEBOOK" .env.production
```

**Build errors:**
```bash
# Rebuild application
npm run build

# Check for errors in build output
```

**Missing dependencies:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Generate Prisma client
npx prisma generate
```

### 500 Internal Server Error

**Symptoms:**
- API returns 500 error
- Pages fail to load
- Error in application logs

**Solutions:**

1. Check application logs:
```bash
pm2 logs facebook-ads-manager --err --lines 100
```

2. Common causes:

**Database query error:**
```javascript
// Check Prisma query syntax
// Verify relationships exist
// Check data types match schema
```

**Missing environment variable:**
```bash
# Add to .env.production
MISSING_VAR="value"

# Restart application
pm2 restart facebook-ads-manager
```

**Unhandled promise rejection:**
```javascript
// Add try-catch blocks
try {
  await riskyOperation();
} catch (error) {
  console.error('Error:', error);
  return NextResponse.json({ error: 'Failed' }, { status: 500 });
}
```

### Memory Leaks

**Symptoms:**
- Gradually increasing memory usage
- Application crashes after hours/days
- PM2 shows high memory usage

**Solutions:**

1. Monitor memory usage:
```bash
pm2 monit

# Check memory over time
watch -n 5 'pm2 list'
```

2. Identify memory leak:
```bash
# Enable Node.js memory profiling
node --expose-gc --max-old-space-size=2048 node_modules/next/dist/bin/next start
```

3. Common causes:

**Unclosed database connections:**
```typescript
// Always close Prisma connections
await prisma.$disconnect();
```

**Event listener accumulation:**
```typescript
// Remove event listeners
useEffect(() => {
  const handler = () => {};
  window.addEventListener('event', handler);

  return () => {
    window.removeEventListener('event', handler);
  };
}, []);
```

**Large cache objects:**
```typescript
// Clear cache periodically
redis.flushdb();
```

4. Set memory limit:
```bash
# Update PM2 config
pm2 delete facebook-ads-manager
pm2 start npm --name "facebook-ads-manager" -- start \
  --node-args="--max-old-space-size=2048"
pm2 save
```

---

## Facebook API Issues

### API Rate Limiting

**Symptoms:**
- Error: `Rate limit exceeded`
- Error code: `4` or `17`
- Requests failing intermittently

**Solutions:**

1. Check rate limit status:
```typescript
// In API route
const usage = response.headers['x-business-use-case-usage'];
console.log('Rate limit usage:', usage);
```

2. Implement exponential backoff:
```typescript
async function fetchWithRetry(fn: () => Promise<any>, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (error.code === 4 || error.code === 17) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

3. Cache API responses:
```typescript
// Cache campaign data
const campaign = await cacheWrapper(
  CACHE_KEYS.campaign(campaignId),
  CACHE_TTL.long,
  async () => fetchCampaignFromFacebook(campaignId)
);
```

4. Batch requests:
```typescript
// Use batch API for multiple requests
const batch = [
  { method: 'GET', relative_url: 'campaign1' },
  { method: 'GET', relative_url: 'campaign2' },
];
```

### Invalid Access Token

**Symptoms:**
- Error: `Invalid OAuth access token`
- Error code: `190`
- Cannot fetch campaign data

**Solutions:**

1. Check token expiration:
```typescript
// Verify token is not expired
const tokenExpiry = session.expires;
if (new Date() > new Date(tokenExpiry)) {
  // Refresh token
  await refreshAccessToken(session);
}
```

2. Re-authenticate user:
```bash
# Clear session
redis-cli DEL "session:user-id"

# User needs to login again
```

3. Verify Facebook App settings:
```bash
# Check environment variables
echo $FACEBOOK_APP_ID
echo $FACEBOOK_APP_SECRET

# Verify in Facebook Developer Console:
# - App is in production mode
# - OAuth redirect URIs are correct
# - Required permissions granted
```

### API Version Deprecated

**Symptoms:**
- Warning: `API version will be deprecated`
- Some features not working
- Unexpected response format

**Solutions:**

1. Update Facebook SDK:
```bash
npm update facebook-nodejs-business-sdk
```

2. Update API version:
```typescript
// Update in API client
import { FacebookAdsApi } from 'facebook-nodejs-business-sdk';

FacebookAdsApi.init(
  process.env.FACEBOOK_APP_ID!,
  process.env.FACEBOOK_APP_SECRET!,
  'v18.0' // Update version
);
```

3. Check deprecated fields:
```typescript
// Update field names according to latest API docs
// https://developers.facebook.com/docs/marketing-api/changelog
```

---

## Performance Problems

### Slow Page Load Times

**Symptoms:**
- Pages take > 3 seconds to load
- Lighthouse score < 70
- Users report slowness

**Solutions:**

1. Identify bottleneck:
```bash
# Check server response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Check database queries
psql -U fbads facebook_ads_manager -c "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

2. Enable caching:
```typescript
// Cache expensive operations
const campaigns = await cacheWrapper(
  CACHE_KEYS.campaignList(tenantId),
  CACHE_TTL.medium,
  async () => fetchCampaigns(tenantId)
);
```

3. Optimize database queries:
```sql
-- Add indexes
CREATE INDEX CONCURRENTLY "Campaign_tenantId_status_idx" ON "Campaign"("tenantId", "status");

-- Optimize query
SELECT c.id, c.name, c.status
FROM "Campaign" c
WHERE c."tenantId" = 'tenant-123'
  AND c."status" = 'ACTIVE'
LIMIT 20;
```

4. Enable Nginx caching:
```nginx
# Add to nginx config
proxy_cache_valid 200 5m;
add_header X-Cache-Status $upstream_cache_status;
```

### High CPU Usage

**Symptoms:**
- CPU usage > 80%
- Server becomes unresponsive
- Slow API responses

**Solutions:**

1. Identify CPU-intensive process:
```bash
# Check processes
top -b -n 1

# Check Node.js process
ps aux | grep node
```

2. Common causes:

**Infinite loop:**
```javascript
// Check for infinite loops in code
// Add logging to identify problematic code
```

**Heavy computation:**
```javascript
// Move to background job
import { Queue } from 'bullmq';

const queue = new Queue('heavy-computation');
await queue.add('compute', { data });
```

**Too many concurrent requests:**
```bash
# Limit Nginx connections
limit_req_zone $binary_remote_addr zone=app_limit:10m rate=10r/s;
limit_req zone=app_limit burst=20 nodelay;
```

3. Scale horizontally:
```bash
# Use PM2 cluster mode
pm2 delete facebook-ads-manager
pm2 start npm --name "facebook-ads-manager" -i max -- start
```

### High Memory Usage

**Symptoms:**
- Memory usage > 90%
- OOM (Out of Memory) errors
- Application crashes

**Solutions:**

1. Check memory usage:
```bash
free -h
pm2 monit
```

2. Identify memory leak:
```bash
# Check heap usage
node --expose-gc --heap-prof node_modules/next/dist/bin/next start
```

3. Common fixes:

**Clear cache:**
```bash
redis-cli FLUSHDB
```

**Optimize queries:**
```typescript
// Don't load all data at once
// Use pagination
const campaigns = await prisma.campaign.findMany({
  take: 20,
  skip: page * 20,
});
```

**Increase swap:**
```bash
# Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## Migration Failures

### Migration Fails Midway

**Symptoms:**
- Migration stops with error
- Database in inconsistent state
- Cannot run new migrations

**Solutions:**

1. Check migration status:
```bash
npx prisma migrate status
```

2. Review error:
```bash
# Check Prisma logs
cat .prisma/migrations/[migration]/migration.sql

# Check PostgreSQL logs
sudo tail -100 /var/log/postgresql/postgresql-15-main.log
```

3. Common issues:

**Column already exists:**
```sql
-- Manually fix in database
ALTER TABLE "Campaign" DROP COLUMN IF EXISTS "tenantId";

-- Mark migration as applied
npx prisma migrate resolve --applied [migration-name]
```

**Foreign key constraint violation:**
```sql
-- Check data
SELECT * FROM "Campaign" WHERE "userId" NOT IN (SELECT id FROM "User");

-- Fix data
UPDATE "Campaign" SET "userId" = 'default-user-id' WHERE "userId" IS NULL;

-- Retry migration
npx prisma migrate deploy
```

**Timeout:**
```bash
# Increase timeout
DATABASE_URL="...?connect_timeout=60" npx prisma migrate deploy
```

4. Rollback if needed:
```bash
# Restore from backup
psql -U fbads facebook_ads_manager < /backups/pre-migration/backup.sql
```

### Schema Out of Sync

**Symptoms:**
- Error: `Schema is not in sync`
- Prisma client errors
- Database schema doesn't match Prisma schema

**Solutions:**

1. Reset Prisma client:
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

2. Sync schema:
```bash
# Pull current database schema
npx prisma db pull

# Compare with schema.prisma
# Resolve differences manually
```

3. Reset database (development only):
```bash
npx prisma migrate reset
```

---

## PM2 Crashes

### Application Keeps Restarting

**Symptoms:**
- PM2 shows high restart count
- Application unstable
- Logs show repeated crashes

**Solutions:**

1. Check restart count:
```bash
pm2 list
pm2 show facebook-ads-manager
```

2. View crash logs:
```bash
pm2 logs facebook-ads-manager --err --lines 200
```

3. Common causes:

**Unhandled exception:**
```javascript
// Add global error handler
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});
```

**Port conflict:**
```bash
# Check port availability
sudo lsof -i :3001
```

**Out of memory:**
```bash
# Increase memory limit
pm2 delete facebook-ads-manager
pm2 start npm --name "facebook-ads-manager" -- start \
  --max-memory-restart 1G
```

### PM2 Not Saving Configuration

**Symptoms:**
- PM2 processes lost after reboot
- Startup script not working
- Need to manually start after restart

**Solutions:**

```bash
# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup systemd -u deploy --hp /home/deploy

# Copy and run the generated command as sudo
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy

# Verify startup script
sudo systemctl status pm2-deploy
```

---

## Nginx Configuration Issues

### 502 Bad Gateway

**Symptoms:**
- Nginx returns 502 error
- Application unreachable
- Error in Nginx logs

**Solutions:**

1. Check application is running:
```bash
pm2 status
curl http://localhost:3001
```

2. Check Nginx error log:
```bash
sudo tail -50 /var/log/nginx/error.log
```

3. Common causes:

**Application not running:**
```bash
pm2 restart facebook-ads-manager
```

**Wrong upstream port:**
```bash
# Check nginx config
sudo nano /etc/nginx/sites-available/facebook-ads-manager

# Verify upstream matches application port
upstream facebook_ads_manager {
    server localhost:3001;  # Must match app port
}
```

**Firewall blocking:**
```bash
sudo ufw status
sudo ufw allow 3001/tcp
```

### SSL Certificate Errors

**Symptoms:**
- Browser shows SSL warning
- Certificate expired
- Mixed content warnings

**Solutions:**

1. Check certificate status:
```bash
sudo certbot certificates
```

2. Renew certificate:
```bash
sudo certbot renew
sudo systemctl reload nginx
```

3. Test SSL configuration:
```bash
# Test SSL
openssl s_client -connect your-domain.com:443

# Check certificate expiry
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Redis Connection Problems

### Cannot Connect to Redis

**Symptoms:**
- Error: `Redis connection refused`
- Session data lost
- Cache not working

**Solutions:**

1. Check Redis is running:
```bash
sudo systemctl status redis-server

# If not running
sudo systemctl start redis-server
```

2. Test Redis connection:
```bash
redis-cli ping
# Should return: PONG
```

3. Check Redis configuration:
```bash
# Verify bind address
sudo nano /etc/redis/redis.conf

# Should have:
bind 127.0.0.1 ::1

# Restart Redis
sudo systemctl restart redis-server
```

### Redis Out of Memory

**Symptoms:**
- Error: `OOM command not allowed`
- Cache writes failing
- Redis becomes read-only

**Solutions:**

1. Check memory usage:
```bash
redis-cli INFO memory
```

2. Clear cache:
```bash
redis-cli FLUSHDB
```

3. Increase memory limit:
```bash
sudo nano /etc/redis/redis.conf

# Increase maxmemory
maxmemory 1gb

sudo systemctl restart redis-server
```

4. Configure eviction policy:
```bash
# In redis.conf
maxmemory-policy allkeys-lru
```

---

## Common Error Messages

### "EADDRINUSE: address already in use"

**Cause:** Port is already being used by another process

**Solution:**
```bash
# Find process using port
sudo lsof -i :3001

# Kill process
sudo kill -9 [PID]

# Or change port
# Edit package.json: "start": "next start -p 3002"
```

### "Cannot find module"

**Cause:** Missing dependency or incorrect import

**Solution:**
```bash
# Reinstall dependencies
npm install

# Check import path is correct
# Verify tsconfig.json paths configuration
```

### "Prisma Client did not initialize yet"

**Cause:** Prisma client not generated

**Solution:**
```bash
npx prisma generate
npm run build
pm2 restart facebook-ads-manager
```

### "Transaction failed"

**Cause:** Database constraint violation or lock

**Solution:**
```sql
-- Check for locks
SELECT * FROM pg_locks WHERE granted = false;

-- Check constraints
SELECT conname, contype FROM pg_constraint WHERE conrelid = '"Campaign"'::regclass;
```

---

## Getting Help

If issues persist:

1. **Check Logs:**
   - Application: `pm2 logs facebook-ads-manager`
   - Nginx: `sudo tail -100 /var/log/nginx/error.log`
   - PostgreSQL: `sudo tail -100 /var/log/postgresql/postgresql-15-main.log`
   - System: `sudo journalctl -xe`

2. **Gather Information:**
   - Error messages
   - Steps to reproduce
   - Recent changes
   - System configuration

3. **Contact Support:**
   - Include all gathered information
   - Attach relevant log files
   - Describe expected vs actual behavior

---

## Additional Resources

- [Deployment Guide](./DEPLOYMENT.md)
- [Monitoring Guide](./MONITORING.md)
- [Performance Guide](./PERFORMANCE.md)
- [Migration Guide](./MIGRATION-GUIDE.md)
