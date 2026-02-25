# Quick Start Guide - ORCHESTRAI Trigger System

Get up and running with autonomous agent execution in 5 minutes!

---

## 🚀 Step 1: Start the Server (2 minutes)

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-trigger-system

# Dependencies already installed ✅
npm start
```

You should see:
```
🚀 Starting ORCHESTRAI Trigger System...
✅ Session Manager loaded - sessions will be captured
✅ Queue manager started
✅ Webhook server listening on 0.0.0.0:5502
   GitHub webhooks: http://localhost:5502/webhooks/github
   Generic webhooks: http://localhost:5502/webhooks/generic
   API: http://localhost:5502/api/triggers
✅ Example triggers registered
🎉 Trigger system ready!
```

**✅ Server is running!**

---

## 🎯 Step 2: Test It (2 minutes)

### **Option A: Test with Example Script**

```bash
# In a new terminal
cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-trigger-system
npm test
```

This runs the test suite and shows you all features in action.

### **Option B: Test via API**

```bash
# Check system status
curl http://localhost:5502/health

# View triggers
curl http://localhost:5502/api/triggers

# View stats
curl http://localhost:5502/api/stats
```

**✅ System is working!**

---

## 🔔 Step 3: Create Your First Trigger (1 minute)

### **Example: Auto-Review PRs**

```bash
curl -X POST http://localhost:5502/api/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "id": "my-first-trigger",
    "name": "Auto Review PRs",
    "type": "github",
    "event": "github.pull_request.opened",
    "agent": "content-writer-specialist",
    "promptTemplate": "Review PR: {{event.data.pullRequest.title}}",
    "priority": "high"
  }'
```

**✅ Trigger created!**

---

## ⏰ Step 4: Schedule a Cron Job (Optional)

### **Example: Daily Test at 9 AM**

```bash
curl -X POST http://localhost:5502/api/cron/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "id": "daily-test",
    "name": "Daily Test Job",
    "schedule": "daily at 9:00",
    "agent": "content-title-generator",
    "parameters": {
      "topic": "AI Automation"
    },
    "enabled": false
  }'
```

**✅ Cron job scheduled (disabled for now)!**

---

## 🌐 Step 5: Configure Real GitHub Webhooks (Optional)

If you want to use GitHub triggers:

1. **Expose your local server** (for development):
   ```bash
   # Using ngrok (install first: brew install ngrok)
   ngrok http 5502

   # Copy the https URL (e.g., https://abc123.ngrok.io)
   ```

2. **Configure in GitHub**:
   - Go to your repository → Settings → Webhooks
   - Click "Add webhook"
   - URL: `https://your-ngrok-url/webhooks/github`
   - Content type: `application/json`
   - Events: Select "Pull requests" or "Let me select individual events"
   - Click "Add webhook"

3. **Open a PR and watch**:
   - The trigger will fire automatically
   - Check console output
   - View captured session:
   ```bash
   node ../orchestrai-session-manager/cli/session-viewer.js list
   ```

**✅ GitHub integration working!**

---

## 📊 Monitor Activity

### **Check Queue Status**

```bash
curl http://localhost:5502/api/queue/status
```

### **View Statistics**

```bash
curl http://localhost:5502/api/stats
```

### **View Captured Sessions**

```bash
# From ORCHESTRAI root directory
node orchestrai-session-manager/cli/session-viewer.js list

# View specific session
node orchestrai-session-manager/cli/session-viewer.js view ses-2026-02-12-abc123
```

---

## 🎯 Next Steps

### **1. Create Production Triggers**

Edit `config/triggers.yaml` with your real triggers:
- GitHub PR reviews
- Daily SEO audits
- Content processing
- Monitoring jobs

### **2. Deploy to Production**

```bash
# Using PM2
pm2 start server.js --name "orchestrai-triggers"
pm2 save
pm2 startup

# Using Docker
docker build -t orchestrai-triggers .
docker run -d -p 5502:5502 orchestrai-triggers
```

### **3. Configure Monitoring**

Set up monitoring for:
- Server health (`/health` endpoint)
- Queue status
- Failed jobs
- Session capture

---

## 🆘 Troubleshooting

### **Server won't start**

```bash
# Check if port is in use
lsof -i :5502

# Use different port
TRIGGER_PORT=5503 npm start
```

### **Session Manager not loading**

```bash
# Install session manager dependencies
cd ../orchestrai-session-manager
npm install
```

### **Triggers not firing**

```bash
# Check trigger list
curl http://localhost:5502/api/triggers

# Check if trigger is enabled
curl http://localhost:5502/api/triggers | jq '.triggers[] | select(.enabled == true)'

# Check logs
# Look for "🔔 Trigger activated" messages in console
```

---

## 💡 Pro Tips

1. **Use natural language for cron**:
   - "every hour" is easier than "0 * * * *"
   - "daily at 6:00" is clearer than "0 6 * * *"

2. **Use conditions to filter**:
   - Only trigger for main branch PRs
   - Only process large files
   - Only specific repositories

3. **Set appropriate priorities**:
   - critical: Security alerts
   - high: PR reviews, customer requests
   - normal: Content creation
   - low: Analytics, cleanup

4. **Monitor sessions**:
   - Every triggered execution is captured
   - Use session viewer to debug issues
   - Track agent performance over time

---

## 📚 Learn More

- **Full Documentation**: `README.md`
- **Integration Guide**: `PHASE2-INTEGRATION-COMPLETE.md`
- **Example Triggers**: `config/triggers.example.yaml`
- **Test Examples**: `examples/test-triggers.js`

---

**You're all set! 🎉**

The trigger system is running and ready to execute agents autonomously!
