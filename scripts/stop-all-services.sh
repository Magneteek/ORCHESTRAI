#!/bin/bash
#
# ORCHESTRAI — Master Stop Script
# Gracefully stops all ORCHESTRAI services.
#
# Usage:
#   npm run system:stop-all
#   ./scripts/stop-all-services.sh
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

stop_port() {
  local port=$1 name=$2
  if lsof -i ":$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    local pid
    pid=$(lsof -i ":$port" -sTCP:LISTEN -t | head -1)
    echo -e "   ${YELLOW}Stopping $name (PID: $pid)...${NC}"
    kill -TERM "$pid" 2>/dev/null
    for i in $(seq 1 8); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 1
    done
    if kill -0 "$pid" 2>/dev/null; then
      kill -KILL "$pid" 2>/dev/null
      echo -e "   ${YELLOW}Force-killed $name${NC}"
    else
      echo -e "   ${GREEN}✅ $name stopped${NC}"
    fi
  else
    echo -e "   ✓ $name not running"
  fi
}

echo ""
echo -e "${BOLD}🛑 Stopping ORCHESTRAI services...${NC}"
echo "──────────────────────────────────────────────────────"

stop_port 3000 "Frontend"
stop_port 5502 "Trigger System"
stop_port 8080 "Simultaneous Execution Server"
stop_port 8000 "ML Service"
stop_port 5501 "Hooks Server"

REDIS_CLI=$(command -v redis-cli 2>/dev/null \
  || ls /opt/homebrew/bin/redis-cli 2>/dev/null \
  || ls /usr/local/bin/redis-cli 2>/dev/null \
  || echo "")
redis_ping() { [ -n "$REDIS_CLI" ] && "$REDIS_CLI" -h 127.0.0.1 ping >/dev/null 2>&1; }

echo ""
echo "   Stopping Redis..."
if redis_ping; then
  "$REDIS_CLI" shutdown nosave >/dev/null 2>&1 || true
  sleep 2
  redis_ping \
    && echo -e "   ${RED}❌ Redis still running${NC}" \
    || echo -e "   ${GREEN}✅ Redis stopped${NC}"
else
  echo "   ✓ Redis not running"
fi

# Clean PID files
rm -f "$ROOT_DIR/logs/"*.pid 2>/dev/null

echo ""
echo -e "${GREEN}${BOLD}✅ All ORCHESTRAI services stopped${NC}"
echo -e "   Restart: ${BOLD}npm run system:start-all${NC}"
echo ""
