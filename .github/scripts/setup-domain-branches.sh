#!/bin/bash
# ORCHESTRAI Domain Branch Setup Script
# Creates modular branching structure for domain-based development

set -e  # Exit on error

echo "🌳 ORCHESTRAI Modular Git Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

echo -e "${BLUE}Step 1: Creating develop branch from orchestration-v2.0${NC}"
# Rename orchestration-v2.0 to develop (or create from it)
if git show-ref --verify --quiet refs/heads/develop; then
    echo "✓ develop branch already exists"
else
    git checkout orchestration-v2.0
    git branch develop
    echo -e "${GREEN}✓ Created develop branch${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Creating domain development branches${NC}"

# Array of domains
domains=(
    "advertising-enhanced"
    "client-intelligence"
    "content-enhanced"
    "content-strategy"
    "reputation-intelligence"
    "seo"
    "web-quality"
)

git checkout develop

for domain in "${domains[@]}"; do
    branch_name="domain/$domain"

    if git show-ref --verify --quiet refs/heads/$branch_name; then
        echo "  ✓ $branch_name already exists"
    else
        git branch $branch_name
        echo -e "  ${GREEN}✓ Created $branch_name${NC}"
    fi
done

echo ""
echo -e "${BLUE}Step 3: Setting up branch protection (GitHub)${NC}"
echo "Run these commands on GitHub or via gh CLI:"
echo ""
echo "  gh api repos/:owner/:repo/branches/main/protection -X PUT -F required_status_checks='{}' -F enforce_admins=true -F required_pull_request_reviews[required_approving_review_count]=2"
echo "  gh api repos/:owner/:repo/branches/develop/protection -X PUT -F required_status_checks='{}' -F required_pull_request_reviews[required_approving_review_count]=1"
echo ""

echo -e "${BLUE}Step 4: Push all branches to remote${NC}"
read -p "Push branches to origin? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push origin develop

    for domain in "${domains[@]}"; do
        git push origin domain/$domain
    done

    echo -e "${GREEN}✓ All branches pushed to remote${NC}"
else
    echo -e "${YELLOW}⚠ Skipped pushing to remote${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Domain branch setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Set main branch as default on GitHub"
echo "  2. Configure branch protection rules"
echo "  3. Update CI/CD workflows"
echo "  4. Share .github/GIT-WORKFLOW.md with your team"
echo ""
echo "Available branches:"
git branch | grep -E "(develop|domain/)"
