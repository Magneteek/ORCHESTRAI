# ORCHESTRAI Session Manager

**Agent Session Transparency & Recoverability System**

Inspired by Warp Oz's session transparency model, this system captures every agent invocation with full execution context, enabling session replay, debugging, forking, and seamless handoff.

---

## Core Capabilities

### 1. **Session Capture**
- Unique session ID for every agent invocation
- Full conversation transcript (prompts, reasoning, outputs)
- All tool calls with parameters and results
- Timing and performance metrics
- Error states and recovery points

### 2. **Session Storage**
- File-based storage (JSON) with optional PostgreSQL backend
- Hierarchical structure: `/sessions/{year}/{month}/{sessionId}/`
- Automatic compression for old sessions
- Retention policies (configurable)

### 3. **Session Linking**
- Link deliverables to sessions
- Link sessions to projects/clients
- Link related sessions (parent/child, forked sessions)
- Bidirectional references

### 4. **Session Replay**
- View full agent execution step-by-step
- See exactly what the agent saw and decided
- Understand reasoning at each step
- Identify where issues occurred

### 5. **Session Resumption**
- Resume from any point in session
- Fork sessions to explore alternatives
- Continue incomplete work
- Handoff between cloud and local

### 6. **Session Viewer**
- Web UI for browsing sessions
- CLI tool for quick inspection
- Integration with Claude Code
- Search and filter capabilities

---

## Architecture

```
orchestrai-session-manager/
├── core/
│   ├── session-capture.js       # Middleware for capturing sessions
│   ├── session-storage.js       # Storage abstraction layer
│   ├── session-retrieval.js     # Query and retrieval API
│   └── session-resumption.js    # Resume/fork functionality
├── storage/
│   ├── file-storage.js          # File-based storage implementation
│   ├── postgres-storage.js      # PostgreSQL storage (optional)
│   └── compression.js           # Compression for old sessions
├── viewer/
│   ├── web/                     # Web UI (Express + React)
│   │   ├── server.js
│   │   ├── frontend/
│   │   └── api/
│   └── cli/                     # CLI viewer
│       └── session-viewer.js
├── integration/
│   ├── claude-code-hook.js      # Integration with Claude Code
│   ├── task-tool-wrapper.js     # Task tool enhancement
│   └── deliverable-linker.js    # Link deliverables to sessions
├── api/
│   ├── session-api.js           # REST API for sessions
│   └── graphql-schema.js        # GraphQL API (optional)
└── utils/
    ├── session-id-generator.js
    ├── transcript-parser.js
    └── retention-policy.js
```

---

## Session Schema

```javascript
{
  // Identity
  sessionId: "ses-2026-02-12-abc123",
  parentSessionId: null, // For forked sessions
  forkedFrom: null, // Original session if this is a fork

  // Metadata
  timestamp: "2026-02-12T14:30:00.000Z",
  duration: 1850000, // milliseconds
  status: "completed", // pending, in_progress, completed, failed, cancelled

  // Agent Information
  agent: {
    type: "content-writer-specialist",
    model: "claude-sonnet-4.5",
    complexity_tier: 7,
    tools: ["Read", "Write", "Edit", "Glob", "Grep", "WebSearch"]
  },

  // Execution Context
  invocation: {
    prompt: "Write comprehensive article about dental implants...",
    parameters: {
      description: "Article creation",
      model: "sonnet"
    },
    invokedBy: "orchestrai-master-coordinator",
    projectContext: {
      clientId: "client-123",
      projectId: "proj-456",
      domain: "healthcare-content"
    }
  },

  // Full Transcript
  transcript: [
    {
      role: "user",
      content: "Write comprehensive article...",
      timestamp: "2026-02-12T14:30:00.000Z"
    },
    {
      role: "assistant",
      content: "I'll create a comprehensive article...",
      thinking: "The user wants...",
      timestamp: "2026-02-12T14:30:05.000Z"
    },
    {
      role: "tool_use",
      tool: "Read",
      parameters: { file_path: "/outline.md" },
      result: "...",
      timestamp: "2026-02-12T14:30:10.000Z"
    },
    // ... more transcript entries
  ],

  // Tool Calls Summary
  toolCalls: [
    {
      tool: "Read",
      count: 5,
      totalDuration: 250,
      files: ["outline.md", "requirements.md", "style-guide.md"]
    },
    {
      tool: "Write",
      count: 2,
      totalDuration: 100,
      files: ["article.md", "meta.json"]
    }
  ],

  // Outputs & Deliverables
  outputs: {
    files: [
      {
        path: "/projects/client-123/deliverables/content/article.md",
        size: 15420,
        type: "content",
        created: "2026-02-12T14:45:00.000Z"
      }
    ],
    data: {
      wordCount: 2850,
      aiDetectionScore: 0.24,
      readabilityScore: 82
    }
  },

  // Performance Metrics
  metrics: {
    totalTokens: 45000,
    inputTokens: 12000,
    outputTokens: 33000,
    cost: 0.45,
    thinkingTime: 8500,
    executionTime: 1850000
  },

  // Errors & Warnings
  errors: [],
  warnings: [
    {
      type: "ai_detection_threshold",
      message: "AI detection score 24% (target <30%)",
      timestamp: "2026-02-12T14:44:00.000Z"
    }
  ],

  // Resumption Data
  resumable: true,
  resumePoints: [
    {
      step: 15,
      description: "After outline review, before writing",
      canForkFrom: true
    },
    {
      step: 45,
      description: "After first draft, before quality checks",
      canForkFrom: true
    }
  ],

  // Linking
  links: {
    project: "proj-456",
    client: "client-123",
    relatedSessions: ["ses-abc122", "ses-abc124"],
    deliverables: [
      "/projects/client-123/deliverables/content/article.md"
    ],
    prLinks: [], // GitHub PR links if applicable
    issueLinks: [] // Linear/GitHub issue links
  },

  // Metadata
  tags: ["content", "healthcare", "article"],
  searchable: true,
  archived: false,
  compressed: false
}
```

---

## Usage Examples

### 1. Capture Session Automatically

```javascript
// In orchestrai-master-coordinator or any agent invoker
const SessionManager = require('./orchestrai-session-manager/core/session-capture');

// Wrap Task tool invocation
const session = await SessionManager.startSession({
  agentType: 'content-writer-specialist',
  prompt: 'Write article about dental implants...',
  projectContext: {
    clientId: 'client-123',
    projectId: 'proj-456'
  }
});

// Execute agent (existing Task tool call)
const result = await Task({
  subagent_type: 'content-writer-specialist',
  description: 'Article creation',
  prompt: 'Write article...',
  sessionId: session.id // Pass session ID
});

// Finalize session
await SessionManager.endSession(session.id, {
  status: 'completed',
  outputs: result.outputs,
  deliverables: ['/path/to/article.md']
});
```

### 2. View Session

```bash
# CLI viewer
npm run session:view ses-2026-02-12-abc123

# Web viewer
npm run session:viewer
# Open http://localhost:5502/session/ses-2026-02-12-abc123
```

### 3. Resume Session

```javascript
// Resume from specific point
const session = await SessionManager.resumeSession('ses-abc123', {
  resumePoint: 15,
  newPrompt: 'Continue but focus more on recovery process...'
});

// Fork session to explore alternative
const forkedSession = await SessionManager.forkSession('ses-abc123', {
  forkPoint: 15,
  newPrompt: 'Try a different approach focusing on cost...'
});
```

### 4. Link Deliverables

```javascript
// Automatically link when creating files
await SessionManager.linkDeliverable(sessionId, {
  path: '/projects/client-123/deliverables/content/article.md',
  type: 'content',
  metadata: { wordCount: 2850 }
});

// Later, find which session created a file
const session = await SessionManager.findSessionByDeliverable(
  '/projects/client-123/deliverables/content/article.md'
);
```

### 5. Search Sessions

```javascript
// Find sessions by agent type
const sessions = await SessionManager.search({
  agentType: 'content-writer-specialist',
  dateRange: { start: '2026-02-01', end: '2026-02-12' },
  status: 'completed',
  projectId: 'proj-456'
});

// Find sessions by deliverable
const sessions = await SessionManager.search({
  deliverable: '/projects/client-123/deliverables/content/article.md'
});

// Find related sessions
const related = await SessionManager.findRelated('ses-abc123');
```

---

## Integration with Claude Code

### Hook Installation

```javascript
// In .claude/hooks/session-capture.js
module.exports = {
  name: 'session-capture',
  events: ['task-start', 'task-complete', 'task-error'],

  async onTaskStart(context) {
    const session = await SessionManager.startSession({
      agentType: context.subagent_type,
      prompt: context.prompt,
      invokedBy: 'user'
    });

    context.sessionId = session.id;
    return { sessionId: session.id };
  },

  async onTaskComplete(context, result) {
    await SessionManager.endSession(context.sessionId, {
      status: 'completed',
      outputs: result
    });
  },

  async onTaskError(context, error) {
    await SessionManager.endSession(context.sessionId, {
      status: 'failed',
      error: error.message
    });
  }
};
```

---

## API Endpoints

### REST API

```
GET    /api/sessions                    # List sessions
GET    /api/sessions/:id                # Get session details
GET    /api/sessions/:id/transcript     # Get full transcript
GET    /api/sessions/:id/deliverables   # Get linked deliverables
POST   /api/sessions/:id/resume         # Resume session
POST   /api/sessions/:id/fork           # Fork session
GET    /api/sessions/search             # Search sessions
GET    /api/deliverables/:path/session  # Find session by deliverable
```

### CLI Commands

```bash
# View session
orchestrai session view <session-id>

# List recent sessions
orchestrai session list --limit 10

# Search sessions
orchestrai session search --agent content-writer-specialist --date 2026-02-12

# Resume session
orchestrai session resume <session-id> --prompt "Continue with..."

# Fork session
orchestrai session fork <session-id> --prompt "Try different approach..."

# Find session by file
orchestrai session find-by-file /path/to/article.md

# Export session
orchestrai session export <session-id> --format json --output session.json
```

---

## Benefits

### 1. **No Black Box Execution**
- See exactly what every agent did and why
- Understand decision-making process
- Identify bottlenecks and issues

### 2. **Debugging & Troubleshooting**
- Replay sessions to understand failures
- See tool calls and their results
- Track down where things went wrong

### 3. **Knowledge Transfer**
- New team members can study successful sessions
- Learn best practices from agent execution
- Understand domain-specific patterns

### 4. **Compliance & Audit**
- Full audit trail of agent actions
- Compliance with governance requirements
- Attribution and cost tracking

### 5. **Continuous Improvement**
- Analyze successful vs. failed sessions
- Identify patterns for agent optimization
- Train future agents on historical data

### 6. **Seamless Handoff**
- Engineers continue where agents left off
- No context loss
- Collaborative human-agent workflows

---

## Roadmap

### Phase 1 (Week 1): Core Infrastructure ✅
- Session ID generation
- Session capture middleware
- File-based storage
- Basic session retrieval

### Phase 2 (Week 1-2): Session Viewer
- CLI viewer
- Web UI (basic)
- Transcript viewer
- Deliverable linking

### Phase 3 (Week 2): Resumption & Forking
- Resume from session ID
- Fork sessions
- Cloud-to-local handoff
- Resume point identification

### Phase 4 (Week 2-3): Advanced Features
- Search and filtering
- Analytics dashboard integration
- Compression and archival
- Performance optimization

### Phase 5 (Week 3-4): Production Readiness
- PostgreSQL backend (optional)
- API rate limiting
- Security and access control
- Documentation and examples

---

## Configuration

```javascript
// orchestrai-session-manager/config/default.js
module.exports = {
  storage: {
    type: 'file', // 'file' or 'postgres'
    basePath: '/Users/kris/CLAUDEtools/ORCHESTRAI/sessions',
    compression: {
      enabled: true,
      olderThan: 30 // days
    },
    retention: {
      keepCompleted: 180, // days
      keepFailed: 90,
      keepArchived: 365
    }
  },

  capture: {
    transcriptDetail: 'full', // 'full', 'summary', 'minimal'
    captureThinking: true,
    captureToolCalls: true,
    captureOutputs: true
  },

  viewer: {
    web: {
      port: 5502,
      host: 'localhost',
      auth: false // Set to true for production
    },
    cli: {
      defaultLimit: 20,
      colorize: true
    }
  },

  api: {
    enabled: true,
    port: 5503,
    cors: true,
    rateLimit: {
      windowMs: 60000,
      max: 100
    }
  }
};
```

---

## Security Considerations

1. **Access Control**: Session data may contain sensitive information
2. **Encryption**: Consider encrypting stored sessions
3. **Retention**: Implement proper data retention policies
4. **Authentication**: Add auth to web viewer in production
5. **PII Handling**: Redact sensitive data if needed

---

## Next Steps

1. ✅ Create core infrastructure (session capture, storage)
2. ✅ Integrate with Claude Code Task tool
3. ⏳ Build CLI viewer
4. ⏳ Build web UI
5. ⏳ Implement resumption/forking
6. ⏳ Add to orchestrai-master-coordinator

---

**Status**: 🚧 In Development
**Priority**: 🔥 P0 (Critical for agent transparency)
**Owner**: System Architecture
