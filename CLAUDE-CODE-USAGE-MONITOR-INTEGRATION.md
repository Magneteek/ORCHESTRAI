# Claude Code Usage Monitor Integration Guide

## Overview

The Claude Code Usage Monitor is a real-time terminal-based monitoring tool that tracks token usage, burn rates, session costs, and AI efficiency metrics while using Claude Code. This integration guide provides complete setup and usage instructions for the ORCHESTRAI system.

## Installation

### Prerequisites
- Python 3.8+ (already available on macOS)
- Terminal access
- Claude Code installed and configured

### Installation Method: uv Tool (Recommended)

The `uv` package manager provides the fastest and most reliable installation method with automatic isolated environment management.

#### Step 1: Install uv Package Manager
```bash
# Already installed in ORCHESTRAI system
# If needed on other systems:
curl -LsSf https://astral.sh/uv/install.sh | sh
```

#### Step 2: Install Claude Code Usage Monitor
```bash
# Add uv to PATH (add to ~/.zshrc or ~/.bashrc for permanent)
export PATH="$HOME/.local/bin:$PATH"

# Install the monitor
uv tool install claude-monitor
```

**Installation includes 5 command aliases:**
- `claude-monitor` (primary command)
- `claude-code-monitor` (full name)
- `cmonitor` (short)
- `ccmonitor` (alternative)
- `ccm` (shortest)

### Alternative Installation Methods

#### Using pip
```bash
pip install claude-monitor

# If command not found, add to PATH:
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

#### Using pipx (isolated environments)
```bash
pipx install claude-monitor
```

## Quick Start

### Basic Usage

#### 1. Start Real-Time Monitoring (Default)
```bash
claude-monitor
```

This launches the monitor with:
- **Auto-detected plan** (P90 automatic detection)
- **Real-time view** with live token tracking
- **Auto-detected timezone** and time format
- **Auto theme** (adapts to terminal)

#### 2. Monitor with Specific Plan
```bash
# Pro plan (~44,000 tokens/day)
claude-monitor --plan pro

# Max5 plan (~88,000 tokens/day)
claude-monitor --plan max5

# Max20 plan (~220,000 tokens/day)
claude-monitor --plan max20

# Custom plan with explicit limit
claude-monitor --plan custom --custom-limit-tokens 100000
```

#### 3. Different View Modes
```bash
# Daily aggregated usage
claude-monitor --view daily

# Monthly overview
claude-monitor --view monthly

# Session-specific tracking
claude-monitor --view session
```

## Configuration Options

### Plan Selection

| Plan Type | Token Limit | Best For |
|-----------|------------|----------|
| `pro` | ~44,000 tokens | Standard usage |
| `max5` | ~88,000 tokens | Heavy usage (5 conversations) |
| `max20` | ~220,000 tokens | Intensive usage (20 conversations) |
| `custom` | Auto-detected or manual | ORCHESTRAI multi-agent workflows |

### Display Customization

#### Theme Options
```bash
# Light theme (light terminals)
claude-monitor --theme light

# Dark theme (dark terminals)
claude-monitor --theme dark

# Classic theme (minimal colors)
claude-monitor --theme classic

# Auto theme (adapts to terminal)
claude-monitor --theme auto
```

#### Timezone & Time Format
```bash
# Specific timezone
claude-monitor --timezone "America/New_York"
claude-monitor --timezone "Europe/Amsterdam"
claude-monitor --timezone "UTC"

# Time format
claude-monitor --time-format 12h  # 12-hour format
claude-monitor --time-format 24h  # 24-hour format
```

#### Refresh Rate Configuration
```bash
# Update every 5 seconds
claude-monitor --refresh-rate 5

# Higher display refresh (smoother updates, more CPU)
claude-monitor --refresh-per-second 2.0

# Lower display refresh (less CPU usage)
claude-monitor --refresh-per-second 0.5
```

### Advanced Options

#### Custom Daily Reset Hour
```bash
# Reset counters at 6 AM instead of midnight
claude-monitor --reset-hour 6
```

#### Debug & Logging
```bash
# Enable debug logging
claude-monitor --debug

# Custom log level
claude-monitor --log-level DEBUG

# Log to file
claude-monitor --log-file ~/claude-monitor.log
```

#### Clear Configuration
```bash
# Reset all saved settings
claude-monitor --clear
```

## ORCHESTRAI Integration Workflows

### Workflow 1: Multi-Agent Pipeline Monitoring

When running complex ORCHESTRAI pipelines with multiple agents:

```bash
# Terminal 1: Start monitor with custom high limit
claude-monitor --plan custom --custom-limit-tokens 200000 --view realtime

# Terminal 2: Run ORCHESTRAI pipeline
cd /Users/kris/CLAUDEtools/ORCHESTRAI
npm run orchestrator
```

**Benefits:**
- Track token consumption across all agent interactions
- Monitor burn rate during pipeline execution
- Identify high-token-usage agents for optimization
- Real-time cost tracking for client projects

### Workflow 2: Content Creation Pipeline

When creating content with multiple language agents:

```bash
# Start monitor with daily view for content sessions
claude-monitor --view daily --plan max20

# Run content creation workflow in Claude Code
# Monitor tracks cumulative usage across all content iterations
```

### Workflow 3: Development & Testing

When developing new agents or testing workflows:

```bash
# Enable debug logging for development
claude-monitor --debug --log-file ~/orchestrai-token-usage.log --view session

# Test agents and review session-specific token usage
```

### Workflow 4: Client Project Cost Tracking

```bash
# Track costs for specific client engagement
claude-monitor --view daily --plan custom --custom-limit-tokens 150000

# Export data periodically for client billing
# Monitor provides real-time cost estimates
```

## Key Metrics Tracked

### Real-Time View Displays:
1. **Current Token Usage** - Tokens used in current session
2. **Token Limit** - Daily/custom token limit
3. **Usage Percentage** - % of limit consumed
4. **Burn Rate** - Tokens per hour consumption rate
5. **Time Until Limit** - Estimated time to reach limit
6. **Cost Estimate** - Estimated cost based on usage
7. **Session Duration** - Current session length
8. **Average Tokens/Minute** - Efficiency metric

### Daily View Shows:
- Aggregated token usage by day
- Daily burn rate trends
- Cost accumulation over time
- Usage pattern analysis

### Monthly View Provides:
- Long-term usage trends
- Month-over-month comparisons
- Cost projections
- Optimization opportunities

## Best Practices for ORCHESTRAI

### 1. Always Monitor Complex Pipelines
```bash
# Before starting any multi-agent workflow
claude-monitor --plan custom --view realtime &
# Then proceed with ORCHESTRAI tasks
```

### 2. Use Session View for Agent Development
```bash
# When testing new agents or optimizing existing ones
claude-monitor --view session --debug
```

### 3. Track Daily Usage for Projects
```bash
# Start of each work day
claude-monitor --view daily --plan max20
```

### 4. Log Token Usage for Analysis
```bash
# Enable logging for post-session analysis
claude-monitor --log-file ~/logs/claude-usage-$(date +%Y%m%d).log --log-level INFO
```

### 5. Set Appropriate Plan Limits
- **Standard development**: `--plan pro`
- **Content creation**: `--plan max5`
- **Multi-agent pipelines**: `--plan max20` or `--plan custom`
- **Client projects**: `--plan custom --custom-limit-tokens [project-budget]`

## Troubleshooting

### Monitor Not Starting
```bash
# Verify installation
which claude-monitor

# If not found, add to PATH
export PATH="$HOME/.local/bin:$PATH"

# Reinstall if needed
uv tool install --force claude-monitor
```

### Incorrect Token Counts
```bash
# Clear configuration and restart
claude-monitor --clear
claude-monitor --plan custom
```

### Display Issues
```bash
# Try different theme
claude-monitor --theme classic

# Adjust refresh rate
claude-monitor --refresh-per-second 1.0
```

### High CPU Usage
```bash
# Reduce display refresh rate
claude-monitor --refresh-per-second 0.5 --refresh-rate 15
```

## Integration with ORCHESTRAI Dashboard

### Future Enhancement: Dashboard Integration

The Claude Code Usage Monitor can be integrated into the ORCHESTRAI dashboard for:

1. **Centralized Monitoring** - View token usage alongside agent metrics
2. **Cost Analytics** - Real-time cost tracking per project/client
3. **Agent Optimization** - Identify high-token agents for refactoring
4. **Budget Alerts** - Automated notifications when approaching limits
5. **Historical Analysis** - Token usage trends over time

### Proposed Integration Points:
- WebSocket connection to monitor's data stream
- REST API for historical data retrieval
- Dashboard widgets for real-time usage display
- Agent-specific token tracking and attribution

## Command Reference

### Quick Command Examples

```bash
# Standard monitoring
claude-monitor

# High-performance setup
claude-monitor --plan max20 --view realtime --refresh-rate 5

# Development mode with debugging
claude-monitor --debug --log-file ~/dev.log --view session

# Client project tracking
claude-monitor --plan custom --custom-limit-tokens 200000 --view daily

# Minimal CPU usage
claude-monitor --refresh-per-second 0.3 --refresh-rate 20 --theme classic

# Custom timezone and format
claude-monitor --timezone "Europe/Amsterdam" --time-format 24h
```

## Support & Resources

### Official Resources
- **GitHub Repository**: https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor
- **Package Page**: https://pypi.org/project/claude-monitor/
- **Issue Tracker**: https://github.com/Maciek-roboblog/Claude-Code-Usage-Monitor/issues

### ORCHESTRAI-Specific Support
- Check ORCHESTRAI dashboard for token usage analytics
- Review agent logs for high-token operations
- Optimize crystalline memory to reduce token consumption
- Use pipeline sharing to minimize redundant token usage

## Version Information

**Current Installation**: claude-monitor 3.1.0
**Last Updated**: October 2025
**Compatible With**: Claude Code (all versions)

---

## Quick Start Checklist

- [ ] Install uv package manager
- [ ] Install claude-monitor via `uv tool install claude-monitor`
- [ ] Add `~/.local/bin` to PATH
- [ ] Start monitor with `claude-monitor`
- [ ] Configure plan type for your usage pattern
- [ ] Enable logging for analysis: `--log-file ~/usage.log`
- [ ] Integrate with ORCHESTRAI workflows
- [ ] Review metrics after each session

---

*This integration guide is maintained as part of the ORCHESTRAI system documentation. For updates or issues specific to ORCHESTRAI integration, refer to the main CLAUDE.md documentation.*
