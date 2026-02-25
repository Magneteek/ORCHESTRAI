# SOUL.md Usage Guide for ORCHESTRAI

**Purpose**: How to use personality files with ORCHESTRAI's 173 capabilities
**Status**: Production Ready
**Version**: 1.0

---

## What is SOUL.md?

**SOUL.md** makes ORCHESTRAI's 173 capabilities speak with **your voice** (or your client's voice) instead of generic AI.

### Without SOUL.md
```
User: "Create SEO strategy"
ORCHESTRAI: [Generic best practices, corporate speak, AI-typical voice]
```

### With SOUL.md
```
User: "Create SEO strategy"
ORCHESTRAI: [YOUR specific takes, YOUR decision patterns, YOUR communication style]
```

---

## File Structure

```
ORCHESTRAI/
├── SOUL.md                    # Your default personality
├── STYLE.md                   # Your communication patterns
├── CLAUDE.md                  # Technical project instructions
├── souls/                     # Multiple personality profiles
│   ├── kris-strategic/        # Strategic planning mode
│   │   └── SOUL.md
│   ├── client-healthcare/     # Client-specific voice
│   │   └── SOUL.md
│   └── client-tech-startup/   # Another client voice
│       └── SOUL.md
```

---

## Three SOUL.md Types

### 1. **Root SOUL.md** (Your Default)
```
Location: /Users/kris/CLAUDEtools/ORCHESTRAI/SOUL.md
Purpose: Your personal voice, decision patterns, values
When Used: Default for all ORCHESTRAI operations
```

**What's in it**:
- Your identity (systems architect, quality-focused, evidence-driven)
- Your values (skills-first, zero duplication, static-first)
- Your decision patterns (measure → analyze → decide → verify)
- Your strong takes (slash commands are legacy, duplication is waste)
- Your communication style (direct, data-driven, example-heavy)

### 2. **Strategic SOUL.md** (Specialized Mode)
```
Location: souls/kris-strategic/SOUL.md
Purpose: Opus-tier strategic thinking mode
When Used: With 12 strategic orchestrators
```

**What's in it**:
- Strategic frameworks (OPSP, EOS, financial modeling)
- Long-term thinking patterns
- Complex coordination approaches
- Board-level communication style

### 3. **Client SOUL.md** (Brand Alignment)
```
Location: souls/[client-name]/SOUL.md
Purpose: Client's brand voice, not yours
When Used: Creating client deliverables
```

**What's in it**:
- Client's brand identity
- Client's voice characteristics
- Client's decision framework
- Client's specific takes
- Client's audience preferences

---

## How ORCHESTRAI Uses SOUL.md

### Auto-Loading (Root SOUL.md)
```
ORCHESTRAI automatically loads:
1. CLAUDE.md (project instructions)
2. SOUL.md (your personality)
3. STYLE.md (communication patterns)

When you invoke ANY skill or agent, these shape the output.
```

### Explicit Loading (Client SOULs)
```javascript
// Load client-specific personality
Skill(skill="content:content-writer-specialist", soul="client-healthcare")

// This loads:
// 1. CLAUDE.md (technical instructions)
// 2. souls/client-healthcare/SOUL.md (client voice)
// 3. Skill-specific prompts
```

---

## Usage Patterns

### Pattern 1: Default Voice (No Specification)
```javascript
// Uses root SOUL.md automatically
Skill(skill="seo:seo-keyword-research")

Output voice:
- Direct, data-driven (your default)
- Evidence-based, specific
- Technical accuracy + your personality
```

### Pattern 2: Client Voice (Explicit)
```javascript
// Loads client SOUL.md
Skill(skill="content:content-writer-specialist", soul="client-healthcare")

Output voice:
- Client's brand personality
- Client's specific takes
- Client's communication style
- Still technically accurate (ORCHESTRAI quality)
```

### Pattern 3: Strategic Mode (Specialized)
```javascript
// Loads strategic SOUL.md
Task(subagent_type="strategic-plan-synthesizer", soul="kris-strategic")

Output voice:
- Strategic thinking patterns
- Long-term perspective
- Framework-based approach (OPSP, EOS)
- Board-level communication
```

---

## Creating Client SOULs

### Step 1: Copy Template
```bash
cp -r souls/client-template souls/[client-name]
```

### Step 2: Fill in Details
```
Edit souls/[client-name]/SOUL.md:

Required sections:
- Brand Identity (who they are, what makes them different)
- Brand Voice (tone, language, examples)
- Decision Framework (how they evaluate, prioritize)
- Strong Takes (specific opinions, not generic)
- Target Audience (who they serve, how they think)
- Content Standards (format, evidence, quality)
```

### Step 3: Test Output
```javascript
// Generate sample content
Skill(skill="content:content-writer-specialist", soul="[client-name]",
     args="Write introduction for healthcare AI white paper")

// Compare to examples in client SOUL.md
// Refine SOUL.md if output doesn't match
```

### Step 4: Iterate
```
1. Client reviews output
2. Note what sounds right vs wrong
3. Update SOUL.md with specific examples
4. Re-test until voice is accurate
```

---

## Examples: Root SOUL.md in Action

### SEO Strategy (With ORCHESTRAI SOUL)
```
Input: Skill(skill="seo:seo-keyword-research", args="healthcare AI")

Output (with SOUL.md):
"Analysis: Healthcare AI keywords show 45% YoY growth.

Top opportunities:
1. 'HIPAA compliant AI tools' (2.4K/mo, low competition)
2. 'clinical AI deployment' (890/mo, mid competition)
3. 'healthcare AI integration' (1.2K/mo, high competition)

Decision: Target #1 first (volume + low competition = quick wins).
Rationale: Mid-market hospitals search compliance terms before features.

Implementation:
- Month 1: HIPAA content cluster (5 articles)
- Month 2: Case studies (compliance audit results)
- Month 3: Technical documentation (deployment guides)

Measurement: Track rankings weekly, expect page 1 within 60 days for #1."

This matches ORCHESTRAI voice:
✅ Data-driven (specific numbers)
✅ Direct (clear recommendations)
✅ Action-oriented (implementation steps)
✅ Measurable (60-day target)
```

### Same Request Without SOUL.md
```
Output (generic AI):
"Healthcare AI is a growing field with many keyword opportunities.
You should consider targeting relevant terms that your audience
searches for. Some important keywords include compliance-related
terms and integration topics. Create content that addresses these
areas and monitor your rankings over time."

This is generic AI:
❌ Vague ("many opportunities" - how many?)
❌ Soft language ("you should consider" - decide!)
❌ No specifics (no volumes, competition, timeline)
❌ No measurement (no targets or verification)
```

---

## Examples: Client SOUL.md in Action

### Healthcare Client Content
```
Input: Skill(skill="content:content-writer-specialist",
            soul="client-healthcare",
            args="Blog post: Benefits of AI in clinical workflows")

Output (with client SOUL.md):
"Mid-market hospitals face a dilemma: Enterprise AI platforms
cost $5M+ annually, but simple tools lack clinical sophistication
needed for real-world workflows.

Our HIPAA-compliant platform bridges this gap. Recent study across
15 hospitals (n=247 clinicians, 12-month deployment) showed:

- 32% reduction in documentation time
- Zero HIPAA violations in external audits
- 89% clinician adoption rate (industry avg: 45%)

The key? Clinical-grade algorithms designed BY clinicians FOR
clinicians, not by AI researchers in isolation.

Unlike black-box enterprise solutions, our explainable AI shows
clinical reasoning for every recommendation..."

This matches client voice:
✅ Mid-market focus (their niche)
✅ Evidence-based (specific study data)
✅ Compliance emphasis (HIPAA highlighted)
✅ Clinician-centric (their differentiation)
```

### Same Request Without Client SOUL.md
```
Output (generic AI):
"AI is transforming healthcare workflows with innovative solutions
that help hospitals improve efficiency. Benefits include:

- Reduced administrative burden
- Improved patient care
- Better resource utilization
- Enhanced decision-making

Organizations implementing AI see significant improvements across
various metrics. The technology continues to evolve, offering new
opportunities for healthcare providers to optimize operations..."

This is generic, not client-specific:
❌ No mid-market positioning
❌ Vague claims ("significant improvements")
❌ No compliance emphasis
❌ Could be any AI vendor
```

---

## Integration with 173 Capabilities

### Skills (161) + SOUL.md
```
Every skill can use personality:

SEO Skills:
Skill(skill="seo:seo-keyword-research", soul="[name]")
Skill(skill="seo:seo-competitor-analysis", soul="[name]")
Skill(skill="seo:seo-technical-analysis", soul="[name]")

Content Skills:
Skill(skill="content:content-writer-specialist", soul="[name]")
Skill(skill="content:content-ai-phrase-detector", soul="[name]")
Skill(skill="content:multi-language-content-adapter", soul="[name]")

WebDev Skills:
Skill(skill="webdev:frontend-architect-specialist", soul="[name]")
Skill(skill="webdev:backend-development-specialist", soul="[name]")

Command Skills:
Skill(skill="commands:init-client-project", soul="[name]")
Skill(skill="commands:qa-content", soul="[name]")

... all 161 skills can use personality
```

### Agents (12) + SOUL.md
```
Strategic orchestrators with personality:

Task(subagent_type="orchestrai-master-coordinator", soul="kris-strategic")
Task(subagent_type="strategic-plan-synthesizer", soul="kris-strategic")
Task(subagent_type="financial-modeling-specialist", soul="kris-strategic")
... all 12 agents can use personality
```

---

## Quality Verification

### How to Know SOUL.md is Working

**Test 1: Voice Recognition**
```
Generate output, then ask:
"Would I (or my client) actually say this?"

✅ Yes → SOUL.md is working
❌ No → Refine SOUL.md with specific examples
```

**Test 2: Prediction**
```
Ask someone who knows you/client:
"What would [name] say about [new topic]?"

Compare prediction to SOUL.md output.

✅ Match → SOUL.md captures personality
❌ Mismatch → Missing core values or takes
```

**Test 3: Differentiation**
```
Generate same content with/without SOUL.md:

Without: Generic AI voice
With: Distinctly recognizable personality

Difference should be obvious.
```

---

## Common Patterns

### Pattern: Multi-Client Agency
```
Structure:
souls/
├── client-healthcare-a/
├── client-healthcare-b/
├── client-tech-startup-a/
├── client-ecommerce-a/
└── client-financial-a/

Usage:
// Healthcare client A content
Skill(skill="content:writer", soul="client-healthcare-a")

// Tech startup client A content
Skill(skill="content:writer", soul="client-tech-startup-a")

Each client gets brand-aligned deliverables automatically.
```

### Pattern: Personal Modes
```
Structure:
SOUL.md (default - technical, direct)
souls/
├── kris-strategic/ (board-level, long-term)
├── kris-creative/ (bold, experimental)
└── kris-teaching/ (educational, patient)

Usage:
// Strategic planning
Task(subagent_type="strategic-plan-synthesizer", soul="kris-strategic")

// Creative brainstorming
Skill(skill="content:writer", soul="kris-creative")

// Educational content
Skill(skill="content:writer", soul="kris-teaching")
```

### Pattern: Team Collaboration
```
Structure:
souls/
├── kris/ (your personality)
├── teammate-designer/ (designer's voice)
├── teammate-developer/ (developer's voice)
└── shared-brand/ (company voice)

Usage:
Same ORCHESTRAI system, different personalities per team member.

Each person's SOUL.md loads their decision patterns, values, voice.
```

---

## Best Practices

### ✅ Do
- **Be specific** - "Delete duplicate agents" not "optimize architecture"
- **Include contradictions** - Real opinions conflict, generic ones don't
- **Use examples** - Show what you DO say vs what you DON'T
- **Measure impact** - Compare outputs with/without SOUL.md
- **Update regularly** - Voice evolves, SOUL.md should too

### ❌ Don't
- **Be vague** - "Nuanced views" tells AI nothing
- **Seek coherence** - Generic AI is perfectly coherent and boring
- **Skip examples** - Without examples, AI guesses your voice
- **Set and forget** - SOUL.md needs refinement
- **Copy others** - Your SOUL.md should be uniquely you/your client

---

## Troubleshooting

### Problem: Output Still Sounds Generic
```
Solution:
1. Add more specific examples to SOUL.md
2. Include strong takes (controversial is better than safe)
3. Show what you DON'T say (contrast matters)
4. Test with specific prompts
5. Iterate based on what sounds wrong
```

### Problem: Different Skills Sound Different
```
Expected: Each skill has personality + domain expertise
Example:
- SEO skill with SOUL: Technical + your voice
- Content skill with SOUL: Creative + your voice
- Both should sound like YOU, just different domains
```

### Problem: Client SOUL Not Loading
```
Verification:
1. Check file path: souls/[client-name]/SOUL.md exists?
2. Check invocation: soul="[client-name]" (exact match)?
3. Check SOUL.md: Required sections complete?
4. Test: Generate output, compare to examples in SOUL.md
```

---

## Advanced: SOUL.md + CLAUDE.md

### How They Work Together
```
CLAUDE.md: Technical project instructions
  "Use static-first architecture"
  "Test coverage ≥85%"
  "One client = one folder"

SOUL.md: Personality and voice
  "Direct, not diplomatic language"
  "Data-driven decisions"
  "Measure before acting"

Together:
  Technical accuracy + personality voice
  Not just "what" but "how" to communicate
```

### Example: Code Review
```
CLAUDE.md says: "Test coverage must be ≥85%"

Generic AI: "Test coverage appears to be below threshold"

With SOUL.md: "Blocking: Test coverage 73% (minimum 85%)
  Failed files:
  - helpers.js: 45%
  - widget.js: 62%
  Action: Add tests before deployment"

Same technical requirement, different communication style.
```

---

## Next Steps

### 1. Use Root SOUL.md
```
Already created: /Users/kris/CLAUDEtools/ORCHESTRAI/SOUL.md

Test it:
Skill(skill="seo:seo-keyword-research", args="test topic")

Compare output to your normal voice.
```

### 2. Create First Client SOUL.md
```
cp -r souls/client-template souls/[actual-client-name]
Edit souls/[actual-client-name]/SOUL.md
Test with sample content
Refine based on output
```

### 3. Measure Impact
```
Generate same content:
A) Without SOUL.md (generic)
B) With SOUL.md (personality)

Difference should be obvious and measurable.
```

### 4. Iterate
```
SOUL.md improves with use:
- Note what sounds right/wrong
- Add examples of both
- Refine strong takes
- Update decision patterns
- Test again
```

---

## Summary

**SOUL.md Purpose**: Personality layer for ORCHESTRAI's 173 capabilities

**Three Types**:
1. Root (your default voice)
2. Strategic (specialized modes)
3. Client (brand alignment)

**Integration**:
- 161 skills can use personality
- 12 agents can use personality
- Auto-loads or explicit specification

**Quality Test**: "Would I/client actually say this?"

**Result**: Technical accuracy + recognizable voice (not generic AI)

---

**Version**: 1.0
**Status**: Production Ready
**Next**: Test with root SOUL.md, create client SOULs as needed
**Verification**: Outputs should sound distinctly different from generic AI

---

## Quick Reference

```bash
# Check files exist
ls SOUL.md STYLE.md
ls souls/*/SOUL.md

# Test default voice
Skill(skill="seo:seo-keyword-research")

# Test client voice
Skill(skill="content:content-writer-specialist", soul="client-name")

# Test strategic voice
Task(subagent_type="strategic-plan-synthesizer", soul="kris-strategic")

# Verify personality difference
# Generate same content with/without SOUL.md
# Difference should be obvious
```

---

**Created**: February 17, 2026
**Purpose**: SOUL.md integration with ORCHESTRAI
**Status**: ✅ Production
