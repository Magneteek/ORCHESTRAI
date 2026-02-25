#!/bin/bash
#
# ORCHESTRAI — Master Startup Script
# Starts all services needed for full system operation.
#
# Usage:
#   npm run system:start-all          # Start everything
#   ./scripts/start-all-services.sh   # Direct call
#
# Idempotent: safe to run when services are already up.
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Find redis-cli (Homebrew puts it outside standard PATH on macOS) ──────────
REDIS_CLI=$(command -v redis-cli 2>/dev/null \
  || ls /opt/homebrew/bin/redis-cli 2>/dev/null \
  || ls /usr/local/bin/redis-cli 2>/dev/null \
  || echo "")

redis_ping() {
  [ -n "$REDIS_CLI" ] && "$REDIS_CLI" -h 127.0.0.1 ping >/dev/null 2>&1
}

# ── Colors ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# ── Helpers ───────────────────────────────────────────────────────────────────

port_in_use() { lsof -i ":$1" -sTCP:LISTEN -t >/dev/null 2>&1; }

wait_for_port() {
  local port=$1 name=$2 max=30 waited=0
  while [ $waited -lt $max ]; do
    port_in_use "$port" && return 0
    sleep 1; waited=$((waited + 1))
  done
  echo -e "   ${RED}❌ Timeout waiting for $name on port $port${NC}"
  return 1
}

ok()   { echo -e "   ${GREEN}✅ $1${NC}"; }
warn() { echo -e "   ${YELLOW}⚠️  $1${NC}"; }
fail() { echo -e "   ${RED}❌ $1${NC}"; }
info() { echo -e "   ${BLUE}ℹ️  $1${NC}"; }

section() {
  echo ""
  echo -e "${BOLD}$1${NC}"
  echo "──────────────────────────────────────────────────────"
}

mkdir -p "$ROOT_DIR/logs"

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║          ORCHESTRAI — Full System Startup            ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

# ── 1. Redis ──────────────────────────────────────────────────────────────────
section "1️⃣  Redis (port 6379)"

if redis_ping; then
  ok "Redis already running"
elif port_in_use 6379; then
  ok "Redis already running (via another process)"
else
  echo "   Starting Redis..."
  # Try Homebrew path first, then fall back to system redis-server
  REDIS_SERVER=$(command -v redis-server 2>/dev/null \
    || echo /opt/homebrew/bin/redis-server)
  "$REDIS_SERVER" --daemonize yes >/dev/null 2>&1
  sleep 2
  if redis_ping; then
    ok "Redis started"
  else
    fail "Redis failed to start — try: brew services start redis"
  fi
fi

# ── 2. PostgreSQL + pgvector (orchestrai-postgres on port 5433) ───────────────
section "2️⃣  PostgreSQL + pgvector (port 5433)"

if port_in_use 5433; then
  ok "orchestrai-postgres already running"
else
  if command -v docker >/dev/null 2>&1; then
    # Remove any stale stopped container with the same name before starting fresh
    STALE=$(docker ps -a --filter "name=^/orchestrai-postgres$" --filter "status=exited" --filter "status=created" -q 2>/dev/null)
    if [ -n "$STALE" ]; then
      echo "   Removing stale container ($STALE)..."
      docker rm orchestrai-postgres >/dev/null 2>&1
    fi
    echo "   Starting orchestrai-postgres Docker container..."
    cd "$ROOT_DIR"
    docker compose up -d orchestrai-postgres 2>&1 | grep -v "Pulling\|Extracting\|Download\|Pull complete\|layer\|fs layer" | sed 's/^/   /'
    echo -e "   ${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    if wait_for_port 5433 "orchestrai-postgres"; then
      sleep 3  # Extra time for postgres to fully initialize
      ok "orchestrai-postgres started"
      info "DB: orchestrai_serp (postgres:orchestrai123@localhost:5433)"
    else
      fail "orchestrai-postgres failed to start"
      info "Check: docker logs orchestrai-postgres"
      info "pgvector semantic skill search will be unavailable"
    fi
  else
    fail "Docker not found — cannot start orchestrai-postgres"
    info "Install Docker Desktop or start PostgreSQL manually on port 5433"
  fi
fi

# ── 3. Hooks Server ───────────────────────────────────────────────────────────
section "3️⃣  Hooks Server (port 5501)"

if port_in_use 5501; then
  ok "Hooks Server already running"
else
  echo "   Starting Hooks Server..."
  cd "$ROOT_DIR"
  nohup node orchestrai-shared/claude-code/hooks-server.js \
    > "$ROOT_DIR/logs/hooks-server.log" 2>&1 &
  echo $! > "$ROOT_DIR/logs/hooks-server.pid"

  if wait_for_port 5501 "Hooks Server"; then
    ok "Hooks Server started (PID: $(cat "$ROOT_DIR/logs/hooks-server.pid"))"
    info "Logs: logs/hooks-server.log"
  else
    fail "Hooks Server failed — check logs/hooks-server.log"
  fi
fi

# ── 4. ML Service (sentence-transformers / /embed endpoint) ───────────────────
section "4️⃣  ML Service — /embed endpoint (port 8000)"

if port_in_use 8000; then
  ok "ML Service already running"
else
  ML_DIR="$ROOT_DIR/orchestrai-ml-service"

  if [ ! -d "$ML_DIR/venv" ]; then
    echo "   Creating Python venv (first time only)..."
    python3 -m venv "$ML_DIR/venv"
    "$ML_DIR/venv/bin/pip" install -q -r "$ML_DIR/requirements.txt"
    # Install pgvector + sentence-transformers if not already in requirements
    "$ML_DIR/venv/bin/pip" install -q sentence-transformers pgvector 2>/dev/null || true
  fi

  echo "   Starting ML Service (loading sentence-transformers model)..."
  cd "$ML_DIR"
  nohup "$ML_DIR/venv/bin/python" -m uvicorn app.main:app \
    --host 0.0.0.0 --port 8000 \
    > "$ROOT_DIR/logs/ml-service.log" 2>&1 &
  echo $! > "$ROOT_DIR/logs/ml-service.pid"

  # ML service takes longer to start (model loading)
  echo -e "   ${YELLOW}⏳ Loading embedding model (~20s)...${NC}"
  if wait_for_port 8000 "ML Service"; then
    sleep 3  # Extra time for model to fully initialize
    ok "ML Service started (PID: $(cat "$ROOT_DIR/logs/ml-service.pid"))"
    info "Docs: http://localhost:8000/docs"
    info "Embed: http://localhost:8000/embed/health"
    info "Logs: logs/ml-service.log"
  else
    fail "ML Service failed — check logs/ml-service.log"
    info "Semantic skill search will be unavailable"
  fi
fi

# ── 5. Simultaneous Execution Server ─────────────────────────────────────────
section "5️⃣  Simultaneous Execution Server (port 8080)"

if port_in_use 8080; then
  ok "Simultaneous Execution Server already running"
else
  echo "   Starting Simultaneous Execution Server..."
  cd "$ROOT_DIR"
  nohup node orchestrai-shared/initialization/start-simultaneous-server.js \
    > "$ROOT_DIR/logs/simultaneous-server.log" 2>&1 &
  echo $! > "$ROOT_DIR/logs/simultaneous-server.pid"

  if wait_for_port 8080 "Simultaneous Execution Server"; then
    ok "Simultaneous Execution Server started (PID: $(cat "$ROOT_DIR/logs/simultaneous-server.pid"))"
    info "WebSocket: ws://localhost:8080"
    info "Logs: logs/simultaneous-server.log"
  else
    fail "Simultaneous Execution Server failed — check logs/simultaneous-server.log"
  fi
fi

# ── 6. Trigger System (optional) ─────────────────────────────────────────────
section "6️⃣  Trigger System (port 5502) — optional"

if port_in_use 5502; then
  ok "Trigger System already running"
else
  TRIGGER_DIR="$ROOT_DIR/orchestrai-trigger-system"
  if [ -f "$TRIGGER_DIR/server.js" ]; then
    echo "   Starting Trigger System..."
    cd "$TRIGGER_DIR"
    # Install deps if needed
    [ ! -d "node_modules" ] && npm install --silent
    nohup node server.js \
      > "$ROOT_DIR/logs/trigger-system.log" 2>&1 &
    echo $! > "$ROOT_DIR/logs/trigger-system.pid"

    if wait_for_port 5502 "Trigger System"; then
      ok "Trigger System started (PID: $(cat "$ROOT_DIR/logs/trigger-system.pid"))"
      info "Webhooks: http://localhost:5502"
      info "Logs: logs/trigger-system.log"
    else
      warn "Trigger System failed to start (optional — continuing)"
      info "Check: logs/trigger-system.log"
    fi
  else
    warn "Trigger System not found — skipping (optional)"
  fi
fi

# ── 7. Frontend ───────────────────────────────────────────────────────────────
section "7️⃣  Frontend (port 3000) — optional"

if port_in_use 3000; then
  ok "Frontend already running — http://localhost:3000"
else
  info "Frontend not running. Start with: npm run dev"
fi

# ── Status Summary ────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}${BOLD}╔══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}║                   Service Summary                   ║${NC}"
echo -e "${BLUE}${BOLD}╚══════════════════════════════════════════════════════╝${NC}"
echo ""

print_status() {
  local name=$1 port=$2 required=$3
  if port_in_use "$port"; then
    echo -e "   ${GREEN}✅${NC} $name (port $port)"
  elif [ "$required" = "required" ]; then
    echo -e "   ${RED}❌${NC} $name (port $port) — REQUIRED"
  else
    echo -e "   ${YELLOW}⚠️ ${NC} $name (port $port) — optional"
  fi
}

redis_ping && echo -e "   ${GREEN}✅${NC} Redis (port 6379)" \
           || echo -e "   ${RED}❌${NC} Redis (port 6379) — REQUIRED"
print_status "PostgreSQL+pgvector"       5433 required
print_status "Hooks Server"             5501 required
print_status "ML Service (embed)"       8000 required
print_status "Simultaneous Exec"        8080 recommended
print_status "Trigger System"           5502 optional
print_status "Frontend"                 3000 optional

echo ""
echo -e "${BOLD}Logs:${NC}    $ROOT_DIR/logs/"
echo -e "${BOLD}Stop:${NC}    npm run system:stop-all"
echo -e "${BOLD}Status:${NC}  npm run system:status-all"
echo ""

# Check all required services are up
MISSING=0
for port in 5433 5501 8000; do
  port_in_use "$port" 2>/dev/null || MISSING=$((MISSING+1))
done
redis_ping || port_in_use 6379 || MISSING=$((MISSING+1))

if [ $MISSING -eq 0 ]; then
  echo -e "${GREEN}${BOLD}🎉 ORCHESTRAI is fully operational${NC}"
else
  echo -e "${YELLOW}${BOLD}⚠️  ORCHESTRAI is partially running ($MISSING required service(s) not started)${NC}"
  echo "   Review the output above and check the relevant logs."
fi
echo ""
