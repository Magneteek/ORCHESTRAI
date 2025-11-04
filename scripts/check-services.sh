#!/bin/bash

# ORCHESTRAI Service Health Check Script
# This script checks the status of all ORCHESTRAI services and provides actionable information

set -e

echo "🔍 ORCHESTRAI Service Health Check"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Service check function
check_service() {
    local service_name=$1
    local port=$2
    local process_pattern=$3

    echo -n "Checking $service_name (port $port)... "

    # Check if process is running
    if pgrep -f "$process_pattern" > /dev/null; then
        # Check if port is listening
        if lsof -i :$port -sTCP:LISTEN > /dev/null 2>&1; then
            echo -e "${GREEN}✓ RUNNING${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ PROCESS RUNNING BUT NOT LISTENING${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ NOT RUNNING${NC}"
        return 1
    fi
}

# Health endpoint check
check_health_endpoint() {
    local service_name=$1
    local url=$2

    echo -n "Testing $service_name health endpoint... "

    if response=$(curl -s -w "%{http_code}" -o /dev/null --connect-timeout 5 "$url" 2>/dev/null); then
        if [ "$response" = "200" ]; then
            echo -e "${GREEN}✓ HEALTHY (HTTP 200)${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ RESPONDING (HTTP $response)${NC}"
            return 1
        fi
    else
        echo -e "${RED}✗ NO RESPONSE${NC}"
        return 1
    fi
}

# Core Services
echo -e "${BLUE}Core Services:${NC}"
echo "─────────────────"

# Redis
check_service "Redis" "6379" "redis-server"
if command -v redis-cli &> /dev/null; then
    echo -n "  Testing Redis connectivity... "
    if redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PONG${NC}"
    else
        echo -e "${RED}✗ NO RESPONSE${NC}"
    fi
fi

# Main Orchestrator
check_service "Main Orchestrator" "5501" "orchestrator-stable.js"
check_health_endpoint "  Orchestrator" "http://localhost:5501/health"

# Frontend Dashboard
check_service "Frontend Dashboard" "5500" "next dev -p 5500"
echo -n "  Testing Frontend... "
if timeout 5 curl -s http://localhost:5500 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ RESPONDING${NC}"
else
    echo -e "${YELLOW}⚠ SLOW/TIMEOUT${NC}"
fi

echo ""
echo -e "${BLUE}MCP Servers:${NC}"
echo "─────────────────"

# Check MCP servers via orchestrator API
if curl -s http://localhost:5501/mcp/status > /dev/null 2>&1; then
    mcp_status=$(curl -s http://localhost:5501/mcp/status)
    echo "  DataForSEO MCP:    $(echo $mcp_status | jq -r '.servers.dataforseo.status // "unknown"')"
    echo "  Sequential Thinking: $(echo $mcp_status | jq -r '.servers.sequential_thinking.status // "unknown"')"
    echo "  Filesystem:        $(echo $mcp_status | jq -r '.servers.filesystem.status // "unknown"')"
    echo "  Memory:           $(echo $mcp_status | jq -r '.servers.memory.status // "unknown"')"
    echo "  Notion:           $(echo $mcp_status | jq -r '.servers.notion.status // "unknown"')"
else
    echo -e "${YELLOW}  ⚠ Cannot query MCP status (orchestrator may be down)${NC}"
fi

echo ""
echo -e "${BLUE}Domain Hubs:${NC}"
echo "─────────────────"

# Check domain hubs via orchestrator health endpoint
if health_data=$(curl -s http://localhost:5501/health 2>/dev/null); then
    echo "  SEO Domain:        $(echo $health_data | jq -r '.metrics.domainHubsStatus.seo.status // "unknown"')"
    echo "  Quality Domain:    $(echo $health_data | jq -r '.metrics.domainHubsStatus.quality.status // "unknown"')"
    echo "  Content Domain:    $(echo $health_data | jq -r '.metrics.domainHubsStatus["content-enhanced"].status // "unknown"')"
    echo "  Client Intel:      $(echo $health_data | jq -r '.metrics.domainHubsStatus["client-intelligence"].status // "unknown"')"
    echo "  Web Quality:       $(echo $health_data | jq -r '.metrics.domainHubsStatus["web-quality"].status // "unknown"')"
else
    echo -e "${YELLOW}  ⚠ Cannot query domain hub status${NC}"
fi

echo ""
echo -e "${BLUE}System Metrics:${NC}"
echo "─────────────────"

if health_data=$(curl -s http://localhost:5501/health 2>/dev/null); then
    uptime_ms=$(echo $health_data | jq -r '.uptime // 0')
    uptime_hours=$((uptime_ms / 3600000))
    memory_nodes=$(echo $health_data | jq -r '.metrics.memoryNodes // 0')
    active_agents=$(echo $health_data | jq -r '.metrics.activeAgents // 0')

    echo "  Uptime:           ${uptime_hours} hours"
    echo "  Memory Nodes:     ${memory_nodes}"
    echo "  Active Agents:    ${active_agents}"
    echo "  Redis Status:     $(echo $health_data | jq -r '.metrics.redisStatus // "unknown"')"
fi

echo ""
echo -e "${BLUE}Quick Actions:${NC}"
echo "─────────────────"
echo "  Start Redis:        npm run redis"
echo "  Start Orchestrator: npm run orchestrator"
echo "  Start Frontend:     npm run dev"
echo "  Full Health:        curl http://localhost:5501/health | jq"
echo "  MCP Status:         npm run mcp:status"
echo ""
