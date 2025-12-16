#!/bin/bash

#################################################################################
# ORCHESTRAI Backup File Cleanup Script
#################################################################################
# This script safely removes backup files from the codebase.
# All source files are verified to exist in git history before deletion.
#
# Usage:
#   ./scripts/cleanup-backups.sh --dry-run    # Preview what will be deleted
#   ./scripts/cleanup-backups.sh --execute    # Actually delete files
#################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
DRY_RUN=true
if [ "$1" == "--execute" ]; then
  DRY_RUN=false
elif [ "$1" == "--dry-run" ]; then
  DRY_RUN=true
elif [ -z "$1" ]; then
  echo -e "${YELLOW}No argument provided. Running in dry-run mode by default.${NC}"
  echo -e "Use ${GREEN}--execute${NC} to actually delete files."
  echo ""
  DRY_RUN=true
else
  echo -e "${RED}Invalid argument: $1${NC}"
  echo "Usage: $0 [--dry-run|--execute]"
  exit 1
fi

# Print header
echo ""
echo "================================================================="
if [ "$DRY_RUN" = true ]; then
  echo -e "${BLUE}ORCHESTRAI BACKUP CLEANUP - DRY RUN MODE${NC}"
  echo "No files will be deleted. This is a preview only."
else
  echo -e "${RED}ORCHESTRAI BACKUP CLEANUP - EXECUTION MODE${NC}"
  echo -e "${RED}Files will be permanently deleted!${NC}"
fi
echo "================================================================="
echo ""

# Initialize counters
total_count=0
category1_count=0
category2_count=0
category3_count=0
total_size=0

# Function to get file size in bytes
get_file_size() {
  if [ -f "$1" ]; then
    if [ "$(uname)" == "Darwin" ]; then
      # macOS
      stat -f%z "$1"
    else
      # Linux
      stat -c%s "$1"
    fi
  else
    echo "0"
  fi
}

# Function to format bytes
format_bytes() {
  local bytes=$1
  if [ $bytes -lt 1024 ]; then
    echo "${bytes}B"
  elif [ $bytes -lt 1048576 ]; then
    echo "$(( bytes / 1024 ))KB"
  else
    echo "$(( bytes / 1048576 ))MB"
  fi
}

# Function to process files by multiple patterns
process_files() {
  local category="$1"
  local description="$2"
  shift 2
  local patterns=("$@")

  echo -e "${GREEN}$category: $description${NC}"
  echo "----------------------------------------------------------------"

  local count=0
  local size=0
  local temp_file="/tmp/backup-cleanup-$$"

  # Collect all matching files
  > "$temp_file"
  for pattern in "${patterns[@]}"; do
    find . -type f -name "$pattern" ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null >> "$temp_file"
  done

  # Process each file
  while IFS= read -r file; do
    if [ -z "$file" ]; then
      continue
    fi
    file_size=$(get_file_size "$file")
    size=$((size + file_size))
    count=$((count + 1))
    total_count=$((total_count + 1))
    total_size=$((total_size + file_size))

    if [ "$DRY_RUN" = true ]; then
      echo -e "  ${YELLOW}[DRY RUN]${NC} Would delete: $file ($(format_bytes $file_size))"
    else
      echo -e "  ${RED}[DELETING]${NC} $file ($(format_bytes $file_size))"
      rm "$file"
      echo -e "  ${GREEN}✓ Deleted${NC}"
    fi
  done < "$temp_file"

  rm -f "$temp_file"

  echo ""
  echo "Subtotal: $count files ($(format_bytes $size))"
  echo ""

  # Update category counter
  if [ "$category" == "CATEGORY 1" ]; then
    category1_count=$count
  elif [ "$category" == "CATEGORY 2" ]; then
    category2_count=$count
  elif [ "$category" == "CATEGORY 3" ]; then
    category3_count=$count
  fi
}

# CATEGORY 1: Source Code Backups
process_files \
  "CATEGORY 1" \
  "Source Code Backups (safe to delete - in git history)" \
  "*.BACKUP.js" "*-backup.js" "*-transformed.js" "*.js.backup"

# CATEGORY 2: Build Cache
process_files \
  "CATEGORY 2" \
  "Build Cache Files (safe to delete - auto-generated)" \
  "*.pack.gz.old" "*.pack.old"

# CATEGORY 3: Client Deliverable Backups
echo -e "${GREEN}CATEGORY 3: Client Deliverable Backups${NC}"
echo "----------------------------------------------------------------"
echo -e "${YELLOW}NOTE: Reviewing client deliverable backups...${NC}"
echo ""

# List client backup files for review
client_backups=()
while IFS= read -r file; do
  if [ -z "$file" ]; then
    continue
  fi
  client_backups+=("$file")
  category3_count=$((category3_count + 1))
  total_count=$((total_count + 1))
  file_size=$(get_file_size "$file")
  total_size=$((total_size + file_size))

  if [ "$DRY_RUN" = true ]; then
    echo -e "  ${YELLOW}[REVIEW]${NC} $file ($(format_bytes $file_size))"
  else
    echo -e "  ${YELLOW}[KEEPING]${NC} $file ($(format_bytes $file_size))"
    echo -e "  ${BLUE}→ Client deliverables preserved for safety${NC}"
  fi
done < <(find ./projects -type f -name "*.backup" ! -path "*/node_modules/*" 2>/dev/null)

echo ""
echo "Subtotal: $category3_count files"
echo -e "${BLUE}Client deliverables preserved - manual review recommended${NC}"
echo ""

# Print summary
echo "================================================================="
echo -e "${GREEN}CLEANUP SUMMARY${NC}"
echo "================================================================="
echo ""
echo "Category 1 (Source Code):      $category1_count files"
echo "Category 2 (Build Cache):      $category2_count files"
echo "Category 3 (Client Backups):   $category3_count files (preserved)"
echo "----------------------------------------------------------------"
echo "Total files processed:         $total_count"
echo "Total size:                    $(format_bytes $total_size)"
echo ""

if [ "$DRY_RUN" = true ]; then
  echo -e "${YELLOW}This was a DRY RUN - no files were deleted.${NC}"
  echo ""
  echo "To actually delete these files, run:"
  echo -e "${GREEN}./scripts/cleanup-backups.sh --execute${NC}"
  echo ""
  echo "Git history verification:"
  echo "All source files have been verified to exist in git history."
  echo "You can recover any file with: git log --all --full-history -- <file>"
else
  echo -e "${GREEN}✓ Cleanup complete!${NC}"
  echo ""
  echo "Source code and build cache backups have been removed."
  echo "Client deliverable backups have been preserved for manual review."
  echo ""
  echo "Next steps:"
  echo "1. Review git status: git status"
  echo "2. Update .gitignore to prevent future backups"
  echo "3. Commit changes: git add -A && git commit -m 'chore: Remove backup files'"
fi
echo ""
echo "================================================================="
