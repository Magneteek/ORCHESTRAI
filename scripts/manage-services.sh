#!/bin/bash

# ORCHESTRAI Service Management Script
# Provides start, stop, restart, and status commands for all services

set -e

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

show_usage() {
    echo "ORCHESTRAI Service Manager"
    echo ""
    echo "Usage: $0 [command] [service]"
    echo ""
    echo "Commands:"
    echo "  status    - Check status of all services"
    echo "  start     - Start services"
    echo "  stop      - Stop services"
    echo "  restart   - Restart services"
    echo "  logs      - View service logs"
    echo ""
    echo "Services:"
    echo "  all          - All services (default)"
    echo "  redis        - Redis server"
    echo "  orchestrator - Main orchestrator"
    echo "  frontend     - Frontend dashboard"
    echo ""
    echo "Examples:"
    echo "  $0 status              # Check all services"
    echo "  $0 start redis         # Start Redis only"
    echo "  $0 restart orchestrator # Restart orchestrator"
    echo "  $0 stop all            # Stop all services"
    echo ""
}

check_service_running() {
    local process_pattern=$1
    pgrep -f "$process_pattern" > /dev/null 2>&1
}

start_redis() {
    echo -n "Starting Redis... "
    if check_service_running "redis-server.*6379"; then
        echo -e "${YELLOW}Already running${NC}"
        return 0
    fi

    cd "$PROJECT_ROOT"
    nohup npm run redis > logs/redis.log 2>&1 &
    sleep 2

    if check_service_running "redis-server.*6379"; then
        echo -e "${GREEN}✓ Started${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
        return 1
    fi
}

start_orchestrator() {
    echo -n "Starting Main Orchestrator... "
    if check_service_running "orchestrator-stable.js"; then
        echo -e "${YELLOW}Already running${NC}"
        return 0
    fi

    cd "$PROJECT_ROOT"
    nohup npm run orchestrator > logs/orchestrator.log 2>&1 &
    sleep 3

    if check_service_running "orchestrator-stable.js"; then
        echo -e "${GREEN}✓ Started${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
        return 1
    fi
}

start_frontend() {
    echo -n "Starting Frontend Dashboard... "
    if check_service_running "next dev -p 5500"; then
        echo -e "${YELLOW}Already running${NC}"
        return 0
    fi

    cd "$PROJECT_ROOT"
    nohup npm run dev > logs/frontend.log 2>&1 &
    sleep 5

    if check_service_running "next dev -p 5500"; then
        echo -e "${GREEN}✓ Started${NC}"
    else
        echo -e "${RED}✗ Failed${NC}"
        return 1
    fi
}

stop_service() {
    local service_name=$1
    local process_pattern=$2

    echo -n "Stopping $service_name... "
    if ! check_service_running "$process_pattern"; then
        echo -e "${YELLOW}Not running${NC}"
        return 0
    fi

    pkill -f "$process_pattern" 2>/dev/null
    sleep 2

    if ! check_service_running "$process_pattern"; then
        echo -e "${GREEN}✓ Stopped${NC}"
    else
        echo -e "${RED}✗ Failed (force kill)${NC}"
        pkill -9 -f "$process_pattern" 2>/dev/null
    fi
}

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_ROOT/logs"

# Parse command
COMMAND=${1:-status}
SERVICE=${2:-all}

case $COMMAND in
    status)
        exec "$SCRIPT_DIR/check-services.sh"
        ;;

    start)
        echo -e "${BLUE}Starting ORCHESTRAI Services${NC}"
        echo "───────────────────────────────"
        case $SERVICE in
            all)
                start_redis
                start_orchestrator
                start_frontend
                ;;
            redis)
                start_redis
                ;;
            orchestrator)
                start_orchestrator
                ;;
            frontend)
                start_frontend
                ;;
            *)
                echo -e "${RED}Unknown service: $SERVICE${NC}"
                show_usage
                exit 1
                ;;
        esac
        echo ""
        echo -e "${BLUE}Verifying services...${NC}"
        sleep 3
        exec "$SCRIPT_DIR/check-services.sh"
        ;;

    stop)
        echo -e "${BLUE}Stopping ORCHESTRAI Services${NC}"
        echo "───────────────────────────────"
        case $SERVICE in
            all)
                stop_service "Frontend" "next dev -p 5500"
                stop_service "Orchestrator" "orchestrator-stable.js"
                stop_service "Redis" "redis-server.*6379"
                ;;
            redis)
                stop_service "Redis" "redis-server.*6379"
                ;;
            orchestrator)
                stop_service "Orchestrator" "orchestrator-stable.js"
                ;;
            frontend)
                stop_service "Frontend" "next dev -p 5500"
                ;;
            *)
                echo -e "${RED}Unknown service: $SERVICE${NC}"
                show_usage
                exit 1
                ;;
        esac
        echo ""
        ;;

    restart)
        echo -e "${BLUE}Restarting ORCHESTRAI Services${NC}"
        echo "───────────────────────────────"
        $0 stop $SERVICE
        echo ""
        sleep 2
        $0 start $SERVICE
        ;;

    logs)
        case $SERVICE in
            redis)
                tail -f "$PROJECT_ROOT/logs/redis.log"
                ;;
            orchestrator)
                tail -f "$PROJECT_ROOT/logs/orchestrator.log"
                ;;
            frontend)
                tail -f "$PROJECT_ROOT/logs/frontend.log"
                ;;
            all)
                echo -e "${BLUE}Tailing all logs (Ctrl+C to stop)${NC}"
                tail -f "$PROJECT_ROOT/logs"/*.log
                ;;
            *)
                echo -e "${RED}Unknown service: $SERVICE${NC}"
                show_usage
                exit 1
                ;;
        esac
        ;;

    help|--help|-h)
        show_usage
        ;;

    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac
