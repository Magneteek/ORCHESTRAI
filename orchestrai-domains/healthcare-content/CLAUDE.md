# Healthcare Content Domain

## Domain Overview

The Healthcare Content Domain provides specialized medical and dental content creation with clinical accuracy, patient-centered messaging, and compliance with healthcare marketing regulations. This domain combines medical expertise with psychographic targeting for patient education and practice marketing.

**Domain Focus**: Medical/dental content, patient education, procedure explanations, compliance-aware marketing

---

## Specialized Agents

### Healthcare Content Agents
- **`healthcare-content-specialist`** - Medical/dental content with clinical accuracy
- **`medical-content-validator`** - Clinical accuracy and compliance verification
- **`patient-education-specialist`** - Patient-friendly medical explanations

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Healthcare Content Workflow

### MANDATORY: Clinical Accuracy + Patient Psychology

```
Phase 1: Medical Research
  - Verify clinical accuracy
  - Check latest medical guidelines
  - Confirm procedure details

Phase 2: Outline Creation
  Task tool → content-outline-architect → Healthcare Outline
  - Medical accuracy requirements
  - Patient anxiety mitigation
  - Compliance considerations

Phase 3: Content Creation
  Task tool → healthcare-content-specialist → Patient-Centered Content
  - Medically accurate information
  - Empathetic, anxiety-reducing tone
  - Clear procedure explanations

Phase 4: Medical Validation
  Task tool → medical-content-validator → Accuracy Check
  - Clinical fact-checking
  - Compliance verification
  - Safety disclaimers

Phase 5: Standard Content QA
  - AI detection (<30%)
  - Natural flow validation
  - Readability assessment
```

---

## Healthcare-Specific Requirements

### 1. Medical Accuracy (CRITICAL)
```
✅ All medical claims must be verifiable
✅ Cite medical sources where appropriate
✅ Include appropriate disclaimers
✅ Avoid absolute guarantees or outcomes
```

### 2. Patient-Centered Communication
```
✅ Acknowledge patient fears and concerns
✅ Explain medical terms in plain language
✅ Use empathetic, reassuring tone
✅ Address common questions proactively
```

### 3. Compliance Considerations
```
✅ HIPAA awareness (no patient identifiers)
✅ Truthful advertising (no false claims)
✅ Appropriate disclaimers
✅ Ethical marketing practices
```

### 4. Content Architecture (Healthcare)
```
- Pre-procedure concerns → Address anxiety first
- What to expect → Build confidence
- Procedure details → Clinical but accessible
- Recovery and aftercare → Practical guidance
- Cost and insurance → Transparent information
```

---

## Integration Patterns

### With Client Intelligence
```javascript
// Use psychographic data for patient targeting
const icp = await memory.retrieve(`${clientName}-ICP`)

// Target anxious vs. confident patient segments
Anxious (60%): Empathetic, detailed reassurance
Confident (40%): Efficient, fact-focused information
```

### With SEO Domain
```javascript
// Healthcare keyword research
Task(subagent_type="seo-keyword-research", prompt="Research medical keywords...")

// Search intent for healthcare queries
Informational: "what is dental implant procedure"
Commercial: "dental implant cost comparison"
Transactional: "book dental implant consultation"
```

---

## File Organization

```
/projects/[client-uuid]/
├── deliverables/
│   └── content/
│       └── healthcare/
│           ├── procedures/
│           │   ├── dental-implants-comprehensive-guide.md
│           │   ├── root-canal-patient-guide.md
│           │   └── orthodontics-overview.md
│           ├── education/
│           │   ├── oral-health-basics.md
│           │   └── post-procedure-care.md
│           └── compliance-review/
│               └── medical-accuracy-verification.json
```

---

## Healthcare Content Best Practices

### 1. Balance Clinical Accuracy with Accessibility
```
❌ WRONG: "The osseointegration process involves..."
✅ CORRECT: "Your new dental implant will naturally fuse with your jawbone over 3-6 months..."
```

### 2. Address Patient Anxiety Explicitly
```
✅ "Many patients worry about pain during the procedure. Here's what you can actually expect..."
✅ "It's completely normal to feel nervous. Let's walk through each step..."
```

### 3. Use Patient-Friendly Language
```
Medical Term → Patient-Friendly Alternative:
- Osseointegration → Bone fusion / Natural healing process
- Edentulous → Missing teeth / Lost teeth
- Prophylaxis → Professional teeth cleaning
- Endodontic → Root canal treatment
```

### 4. Include Appropriate Disclaimers
```
✅ "Results may vary based on individual circumstances"
✅ "Consult with your dentist to determine the best treatment option for you"
✅ "Individual healing times may differ"
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[../../CONTENT-CREATION-GUIDE.md](../../CONTENT-CREATION-GUIDE.md)** - Content creation workflow
- **[../content/CLAUDE.md](../content/CLAUDE.md)** - General content domain

---

**This domain applies healthcare-specific standards on top of universal content creation workflow. Medical accuracy and patient empathy are paramount.**
