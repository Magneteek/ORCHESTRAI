# Token Monitor Architecture

Visual overview of the Claude Code Token Monitor system architecture and data flow.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLAUDE CODE TOKEN MONITOR                    │
│                                                                  │
│  ┌────────────────┐    ┌──────────────┐    ┌─────────────────┐ │
│  │  Data Sources  │───▶│  WebSocket   │───▶│   Terminal UI   │ │
│  │                │    │    Server    │    │   (blessed)     │ │
│  └────────────────┘    └──────────────┘    └─────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐     │
│  │ Claude Code  │  │   Custom     │  │  Test Data        │     │
│  │   Hooks      │  │ Applications │  │  Generator        │     │
│  │              │  │              │  │                   │     │
│  │ POST/webhook │  │ HTTP POST    │  │  Simulated data   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────────┘     │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                     WEBSOCKET SERVER                             │
│                   (token-monitor-server.js)                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ HTTP Server (Port 5502)                                 │    │
│  │                                                         │    │
│  │  • Receives POST requests with token data              │    │
│  │  • Validates JSON payload                              │    │
│  │  • Broadcasts to all connected WebSocket clients       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ WebSocket Server (ws://localhost:5502)                  │    │
│  │                                                         │    │
│  │  • Manages client connections                          │    │
│  │  • Broadcasts real-time updates                        │    │
│  │  • Handles reconnection logic                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                      TERMINAL UI CLIENT                          │
│                   (token-monitor-cli.js)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ WebSocket Client                                        │    │
│  │                                                         │    │
│  │  • Connects to ws://localhost:5502                     │    │
│  │  • Receives real-time token updates                    │    │
│  │  • Auto-reconnects on disconnect                       │    │
│  │  • Processes incoming messages                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ State Management                                        │    │
│  │                                                         │    │
│  │  • Session tracking                                     │    │
│  │  • Token counters (input/output/total)                 │    │
│  │  • Cost calculation                                     │    │
│  │  • Workflow history (last 50)                          │    │
│  │  • Event log (last 20)                                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ UI Components (cli-components.js)                       │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │ Header                                       │      │    │
│  │  │  • Session ID                                │      │    │
│  │  │  • Uptime counter                            │      │    │
│  │  │  • Connection status                         │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │                                                         │    │
│  │  ┌───────────────────────┐  ┌──────────────────┐      │    │
│  │  │ Session Info          │  │ Token Gauge      │      │    │
│  │  │                       │  │                  │      │    │
│  │  │  • Input tokens       │  │  • Progress bar  │      │    │
│  │  │  • Output tokens      │  │  • Percentage    │      │    │
│  │  │  • Total tokens       │  │  • Color coding  │      │    │
│  │  │  • Current cost       │  │  • Budget limit  │      │    │
│  │  └───────────────────────┘  └──────────────────┘      │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │ Workflow History Table                       │      │    │
│  │  │                                              │      │    │
│  │  │  • Last 10 workflows                         │      │    │
│  │  │  • Tokens, cost, status, time                │      │    │
│  │  │  • Auto-scroll                               │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │ Live Event Stream                            │      │    │
│  │  │                                              │      │    │
│  │  │  • Real-time token events                    │      │    │
│  │  │  • Scrollable log                            │      │    │
│  │  │  • Color-coded messages                      │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │                                                         │    │
│  │  ┌──────────────────────────────────────────────┐      │    │
│  │  │ Footer                                       │      │    │
│  │  │  • Keyboard shortcuts                        │      │    │
│  │  └──────────────────────────────────────────────┘      │    │
│  │                                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Formatters (cli-formatters.js)                          │    │
│  │                                                         │    │
│  │  • Number formatting (K/M suffixes)                     │    │
│  │  • Cost formatting ($X.XX)                              │    │
│  │  • Duration formatting (HH:MM:SS)                       │    │
│  │  • Progress bars (ASCII)                                │    │
│  │  • Color coding (green/yellow/red)                      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                         TOKEN USAGE EVENT                        │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  HTTP POST      │
                    │  to :5502       │
                    └────────┬────────┘
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │  WebSocket Server validates JSON       │
        └────────────────┬───────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │  Broadcast to all connected clients    │
        └────────┬───────────────────────────────┘
                 │
                 ▼
    ┌────────────────────────────┐
    │  Terminal UI receives data │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │  Update application state  │
    │                            │
    │  • Add to token counters   │
    │  • Update workflow history │
    │  • Calculate costs         │
    │  • Add to event log        │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │  Refresh UI components     │
    │                            │
    │  • Session info            │
    │  • Token gauge             │
    │  • Workflow table          │
    │  • Event log               │
    └────────┬───────────────────┘
             │
             ▼
    ┌────────────────────────────┐
    │  Render to terminal        │
    │  (100ms refresh cycle)     │
    └────────────────────────────┘
```

## Message Types

```
┌─────────────────────────────────────────────────────────┐
│                    MESSAGE FORMATS                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  TOKEN USAGE                                            │
│  ┌───────────────────────────────────────────────┐     │
│  │ {                                             │     │
│  │   "type": "token-usage",                      │     │
│  │   "sessionId": "session-123",                 │     │
│  │   "workflowId": "wf_abc123",                  │     │
│  │   "inputTokens": 1500,                        │     │
│  │   "outputTokens": 850,                        │     │
│  │   "timestamp": "2025-10-28T12:00:00Z"         │     │
│  │ }                                             │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  WORKFLOW COMPLETE                                      │
│  ┌───────────────────────────────────────────────┐     │
│  │ {                                             │     │
│  │   "type": "workflow-complete",                │     │
│  │   "sessionId": "session-123",                 │     │
│  │   "workflowId": "wf_abc123",                  │     │
│  │   "totalTokens": 2350,                        │     │
│  │   "cost": 0.35,                               │     │
│  │   "status": "completed",                      │     │
│  │   "timestamp": "2025-10-28T12:05:00Z"         │     │
│  │ }                                             │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
│  TASK START                                             │
│  ┌───────────────────────────────────────────────┐     │
│  │ {                                             │     │
│  │   "type": "task-start",                       │     │
│  │   "sessionId": "session-123",                 │     │
│  │   "workflowId": "wf_abc123",                  │     │
│  │   "description": "Starting content creation", │     │
│  │   "timestamp": "2025-10-28T12:00:00Z"         │     │
│  │ }                                             │     │
│  └───────────────────────────────────────────────┘     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## State Management

```
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION STATE                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  session: {                                             │
│    sessionId: string                                    │
│    startTime: Date                                      │
│    uptime: number (seconds)                             │
│  }                                                      │
│                                                         │
│  tokens: {                                              │
│    inputTokens: number                                  │
│    outputTokens: number                                 │
│    totalTokens: number                                  │
│  }                                                      │
│                                                         │
│  costs: {                                               │
│    totalCost: number (USD)                              │
│    inputCostPerMillion: 3.00                            │
│    outputCostPerMillion: 15.00                          │
│  }                                                      │
│                                                         │
│  workflows: [                                           │
│    {                                                    │
│      workflowId: string                                 │
│      totalTokens: number                                │
│      cost: number                                       │
│      status: 'completed' | 'running' | 'failed'         │
│      timestamp: Date                                    │
│    }                                                    │
│  ] (max 50)                                             │
│                                                         │
│  events: [                                              │
│    {                                                    │
│      timestamp: Date                                    │
│      eventType: string                                  │
│      description: string                                │
│      inputTokens?: number                               │
│      outputTokens?: number                              │
│    }                                                    │
│  ] (max 20)                                             │
│                                                         │
│  connection: {                                          │
│    status: 'connected' | 'disconnected' | 'error'       │
│    reconnectAttempts: number                            │
│    maxReconnectAttempts: 10                             │
│  }                                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Cost Calculation

```
┌─────────────────────────────────────────────────────────┐
│                  COST CALCULATION                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Claude Sonnet 4.5 Pricing:                             │
│                                                         │
│    Input tokens:  $3.00 per million tokens              │
│    Output tokens: $15.00 per million tokens             │
│                                                         │
│  Formula:                                               │
│                                                         │
│    inputCost = (inputTokens / 1,000,000) × $3.00        │
│    outputCost = (outputTokens / 1,000,000) × $15.00     │
│    totalCost = inputCost + outputCost                   │
│                                                         │
│  Example:                                               │
│                                                         │
│    Input:  50,000 tokens                                │
│    Output: 30,000 tokens                                │
│                                                         │
│    inputCost = (50,000 / 1,000,000) × $3.00             │
│              = 0.05 × $3.00                             │
│              = $0.15                                    │
│                                                         │
│    outputCost = (30,000 / 1,000,000) × $15.00           │
│               = 0.03 × $15.00                           │
│               = $0.45                                   │
│                                                         │
│    totalCost = $0.15 + $0.45 = $0.60                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Color Coding Logic

```
┌─────────────────────────────────────────────────────────┐
│                    COLOR CODING                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Budget Percentage:                                     │
│                                                         │
│    0% - 69%:   GREEN   ✓ Safe usage                     │
│    70% - 89%:  YELLOW  ⚠ Warning                        │
│    90% - 100%: RED     ⚠ Critical                       │
│                                                         │
│  Formula:                                               │
│                                                         │
│    percentage = (totalTokens / tokenBudget) × 100       │
│                                                         │
│    if (percentage < 70):  color = 'green'               │
│    elif (percentage < 90): color = 'yellow'             │
│    else:                  color = 'red'                 │
│                                                         │
│  Alert Thresholds:                                      │
│                                                         │
│    90%:  Warning message in event log                   │
│    95%:  Additional alert                               │
│    100%: Budget exceeded notification                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Performance Characteristics

```
┌─────────────────────────────────────────────────────────┐
│                    PERFORMANCE                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Memory Usage:                                          │
│    • Base: ~30-50 MB                                    │
│    • Per workflow: ~1 KB                                │
│    • Max workflows stored: 50                           │
│    • Total memory: ~30-60 MB                            │
│                                                         │
│  CPU Usage:                                             │
│    • Idle: <1%                                          │
│    • Active updates: 2-5%                               │
│    • Refresh rate: 100ms (configurable)                 │
│                                                         │
│  Network:                                               │
│    • WebSocket: Persistent connection                   │
│    • Bandwidth: ~1-5 KB/s                               │
│    • Latency: <50ms (local)                             │
│                                                         │
│  Rendering:                                             │
│    • Smart CSR: Only updates changed regions            │
│    • No flicker: Optimized blessed rendering            │
│    • 60 FPS capable                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                  TECHNOLOGY STACK                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend (Terminal UI):                                │
│    • blessed v0.1.81         Terminal UI framework      │
│    • blessed-contrib v4.11.0 Charts & widgets           │
│    • Node.js 18+             Runtime                    │
│                                                         │
│  Backend (WebSocket Server):                            │
│    • ws v8.16.0              WebSocket library          │
│    • http (built-in)         HTTP server                │
│    • Node.js 18+             Runtime                    │
│                                                         │
│  Utilities:                                             │
│    • Custom formatters       Number/date formatting     │
│    • Custom components       Reusable UI widgets        │
│                                                         │
│  Development:                                           │
│    • npm scripts             Build & run automation     │
│    • Shell scripts           Startup & demo             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## File Dependencies

```
token-monitor-cli.js
  ├── requires: ws
  ├── requires: ./cli-components
  ├── requires: ./cli-formatters
  └── provides: main application

cli-components.js
  ├── requires: blessed
  ├── requires: blessed-contrib
  ├── requires: ./cli-formatters
  └── provides: UI widgets

cli-formatters.js
  └── provides: utility functions

test-token-monitor.js
  ├── requires: http
  └── provides: test data generator

token-monitor-server.js
  ├── requires: ws
  ├── requires: http
  └── provides: WebSocket server
```

---

This architecture provides a scalable, maintainable, and performant solution for real-time token monitoring in Claude Code workflows.
