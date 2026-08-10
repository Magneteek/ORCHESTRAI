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

### 5. 4-C Content Coverage — MANDATORY for Aesthetic/Elective Procedures

For dental implants, clear aligners, orthodontics, and any aesthetic medical procedure, every content piece must cover all four pillars. **Missing any C = incomplete content.**

**Priority order for dental niches:**

| Priority | Pillar | Dental Application |
|---|---|---|
| 1 | **Visualization** | Before/after smile galleries, transformation narratives, measurable outcomes (chewing restored, smile line corrected) |
| 2 | **Commercialization** | Cost ranges, insurance coverage, financing, value vs. alternatives (implant vs. bridge vs. denture) |
| 3 | **Verbalization** | What it feels like, pain levels, what to expect at each appointment, anxiety addressed directly |
| 4 | **Contextualization** | Procedure types compared, doctor credentials, patient reviews with case attribution |

**Doctor/Specialist Validation is a structured section, not conversational flavour.** Every aesthetic dental content piece must include:
```
✅ Doctor's credentials and specialisation (DDS, Orthodontist, Periodontist)
✅ Years of experience and case volume (specific numbers)
✅ Before/after cases attributed to this specific doctor
✅ Professional association memberships or certifications
```

**Outline Approval Checkpoint — 4-C Coverage Check:**
Before proceeding past Phase 3 (outline approval), verify all four Cs are present in the planned outline:
```
□ Visualization section planned (before/after, transformation evidence)
□ Commercialization section planned (cost, financing, value framing)
□ Verbalization section planned (experience, anxiety mitigation, what to expect)
□ Contextualization section planned (types, doctor credentials, reviews)

IF ANY BOX UNCHECKED → Add missing section to outline before approval
```

---

## Integration Patterns

### With Client Intelligence
```javascript
// Use psychographic data for patient targeting
const icp = await memory.retrieve(`${clientName}-ICP`)

// Target anxious vs. confident patient segments
Anxious (60%): Lead with Verbalization + Visualization (what it looks like, what it feels like)
Confident (40%): Lead with Commercialization + Contextualization (cost, types, credentials)
```

**4-C emphasis shifts by psychographic segment:**
- Anxious patient: Verbalization first → Visualization second → Contextualization → Commercialization
- Confident patient: Commercialization first → Contextualization → Visualization → Verbalization

**Myth-Busting Layer (from 24-Section ICP `falseSolutionLie` / `mistakenBeliefTruth`):**
Every dental content piece should address at least one myth using the False Solution framework. Common dental myths:
```
Implants: "Too painful", "Too expensive compared to dentures", "Only for older patients"
Aligners: "Only work for mild cases", "Take longer than braces", "You can see them"
Use falseSolutionLie → falseSolutionTruth → falseSolutionTip structure from ICP framework
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

### 1. Make Visualization Concrete and Measurable
```
❌ WRONG: "Patients achieve great results with dental implants"
✅ CORRECT: "Within 3-6 months of implant placement, most patients report eating foods they avoided for years — steak, apples, crusty bread — without thinking twice. The before/after difference isn't just cosmetic."
```

Include specific transformation milestones:
- Implants: immediate post-op, 3-month osseointegration, 12-month final result
- Aligners: 4-week increments showing movement progression, final smile line comparison
- Always frame measurable outcomes (bone density preserved, bite force restored, gap closed by X mm)

### 2. Balance Clinical Accuracy with Accessibility
```
❌ WRONG: "The osseointegration process involves..."
✅ CORRECT: "Your new dental implant will naturally fuse with your jawbone over 3-6 months..."
```

### 3. Address Patient Anxiety Explicitly
```
✅ "Many patients worry about pain during the procedure. Here's what you can actually expect..."
✅ "It's completely normal to feel nervous. Let's walk through each step..."
```

### 4. Use Patient-Friendly Language
```
Medical Term → Patient-Friendly Alternative:
- Osseointegration → Bone fusion / Natural healing process
- Edentulous → Missing teeth / Lost teeth
- Prophylaxis → Professional teeth cleaning
- Endodontic → Root canal treatment
```

### 5. Include Appropriate Disclaimers
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
