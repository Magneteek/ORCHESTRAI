# Token Monitor Quick Start Guide

Get up and running with the Claude Code Token Monitor in 60 seconds.

## Installation

```bash
# Install dependencies (one time only)
npm install blessed blessed-contrib ws
```

## Usage Options

### Option 1: Full Demo (Recommended for First Time)

Experience the token monitor with simulated data:

```bash
npm run monitor:demo
```

This will:
- Start the WebSocket server automatically
- Launch the terminal UI
- Send simulated token usage data
- Show you all features in action

**Press `q` or `Ctrl+C` to exit**

### Option 2: Start Monitor Only

Start the monitor and connect to a running WebSocket server:

```bash
npm run monitor:tokens
```

This starts both the server and the UI, ready to receive real token data.

### Option 3: Manual Control

For more control over individual components:

```bash
# Terminal 1: Start WebSocket server
npm run monitor:server

# Terminal 2: Start terminal UI
node orchestrai-shared/monitoring/token-monitor-cli.js

# Terminal 3 (optional): Send test data
npm run monitor:test-data
```

## Keyboard Shortcuts

Once the monitor is running:

- **q**: Quit
- **r**: Reset counters
- **c**: Clear event log
- **h**: Show help

## Configuration

Set these environment variables before starting:

```bash
export TOKEN_BUDGET=200000        # Your token limit
export WEBSOCKET_URL=ws://localhost:5502
export REFRESH_RATE=100           # UI refresh rate (ms)
```

Or create `.env` file:

```env
TOKEN_BUDGET=200000
WEBSOCKET_URL=ws://localhost:5502
REFRESH_RATE=100
```

## Sending Custom Data

Send token usage data to the monitor:

```bash
curl -X POST http://localhost:5502 \
  -H "Content-Type: application/json" \
  -d '{
    "type": "token-usage",
    "sessionId": "my-session",
    "inputTokens": 1000,
    "outputTokens": 500
  }'
```

## Integration with Claude Code

To integrate with Claude Code hooks:

1. Start the token monitor server: `npm run monitor:server`
2. Configure Claude Code hooks to POST to `http://localhost:5502`
3. Start the UI: `node orchestrai-shared/monitoring/token-monitor-cli.js`

See [CLAUDE-CODE-HOOKS.md](../../CLAUDE-CODE-HOOKS.md) for full integration details.

## Troubleshooting

### "Connection refused" error

The WebSocket server isn't running. Start it:

```bash
npm run monitor:server
```

### Port already in use

Kill the existing process:

```bash
lsof -i :5502
kill [PID]
```

Or use a different port:

```bash
export WEBSOCKET_URL=ws://localhost:5503
```

### UI rendering issues

Try resetting your terminal:

```bash
reset
```

## Example Output

```
┌─ CLAUDE CODE TOKEN MONITOR ──────────────────────┐
│ Session: test-session-123    Uptime: 00:15:42    │
├────────────────────────────────────────────────────┤
│ ┌─ CURRENT SESSION ──────┐ ┌─ TOKEN USAGE ─────┐ │
│ │ Input:    [██████] 52K │ │  ████████░░  78%  │ │
│ │ Output:   [████  ] 31K │ │                    │ │
│ │ Total:    [██████] 83K │ │  Budget: 200K      │ │
│ │ Cost:     $1.62        │ │  Used: 156K        │ │
│ └────────────────────────┘ └───────────────────┘ │
├────────────────────────────────────────────────────┤
│ ┌─ WORKFLOW HISTORY ───────────────────────────┐  │
│ │ ID              Tokens    Cost    Status     │  │
│ │ wf_content_01   15.2K     $0.23   ✓   14:32  │  │
│ │ wf_analysis_02  22.4K     $0.34   ✓   14:35  │  │
│ │ wf_research_03  18.7K     $0.28   ⏳  14:38  │  │
│ └─────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Review [CLAUDE-CODE-HOOKS.md](../../CLAUDE-CODE-HOOKS.md) for integration
- Check [test-token-monitor.js](test-token-monitor.js) for example data

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run monitor:demo` | Full demo with test data |
| `npm run monitor:tokens` | Start server + UI |
| `npm run monitor:server` | Server only |
| `npm run monitor:test-data` | Send test data |

---

That's it! You're ready to monitor your Claude Code token usage in style.
