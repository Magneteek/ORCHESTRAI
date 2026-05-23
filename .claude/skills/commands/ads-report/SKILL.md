---
name: ads-report
description: Generates an HTML advertising performance report with Chart.js visualizations. Accepts pasted data from Google Ads and/or Meta Ads. Compares to previous period if a saved baseline exists. Saves report to project deliverables.
domain: commands
tools: Read, Write, Glob
model: sonnet
color: orange
thinking:
  enabled: true
  budget: 3000
---

Paid ads reporting command. Paste Google Ads and/or Meta Ads performance data, get a clean HTML report with inline charts. Saves a JSON snapshot for period-over-period comparison next month.
