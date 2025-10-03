#!/bin/bash
# ORCHESTRAI Git Worktrees Setup
# Creates separate worktrees for simultaneous domain development

set -e

echo "🌲 ORCHESTRAI Git Worktrees Setup"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Base directory for worktrees
WORKTREE_BASE="../ORCHESTRAI-worktrees"

echo -e "${BLUE}Creating worktree directory structure${NC}"
mkdir -p "$WORKTREE_BASE"

# Domain worktrees configuration
declare -A worktrees=(
    ["advertising"]="domain/advertising-enhanced"
    ["content"]="domain/content-enhanced"
    ["content-strategy"]="domain/content-strategy"
    ["reputation"]="domain/reputation-intelligence"
    ["seo"]="domain/seo"
    ["web"]="domain/web-quality"
    ["client-intel"]="domain/client-intelligence"
)

echo ""
echo -e "${BLUE}Setting up domain worktrees:${NC}"

for name in "${!worktrees[@]}"; do
    branch="${worktrees[$name]}"
    path="$WORKTREE_BASE/$name"

    if [ -d "$path" ]; then
        echo -e "  ${YELLOW}⚠ $name worktree already exists at $path${NC}"
    else
        git worktree add "$path" "$branch"
        echo -e "  ${GREEN}✓ Created $name worktree${NC}"
        echo "    Path: $path"
        echo "    Branch: $branch"
    fi
done

echo ""
echo -e "${GREEN}🎉 Worktree setup complete!${NC}"
echo ""
echo "Your worktrees are located at:"
echo "  $WORKTREE_BASE/"
echo ""
echo "Usage examples:"
echo ""
echo "  # Work on advertising domain:"
echo "  cd $WORKTREE_BASE/advertising"
echo "  git checkout -b feature/advertising/google-ads-quality-score"
echo ""
echo "  # Work on content domain simultaneously:"
echo "  cd $WORKTREE_BASE/content"
echo "  git checkout -b feature/content/wordpress-publisher"
echo ""
echo "  # Work on SEO while others work:"
echo "  cd $WORKTREE_BASE/seo"
echo "  git checkout -b feature/seo/competitor-analysis"
echo ""
echo "List all worktrees:"
echo "  git worktree list"
echo ""
echo "Remove a worktree when done:"
echo "  git worktree remove $WORKTREE_BASE/advertising"
echo ""
