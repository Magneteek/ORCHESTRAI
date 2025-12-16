# ORCHESTRAI Logging System

Centralized structured logging using Pino for high-performance, production-ready logging.

## Quick Start

```javascript
const logger = require('./orchestrai-shared/logging/logger');

// Simple logging
logger.info('Agent started successfully');
logger.error('Pipeline failed', { error: err.message });

// Structured logging with context
logger.info('Keyword research complete', {
  keywords: 120,
  duration: 4500,
  executionId: 'abc-123'
});

// Domain-specific logger
const seoLogger = logger.forDomain('seo');
seoLogger.info('SERP analysis started', { url, keyword });

// Agent-specific logger
const agentLogger = logger.forAgent('seo-keyword-research', 'seo');
agentLogger.debug('Processing keyword batch', { batchSize: 50 });
```

## Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `fatal` | Application crash, immediate action required | Database connection lost, cannot recover |
| `error` | Error that needs investigation | Pipeline failed, API returned 500 |
| `warn` | Something unexpected but handled | Fallback mode activated, deprecated API used |
| `info` | General information (default) | Agent started, pipeline completed |
| `debug` | Detailed debugging info | Memory traversal path, cache hit/miss |
| `trace` | Very detailed tracing | Function entry/exit, variable values |

## Environment Configuration

```bash
# Development (default: debug level, pretty printing)
NODE_ENV=development

# Production (default: info level, JSON output)
NODE_ENV=production

# Override log level
LOG_LEVEL=debug  # Options: fatal, error, warn, info, debug, trace

# Test (silent logging)
NODE_ENV=test
```

## Usage Patterns

### Pattern 1: Simple Logging

```javascript
const logger = require('./orchestrai-shared/logging/logger');

logger.info('Server started', { port: 5501 });
logger.error('Connection failed', { error: err.message, host });
```

### Pattern 2: Domain Logger

```javascript
const logger = require('./orchestrai-shared/logging/logger');
const seoLogger = logger.forDomain('seo');

seoLogger.info('Starting keyword research', { project });
seoLogger.debug('API call', { endpoint, params });
```

### Pattern 3: Agent Logger

```javascript
const logger = require('./orchestrai-shared/logging/logger');

class SEOResearchAgent {
  constructor() {
    this.logger = logger.forAgent('seo-research', 'seo');
  }

  async execute(task) {
    this.logger.info('Executing task', { taskId: task.id });
    // ...
    this.logger.info('Task completed', { duration, results });
  }
}
```

### Pattern 4: Pipeline Logger with Correlation

```javascript
const logger = require('./orchestrai-shared/logging/logger');
const { v4: uuidv4 } = require('uuid');

async function executePipeline(spec) {
  const executionId = uuidv4();
  const pipelineLogger = logger.forPipeline('seo-research', executionId);

  pipelineLogger.info('Pipeline started', { projectId: spec.projectId });

  for (const stage of stages) {
    pipelineLogger.info('Stage started', { stage: stage.name });
    // ... execute stage
    pipelineLogger.info('Stage completed', { stage: stage.name });
  }

  pipelineLogger.info('Pipeline completed');
}
```

### Pattern 5: Timing Operations

```javascript
const logger = require('./orchestrai-shared/logging/logger');

async function fetchKeywords(query) {
  const timer = logger.time('DataForSEO API call', { query });

  try {
    const result = await apiClient.get('/keywords', { query });
    timer(); // Logs: "Completed: DataForSEO API call (1234ms)"
    return result;
  } catch (error) {
    timer(error); // Logs: "Failed: DataForSEO API call (567ms)"
    throw error;
  }
}
```

### Pattern 6: Child Loggers for Context

```javascript
const logger = require('./orchestrai-shared/logging/logger');

class BaseSpecializedAgent {
  constructor(config) {
    // All logs from this agent will include domain and agent name
    this.logger = logger.child({
      domain: config.domain,
      agent: config.name
    });
  }

  async execute(task) {
    // Automatically includes domain and agent context
    this.logger.info('Starting execution', { taskId: task.id });
  }
}
```

## Migration from console.log

### Before

```javascript
console.log('Agent started:', agentName);
console.error('Error:', error);
console.log(`Pipeline ${id} completed in ${duration}ms`);
```

### After

```javascript
logger.info('Agent started', { agentName });
logger.error('Error occurred', { error: error.message, stack: error.stack });
logger.info('Pipeline completed', { pipelineId: id, duration });
```

## Sensitive Data Redaction

The logger automatically redacts sensitive fields:

```javascript
logger.info('API request', {
  url: 'https://api.example.com',
  headers: {
    authorization: 'Bearer secret-token'  // Redacted automatically
  },
  apiKey: 'my-secret-key'  // Redacted automatically
});

// Output:
// { url: '...', headers: { authorization: '[REDACTED]' }, apiKey: '[REDACTED]' }
```

Redacted fields:
- `password`, `token`, `apiKey`, `api_key`
- `accessToken`, `access_token`, `secret`
- `authorization`
- Nested fields: `*.password`, `*.token`, etc.

## Production Best Practices

### 1. Use Structured Logging

❌ Bad:
```javascript
logger.info(`User ${userId} completed action ${action} in ${time}ms`);
```

✅ Good:
```javascript
logger.info('User action completed', { userId, action, duration: time });
```

### 2. Include Correlation IDs

```javascript
const executionId = uuidv4();
logger.info('Request started', { executionId, userId });
// ... throughout the execution
logger.info('Request completed', { executionId, duration });
```

### 3. Log Errors with Context

❌ Bad:
```javascript
logger.error(error);
```

✅ Good:
```javascript
logger.error('Pipeline execution failed', {
  error: error.message,
  stack: error.stack,
  pipelineId,
  stage: currentStage,
  projectId
});
```

### 4. Use Appropriate Log Levels

```javascript
logger.debug('Cache lookup', { key });      // Development only
logger.info('Pipeline started', { id });     // Important events
logger.warn('Using fallback', { reason });   // Degraded mode
logger.error('Operation failed', { error }); // Needs investigation
logger.fatal('Cannot continue', { error });  // Application crash
```

### 5. Avoid Logging in Tight Loops

❌ Bad:
```javascript
for (const item of items) {
  logger.debug('Processing item', { item });  // 10,000 logs!
}
```

✅ Good:
```javascript
logger.debug('Processing batch', { count: items.length });
// Process items...
logger.debug('Batch completed', { count: items.length, errors });
```

## Log Aggregation

In production, logs should be aggregated to centralized systems:

- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Datadog**: Structured JSON logs
- **CloudWatch**: AWS log aggregation
- **Papertrail**: Simple log aggregation

All logs are JSON-formatted in production for easy parsing:

```json
{
  "level": "INFO",
  "time": "2025-12-16T10:30:45.123Z",
  "pid": 12345,
  "host": "orchestrai-prod",
  "env": "production",
  "domain": "seo",
  "agent": "keyword-research",
  "msg": "Pipeline completed",
  "executionId": "abc-123",
  "duration": 4500,
  "keywords": 120
}
```

## Performance

Pino is designed for high-performance logging:

- **~30x faster** than Winston
- **Asynchronous I/O** doesn't block execution
- **JSON serialization** optimized for speed
- **Child loggers** add context without performance penalty

Benchmark: ~50,000 logs/second vs ~1,700 logs/second (Winston)

## Testing

In test environment (`NODE_ENV=test`), logging is silenced by default.

To enable logs during testing:
```javascript
process.env.LOG_LEVEL = 'debug';
const logger = require('./orchestrai-shared/logging/logger');
```

## Graceful Shutdown

Always flush logs before process exit:

```javascript
const logger = require('./orchestrai-shared/logging/logger');

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully');
  await logger.flush();
  process.exit(0);
});
```

## Examples

See `orchestrai-shared/logging/examples.js` for comprehensive usage examples.
