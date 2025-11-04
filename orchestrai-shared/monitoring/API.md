# Token Monitor Server API Documentation

Complete API reference for the Claude Code Token Monitor Server.

## Base URL

```
http://localhost:5502
```

## WebSocket Connection

```
ws://localhost:5502
```

---

## REST API Endpoints

### Health Check

Check server status and health.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "service": "Token Monitor Server",
  "version": "1.0.0",
  "uptime": 3600000,
  "port": 5502,
  "connectedClients": 3,
  "hooksManagerConnected": true,
  "timestamp": 1698504123456
}
```

**cURL Example:**
```bash
curl http://localhost:5502/health | jq
```

---

### Get Session Statistics

Retrieve current session statistics including token usage and costs.

**Endpoint:** `GET /api/session-stats`

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_1698504123456_abc123",
    "status": "active",
    "startTime": 1698504123456,
    "duration": 3600000,
    "totalInputTokens": 45000,
    "totalOutputTokens": 87500,
    "totalTokens": 132500,
    "totalCost": 1.3725,
    "workflowCount": 12,
    "activeWorkflows": 2,
    "completedWorkflows": 10,
    "models": {
      "claude-sonnet-4-5-20250929": {
        "inputTokens": 45000,
        "outputTokens": 87500,
        "totalTokens": 132500,
        "cost": 1.3725,
        "calls": 45
      }
    },
    "lastUpdate": 1698507723456
  },
  "timestamp": 1698507723456
}
```

**Cost Calculation:**
- Input: 45,000 tokens × $3.00/MTok = $0.135
- Output: 87,500 tokens × $15.00/MTok = $1.3125
- **Total: $1.3725**

**cURL Example:**
```bash
curl http://localhost:5502/api/session-stats | jq
```

---

### Get Workflow History

Retrieve recent workflow history with token usage and costs.

**Endpoint:** `GET /api/workflows`

**Query Parameters:**
- `limit` (optional): Maximum number of workflows to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "wf_1698504123456_abc123",
      "intent": "coding",
      "startTime": 1698504123456,
      "endTime": 1698504223456,
      "duration": 100000,
      "inputTokens": 3500,
      "outputTokens": 8200,
      "totalTokens": 11700,
      "cost": 0.1335,
      "model": "claude-sonnet-4-5-20250929",
      "status": "completed",
      "efficiency": 87.5,
      "summary": {
        "toolCalls": 5,
        "mcpCalls": 2
      }
    }
  ],
  "count": 1,
  "timestamp": 1698507723456
}
```

**cURL Examples:**
```bash
# Get last 10 workflows (default)
curl http://localhost:5502/api/workflows | jq

# Get last 5 workflows
curl http://localhost:5502/api/workflows?limit=5 | jq

# Get only the most recent workflow
curl http://localhost:5502/api/workflows?limit=1 | jq
```

---

### Get Cost Breakdown

Retrieve detailed cost breakdown by model and workflow.

**Endpoint:** `GET /api/costs`

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCost": 1.3725,
    "totalTokens": 132500,
    "byModel": [
      {
        "model": "claude-sonnet-4-5-20250929",
        "modelName": "Claude Sonnet 4.5",
        "inputTokens": 45000,
        "outputTokens": 87500,
        "totalTokens": 132500,
        "cost": 1.3725,
        "calls": 45,
        "percentage": 100
      }
    ],
    "byWorkflow": [
      {
        "id": "wf_1698504123456_abc123",
        "intent": "coding",
        "cost": 0.1335,
        "tokens": 11700,
        "percentage": 9.73
      },
      {
        "id": "wf_1698504223456_def456",
        "intent": "research",
        "cost": 0.0875,
        "tokens": 7800,
        "percentage": 6.38
      }
    ],
    "efficiency": {
      "tokensPerDollar": 96545.45,
      "costPerToken": 0.00001036,
      "costPer1000Tokens": 0.01036,
      "outputInputRatio": 1.94,
      "inputPercentage": 34.0,
      "outputPercentage": 66.0
    }
  },
  "timestamp": 1698507723456
}
```

**cURL Example:**
```bash
curl http://localhost:5502/api/costs | jq
```

---

### Get Statistics

Retrieve comprehensive session statistics including trends and efficiency metrics.

**Endpoint:** `GET /api/statistics`

**Response:**
```json
{
  "success": true,
  "data": {
    "session": {
      "duration": 3600000,
      "avgTokensPerMinute": 2208.33,
      "avgCostPerMinute": 0.0229,
      "workflowCount": 12,
      "avgTokensPerWorkflow": 11041.67,
      "avgCostPerWorkflow": 0.1144
    },
    "recent": {
      "last5Minutes": {
        "tokens": 8500,
        "cost": 0.0875,
        "workflows": 2,
        "avgTokensPerWorkflow": 4250
      },
      "last15Minutes": {
        "tokens": 24500,
        "cost": 0.2548,
        "workflows": 5,
        "avgTokensPerWorkflow": 4900
      },
      "lastHour": {
        "tokens": 132500,
        "cost": 1.3725,
        "workflows": 12,
        "avgTokensPerWorkflow": 11041.67
      }
    },
    "efficiency": {
      "tokensPerDollar": 96545.45,
      "costPerToken": 0.00001036,
      "costPer1000Tokens": 0.01036,
      "outputInputRatio": 1.94,
      "inputPercentage": 34.0,
      "outputPercentage": 66.0
    },
    "trends": {
      "tokensIncreasing": false,
      "costIncreasing": false,
      "efficiencyImproving": true,
      "confidence": "high",
      "changes": {
        "tokensDelta": -5.2,
        "costDelta": -3.8
      }
    }
  },
  "timestamp": 1698507723456
}
```

**Trend Analysis:**
- `tokensIncreasing`: Recent workflows using more tokens than before
- `costIncreasing`: Recent workflows costing more
- `efficiencyImproving`: Better tokens-per-dollar ratio
- `confidence`: "low", "medium", or "high" based on data points

**cURL Example:**
```bash
curl http://localhost:5502/api/statistics | jq
```

---

### Get Complete Snapshot

Retrieve a complete snapshot of all monitoring data.

**Endpoint:** `GET /api/snapshot`

**Response:**
```json
{
  "success": true,
  "data": {
    "timestamp": 1698507723456,
    "session": {
      "sessionId": "session_1698504123456_abc123",
      "status": "active",
      "startTime": 1698504123456,
      "duration": 3600000,
      "totalInputTokens": 45000,
      "totalOutputTokens": 87500,
      "totalTokens": 132500,
      "totalCost": 1.3725,
      "workflowCount": 12
    },
    "statistics": {
      "session": { /* ... */ },
      "recent": { /* ... */ },
      "efficiency": { /* ... */ },
      "trends": { /* ... */ }
    },
    "costBreakdown": {
      "totalCost": 1.3725,
      "byModel": [ /* ... */ ],
      "byWorkflow": [ /* ... */ ]
    },
    "recentWorkflows": [ /* ... last 5 workflows ... */ ],
    "modelPricing": {
      "claude-sonnet-4-5-20250929": {
        "name": "Claude Sonnet 4.5",
        "inputPricePerMTok": 3.00,
        "outputPricePerMTok": 15.00,
        "contextWindow": 200000
      }
    }
  },
  "timestamp": 1698507723456
}
```

**cURL Example:**
```bash
curl http://localhost:5502/api/snapshot | jq
```

---

### Reset Session

Reset all session counters and start a new session.

**Endpoint:** `POST /api/reset`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "oldSessionId": "session_1698504123456_abc123",
    "newSessionId": "session_1698507823456_def456",
    "message": "Session reset successfully"
  },
  "timestamp": 1698507823456
}
```

**Note:** This action also broadcasts a `session_reset` event to all connected WebSocket clients.

**cURL Example:**
```bash
curl -X POST http://localhost:5502/api/reset | jq
```

---

### Get Connected Clients

Retrieve information about connected WebSocket clients.

**Endpoint:** `GET /api/clients`

**Response:**
```json
{
  "success": true,
  "data": {
    "count": 3,
    "clients": [
      {
        "id": "client_1698507723456_abc123",
        "connectedAt": 1698507723456,
        "uptime": 120000,
        "subscriptions": ["all"]
      },
      {
        "id": "client_1698507823456_def456",
        "connectedAt": 1698507823456,
        "uptime": 20000,
        "subscriptions": ["token_usage", "workflow_completed"]
      }
    ]
  },
  "timestamp": 1698507923456
}
```

**cURL Example:**
```bash
curl http://localhost:5502/api/clients | jq
```

---

## WebSocket Protocol

### Connection

Connect to the WebSocket server:

```javascript
const ws = new WebSocket('ws://localhost:5502');

ws.on('open', () => {
  console.log('Connected to Token Monitor Server');
});
```

### Client → Server Messages

#### Ping

Test connection with a ping.

```json
{
  "type": "ping"
}
```

**Response:**
```json
{
  "type": "pong",
  "timestamp": 1698507723456
}
```

#### Get Snapshot

Request a complete monitoring snapshot.

```json
{
  "type": "get_snapshot"
}
```

**Response:**
```json
{
  "type": "snapshot",
  "data": { /* Complete snapshot data */ },
  "timestamp": 1698507723456
}
```

#### Get Statistics

Request current statistics.

```json
{
  "type": "get_stats"
}
```

**Response:**
```json
{
  "type": "statistics",
  "data": { /* Statistics data */ },
  "timestamp": 1698507723456
}
```

#### Subscribe to Events

Subscribe to specific event types.

```json
{
  "type": "subscribe",
  "payload": {
    "events": ["token_usage", "workflow_completed"]
  }
}
```

**Available Event Types:**
- `all` - All events
- `token_usage` - Token usage updates
- `workflow_initiated` - Workflow start notifications
- `workflow_completed` - Workflow completion notifications
- `session_reset` - Session reset notifications

**Response:**
```json
{
  "type": "subscribed",
  "events": ["token_usage", "workflow_completed"]
}
```

### Server → Client Messages

#### Connection Confirmation

Sent immediately upon connection.

```json
{
  "type": "connection",
  "clientId": "client_1698507723456_abc123",
  "data": {
    "message": "Connected to Token Monitor Server",
    "snapshot": { /* Initial snapshot */ }
  },
  "timestamp": 1698507723456
}
```

#### Token Usage Update

Sent when tokens are used in a workflow.

```json
{
  "type": "token_usage",
  "data": {
    "success": true,
    "session": { /* Session summary */ },
    "currentCost": 1.3725,
    "currentTokens": 132500,
    "costData": {
      "model": "Claude Sonnet 4.5",
      "modelId": "claude-sonnet-4-5-20250929",
      "inputTokens": 3500,
      "outputTokens": 8200,
      "totalTokens": 11700,
      "inputCost": 0.0105,
      "outputCost": 0.123,
      "totalCost": 0.1335
    }
  },
  "timestamp": 1698507723456
}
```

#### Workflow Initiated

Sent when a new workflow starts.

```json
{
  "type": "workflow_initiated",
  "data": {
    "workflow": {
      "id": "wf_1698507723456_abc123",
      "intent": "coding",
      "startTime": 1698507723456,
      "status": "initiated"
    },
    "result": {
      "success": true,
      "workflowId": "wf_1698507723456_abc123",
      "sessionWorkflows": 13
    }
  },
  "timestamp": 1698507723456
}
```

#### Workflow Completed

Sent when a workflow finishes.

```json
{
  "type": "workflow_completed",
  "data": {
    "success": true,
    "workflowId": "wf_1698507723456_abc123",
    "workflowCost": 0.1335,
    "sessionSummary": { /* Session summary */ }
  },
  "timestamp": 1698507823456
}
```

#### Heartbeat

Sent periodically to all connected clients.

```json
{
  "type": "heartbeat",
  "timestamp": 1698507723456,
  "stats": {
    "totalCost": 1.3725,
    "totalTokens": 132500,
    "workflowCount": 12
  }
}
```

#### Session Reset

Sent when session counters are reset.

```json
{
  "type": "session_reset",
  "data": {
    "success": true,
    "oldSessionId": "session_1698504123456_abc123",
    "newSessionId": "session_1698507823456_def456",
    "message": "Session reset successfully"
  },
  "timestamp": 1698507823456
}
```

#### Server Shutdown

Sent before server shuts down.

```json
{
  "type": "server_shutdown",
  "message": "Server is shutting down",
  "timestamp": 1698507823456
}
```

#### Error

Sent when an error occurs processing a message.

```json
{
  "type": "error",
  "error": "Invalid message format",
  "timestamp": 1698507723456
}
```

---

## Error Responses

All API endpoints use consistent error responses:

```json
{
  "success": false,
  "error": "Error message describing what went wrong",
  "timestamp": 1698507723456
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `500` - Internal Server Error

---

## Rate Limiting

Currently, there are no rate limits on the API. However, best practices:
- Avoid polling faster than once per second
- Use WebSocket for real-time updates instead of polling
- Batch multiple operations when possible

---

## Authentication

Currently, the API does not require authentication. In production:
- Add API key authentication
- Use HTTPS/WSS for encrypted connections
- Implement rate limiting per client

---

## Code Examples

### Node.js WebSocket Client

```javascript
const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:5502');

ws.on('open', () => {
  console.log('Connected');

  // Subscribe to token usage events
  ws.send(JSON.stringify({
    type: 'subscribe',
    payload: { events: ['token_usage'] }
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);

  if (message.type === 'token_usage') {
    console.log('Cost:', message.data.currentCost);
    console.log('Tokens:', message.data.currentTokens);
  }
});
```

### Python HTTP Client

```python
import requests

# Get session stats
response = requests.get('http://localhost:5502/api/session-stats')
data = response.json()

print(f"Total Cost: ${data['data']['totalCost']}")
print(f"Total Tokens: {data['data']['totalTokens']}")

# Reset session
reset_response = requests.post('http://localhost:5502/api/reset')
print(reset_response.json()['data']['message'])
```

### Bash Monitoring Script

```bash
#!/bin/bash

# Watch costs in real-time
watch -n 1 'curl -s http://localhost:5502/api/session-stats | jq ".data.totalCost"'

# Get cost breakdown
curl http://localhost:5502/api/costs | jq '.data.efficiency'

# Reset if over budget
cost=$(curl -s http://localhost:5502/api/session-stats | jq -r '.data.totalCost')
if (( $(echo "$cost > 5.0" | bc -l) )); then
  echo "Cost exceeded $5.00, resetting..."
  curl -X POST http://localhost:5502/api/reset
fi
```

---

## Support

For issues or questions:
- Review [README.md](README.md) for setup instructions
- Check [integration-example.js](integration-example.js) for usage examples
- Open an issue on GitHub
