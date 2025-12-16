#!/bin/bash
#
# ORCHESTRAI Resource Monitor
# Monitors system resources during business intelligence pipeline execution
# Usage: ./scripts/monitor-pipeline-resources.sh [interval_seconds]
#
# CRASH PREVENTION: Use this to detect resource exhaustion before crashes

INTERVAL=${1:-2}  # Default 2 second refresh
LOG_FILE="./temp/resource-monitor-$(date +%Y%m%d-%H%M%S).log"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Thresholds (CRASH PREVENTION)
MAX_FILE_DESCRIPTORS=8000  # macOS default is 10240
MAX_NODE_MEMORY_MB=2048    # Per Node.js process
MAX_DNS_REQUESTS=50        # Concurrent DNS requests

mkdir -p ./temp

echo "=============================================="
echo "ORCHESTRAI Resource Monitor"
echo "=============================================="
echo "Interval: ${INTERVAL}s"
echo "Log file: ${LOG_FILE}"
echo "Press Ctrl+C to stop"
echo "=============================================="
echo ""

# Function to check file descriptors
check_file_descriptors() {
  local pids=$(pgrep -f "node.*simultaneous-server|node.*orchestrator|node.*intelligence")

  if [ -z "$pids" ]; then
    return
  fi

  local total_fds=0
  for pid in $pids; do
    local fd_count=$(lsof -p $pid 2>/dev/null | wc -l)
    total_fds=$((total_fds + fd_count))
  done

  local percentage=$((total_fds * 100 / MAX_FILE_DESCRIPTORS))

  if [ $percentage -gt 80 ]; then
    echo -e "${RED}⚠️  File Descriptors: ${total_fds}/${MAX_FILE_DESCRIPTORS} (${percentage}%) - CRITICAL${NC}"
  elif [ $percentage -gt 60 ]; then
    echo -e "${YELLOW}⚠️  File Descriptors: ${total_fds}/${MAX_FILE_DESCRIPTORS} (${percentage}%) - WARNING${NC}"
  else
    echo -e "${GREEN}✓ File Descriptors: ${total_fds}/${MAX_FILE_DESCRIPTORS} (${percentage}%)${NC}"
  fi

  echo "$(date +%H:%M:%S),file_descriptors,$total_fds,$percentage" >> "$LOG_FILE"
}

# Function to check Node.js memory usage
check_node_memory() {
  local pids=$(pgrep -f "node")

  if [ -z "$pids" ]; then
    return
  fi

  echo -e "\n${CYAN}Node.js Processes:${NC}"

  for pid in $pids; do
    local mem_kb=$(ps -p $pid -o rss= 2>/dev/null)
    if [ -z "$mem_kb" ]; then
      continue
    fi

    local mem_mb=$((mem_kb / 1024))
    local cmd=$(ps -p $pid -o command= | head -c 60)

    if [ $mem_mb -gt $MAX_NODE_MEMORY_MB ]; then
      echo -e "${RED}  ⚠️  PID ${pid}: ${mem_mb}MB - ${cmd} - HIGH MEMORY${NC}"
    elif [ $mem_mb -gt $((MAX_NODE_MEMORY_MB / 2)) ]; then
      echo -e "${YELLOW}  ⚠️  PID ${pid}: ${mem_mb}MB - ${cmd}${NC}"
    else
      echo -e "${GREEN}  ✓ PID ${pid}: ${mem_mb}MB - ${cmd}${NC}"
    fi

    echo "$(date +%H:%M:%S),node_memory,$pid,$mem_mb" >> "$LOG_FILE"
  done
}

# Function to check DNS requests (c-ares activity)
check_dns_activity() {
  # Check for established connections to DNS servers
  local dns_connections=$(netstat -an 2>/dev/null | grep -c ":53 ")

  if [ $dns_connections -gt $MAX_DNS_REQUESTS ]; then
    echo -e "\n${RED}⚠️  Active DNS Requests: ${dns_connections} - CRITICAL (max: ${MAX_DNS_REQUESTS})${NC}"
  elif [ $dns_connections -gt $((MAX_DNS_REQUESTS / 2)) ]; then
    echo -e "\n${YELLOW}⚠️  Active DNS Requests: ${dns_connections} - WARNING${NC}"
  else
    echo -e "\n${GREEN}✓ Active DNS Requests: ${dns_connections}${NC}"
  fi

  echo "$(date +%H:%M:%S),dns_requests,$dns_connections" >> "$LOG_FILE"
}

# Function to check MCP servers
check_mcp_servers() {
  local mcp_count=$(pgrep -f "mcp-server|dataforseo-server" | wc -l)

  echo -e "\n${CYAN}MCP Servers Running: ${mcp_count}${NC}"

  echo "$(date +%H:%M:%S),mcp_servers,$mcp_count" >> "$LOG_FILE"
}

# Function to check Redis memory
check_redis_memory() {
  if ! command -v redis-cli &> /dev/null; then
    return
  fi

  local redis_mem=$(redis-cli info memory 2>/dev/null | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')

  if [ -n "$redis_mem" ]; then
    echo -e "\n${CYAN}Redis Memory: ${redis_mem}${NC}"
    echo "$(date +%H:%M:%S),redis_memory,$redis_mem" >> "$LOG_FILE"
  fi
}

# Main monitoring loop
echo "timestamp,metric,value,percentage" > "$LOG_FILE"

while true; do
  clear
  echo "=============================================="
  echo "ORCHESTRAI Resource Monitor - $(date '+%Y-%m-%d %H:%M:%S')"
  echo "=============================================="
  echo ""

  check_file_descriptors
  check_node_memory
  check_dns_activity
  check_mcp_servers
  check_redis_memory

  echo ""
  echo "=============================================="
  echo "Log: ${LOG_FILE}"
  echo "Press Ctrl+C to stop"
  echo "=============================================="

  sleep $INTERVAL
done
