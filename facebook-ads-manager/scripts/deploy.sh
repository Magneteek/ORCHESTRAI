#!/bin/bash

# Deployment Automation Script
# Handles pre-deployment checks, deployment, and post-deployment verification

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-staging}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}==================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

# Check if environment is valid
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    echo "Usage: $0 [staging|production]"
    exit 1
fi

print_header "Facebook Ads Manager Deployment"
print_info "Environment: $ENVIRONMENT"
print_info "Project root: $PROJECT_ROOT"

# Step 1: Pre-deployment checks
print_header "Step 1: Pre-deployment Checks"

# Check if required tools are installed
print_info "Checking required tools..."
command -v node >/dev/null 2>&1 || { print_error "Node.js is not installed"; exit 1; }
command -v npm >/dev/null 2>&1 || { print_error "npm is not installed"; exit 1; }
command -v git >/dev/null 2>&1 || { print_error "git is not installed"; exit 1; }

print_success "All required tools are installed"

# Check Node.js version
NODE_VERSION=$(node -v | sed 's/v//')
REQUIRED_VERSION="18.20.0"
if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is below required version $REQUIRED_VERSION"
    exit 1
fi
print_success "Node.js version: $NODE_VERSION"

# Check git status
if [[ $(git status --porcelain) ]]; then
    print_warning "Working directory is not clean"
    git status --short
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "Working directory is clean"
fi

# Validate environment variables
print_info "Validating environment variables..."
cd "$PROJECT_ROOT"
if node scripts/validate-env.js "$ENVIRONMENT"; then
    print_success "Environment variables validated"
else
    print_error "Environment validation failed"
    exit 1
fi

# Step 2: Run tests
print_header "Step 2: Running Tests"

cd "$PROJECT_ROOT/frontend"

print_info "Running linter..."
if npm run lint; then
    print_success "Linter passed"
else
    print_error "Linter failed"
    exit 1
fi

print_info "Running type check..."
if npm run type-check; then
    print_success "Type check passed"
else
    print_error "Type check failed"
    exit 1
fi

print_info "Running unit tests..."
if npm test -- --passWithNoTests; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# Step 3: Build application
print_header "Step 3: Building Application"

print_info "Generating Prisma Client..."
npx prisma generate

print_info "Building Next.js application..."
if npm run build; then
    print_success "Build completed"
else
    print_error "Build failed"
    exit 1
fi

# Step 4: Create backup (production only)
if [ "$ENVIRONMENT" = "production" ]; then
    print_header "Step 4: Creating Database Backup"

    if [ -f "$SCRIPT_DIR/backup-database.sh" ]; then
        print_info "Creating backup..."
        if bash "$SCRIPT_DIR/backup-database.sh"; then
            print_success "Backup created"
        else
            print_error "Backup failed"
            exit 1
        fi
    else
        print_warning "Backup script not found, skipping..."
    fi
fi

# Step 5: Deploy
print_header "Step 5: Deploying to $ENVIRONMENT"

if command -v vercel >/dev/null 2>&1; then
    print_info "Deploying to Vercel..."

    if [ "$ENVIRONMENT" = "production" ]; then
        # Production deployment requires confirmation
        print_warning "You are about to deploy to PRODUCTION"
        read -p "Type 'DEPLOY' to confirm: " CONFIRMATION

        if [ "$CONFIRMATION" != "DEPLOY" ]; then
            print_error "Deployment cancelled"
            exit 1
        fi

        vercel deploy --prod
    else
        # Staging deployment
        vercel deploy
    fi

    print_success "Deployment initiated"
else
    print_warning "Vercel CLI not found"
    print_info "Install with: npm install -g vercel"
    print_info "Or use GitHub Actions for automated deployment"
fi

# Step 6: Run migrations
print_header "Step 6: Running Database Migrations"

print_info "Applying migrations..."
if npx prisma migrate deploy; then
    print_success "Migrations applied"
else
    print_error "Migration failed"
    exit 1
fi

# Step 7: Post-deployment verification
print_header "Step 7: Post-deployment Verification"

print_info "Waiting for deployment to stabilize..."
sleep 10

# Determine health check URL
if [ "$ENVIRONMENT" = "production" ]; then
    HEALTH_URL="${PRODUCTION_URL:-https://yourdomain.com}/api/health"
else
    HEALTH_URL="${STAGING_URL:-https://staging.yourdomain.com}/api/health"
fi

print_info "Checking health endpoint: $HEALTH_URL"

MAX_RETRIES=5
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if curl -f -s "$HEALTH_URL" > /dev/null; then
        print_success "Health check passed"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        print_warning "Health check failed, retrying... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 5
    else
        print_error "Health check failed after $MAX_RETRIES attempts"
        exit 1
    fi
done

# Step 8: Summary
print_header "Deployment Summary"

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Environment: $ENVIRONMENT"
echo "Health URL: $HEALTH_URL"
echo "Deployment time: $(date)"
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo -e "${YELLOW}Post-deployment checklist:${NC}"
    echo "  ☐ Monitor error tracking (Sentry)"
    echo "  ☐ Check application logs"
    echo "  ☐ Verify critical user flows"
    echo "  ☐ Monitor performance metrics"
    echo "  ☐ Announce deployment to team"
fi

exit 0
