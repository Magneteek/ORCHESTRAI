#!/bin/bash
#
# ORCHESTRAI — Stop All Services
#
# Stops all containers. Data volumes are preserved.
#
# Usage:
#   ./scripts/stop-all-services.sh
#   npm run system:stop-all
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ML_DIR="$ROOT_DIR/orchestrai-ml-service"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
NC='\033[0m'

stop_container() {
  local name=$1
  if docker inspect "$name" &>/dev/null; then
    echo -e "   ${YELLOW}Stopping $name...${NC}"
    docker stop "$name" &>/dev/null && echo -e "   ${GREEN}✅  $name stopped${NC}" || true
  else
    echo "   ✓  $name not running"
  fi
}

echo ""
echo -e "${BOLD}🛑 Stopping ORCHESTRAI services...${NC}"
echo "$(printf '─%.0s' {1..56})"
echo ""

# Stop in reverse dependency order
stop_container "orchestrai-triggers"
stop_container "orchestrai-ml-service"
stop_container "orchestrai-redis"
stop_container "orchestrai-ml-postgres"
stop_container "orchestrai-postgres"

echo ""
echo -e "${GREEN}${BOLD}✅  All ORCHESTRAI services stopped${NC}"
echo -e "   Data volumes are preserved — indexes will not need re-building."
echo -e "   Restart: ${BOLD}./scripts/start-all-services.sh${NC}"
echo ""
