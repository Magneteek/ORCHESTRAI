#!/bin/bash

# Token Monitor Startup Script
# Installs dependencies and starts both WebSocket server and terminal UI

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MONITORING_DIR="$PROJECT_ROOT/orchestrai-shared/monitoring"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Claude Code Token Monitor Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm version: $(npm --version)"
echo ""

# Install dependencies if needed
echo -e "${YELLOW}Checking dependencies...${NC}"

REQUIRED_PACKAGES=("blessed" "blessed-contrib" "ws")
MISSING_PACKAGES=()

for package in "${REQUIRED_PACKAGES[@]}"; do
    if ! npm list "$package" &> /dev/null; then
        MISSING_PACKAGES+=("$package")
    fi
done

if [ ${#MISSING_PACKAGES[@]} -gt 0 ]; then
    echo -e "${YELLOW}Installing missing packages: ${MISSING_PACKAGES[*]}${NC}"
    npm install "${MISSING_PACKAGES[@]}" --save
    echo -e "${GREEN}✓${NC} Dependencies installed"
else
    echo -e "${GREEN}✓${NC} All dependencies already installed"
fi

echo ""

# Check if WebSocket server exists
if [ ! -f "$MONITORING_DIR/token-monitor-server.js" ]; then
    echo -e "${YELLOW}Warning: WebSocket server not found at:${NC}"
    echo "$MONITORING_DIR/token-monitor-server.js"
    echo ""
    echo -e "${YELLOW}Creating basic WebSocket server...${NC}"

    # Create a basic WebSocket server if it doesn't exist
    cat > "$MONITORING_DIR/token-monitor-server.js" << 'EOF'
#!/usr/bin/env node

/**
 * Token Monitor WebSocket Server
 * Broadcasts token usage data to connected clients
 */

const WebSocket = require('ws');
const http = require('http');

const PORT = process.env.TOKEN_MONITOR_PORT || 5505;

// Create HTTP server for WebSocket
const server = http.createServer();
const wss = new WebSocket.Server({ server });

let connectedClients = 0;

wss.on('connection', (ws) => {
  connectedClients++;
  console.log(`Client connected. Total clients: ${connectedClients}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: 'system',
    message: 'Connected to token monitor server',
    timestamp: new Date().toISOString()
  }));

  ws.on('close', () => {
    connectedClients--;
    console.log(`Client disconnected. Total clients: ${connectedClients}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
  });
});

// Broadcast message to all connected clients
function broadcast(data) {
  const message = typeof data === 'string' ? data : JSON.stringify(data);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// HTTP endpoint to receive token data from Claude Code hooks
const httpServer = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);

        // Broadcast to all WebSocket clients
        broadcast(data);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Token Monitor Server\n');
  }
});

server.on('request', httpServer);

server.listen(PORT, () => {
  console.log(`Token Monitor WebSocket Server running on ws://localhost:${PORT}`);
  console.log(`Waiting for connections...`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { broadcast };
EOF

    chmod +x "$MONITORING_DIR/token-monitor-server.js"
    echo -e "${GREEN}✓${NC} WebSocket server created"
fi

echo ""

# Configuration
export TOKEN_BUDGET=${TOKEN_BUDGET:-200000}
export TOKEN_MONITOR_PORT=${TOKEN_MONITOR_PORT:-5505}
export WEBSOCKET_URL=${WEBSOCKET_URL:-ws://localhost:5505}
export REFRESH_RATE=${REFRESH_RATE:-100}

echo -e "${BLUE}Configuration:${NC}"
echo "  Token Budget:    $TOKEN_BUDGET"
echo "  WebSocket URL:   $WEBSOCKET_URL"
echo "  Refresh Rate:    ${REFRESH_RATE}ms"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down...${NC}"

    if [ ! -z "$SERVER_PID" ]; then
        kill $SERVER_PID 2>/dev/null || true
    fi

    if [ ! -z "$CLIENT_PID" ]; then
        kill $CLIENT_PID 2>/dev/null || true
    fi

    echo -e "${GREEN}✓${NC} Cleanup complete"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start WebSocket server in background (silent mode to prevent log bleeding)
echo -e "${YELLOW}Starting WebSocket server...${NC}"
SILENT_MODE=true node "$MONITORING_DIR/token-monitor-server.js" &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    echo -e "${GREEN}✓${NC} WebSocket server started (PID: $SERVER_PID)"
else
    echo -e "${RED}Error: Failed to start WebSocket server${NC}"
    exit 1
fi

echo ""

# Give server time to initialize
sleep 1

# Start terminal UI
echo -e "${YELLOW}Starting terminal UI...${NC}"
echo ""
echo -e "${BLUE}================================${NC}"
echo ""

# Make CLI executable
chmod +x "$MONITORING_DIR/token-monitor-cli.js"

# Run the CLI
node "$MONITORING_DIR/token-monitor-cli.js"

# Cleanup when CLI exits
cleanup
