# System Status Overview

**Usage**: `/status`

Provide a comprehensive overview of the ORCHESTRAI system status and health.

## Status Check Components

### 1. Project Overview
- Total active client projects
- Recent projects (last 7 days)
- Total deliverables generated
- Storage usage analysis

### 2. Agent Performance
- Most used agents (top 10)
- Recently created agents
- Agent success rates
- Average task completion time

### 3. System Health
- [ ] Redis connectivity (if applicable)
- [ ] Memory system integrity
- [ ] File organization compliance
- [ ] Template system health
- [ ] API key configuration status

### 4. Recent Activity
- Last 10 significant actions
- Error summary (last 24 hours)
- Pipeline executions today
- Content pieces created this week

### 5. Optimization Opportunities
Identify:
- Unused agents that could be removed
- Duplicate deliverables across projects
- Missing global templates that should be created
- Pipeline automation opportunities

## Output Format

```
🤖 ORCHESTRAI System Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 PROJECTS
   Active: [count]
   Total Deliverables: [count]
   Storage: [size]

🎯 AGENTS
   Total: [count]
   Most Used: [agent-name] ([count] uses)
   Success Rate: [percentage]%

💚 SYSTEM HEALTH
   [✅/⚠️/❌] Memory System
   [✅/⚠️/❌] File Organization
   [✅/⚠️/❌] API Configuration

📈 ACTIVITY (24h)
   Tasks: [count]
   Errors: [count]
   Pipelines: [count]

🎯 RECOMMENDATIONS
   [Priority-ranked improvement suggestions]
```

## Health Scoring
- 🟢 95-100: Excellent - System optimal
- 🟡 80-94: Good - Minor optimizations available
- 🟠 60-79: Fair - Attention needed
- 🔴 <60: Poor - Immediate action required
