---
name: capture-learnings
enabled: true
event: stop
pattern: .*
---

**Before ending this session, check for learnings to capture:**

Did we fix a mistake, make an important decision, or discover a client preference this session?

If yes, run: `Skill(skill="commands:learn", args="[describe the learning]")`

**What counts as a learning:**
- Fixed a recurring mistake (wrong plugin, wrong framework, wrong approach)
- Made a decision that should apply to future sessions (e.g., "always use X for Y")
- Discovered a client preference or constraint
- Found a pattern that worked well (or didn't)

**If nothing new was learned, this reminder can be ignored.**

Learnings are stored in `LEARNINGS.md` and all agents read them at session start.
