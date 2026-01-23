---
name: no-console-log-production
enabled: true
event: file
pattern: console\.(log|debug|info|warn)\(
action: warn
---

# ⚠️ Console Logging Detected

You're adding **console.log** or similar logging statements.

## 🚫 Why This Is Discouraged

Console logging in production code:
- **Performance impact** - Blocking I/O operations
- **Security risk** - May leak sensitive data
- **Unprofessional** - Debug code in production
- **Log pollution** - Clutters browser console

## ✅ Proper Logging Approaches

### For Development/Debugging:
```javascript
// OK: Remove before committing
console.log('DEBUG: Current state:', state);

// Better: Use debug flag
if (process.env.NODE_ENV === 'development') {
  console.log('Dev only:', data);
}
```

### For Production Logging:
```javascript
// Use proper logging library
import { logger } from './utils/logger';

// Structured logging
logger.info('User action', {
  userId: user.id,
  action: 'login',
  timestamp: Date.now()
});

// Error logging
logger.error('API call failed', {
  error: error.message,
  endpoint: '/api/users'
});
```

### For ORCHESTRAI Agents:
```javascript
// Use ORCHESTRAI logger
const { createLogger } = require('./orchestrai-shared/logging/logger');
const logger = createLogger('agent-name');

logger.info('Agent started', { agentId, taskId });
logger.error('Agent failed', { error, context });
```

## 🔧 Quick Fixes

**If this is debug code:**
1. Remove the console.log statement
2. Or wrap in `if (process.env.NODE_ENV === 'development')`

**If you need production logging:**
1. Use ORCHESTRAI's structured logger
2. Or implement proper logging library (Winston, Pino)
3. Include context and log levels

**If this is intentional:**
1. Document why console logging is needed
2. Add comment explaining the exception

---

**Remember**: Remove debug logging before committing to production!

*This warning helps maintain clean, professional production code.*
