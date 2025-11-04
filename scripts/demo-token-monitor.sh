#!/bin/bash

# Token Monitor Demo Script
# Demonstrates the token monitor with simulated data

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MONITORING_DIR="$PROJECT_ROOT/orchestrai-shared/monitoring"

echo -e "${CYAN}================================${NC}"
echo -e "${CYAN}Token Monitor Demo${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Check if dependencies are installed
if ! npm list blessed blessed-contrib ws &> /dev/null; then
    echo -e "${YELLOW}Installing required dependencies...${NC}"
    npm install blessed blessed-contrib ws
    echo ""
fi

echo -e "${BLUE}This demo will:${NC}"
echo "  1. Start the WebSocket server"
echo "  2. Launch the terminal UI"
echo "  3. Send simulated token usage data"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the demo at any time${NC}"
echo ""
echo -e "${GREEN}Starting in 3 seconds...${NC}"
sleep 3

# Start WebSocket server in background
echo -e "${BLUE}Starting WebSocket server...${NC}"
node "$MONITORING_DIR/token-monitor-server.js" > /tmp/token-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Check if server is running
if ! kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${RED}Error: Failed to start WebSocket server${NC}"
    cat /tmp/token-server.log
    exit 1
fi

echo -e "${GREEN}✓ WebSocket server started (PID: $SERVER_PID)${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping demo...${NC}"

    # Kill test script
    if [ ! -z "$TEST_PID" ]; then
        kill $TEST_PID 2>/dev/null || true
    fi

    # Kill server
    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi

    echo -e "${GREEN}✓ Demo stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start test data generator in background
echo -e "${BLUE}Starting test data generator...${NC}"
node "$MONITORING_DIR/test-token-monitor.js" > /tmp/token-test.log 2>&1 &
TEST_PID=$!

echo -e "${GREEN}✓ Test data generator started (PID: $TEST_PID)${NC}"
echo ""

# Give the test script a moment to start
sleep 1

# Launch the terminal UI
echo -e "${CYAN}Launching Token Monitor UI...${NC}"
echo ""
node "$MONITORING_DIR/token-monitor-cli.js"

# Cleanup when UI exits
cleanup
