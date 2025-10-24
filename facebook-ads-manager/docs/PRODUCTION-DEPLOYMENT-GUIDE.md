# Production Deployment Guide

Complete guide for deploying Facebook Ads Manager to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Infrastructure Setup](#infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Deployment Methods](#deployment-methods)
6. [Post-Deployment](#post-deployment)
7. [Monitoring](#monitoring)
8. [Rollback Procedures](#rollback-procedures)

## Prerequisites

### Required Tools

- Node.js 18.20.0 or higher
- npm 9.0.0 or higher
- Git
- PostgreSQL 16+ (for database)
- Redis 7+ (for caching and queues)
- Vercel CLI (for Vercel deployments)
- Docker (optional, for containerized deployment)

### Required Accounts

- GitHub account (for CI/CD)
- Vercel account (recommended for frontend deployment)
- Database hosting (PostgreSQL): Railway, Supabase, AWS RDS, or similar
- Redis hosting: Upstash, Redis Cloud, AWS ElastiCache, or similar
- Sentry account (for error tracking)
- Domain name and DNS access

## Infrastructure Setup

### Option 1: Vercel + Managed Services (Recommended)

This is the simplest and most cost-effective approach for most use cases.

#### 1. Database (PostgreSQL)

**Recommended Providers:**
- **Railway**: Easiest setup, great developer experience
- **Supabase**: Includes additional features (authentication, storage)
- **Neon**: Serverless PostgreSQL with excellent scaling
- **AWS RDS**: Enterprise-grade, more complex setup

**Railway Setup Example:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Create new PostgreSQL database
railway up

# Get connection string
railway variables
```

#### 2. Redis Cache

**Recommended Providers:**
- **Upstash**: Serverless Redis, pay-per-request pricing
- **Redis Cloud**: Managed Redis with free tier
- **Railway**: Simple setup, good performance

**Upstash Setup Example:**
1. Visit https://upstash.com
2. Create new Redis database
3. Select region closest to your application
4. Copy connection string (starts with `redis://`)

#### 3. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
cd frontend
vercel link

# Configure environment variables (see next section)
vercel env add PRODUCTION

# Deploy to production
vercel --prod
```

### Option 2: Docker + AWS/DigitalOcean

For more control or enterprise requirements.

#### 1. Container Registry Setup

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Build and push Docker image
docker build -t ghcr.io/yourusername/facebook-ads-manager:latest .
docker push ghcr.io/yourusername/facebook-ads-manager:latest
```

#### 2. AWS Infrastructure

See `/infrastructure/terraform/README.md` for Terraform setup.

Basic setup includes:
- VPC with public/private subnets
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- Application Load Balancer
- ECS Fargate service

## Environment Configuration

### 1. Create Production Environment File

```bash
# Copy example file
cp .env.production.example .env.production

# Edit with production values
nano .env.production
```

### 2. Required Environment Variables

#### Application
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
PORT=3001
```

#### Database
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public&connection_limit=20&pool_timeout=10"
```

#### Authentication
```bash
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

#### Facebook API
```bash
FACEBOOK_APP_ID=your-production-app-id
FACEBOOK_APP_SECRET=your-production-app-secret
FACEBOOK_API_VERSION=v22.0
NEXT_PUBLIC_FACEBOOK_APP_ID=your-production-app-id
```

#### Redis
```bash
REDIS_URL=redis://:password@host:6379
REDIS_PASSWORD=your-redis-password
```

#### AI Services
```bash
ANTHROPIC_API_KEY=sk-ant-api03-YOUR-PRODUCTION-KEY
```

#### Monitoring
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ORG=your-organization
SENTRY_PROJECT=facebook-ads-manager
```

### 3. Vercel Environment Variables

Set environment variables in Vercel dashboard or via CLI:

```bash
# Set individual variables
vercel env add DATABASE_URL production
vercel env add REDIS_URL production
vercel env add NEXTAUTH_SECRET production

# Or import from file
vercel env pull .env.production
```

### 4. Validate Configuration

```bash
# Validate all required variables are set
node scripts/validate-env.js production
```

## Database Setup

### 1. Initial Migration

```bash
cd frontend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### 2. Seed Data (Optional)

```bash
# Create initial admin user and sample data
npm run db:seed
```

### 3. Connection Pooling

For production, use connection pooling:

**PgBouncer (Recommended):**
```bash
# Using Docker
docker run -d \
  --name pgbouncer \
  -e DATABASE_URL=$DATABASE_URL \
  -p 6432:5432 \
  edoburu/pgbouncer
```

**Prisma Data Proxy:**
```bash
# Enable in Prisma schema
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

## Deployment Methods

### Method 1: Vercel (Recommended)

#### Automatic Deployment (GitHub Integration)

1. Connect repository to Vercel
2. Configure environment variables
3. Push to `main` branch
4. Automatic deployment triggered

#### Manual Deployment

```bash
cd frontend

# Deploy to production
vercel --prod

# Or use deployment script
cd ..
bash scripts/deploy.sh production
```

### Method 2: Docker

#### Using Docker Compose

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

#### Manual Docker Deployment

```bash
# Build image
docker build -t facebook-ads-manager:latest .

# Run container
docker run -d \
  --name facebook-ads-app \
  -p 3001:3001 \
  --env-file .env.production \
  facebook-ads-manager:latest
```

### Method 3: GitHub Actions

Automated deployment via GitHub Actions (see `.github/workflows/deploy-production.yml`).

**Trigger Production Deployment:**

1. Go to Actions tab in GitHub
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Type "DEPLOY" to confirm
5. Monitor deployment progress

## Post-Deployment

### 1. Health Check

```bash
# Check application health
curl https://yourdomain.com/api/health

# Expected response
{
  "status": "healthy",
  "services": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "externalAPIs": { "status": "up" }
  }
}
```

### 2. Smoke Tests

```bash
# Test critical endpoints
curl https://yourdomain.com/
curl https://yourdomain.com/api/auth/session
curl https://yourdomain.com/api/health
```

### 3. Database Verification

```bash
cd frontend

# Check migration status
npx prisma migrate status

# Verify table count
psql $DATABASE_URL -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

### 4. Configure DNS

Point your domain to the deployment:

**Vercel:**
1. Add domain in Vercel dashboard
2. Configure DNS records:
   ```
   A     @        76.76.21.21
   CNAME www      cname.vercel-dns.com
   ```

**Custom Server:**
```
A     @        your.server.ip
CNAME www      yourdomain.com
```

### 5. SSL Certificate

**Vercel:** Automatic SSL via Let's Encrypt

**Custom Server:**
```bash
# Using Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Monitoring

### 1. Error Tracking (Sentry)

Configure Sentry for error monitoring:

```bash
# Install Sentry CLI
npm install -g @sentry/cli

# Create release
sentry-cli releases new $VERSION
sentry-cli releases set-commits $VERSION --auto
sentry-cli releases finalize $VERSION
```

### 2. Uptime Monitoring

Recommended services:
- **UptimeRobot**: Free tier available
- **Pingdom**: Enterprise features
- **Better Uptime**: Modern UI

Configure endpoints to monitor:
- `https://yourdomain.com/api/health`
- `https://yourdomain.com/`

### 3. Performance Monitoring

**Vercel Analytics:**
- Automatic with Vercel deployment
- Real User Monitoring (RUM)
- Core Web Vitals tracking

**Alternative: Google Analytics**
```javascript
// Add to frontend/app/layout.tsx
<Script src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID" />
```

### 4. Log Aggregation

**Options:**
- Vercel Logs (built-in)
- Datadog
- LogRocket
- Papertrail

### 5. Application Metrics

Monitor key metrics:
- API response times
- Database query performance
- Redis cache hit rate
- Queue processing times
- Error rates
- User session counts

## Rollback Procedures

### Immediate Rollback (< 5 minutes)

#### Vercel Rollback

```bash
# List recent deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]

# Or via dashboard
# 1. Go to Deployments tab
# 2. Find last working deployment
# 3. Click "Promote to Production"
```

#### Docker Rollback

```bash
# Pull previous image version
docker pull ghcr.io/yourusername/facebook-ads-manager:previous-tag

# Stop current container
docker stop facebook-ads-app

# Start previous version
docker run -d \
  --name facebook-ads-app \
  -p 3001:3001 \
  --env-file .env.production \
  ghcr.io/yourusername/facebook-ads-manager:previous-tag
```

### Database Rollback

#### Restore from Backup

```bash
# List available backups
ls -lh backups/

# Restore database
bash scripts/restore-database.sh backups/facebook_ads_backup_TIMESTAMP.sql.gz
```

#### Revert Migrations

```bash
cd frontend

# View migration history
npx prisma migrate status

# Revert last migration (use with caution)
# Note: Manual intervention may be required
```

### Post-Rollback Checklist

- [ ] Verify application is accessible
- [ ] Run health checks
- [ ] Check error tracking for new issues
- [ ] Verify database connectivity
- [ ] Test critical user flows
- [ ] Notify team of rollback
- [ ] Document root cause
- [ ] Plan fix and re-deployment

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check connection limits
psql $DATABASE_URL -c "SELECT COUNT(*) FROM pg_stat_activity;"
```

#### 2. Redis Connection Errors

```bash
# Test Redis connection
redis-cli -u $REDIS_URL ping

# Check Redis memory
redis-cli -u $REDIS_URL INFO memory
```

#### 3. Build Failures

```bash
# Clear Next.js cache
rm -rf frontend/.next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 4. Environment Variable Issues

```bash
# Validate environment
node scripts/validate-env.js production

# Check Vercel environment
vercel env ls
```

## Security Checklist

- [ ] All environment variables set via secure methods (not in code)
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database uses SSL connections
- [ ] API keys are production-specific (not development keys)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Security headers configured (see vercel.json)
- [ ] Dependencies audited (`npm audit`)
- [ ] Sentry configured for error tracking
- [ ] Database backups automated
- [ ] Access logs enabled

## Performance Checklist

- [ ] Database connection pooling configured
- [ ] Redis caching enabled
- [ ] CDN configured for static assets
- [ ] Image optimization enabled
- [ ] API response caching configured
- [ ] Database indexes created
- [ ] N+1 queries eliminated
- [ ] Bundle size within limits
- [ ] Core Web Vitals passing

## Support

For deployment issues:

1. Check this guide
2. Review `/docs/TROUBLESHOOTING-GUIDE.md`
3. Check GitHub Issues
4. Review application logs
5. Contact DevOps team

## Next Steps

After successful deployment:

1. Configure monitoring alerts
2. Set up automated backups
3. Document runbook procedures
4. Train team on deployment process
5. Schedule regular backup tests
6. Review and optimize performance
7. Set up staging environment
8. Configure CI/CD automation
