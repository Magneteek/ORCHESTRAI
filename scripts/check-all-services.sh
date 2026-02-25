#!/bin/bash
#
# ORCHESTRAI — System Health Check
# Shows the status of all services.
#
# Usage:
#   npm run system:status-all
#   ./scripts/check-all-services.sh
#

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

port_in_use() { lsof -i ":$1" -sTCP:LISTEN -t >/dev/null 2>&1; }

status_line() {
  local name=$1 port=$2 tier=$3
  if port_in_use "$port"; then
    echo -e "   ${GREEN}✅${NC} $name (port $port)"
  elif [ "$tier" = "required" ]; then
    echo -e "   ${RED}❌${NC} $name (port $port) — REQUIRED"
  elif [ "$tier" = "recommended" ]; then
    echo -e "   ${YELLOW}⚠️ ${NC} $name (port $port) — recommended"
  else
    echo -e "   ${YELLOW}○${NC}  $name (port $port) — optional"
  fi
}

echo ""
echo -e "${BOLD}🔍 ORCHESTRAI System Status${NC}"
echo "══════════════════════════════════════════════════════"
echo ""

# ── Core Services ─────────────────────────────────────────────────────────────
echo -e "${BOLD}Core Services${NC}"

REDIS_CLI=$(command -v redis-cli 2>/dev/null || echo /opt/homebrew/bin/redis-cli)
redis_ok() { [ -n "$REDIS_CLI" ] && "$REDIS_CLI" -h 127.0.0.1 ping >/dev/null 2>&1; }

# Redis — special check (uses homebrew path on macOS)
if redis_ok || port_in_use 6379; then
  echo -e "   ${GREEN}✅${NC} Redis (port 6379)"
else
  echo -e "   ${RED}❌${NC} Redis (port 6379) — REQUIRED"
fi

status_line "PostgreSQL+pgvector" 5433 required
status_line "Hooks Server"   5501 required

# ── AI / ML Services ──────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}AI / ML Services${NC}"
status_line "ML Service (/embed)" 8000 required
status_line "VAIBE-SEMANTIC"      8001 optional

# ── Execution Services ────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Execution Services${NC}"
status_line "Simultaneous Exec"  8080 recommended
status_line "Trigger System"     5502 optional

# ── Frontend ──────────────────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Frontend${NC}"
status_line "Next.js Dashboard"  3000 optional

# ── Semantic Skill Search ─────────────────────────────────────────────────────
echo ""
echo -e "${BOLD}Semantic Skill Search${NC}"
if port_in_use 8000; then
  embed_status=$(curl -s --max-time 3 http://localhost:8000/embed/health 2>/dev/null)
  if echo "$embed_status" | grep -q '"status":"ready"'; then
    printf "   ${GREEN}✅${NC} %-30s\n" "/embed endpoint ready"
    dim=$(echo "$embed_status" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('dimensions','?'))" 2>/dev/null)
    printf "   ${GREEN}   ${NC} Model: all-MiniLM-L6-v2 (%s dims)\n" "$dim"
  else
    printf "   ${YELLOW}⚠️ ${NC} %-30s\n" "ML Service running but /embed not ready yet"
  fi
else
  printf "   ${RED}❌${NC} %-30s\n" "/embed not available (ML Service down)"
fi

if port_in_use 5433; then
  # Quick check for skill_embeddings table via docker exec
  count=$(docker exec orchestrai-postgres psql -U postgres -d orchestrai_serp -tAc \
    "SELECT COUNT(*) FROM skill_embeddings;" 2>/dev/null | tr -d '[:space:]' || echo "?")
  if [ "$count" = "?" ] || [ -z "$count" ]; then
    printf "   ${YELLOW}⚠️ ${NC} %-30s\n" "DB up but skills not indexed yet"
    printf "       Run: npm run skills:index\n"
  else
    printf "   ${GREEN}✅${NC} skill_embeddings: %s skills indexed\n" "$count"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "══════════════════════════════════════════════════════"
echo -e "${BOLD}Commands${NC}"
echo "   Start all:   npm run system:start-all"
echo "   Stop all:    npm run system:stop-all"
echo "   Index skills: npm run skills:index"
echo "   ML docs:     http://localhost:8000/docs"
echo ""

# Overall readiness
MISSING=0
port_in_use 5433 || MISSING=$((MISSING+1))
port_in_use 5501 || MISSING=$((MISSING+1))
port_in_use 8000 || MISSING=$((MISSING+1))
redis_ok || port_in_use 6379 || MISSING=$((MISSING+1))

if [ $MISSING -eq 0 ]; then
  echo -e "${GREEN}${BOLD}🎉 System READY — all required services running${NC}"
  exit 0
else
  echo -e "${YELLOW}${BOLD}⚠️  System PARTIAL — $MISSING required service(s) not running${NC}"
  echo "   Run: npm run system:start-all"
  exit 1
fi
