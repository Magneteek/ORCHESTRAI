# Database Migration Guide

Comprehensive guide for executing database schema migrations for the Facebook Ads Manager.

## Table of Contents

1. [Overview](#overview)
2. [Migration Strategy](#migration-strategy)
3. [Pre-Migration Steps](#pre-migration-steps)
4. [Staging Environment Testing](#staging-environment-testing)
5. [Production Migration](#production-migration)
6. [Post-Migration Verification](#post-migration-verification)
7. [Rollback Procedures](#rollback-procedures)
8. [Common Migration Scenarios](#common-migration-scenarios)

---

## Overview

### What This Migration Does

The schema migration includes:

1. **Multi-tenancy Support**
   - Added `tenantId` field to all core tables
   - Tenant isolation for data security
   - Organization-level data management

2. **Dynamic Field Management**
   - `DynamicField` table for flexible campaign data
   - `DynamicFieldValue` for storing custom field values
   - Support for text, number, date, and boolean field types

3. **Enhanced Template System**
   - `CampaignTemplate` table for reusable templates
   - Dynamic field mapping to templates
   - Industry-specific template categories

4. **Role-Based Access Control**
   - `UserRole` enum (ADMIN, MANAGER, ANALYST)
   - Granular permission system
   - User-tenant relationship management

5. **Audit Trail**
   - Activity logging tables
   - Change tracking
   - Compliance support

### Migration Risk Assessment

- **Risk Level**: MEDIUM
- **Estimated Downtime**: 5-15 minutes (depending on data volume)
- **Reversibility**: Full rollback supported via backup
- **Data Loss Risk**: None (additive migration)

---

## Migration Strategy

### Zero-Downtime Approach

For production systems requiring zero downtime:

1. **Blue-Green Deployment**
   - Run migration on secondary database
   - Switch traffic after verification
   - Keep original as instant fallback

2. **Feature Flags**
   - Deploy code with feature flags disabled
   - Run migration
   - Enable features gradually

### Standard Approach (Recommended)

For systems with acceptable maintenance window:

1. Schedule maintenance window (off-peak hours)
2. Notify users of planned downtime
3. Create database backup
4. Run migration
5. Verify data integrity
6. Resume operations

---

## Pre-Migration Steps

### 1. Environment Preparation

```bash
# Verify Node.js and npm versions
node --version  # Should be >= 20.x
npm --version

# Verify Prisma CLI installed
npx prisma --version

# Check database connectivity
npx prisma db pull --preview-feature
```

### 2. Create Database Backup

**Critical: Always backup before migration**

```bash
# Create backup directory
mkdir -p /backups/pre-migration

# Backup database
pg_dump -U fbads -h localhost facebook_ads_manager > /backups/pre-migration/backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup created
ls -lh /backups/pre-migration/

# Test backup integrity
pg_restore --list /backups/pre-migration/backup-*.sql
```

### 3. Document Current State

```sql
-- Connect to database
psql -U fbads facebook_ads_manager

-- Document table counts
SELECT
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
ORDER BY schemaname, tablename;

-- Save table row counts
SELECT
    table_name,
    (xpath('/row/count/text()',
        query_to_xml(format('SELECT COUNT(*) FROM %I.%I',
            table_schema, table_name),
        false, true, '')))[1]::text::int as row_count
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Exit
\q
```

Save output for post-migration comparison.

### 4. Verify Schema Consistency

```bash
# Generate current schema
npx prisma migrate dev --create-only --name pre_migration_snapshot

# Review generated migration
cat prisma/migrations/*/migration.sql

# Don't apply yet - this is just for verification
```

### 5. Review Migration Plan

```bash
# Check pending migrations
npx prisma migrate status

# Review migration files
ls -la prisma/migrations/

# Read migration SQL
cat prisma/migrations/[migration-name]/migration.sql
```

---

## Staging Environment Testing

**Never run migrations directly on production without staging validation**

### 1. Clone Production Database to Staging

```bash
# On production server
pg_dump -U fbads facebook_ads_manager | gzip > /tmp/prod-staging-clone.sql.gz

# Transfer to staging
scp /tmp/prod-staging-clone.sql.gz staging-server:/tmp/

# On staging server
gunzip /tmp/prod-staging-clone.sql.gz
psql -U fbads facebook_ads_manager_staging < /tmp/prod-staging-clone.sql
```

### 2. Run Migration on Staging

```bash
# Switch to staging environment
export DATABASE_URL="postgresql://fbads:password@localhost:5432/facebook_ads_manager_staging"

# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate deploy

# Check migration status
npx prisma migrate status
```

### 3. Verify Staging Migration

```sql
-- Connect to staging database
psql -U fbads facebook_ads_manager_staging

-- Verify new tables exist
\dt

-- Check DynamicField table
SELECT * FROM "DynamicField" LIMIT 5;

-- Check CampaignTemplate table
SELECT * FROM "CampaignTemplate" LIMIT 5;

-- Verify tenantId added to existing tables
\d "User"
\d "Campaign"
\d "AdSet"
\d "Ad"

-- Check data integrity
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Campaign";
SELECT COUNT(*) FROM "AdSet";
SELECT COUNT(*) FROM "Ad";

\q
```

### 4. Application Testing on Staging

```bash
# Start application against staging database
npm run build
npm start

# Run test suite
npm run test
npm run test:e2e

# Manual testing checklist:
# - User authentication
# - Campaign creation
# - Template selection
# - Dynamic field addition
# - Analytics dashboard
# - Facebook API integration
```

### 5. Performance Testing

```bash
# Measure query performance
psql -U fbads facebook_ads_manager_staging

-- Test query performance
EXPLAIN ANALYZE SELECT * FROM "Campaign" WHERE "tenantId" = 'test-tenant-id';

-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

\q
```

---

## Production Migration

### 1. Pre-Migration Communication

```
Subject: Scheduled Maintenance - Facebook Ads Manager

Dear Team,

We will be performing a database migration for the Facebook Ads Manager on:

Date: [DATE]
Time: [TIME] - [TIME] (EST)
Duration: Approximately 15 minutes
Impact: Application will be unavailable during this window

What's changing:
- Enhanced multi-tenancy support
- New dynamic field management
- Improved template system

Actions Required:
- Save any in-progress work before maintenance window
- Logout from application
- Do not attempt to access during maintenance

We will notify you when the system is back online.

Thank you for your patience.
```

### 2. Enable Maintenance Mode

```bash
# Create maintenance page
cat > /var/www/html/maintenance.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>System Maintenance</title>
    <style>
        body { font-family: Arial; text-align: center; padding: 50px; }
        h1 { color: #333; }
    </style>
</head>
<body>
    <h1>System Maintenance in Progress</h1>
    <p>We're upgrading our systems to serve you better.</p>
    <p>We'll be back shortly!</p>
</body>
</html>
EOF

# Update Nginx to show maintenance page
sudo nano /etc/nginx/sites-available/facebook-ads-manager

# Add at top of server block:
# location / {
#     return 503;
# }
# error_page 503 /maintenance.html;
# location = /maintenance.html {
#     root /var/www/html;
# }

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### 3. Stop Application

```bash
# Stop PM2 process
pm2 stop facebook-ads-manager

# Verify stopped
pm2 status

# Check no connections to database
psql -U fbads facebook_ads_manager -c "SELECT count(*) FROM pg_stat_activity WHERE datname='facebook_ads_manager';"
```

### 4. Final Backup

```bash
# Create final pre-migration backup
pg_dump -U fbads facebook_ads_manager | gzip > /backups/pre-migration/final-backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Verify backup
ls -lh /backups/pre-migration/

# Test backup can be read
gunzip -t /backups/pre-migration/final-backup-*.sql.gz
```

### 5. Execute Migration

```bash
# Navigate to application directory
cd /home/deploy/apps/facebook-ads-manager/frontend

# Ensure correct environment
export DATABASE_URL="postgresql://fbads:password@localhost:5432/facebook_ads_manager"

# Generate Prisma client
npx prisma generate

# Run migration (production)
npx prisma migrate deploy

# Expected output:
# Applying migration `20240127000000_add_multi_tenancy`
# The following migration(s) have been applied:
# migrations/
#   └─ 20240127000000_add_multi_tenancy/
#      └─ migration.sql
# Your database is now in sync with your schema.
```

### 6. Verify Migration Success

```bash
# Check migration status
npx prisma migrate status

# Should show all migrations applied
```

### 7. Restart Application

```bash
# Rebuild application
npm run build

# Start application
pm2 start facebook-ads-manager

# Check logs
pm2 logs facebook-ads-manager --lines 50

# Verify application started
curl http://localhost:3001/api/health
```

### 8. Disable Maintenance Mode

```bash
# Remove maintenance mode from Nginx
sudo nano /etc/nginx/sites-available/facebook-ads-manager

# Remove maintenance mode lines

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## Post-Migration Verification

### 1. Database Schema Verification

```sql
-- Connect to database
psql -U fbads facebook_ads_manager

-- List all tables
\dt

-- Expected new tables:
-- - DynamicField
-- - DynamicFieldValue
-- - CampaignTemplate
-- - TemplateDynamicField

-- Verify table structures
\d "DynamicField"
\d "DynamicFieldValue"
\d "CampaignTemplate"
\d "TemplateDynamicField"

-- Check tenantId added to core tables
\d "User"
\d "Campaign"
\d "AdSet"
\d "Ad"
```

### 2. Data Integrity Checks

```sql
-- Compare row counts with pre-migration snapshot
SELECT
    table_name,
    (xpath('/row/count/text()',
        query_to_xml(format('SELECT COUNT(*) FROM %I.%I',
            table_schema, table_name),
        false, true, '')))[1]::text::int as row_count
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Verify no data loss
-- All original tables should have same row counts

-- Check for NULL tenantId values (should be minimal or handled)
SELECT COUNT(*) FROM "User" WHERE "tenantId" IS NULL;
SELECT COUNT(*) FROM "Campaign" WHERE "tenantId" IS NULL;

-- Check referential integrity
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS referenced_table
FROM pg_constraint
WHERE contype = 'f'
ORDER BY conrelid::regclass::text;

\q
```

### 3. Application Health Checks

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2026-01-27T...",
  "checks": {
    "database": "connected",
    "redis": "connected",
    "facebook": "authenticated"
  }
}

# Test API endpoints
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Verify response
```

### 4. Feature Testing

Manual verification checklist:

- [ ] User login works
- [ ] Dashboard loads
- [ ] Campaign list displays
- [ ] Campaign creation works
- [ ] Template selection works
- [ ] Dynamic fields can be added
- [ ] Ad set creation works
- [ ] Analytics data loads
- [ ] Facebook API connection works
- [ ] User management works

### 5. Performance Verification

```bash
# Check query performance
psql -U fbads facebook_ads_manager

-- Test indexed queries
EXPLAIN ANALYZE SELECT * FROM "Campaign" WHERE "tenantId" = 'tenant-123';

-- Should use index, not sequential scan

-- Check overall database performance
SELECT
    datname,
    numbackends,
    xact_commit,
    xact_rollback,
    blks_read,
    blks_hit,
    tup_returned,
    tup_fetched
FROM pg_stat_database
WHERE datname = 'facebook_ads_manager';

\q
```

### 6. Error Log Review

```bash
# Check application logs
pm2 logs facebook-ads-manager --lines 100

# Check for errors
pm2 logs facebook-ads-manager --err --lines 50

# Check Nginx error logs
sudo tail -100 /var/log/nginx/facebook-ads-manager.error.log

# Check PostgreSQL logs
sudo tail -100 /var/log/postgresql/postgresql-15-main.log
```

---

## Rollback Procedures

### When to Rollback

Rollback if:
- Migration fails halfway
- Critical data corruption detected
- Application cannot connect to database
- Major functionality broken
- Performance severely degraded

### Rollback Steps

#### 1. Stop Application

```bash
# Stop PM2 process
pm2 stop facebook-ads-manager
```

#### 2. Restore Database

```bash
# Drop current database
psql -U postgres << EOF
DROP DATABASE IF EXISTS facebook_ads_manager;
CREATE DATABASE facebook_ads_manager;
GRANT ALL PRIVILEGES ON DATABASE facebook_ads_manager TO fbads;
EOF

# Restore from backup
gunzip -c /backups/pre-migration/final-backup-*.sql.gz | psql -U fbads facebook_ads_manager

# Verify restoration
psql -U fbads facebook_ads_manager -c "SELECT COUNT(*) FROM \"User\";"
```

#### 3. Revert Application Code

```bash
cd /home/deploy/apps/facebook-ads-manager/frontend

# Checkout previous commit
git log --oneline -n 5  # Find pre-migration commit
git checkout [commit-hash]

# Reinstall dependencies
npm ci

# Rebuild
npm run build
```

#### 4. Restart Application

```bash
# Start application
pm2 start facebook-ads-manager

# Verify
curl http://localhost:3001/api/health
```

#### 5. Verify Rollback Success

```bash
# Test core functionality
# - User login
# - Campaign listing
# - Basic operations
```

#### 6. Document Rollback

```bash
# Create rollback report
cat > /tmp/rollback-report.txt << EOF
Rollback Executed: $(date)
Reason: [REASON]
Database Restored From: [BACKUP FILE]
Application Version: [COMMIT HASH]
Verification Status: [PASS/FAIL]
Issues Encountered: [ISSUES]
EOF

# Share with team
```

---

## Common Migration Scenarios

### Scenario 1: Adding New Column

```sql
-- Already included in migration:
ALTER TABLE "Campaign" ADD COLUMN "tenantId" TEXT;
```

Verify:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Campaign' AND column_name = 'tenantId';
```

### Scenario 2: Creating New Tables

```sql
-- Already included in migration:
CREATE TABLE "DynamicField" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL,
    -- ...
);
```

Verify:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'DynamicField';
```

### Scenario 3: Adding Indexes

```sql
-- Create index if not exists
CREATE INDEX IF NOT EXISTS "Campaign_tenantId_idx" ON "Campaign"("tenantId");
CREATE INDEX IF NOT EXISTS "DynamicField_tenantId_idx" ON "DynamicField"("tenantId");
```

Verify:
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'Campaign' AND indexname LIKE '%tenantId%';
```

### Scenario 4: Data Migration

If existing data needs tenantId assignment:

```sql
-- Assign default tenant to existing users
UPDATE "User"
SET "tenantId" = 'default-tenant-id'
WHERE "tenantId" IS NULL;

-- Propagate to related records
UPDATE "Campaign"
SET "tenantId" = u."tenantId"
FROM "User" u
WHERE "Campaign"."userId" = u."id"
AND "Campaign"."tenantId" IS NULL;
```

---

## Migration Checklist

Use this checklist for each migration:

### Pre-Migration
- [ ] Staging environment tested
- [ ] Database backup created
- [ ] Backup verified
- [ ] Current state documented
- [ ] Team notified
- [ ] Maintenance window scheduled
- [ ] Rollback plan prepared

### During Migration
- [ ] Maintenance mode enabled
- [ ] Application stopped
- [ ] Final backup created
- [ ] Migration executed
- [ ] Migration verified
- [ ] Application restarted
- [ ] Maintenance mode disabled

### Post-Migration
- [ ] Schema verified
- [ ] Data integrity checked
- [ ] Application health verified
- [ ] Feature testing completed
- [ ] Performance verified
- [ ] Logs reviewed
- [ ] Team notified
- [ ] Documentation updated

---

## Troubleshooting

### Migration Fails Midway

```bash
# Check error message
npx prisma migrate status

# Review migration file
cat prisma/migrations/[failed-migration]/migration.sql

# Fix issue and retry
npx prisma migrate resolve --applied [migration-name]
npx prisma migrate deploy
```

### Cannot Connect to Database

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -U fbads facebook_ads_manager -c "SELECT 1;"

# Review DATABASE_URL
echo $DATABASE_URL

# Test connection string
npx prisma db pull
```

### Slow Migration Performance

```sql
-- Check database locks
SELECT * FROM pg_locks WHERE granted = false;

-- Check running queries
SELECT pid, query, state, wait_event
FROM pg_stat_activity
WHERE datname = 'facebook_ads_manager';
```

---

## Best Practices

1. **Always test on staging first**
2. **Create backups before migration**
3. **Verify backups before proceeding**
4. **Schedule during off-peak hours**
5. **Communicate with stakeholders**
6. **Document everything**
7. **Have rollback plan ready**
8. **Monitor during migration**
9. **Verify thoroughly after migration**
10. **Keep team informed**

---

## Additional Resources

- [Deployment Guide](./DEPLOYMENT.md) - Full deployment procedures
- [Prisma Migration Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)

---

## Support

For migration issues:
- Review logs: `pm2 logs facebook-ads-manager`
- Check database: `psql -U fbads facebook_ads_manager`
- Contact DevOps team: [Contact Info]
