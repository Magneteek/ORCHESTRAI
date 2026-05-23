---
name: pipeline-quality-gates
enabled: true
event: stop
pattern: .*
action: warn
---

# 🎯 ORCHESTRAI Pipeline Quality Gates

Before finishing work, verify these quality checkpoints:

## Testing & Quality
- [ ] **Tests executed** (npm test, pytest, or equivalent)
- [ ] **Test coverage ≥ 85%** (if code changes made)
- [ ] **Zero failing tests** (all tests pass)
- [ ] **TypeScript/ESLint** checks pass (no errors)
- [ ] **No console.log** in production files

## Code Quality
- [ ] **Code formatted** (Prettier/Black run)
- [ ] **No debugging code** (debugger, console.log removed)
- [ ] **Error handling** implemented where needed
- [ ] **Type safety** verified (TypeScript strict mode)

## Documentation
- [ ] **README updated** (if new features added)
- [ ] **API docs generated** (if API changes)
- [ ] **Comments added** (for complex logic only)
- [ ] **CLAUDE.md updated** (if architecture changes)

## ORCHESTRAI Deliverables
- [ ] **Files in correct location** (`/projects/[uuid]/deliverables/`)
- [ ] **Project CLAUDE.md updated** (progress entry appended, top quick win + P1 technical issue noted)
- [ ] **Content queue status updated** (queue items moved to In Progress / Published / Blocked as appropriate)

## Pipeline-Specific Checks

**If Content Pipeline:**
- [ ] Language purity: 100% (zero contamination)
- [ ] AI detection: <30% risk
- [ ] Structure compliance: 40/40/20 paragraph distribution

**If Web Development Pipeline:**
- [ ] Static-first verified (no unnecessary frameworks)
- [ ] Lighthouse score: ≥ 90 (all metrics)
- [ ] Accessibility: WCAG 2.1 AA compliant

**If SEO Pipeline:**
- [ ] Keyword integration complete
- [ ] Meta tags optimized
- [ ] Technical SEO verified

---

**✅ If all checked**: Proceed with completion
**⚠️ If any unchecked**: Complete remaining tasks before stopping

*This quality gate ensures ORCHESTRAI delivers consistent, high-quality results.*
