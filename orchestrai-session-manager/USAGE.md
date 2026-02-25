# Session Manager Usage Guide

## Quick Start

### Installation

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-session-manager
npm install
```

### Set up CLI commands

```bash
# Make CLI executable
chmod +x cli/session-viewer.js

# Add to PATH (optional)
npm link
```

---

## Basic Usage

### 1. Capture Sessions Automatically

The easiest way to use Session Manager is to wrap your Task tool invocations:

```javascript
const SessionManager = require('./orchestrai-session-manager');
const sessionManager = new SessionManager();

// In orchestrai-master-coordinator or any agent invoker:
async function invokeAgent() {
  // Start session
  const { sessionId } = await sessionManager.invokeWithCapture({
    subagent_type: 'content-writer-specialist',
    description: 'Article creation',
    prompt: 'Write article about dental implants...',
    model: 'sonnet'
  }, {
    projectContext: {
      clientId: 'client-123',
      projectId: 'proj-456'
    }
  });

  // Execute Task tool here
  const result = await Task({
    subagent_type: 'content-writer-specialist',
    description: 'Article creation',
    prompt: 'Write article...'
  });

  // Complete session
  await sessionManager.completeSession(sessionId, result);

  console.log(`✅ Session complete: ${sessionId}`);
}
```

### 2. View Sessions

```bash
# View recent sessions
orchestrai-session list

# View specific session
orchestrai-session view ses-2026-02-12-abc123

# View transcript
orchestrai-session transcript ses-2026-02-12-abc123

# View deliverables
orchestrai-session deliverables ses-2026-02-12-abc123
```

### 3. Search Sessions

```bash
# Find session that created a file
orchestrai-session find-by-file /projects/client-123/article.md

# View related sessions
orchestrai-session related ses-2026-02-12-abc123

# View statistics
orchestrai-session stats
```

---

## Integration with orchestrai-master-coordinator

### Step 1: Import Session Manager

```javascript
// In orchestrai-master-coordinator.md
const SessionManager = require('../orchestrai-session-manager');
const sessionManager = new SessionManager();
```

### Step 2: Wrap Agent Invocations

```javascript
// Before (existing pattern)
async function invokeAgent(agentType, prompt, context) {
  const result = await Task({
    subagent_type: agentType,
    description: 'Agent execution',
    prompt: prompt
  });

  return result;
}

// After (with session capture)
async function invokeAgent(agentType, prompt, context) {
  // Start session
  const { sessionId } = await sessionManager.invokeWithCapture({
    subagent_type: agentType,
    description: 'Agent execution',
    prompt: prompt
  }, {
    projectContext: context
  });

  // Execute agent
  const result = await Task({
    subagent_type: agentType,
    description: 'Agent execution',
    prompt: prompt
  });

  // Complete session
  await sessionManager.completeSession(sessionId, {
    ...result,
    deliverables: result.deliverables || []
  });

  // Return result with session ID
  return {
    ...result,
    sessionId
  };
}
```

### Step 3: Link Deliverables

```javascript
// After creating files, link them to session
async function createArticle(sessionId) {
  const articlePath = '/projects/client-123/deliverables/content/article.md';

  // Create file...

  // Link to session
  await sessionManager.linkDeliverable(sessionId, {
    path: articlePath,
    type: 'content',
    size: fs.statSync(articlePath).size
  });
}
```

---

## Advanced Features

### Resume Sessions

```javascript
// Resume from specific point
const sessionId = 'ses-2026-02-12-abc123';

const resumeContext = await sessionManager.resumeSession(sessionId, {
  resumePoint: 15,
  prompt: 'Continue but focus more on recovery process...'
});

// Use resumeContext to invoke agent with prior context
const result = await Task({
  subagent_type: resumeContext.agent.type,
  description: 'Resuming session',
  prompt: await sessionManager.resumption.generateResumePrompt(sessionId, {
    prompt: 'Continue but focus more on recovery process...'
  })
});
```

### Fork Sessions

```javascript
// Fork to explore alternative approach
const forkContext = await sessionManager.forkSession(sessionId, {
  forkPoint: 15,
  prompt: 'Try a different approach focusing on cost...',
  reason: 'Exploring cost-focused alternative'
});

// Invoke agent with fork context
const result = await Task({
  subagent_type: forkContext.agent.type,
  description: 'Forked session',
  prompt: await sessionManager.resumption.generateForkPrompt(sessionId, {
    prompt: 'Try a different approach focusing on cost...'
  })
});

// Compare forks later
const comparison = await sessionManager.resumption.compareForks([
  sessionId,
  forkContext.sessionId
]);

console.log('Comparison:', comparison);
```

### Search & Analytics

```javascript
// Get agent performance metrics
const performance = await sessionManager.retrieval.getAgentPerformance(
  'content-writer-specialist'
);

console.log(`Success rate: ${performance.successRate.toFixed(1)}%`);
console.log(`Average cost: $${performance.averageCost.toFixed(4)}`);

// Find sessions needing review
const needReview = await sessionManager.retrieval.getNeedingReview(10);

for (const session of needReview) {
  console.log(`Review needed: ${session.sessionId}`);
}
```

---

## CLI Commands

### View Commands

```bash
# View session
orchestrai-session view <session-id>

# View transcript
orchestrai-session transcript <session-id>

# View deliverables
orchestrai-session deliverables <session-id>
```

### List Commands

```bash
# List recent sessions (default: 20)
orchestrai-session list

# List more sessions
orchestrai-session list 50
```

### Search Commands

```bash
# Find by deliverable
orchestrai-session find-by-file /path/to/file.md

# View related sessions
orchestrai-session related <session-id>

# View resume points
orchestrai-session resume-points <session-id>

# View forks
orchestrai-session forks <session-id>
```

### Stats Commands

```bash
# View statistics
orchestrai-session stats
```

---

## Configuration

### Environment Variables

```bash
# Storage
export SESSION_STORAGE_TYPE=file
export SESSION_STORAGE_PATH=/Users/kris/CLAUDEtools/ORCHESTRAI/sessions

# Capture
export SESSION_TRANSCRIPT_DETAIL=full
export SESSION_CAPTURE_THINKING=true
export SESSION_CAPTURE_TOOL_CALLS=true

# Viewer
export SESSION_VIEWER_PORT=5502
export SESSION_VIEWER_COLORIZE=true
```

### Custom Configuration

```javascript
const sessionManager = new SessionManager({
  storage: {
    basePath: '/custom/path/to/sessions',
    compression: {
      enabled: true,
      olderThan: 30
    }
  },
  capture: {
    transcriptDetail: 'full',
    captureThinking: true
  }
});
```

---

## Best Practices

### 1. Always Capture Sessions

Wrap all agent invocations with session capture to maintain full transparency.

### 2. Link Deliverables Immediately

Link files to sessions as soon as they're created for easy traceability.

### 3. Add Meaningful Tags

Use tags to categorize sessions for easier searching:

```javascript
await sessionManager.startSession({
  agentType: 'content-writer-specialist',
  prompt: '...',
  tags: ['content', 'healthcare', 'article', 'urgent']
});
```

### 4. Review Failed Sessions

Regularly check failed sessions to identify patterns:

```bash
orchestrai-session list | grep failed
```

### 5. Use Resume Points

Add resume points during long-running sessions:

```javascript
await sessionManager.capture.addResumePoint(sessionId, {
  description: 'After outline review, before writing',
  canForkFrom: true
});
```

---

## Troubleshooting

### Session Not Found

```bash
# Verify session exists
orchestrai-session list | grep ses-2026-02-12-abc123

# Check storage path
ls /Users/kris/CLAUDEtools/ORCHESTRAI/sessions/2026/02/
```

### Storage Issues

```javascript
// Check storage stats
const stats = await sessionManager.getStats();
console.log('Total sessions:', stats.totalSessions);

// Verify base path exists
const fs = require('fs');
const basePath = '/Users/kris/CLAUDEtools/ORCHESTRAI/sessions';
console.log('Path exists:', fs.existsSync(basePath));
```

### Performance Issues

```javascript
// Enable compression for old sessions
const config = {
  storage: {
    compression: {
      enabled: true,
      olderThan: 30 // days
    }
  }
};
```

---

## Examples

See `examples/integration-example.js` for complete working examples.

```bash
# Run all examples
node examples/integration-example.js

# Or run individual examples
node -e "require('./examples/integration-example').example1_BasicCapture()"
```

---

## Next Steps

1. ✅ Integrate with orchestrai-master-coordinator
2. ⏳ Add to parallel execution pattern
3. ⏳ Build web UI viewer
4. ⏳ Add GitHub PR linking
5. ⏳ Add Slack notifications
