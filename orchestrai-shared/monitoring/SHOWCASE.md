# Token Monitor Visual Showcase

A visual walkthrough of the Claude Code Token Monitor terminal interface.

## Dashboard Overview

```
╔════════════════════════════════════════════════════════════════════╗
║          CLAUDE CODE TOKEN MONITOR - FULL DASHBOARD               ║
╠════════════════════════════════════════════════════════════════════╣
║                                                                    ║
║  Session: prod-session-8E4A2C1F    Uptime: 01:23:45    ● Connected║
║                                                                    ║
╠═══════════════════════════════╦════════════════════════════════════╣
║   CURRENT SESSION             ║    TOKEN USAGE                     ║
║                               ║                                    ║
║  Session ID:  prod-session    ║    ████████████░░  82%             ║
║  Uptime:      01:23:45        ║                                    ║
║                               ║    Budget:   200,000               ║
║  Input:    [████████] 95.2K   ║    Used:     164,000               ║
║  Output:   [█████   ] 68.8K   ║    Remaining: 36,000               ║
║  Total:    [████████] 164K    ║                                    ║
║  Cost:     $4.87              ║    Status: APPROACHING LIMIT       ║
║                               ║                                    ║
╠═══════════════════════════════╩════════════════════════════════════╣
║                       WORKFLOW HISTORY                             ║
╠════════════════════════════════════════════════════════════════════╣
║  ID                  Tokens    Cost      Status    Time            ║
║  ────────────────────────────────────────────────────────────────  ║
║  wf_content_01      15.2K     $0.23      ✓        09:15:23        ║
║  wf_analysis_02     22.4K     $0.34      ✓        09:18:45        ║
║  wf_research_03     18.7K     $0.28      ✓        09:22:11        ║
║  wf_generation_04   31.5K     $0.47      ✓        09:28:30        ║
║  wf_validation_05   12.8K     $0.19      ✓        09:31:02        ║
║  wf_optimization_06 25.3K     $0.38      ✓        09:35:17        ║
║  wf_deployment_07   19.1K     $0.29      ✓        09:38:44        ║
║  wf_monitoring_08   14.6K     $0.22      ✓        09:41:55        ║
║  wf_analysis_09     27.9K     $0.42      ✓        09:46:12        ║
║  wf_integration_10  21.5K     $0.32      ⏳       09:50:28        ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║                      LIVE TOKEN STREAM                             ║
╠════════════════════════════════════════════════════════════════════╣
║  [09:50:42] +2,547 input tokens / +1,823 output tokens            ║
║  [09:50:43] Workflow wf_integration_10 started                    ║
║  [09:50:45] +3,201 input tokens / +2,104 output tokens            ║
║  [09:50:47] Tool call: content-writer-specialist                  ║
║  [09:50:49] +1,856 input tokens / +945 output tokens              ║
║  [09:50:51] Task completed: Healthcare content generation         ║
║  [09:50:53] +2,109 input tokens / +1,567 output tokens            ║
║  [09:50:55] ⚠ Token budget at 82% - approaching limit             ║
║  [09:50:57] +1,734 input tokens / +1,203 output tokens            ║
║  [09:50:59] Quality validation passed                             ║
║  [09:51:01] +987 input tokens / +654 output tokens                ║
║  [09:51:03] Workflow wf_integration_10 completed                  ║
║                                                                    ║
╠════════════════════════════════════════════════════════════════════╣
║  [q] Quit  [r] Reset  [c] Clear  [h] Help                         ║
╚════════════════════════════════════════════════════════════════════╝
```

## Color States

### Safe Usage (< 70%)

```
╔════════════════════════════════════════╗
║    TOKEN USAGE                         ║
║                                        ║
║    ███████░░░░  62%  (GREEN)           ║
║                                        ║
║    Budget:   200,000                   ║
║    Used:     124,000                   ║
║    Remaining: 76,000                   ║
║                                        ║
║    Status: SAFE                        ║
║                                        ║
╚════════════════════════════════════════╝
```

### Warning (70-90%)

```
╔════════════════════════════════════════╗
║    TOKEN USAGE                         ║
║                                        ║
║    █████████░  84%  (YELLOW)           ║
║                                        ║
║    Budget:   200,000                   ║
║    Used:     168,000                   ║
║    Remaining: 32,000                   ║
║                                        ║
║    Status: ⚠ WARNING                   ║
║                                        ║
╚════════════════════════════════════════╝
```

### Critical (> 90%)

```
╔════════════════════════════════════════╗
║    TOKEN USAGE                         ║
║                                        ║
║    ██████████  96%  (RED)              ║
║                                        ║
║    Budget:   200,000                   ║
║    Used:     192,000                   ║
║    Remaining: 8,000                    ║
║                                        ║
║    Status: ⚠ CRITICAL                  ║
║                                        ║
╚════════════════════════════════════════╝
```

## Session Info Detail

```
╔═══════════════════════════════╗
║   CURRENT SESSION             ║
║                               ║
║  Session ID:                  ║
║    prod-session-8E4A2C1F      ║
║                               ║
║  Uptime:      01:23:45        ║
║  Start Time:  08:27:15        ║
║                               ║
║  Input Tokens:                ║
║    [████████] 95,247          ║
║                               ║
║  Output Tokens:               ║
║    [█████   ] 68,753          ║
║                               ║
║  Total Tokens:                ║
║    [████████] 164,000         ║
║                               ║
║  Current Cost:                ║
║    $4.87                      ║
║                               ║
║  Average per workflow:        ║
║    16,400 tokens              ║
║    $0.49                      ║
║                               ║
╚═══════════════════════════════╝
```

## Workflow History Table

```
╔════════════════════════════════════════════════════════════╗
║                    WORKFLOW HISTORY                        ║
╠════════════════════════════════════════════════════════════╣
║  ID                  Tokens    Cost      Status    Time    ║
║  ──────────────────────────────────────────────────────────║
║                                                            ║
║  Completed (✓)                                             ║
║  ──────────────────────────────────────────────────────────║
║  wf_content_01      15.2K     $0.23      ✓        09:15   ║
║  wf_analysis_02     22.4K     $0.34      ✓        09:18   ║
║  wf_research_03     18.7K     $0.28      ✓        09:22   ║
║                                                            ║
║  Running (⏳)                                               ║
║  ──────────────────────────────────────────────────────────║
║  wf_integration_10  21.5K     $0.32      ⏳       09:50   ║
║                                                            ║
║  Failed (✗)                                                ║
║  ──────────────────────────────────────────────────────────║
║  wf_validation_08   8.3K      $0.12      ✗        09:45   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Live Event Stream

```
╔════════════════════════════════════════════════════════════╗
║                    LIVE TOKEN STREAM                       ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  Token Usage Events (Green/Blue)                           ║
║  ──────────────────────────────────────────────────────────║
║  [09:50:42] +2,547 input tokens                            ║
║  [09:50:43] +1,823 output tokens                           ║
║  [09:50:45] +3,201 input tokens / +2,104 output tokens     ║
║                                                            ║
║  Workflow Events (Yellow)                                  ║
║  ──────────────────────────────────────────────────────────║
║  [09:50:43] Workflow wf_integration_10 started             ║
║  [09:51:03] Workflow wf_integration_10 completed           ║
║                                                            ║
║  Tool Events (Cyan)                                        ║
║  ──────────────────────────────────────────────────────────║
║  [09:50:47] tool-call: content-writer-specialist           ║
║  [09:50:51] Task completed: Healthcare content generation  ║
║                                                            ║
║  Alerts (Red/Yellow)                                       ║
║  ──────────────────────────────────────────────────────────║
║  [09:50:55] ⚠ Token budget at 82% - approaching limit     ║
║  [09:52:10] ⚠ Token budget at 90% - critical level        ║
║  [09:53:25] ⚠ Token budget exceeded                       ║
║                                                            ║
║  System Events (White)                                     ║
║  ──────────────────────────────────────────────────────────║
║  [09:48:00] Connected to ws://localhost:5502               ║
║  [09:49:15] Counters reset                                 ║
║  [09:50:30] Log cleared                                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Help Dialog

```
╔════════════════════════════════════════════════════════════╗
║                          HELP                              ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  KEYBOARD SHORTCUTS                                        ║
║  ══════════════════                                        ║
║                                                            ║
║  q, Ctrl+C     Quit the application                        ║
║  r             Reset token counters                        ║
║  c             Clear event log                             ║
║  h             Show this help dialog                       ║
║                                                            ║
║  DASHBOARD SECTIONS                                        ║
║  ══════════════════                                        ║
║                                                            ║
║  Current Session   - Real-time token usage for current     ║
║                      session                               ║
║  Token Usage       - Visual gauge showing budget           ║
║                      consumption                           ║
║  Workflow History  - Last 10 completed workflows           ║
║  Live Token Stream - Real-time event log with token        ║
║                      updates                               ║
║                                                            ║
║  COLOR CODING                                              ║
║  ════════════                                              ║
║                                                            ║
║  Green   - Token usage < 70% of budget (safe)              ║
║  Yellow  - Token usage 70-90% of budget (warning)          ║
║  Red     - Token usage > 90% of budget (critical)          ║
║                                                            ║
║  Press any key to close...                                 ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

## Connection States

### Connected

```
╔════════════════════════════════════════╗
║  Session: prod-session                 ║
║  Uptime: 01:23:45    ● Connected       ║
╚════════════════════════════════════════╝
```

### Connecting

```
╔════════════════════════════════════════╗
║  Session: prod-session                 ║
║  Uptime: 01:23:45    ● Connecting...   ║
╚════════════════════════════════════════╝
```

### Disconnected

```
╔════════════════════════════════════════╗
║  Session: prod-session                 ║
║  Uptime: 01:23:45    ● Disconnected    ║
╚════════════════════════════════════════╝
```

### Error

```
╔════════════════════════════════════════╗
║  Session: prod-session                 ║
║  Uptime: 01:23:45    ● Error           ║
╚════════════════════════════════════════╝
```

## Progress Bar Variations

```
╔════════════════════════════════════════╗
║  Token Progress Bars                   ║
╠════════════════════════════════════════╣
║                                        ║
║  0%    [          ]                    ║
║  10%   [█         ]                    ║
║  25%   [██        ]                    ║
║  50%   [█████     ]                    ║
║  75%   [███████   ]                    ║
║  90%   [█████████ ]                    ║
║  100%  [██████████]                    ║
║                                        ║
╚════════════════════════════════════════╝
```

## Status Symbols

```
╔════════════════════════════════════════╗
║  Workflow Status Indicators            ║
╠════════════════════════════════════════╣
║                                        ║
║  ✓  Completed                          ║
║  ⏳ Running                             ║
║  ✗  Failed                             ║
║  ○  Pending                            ║
║  ⚠  Warning                            ║
║                                        ║
╚════════════════════════════════════════╝
```

## Real-time Updates

The dashboard updates every 100ms (configurable), providing smooth real-time feedback:

```
Frame 1 (00:00.000):
  Input:  [████    ] 40.2K
  Output: [███     ] 25.8K
  Total:  [███     ] 66.0K

Frame 2 (00:00.100):
  Input:  [████    ] 40.2K
  Output: [███     ] 25.8K
  Total:  [███     ] 66.0K

Frame 3 (00:00.200):
  Input:  [████    ] 42.5K  ← Updated
  Output: [███     ] 27.1K  ← Updated
  Total:  [███     ] 69.6K  ← Updated

Frame 4 (00:00.300):
  Input:  [████    ] 42.5K
  Output: [███     ] 27.1K
  Total:  [███     ] 69.6K
```

## Example Workflow

Watch a complete workflow execution:

```
[09:50:00] System: Connected to ws://localhost:5502
[09:50:01] Workflow wf_content_01 started
[09:50:02] +1,234 input tokens
[09:50:03] tool-call: research-agent
[09:50:04] +2,456 input tokens / +1,789 output tokens
[09:50:05] tool-call: content-writer-specialist
[09:50:06] +3,567 input tokens / +2,890 output tokens
[09:50:07] tool-call: quality-assurance-agent
[09:50:08] +987 input tokens / +654 output tokens
[09:50:09] Workflow wf_content_01 completed
[09:50:10] Total: 15,234 tokens, Cost: $0.23

Session Updated:
  Input:  [█       ] 8,244 → 16,478
  Output: [█       ] 5,333 → 10,666
  Total:  [█       ] 13,577 → 27,144
  Cost:   $0.41 → $0.64
```

## Footer Options

```
╔════════════════════════════════════════════════════════════╗
║  [q] Quit  [r] Reset  [c] Clear  [h] Help                 ║
╚════════════════════════════════════════════════════════════╝

Interactive commands available at all times:
  • Press 'q' or Ctrl+C to exit
  • Press 'r' to reset all counters
  • Press 'c' to clear the event log
  • Press 'h' to show help dialog
```

## Terminal Compatibility

Tested and optimized for:

- ✓ iTerm2 (macOS)
- ✓ Terminal.app (macOS)
- ✓ Alacritty
- ✓ GNOME Terminal (Linux)
- ✓ Konsole (Linux)
- ✓ Windows Terminal
- ✓ VS Code integrated terminal

Minimum terminal size: 80x24 characters
Recommended size: 120x40 characters

---

This showcase demonstrates the rich visual interface and real-time capabilities of the Claude Code Token Monitor.
