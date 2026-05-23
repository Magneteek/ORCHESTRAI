---
name: detect-corrections
enabled: true
event: prompt
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: (?i)(no[,\s].*(use|it'?s|should|that'?s)|don'?t do that|i said|told you|wrong (plugin|approach|tool|framework|way)|not (yoast|next\.?js|react)|use .* not |remember[,\s]|how many times|again[?!]|that'?s wrong|incorrect[,\s!]|mistake|fix this|stop using|never use|always use)
---

**Correction detected** — this looks like a mistake being fixed.

Capture it so it doesn't happen again:

```
/learn [describe what was wrong and what the correct approach is]
```

Or I'll capture it automatically at the end of this session — but doing it now means it's saved immediately to `LEARNINGS.md` and all agents will know for next time.
