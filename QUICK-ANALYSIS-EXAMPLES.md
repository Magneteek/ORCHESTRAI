# Quick Analysis Examples - Try These Now!

**Real examples you can run immediately**

---

## 🚀 What You Can Analyze Right Now

You have **451 workflows** tracked in the Hooks Server. Here's what you can do with that data:

---

## 📊 Example 1: Workflow Overview

```bash
./tools/analyze-workflows.sh overview
```

**Output:**
```
=== Workflow Overview ===

Total Workflows: 451
Status Breakdown: {"initiated":451}
Workflows with Errors: 0
Workflows with Notifications: 1
Date Range: {"Earliest":"2026-02-04 10:09","Latest":"2026-02-12 18:16"}
```

**What this tells you:**
- 451 workflows tracked over 8 days
- All in "initiated" status
- Clean - no errors!
- 1 notification captured

---

## 📊 Example 2: Timeline Analysis

```bash
./tools/analyze-workflows.sh timeline
```

**Shows workflows per day** - see when you were most active

---

## 📊 Example 3: Recent Activity

```bash
./tools/analyze-workflows.sh recent 5
```

**Output:**
```
ID: wf_1770920163003_7udi90yt
Time: 2026-02-12 18:16:03
Status: initiated
Tools: 0
Tokens: 0
─────────────────────────────────

ID: wf_1770919976200_rliz6l1n
Time: 2026-02-12 18:12:56
Status: initiated
Tools: 0
Tokens: 0
```

**Shows your most recent Claude Code activity**

---

## 📊 Example 4: Export for Analysis

```bash
./tools/analyze-workflows.sh export workflows-backup.json
```

**Creates JSON file** you can analyze with:
- jq (command line)
- Python/JavaScript scripts
- Excel (import JSON)
- Data analysis tools

---

## 📊 Example 5: Custom Queries

### **Count workflows by day**

```bash
curl -s http://localhost:5501/hooks/workflows | jq '
  .data | group_by(.startTime / 1000 / 86400 | floor) |
  map({
    date: (.[0].startTime / 1000 | strftime("%Y-%m-%d")),
    count: length
  })
'
```

### **Find workflows with notifications**

```bash
curl -s http://localhost:5501/hooks/workflows | jq '
  .data | map(select(.notifications | length > 0)) |
  length
'
```

### **Get hourly activity pattern**

```bash
curl -s http://localhost:5501/hooks/workflows | jq '
  .data | group_by(.startTime / 1000 / 3600 | floor) |
  map({
    hour: (.[0].startTime / 1000 | strftime("%H:00")),
    count: length
  }) | sort_by(.hour)
'
```

---

## 🎯 When You Run Agents (Future Analysis)

Once you invoke some agents and generate sessions, you'll be able to run:

### **Agent Statistics**

```bash
./tools/analyze-sessions.sh agents
```

**Will show:**
- Which agents you use most
- Agent success rates
- Average execution time per agent

### **Cost Analysis**

```bash
./tools/analyze-sessions.sh tokens
```

**Will show:**
- Total tokens consumed
- Total cost
- Cost per agent
- Cost trends over time

### **Tool Usage**

```bash
./tools/analyze-sessions.sh tools
```

**Will show:**
- Which tools agents use most
- Tool call frequency
- Tool combinations

### **Deliverables**

```bash
./tools/analyze-sessions.sh deliverables
```

**Will show:**
- All files created by agents
- File types generated
- Deliverables per agent

### **Complete Report**

```bash
./tools/analyze-sessions.sh report
```

**Full analysis:** Agents, tokens, tools, success rate, deliverables, performance

---

## 💻 Try These Right Now

### **1. See your workflow overview**
```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI
./tools/analyze-workflows.sh overview
```

### **2. Check recent activity**
```bash
./tools/analyze-workflows.sh recent 10
```

### **3. Export data for external analysis**
```bash
./tools/analyze-workflows.sh export my-workflows.json
cat my-workflows.json | jq '.data | length'
```

### **4. Check system health**
```bash
curl http://localhost:5501/health | jq '.'
```

### **5. View all available hooks**
```bash
curl http://localhost:5501/hooks/config | jq '.data | keys'
```

---

## 🔍 Custom Analysis Template

Create your own analysis:

```bash
#!/bin/bash
# my-analysis.sh

# Get all workflows
WORKFLOWS=$(curl -s http://localhost:5501/hooks/workflows)

# Your custom analysis
echo "$WORKFLOWS" | jq '
  .data |
  # Your jq query here
  group_by(.status) |
  map({status: .[0].status, count: length})
'
```

Make it executable:
```bash
chmod +x my-analysis.sh
./my-analysis.sh
```

---

## 📈 Visualization Ideas

### **Export to CSV for Excel**

```bash
# Create CSV header
echo "ID,Time,Status" > workflows.csv

# Export data
curl -s http://localhost:5501/hooks/workflows | jq -r '
  .data[] |
  [.id, (.startTime / 1000 | strftime("%Y-%m-%d %H:%M:%S")), .status] |
  @csv
' >> workflows.csv

echo "Open workflows.csv in Excel for charts!"
```

### **Terminal Timeline**

```bash
# Show activity by hour
curl -s http://localhost:5501/hooks/workflows | jq -r '
  .data | group_by(.startTime / 1000 / 3600 | floor) |
  .[] |
  (.[0].startTime / 1000 | strftime("%H:00")) as $hour |
  "\($hour): \("█" * (length / 10))"
'
```

---

## 🎓 Learning Exercise

**Challenge:** Find your busiest hour

```bash
curl -s http://localhost:5501/hooks/workflows | jq '
  .data |
  group_by(.startTime / 1000 / 3600 | floor) |
  map({hour: (.[0].startTime / 1000 | strftime("%Y-%m-%d %H:00")), count: length}) |
  sort_by(.count) |
  reverse |
  .[0]
'
```

**Result:** Shows when you used Claude Code most

---

## 🚀 Next Steps

1. **Run the tools** - Try all examples above
2. **Export data** - Save for historical analysis
3. **Invoke agents** - Generate rich session data
4. **Analyze sessions** - Use session analysis tools
5. **Build dashboards** - Create visualizations

---

## ✅ Summary

**Available Now:**
- 451 workflows to analyze
- Hooks server with REST API
- Analysis scripts ready to use
- Export capabilities

**Coming Soon (when you run agents):**
- Session-level analysis
- Tool usage patterns
- Cost tracking
- Performance metrics
- Deliverables reports

**Start here:**
```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI
./tools/analyze-workflows.sh all
```

**That's it! You're ready to analyze workflow data!** 📊
