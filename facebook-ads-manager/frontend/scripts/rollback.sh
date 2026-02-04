#!/bin/bash

# Facebook Ads Manager - Rollback Script
# Rolls back to a previous version in case of deployment issues

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
LOG_FILE="/var/log/rollback-$(date +%Y%m%d-%H%M%S).log"

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

# Start rollback
log "=========================================="
log "Starting rollback of $APP_NAME"
log "=========================================="

# Confirmation
warning "This will rollback the application to a previous version"
read -p "Are you sure you want to continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log "Rollback cancelled"
    exit 0
fi

# Change to application directory
cd "$APP_DIR" || error "Failed to change to application directory"

# 1. Show recent commits
log "Step 1: Recent commits"
git log --oneline -n 10

# Ask which commit to rollback to
echo ""
read -p "Enter the commit hash to rollback to (or 'HEAD~1' for previous): " COMMIT_HASH

if [ -z "$COMMIT_HASH" ]; then
    COMMIT_HASH="HEAD~1"
fi

# Verify commit exists
if ! git rev-parse "$COMMIT_HASH" &> /dev/null; then
    error "Invalid commit hash: $COMMIT_HASH"
fi

# Get current and target commits
CURRENT_COMMIT=$(git rev-parse HEAD)
TARGET_COMMIT=$(git rev-parse "$COMMIT_HASH")

log "Current commit: $CURRENT_COMMIT"
log "Target commit:  $TARGET_COMMIT"

# 2. Create backup before rollback
log "Step 2: Creating backup before rollback..."

# Backup current state
BACKUP_FILE="$BACKUP_DIR/pre-rollback-$(date +%Y%m%d-%H%M%S).sql"
pg_dump -U fbads facebook_ads_manager > "$BACKUP_FILE" || error "Database backup failed"
gzip "$BACKUP_FILE"
log "Database backup created: ${BACKUP_FILE}.gz ✓"

# 3. Stop application
log "Step 3: Stopping application..."
pm2 stop "$APP_NAME" || warning "Failed to stop application"
sleep 3
log "Application stopped ✓"

# 4. Rollback code
log "Step 4: Rolling back code to $TARGET_COMMIT..."
git reset --hard "$TARGET_COMMIT" || error "Failed to rollback code"
log "Code rolled back ✓"

# 5. Ask about database rollback
echo ""
warning "Database rollback options:"
info "1. Keep current database (recommended if schema unchanged)"
info "2. Restore from latest backup"
info "3. Restore from specific backup"
read -p "Choose option (1/2/3): " -n 1 -r
echo

case $REPLY in
    1)
        log "Keeping current database"
        ;;
    2)
        log "Restoring from latest backup..."
        LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/pre-deploy-*.sql.gz | head -1)
        if [ -z "$LATEST_BACKUP" ]; then
            error "No backup found"
        fi
        log "Using backup: $LATEST_BACKUP"

        # Drop and recreate database
        psql -U postgres << EOF || error "Failed to recreate database"
DROP DATABASE IF EXISTS facebook_ads_manager;
CREATE DATABASE facebook_ads_manager;
GRANT ALL PRIVILEGES ON DATABASE facebook_ads_manager TO fbads;
EOF

        # Restore from backup
        gunzip -c "$LATEST_BACKUP" | psql -U fbads facebook_ads_manager || error "Failed to restore database"
        log "Database restored from backup ✓"
        ;;
    3)
        log "Available backups:"
        ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || error "No backups found"
        read -p "Enter backup filename: " BACKUP_FILE

        if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
            error "Backup file not found: $BACKUP_FILE"
        fi

        # Drop and recreate database
        psql -U postgres << EOF || error "Failed to recreate database"
DROP DATABASE IF EXISTS facebook_ads_manager;
CREATE DATABASE facebook_ads_manager;
GRANT ALL PRIVILEGES ON DATABASE facebook_ads_manager TO fbads;
EOF

        # Restore from backup
        gunzip -c "$BACKUP_DIR/$BACKUP_FILE" | psql -U fbads facebook_ads_manager || error "Failed to restore database"
        log "Database restored from backup ✓"
        ;;
    *)
        error "Invalid option"
        ;;
esac

# 6. Install dependencies
log "Step 5: Installing dependencies..."
npm ci --production || error "Failed to install dependencies"
log "Dependencies installed ✓"

# 7. Generate Prisma client
log "Step 6: Generating Prisma client..."
npx prisma generate || error "Failed to generate Prisma client"
log "Prisma client generated ✓"

# 8. Run migrations if database was not restored
if [ "$REPLY" == "1" ]; then
    log "Step 7: Checking migration status..."
    npx prisma migrate status || warning "Migration status check failed"
fi

# 9. Rebuild application
log "Step 8: Building application..."
npm run build || error "Build failed"
log "Application built successfully ✓"

# 10. Restart application
log "Step 9: Restarting application..."
pm2 start "$APP_NAME" || error "Failed to start application"

# Wait for application to start
sleep 5

# Check if application is running
if ! pm2 list | grep -q "$APP_NAME.*online"; then
    error "Application failed to start"
fi

log "Application restarted successfully ✓"

# 11. Verify rollback
log "Step 10: Verifying rollback..."

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

# 14. Rollback summary
log "=========================================="
log "Rollback completed successfully!"
log "=========================================="
log ""
log "Summary:"
log "  Previous commit: $CURRENT_COMMIT"
log "  Current commit:  $TARGET_COMMIT"
log "  Application:     $APP_NAME"
log "  Status:          Running"
log "  Health check:    Passed"
log ""
log "Backup created:"
log "  Database: ${BACKUP_FILE}.gz"
log ""
log "View logs: pm2 logs $APP_NAME"
log "View status: pm2 status"
log "=========================================="

# Send notification (optional)
if command -v mail &> /dev/null; then
    echo "Rollback completed for $APP_NAME to commit $TARGET_COMMIT" | \
        mail -s "Rollback Completed" "${DEPLOY_NOTIFICATION_EMAIL:-admin@example.com}" || true
fi

# Create rollback report
cat > /tmp/rollback-report.txt << EOF
Rollback Report
==============

Executed: $(date)
User: $USER

Previous Commit: $CURRENT_COMMIT
Current Commit: $TARGET_COMMIT

Application Status: Running
Health Check: Passed

Backup Created: ${BACKUP_FILE}.gz

Reason: [FILL IN REASON]
Issues Encountered: [FILL IN ISSUES]
Next Steps: [FILL IN NEXT STEPS]
EOF

log "Rollback report created: /tmp/rollback-report.txt"
log "Please fill in the report with details about the rollback"

exit 0
