# ORCHESTRAI Trigger System

**Autonomous agent scheduling and event-driven execution for ORCHESTRAI**

Enable agents to work asynchronously based on events, schedules, and external triggers. This is the foundation for "Agent-Native SDLC" where agents work continuously at every stage.

---

## 🎯 What This Enables

### **Agent-Native SDLC** - Continuous Autonomous Operation

```
┌─────────────────────────────────────────────────────────┐
│  GitHub PR opened  →  Auto code review agent executes   │
│  Cron: 6 AM daily  →  SEO audit agent executes          │
│  File uploaded     →  Content validation agent executes │
│  Webhook received  →  Custom agent executes             │
└─────────────────────────────────────────────────────────┘
```

Agents work **autonomously** without manual invocation:
- ✅ Review every PR automatically
- ✅ Run audits on schedule
- ✅ Process files as they arrive
- ✅ Respond to webhooks in real-time

---

## 🚀 Quick Start

### **1. Installation**

```bash
cd orchestrai-trigger-system
npm install
```

### **2. Start Server**

```bash
npm start
```

Output:
```
🚀 Starting ORCHESTRAI Trigger System...
✅ Queue manager started
✅ Webhook server listening on 0.0.0.0:5502
   GitHub webhooks: http://localhost:5502/webhooks/github
   Generic webhooks: http://localhost:5502/webhooks/generic
   API: http://localhost:5502/api/triggers
🎉 Trigger system ready!
```

### **3. Register Your First Trigger**

```javascript
// Via API
curl -X POST http://localhost:5502/api/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "auto-review-prs",
    "type": "github",
    "event": "github.pull_request.opened",
    "agent": "code-review-specialist",
    "promptTemplate": "Review PR: {{event.data.pullRequest.title}}",
    "priority": "high"
  }'
```

### **4. Schedule a Cron Job**

```javascript
// Via API
curl -X POST http://localhost:5502/api/cron/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "id": "daily-seo-audit",
    "name": "Daily SEO Audit",
    "schedule": "daily at 6:00",
    "agent": "seo-technical-analysis",
    "parameters": {
      "domain": "example.com"
    }
  }'
```

---

## 📋 Core Features

### **1. Event-Based Triggers**

React to external events:

```javascript
const TriggerSystem = require('./orchestrai-trigger-system');

const system = new TriggerSystem();
await system.start();

// GitHub events
system.registerTrigger({
  id: 'pr-review',
  type: 'github',
  event: 'github.pull_request.opened',
  agent: 'code-review-specialist',
  priority: 'high'
});

// Generic webhooks
system.registerTrigger({
  id: 'contact-form',
  type: 'webhook',
  event: 'webhook.contact-form',
  agent: 'client-icp-analyst'
});

// Filesystem changes
system.watch({
  id: 'process-uploads',
  path: '/uploads',
  events: ['add'],
  agent: 'content-validator'
});
```

### **2. Cron Scheduling**

Time-based execution:

```javascript
// Natural language
system.schedule({
  id: 'hourly-check',
  schedule: 'every hour',
  agent: 'monitoring-agent'
});

system.schedule({
  id: 'daily-audit',
  schedule: 'daily at 6:00',
  agent: 'seo-technical-analysis'
});

system.schedule({
  id: 'weekly-report',
  schedule: 'weekly',
  agent: 'analytics-reporter'
});

// Cron expression
system.schedule({
  id: 'custom-schedule',
  schedule: '*/30 * * * *', // Every 30 minutes
  agent: 'custom-agent'
});
```

### **3. Priority Queue**

Control execution priority:

```javascript
// Critical - Executes first
{
  priority: 'critical',
  agent: 'security-alert-handler'
}

// High - Important but not urgent
{
  priority: 'high',
  agent: 'pr-review-specialist'
}

// Normal - Standard priority
{
  priority: 'normal',
  agent: 'content-writer'
}

// Low - Background tasks
{
  priority: 'low',
  agent: 'analytics-processor'
}
```

### **4. Conditional Triggers**

Trigger only when conditions are met:

```javascript
system.registerTrigger({
  id: 'main-branch-only',
  type: 'github',
  event: 'github.pull_request.opened',

  // Only trigger for PRs to main branch
  condition: 'data.pullRequest.base.ref === "main"',

  agent: 'strict-code-reviewer'
});

system.registerTrigger({
  id: 'large-files',
  type: 'filesystem',
  event: 'filesystem.add',

  // Only trigger for files > 1MB
  condition: 'data.stats.size > 1048576',

  agent: 'file-optimizer'
});
```

### **5. Parameter Extraction**

Extract data from events:

```javascript
system.registerTrigger({
  id: 'pr-analyzer',
  type: 'github',
  event: 'github.pull_request.opened',
  agent: 'code-analyzer',

  // Extract parameters from event
  parameterExtraction: {
    repository: 'data.repository.fullName',
    prNumber: 'data.pullRequest.number',
    author: 'data.pullRequest.author',
    title: 'data.pullRequest.title'
  },

  // Use in prompt template
  promptTemplate: `
    Analyze PR #{{parameters.prNumber}} in {{parameters.repository}}
    Title: {{parameters.title}}
    Author: {{parameters.author}}
  `
});
```

---

## 🔌 Supported Events

### **GitHub Events**

- `github.pull_request.opened`
- `github.pull_request.closed`
- `github.pull_request.reopened`
- `github.pull_request.synchronize`
- `github.push`
- `github.issues.opened`
- `github.issues.closed`
- `github.issue_comment`
- `github.pull_request_review`
- `github.workflow_run`

**Setup:**
```bash
# Configure webhook in GitHub:
# URL: http://your-server:5502/webhooks/github
# Content type: application/json
# Events: Select events you want
```

### **Filesystem Events**

- `filesystem.add` - File added
- `filesystem.change` - File modified
- `filesystem.unlink` - File deleted

**Example:**
```javascript
system.watch({
  id: 'content-processor',
  path: '/projects/*/content',
  events: ['add', 'change'],
  ignored: /(^|[\/\\])\../ // Ignore hidden files
});
```

### **Webhook Events**

- `webhook.*` - Generic webhooks

**Example:**
```bash
curl -X POST http://your-server:5502/webhooks/generic?id=my-webhook \
  -H "Content-Type: application/json" \
  -d '{"data": "your payload"}'
```

### **Cron Events**

- `cron.scheduled` - Scheduled execution

**Natural Language:**
- `"every hour"` → `0 * * * *`
- `"every 30 minutes"` → `*/30 * * * *`
- `"daily"` → `0 0 * * *`
- `"daily at 9:00"` → `0 9 * * *`
- `"weekly"` → `0 0 * * 0`
- `"weekdays"` → `0 9 * * 1-5`
- `"monthly"` → `0 0 1 * *`

---

## 🎨 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Trigger System                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────┐│
│  │   Webhook    │     │     Cron     │     │ Filesystem  ││
│  │   Server     │────▶│  Scheduler   │────▶│  Watcher    ││
│  └──────────────┘     └──────────────┘     └─────────────┘│
│         │                    │                    │         │
│         └────────────────────┼────────────────────┘         │
│                              ▼                               │
│                    ┌──────────────────┐                     │
│                    │  Trigger Engine  │                     │
│                    │  (Event Router)  │                     │
│                    └──────────────────┘                     │
│                              │                               │
│                              ▼                               │
│                    ┌──────────────────┐                     │
│                    │  Queue Manager   │                     │
│                    │  (Priority Queue)│                     │
│                    └──────────────────┘                     │
│                              │                               │
│                              ▼                               │
│                    ┌──────────────────┐                     │
│                    │ Session Bridge   │                     │
│                    │ (Agent Invoker)  │                     │
│                    └──────────────────┘                     │
│                              │                               │
│                              ▼                               │
│                    ┌──────────────────┐                     │
│                    │ Session Manager  │                     │
│                    │ (Capture & Log)  │                     │
│                    └──────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 API Reference

### **REST API Endpoints**

#### **GET /health**
Health check

```bash
curl http://localhost:5502/health
```

#### **GET /api/triggers**
List all triggers

```bash
curl http://localhost:5502/api/triggers
```

#### **POST /api/triggers**
Create trigger

```bash
curl -X POST http://localhost:5502/api/triggers \
  -H "Content-Type: application/json" \
  -d '{ "id": "...", "type": "...", ... }'
```

#### **DELETE /api/triggers/:id**
Delete trigger

```bash
curl -X DELETE http://localhost:5502/api/triggers/my-trigger
```

#### **GET /api/cron/jobs**
List cron jobs

```bash
curl http://localhost:5502/api/cron/jobs
```

#### **POST /api/cron/jobs**
Create cron job

```bash
curl -X POST http://localhost:5502/api/cron/jobs \
  -H "Content-Type: application/json" \
  -d '{ "id": "...", "schedule": "...", ... }'
```

#### **GET /api/queue/status**
Queue status

```bash
curl http://localhost:5502/api/queue/status
```

#### **GET /api/stats**
System statistics

```bash
curl http://localhost:5502/api/stats
```

---

## 🔧 Configuration

### **Environment Variables**

```bash
# Server port
TRIGGER_PORT=5502

# Maximum concurrent jobs
MAX_CONCURRENT=5

# GitHub webhook secret
GITHUB_WEBHOOK_SECRET=your-secret-here

# Timezone for cron jobs
TZ=America/New_York
```

### **Programmatic Configuration**

```javascript
const TriggerSystem = require('./orchestrai-trigger-system');

const system = new TriggerSystem({
  port: 5502,
  maxConcurrent: 5,
  sessionManager: mySessionManager // Optional
});
```

---

## 📊 Integration with Session Manager

The trigger system automatically integrates with the Session Manager:

```javascript
const SessionManager = require('../orchestrai-session-manager');
const TriggerSystem = require('../orchestrai-trigger-system');

// Create session manager
const sessionManager = new SessionManager();

// Create trigger system with session manager
const triggerSystem = new TriggerSystem({
  sessionManager
});

await triggerSystem.start();

// Now all triggered agent executions are captured automatically!
```

Every triggered agent execution:
- ✅ Gets unique session ID
- ✅ Full transcript captured
- ✅ Linked to trigger that caused it
- ✅ Searchable by trigger type
- ✅ Resume/fork capabilities

---

## 🧪 Testing

```bash
# Run test suite
npm test

# Start in development mode (with auto-reload)
npm run dev
```

---

## 📚 Examples

See `examples/` directory for:
- `test-triggers.js` - Complete test suite
- `github-integration.js` - GitHub webhook examples
- `cron-examples.js` - Cron scheduling examples
- `filesystem-examples.js` - File watching examples

---

## 🚀 Production Deployment

### **Docker**

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 5502
CMD ["node", "server.js"]
```

```bash
docker build -t orchestrai-triggers .
docker run -p 5502:5502 orchestrai-triggers
```

### **Process Manager (PM2)**

```bash
pm2 start server.js --name "orchestrai-triggers"
pm2 save
pm2 startup
```

---

## 🎯 Use Cases

### **1. Continuous Code Review**
Auto-review every PR as soon as it's opened

### **2. Scheduled Monitoring**
Daily SEO audits, performance checks, uptime monitoring

### **3. Content Pipeline**
Auto-process content as files are uploaded

### **4. Customer Support**
Auto-triage support tickets and contact forms

### **5. Security Alerts**
Immediate response to security events

### **6. Analytics & Reporting**
Scheduled reports and insights generation

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Webhook latency** | <50ms |
| **Queue throughput** | 5+ concurrent jobs |
| **Trigger evaluation** | <10ms |
| **Max triggers** | Unlimited |
| **Max cron jobs** | Unlimited |

---

## 🔐 Security

- ✅ Webhook signature verification (GitHub, custom)
- ✅ Rate limiting (configurable)
- ✅ Sanitized headers (removes auth tokens)
- ✅ Condition sandboxing (safe evaluation)

---

## 🤝 Contributing

This is part of the ORCHESTRAI system. See main repository for contribution guidelines.

---

## 📄 License

MIT

---

**Status**: ✅ Phase 2 Complete - Production Ready
**Integration**: Session Manager, ORCHESTRAI Master Coordinator
**Next**: Phase 3 (Team-Wide Automation)
