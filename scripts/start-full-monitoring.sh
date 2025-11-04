#!/bin/bash

# Full Monitoring System Startup Script
# Starts both Hooks Server (port 5501) and Token Monitor (port 5505)

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ORCHESTRAI Token Monitoring System  ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js version: $(node --version)"
echo ""

# Configuration
export HOOKS_PORT=${HOOKS_PORT:-5501}
export TOKEN_MONITOR_PORT=${TOKEN_MONITOR_PORT:-5505}
export TOKEN_BUDGET=${TOKEN_BUDGET:-200000}
export SILENT_MODE=true  # Enable silent mode to prevent log bleeding

# Function to cleanup background processes
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"

    if [ ! -z "$HOOKS_PID" ]; then
        kill $HOOKS_PID 2>/dev/null || true
    fi

    if [ ! -z "$MONITOR_PID" ]; then
        kill $MONITOR_PID 2>/dev/null || true
    fi

    echo -e "${GREEN}✓${NC} Cleanup complete"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Kill any existing processes on these ports
echo -e "${YELLOW}Checking for existing processes...${NC}"
lsof -ti:$HOOKS_PORT | xargs kill -9 2>/dev/null || true
lsof -ti:$TOKEN_MONITOR_PORT | xargs kill -9 2>/dev/null || true
sleep 1
echo -e "${GREEN}✓${NC} Ports cleared"
echo ""

# Start Hooks Server (port 5501)
echo -e "${YELLOW}Starting Hooks Server on port $HOOKS_PORT...${NC}"
SILENT_MODE=true node "$PROJECT_ROOT/orchestrai-shared/claude-code/hooks-server.js" &
HOOKS_PID=$!

# Wait for hooks server to start
sleep 2

# Check if hooks server is running
if kill -0 $HOOKS_PID 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Hooks Server started (PID: $HOOKS_PID)"
else
    echo -e "${RED}Error: Failed to start Hooks Server${NC}"
    exit 1
fi

echo ""

# Start Token Monitor Server (port 5505)
echo -e "${YELLOW}Starting Token Monitor on port $TOKEN_MONITOR_PORT...${NC}"
SILENT_MODE=true node "$PROJECT_ROOT/orchestrai-shared/monitoring/token-monitor-server.js" &
MONITOR_PID=$!

# Wait for token monitor to start
sleep 2

# Check if monitor is running
if kill -0 $MONITOR_PID 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Token Monitor Server started (PID: $MONITOR_PID)"
else
    echo -e "${RED}Error: Failed to start Token Monitor Server${NC}"
    kill $HOOKS_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  System Running Successfully!         ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}📡 Hooks Server:${NC}      http://localhost:$HOOKS_PORT"
echo -e "${GREEN}📊 Token Monitor:${NC}     http://localhost:$TOKEN_MONITOR_PORT"
echo -e "${GREEN}❤️  Health Check:${NC}      http://localhost:$HOOKS_PORT/health"
echo ""
echo -e "${YELLOW}Hook Endpoints:${NC}"
echo "  POST http://localhost:$HOOKS_PORT/hooks/token-usage"
echo "  POST http://localhost:$HOOKS_PORT/hooks/task-start"
echo "  POST http://localhost:$HOOKS_PORT/hooks/task-complete"
echo ""
echo -e "${YELLOW}Monitor Endpoints:${NC}"
echo "  GET  http://localhost:$TOKEN_MONITOR_PORT/api/snapshot"
echo "  GET  http://localhost:$TOKEN_MONITOR_PORT/api/session-stats"
echo "  POST http://localhost:$TOKEN_MONITOR_PORT/api/token-usage"
echo ""
echo -e "${YELLOW}To view the terminal UI:${NC}"
echo "  Open a new terminal and run:"
echo "  ${GREEN}cd $PROJECT_ROOT && node orchestrai-shared/monitoring/token-monitor-cli.js${NC}"
echo ""
echo -e "${YELLOW}To test the system:${NC}"
echo "  Open a new terminal and run:"
echo "  ${GREEN}curl -X POST http://localhost:$HOOKS_PORT/hooks/token-usage \\${NC}"
echo "  ${GREEN}  -H 'Content-Type: application/json' \\${NC}"
echo "  ${GREEN}  -d '{\"inputTokens\":1000,\"outputTokens\":500}'${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Keep script running
wait
