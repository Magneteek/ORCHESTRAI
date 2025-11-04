# 🎯 Enhanced Token Monitor - Complete Guide

**Real-time Claude Code token tracking with burn rate, daily/weekly limits, cost projections, and smart analytics!**

## ✅ SETUP IS COMPLETE - Ready to Use!

All enhancements have been implemented:
- ✅ Burn rate tracking (tokens/sec, tokens/min)
- ✅ Daily & weekly limit monitoring  
- ✅ Smart time projections ("You'll run out in X hours")
- ✅ Cost analytics ($/min, $/hour)
- ✅ Color-coded alerts (green/yellow/red)
- ✅ Auto-reset timers

---

## 🚀 Quick Start

### Step 1: Start Monitor
```bash
npm run monitor:tokens
```

### Step 2: Inject Test Data (New Terminal)
```bash
npm run monitor:inject
```

**That's it!** You'll see live token updates immediately! 🎉

---

## 📊 Dashboard Sections

### TOP LEFT: Current Session
- Session ID, uptime
- Input/output/total tokens with bars
- Real-time cost

### TOP RIGHT: Burn Rate & Projections ⚡
- **Tokens/sec**: Real-time burn rate
- **Tokens/min**: Average consumption  
- **Cost/min**: Spending rate
- **Cost/hour**: Hourly projection
- **Status**: Time until limit exhausted

### MIDDLE: Daily & Weekly Limits 📅
- **Daily**: 200K tokens (24h reset)
- **Weekly**: 1.4M tokens (7d reset)
- Countdown: "Resets in 14h 23m"
- Color bars: 🟢 <70% | 🟡 70-90% | 🔴 >90%

### BOTTOM: Workflow History & Live Stream
- Recent workflows table
- Real-time event log

---

## ⌨️ Keyboard Controls

| Key | Action |
|-----|--------|
| `q` | Quit |
| `r` | Reset counters |
| `c` | Clear log |
| `h` | Help |

---

## 🧪 Testing

### Send Test Tokens
```bash
curl -X POST http://localhost:5505/api/token-usage \
  -H "Content-Type: application/json" \
  -d '{
    "tokenData": {
      "inputTokens": 1500,
      "outputTokens": 800
    }
  }'
```

### Check Health
```bash
curl http://localhost:5505/health | jq
```

---

## 🔌 API Endpoints

**Base**: `http://localhost:5505`

- `POST /api/token-usage` - Submit token data
- `GET /api/session-stats` - Session statistics
- `GET /api/costs` - Cost breakdown
- `GET /health` - Server health

---

## 📈 Smart Features

### Burn Rate Calculation
```
Tokens/sec = Total Tokens / Session Duration (sec)
Cost/hour = (Cost / Session Min) × 60
```

### Projection Algorithm
```
Time Remaining = Daily Remaining / Tokens Per Second
Exhausted At = Now + Time Remaining
```

### Color Alerts
- 🟢 < 70%: Safe
- 🟡 70-90%: Warning
- 🔴 > 90%: Critical

---

## 🐛 Troubleshooting

### No Data Showing?
```bash
# Test injection
npm run monitor:inject

# Or manual test
curl -X POST http://localhost:5505/api/token-usage \
  -H "Content-Type: application/json" \
  -d '{"tokenData":{"inputTokens":100,"outputTokens":50}}'
```

### Port In Use?
```bash
# Kill existing
pkill -f "token-monitor"

# Restart
npm run monitor:tokens
```

---

## 🎯 What's Implemented

✅ **Real-time burn rate**
✅ **Daily/weekly limits with auto-reset**
✅ **Smart time projections**
✅ **Cost analytics**
✅ **Color-coded alerts**
✅ **Direct HTTP API for token submission**

---

## 🚧 Coming Soon (You Requested!)

1. **Cost Analytics Dashboard** 💰
   - Monthly budgets & projections
   - Cost trends & comparisons
   
2. **Efficiency Metrics** ⚡
   - Optimization suggestions
   - Input/output ratio analysis

---

## 📄 Files Modified

- `token-aggregator.js` - Added burn rate & projections
- `token-monitor-server.js` - Added `/api/token-usage` endpoint  
- `cli-components.js` - New dashboard layout
- `token-monitor-cli.js` - Enhanced UI logic
- `inject-current-tokens.js` - NEW test script

---

**Full docs**: [CLAUDE.md](../../CLAUDE.md)
