# Token Monitor - Quick Start Guide

Get up and running with token monitoring in under 5 minutes.

## Installation

No additional dependencies needed! All required packages are already in package.json:
- ✅ express
- ✅ ws (WebSocket)
- ✅ cors

## 1. Start the Server (30 seconds)

### Option A: Standalone Server
```bash
npm run monitor:server
```

### Option B: With Integration Test
```bash
npm run monitor:integration
```

You should see:
```
🚀 Token Monitor Server Started
================================
📡 WebSocket Server: ws://localhost:5502
🌐 HTTP API: http://localhost:5502
❤️  Health Check: http://localhost:5502/health
```

## 2. Test the Server (1 minute)

Open a new terminal and run:

```bash
# Quick health check
curl http://localhost:5502/health | jq

# Get session stats
curl http://localhost:5502/api/session-stats | jq

# Get cost breakdown
curl http://localhost:5502/api/costs | jq
```

## 3. Connect a WebSocket Client (2 minutes)

Create a file `test-client.js`:

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:5502');

ws.on('open', () => {
  console.log('✅ Connected to Token Monitor');

  // Subscribe to all events
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { events: ['all'] }
  }));

  // Get initial snapshot
  ws.send(JSON.stringify({
    type: 'get_snapshot'
  }));
});

ws.on('message', (data) => {
  const msg = JSON.parse(data);
  console.log(`📊 [${msg.type}]`, msg.data || msg.stats);
});

ws.on('error', (error) => {
  console.error('❌ Error:', error);
});
```

Run it:
```bash
node test-client.js
```

## 4. Integrate with Hooks Manager (2 minutes)

```javascript
const ClaudeCodeHooksManager = require('./orchestrai-shared/claude-code/hooks-manager');
const TokenMonitorServer = require('./orchestrai-shared/monitoring/token-monitor-server');

async function startMonitoring() {
  // 1. Initialize hooks manager
  const hooksManager = new ClaudeCodeHooksManager(usageTracker, mcpManager);

  // 2. Initialize monitor server
  const monitor = new TokenMonitorServer({ port: 5502 });

  // 3. Start server
  await monitor.start();

  // 4. Connect to hooks manager
  monitor.connectToHooksManager(hooksManager);

  console.log('✅ Token monitoring active!');
}

startMonitoring();
```

## 5. Simulate Token Usage (Optional)

```bash
# Run the test simulation
npm run monitor:test
```

This will:
1. Start the monitor server
2. Create a test workflow
3. Simulate token usage events
4. Show real-time cost updates

## Common Use Cases

### Use Case 1: Monitor Current Session Cost

```bash
# Watch cost in real-time (updates every second)
watch -n 1 'curl -s http://localhost:5502/api/session-stats | jq ".data.totalCost"'
```

### Use Case 2: Get Workflow History

```bash
# Get last 5 workflows
curl http://localhost:5502/api/workflows?limit=5 | jq '.data[] | {id, tokens, cost}'
```

### Use Case 3: Check Efficiency

```bash
# Get efficiency metrics
curl http://localhost:5502/api/costs | jq '.data.efficiency'
```

### Use Case 4: Reset Session

```bash
# Reset counters and start fresh
curl -X POST http://localhost:5502/api/reset | jq
```

### Use Case 5: Real-time Terminal Display

```bash
# Install blessed and blessed-contrib if not already
npm install blessed blessed-contrib

# Run the CLI monitor
npm run monitor:tokens
```

## Key Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health check |
| `/api/session-stats` | GET | Current session statistics |
| `/api/workflows` | GET | Workflow history |
| `/api/costs` | GET | Cost breakdown |
| `/api/statistics` | GET | Comprehensive statistics |
| `/api/snapshot` | GET | Complete monitoring data |
| `/api/reset` | POST | Reset session counters |
| `/api/clients` | GET | Connected WebSocket clients |

## WebSocket Events

| Event Type | Description |
|------------|-------------|
| `token_usage` | Real-time token updates |
| `workflow_initiated` | New workflow started |
| `workflow_completed` | Workflow finished |
| `heartbeat` | Periodic status (every 30s) |
| `session_reset` | Session counters reset |

## Pricing Reference

Current Anthropic Claude pricing:

| Model | Input ($/MTok) | Output ($/MTok) |
|-------|----------------|-----------------|
| Claude Sonnet 4.5 | $3.00 | $15.00 |
| Claude 3.7 Sonnet | $3.00 | $15.00 |
| Claude 3.5 Sonnet | $3.00 | $15.00 |
| Claude 3 Opus | $15.00 | $75.00 |
| Claude 3 Haiku | $0.25 | $1.25 |

## Quick Examples

### Example 1: Calculate Cost for Your Workflow

```javascript
const PricingCalculator = require('./orchestrai-shared/monitoring/pricing-calculator');
const calc = new PricingCalculator();

const cost = calc.calculateCost(
  'claude-sonnet-4-5-20250929',
  5000,   // input tokens
  10000   // output tokens
);

console.log('Total Cost:', calc.formatCost(cost.totalCost));
// Output: Total Cost: $0.17
```

### Example 2: Track Multiple Workflows

```javascript
const TokenAggregator = require('./orchestrai-shared/monitoring/token-aggregator');
const aggregator = new TokenAggregator();

// Process workflow 1
aggregator.processTokenUsage({
  workflow: { id: 'wf-1', intent: 'coding' },
  tokenData: { inputTokens: 3000, outputTokens: 5000, model: 'claude-sonnet-4-5-20250929' }
});

// Process workflow 2
aggregator.processTokenUsage({
  workflow: { id: 'wf-2', intent: 'research' },
  tokenData: { inputTokens: 2000, outputTokens: 4000, model: 'claude-sonnet-4-5-20250929' }
});

// Get summary
const summary = aggregator.getSessionSummary();
console.log('Total Cost:', summary.totalCost);
console.log('Total Tokens:', summary.totalTokens);
```

### Example 3: Monitor Budget Threshold

```bash
#!/bin/bash
# budget-monitor.sh

BUDGET=5.00

while true; do
  COST=$(curl -s http://localhost:5502/api/session-stats | jq -r '.data.totalCost')

  if (( $(echo "$COST > $BUDGET" | bc -l) )); then
    echo "⚠️  Budget exceeded! Cost: \$$COST"
    # Send alert, reset, or take action
    curl -X POST http://localhost:5502/api/reset
  else
    echo "✅ Within budget: \$$COST / \$$BUDGET"
  fi

  sleep 60  # Check every minute
done
```

## Troubleshooting

### Server won't start
```bash
# Check if port is already in use
lsof -i :5502

# Kill existing process
kill -9 $(lsof -t -i:5502)

# Try again
npm run monitor:server
```

### Can't connect WebSocket
```bash
# Verify server is running
curl http://localhost:5502/health

# Check WebSocket URL format
# Correct: ws://localhost:5502
# Wrong: wss://localhost:5502 (SSL not configured)
```

### No data showing
```bash
# Check if hooks manager is connected
curl http://localhost:5502/api/clients | jq '.data.count'

# Verify hooks manager is emitting events
# See integration-example.js for proper setup
```

## Next Steps

1. **Read Full API Documentation**: [API.md](API.md)
2. **Review Integration Examples**: [integration-example.js](integration-example.js)
3. **Check Implementation Details**: [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)
4. **Explore CLI Monitor**: [README.md](README.md)

## Production Deployment

For production use:

1. **Set environment variables**:
   ```bash
   export TOKEN_MONITOR_PORT=5502
   export TOKEN_MONITOR_CORS_ORIGINS=https://your-domain.com
   ```

2. **Use process manager** (PM2):
   ```bash
   pm2 start orchestrai-shared/monitoring/token-monitor-server.js
   ```

3. **Enable HTTPS**: Add SSL certificate and use `https` module

4. **Add authentication**: Implement API key validation

5. **Configure monitoring**: Set up alerts for errors and performance

## Support

- 📖 Full Documentation: [API.md](API.md)
- 🔧 Implementation Guide: [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)
- 🎨 CLI Guide: [README.md](README.md)
- 💬 Questions? Open an issue on GitHub

---

**You're all set! 🚀**

The token monitor is now tracking your Claude Code usage in real-time.
