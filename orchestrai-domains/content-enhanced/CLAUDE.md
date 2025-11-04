# Content Enhanced Domain

## Domain Overview

The Content Enhanced Domain extends the base content domain with advanced quality gates, structure correction automation, and AI phrase detection capabilities for enterprise-grade content production.

**Domain Focus**: Advanced quality gates, automated structure correction, AI detection prevention

---

## Specialized Agents

### Enhanced Quality Agents
- **`content-ai-phrase-detector`** - Advanced AI phrase detection with contextual analysis (<30% threshold)
- **`content-structure-corrector`** - Automated content architecture correction
- **`content-quality-validator`** - Comprehensive quality assessment

**See [../../.claude/agents/](../../.claude/agents/) and [../content/CLAUDE.md](../content/CLAUDE.md) for base content agents.**

---

## Enhanced Content Workflows

### Advanced AI Detection Prevention

**Mandatory for all content:**

```
Phase 1: Content Creation
  Task tool → content-writer-specialist → Full Article

Phase 2: AI Detection Validation (MANDATORY)
  Task tool → content-ai-phrase-detector → Detection Analysis
  
  Threshold: <30% AI detection risk
  Target: 15-25% (human-level detection range)
  
  If >30%: Automatic revision required

Phase 3: Structure Correction (if needed)
  Task tool → content-structure-corrector → Architecture Fix
  
  Corrections:
  - Excessive table usage
  - Paragraph distribution (40/40/20)
  - List over-usage
  - Language purity preservation
```

### Automated Quality Gates

```
Gate 1: AI Detection (<30%)
  → content-ai-phrase-detector
  
Gate 2: Structure Validation
  → content-structure-corrector
  
Gate 3: Quality Assessment
  → content-quality-validator
  
Gate 4: Final Approval
  → Human review (if any gate fails)
```

---

## AI Detection Prevention Framework

### Forbidden Phrases (Auto-Detected)
```
❌ "Picture yourself"
❌ "Let's be honest"
❌ "If you've ever dreamed of"
❌ "Here's what makes"
❌ "The truth is"
❌ "What's interesting is"
❌ "Imagine a world where"
❌ "In today's fast-paced world"
```

### Structural Pattern Avoidance
```
❌ Every paragraph starts with bold text
❌ Repetitive section openings
❌ Formulaic transitions
❌ Excessive use of weak intensifiers
❌ Generic superlatives without specifics
```

### Human-Like Writing Signals
```
✅ Specific measurements and numbers
✅ Honest limitations acknowledgment
✅ Varied sentence structure
✅ Natural conversational flow
✅ Reader-centric language
✅ Relatable examples and scenarios
```

---

## Structure Correction Capabilities

### Automated Fixes
```
Problem: Excessive tables (>8 per article)
Fix: Convert tables to flowing paragraphs where appropriate

Problem: Paragraph distribution off (not 40/40/20)
Fix: Split/merge paragraphs to achieve target distribution

Problem: Too many lists (>20 bulleted lists)
Fix: Convert lists to paragraph narrative

Problem: Language contamination (English in Dutch content)
Fix: Identify and flag (manual correction recommended)
```

### Preservation Guarantees
```
✅ Writing quality preserved
✅ Language purity maintained
✅ Content accuracy unchanged
✅ SEO keyword integration intact
```

---

## Integration with Universal Agent Pattern

```javascript
// Enhanced content workflow
Task(subagent_type="content-writer-specialist", prompt="Write article...")
  ↓
Task(subagent_type="content-ai-phrase-detector", prompt="Validate AI detection...")
  ↓  
Task(subagent_type="content-structure-corrector", prompt="Fix structure if needed...")
  ↓
Task(subagent_type="content-quality-validator", prompt="Final quality assessment...")
```

---

## Enhanced Quality Metrics

### AI Detection Targets
```
Acceptable: <30% (proceed with publication)
Warning: 30-40% (review recommended)
Rejected: >40% (revision required)

Optimal Range: 15-25% (human-level detection)
```

### Structure Compliance
```
Paragraph Distribution: 40/40/20 (±5% tolerance)
Bulleted Lists: Maximum 16-20 total
Tables: Maximum 6-8 comparison tables
Bold Text: Maximum 10-15 instances
Language Purity: 100% target language
```

---

## Integration with Base Content Domain

The Enhanced domain extends [../content/CLAUDE.md](../content/CLAUDE.md):

```
Base Content Workflow:
  Phase 1-4: Research, Outline, Approval, Writing
  
Enhanced Quality Gates (Phase 5):
  ✅ AI Detection Validation
  ✅ Structure Correction
  ✅ Quality Assessment
  ✅ Final Compliance Check
```

---

## File Organization

```
/projects/[client-uuid]/
├── deliverables/
│   └── content/
│       └── [language]/
│           ├── articles/
│           └── quality-reports/
│               ├── ai-detection-results.json
│               ├── structure-analysis.json
│               └── quality-assessment.json
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[../../CONTENT-CREATION-GUIDE.md](../../CONTENT-CREATION-GUIDE.md)** - Complete workflow
- **[../content/CLAUDE.md](../content/CLAUDE.md)** - Base content domain
- **[../../.claude/agents/content-ai-phrase-detector.md](../../.claude/agents/content-ai-phrase-detector.md)** - AI detection agent
- **[../../.claude/agents/content-structure-corrector.md](../../.claude/agents/content-structure-corrector.md)** - Structure correction agent

---

**This enhanced domain adds enterprise-grade quality gates to base content creation. AI detection <30% is mandatory for all content.**
