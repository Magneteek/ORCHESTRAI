#!/bin/bash

# Facebook Ads Manager - Deployment Script
# Automates the deployment process to production

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="facebook-ads-manager"
APP_DIR="/home/deploy/apps/facebook-ads-manager/frontend"
BACKUP_DIR="/backups"
LOG_FILE="/var/log/deploy-$(date +%Y%m%d-%H%M%S).log"

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as deploy user
if [ "$USER" != "deploy" ]; then
    error "This script must be run as the deploy user"
fi

# Start deployment
log "=========================================="
log "Starting deployment of $APP_NAME"
log "=========================================="

# Change to application directory
cd "$APP_DIR" || error "Failed to change to application directory"

# 1. Pre-deployment checks
log "Step 1: Running pre-deployment checks..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    error ".env.production file not found"
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    error "npm is not installed"
fi

# Check if pm2 is installed
if ! command -v pm2 &> /dev/null; then
    error "PM2 is not installed"
fi

# Check database connection
if ! psql -U fbads -d facebook_ads_manager -c "SELECT 1" &> /dev/null; then
    error "Cannot connect to database"
fi

# Check Redis connection
if ! redis-cli ping &> /dev/null; then
    error "Cannot connect to Redis"
fi

log "Pre-deployment checks passed ✓"

# 2. Create backup
log "Step 2: Creating backup..."

# Backup database
BACKUP_FILE="$BACKUP_DIR/pre-deploy-$(date +%Y%m%d-%H%M%S).sql"
pg_dump -U fbads facebook_ads_manager > "$BACKUP_FILE" || error "Database backup failed"
gzip "$BACKUP_FILE"
log "Database backup created: ${BACKUP_FILE}.gz ✓"

# Backup current application
BACKUP_APP="$BACKUP_DIR/app-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf "$BACKUP_APP" --exclude='node_modules' --exclude='.next' . || warning "Application backup failed"
log "Application backup created: $BACKUP_APP ✓"

# 3. Get current commit
CURRENT_COMMIT=$(git rev-parse HEAD)
log "Current commit: $CURRENT_COMMIT"

# 4. Pull latest code
log "Step 3: Pulling latest code from repository..."
git fetch origin || error "Failed to fetch from origin"

# Check if on correct branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
info "Current branch: $CURRENT_BRANCH"

# Pull changes
git pull origin "$CURRENT_BRANCH" || error "Failed to pull changes"

NEW_COMMIT=$(git rev-parse HEAD)
log "New commit: $NEW_COMMIT"

if [ "$CURRENT_COMMIT" == "$NEW_COMMIT" ]; then
    warning "No new changes to deploy"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Deployment cancelled"
        exit 0
    fi
fi

# 5. Install dependencies
log "Step 4: Installing dependencies..."
npm ci --production || error "Failed to install dependencies"
log "Dependencies installed ✓"

# 6. Generate Prisma client
log "Step 5: Generating Prisma client..."
npx prisma generate || error "Failed to generate Prisma client"
log "Prisma client generated ✓"

# 7. Run database migrations
log "Step 6: Running database migrations..."

# Check migration status
MIGRATION_STATUS=$(npx prisma migrate status 2>&1)
if echo "$MIGRATION_STATUS" | grep -q "Database schema is up to date"; then
    log "No pending migrations ✓"
else
    info "Pending migrations detected"
    read -p "Run migrations? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx prisma migrate deploy || error "Migration failed"
        log "Migrations applied successfully ✓"
    else
        warning "Migrations skipped"
    fi
fi

# 8. Run tests (optional)
log "Step 7: Running tests..."
read -p "Run tests before deployment? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run test || error "Tests failed"
    log "Tests passed ✓"
else
    warning "Tests skipped"
fi

# 9. Build application
log "Step 8: Building application..."
npm run build || error "Build failed"
log "Application built successfully ✓"

# 10. Restart application with PM2
log "Step 9: Restarting application..."

# Stop application gracefully
pm2 stop "$APP_NAME" || warning "Failed to stop application"

# Wait for application to stop
sleep 3

# Start application
pm2 start "$APP_NAME" || error "Failed to start application"

# Wait for application to start
sleep 5

# Check if application is running
if ! pm2 list | grep -q "$APP_NAME.*online"; then
    error "Application failed to start"
fi

log "Application restarted successfully ✓"

# 11. Verify deployment
log "Step 10: Verifying deployment..."

# Wait for application to be ready
sleep 5

# Check health endpoint
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
if [ "$HEALTH_STATUS" != "200" ]; then
    error "Health check failed with status: $HEALTH_STATUS"
fi

log "Health check passed ✓"

# 12. Clear cache
log "Step 11: Clearing cache..."
redis-cli FLUSHDB || warning "Failed to clear Redis cache"
log "Cache cleared ✓"

# 13. Save PM2 configuration
log "Step 12: Saving PM2 configuration..."
pm2 save || warning "Failed to save PM2 configuration"
log "PM2 configuration saved ✓"

# 14. Deployment summary
log "=========================================="
log "Deployment completed successfully!"
log "=========================================="
log ""
log "Summary:"
log "  Previous commit: $CURRENT_COMMIT"
log "  Current commit:  $NEW_COMMIT"
log "  Application:     $APP_NAME"
log "  Status:          Running"
log "  Health check:    Passed"
log ""
log "Backups:"
log "  Database: ${BACKUP_FILE}.gz"
log "  Application: $BACKUP_APP"
log ""
log "View logs: pm2 logs $APP_NAME"
log "View status: pm2 status"
log "=========================================="

# Send notification (optional)
if command -v mail &> /dev/null; then
    echo "Deployment completed successfully for $APP_NAME" | \
        mail -s "Deployment Success" "${DEPLOY_NOTIFICATION_EMAIL:-admin@example.com}" || true
fi

exit 0
