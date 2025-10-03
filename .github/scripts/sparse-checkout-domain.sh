#!/bin/bash
# ORCHESTRAI Sparse Checkout Helper
# Checkout only specific domain files for focused development

set -e

echo "🎯 ORCHESTRAI Sparse Checkout - Domain Focus Mode"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if sparse checkout is already enabled
if git config core.sparseCheckout > /dev/null 2>&1; then
    SPARSE_ENABLED=$(git config core.sparseCheckout)
    if [ "$SPARSE_ENABLED" == "true" ]; then
        echo -e "${YELLOW}⚠ Sparse checkout is already enabled${NC}"
        echo "Current configuration:"
        git sparse-checkout list
        echo ""
        read -p "Do you want to reconfigure? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
fi

# Show available domains
echo -e "${BLUE}Available domains:${NC}"
echo "  1) advertising-enhanced"
echo "  2) client-intelligence"
echo "  3) content-enhanced"
echo "  4) content-strategy"
echo "  5) reputation-intelligence"
echo "  6) seo"
echo "  7) web-quality"
echo "  8) ALL (disable sparse checkout)"
echo ""

read -p "Select domain number (or multiple separated by spaces): " selection

# Initialize sparse checkout
git sparse-checkout init --cone

# Base files always needed
BASE_FILES=(
    "package.json"
    "package-lock.json"
    ".env.example"
    "CLAUDE.md"
    "README.md"
    ".github"
    "orchestrai-master"
    "orchestrai-shared"
    "orchestrai-system/templates"
    "Orchestrai-frontend"
)

# Map selection to domains
declare -A domain_map=(
    [1]="orchestrai-domains/advertising-enhanced"
    [2]="orchestrai-domains/client-intelligence"
    [3]="orchestrai-domains/content-enhanced"
    [4]="orchestrai-domains/content-strategy"
    [5]="orchestrai-domains/reputation-intelligence"
    [6]="orchestrai-domains/seo"
    [7]="orchestrai-domains/web-quality"
)

if [[ $selection == "8" ]]; then
    echo -e "${BLUE}Disabling sparse checkout - checking out all files${NC}"
    git sparse-checkout disable
    echo -e "${GREEN}✓ Full repository checkout restored${NC}"
    exit 0
fi

# Build checkout list
CHECKOUT_DIRS=("${BASE_FILES[@]}")

for num in $selection; do
    if [[ -n "${domain_map[$num]}" ]]; then
        CHECKOUT_DIRS+=("${domain_map[$num]}")
        echo -e "  ${GREEN}✓ Added ${domain_map[$num]}${NC}"
    else
        echo -e "  ${RED}✗ Invalid selection: $num${NC}"
    fi
done

# Set sparse checkout
git sparse-checkout set "${CHECKOUT_DIRS[@]}"

echo ""
echo -e "${GREEN}🎯 Sparse checkout configured!${NC}"
echo ""
echo "Your workspace now includes:"
git sparse-checkout list
echo ""
echo "Benefits:"
echo "  ✓ Faster git operations"
echo "  ✓ Smaller working directory"
echo "  ✓ Focus on specific domain only"
echo "  ✓ Less clutter in IDE"
echo ""
echo "To add more domains:"
echo "  git sparse-checkout add orchestrai-domains/<domain-name>"
echo ""
echo "To see full repository again:"
echo "  git sparse-checkout disable"
echo ""
