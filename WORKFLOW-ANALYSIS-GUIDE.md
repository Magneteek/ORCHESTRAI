# Workflow Data Analysis Guide

**Complete guide to analyzing ORCHESTRAI execution data**

---

## 🎯 Two Data Sources

ORCHESTRAI captures data in TWO places:

### **1. Hooks Server (Port 5501)** - Lightweight tracking
- Tracks ALL Claude Code events
- 451 workflows currently captured
- Limited detail (mostly metadata)
- Real-time via REST API

### **2. Session Manager** - Detailed capture
- Full session transcripts
- Complete tool call history
- Deliverables and outputs
- File-based storage
- Rich analysis capabilities

---

## 🔧 Analysis Tools Created

| Tool | Purpose | Data Source |
|------|---------|-------------|
| `analyze-workflows.sh` | Analyze hooks server data | Port 5501 API |
| `analyze-sessions.sh` | Analyze session data | Session files |
| `orchestrai-session-manager/cli/session-viewer.js` | View sessions | Session files |

---

## 📊 Method 1: Hooks Server Analysis

**Best for:** Real-time monitoring, workflow counts, basic metrics

### **Available Commands**

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI

# Overview
./tools/analyze-workflows.sh overview

# Token usage
./tools/analyze-workflows.sh tokens

# Tool usage
./tools/analyze-workflows.sh tools

# Error analysis
./tools/analyze-workflows.sh errors

# Timeline
./tools/analyze-workflows.sh timeline

# Recent activity
./tools/analyze-workflows.sh recent 20

# Cost analysis
./tools/analyze-workflows.sh costs

# Notifications
./tools/analyze-workflows.sh notifications

# Export data
./tools/analyze-workflows.sh export backup.json

# Search
./tools/analyze-workflows.sh search "initiated"

# Complete stats
./tools/analyze-workflows.sh stats

# All analyses
./tools/analyze-workflows.sh all
```

### **Current Data Available**

```bash
# Quick overview
curl -s http://localhost:5501/hooks/workflows | jq '{
  total: (.data | length),
  statuses: (.data | group_by(.status) | map({status: .[0].status, count: length}))
}'
```

**Output:**
```json
{
  "total": 451,
  "statuses": [
    {
      "status": "initiated",
      "count": 451
    }
  ]
}
```

### **Example: Find Workflows by Date**

```bash
# Workflows from today
curl -s http://localhost:5501/hooks/workflows | \
  jq '.data | map(select(.startTime / 1000 | strftime("%Y-%m-%d") == "2026-02-12"))'
```

### **Example: Group by Hour**

```bash
curl -s http://localhost:5501/hooks/workflows | \
  jq '.data | group_by(.startTime / 1000 / 3600 | floor) |
      map({hour: (.[0].startTime / 1000 | strftime("%Y-%m-%d %H:00")), count: length})'
```

---

## 📁 Method 2: Session Manager Analysis

**Best for:** Detailed analysis, deliverables, tool usage, costs

### **Available Commands**

```bash
# Count sessions
./tools/analyze-sessions.sh count

# Recent sessions
./tools/analyze-sessions.sh recent 10

# Agent statistics
./tools/analyze-sessions.sh agents

# Token usage
./tools/analyze-sessions.sh tokens

# Tool usage
./tools/analyze-sessions.sh tools

# Success rate
./tools/analyze-sessions.sh success

# Deliverables
./tools/analyze-sessions.sh deliverables

# Performance
./tools/analyze-sessions.sh performance

# Search
./tools/analyze-sessions.sh search "content-writer"

# Export summary
./tools/analyze-sessions.sh export summary.json

# Complete report
./tools/analyze-sessions.sh report
```

### **Using Session Viewer CLI**

```bash
# List all sessions
node orchestrai-session-manager/cli/session-viewer.sh list

# View specific session
node orchestrai-session-manager/cli/session-viewer.js view ses-2026-02-12-abc123

# View transcript
node orchestrai-session-manager/cli/session-viewer.js transcript ses-2026-02-12-abc123

# Find by deliverable
node orchestrai-session-manager/cli/session-viewer.js find-by-file /path/to/file.md

# Statistics
node orchestrai-session-manager/cli/session-viewer.js stats
```

---

## 💻 Method 3: Direct Data Analysis

**Best for:** Custom analysis, data science, reporting

### **Query Hooks Server Directly**

```bash
# Get all workflows
curl -s http://localhost:5501/hooks/workflows > workflows.json

# Analyze with jq
cat workflows.json | jq '.data | map({
  id,
  status,
  date: (.startTime / 1000 | strftime("%Y-%m-%d")),
  tools: (.toolCalls | length)
})'
```

### **Query Session Files Directly**

```bash
# Find all sessions
find sessions -name "session.json"

# Extract agent usage
find sessions -name "session.json" -exec jq -r '.agent.type' {} \; | sort | uniq -c

# Total tokens
find sessions -name "session.json" -exec jq -r '.metrics.totalTokens // 0' {} \; | \
  awk '{sum+=$1} END {print sum}'

# Average duration
find sessions -name "session.json" -exec jq -r '.duration // 0' {} \; | \
  awk '{sum+=$1; count++} END {print sum/count/1000 " seconds"}'
```

---

## 📈 Advanced Analysis Examples

### **Example 1: Tool Usage Frequency**

```bash
# From sessions
find sessions -name "session.json" -exec jq -r '.toolCalls[]?.tool' {} \; 2>/dev/null | \
  sort | uniq -c | sort -rn
```

**Sample Output:**
```
  45 Read
  32 Write
  28 Edit
  15 Bash
  12 Grep
   8 Glob
```

### **Example 2: Cost by Agent**

```bash
# From sessions
find sessions -name "session.json" | while read file; do
  jq -r '"\(.agent.type // "unknown"),\(.metrics.cost // 0)"' "$file" 2>/dev/null
done | awk -F, '{sum[$1]+=$2; count[$1]++} END {for (agent in sum) printf "%-40s $%.4f (%d sessions)\n", agent, sum[agent], count[agent]}' | sort -t$ -k2 -rn
```

**Sample Output:**
```
content-writer-specialist                 $12.45 (25 sessions)
seo-keyword-research                      $8.32 (18 sessions)
seo-competitor-analysis                   $6.78 (12 sessions)
```

### **Example 3: Success Rate by Agent**

```bash
find sessions -name "session.json" | while read file; do
  jq -r '"\(.agent.type // "unknown"),\(.status)"' "$file" 2>/dev/null
done | awk -F, '{total[$1]++; if($2=="completed") success[$1]++} END {for(agent in total) printf "%-40s %.1f%% (%d/%d)\n", agent, (success[agent]/total[agent]*100), success[agent], total[agent]}' | sort -t% -k1 -rn
```

### **Example 4: Timeline Visualization**

```bash
# Sessions per day
find sessions -name "session.json" -exec jq -r '(.timestamp / 1000 | strftime("%Y-%m-%d"))' {} \; 2>/dev/null | \
  sort | uniq -c | \
  awk '{printf "%s: %s\n", $2, $1}'
```

**Sample Output:**
```
2026-02-10: 23
2026-02-11: 45
2026-02-12: 67
```

### **Example 5: Deliverables Report**

```bash
# List all files created
find sessions -name "session.json" -exec jq -r '.outputs.files[]?.path' {} \; 2>/dev/null | sort -u
```

### **Example 6: Error Analysis**

```bash
# Find sessions with errors
find sessions -name "session.json" | while read file; do
  if jq -e '.status == "failed"' "$file" >/dev/null 2>&1; then
    echo "Session: $(basename $(dirname "$file"))"
    jq -r '"Agent: \(.agent.type)", "Error: \(.error // "unknown")"' "$file" 2>/dev/null
    echo "─────────────────────"
  fi
done
```

---

## 📊 Creating Reports

### **Daily Report Script**

```bash
#!/bin/bash
# daily-report.sh

DATE=$(date +%Y-%m-%d)
REPORT="report-$DATE.txt"

{
  echo "ORCHESTRAI Daily Report - $DATE"
  echo "================================"
  echo ""

  echo "Sessions:"
  ./tools/analyze-sessions.sh count
  echo ""

  echo "Agent Usage:"
  ./tools/analyze-sessions.sh agents
  echo ""

  echo "Success Rate:"
  ./tools/analyze-sessions.sh success
  echo ""

  echo "Costs:"
  ./tools/analyze-sessions.sh tokens
  echo ""

} > "$REPORT"

echo "Report saved to: $REPORT"
```

### **Export to CSV**

```bash
# Export session summary to CSV
echo "SessionID,Agent,Status,Duration,Tokens,Cost,Files" > sessions.csv

find sessions -name "session.json" | while read file; do
  jq -r '[
    .sessionId,
    .agent.type,
    .status,
    (.duration // 0),
    (.metrics.totalTokens // 0),
    (.metrics.cost // 0),
    (.outputs.files | length)
  ] | @csv' "$file" 2>/dev/null >> sessions.csv
done

echo "Exported to sessions.csv"
```

### **JSON Export for Dashboards**

```bash
# Export complete dataset
{
  echo "{"
  echo '  "generated": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",'
  echo '  "sessions": ['

  first=1
  find sessions -name "session.json" | while read file; do
    if [ $first -eq 0 ]; then echo ","; fi
    cat "$file"
    first=0
  done

  echo '  ]'
  echo "}"
} > complete-export.json
```

---

## 🎨 Visualization Ideas

### **1. Using Terminal Graphs**

```bash
# Install termgraph
# brew install termgraph (Mac) or pip install termgraph

# Agent usage bar chart
./tools/analyze-sessions.sh agents | \
  grep -E "^\s+\S+\s+\d+" | \
  termgraph
```

### **2. Export for Excel/Sheets**

```bash
# Create CSV export
./tools/analyze-sessions.sh export sessions.csv

# Import into Excel/Google Sheets for:
# - Pivot tables
# - Charts
# - Dashboards
```

### **3. Web Dashboard (Future)**

Hooks Server already provides REST API - build a dashboard with:
- Real-time workflow monitoring
- Agent performance charts
- Cost tracking
- Error alerts

---

## 🔍 Common Analysis Queries

### **"Which agents are used most?"**

```bash
./tools/analyze-sessions.sh agents
```

### **"How much have I spent on agents?"**

```bash
./tools/analyze-sessions.sh tokens
```

### **"What files were created today?"**

```bash
find sessions -name "session.json" -exec jq -r '
  select(.timestamp / 1000 | strftime("%Y-%m-%d") == "'$(date +%Y-%m-%d)'") |
  .outputs.files[]?.path
' {} \; 2>/dev/null
```

### **"Show me failed sessions"**

```bash
find sessions -name "session.json" -exec jq -r '
  select(.status == "failed") |
  {sessionId, agent: .agent.type, error}
' {} \; 2>/dev/null
```

### **"Which tools are used together?"**

```bash
find sessions -name "session.json" -exec jq -r '
  .toolCalls | map(.tool) | unique | join(" + ")
' {} \; 2>/dev/null | sort | uniq -c | sort -rn
```

---

## 💡 Pro Tips

### **1. Regular Exports**

```bash
# Weekly backup
./tools/analyze-workflows.sh export "workflows-$(date +%Y-%m-%d).json"
./tools/analyze-sessions.sh export "summary-$(date +%Y-%m-%d).json"
```

### **2. Monitor Costs**

```bash
# Check daily spend
./tools/analyze-sessions.sh tokens | grep "Total Cost"
```

### **3. Track Performance**

```bash
# Average session duration
./tools/analyze-sessions.sh performance
```

### **4. Find Bottlenecks**

```bash
# Longest running sessions
find sessions -name "session.json" -exec jq -r '
  "\(.duration // 0)\t\(.agent.type)\t\(.sessionId)"
' {} \; 2>/dev/null | sort -rn | head -10
```

### **5. Quality Metrics**

```bash
# Success rate over time
find sessions -name "session.json" -exec jq -r '
  "\((.timestamp / 1000 | strftime("%Y-%m-%d")))\t\(.status)"
' {} \; 2>/dev/null | \
  awk -F\\t '{
    total[$1]++
    if($2=="completed") success[$1]++
  } END {
    for(d in total) printf "%s: %.1f%% (%d/%d)\n", d, (success[d]/total[d]*100), success[d], total[d]
  }' | sort
```

---

## 📚 Quick Reference

### **Hooks Server (Real-time)**

```bash
curl http://localhost:5501/health
curl http://localhost:5501/hooks/workflows | jq '.data | length'
./tools/analyze-workflows.sh overview
```

### **Session Manager (Detailed)**

```bash
./tools/analyze-sessions.sh report
node orchestrai-session-manager/cli/session-viewer.js stats
```

### **Custom Analysis**

```bash
find sessions -name "session.json" -exec jq '...' {} \;
curl -s http://localhost:5501/hooks/workflows | jq '...'
```

---

## ✅ Summary

**You now have THREE ways to analyze workflow data:**

1. **Hooks Server API** - Real-time via REST
2. **Analysis Scripts** - Pre-built tools
3. **Direct Queries** - Custom jq/bash

**All tools are in:** `/Users/kris/CLAUDEtools/ORCHESTRAI/tools/`

**Quick start:**
```bash
./tools/analyze-workflows.sh all      # Hooks server data
./tools/analyze-sessions.sh report    # Session data (when available)
```

**Next steps:** Run some agents to generate session data, then use these tools to analyze the results!
