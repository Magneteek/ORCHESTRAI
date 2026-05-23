#!/bin/bash
#
# ORCHESTRAI — Service Status
#
# Usage:
#   ./scripts/status-all.sh
#   npm run system:status-all
#

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║          ORCHESTRAI — Service Status                 ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# Docker daemon check
if ! docker info &>/dev/null; then
  echo -e "   ${RED}❌  Docker Desktop is not running${NC}"
  echo "   Start it with: open -a Docker"
  echo ""
  exit 1
fi

check() {
  local label=$1 container=$2 port=$3 url=$4

  local cstatus
  cstatus=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null || echo "absent")
  local hstatus
  hstatus=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "—")

  local endpoint=""
  if [[ -n "$url" ]]; then
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 "$url" 2>/dev/null || echo "000")
    [[ "$http_code" =~ ^(200|204)$ ]] && endpoint="${GREEN}HTTP $http_code${NC}" || endpoint="${RED}HTTP $http_code${NC}"
  fi

  if [[ "$hstatus" == "healthy" ]]; then
    printf "   ${GREEN}✅${NC}  %-28s  ${BLUE}:%-5s${NC}  health=%-9s" "$label" "$port" "$hstatus"
    [[ -n "$endpoint" ]] && printf "  endpoint=%b" "$endpoint"
    echo ""
  elif [[ "$cstatus" == "running" ]]; then
    printf "   ${YELLOW}⚠️ ${NC}  %-28s  ${BLUE}:%-5s${NC}  health=%-9s" "$label" "$port" "$hstatus"
    [[ -n "$endpoint" ]] && printf "  endpoint=%b" "$endpoint"
    echo ""
  elif [[ "$cstatus" == "absent" ]]; then
    printf "   ${RED}❌${NC}  %-28s  ${BLUE}:%-5s${NC}  not found\n" "$label" "$port"
  else
    printf "   ${RED}❌${NC}  %-28s  ${BLUE}:%-5s${NC}  status=%-9s\n" "$label" "$port" "$cstatus"
  fi
}

check "orchestrai-postgres"     "orchestrai-postgres"     "5433" ""
check "orchestrai-redis"        "orchestrai-redis"        "6379" ""
check "orchestrai-ml-postgres"  "orchestrai-ml-postgres"  "5432" ""
check "orchestrai-ml-service"   "orchestrai-ml-service"   "8000" "http://localhost:8000/health"
check "orchestrai-triggers"     "orchestrai-triggers"     "5502" "http://localhost:5502/health"

echo ""
echo -e "$(printf '─%.0s' {1..56})"

# Embedding model check
EMBED=$(curl -s --max-time 2 http://localhost:8000/embed/health 2>/dev/null || echo "{}")
if echo "$EMBED" | grep -q '"loaded":true'; then
  echo -e "   ${GREEN}✅${NC}  Embedding model loaded   (all-MiniLM-L6-v2, 384 dims)"
else
  echo -e "   ${RED}❌${NC}  Embedding model NOT loaded  — run: docker logs orchestrai-ml-service"
fi

# DB row counts
DB=$(docker exec orchestrai-postgres psql -U postgres -d orchestrai_serp -t \
  -c "SELECT (SELECT count(*) FROM skill_embeddings), (SELECT count(*) FROM project_embeddings), (SELECT count(*) FROM deliverable_embeddings);" \
  2>/dev/null | tr -d ' ')
if [[ -n "$DB" ]]; then
  IFS='|' read -r skills projects deliverables <<< "$DB"
  echo -e "   ${GREEN}✅${NC}  pgvector index:   skills=${skills}  projects=${projects}  deliverables=${deliverables}"
else
  echo -e "   ${YELLOW}⚠️ ${NC}  pgvector index:   cannot connect to orchestrai-postgres"
fi

# Trigger count
TRIGGERS=$(curl -s --max-time 2 http://localhost:5502/api/triggers 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('count',0))" 2>/dev/null || echo "—")
echo -e "   ${BLUE}ℹ️ ${NC}  Registered triggers: $TRIGGERS"

echo ""
echo -e "   ${BOLD}Start:${NC}  ./scripts/start-all-services.sh"
echo -e "   ${BOLD}Stop:${NC}   ./scripts/stop-all-services.sh"
echo -e "   ${BOLD}Logs:${NC}   docker logs <container-name>"
echo ""
