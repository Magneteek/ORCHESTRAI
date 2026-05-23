#!/bin/bash
#
# ORCHESTRAI — Start All Services
#
# Starts Docker Desktop if needed, then brings up all containers in order.
# Safe to run when services are already running (idempotent).
#
# Usage:
#   ./scripts/start-all-services.sh
#   npm run system:start-all
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ML_DIR="$ROOT_DIR/orchestrai-ml-service"

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

ok()      { echo -e "   ${GREEN}✅  $1${NC}"; }
warn()    { echo -e "   ${YELLOW}⚠️   $1${NC}"; }
fail()    { echo -e "   ${RED}❌  $1${NC}"; }
info()    { echo -e "   ${BLUE}ℹ️   $1${NC}"; }
section() { echo -e "\n${BOLD}$1${NC}\n$(printf '─%.0s' {1..56})"; }

# ── Helpers ───────────────────────────────────────────────────────────────────

docker_healthy() {
  local name=$1
  [[ "$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null)" == "healthy" ]]
}

docker_running() {
  local name=$1
  [[ "$(docker inspect --format='{{.State.Status}}' "$name" 2>/dev/null)" == "running" ]]
}

wait_healthy() {
  local name=$1 label=$2 max=${3:-60}
  local waited=0
  while [[ $waited -lt $max ]]; do
    local s
    s=$(docker inspect --format='{{.State.Health.Status}}' "$name" 2>/dev/null || echo "missing")
    [[ "$s" == "healthy" ]] && return 0
    [[ "$s" == "unhealthy" ]] && { fail "$label is unhealthy — run: docker logs $name"; return 1; }
    printf "\r   ${YELLOW}⏳  Waiting for $label... ${waited}s${NC}"
    sleep 3; waited=$((waited + 3))
  done
  fail "Timeout waiting for $label"
  return 1
}

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║         ORCHESTRAI — Starting All Services           ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"

# ── 1. Docker Desktop ─────────────────────────────────────────────────────────
section "1️⃣  Docker Desktop"

if docker info &>/dev/null; then
  ok "Docker Desktop is running"
else
  echo "   Starting Docker Desktop..."
  open -a Docker
  echo -e "   ${YELLOW}⏳  Waiting for Docker daemon (up to 60s)...${NC}"
  waited=0
  while [[ $waited -lt 60 ]]; do
    docker info &>/dev/null && break
    sleep 3; waited=$((waited + 3))
    printf "\r   ${YELLOW}⏳  Waiting for Docker daemon... ${waited}s${NC}"
  done
  echo ""
  if docker info &>/dev/null; then
    ok "Docker Desktop started"
  else
    fail "Docker Desktop did not start in time"
    echo "   Open Docker Desktop manually and re-run this script."
    exit 1
  fi
fi

# ── 2. PostgreSQL + pgvector ──────────────────────────────────────────────────
section "2️⃣  PostgreSQL + pgvector  (port 5433)"

cd "$ROOT_DIR"
if docker_healthy "orchestrai-postgres"; then
  ok "orchestrai-postgres already healthy"
else
  echo "   Starting orchestrai-postgres..."
  docker compose up -d orchestrai-postgres 2>&1 | grep -v "^\s*$" | sed 's/^/   /'
  echo ""
  if wait_healthy "orchestrai-postgres" "PostgreSQL+pgvector" 60; then
    echo ""
    ok "orchestrai-postgres ready"
    info "DB: orchestrai_serp  user: postgres  port: 5433"
  else
    echo ""
    exit 1
  fi
fi

# ── 3. ML Service stack (redis + postgres + embedding service) ─────────────────
section "3️⃣  ML Service  (port 8000)  +  Redis (6379)  +  ML Postgres (5432)"

cd "$ML_DIR"

# Redis
if docker_healthy "orchestrai-redis"; then
  ok "orchestrai-redis already healthy"
else
  echo "   Starting redis..."
  docker compose up -d redis 2>&1 | grep -v "^\s*$" | sed 's/^/   /'
  wait_healthy "orchestrai-redis" "Redis" 30 && echo "" && ok "orchestrai-redis ready"
fi

# ML Postgres
if docker_healthy "orchestrai-ml-postgres"; then
  ok "orchestrai-ml-postgres already healthy"
else
  echo "   Starting ml-postgres..."
  docker compose up -d postgres 2>&1 | grep -v "^\s*$" | sed 's/^/   /'
  wait_healthy "orchestrai-ml-postgres" "ML Postgres" 30 && echo "" && ok "orchestrai-ml-postgres ready"
fi

# ML Service
if docker_healthy "orchestrai-ml-service"; then
  ok "orchestrai-ml-service already healthy"
else
  echo "   Starting ml-service (loads embedding model ~20s)..."
  docker compose up -d ml-service 2>&1 | grep -v "^\s*$" | sed 's/^/   /'
  echo ""
  if wait_healthy "orchestrai-ml-service" "ML Service" 120; then
    echo ""
    # Verify /embed endpoint specifically
    EMBED=$(curl -s http://localhost:8000/embed/health 2>/dev/null || echo "{}")
    if echo "$EMBED" | grep -q '"loaded":true'; then
      ok "orchestrai-ml-service ready  (all-MiniLM-L6-v2 loaded)"
    else
      warn "ML service running but embedding model not loaded yet"
      info "Check: docker logs orchestrai-ml-service"
    fi
  else
    echo ""
    exit 1
  fi
fi

# ── 4. Trigger System ─────────────────────────────────────────────────────────
section "4️⃣  Trigger System  (port 5502)"

cd "$ROOT_DIR"
if docker_healthy "orchestrai-triggers"; then
  ok "orchestrai-triggers already healthy"
else
  echo "   Starting trigger system..."
  docker compose up -d trigger-system 2>&1 | grep -v "^\s*$" | sed 's/^/   /'
  echo ""
  if wait_healthy "orchestrai-triggers" "Trigger System" 60; then
    echo ""
    ok "orchestrai-triggers ready"
    info "Webhooks: http://localhost:5502/webhooks/*"
    info "API:      http://localhost:5502/api/triggers"
  else
    echo ""
    warn "Trigger system failed (optional — continuing)"
    info "Check: docker logs orchestrai-triggers"
  fi
fi

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║                    System Status                    ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

print_row() {
  local name=$1 container=$2 port=$3 role=$4
  if docker_healthy "$container" 2>/dev/null; then
    echo -e "   ${GREEN}✅${NC}  $name  ${BLUE}:$port${NC}  — $role"
  else
    echo -e "   ${RED}❌${NC}  $name  ${BLUE}:$port${NC}  — $role"
  fi
}

print_row "orchestrai-postgres" "orchestrai-postgres" "5433" "pgvector skill/project search"
print_row "orchestrai-redis    " "orchestrai-redis"    "6379" "ML service cache"
print_row "orchestrai-ml-postgres" "orchestrai-ml-postgres" "5432" "ML model metadata"
print_row "orchestrai-ml-service" "orchestrai-ml-service"  "8000" "embedding model (all-MiniLM-L6-v2)"
print_row "orchestrai-triggers " "orchestrai-triggers" "5502" "webhook/cron trigger system"

echo ""
echo -e "   ${BOLD}Stop:${NC}    ./scripts/stop-all-services.sh"
echo -e "   ${BOLD}Status:${NC}  ./scripts/status-all.sh"
echo ""

# Exit code based on critical services
FAILED=0
for c in orchestrai-postgres orchestrai-ml-service; do
  docker_healthy "$c" || FAILED=$((FAILED + 1))
done

if [[ $FAILED -eq 0 ]]; then
  echo -e "${GREEN}${BOLD}   🎉 ORCHESTRAI is fully operational${NC}"
else
  echo -e "${YELLOW}${BOLD}   ⚠️  $FAILED critical service(s) not healthy — check logs above${NC}"
fi
echo ""
