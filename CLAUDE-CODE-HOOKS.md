# Claude Code Hooks Integration

The ORCHESTRAI system provides comprehensive workflow tracking and analytics through Claude Code hooks integration.

## Available Webhook Endpoints

**Base URL**: `http://localhost:5501`

### Workflow Tracking Hooks
- `POST /hooks/user-prompt-submit` - User prompt submission
- `POST /hooks/task-start` - Task initiation
- `POST /hooks/task-complete` - Task completion
- `POST /hooks/task-error` - Task error handling

### Real-time Monitoring Hooks
- `POST /hooks/tool-call` - Tool usage tracking
- `POST /hooks/mcp-call` - MCP server call monitoring
- `POST /hooks/token-usage` - AI model token consumption

### Session Management Hooks
- `POST /hooks/session-start` - Session initialization
- `POST /hooks/session-end` - Session termination

---

## Hook Configuration

Configure Claude Code hooks by adding these to your hooks configuration:

```json
{
  "user-prompt-submit-hook": {
    "type": "http",
    "url": "http://localhost:5501/hooks/user-prompt-submit",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json",
      "X-ORCHESTRAI-Source": "claude-code"
    },
    "payload": {
      "prompt": "{{prompt}}",
      "userId": "{{user_id}}",
      "timestamp": "{{timestamp}}",
      "sessionId": "{{session_id}}"
    }
  },

  "task-start-hook": {
    "type": "http",
    "url": "http://localhost:5501/hooks/task-start",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "workflowId": "{{workflow_id}}",
      "task": "{{task}}",
      "timestamp": "{{timestamp}}"
    }
  },

  "tool-call-hook": {
    "type": "http",
    "url": "http://localhost:5501/hooks/tool-call",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "workflowId": "{{workflow_id}}",
      "tool": "{{tool_name}}",
      "parameters": "{{tool_parameters}}",
      "duration": "{{duration_ms}}",
      "success": "{{success}}",
      "result": "{{result}}",
      "error": "{{error}}"
    }
  },

  "token-usage-hook": {
    "type": "http",
    "url": "http://localhost:5501/hooks/token-usage",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "workflowId": "{{workflow_id}}",
      "model": "{{model_name}}",
      "inputTokens": "{{input_tokens}}",
      "outputTokens": "{{output_tokens}}",
      "timestamp": "{{timestamp}}"
    }
  },

  "task-complete-hook": {
    "type": "http",
    "url": "http://localhost:5501/hooks/task-complete",
    "method": "POST",
    "headers": {
      "Content-Type": "application/json"
    },
    "payload": {
      "workflowId": "{{workflow_id}}",
      "result": "{{task_result}}",
      "timestamp": "{{timestamp}}"
    }
  }
}
```

---

## Management Endpoints

### Get Hooks Status
```bash
curl http://localhost:5501/hooks/status
```

### View Active Workflows
```bash
curl http://localhost:5501/hooks/workflows
```

### Update Hook Configuration
```bash
curl -X PUT http://localhost:5501/hooks/config/task-start \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

---

## Test Hook Integration

```bash
# Simulate user prompt submission
curl -X POST http://localhost:5501/hooks/user-prompt-submit \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Create a React component",
    "userId": "test-user",
    "sessionId": "test-session"
  }'
```

---

## Workflow Analytics Features

1. **Intent Recognition**: Automatically categorizes tasks (coding, research, analysis, etc.)
2. **Agent Recommendations**: Suggests optimal MCP servers based on task type
3. **Cost Projections**: Real-time cost estimates and projections
4. **Performance Tracking**: Efficiency metrics and optimization suggestions
5. **Resource Monitoring**: MCP server health and usage patterns

---

## Integration Benefits

### Real-Time Visibility
- Track agent execution across all workflows
- Monitor resource consumption and performance
- Identify bottlenecks and optimization opportunities

### Analytics and Insights
- Historical workflow analysis
- Cost tracking and optimization
- Agent performance benchmarking
- Usage pattern identification

### Automation Opportunities
- Trigger downstream workflows based on task completion
- Automated error handling and retry logic
- Smart resource allocation based on workload
- Predictive cost management

---

**See [CLAUDE.md](CLAUDE.md) for main ORCHESTRAI documentation.**
