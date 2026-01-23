---
name: protect-critical-directories
enabled: true
event: bash
pattern: (rm|mv|cp|rsync).*(-rf|-r|--recursive).*(\/projects\/|\/orchestrai-system\/templates\/|\/orchestrai-shared\/|\/orchestrai-master\/)
action: block
---

# 🚫 BLOCKED: Critical Directory Operation

This command affects **critical ORCHESTRAI directories** and has been blocked for safety.

## 🛡️ Protected Directories

- **`/projects/`** - Client deliverables and project data
- **`/orchestrai-system/templates/`** - Global template library
- **`/orchestrai-shared/`** - Shared infrastructure code
- **`/orchestrai-master/`** - Core orchestrator system

## ⚠️ Why This Is Blocked

Direct file operations on these directories can:
- **Delete client deliverables** (catastrophic data loss)
- **Break template system** (affects all projects)
- **Corrupt shared infrastructure** (system-wide failures)
- **Damage orchestrator** (complete system failure)

## ✅ Safe Alternatives

### For Project File Management:
```javascript
// Use ORCHESTRAI Project Manager API
const projectManager = require('./orchestrai-shared/project-management/project-manager');

// Safe cleanup
await projectManager.cleanupProject(projectUuid);

// Safe file operations
await projectManager.moveDeliverable(projectUuid, sourceFile, destFile);
```

### For Template Management:
```javascript
// Use Template Service API
const templateService = require('./orchestrai-system/template-service');

// Safe template operations
await templateService.updateTemplate(templateName, newContent);
```

### For Temporary Files:
```bash
# Use /temp/ directory for safe operations
rm -rf /temp/processing/*
```

## 📋 If You Really Need This Operation

1. **Stop and review** - Is this absolutely necessary?
2. **Use ORCHESTRAI APIs** - Safer, logged, reversible
3. **Manual override** - If truly needed, disable this rule:
   ```bash
   # Edit .claude/hookify.protect-critical-directories.local.md
   # Set: enabled: false
   ```
4. **Re-enable immediately** after operation

## 🔍 What You Tried To Do

The blocked command would have operated on protected directories.

**Safer approach**: Use ORCHESTRAI's project management APIs or operate on `/temp/` directory instead.

---

**This protection prevents catastrophic mistakes and ensures data integrity.**

*If this blocked a legitimate operation, please use the ORCHESTRAI APIs or contact system admin.*
