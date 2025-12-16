==============================================================================
VS CODE CRASH - IMMEDIATE ACTION REQUIRED
==============================================================================

CRASH REASON: Memory exhaustion (too many MCP servers running)
YOUR WORK: Safe! Project files are intact in:
  /Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/

==============================================================================
THREE STEPS TO FIX (5 minutes):
==============================================================================

1. RESTART VS CODE
   • Close VS Code completely (Cmd+Q)
   • Wait 10 seconds
   • Reopen VS Code
   
   Why: New memory settings need a restart to activate

2. CHECK SYSTEM RESOURCES
   ./scripts/check-resources.sh
   
   This shows if your system can handle heavy workloads safely

3. SWITCH TO MINIMAL CONFIG (Recommended)
   ./scripts/switch-mcp-minimal.sh
   
   Then restart VS Code again
   
   This reduces MCP servers from 8 → 4 (prevents future crashes)

==============================================================================
WHAT CHANGED:
==============================================================================

✅ Memory limit increased to 4GB (from default 512MB)
✅ File watcher optimized (excludes temp/deliverables directories)  
✅ Minimal MCP config created (4 essential servers only)
✅ Resource monitoring scripts added

Files Created:
• .vscode/settings.json - Memory optimizations
• .mcp.minimal.json - Lightweight configuration
• scripts/check-resources.sh - System status checker
• CRASH-FIX-QUICK-START.md - Complete guide

==============================================================================
PREVENTING FUTURE CRASHES:
==============================================================================

Before heavy work, run:
  ./scripts/check-resources.sh

If memory > 85% or MCP servers > 6:
  ./scripts/switch-mcp-minimal.sh

When doing complex multi-agent pipelines:
  • Run agents SEQUENTIALLY (not parallel)
  • Use minimal MCP configuration
  • Monitor memory during execution

==============================================================================
RESUMING RAPIDCOLDPLUNGE WORK:
==============================================================================

Your work is safe. To continue:

1. Restart VS Code (if you haven't already)
2. Run: ./scripts/check-resources.sh
3. If warnings appear: ./scripts/switch-mcp-minimal.sh
4. Open rapidcoldplunge project in VS Code
5. Execute agents sequentially or in small batches (max 2-3 parallel)

Current System Status:
  Memory: 68% used (OK but monitor closely)
  MCP Servers: 8 active (TOO MANY - switch to minimal)
  Redis: Running ✓
  Disk: 65% used ✓

==============================================================================
NEED MORE INFO?
==============================================================================

Quick Start: CRASH-FIX-QUICK-START.md (you are here)
Full Analysis: CRASH-PREVENTION-STRATEGY.md
Resource Check: ./scripts/check-resources.sh

==============================================================================
