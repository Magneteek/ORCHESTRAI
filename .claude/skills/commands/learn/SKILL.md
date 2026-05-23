---
name: learn
description: Capture a learning, mistake fix, or decision into LEARNINGS.md so the entire system remembers it. Trigger this skill when the user says "remember this", "don't do this again", "always do X", "we fixed a mistake", "note that", "add to learnings", or when you correct a recurring error. Also trigger when wrapping up a session and there are key decisions or mistakes to preserve. This is how the system learns and improves across sessions.
---

# Learn: Capture System Learning

When this skill triggers, capture the learning immediately into LEARNINGS.md.

## Step 1: Determine the learning

If the user provided the learning inline (e.g., "/learn SEOpress not Yoast for nasmehpg"), extract it directly.

If no specific learning was provided, ask: "What should the system remember? (mistake to avoid, decision made, client preference, pattern discovered)"

## Step 2: Classify it

- **Type**: `mistake` | `decision` | `preference` | `pattern`
- **Domain**: `global` | `seo` | `content` | `webdev` | `quality` | `advertising` | `devops` | `architecture`
- **Scope**: `system-wide` | `client:[name]` | `project:[name]`

Use the most specific scope available. If client-specific, put it under CLIENT-SPECIFIC.

## Step 3: Write to LEARNINGS.md

Read `/Users/krisbal/CLAUDEtools/ORCHESTRAI/LEARNINGS.md` first, then append the learning to the correct section using this format:

```
- **[YYYY-MM-DD]** | [concise description of what happened and what the correct approach is]
```

Today's date: check from context or use the date from the user's message.

## Step 4: Write to MEMORY.md (for important learnings)

For client preferences, recurring mistakes, or architecture decisions, also write to:
`/Users/krisbal/.claude/projects/-Users-krisbal-CLAUDEtools-ORCHESTRAI/memory/MEMORY.md`

Keep it brief — MEMORY.md is loaded at every session start so it must stay under 200 lines.

## Step 5: Confirm

Tell the user:
- What was captured
- Where it was saved
- That all agents will now read it at session start

## Format Rules

- One line per learning — concise and actionable
- Include the "wrong" and "right" approach when it's a mistake
- No vague entries like "be careful" — be specific
- If it's a client preference, include the client name

## Examples

Good: `- **2026-03-05** | [nasmehpg] Uses SEOpress (NOT Yoast). All plugin references must use SEOpress.`

Good: `- **2026-03-05** | [global/webdev] Never suggest Next.js for static landing pages. Default: HTML + Tailwind.`

Bad: `- **2026-03-05** | Be more careful with SEO plugins.`
