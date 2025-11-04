# Content Domain

## Domain Overview

The Content Domain provides high-quality, psychographic-targeted content creation across multiple languages and formats. This domain orchestrates content creation workflows with AI detection prevention, natural flow optimization, and comprehensive quality assurance.

**Domain Focus**: Multi-language content (EN, ES, NL, DE, SL) with psychographic targeting and SEO optimization

---

## Specialized Agents

This domain leverages the following specialized Claude Code agents via the **Universal Agent Delegation Pattern**:

### Content Creation Agents
- **`content-writer-specialist`** - Advanced content creation with AI phrase detection and natural voice
- **`multi-language-content-adapter`** - Cultural and linguistic content adaptation
- **`content-outline-architect`** - Strategic content structure and topical authority planning
- **`content-quality-validator`** - Comprehensive quality assessment and completeness validation

### Optimization & Enhancement Agents
- **`content-ai-phrase-detector`** - AI phrase detection with contextual analysis (<30% threshold)
- **`content-structure-corrector`** - Automated content architecture correction
- **`content-title-generator`** - Creative title optimization with market awareness
- **`content-cluster-suggester`** - Semantic content clustering and topical relationships

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Mandatory Content Creation Workflow

**CRITICAL: All content creation MUST follow this exact sequence - NO EXCEPTIONS**

### Phase 1: Research & Analysis
```
1. Review client psychographic data
2. Analyze competitive content
3. Identify target keywords
4. Check crystalline memory for existing cluster content
```

### Phase 2: Outline Creation (MANDATORY BEFORE WRITING)
```
Task tool → content-outline-architect → Comprehensive Outline

Deliverables:
- [topic]-comprehensive-outline.md
- Psychographic targeting per section
- Keyword mapping strategy
- Word count planning
- Internal linking architecture
```

### Phase 3: Outline Approval (STOP POINT)
```
TodoWrite: Mark outline as COMPLETED
⚠️ DO NOT proceed to writing without explicit approval
```

### Phase 4: Article Writing (MANDATORY AGENT USAGE)
```
Task tool → content-writer-specialist → Full Article

CRITICAL REQUIREMENTS:
- Use Task tool (NEVER Write tool directly)
- Include anti-AI phrase instructions
- Follow paragraph distribution (40/40/20)
- Integrate psychographic targeting
- Natural conversational flow
```

**Parallel Execution for Multiple Articles**:
```javascript
// Launch ALL agents simultaneously in ONE message
Task(subagent_type="content-writer-specialist", prompt="Article 1...")
Task(subagent_type="content-writer-specialist", prompt="Article 2...")
Task(subagent_type="content-writer-specialist", prompt="Article 3...")
// 60-70% time savings through parallelization
```

### Phase 5: Quality Assurance (MANDATORY QA GATES)
```
1. AI Detection Validation:
   Task tool → content-ai-phrase-detector
   Threshold: <30% AI detection risk
   Target: 15-25% (human-level)

2. Quality Validation:
   Task tool → content-quality-validator
   - Paragraph distribution (40/40/20)
   - Readability assessment
   - Engagement elements

3. Structure Correction (if needed):
   Task tool → content-structure-corrector
   - Fix excessive tables
   - Correct paragraph distribution
   - Preserve language purity
```

### Phase 6: Iterative Revision (WHEN NEEDED)
```
If AI detection >30% or quality issues found:
  Task tool → content-writer-specialist (revision mode)
  - Enhanced natural flow
  - Transition improvements
  - Voice refinement
```

**See [../../CONTENT-CREATION-GUIDE.md](../../CONTENT-CREATION-GUIDE.md) for complete workflow, quality checklists, and prompting strategies.**

---

## Integration with Universal Agent Pattern

All content agents follow the **Universal Agent Delegation Pattern** documented in [../../CLAUDE.md](../../CLAUDE.md):

### Direct Invocation Pattern
```javascript
// For single article creation
Task(
  subagent_type="content-writer-specialist",
  prompt="Write conversational article about [topic]..."
)
```

### Parallel Execution Pattern
```javascript
// For multiple independent articles
// ✅ CORRECT: Launch ALL in ONE message
Task(subagent_type="content-writer-specialist", prompt="Article 1...")
Task(subagent_type="content-writer-specialist", prompt="Article 2...")
Task(subagent_type="content-writer-specialist", prompt="Article 3...")

// ❌ INCORRECT: Sequential execution (3x slower)
// Waiting between each article
```

### Pipeline Coordination Pattern
```javascript
// For content + QA workflow
content-pipeline-task-orchestrator.js
  ↓
Gate 1: Launch content-writer-specialist
  ↓
Gate 2: Run content-ai-phrase-detector (<30% check)
  ↓
Gate 3: Apply content-quality-validator
  ↓
Gate 4: Conditional revision if needed
```

---

## File Organization

### Content Deliverables Structure
```
/projects/[client-uuid]/
├── deliverables/
│   └── content/
│       ├── [language]/                    # e.g., nl/, en/, es/
│       │   ├── articles/
│       │   │   ├── article-slug.md
│       │   │   └── article-slug-comprehensive-outline.md
│       │   ├── cluster-content/
│       │   │   └── [cluster-name]/
│       │   └── qa-reports/
│       │       ├── ai-detection-results.json
│       │       └── quality-validation-results.json
│       └── multi-language/
│           └── adapted-content/
├── client-intelligence/
│   └── icp-analysis.json                  # Used for psychographic targeting
└── crystalline-memory-index.json
```

### CRITICAL: Language Purity Rule
**100% target language - ZERO English contamination**

❌ **INCORRECT**: Mixing languages in content
✅ **CORRECT**: Pure target language throughout

---

## Content Architecture Standards

### Mandatory Paragraph Distribution
- **40% Short Paragraphs** (1-2 sentences): Impact, emphasis
- **40% Medium Paragraphs** (3-5 sentences): Main flow, explanations
- **20% Long Paragraphs** (6+ sentences): Storytelling, detailed analysis

### Content Element Limits
- **Bulleted Lists**: Maximum 16-20 total per article
- **Numbered Lists**: Maximum 8-12 total per article
- **Tables**: 6-8 comparison tables maximum
- **Callout Boxes**: 15-18 for engagement
- **Bold Text**: 10-15 instances (true emphasis only)

### Natural Writing Flow Requirements
1. **Seamless Transitions**: Each paragraph connects naturally
2. **Varied Sentence Structure**: Mix short/medium/long sentences
3. **Reader-Centric Language**: Direct "you" address
4. **Conversational Tone**: Expert friend explaining over coffee
5. **Storytelling Elements**: Relatable scenarios and examples

**See [../../CONTENT-CREATION-GUIDE.md](../../CONTENT-CREATION-GUIDE.md) for complete standards.**

---

## Agent Prompting Strategies

### ✅ Enhanced Conversational Prompting (USE THESE)

**For Explanatory Content**:
```
"Write a natural, conversational section that guides the reader through [topic].
Start with their main concerns about [specific worry], build understanding
progressively, and connect each idea to the next. Make it sound like an expert
friend explaining this over coffee."
```

**For Comparison Content**:
```
"Guide the reader through comparing [option A] vs [option B] as if you're
helping a friend make this decision. Start with what they're probably wondering
about, address their concerns naturally, and help them understand the real-world
implications."
```

**Anti-AI Detection Instructions** (MANDATORY):
```
CRITICAL AI DETECTION PREVENTION:
- FORBIDDEN PHRASES: "Picture yourself", "Let's be honest", "If you've ever
  dreamed of", "Here's what makes", "The truth is", "What's interesting is"
- AVOID: Repetitive section openings, formulaic patterns, weak intensifiers
- USE: Specific details, measurements, numbers, honest limitations
- TARGET: Natural conversational flow that sounds human
```

### ❌ Traditional Prompting (AVOID THESE)
```
❌ "Write paragraphs covering these content requirements"
❌ "Create content about the following topics"
❌ "Cover these points in paragraph form"
```

---

## Quality Assurance Thresholds

### AI Detection Threshold (MANDATORY)
```
Risk Level:
- <30% = ACCEPTABLE (proceed)
- 30-40% = WARNING (review recommended)
- >40% = REJECT (revision required)

Target Range:
- 15-25% = Ideal (human-level detection)
```

### Quality Validation Checklist
```
□ Language Consistency: Pure target language (no mixing)
□ Paragraph Distribution: 40/40/20 (±5% tolerance)
□ Content Variety: Tables, boxes, engagement elements
□ Bold Text: Used sparingly (10-15 instances max)
□ Natural Transitions: Smooth paragraph connections
□ Conversational Tone: Expert-friend voice
□ Psychographic Alignment: Matches target audience
□ Word Count: Within target range
□ Keyword Integration: Natural, not forced
```

---

## Domain-Specific Best Practices

### 1. ALWAYS Create Outlines First
```bash
# ❌ INCORRECT: Skipping outline phase
Task(subagent_type="content-writer-specialist", "Write article about...")

# ✅ CORRECT: Outline → Approval → Writing
Task(subagent_type="content-outline-architect", "Create comprehensive outline...")
# Wait for approval
Task(subagent_type="content-writer-specialist", "Write based on approved outline...")
```

### 2. Use Parallel Execution for Multiple Articles
```javascript
// When writing 2+ independent articles
// Launch ALL simultaneously in ONE message
Task(subagent_type="content-writer-specialist", prompt1)
Task(subagent_type="content-writer-specialist", prompt2)
Task(subagent_type="content-writer-specialist", prompt3)
// 60-70% faster than sequential
```

### 3. Run AI Detection on ALL Content
```javascript
// MANDATORY quality gate
Task(
  subagent_type="content-ai-phrase-detector",
  prompt="Analyze [article] for AI detection risk..."
)
// If >30% → Revision required
```

### 4. Integrate with Client Psychographics
```javascript
// Reference client ICP analysis
const icp = await memory.retrieve(`${clientName}-ICP`)

// Use psychographic targeting in prompts
"Write for audience segment: ${icp.segments[0].description}
Target emotional tone: ${icp.segments[0].emotionalTone}"
```

### 5. Maintain Language Purity (Multi-Language)
```javascript
// For Dutch content
Task(
  subagent_type="multi-language-content-adapter",
  prompt="Ensure 100% Dutch language purity - zero English contamination..."
)
```

---

## Pipeline Integration

### Content Pipeline Task Orchestrator

The content domain includes a specialized pipeline orchestrator for managing complex content workflows:

```javascript
// orchestrai-shared/pipelines/content-pipeline-task-orchestrator.js

Workflow:
  Gate 1: Launch content-writer-specialist → Full article
  Gate 2: AI detection validation (<30% threshold)
  Gate 3: Quality validation (architecture compliance)
  Gate 4: Conditional revision if needed
  Gate 5: Final approval and publication
```

**Key Features**:
- Automated quality gates
- AI detection enforcement
- Parallel article processing
- Revision loop management
- Memory integration

---

## Multi-Language Content

### Supported Languages
- **English (EN)**: Primary language, global targeting
- **Spanish (ES)**: Latin America and Spain markets
- **Dutch (NL)**: Netherlands and Belgium markets
- **German (DE)**: DACH region (Germany, Austria, Switzerland)
- **Slovenian (SL)**: Slovenia and regional markets

### Language Adaptation Workflow
```
Original Content (EN)
  ↓
Task tool → multi-language-content-adapter
  ↓
Cultural Adaptation:
  - Local idioms and expressions
  - Cultural context sensitivity
  - Regional preferences
  - SEO keyword translation
  ↓
Language Purity Validation (100% target language)
  ↓
Deliverable: /projects/[uuid]/deliverables/content/[language]/
```

---

## Troubleshooting

### Common Issues

**1. AI Detection Score >30%**
```bash
# Analyze specific issues
Task(subagent_type="content-ai-phrase-detector", ...)

# Common culprits:
- Forbidden phrases ("Picture yourself", "Let's be honest")
- Repetitive paragraph openings
- Formulaic section structures
- Weak intensifiers overuse

# Solution: Revision with enhanced natural flow instructions
```

**2. Paragraph Distribution Off (Not 40/40/20)**
```bash
# Use structure corrector
Task(
  subagent_type="content-structure-corrector",
  prompt="Fix paragraph distribution while preserving quality..."
)
```

**3. Content Too List-Heavy**
```bash
# Exceeded 16-20 bulleted lists limit
# Convert lists to flowing paragraphs
# Reserve lists for genuine engagement elements only
```

**4. Language Contamination (Multi-Language)**
```bash
# English words in Dutch content
# Run language purity validation
Task(
  subagent_type="language-validation-specialist",
  prompt="Ensure 100% Dutch purity..."
)
```

---

## Testing

### Manual Content Creation Test
```bash
# 1. Create outline
Task(
  subagent_type="content-outline-architect",
  prompt="Create outline for 'Ultimate Guide to Dental Implants' targeting anxious patients..."
)

# 2. Review and approve outline

# 3. Write article
Task(
  subagent_type="content-writer-specialist",
  prompt="Write full article based on approved outline with natural conversational flow..."
)

# 4. Validate AI detection
Task(
  subagent_type="content-ai-phrase-detector",
  prompt="Analyze article for AI detection risk..."
)
# Expect: <30% detection score

# 5. Quality validation
Task(
  subagent_type="content-quality-validator",
  prompt="Validate paragraph distribution, readability, engagement..."
)
```

---

## Performance Metrics

### Content Quality Targets
- **AI Detection Risk**: <30% (target: 15-25%)
- **Paragraph Distribution**: 40/40/20 (±5% tolerance)
- **Readability Score**: Conversational, accessible
- **Engagement Elements**: 4-6 tables, 15-18 callout boxes
- **Language Purity**: 100% target language (multi-language)

### Production Efficiency
- **Parallel Execution**: 60-70% time savings (3+ articles)
- **First-Pass Quality**: 80%+ pass rate with proper outline
- **Revision Rate**: <20% when following workflow
- **AI Detection Compliance**: 95%+ when using forbidden phrases list

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[../../CONTENT-CREATION-GUIDE.md](../../CONTENT-CREATION-GUIDE.md)** - Complete workflow, checklists, prompting strategies
- **[../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md](../../UNIVERSAL-AGENT-DELEGATION-PATTERN.md)** - Agent invocation patterns
- **[../../.claude/agents/content-writer-specialist.md](../../.claude/agents/content-writer-specialist.md)** - Primary content agent
- **[../../.claude/agents/content-ai-phrase-detector.md](../../.claude/agents/content-ai-phrase-detector.md)** - AI detection agent

---

**This domain follows the Universal Agent Delegation Pattern and Mandatory Content Creation Workflow. See [CONTENT-CREATION-GUIDE.md](../../CONTENT-CREATION-GUIDE.md) for complete quality standards.**
