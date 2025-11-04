# Token Monitor Documentation Index

Complete guide to the Claude Code Token Monitor system.

## Quick Navigation

### Getting Started
- [QUICK-START.md](QUICK-START.md) - 60-second setup guide
- [README.md](README.md) - Comprehensive documentation
- [SHOWCASE.md](SHOWCASE.md) - Visual examples and UI walkthrough

### Technical Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture and data flow
- [API.md](API.md) - API reference and integration guide
- [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md) - Implementation details

### Files Overview
- [Token Monitor Summary](/Users/kris/CLAUDEtools/ORCHESTRAI/TOKEN-MONITOR-SUMMARY.md) - Project summary

## Files by Purpose

### Core Application

| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `token-monitor-cli.js` | Main terminal UI | ~300 | WebSocket client, UI coordination, state management |
| `cli-components.js` | UI widgets | ~450 | Reusable blessed components, update functions |
| `cli-formatters.js` | Utilities | ~150 | Number formatting, date handling, progress bars |

### Infrastructure

| File | Purpose | Lines | Key Features |
|------|---------|-------|--------------|
| `token-monitor-server.js` | WebSocket server | ~150 | Data broadcast, client management, HTTP endpoint |
| `test-token-monitor.js` | Test data generator | ~200 | Simulated workflows, random data generation |

### Scripts

| File | Purpose | Key Features |
|------|---------|--------------|
| `start-token-monitor.sh` | Startup script | Dependency check, server + UI launch |
| `demo-token-monitor.sh` | Demo script | Full demo with test data |

### Documentation

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Complete documentation | All users |
| `QUICK-START.md` | 60-second guide | First-time users |
| `ARCHITECTURE.md` | Technical deep-dive | Developers |
| `SHOWCASE.md` | Visual examples | All users |
| `API.md` | Integration guide | Integrators |
| `INDEX.md` | This file | All users |

## Usage Guides

### First-Time Users

1. **Start Here**: [QUICK-START.md](QUICK-START.md)
2. **See It in Action**: Run `npm run monitor:demo`
3. **Learn Features**: [SHOWCASE.md](SHOWCASE.md)
4. **Full Documentation**: [README.md](README.md)

### Developers

1. **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
2. **API Reference**: [API.md](API.md)
3. **Implementation**: [IMPLEMENTATION-SUMMARY.md](IMPLEMENTATION-SUMMARY.md)
4. **Source Code**: Review `*.js` files

### Integrators

1. **API Guide**: [API.md](API.md)
2. **Integration Examples**: [integration-example.js](integration-example.js)
3. **WebSocket Protocol**: See [ARCHITECTURE.md](ARCHITECTURE.md)
4. **Test Scripts**: Use `test-token-monitor.js` as reference

## Quick Commands

```bash
# Installation
npm install blessed blessed-contrib ws

# Usage
npm run monitor:demo          # Demo with test data
npm run monitor:tokens        # Start server + UI
npm run monitor:server        # Server only
npm run monitor:test-data     # Send test data

# Direct execution
node orchestrai-shared/monitoring/token-monitor-cli.js
node orchestrai-shared/monitoring/token-monitor-server.js
node orchestrai-shared/monitoring/test-token-monitor.js
```

## Configuration

```bash
# Environment variables
export TOKEN_BUDGET=200000
export WEBSOCKET_URL=ws://localhost:5502
export REFRESH_RATE=100
```

## Features by File

### token-monitor-cli.js
- Real-time WebSocket connection
- Terminal UI rendering
- State management
- Cost calculation
- Keyboard event handling
- Auto-reconnect logic
- Budget alerts

### cli-components.js
- Screen creation
- Widget factories
- Header/footer
- Session info box
- Token usage gauge
- Workflow history table
- Live event log
- Connection status
- Help dialog

### cli-formatters.js
- Number formatting (K/M suffixes)
- Cost formatting ($X.XX)
- Duration formatting (HH:MM:SS)
- Time formatting
- Progress bar creation
- Color coding logic
- Status symbols
- String truncation

### token-monitor-server.js
- WebSocket server
- HTTP endpoint
- Client management
- Message broadcasting
- Connection tracking
- Error handling

### test-token-monitor.js
- Workflow simulation
- Random token generation
- Event scheduling
- Continuous usage simulation
- Configurable test duration

## Architecture Components

```
Data Sources → WebSocket Server → Terminal UI
     ↓              ↓                  ↓
  HTTP POST    Broadcast          Rendering
  Webhooks     ws://5502          100ms cycle
  Test Data    Client Mgmt        State Updates
```

## Integration Points

### Claude Code Hooks
- Configure webhooks to POST to `http://localhost:5502`
- See [CLAUDE-CODE-HOOKS.md](/Users/kris/CLAUDEtools/ORCHESTRAI/CLAUDE-CODE-HOOKS.md)

### Custom Applications
- Send HTTP POST to `http://localhost:5502`
- Use WebSocket for real-time data: `ws://localhost:5502`
- See [API.md](API.md) for message formats

### Existing Systems
- RESTful API integration
- WebSocket streaming
- Batch data import
- Real-time monitoring

## Data Formats

### Token Usage Event
```json
{
  "type": "token-usage",
  "sessionId": "session-123",
  "inputTokens": 1500,
  "outputTokens": 850,
  "timestamp": "2025-10-28T12:00:00Z"
}
```

### Workflow Complete Event
```json
{
  "type": "workflow-complete",
  "workflowId": "wf_abc123",
  "totalTokens": 2350,
  "cost": 0.35,
  "status": "completed",
  "timestamp": "2025-10-28T12:05:00Z"
}
```

## Visual Examples

### Dashboard Layout
See [SHOWCASE.md](SHOWCASE.md) for:
- Full dashboard view
- Color states (green/yellow/red)
- Session info detail
- Workflow history table
- Live event stream
- Help dialog
- Connection states
- Progress bar variations

### Terminal Output
```
┌─ CLAUDE CODE TOKEN MONITOR ───────────┐
│ Session: prod-session  ● Connected    │
├────────────────────────────────────────┤
│ Current Session │ Token Usage          │
│ Input:  50K     │ ████░░ 75%           │
│ Output: 30K     │ Budget: 200K         │
│ Total:  80K     │ Used: 150K           │
│ Cost:   $1.23   │                      │
└────────────────────────────────────────┘
```

## Troubleshooting

| Issue | Solution | Documentation |
|-------|----------|---------------|
| Connection refused | Start server: `npm run monitor:server` | [README.md](README.md) |
| Port in use | Kill process: `lsof -i :5502` | [QUICK-START.md](QUICK-START.md) |
| UI rendering issues | Reset terminal: `reset` | [README.md](README.md) |
| Dependencies missing | Run: `npm install` | [QUICK-START.md](QUICK-START.md) |

## Performance

- **Memory**: ~30-60 MB
- **CPU**: <5% during active use
- **Network**: ~1-5 KB/s
- **Latency**: <50ms (local)
- **Refresh Rate**: 100ms (configurable)

## Technology Stack

- **blessed** v0.1.81 - Terminal UI framework
- **blessed-contrib** v4.11.0 - Charts and widgets
- **ws** v8.16.0 - WebSocket library
- **Node.js** 18+ - Runtime environment

## Development Workflow

1. **Setup**: Clone repo, install dependencies
2. **Development**: Modify source files
3. **Testing**: Run `npm run monitor:demo`
4. **Integration**: Configure webhooks
5. **Production**: Deploy server, monitor UI

## Contributing

When contributing:
1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Test on multiple terminals
5. Check performance impact

## Support Resources

### Documentation
- Complete guide: [README.md](README.md)
- Quick start: [QUICK-START.md](QUICK-START.md)
- Architecture: [ARCHITECTURE.md](ARCHITECTURE.md)
- Visual guide: [SHOWCASE.md](SHOWCASE.md)

### Examples
- Test data: [test-token-monitor.js](test-token-monitor.js)
- Integration: [integration-example.js](integration-example.js)
- Server: [token-monitor-server.js](token-monitor-server.js)

### Scripts
- Startup: [start-token-monitor.sh](/Users/kris/CLAUDEtools/ORCHESTRAI/scripts/start-token-monitor.sh)
- Demo: [demo-token-monitor.sh](/Users/kris/CLAUDEtools/ORCHESTRAI/scripts/demo-token-monitor.sh)

## File Tree

```
orchestrai-shared/monitoring/
├── token-monitor-cli.js          Main UI application
├── cli-components.js             Reusable widgets
├── cli-formatters.js             Formatting utilities
├── token-monitor-server.js       WebSocket server
├── test-token-monitor.js         Test data generator
├── integration-example.js        Integration examples
├── pricing-calculator.js         Cost calculation
├── token-aggregator.js           Data aggregation
├── agent-availability-tracker.js Agent tracking
├── README.md                     Complete documentation
├── QUICK-START.md                60-second guide
├── ARCHITECTURE.md               Technical architecture
├── SHOWCASE.md                   Visual examples
├── API.md                        API reference
├── IMPLEMENTATION-SUMMARY.md     Implementation details
└── INDEX.md                      This file

scripts/
├── start-token-monitor.sh        Startup script
└── demo-token-monitor.sh         Demo script

Root documentation:
└── TOKEN-MONITOR-SUMMARY.md      Project summary
```

## Version History

- **v1.0.0** (2025-10-28) - Initial release
  - Real-time token monitoring
  - WebSocket server
  - Terminal UI with blessed
  - Cost calculation
  - Workflow tracking
  - Budget alerts
  - Complete documentation

## License

MIT License - Part of the ORCHESTRAI project

---

**Quick Links:**
- [Get Started](QUICK-START.md)
- [Full Documentation](README.md)
- [See Examples](SHOWCASE.md)
- [Technical Details](ARCHITECTURE.md)
- [API Reference](API.md)

**Need Help?**
- Check [README.md](README.md) troubleshooting section
- Review [QUICK-START.md](QUICK-START.md) for common issues
- See [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
