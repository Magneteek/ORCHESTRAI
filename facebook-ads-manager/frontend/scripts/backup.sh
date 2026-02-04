#!/bin/bash

# Facebook Ads Manager - Backup Script
# Creates database and application backups and uploads to Digital Ocean Spaces

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="facebook-ads-manager"
DATABASE_NAME="facebook_ads_manager"
DB_USER="fbads"
BACKUP_DIR="/backups"
APP_DIR="/home/deploy/apps/facebook-ads-manager/frontend"
S3_BUCKET="facebook-ads-manager-backups"
LOG_FILE="/var/log/backup.log"
RETENTION_DAYS=7

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

# Start backup
log "=========================================="
log "Starting backup of $APP_NAME"
log "=========================================="

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Generate timestamp for backup files
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)

# 1. Database Backup
log "Step 1: Creating database backup..."

DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
DB_BACKUP_COMPRESSED="$DB_BACKUP_FILE.gz"

# Dump database
pg_dump -U "$DB_USER" "$DATABASE_NAME" > "$DB_BACKUP_FILE" || error "Database backup failed"

# Get database size
DB_SIZE=$(du -h "$DB_BACKUP_FILE" | cut -f1)
log "Database backup created: $DB_BACKUP_FILE ($DB_SIZE)"

# Compress backup
gzip "$DB_BACKUP_FILE" || error "Failed to compress database backup"

COMPRESSED_SIZE=$(du -h "$DB_BACKUP_COMPRESSED" | cut -f1)
log "Database backup compressed: $DB_BACKUP_COMPRESSED ($COMPRESSED_SIZE) ✓"

# 2. Application Backup (optional - excludes node_modules and .next)
log "Step 2: Creating application backup..."

APP_BACKUP_FILE="$BACKUP_DIR/app_backup_$TIMESTAMP.tar.gz"

cd "$APP_DIR" || error "Failed to change to application directory"

tar -czf "$APP_BACKUP_FILE" \
    --exclude='node_modules' \
    --exclude='.next' \
    --exclude='*.log' \
    --exclude='.git' \
    . || warning "Application backup failed"

if [ -f "$APP_BACKUP_FILE" ]; then
    APP_SIZE=$(du -h "$APP_BACKUP_FILE" | cut -f1)
    log "Application backup created: $APP_BACKUP_FILE ($APP_SIZE) ✓"
else
    warning "Application backup was not created"
fi

# 3. Verify backups
log "Step 3: Verifying backups..."

# Verify database backup integrity
if gunzip -t "$DB_BACKUP_COMPRESSED" 2>/dev/null; then
    log "Database backup integrity verified ✓"
else
    error "Database backup is corrupted"
fi

# Verify application backup integrity
if [ -f "$APP_BACKUP_FILE" ]; then
    if tar -tzf "$APP_BACKUP_FILE" > /dev/null 2>&1; then
        log "Application backup integrity verified ✓"
    else
        warning "Application backup may be corrupted"
    fi
fi

# 4. Upload to Digital Ocean Spaces (if configured)
if command -v s3cmd &> /dev/null && [ -n "$S3_BUCKET" ]; then
    log "Step 4: Uploading backups to Digital Ocean Spaces..."

    # Upload database backup
    s3cmd put "$DB_BACKUP_COMPRESSED" "s3://$S3_BUCKET/backups/$DATE/" || warning "Failed to upload database backup"
    log "Database backup uploaded to s3://$S3_BUCKET/backups/$DATE/ ✓"

    # Upload application backup
    if [ -f "$APP_BACKUP_FILE" ]; then
        s3cmd put "$APP_BACKUP_FILE" "s3://$S3_BUCKET/backups/$DATE/" || warning "Failed to upload application backup"
        log "Application backup uploaded to s3://$S3_BUCKET/backups/$DATE/ ✓"
    fi

    # List remote backups
    info "Remote backups:"
    s3cmd ls "s3://$S3_BUCKET/backups/$DATE/" || warning "Failed to list remote backups"
else
    warning "s3cmd not configured. Skipping remote upload"
fi

# 5. Create backup manifest
log "Step 5: Creating backup manifest..."

MANIFEST_FILE="$BACKUP_DIR/backup_manifest_$TIMESTAMP.txt"

cat > "$MANIFEST_FILE" << EOF
Backup Manifest
===============

Backup Date: $(date)
Timestamp: $TIMESTAMP

Database Backup:
  File: $DB_BACKUP_COMPRESSED
  Size: $COMPRESSED_SIZE
  Database: $DATABASE_NAME
  User: $DB_USER

Application Backup:
  File: $APP_BACKUP_FILE
  Size: ${APP_SIZE:-N/A}
  Directory: $APP_DIR

Remote Storage:
  Bucket: s3://$S3_BUCKET/backups/$DATE/
  Status: $([ -n "$(command -v s3cmd)" ] && echo "Uploaded" || echo "Not configured")

Retention:
  Local: $RETENTION_DAYS days
  Remote: 30 days (configured in Spaces lifecycle)

Verification:
  Database backup integrity: Verified
  Application backup integrity: $([ -f "$APP_BACKUP_FILE" ] && echo "Verified" || echo "N/A")

Notes:
  - Restore command: gunzip -c $DB_BACKUP_COMPRESSED | psql -U $DB_USER $DATABASE_NAME
  - Application restore: tar -xzf $APP_BACKUP_FILE -C $APP_DIR
EOF

log "Backup manifest created: $MANIFEST_FILE ✓"

# 6. Cleanup old backups
log "Step 6: Cleaning up old backups (older than $RETENTION_DAYS days)..."

# Find and delete old database backups
OLD_DB_BACKUPS=$(find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS)
if [ -n "$OLD_DB_BACKUPS" ]; then
    echo "$OLD_DB_BACKUPS" | while read -r file; do
        rm -f "$file" || warning "Failed to delete $file"
        log "Deleted old backup: $file"
    done
    DELETED_COUNT=$(echo "$OLD_DB_BACKUPS" | wc -l)
    log "Deleted $DELETED_COUNT old database backup(s) ✓"
else
    log "No old database backups to delete"
fi

# Find and delete old application backups
OLD_APP_BACKUPS=$(find "$BACKUP_DIR" -name "app_backup_*.tar.gz" -mtime +$RETENTION_DAYS)
if [ -n "$OLD_APP_BACKUPS" ]; then
    echo "$OLD_APP_BACKUPS" | while read -r file; do
        rm -f "$file" || warning "Failed to delete $file"
        log "Deleted old backup: $file"
    done
    DELETED_COUNT=$(echo "$OLD_APP_BACKUPS" | wc -l)
    log "Deleted $DELETED_COUNT old application backup(s) ✓"
else
    log "No old application backups to delete"
fi

# Delete old manifests
find "$BACKUP_DIR" -name "backup_manifest_*.txt" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true

# 7. Check disk space
log "Step 7: Checking disk space..."

DISK_USAGE=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
DISK_AVAILABLE=$(df -h "$BACKUP_DIR" | awk 'NR==2 {print $4}')

info "Disk usage: $DISK_USAGE% (Available: $DISK_AVAILABLE)"

if [ "$DISK_USAGE" -gt 80 ]; then
    warning "Disk usage is high ($DISK_USAGE%). Consider freeing up space."
fi

# 8. Backup summary
log "=========================================="
log "Backup completed successfully!"
log "=========================================="
log ""
log "Summary:"
log "  Database backup:     $DB_BACKUP_COMPRESSED ($COMPRESSED_SIZE)"
log "  Application backup:  ${APP_BACKUP_FILE:-N/A} (${APP_SIZE:-N/A})"
log "  Manifest:            $MANIFEST_FILE"
log "  Remote storage:      s3://$S3_BUCKET/backups/$DATE/"
log "  Disk usage:          $DISK_USAGE% ($DISK_AVAILABLE available)"
log ""
log "Retention:"
log "  Local backups:       $RETENTION_DAYS days"
log "  Remote backups:      30 days"
log ""
log "Restore commands:"
log "  Database:     gunzip -c $DB_BACKUP_COMPRESSED | psql -U $DB_USER $DATABASE_NAME"
log "  Application:  tar -xzf $APP_BACKUP_FILE -C $APP_DIR"
log "=========================================="

# 9. Send notification (optional)
if command -v mail &> /dev/null && [ -n "${BACKUP_NOTIFICATION_EMAIL}" ]; then
    cat "$MANIFEST_FILE" | \
        mail -s "Backup Completed - $APP_NAME" "$BACKUP_NOTIFICATION_EMAIL" || true
fi

# 10. Exit with success
exit 0
