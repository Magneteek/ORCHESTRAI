#!/bin/bash

# PostgreSQL Database Backup Script
# Creates compressed backups and uploads to S3 (optional)

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="facebook_ads_backup_${TIMESTAMP}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse database URL
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}ERROR: DATABASE_URL environment variable is not set${NC}"
    exit 1
fi

# Extract database connection details from DATABASE_URL
# Format: postgresql://user:password@host:port/database
DB_USER=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASSWORD=$(echo "$DATABASE_URL" | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}==================================${NC}"
echo -e "${YELLOW}PostgreSQL Database Backup${NC}"
echo -e "${YELLOW}==================================${NC}"
echo ""
echo -e "Database: ${GREEN}${DB_NAME}${NC}"
echo -e "Host: ${GREEN}${DB_HOST}:${DB_PORT}${NC}"
echo -e "Backup file: ${GREEN}${BACKUP_FILE}${NC}"
echo ""

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
export PGPASSWORD="$DB_PASSWORD"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --format=custom \
    --verbose \
    --file="$BACKUP_PATH" 2>&1 | tee /tmp/backup.log; then

    echo -e "${GREEN}✓ Backup created successfully${NC}"
else
    echo -e "${RED}✗ Backup failed${NC}"
    cat /tmp/backup.log
    exit 1
fi

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
gzip -f "$BACKUP_PATH"
BACKUP_PATH="${BACKUP_PATH}.gz"

# Get backup size
BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
echo -e "${GREEN}✓ Backup compressed: ${BACKUP_SIZE}${NC}"

# Upload to S3 (optional)
if [ -n "$AWS_S3_BUCKET" ] && [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${YELLOW}Uploading to S3...${NC}"

    S3_PATH="s3://${AWS_S3_BUCKET}/backups/$(date +%Y)/$(date +%m)/${BACKUP_FILE}.gz"

    if aws s3 cp "$BACKUP_PATH" "$S3_PATH" \
        --storage-class STANDARD_IA \
        --metadata "database=${DB_NAME},timestamp=${TIMESTAMP}"; then

        echo -e "${GREEN}✓ Backup uploaded to S3: ${S3_PATH}${NC}"
    else
        echo -e "${YELLOW}⚠ Failed to upload to S3 (backup still saved locally)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ S3 credentials not configured, skipping upload${NC}"
fi

# Clean up old backups
echo -e "${YELLOW}Cleaning up old backups (older than ${RETENTION_DAYS} days)...${NC}"
find "$BACKUP_DIR" -name "facebook_ads_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
DELETED_COUNT=$(find "$BACKUP_DIR" -name "facebook_ads_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} | wc -l)
echo -e "${GREEN}✓ Deleted ${DELETED_COUNT} old backup(s)${NC}"

# List recent backups
echo ""
echo -e "${YELLOW}Recent backups:${NC}"
ls -lh "$BACKUP_DIR"/facebook_ads_backup_*.sql.gz 2>/dev/null | tail -n 5 || echo "No backups found"

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}Backup completed successfully${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "Backup location: ${GREEN}${BACKUP_PATH}${NC}"
echo -e "Backup size: ${GREEN}${BACKUP_SIZE}${NC}"
echo ""

# Unset password
unset PGPASSWORD

exit 0
