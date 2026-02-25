#!/bin/bash

# ORCHESTRAI Unified Startup Script
# Manages all ORCHESTRAI services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ASCII Art Banner
echo -e "${BLUE}"
cat << "EOF"
   ___  ____   _____ __  ____________  ___    ____
  / _ \/ __ \ / ___// / / / ____/ ___// _ |  /  _/
 / // / /_/ // /__ / /_/ / __/  \__ \/ __ | _/ /
/____/\____/ \___/ \____/____/ /___/_/ |_|/___/

EOF
echo -e "${NC}"

# Function to check if service is running
check_service() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to start service
start_service() {
    local name=$1
    local port=$2
    local dir=$3
    local command=$4

    echo -e "${YELLOW}Starting $name on port $port...${NC}"

    cd "$SCRIPT_DIR/$dir"

    if check_service $port; then
        echo -e "${RED}✗ $name already running on port $port${NC}"
        return 1
    fi

    # Start in background
    nohup $command > "$SCRIPT_DIR/logs/${name}.log" 2>&1 &
    local pid=$!
    echo $pid > "$SCRIPT_DIR/logs/${name}.pid"

    # Wait a bit and check if started
    sleep 2
    if ps -p $pid > /dev/null; then
        echo -e "${GREEN}✓ $name started (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}✗ $name failed to start${NC}"
        return 1
    fi
}

# Function to stop service
stop_service() {
    local name=$1
    local pid_file="$SCRIPT_DIR/logs/${name}.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null; then
            echo -e "${YELLOW}Stopping $name (PID: $pid)...${NC}"
            kill $pid
            rm "$pid_file"
            echo -e "${GREEN}✓ $name stopped${NC}"
        else
            echo -e "${YELLOW}$name not running${NC}"
            rm "$pid_file"
        fi
    else
        echo -e "${YELLOW}$name not running${NC}"
    fi
}

# Function to show status
show_status() {
    echo -e "${BLUE}=== ORCHESTRAI Service Status ===${NC}\n"

    echo -e "${GREEN}Core Services:${NC}"
    echo "  Claude Code: ✓ Active (no separate process)"

    if check_service 5501; then
        echo -e "  Hooks Server: ${GREEN}✓ Running${NC} (http://localhost:5501)"
    else
        echo -e "  Hooks Server: ${RED}✗ Not running${NC}"
    fi

    echo "  Session Manager: ✓ Integrated via hooks"
    echo ""

    echo -e "${YELLOW}Optional Services:${NC}"

    if check_service 5502; then
        echo -e "  Trigger System: ${GREEN}✓ Running${NC} (http://localhost:5502)"
    else
        echo -e "  Trigger System: ${RED}✗ Not running${NC}"
    fi

    echo ""
    echo -e "${BLUE}Logs:${NC} $SCRIPT_DIR/logs/"
    echo -e "${BLUE}Sessions:${NC} $SCRIPT_DIR/sessions/"
}

# Create logs directory
mkdir -p "$SCRIPT_DIR/logs"

# Parse command
case "${1:-status}" in
    start)
        echo -e "${BLUE}Starting ORCHESTRAI services...${NC}\n"

        # Check what to start
        if [ "${2:-all}" == "all" ] || [ "${2:-all}" == "triggers" ]; then
            start_service "trigger-system" 5502 "orchestrai-trigger-system" "npm start"
        fi

        echo ""
        show_status
        ;;

    stop)
        echo -e "${BLUE}Stopping ORCHESTRAI services...${NC}\n"

        if [ "${2:-all}" == "all" ] || [ "${2:-all}" == "triggers" ]; then
            stop_service "trigger-system"
        fi

        echo ""
        show_status
        ;;

    restart)
        $0 stop "$2"
        sleep 2
        $0 start "$2"
        ;;

    status)
        show_status
        ;;

    logs)
        service="${2:-trigger-system}"
        log_file="$SCRIPT_DIR/logs/${service}.log"

        if [ -f "$log_file" ]; then
            tail -f "$log_file"
        else
            echo -e "${RED}Log file not found: $log_file${NC}"
            echo "Available logs:"
            ls -1 "$SCRIPT_DIR/logs/"
        fi
        ;;

    *)
        echo "ORCHESTRAI Service Manager"
        echo ""
        echo "Usage: $0 {start|stop|restart|status|logs} [service]"
        echo ""
        echo "Commands:"
        echo "  start [service]   - Start services (default: all optional services)"
        echo "  stop [service]    - Stop services"
        echo "  restart [service] - Restart services"
        echo "  status            - Show service status"
        echo "  logs [service]    - Tail service logs (default: trigger-system)"
        echo ""
        echo "Services:"
        echo "  all      - All optional services"
        echo "  triggers - Trigger system only"
        echo ""
        echo "Examples:"
        echo "  $0 start           # Start all optional services"
        echo "  $0 start triggers  # Start trigger system only"
        echo "  $0 stop            # Stop all services"
        echo "  $0 status          # Show service status"
        echo "  $0 logs            # View trigger system logs"
        echo ""
        echo "Note: Claude Code and Session Manager are always active"
        echo "      and don't require separate processes."
        exit 1
        ;;
esac
