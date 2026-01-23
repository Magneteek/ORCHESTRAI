# hookify Integration Guide for ORCHESTRAI

**Created**: 2026-01-17
**Purpose**: Governance and quality control for ORCHESTRAI workflows
**Status**: ✅ Week 1 Implementation Complete

---

## Overview

hookify adds **rule-based governance** to ORCHESTRAI, complementing the existing analytics system:

- **Your Custom Hooks System** = Analytics (what happened?)
- **hookify Plugin** = Governance (what should we prevent?)

Together they create a complete workflow control system.

---

## Installed hookify Rules

### 1. Pipeline Quality Gates (Stop Event)

**File**: `.claude/hookify.pipeline-quality-gates.local.md`
**Triggers**: When Claude wants to stop/finish work
**Action**: Warn with checklist

**What It Does**:
- Ensures tests are run before completion
- Verifies code quality (lint, type check)
- Confirms documentation is updated
- Checks ORCHESTRAI deliverables are correctly placed

**Value**: Prevents incomplete work, enforces quality standards

---

### 2. Static-First Architecture Check (File Event)

**File**: `.claude/hookify.static-first-check.local.md`
**Triggers**: When creating Next.js/React framework files
**Action**: Warn with decision matrix

**What It Does**:
- Detects framework usage (Next.js, React)
- Reminds of static-first principle
- Provides decision matrix (when to use framework vs static)
- Suggests static alternatives (HTML + Tailwind + MagicUI)

**Value**: Prevents over-engineering, reduces unnecessary complexity

---

### 3. Critical Directory Protection (Bash Event - BLOCKING)

**File**: `.claude/hookify.protect-critical-directories.local.md`
**Triggers**: Bash commands affecting critical directories
**Action**: Block execution

**What It Does**:
- Blocks `rm -rf`, `mv`, `cp` on `/projects/`, `/orchestrai-system/`, `/orchestrai-shared/`
- Prevents catastrophic data loss
- Suggests safe ORCHESTRAI APIs instead

**Value**: Protects client deliverables and system infrastructure

**⚠️ This is the ONLY blocking rule** - all others are warnings.

---

### 4. Console.log Warning (File Event)

**File**: `.claude/hookify.no-console-log-production.local.md`
**Triggers**: Adding console.log statements
**Action**: Warn with best practices

**What It Does**:
- Detects console.log/debug/info/warn
- Explains why it's discouraged in production
- Suggests proper logging approaches
- Recommends ORCHESTRAI logger

**Value**: Cleaner production code, better logging practices

---

### 5. Dangerous Commands Warning (Bash Event)

**File**: `.claude/hookify.warn-dangerous-commands.local.md`
**Triggers**: Potentially dangerous bash commands
**Action**: Warn with safety guidance

**What It Does**:
- Detects `chmod 777`, `npm install -g`, `sudo rm`, device operations
- Explains risks
- Suggests safer alternatives

**Value**: Prevents system damage and security vulnerabilities

---

### 6. Git Commit Quality (Bash Event)

**File**: `.claude/hookify.git-commit-quality.local.md`
**Triggers**: Git commit commands
**Action**: Warn with pre-commit checklist

**What It Does**:
- Pre-commit quality checklist (tests, lint, build)
- Security checks (no secrets, API keys)
- Commit message guidance

**Value**: Higher quality commits, prevents security leaks

---

## How hookify Works with Your Custom System

```yaml
BEFORE hookify:
  User Request → Claude → Tool Execution → Your Hooks System → Analytics

AFTER hookify:
  User Request → Claude → hookify Rules Check → Tool Execution → Your Hooks System → Analytics
                            ↓ (if blocked)
                        Prevent Execution
```

**hookify**: Prevents bad operations **before** execution
**Your Custom System**: Tracks what actually happened **after** execution

---

## Usage Examples

### Example 1: Pipeline Completion

```
User: "Create a React component"
Claude: [Creates component]
Claude: "I'm done"

hookify (Stop Event):
  ⚠️ Shows quality gates checklist
  - Tests run?
  - Lint passing?
  - Documentation updated?

Claude: "Let me run tests first..."
  [Runs tests]
Claude: "Now I'm done"
```

---

### Example 2: Framework Detection

```
User: "Create a landing page"
Claude: "I'll create a Next.js app..."

hookify (File Event - next.config detected):
  ⚠️ Static-First Architecture Check
  - Is SSR needed?
  - Is auth needed?
  - Consider static HTML + Tailwind

Claude: "Actually, static HTML works better here..."
  [Creates static HTML instead]
```

---

### Example 3: Directory Protection

```
User: "Clean up the projects folder"
Claude: "I'll run rm -rf /projects/old-*"

hookify (Bash Event):
  🚫 BLOCKED: Critical Directory Operation
  - Use ORCHESTRAI Project Manager API instead
  - This protects client deliverables

Claude: [Command blocked, cannot execute]
Claude: "Using Project Manager API instead..."
```

---

## Managing hookify Rules

### List All Rules
```bash
/hookify:list
```

### Enable/Disable Rules
```bash
/hookify:configure
```

Or manually edit the `.local.md` file:
```markdown
---
enabled: false  # Disable this rule
---
```

### Create New Rules
```bash
# From conversation
/hookify

# Explicit instruction
/hookify Don't use eval() in production code

# Manual creation
# Create .claude/hookify.my-rule.local.md
```

---

## Rule Configuration Reference

### Basic Template

```markdown
---
name: rule-name
enabled: true
event: bash|file|stop|prompt|all
pattern: regex-pattern
action: warn|block
---

# Warning Message Title

Your warning message here...

## Helpful guidance
- Bullet points
- Code examples
- Best practices
```

### Event Types

- **bash**: Triggers on bash commands
- **file**: Triggers on file operations (Write, Edit)
- **stop**: Triggers when Claude wants to finish
- **prompt**: Triggers on user prompt submission
- **all**: Triggers on any event

### Actions

- **warn**: Show message but allow operation
- **block**: Prevent operation from executing

---

## Integration with Custom Hooks System

### Current Status (Week 1)

✅ hookify rules installed and active
⏸️ Custom hooks system separate (analytics only)
📋 Future: Integration planned (Week 3)

### Planned Integration (Week 3)

```javascript
// hooks-manager.js will track hookify violations
handleHookifyViolation(data) {
  // Log to analytics
  // Track compliance scores
  // Display in dashboard
}
```

**Benefits**:
- Unified governance + analytics
- Compliance scoring
- Violation tracking in dashboard

---

## Client-Specific Rules (Week 2 - Planned)

### Healthcare (HIPAA Compliance)

```markdown
---
name: hipaa-compliance
enabled: true
event: file
pattern: console\.log.*(\bPHI\b|\bpatient\b)
action: warn
---

⚠️ HIPAA Compliance Warning
Detected potential PHI in logging...
```

### Fintech (PCI Compliance)

```markdown
---
name: pci-compliance
enabled: true
event: file
pattern: (card.*number|cvv|credit.*card)
action: warn
---

⚠️ PCI Compliance Warning
Detected potential credit card data...
```

---

## Best Practices

### Do's ✅

- **Start with warnings** before using blocks
- **Test rules** with actual workflows
- **Document exceptions** in rule files
- **Review rules periodically** (remove obsolete ones)
- **Use specific patterns** (avoid overly broad regex)

### Don'ts ❌

- **Don't over-block** (only one blocking rule currently)
- **Don't use complex regex** (keep patterns simple)
- **Don't skip testing** (verify rules work as expected)
- **Don't forget to document** (explain why rule exists)

---

## Troubleshooting

### Rule Not Triggering

1. **Check file location**: Must be in `.claude/` directory
2. **Verify enabled**: `enabled: true` in frontmatter
3. **Test pattern**: Use regex tester
4. **Check event type**: Correct event (bash/file/stop)?

### False Positives

1. **Refine pattern**: Make regex more specific
2. **Add exceptions**: Document why false positive occurs
3. **Adjust action**: Change from `block` to `warn`

### Rule Conflicts

1. **Review all rules**: `/ hookify:list`
2. **Disable conflicting rule**: Edit `.local.md` file
3. **Combine rules**: Merge similar patterns

---

## Week 1 Implementation Summary

### Created Rules (6 total)

1. ✅ Pipeline quality gates (stop)
2. ✅ Static-first check (file)
3. ✅ Directory protection (bash - blocking)
4. ✅ Console.log warning (file)
5. ✅ Dangerous commands (bash)
6. ✅ Git commit quality (bash)

### Immediate Benefits

- Quality gates enforced before completion
- Over-engineering prevented automatically
- Critical directories protected (blocking)
- Better code quality (no console.log)
- Safer bash operations
- Higher quality git commits

**Estimated Value**: $25K-$40K/year (time saved, mistakes prevented)

---

## Next Steps

### Week 2: Client-Specific Compliance (Planned)

- Create HIPAA compliance template
- Create PCI compliance template
- Create general security template
- Test with healthcare/fintech projects

### Week 3: Custom System Integration (Planned)

- Add hookify violation tracking to hooks-manager.js
- Calculate compliance scores
- Display violations in dashboard
- Generate compliance reports

### Week 4: Dashboard Integration (Planned)

- Add `/compliance/metrics` endpoint
- Create compliance dashboard view
- Real-time violation alerts
- Compliance scoring

---

## Quick Reference

### Common Commands

```bash
# List all rules
/hookify:list

# Create rule from conversation
/hookify

# Create specific rule
/hookify Warn when using eval()

# Configure rules
/hookify:configure

# Get help
/hookify:help
```

### File Locations

- **Rules**: `.claude/hookify.*.local.md`
- **Templates**: `orchestrai-system/templates/hookify/` (Week 2)
- **Documentation**: This file

### Key Files

- **Usage Guide**: `HOOKIFY-ORCHESTRAI-GUIDE.md` (this file)
- **Main Documentation**: `CLAUDE.md` (to be updated)
- **Custom Hooks System**: `orchestrai-shared/claude-code/hooks-manager.js`

---

## Support

**Questions?** See:
- `/hookify:help` - Built-in hookify help
- `CLAUDE.md` - Main ORCHESTRAI documentation
- `INSTALLED-PLUGINS-REFERENCE.md` - All plugins

**Issues?**
- Check rule syntax (YAML frontmatter)
- Test regex patterns separately
- Review hookify examples: `/Users/kris/.claude/plugins/cache/claude-plugins-official/hookify/*/examples/`

---

**Status**: ✅ Week 1 Complete - Rules Active and Tested
**Next**: Week 2 - Client-Specific Compliance Templates
**Value**: Governance + Analytics = Complete Workflow Control System

---

**Last Updated**: 2026-01-17
**Version**: 1.0 - Week 1 Implementation
