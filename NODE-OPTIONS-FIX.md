# NODE_OPTIONS Fix - ORCHESTRAI

## Problem

The error `node: --gc-interval= is not allowed in NODE_OPTIONS` occurs because `--gc-interval` is not a valid Node.js flag in recent versions.

## Root Cause

Your system environment has:
```bash
export NODE_OPTIONS="--max-old-space-size=4096 --gc-interval=100"
```

The `--gc-interval` flag is **invalid** and causes Node.js scripts to fail immediately.

## Solution

### Quick Fix (Temporary - Current Session Only)

```bash
# Run this in your terminal
export NODE_OPTIONS="--max-old-space-size=4096"

# Or use our fix script
./scripts/fix-node-options.sh
```

### Permanent Fix

**1. Edit your shell configuration file:**

```bash
# For Zsh (macOS default)
nano ~/.zshrc

# For Bash
nano ~/.bashrc
```

**2. Find and replace the NODE_OPTIONS line:**

```bash
# OLD (REMOVE THIS):
export NODE_OPTIONS="--max-old-space-size=4096 --gc-interval=100"

# NEW (USE THIS):
export NODE_OPTIONS="--max-old-space-size=4096"
```

**3. Save and reload:**

```bash
# For Zsh
source ~/.zshrc

# For Bash
source ~/.bashrc
```

**4. Verify the fix:**

```bash
echo $NODE_OPTIONS
# Should output: --max-old-space-size=4096

node -v
# Should work without errors

npm run validate:env
# Should run successfully
```

## Why --max-old-space-size=4096?

This flag increases Node.js heap size from ~1.4GB default to 4GB:

- ✅ **Prevents crashes** during heavy agent workloads
- ✅ **Allows** running multiple MCP servers simultaneously  
- ✅ **Enables** parallel agent execution without memory exhaustion
- ✅ **Required** for large client intelligence pipelines

## Valid NODE_OPTIONS Flags

Safe flags you can use in NODE_OPTIONS:

```bash
# Memory management
--max-old-space-size=4096         # Increase heap size (recommended)
--max-semi-space-size=64          # Increase young generation

# Performance
--expose-gc                       # Expose gc() function
--trace-gc                        # Log garbage collection

# Development
--inspect                         # Enable debugging
--trace-warnings                  # Show warning stack traces
```

## Invalid Flags (DO NOT USE)

These will cause errors:

```bash
--gc-interval=X                   # ❌ Not a valid Node.js flag
--gc-global                       # ❌ Removed in recent versions
--optimize-for-size               # ❌ Deprecated
```

## Testing After Fix

```bash
# 1. Test environment validation
npm run validate:env

# 2. Test services status
npm run system:status-all

# 3. Test MCP switching
npm run switch:mcp:minimal

# 4. Start ORCHESTRAI
npm run orchestrator
```

## Prevention

Our `validate:env` script now runs automatically before starting services (via `prestart` hook in package.json).

This catches environment issues before they cause crashes.

## Related Files

- `scripts/fix-node-options.sh` - Quick fix script
- `scripts/validate-env.js` - Environment validation
- `CRASH-PREVENTION-STRATEGY.md` - Comprehensive crash prevention guide

---

**Status**: ✅ FIXED
**Date**: 2025-11-28
**Impact**: All Node.js commands now work correctly
