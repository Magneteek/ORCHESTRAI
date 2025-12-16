# 24-Section ICP Copywriting Framework - Standard Deliverable

**Status:** MANDATORY for all client intelligence projects
**Last Updated:** 2025-12-09
**Template Generator:** Automatically displays if framework file exists

---

## Overview

The **24-Section ICP Copywriting Framework** is now a **standard deliverable** for all client intelligence projects. This framework provides deep emotional and psychological insights essential for high-converting copywriting, landing pages, email sequences, and marketing campaigns.

---

## Why This Framework is Mandatory

### Business Value

- **Conversion Intelligence:** Emotional triggers, objections, and pain points for each customer segment
- **Copywriting Foundation:** Avatar personas, before/after states, and messaging frameworks
- **Campaign Optimization:** Decision triggers, myths to bust, and success pathways
- **Sales Enablement:** Deep understanding of customer psychology and buying motivations

### Integration with Intelligence Report

The comprehensive intelligence report template **automatically includes** the 24-section framework if the data file exists. No template changes needed - just generate the framework data.

---

## Required File Location

```
/projects/[project-uuid]/client-intelligence/icp-24-section-framework.json
```

**Template Generator Automatically Detects:** The report generator checks for this file and displays the framework section if found.

---

## How to Generate for Any Project

### Method 1: Using client-icp-analyst Agent (RECOMMENDED)

```bash
# Use Task tool with client-icp-analyst subagent
```

**Agent Prompt Template:**
```
Generate comprehensive 24-section ICP copywriting framework for [CLIENT NAME]'s customer segments.

PROJECT CONTEXT:
- Client: [CLIENT NAME]
- Location: /projects/[project-uuid]/
- Existing ICP data: /client-intelligence/icp-analysis.json

YOUR TASK:
Read the existing ICP analysis and generate the 24-section copywriting framework for ALL customer segments.

[List all segments with revenue weights]

24 SECTIONS TO GENERATE (PER SEGMENT):
1. Avatar - Detailed persona with name, age, occupation, lifestyle
2. Before State - Current situation before solution
3. After State - Desired outcome after using product
4. Decision Triggers - Events that cause them to seek solution
5. Primary Goals - Main objectives
6. Secondary Goals - Additional benefits
7. Dreams - Ultimate aspirations
8. Promises - Expected product delivery
9. Primary Complaint - #1 frustration
10. Secondary Complaint - Additional pain points
11. Negative Statistics - Worrying data/facts
12. Objections - Purchase hesitations
13. Bad Habits - Current harmful behaviors
14. Consequences - What happens without change
15. Enemy - External forces they fight
16. Ultimate Fear - Deepest anxiety
17. False Solution Lie - Myth that doesn't work
18. False Solution Truth - Reality about myth
19. False Solution Tip - Better approach
20. Mistaken Belief Truth - Core misconception revealed
21. Mistaken Belief Name - Label for misconception
22. Success Myth Lie - Wrong success belief
23. Success Myth Truth - Actual path to success
24. What They Tried - Previous solutions
25. Why It Failed - Reasons solutions didn't work

OUTPUT FORMAT:
Save as: /client-intelligence/icp-24-section-framework.json

QUALITY REQUIREMENTS:
- Each section: 2-4 sentences minimum
- Specific, emotional, visceral language
- Reference actual customer motivations
- Psychologically accurate and deeply resonant
- Copywriting-focused (not just demographics)
```

### Method 2: Manual Creation

If creating manually, use this JSON structure:

```json
{
  "meta": {
    "clientName": "Client Name",
    "generatedDate": "2025-12-09",
    "totalSegments": 3,
    "framework": "24-Section Copywriting ICP Framework"
  },
  "segments": {
    "segment1_key": {
      "name": "Segment Name",
      "revenueWeight": "40%",
      "avatar": "Meet [Name], [age], [occupation]...",
      "beforeState": "Current situation...",
      "afterState": "Desired outcome...",
      "decisionTriggers": "What makes them buy now...",
      "primaryGoals": "Main objectives...",
      "secondaryGoals": "Additional desires...",
      "dreams": "Ultimate aspirations...",
      "promises": "Expected outcomes...",
      "primaryComplaint": "Biggest frustration...",
      "secondaryComplaint": "Additional pain points...",
      "negativeStatistics": "Worrying data...",
      "objections": "Purchase hesitations...",
      "badHabits": "Harmful behaviors...",
      "consequences": "What happens without change...",
      "enemy": "External forces...",
      "ultimateFear": "Deepest anxiety...",
      "falseSolutionLie": "Myth believed...",
      "falseSolutionTruth": "Reality revealed...",
      "falseSolutionTip": "Better approach...",
      "mistakenBeliefTruth": "Core misconception...",
      "mistakenBeliefName": "Label for misconception...",
      "successMythLie": "Wrong success belief...",
      "successMythTruth": "Actual success path...",
      "whatTheyTried": "Previous solutions...",
      "whyItFailed": "Reasons for failure..."
    }
  }
}
```

---

## Integration Workflow

### For New Client Projects

1. **Complete ICP Analysis** → `/client-intelligence/icp-analysis.json`
2. **Generate 24-Section Framework** → `/client-intelligence/icp-24-section-framework.json`
3. **Generate Comprehensive Report** → Template automatically includes framework
4. **Deliverable:** Client receives complete intelligence with copywriting insights

### For Existing Projects (Backfill)

1. Identify projects missing framework data
2. Run `client-icp-analyst` agent with existing ICP data
3. Regenerate intelligence report with updated template
4. Framework section automatically appears

---

## Report Display Structure

When the framework file exists, the template generator automatically creates:

### Section Layout

```
✍️ ICP Copywriting Framework
│
├── 📝 Framework Overview
│   └── Description and usage guidance
│
├── [Segment 1 Name] - [Revenue %]
│   ├── 👤 Core Identity (Avatar, Before/After States)
│   ├── 🎯 Goals & Aspirations (Dreams, Promises, Goals)
│   ├── ⚠️ Pains & Fears (Complaints, Ultimate Fear, Enemy)
│   ├── 🚧 Obstacles & Blockers (Objections, Bad Habits, Consequences)
│   ├── 💡 Myths to Bust (False Solutions, Mistaken Beliefs)
│   └── 🔄 Past Attempts (What Tried, Why Failed, Triggers)
│
├── [Segment 2 Name]
│   └── [Same structure...]
│
└── [Additional segments...]
```

### Visual Design

- **Segment Cards:** Color-coded by segment (primary, secondary, emerald)
- **Grouped Sections:** Organized by theme for easy scanning
- **Revenue Badges:** Prominently display segment importance
- **Responsive Layout:** Works on all screen sizes
- **Print-Ready:** Professional PDF export

---

## Quality Standards

### Avatar Quality Checklist

- ✅ Named persona with specific age and occupation
- ✅ Detailed lifestyle and behavioral description
- ✅ Emotional context and motivations
- ✅ Specific dollar amounts or metrics where relevant
- ✅ 3-5 sentences of rich detail

**Example (Good):**
> Meet Marco, 29, a graphic designer from Ljubljana with seven tattoos covering his arms and chest. He saves for months to afford sessions with his trusted artist, researches every detail obsessively, and documents his tattoo journey on Instagram where his 3,400 followers watch his healing progress.

**Example (Bad):**
> Young professional interested in tattoos.

### Emotional Depth Requirements

Each section must include:
- **Specific scenarios** (not generic descriptions)
- **Visceral language** (emotional, not clinical)
- **Concrete details** (numbers, brands, experiences)
- **Psychological accuracy** (based on real ICP data)

---

## Use Cases for Framework Data

### 1. Landing Page Copywriting

- **Hero Section:** Use Avatar + Before State
- **Pain Points:** Primary/Secondary Complaints + Ultimate Fear
- **Solution Messaging:** After State + Promises
- **Objection Handling:** Objections + False Solution Truth
- **CTA Triggers:** Decision Triggers + Dreams

### 2. Email Sequences

- **Welcome Series:** Avatar + Before State → After State journey
- **Nurture Campaigns:** Dreams + Goals progression
- **Objection Series:** Address each objection systematically
- **Re-engagement:** Consequences + What They Tried

### 3. Ad Campaign Messaging

- **Awareness Ads:** Primary Complaint + Enemy
- **Consideration Ads:** False Solution Lie/Truth + Better Approach
- **Conversion Ads:** Decision Triggers + Promises
- **Retargeting Ads:** Objections + Success Myth Truth

### 4. Sales Enablement

- **Discovery Questions:** Based on Decision Triggers
- **Pain Qualification:** Primary/Secondary Complaints
- **Objection Scripts:** Pre-written responses to Objections
- **Success Stories:** Aligned with Dreams + After State

---

## Maintenance & Updates

### When to Regenerate Framework

- **Market Research Updates:** New customer insights discovered
- **Segment Changes:** Revenue weights shift significantly
- **Product Evolution:** New features or positioning
- **Competitive Shifts:** Market dynamics change
- **Quarterly Reviews:** Standard intelligence refresh

### Versioning

Save framework versions with timestamps:
```
/client-intelligence/
├── icp-24-section-framework.json (current)
├── icp-24-section-framework-2025-12.json (archived)
└── icp-24-section-framework-2025-09.json (archived)
```

---

## Testing & Validation

### Framework Completeness Check

```javascript
// All sections must have content
const requiredSections = [
  'avatar', 'beforeState', 'afterState', 'decisionTriggers',
  'primaryGoals', 'secondaryGoals', 'dreams', 'promises',
  'primaryComplaint', 'secondaryComplaint', 'negativeStatistics',
  'objections', 'badHabits', 'consequences', 'enemy',
  'ultimateFear', 'falseSolutionLie', 'falseSolutionTruth',
  'falseSolutionTip', 'mistakenBeliefTruth', 'mistakenBeliefName',
  'successMythLie', 'successMythTruth', 'whatTheyTried', 'whyItFailed'
];

// Each section should be 2-4+ sentences
// Each avatar should have a named persona
```

### Report Display Verification

1. Generate intelligence report
2. Check "ICP Copywriting Framework" appears in TOC
3. Verify all segments display with 6 grouped sections
4. Confirm color-coding and revenue badges display
5. Test print layout (Cmd/Ctrl+P)

---

## Troubleshooting

### Framework Section Not Displaying

**Issue:** Report generated but no framework section

**Diagnosis:**
```bash
# Check if framework file exists
ls -la /projects/[uuid]/client-intelligence/icp-24-section-framework.json

# Verify JSON structure
cat /projects/[uuid]/client-intelligence/icp-24-section-framework.json | jq '.segments'
```

**Solutions:**
1. Verify file path matches exactly: `/client-intelligence/icp-24-section-framework.json`
2. Check JSON is valid (no syntax errors)
3. Ensure `segments` object exists with at least one segment
4. Regenerate report after fixing file

### Incomplete Framework Data

**Issue:** Framework displays but sections are sparse

**Solution:** Regenerate framework with better prompt quality:
- Include more context about customer research
- Reference specific pain points from ICP data
- Request emotional and visceral language explicitly
- Specify minimum sentence requirements

---

## Examples

### Proffshop (Complete Example)

**Location:** `/projects/proffshop-B44E4D66-D62C-4318-8EE6-D487729B76E3/client-intelligence/icp-24-section-framework.json`

**Segments:** 5 (Tattoo Enthusiasts, Luxury Oral Care, CBD Wellness, Premium Beauty, Intimate Wellness)

**Report Size Impact:** +109 KB (+82% increase when framework added)

**Display Quality:** Rich personas (Marco, Dr. Elena, Lucia, Sofia, Ana) with emotional depth

---

## Best Practices

### 1. Generate Early in Project Lifecycle

Create framework immediately after ICP analysis is complete. Don't wait until the end.

### 2. Use Agent Delegation

Always use `client-icp-analyst` agent rather than manual creation. The agent produces higher quality, emotionally resonant content.

### 3. Reference Existing Research

Point the agent to existing ICP data, psychographic research, and customer interviews for accuracy.

### 4. Review for Brand Voice

Ensure avatar names and scenarios align with client's target market and cultural context.

### 5. Test with Copywriters

Share framework with copywriting team to validate usefulness and completeness.

---

## Related Documentation

- **[CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[CLAUDE.md (Domain)](./CLAUDE.md)** - Client Intelligence Domain guide
- **[COMPREHENSIVE-REPORT-TEMPLATE-GUIDE.md](./templates/COMPREHENSIVE-REPORT-TEMPLATE-GUIDE.md)** - Report generation guide
- **[.claude/agents/client-icp-analyst.md](../../.claude/agents/client-icp-analyst.md)** - Agent definition

---

## Summary

The 24-section ICP copywriting framework is now **mandatory for all client intelligence projects**. The comprehensive intelligence report template **automatically detects and displays** this framework when the data file exists.

**To generate for any project:**
1. Use `client-icp-analyst` agent with existing ICP data
2. Save output to `/client-intelligence/icp-24-section-framework.json`
3. Regenerate intelligence report
4. Framework section automatically appears with all segments

**This framework provides:**
- Named avatar personas with emotional depth
- Complete customer psychology (24 sections × all segments)
- Conversion-focused messaging insights
- Ready-to-use copywriting intelligence
- Professional visual display in intelligence reports

**Impact:** +82% report size increase, +39% more lines, comprehensive copywriting intelligence for high-converting campaigns.
