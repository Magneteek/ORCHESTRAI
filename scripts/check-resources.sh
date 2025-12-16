#!/bin/bash
# ORCHESTRAI Resource Pre-Flight Check
# Run this before starting heavy workloads

echo "=========================================="
echo "ORCHESTRAI Resource Check"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check memory
echo "📊 Memory Status:"
TOTAL_MEM=$(sysctl -n hw.memsize)
TOTAL_GB=$((TOTAL_MEM / 1024 / 1024 / 1024))

# Get free memory pages and calculate
FREE_PAGES=$(vm_stat | grep "Pages free" | awk '{print $3}' | tr -d '.')
INACTIVE_PAGES=$(vm_stat | grep "Pages inactive" | awk '{print $3}' | tr -d '.')
AVAILABLE_PAGES=$((FREE_PAGES + INACTIVE_PAGES))
AVAILABLE_GB=$((AVAILABLE_PAGES * 16384 / 1024 / 1024 / 1024))

USED_GB=$((TOTAL_GB - AVAILABLE_GB))
USED_PERCENT=$((USED_GB * 100 / TOTAL_GB))

echo "  Total: ${TOTAL_GB}GB"
echo "  Available: ${AVAILABLE_GB}GB"
echo "  Used: ${USED_GB}GB (${USED_PERCENT}%)"

if [ $USED_PERCENT -gt 85 ]; then
    echo -e "  ${RED}⚠️  WARNING: High memory usage!${NC}"
elif [ $USED_PERCENT -gt 70 ]; then
    echo -e "  ${YELLOW}⚠️  CAUTION: Moderate memory usage${NC}"
else
    echo -e "  ${GREEN}✅ Memory OK${NC}"
fi

echo ""

# Check running processes
echo "🔧 Running Processes:"
NODE_COUNT=$(ps aux | grep -E "(node|npm|npx)" | grep -v grep | wc -l)
MCP_COUNT=$(ps aux | grep "mcp-server" | grep -v grep | wc -l)

echo "  Node.js processes: $NODE_COUNT"
echo "  MCP servers: $MCP_COUNT"

if [ $MCP_COUNT -gt 6 ]; then
    echo -e "  ${RED}⚠️  WARNING: Too many MCP servers!${NC}"
    echo "  Consider using .mcp.minimal.json configuration"
elif [ $MCP_COUNT -gt 4 ]; then
    echo -e "  ${YELLOW}⚠️  CAUTION: High MCP server count${NC}"
else
    echo -e "  ${GREEN}✅ MCP servers OK${NC}"
fi

echo ""

# Check Redis
echo "💾 Redis Status:"
if redis-cli ping > /dev/null 2>&1; then
    REDIS_MEM=$(redis-cli INFO memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
    echo -e "  ${GREEN}✅ Redis is running${NC}"
    echo "  Memory usage: $REDIS_MEM"
else
    echo -e "  ${RED}❌ Redis is not running${NC}"
    echo "  Start with: npm run redis"
fi

echo ""

# Check disk space
echo "💿 Disk Space:"
DISK_USAGE=$(df -h /Users/kris/CLAUDEtools/ORCHESTRAI | awk 'NR==2 {print $5}' | tr -d '%')
DISK_AVAILABLE=$(df -h /Users/kris/CLAUDEtools/ORCHESTRAI | awk 'NR==2 {print $4}')

echo "  Available: $DISK_AVAILABLE"
echo "  Usage: ${DISK_USAGE}%"

if [ $DISK_USAGE -gt 90 ]; then
    echo -e "  ${RED}⚠️  WARNING: Low disk space!${NC}"
elif [ $DISK_USAGE -gt 80 ]; then
    echo -e "  ${YELLOW}⚠️  CAUTION: Disk space running low${NC}"
else
    echo -e "  ${GREEN}✅ Disk space OK${NC}"
fi

echo ""

# Check temp directory
echo "🗂️  Temp Directory:"
TEMP_SIZE=$(du -sh /Users/kris/CLAUDEtools/ORCHESTRAI/temp 2>/dev/null | awk '{print $1}')
if [ -z "$TEMP_SIZE" ]; then
    TEMP_SIZE="0B"
fi

echo "  Size: $TEMP_SIZE"

# Count files in temp
TEMP_FILES=$(find /Users/kris/CLAUDEtools/ORCHESTRAI/temp -type f 2>/dev/null | wc -l)
echo "  Files: $TEMP_FILES"

if [ $TEMP_FILES -gt 1000 ]; then
    echo -e "  ${YELLOW}⚠️  Consider cleaning temp directory${NC}"
    echo "  Run: rm -rf /Users/kris/CLAUDEtools/ORCHESTRAI/temp/*"
fi

echo ""

# Check active hooks
echo "🪝 Claude Code Hooks:"
if lsof -ti:5501 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅ Hooks server is running (port 5501)${NC}"
else
    echo -e "  ${YELLOW}ℹ️  Hooks server not running${NC}"
    echo "  Start with: npm run hooks:server"
fi

echo ""

# Check simultaneous server
echo "⚡ Simultaneous Execution Server:"
if ps aux | grep "start-simultaneous-server.js" | grep -v grep > /dev/null; then
    echo -e "  ${GREEN}✅ Simultaneous server is running${NC}"
else
    echo -e "  ${YELLOW}ℹ️  Simultaneous server not running${NC}"
fi

echo ""

# Overall recommendation
echo "=========================================="
echo "OVERALL ASSESSMENT"
echo "=========================================="
echo ""

WARNINGS=0
if [ $USED_PERCENT -gt 85 ]; then WARNINGS=$((WARNINGS + 1)); fi
if [ $MCP_COUNT -gt 6 ]; then WARNINGS=$((WARNINGS + 1)); fi
if [ $DISK_USAGE -gt 90 ]; then WARNINGS=$((WARNINGS + 1)); fi

if [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ System is ready for heavy workloads${NC}"
    echo ""
    echo "You can safely:"
    echo "  • Run multiple agents in parallel"
    echo "  • Execute complex pipelines"
    echo "  • Process large datasets"
elif [ $WARNINGS -eq 1 ]; then
    echo -e "${YELLOW}⚠️  System has minor issues${NC}"
    echo ""
    echo "Recommendations:"
    echo "  • Consider reducing concurrent operations"
    echo "  • Monitor resource usage during execution"
    echo "  • Use sequential execution for heavy tasks"
else
    echo -e "${RED}⚠️  System resources are strained!${NC}"
    echo ""
    echo "CRITICAL ACTIONS REQUIRED:"
    echo "  1. Switch to minimal MCP config: ./scripts/switch-mcp-minimal.sh"
    echo "  2. Close unnecessary applications"
    echo "  3. Clear temp directory: rm -rf /Users/kris/CLAUDEtools/ORCHESTRAI/temp/*"
    echo "  4. Restart VS Code to clear memory"
    echo "  5. Run agents sequentially (not in parallel)"
fi

echo ""
echo "=========================================="
