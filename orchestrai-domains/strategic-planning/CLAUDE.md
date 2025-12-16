# Strategic Planning Domain

## Domain Overview

The Strategic Planning Domain synthesizes client intelligence, SEO research, competitive analysis, and branding into comprehensive strategic plans and financial projections using established business operations frameworks from Scaling Up (Verne Harnish) and EOS (Gino Wickman).

**Domain Focus**: Strategic synthesis, business operations planning, financial modeling, execution frameworks

---

## Specialized Agents

### Strategic Planning Agents
- **`strategic-plan-synthesizer`** - Master strategist implementing Scaling Up OPSP and EOS V/TO frameworks
- **`financial-modeling-specialist`** - Comprehensive financial projections, unit economics, Power of One analysis

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Strategic Planning Workflows

### 1. Complete Strategic Planning (Recommended)

**Pipeline Execution** (90-minute comprehensive workflow)

```
strategic-planning-pipeline.js
  ↓
Stage 1: Intelligence Aggregation (15 min)
  - Load ICP, SEO, competitive, branding, EOS, psychographic data
  - Validate 60%+ completeness
  ↓
Stage 2: Strategic Plan Synthesis (25 min)
  - strategic-plan-synthesizer agent
  - Generate OPSP, V/TO, Strategic Narrative
  ↓
Stage 3: Financial Modeling (30 min)
  - financial-modeling-specialist agent
  - 12-36 month projections, unit economics, Power of One
  ↓
Stage 4: Coherence Validation (10 min)
  - Calculate strategic coherence score
  - Identify gaps and strengths
  ↓
Stage 5: Executive Package Assembly (10 min)
  - Create master index and next steps
```

**Use When**: Need complete strategic planning package (OPSP + V/TO + Financial)

**Deliverables**:
```
/projects/[uuid]/deliverables/strategic-planning/
├── one-page-strategic-plan.md           # Scaling Up OPSP
├── eos-vision-traction-organizer.md     # EOS V/TO
├── strategic-narrative.md               # Executive summary
├── financial-projections.json           # Structured data
├── financial-projections-narrative.md   # Financial report
└── executive-package-index.json         # Master index
```

### 2. Strategic Plan Only

**Direct Agent Invocation**

```
Task tool → strategic-plan-synthesizer → Strategic Plans
```

**Use When**: Need OPSP and V/TO without detailed financial modeling

**Deliverables**:
- One-Page Strategic Plan (OPSP)
- EOS Vision/Traction Organizer (V/TO)
- Strategic Narrative with coherence analysis

### 3. Financial Modeling Only

**Direct Agent Invocation**

```
Task tool → financial-modeling-specialist → Financial Projections
```

**Use When**: Need detailed financial analysis without full strategic planning

**Deliverables**:
- 12-36 month cash flow projections
- Unit economics (LTV, CAC, ratios, payback)
- Scenario planning (best/base/worst)
- Power of One analysis
- Break-even timeline

---

## Frameworks Implemented

### Scaling Up (Verne Harnish)

**One-Page Strategic Plan (OPSP)** - Four Decision Areas:

```
Section 1: PEOPLE
- Leadership and accountability chart
- Core values and purpose
- Key hiring and development priorities

Section 2: STRATEGY
- Core customer profile (from ICP)
- Brand promise and positioning
- SWOT analysis
- 3-7 strategic priorities

Section 3: EXECUTION
- Quarterly Rocks (3-7 priorities for 90 days)
- KPIs and metrics dashboard
- Critical number tracking
- Meeting rhythm

Section 4: CASH
- Revenue targets (1-year, 3-year, 10-year)
- Unit economics basics
- Cash flow priorities
- Power of One levers
```

**Cash Acceleration Strategies (CAS)**:
- Power of One (1% improvement analysis on 7 levers)
- Cash conversion cycle optimization
- Unit economics optimization

### EOS (Entrepreneurial Operating System - Gino Wickman)

**Vision/Traction Organizer (V/TO)**:

```
VISION (Where are we going?):
- Core Values (3-7 behavioral values)
- Core Focus (purpose + niche)
- 10-Year Target (BHAG - Big Hairy Audacious Goal)
- Marketing Strategy (target market, uniques, proven process, guarantee)
- 3-Year Picture (revenue, profit, metrics, achievements)
- 1-Year Plan (revenue, profit, 3-7 SMART goals)

TRACTION (How do we get there?):
- Rocks (quarterly priorities)
- Issues List
- Scorecard (weekly KPIs)
- Meeting Pulse (L10 meetings)
```

### Financial Modeling & Unit Economics

**Key Metrics Tracked**:

```
Unit Economics:
- LTV (Customer Lifetime Value)
- CAC (Customer Acquisition Cost)
- LTV:CAC Ratio (target: 3:1 to 5:1)
- Payback Period (target: <12 months)
- Contribution Margin

Cash Flow Projections:
- Monthly revenue projections (12-36 months)
- COGS and operating expenses
- Net income and cash flow
- Ending cash position and runway

Scenario Planning:
- Best case (optimistic growth assumptions)
- Base case (realistic growth assumptions)
- Worst case (conservative assumptions)
- Sensitivity analysis on key variables

Power of One Analysis:
1% improvement impact on:
- Price increase → Revenue impact
- Volume increase → Revenue impact
- COGS decrease → Profit impact
- Operating expense decrease → Profit impact
- Days inventory outstanding → Cash impact
- Days sales outstanding → Cash impact
- Days payable outstanding → Cash impact
```

---

## Integration with Universal Agent Pattern

```javascript
// Pattern 1: Direct agent invocation (simple tasks)
Task(
  subagent_type="strategic-plan-synthesizer",
  prompt="Create OPSP and V/TO for [client]..."
)

Task(
  subagent_type="financial-modeling-specialist",
  prompt="Create 24-month financial projections for [client]..."
)

// Pattern 2: Pipeline execution (comprehensive workflow)
// Via Node.js infrastructure (not Claude Code direct execution)
POST http://localhost:5501/strategic-planning/execute
{
  "projectId": "client-uuid",
  "projectPath": "/projects/client-uuid/",
  "clientName": "Client Name"
}
```

---

## Strategic Coherence Validation

The pipeline calculates a **Strategic Coherence Score** (0-100%) by analyzing alignment across:

### Coherence Dimensions Analyzed

```
1. ICP ↔ SEO Alignment (25%)
   - Do target keywords match ICP search behavior?
   - Is search intent aligned with customer journey?
   - Are psychographic triggers reflected in keyword strategy?

2. Competitive Positioning ↔ Branding (25%)
   - Does brand promise differentiate from competitors?
   - Is positioning credible vs competitive landscape?
   - Are "Three Uniques" actually unique?

3. Core Values ↔ Operations (20%)
   - Are core values actionable (behavioral descriptions)?
   - Do operations/processes reflect stated values?
   - Is culture alignment realistic?

4. Strategy ↔ Execution Feasibility (30%)
   - Are 1-year goals achievable given resources?
   - Do quarterly rocks ladder up to 1-year plan?
   - Are KPIs measurable and trackable?
   - Is financial model realistic for strategic goals?
```

### Coherence Score Interpretation

```
90-100%: Exceptional strategic alignment
80-89%:  Strong coherence with minor gaps
70-79%:  Good foundation, refinement recommended
60-69%:  Moderate coherence, address gaps before execution
<60%:    Significant misalignment, strategic review required
```

---

## File Organization

```
/projects/[client-uuid]/
├── client-intelligence/
│   ├── icp-analysis.json              # Input: ICP psychographics
│   ├── brand-profile.json             # Input: Brand guidelines
│   ├── eos-business-framework.md      # Input: Existing EOS (if available)
│   └── psychographic-research/        # Input: Cultural values
├── deliverables/
│   ├── seo/
│   │   └── keyword-research.json      # Input: SEO intelligence
│   └── strategic-planning/            # ← OUTPUT DIRECTORY
│       ├── one-page-strategic-plan.md
│       ├── eos-vision-traction-organizer.md
│       ├── strategic-narrative.md
│       ├── financial-projections.json
│       ├── financial-projections-narrative.md
│       ├── strategic-coherence-analysis.md
│       ├── executive-package-index.json
│       └── comprehensive-strategic-report-[timestamp].html  # HTML Executive Report
```

---

## HTML Executive Reports

The Strategic Planning Domain generates comprehensive HTML executive reports that synthesize all strategic planning deliverables into a visually stunning, stakeholder-ready presentation.

### Report Structure

**Generated Report**: `comprehensive-strategic-report-[timestamp].html` (106 KB typical)

**10 Sections**:
1. Cover Page (gradient hero, coherence score badge)
2. Table of Contents (anchor navigation)
3. Executive Summary (multi-paragraph synthesis)
4. Market Opportunity Analysis (industry trends, pain points)
5. Customer Strategy (3 ICP segments with profiles)
6. Competitive Positioning (4 differentiators, competitive moat)
7. Strategic Priorities (7 pillars with full descriptions)
8. Financial Projections & Analysis (Chart.js + narrative)
9. Q1 Implementation Roadmap (7 quarterly rocks)
10. Recommendations & Next Steps (30-60-90 day plan)

### Generation Methods

**Method 1: Direct Agent Invocation** (Recommended)
```
Task tool → strategic-report-designer → Comprehensive HTML Report
```

**Method 2: Manual Template Usage**
```bash
# Generate report using existing deliverables
Task(
  subagent_type="strategic-report-designer",
  prompt="Generate comprehensive HTML executive report for [Client Name].
  Project path: /projects/[client-uuid]/
  Follow STRATEGIC-REPORT-TEMPLATE.md structure."
)
```

**Method 3: Future Pipeline Integration** (Planned)
```javascript
// Stage 5: Executive Package + HTML Report Generation
await strategicPlanningPipeline.generateExecutivePackage({
  includeHTMLReport: true
});
```

### Design System

- **Typography**: Inter font family (Google Fonts)
- **Colors**: Purple/indigo gradient (#667eea → #764ba2)
- **Charts**: Chart.js for 24-month financial runway
- **Layout**: Tailwind CSS, responsive, print-optimized
- **Size**: Self-contained HTML (~100-120 KB)

**See [STRATEGIC-REPORT-TEMPLATE.md](STRATEGIC-REPORT-TEMPLATE.md) for complete template specification.**
**See [HTML-REPORT-STRATEGY.md](HTML-REPORT-STRATEGY.md) for generation strategy and future roadmap.**

---

## Quality Gates

The pipeline enforces strict quality gates:

### Gate 1: Intelligence Completeness (Stage 1)
```
Required: 60%+ intelligence sources available
Sources counted:
- ICP Analysis
- SEO Research
- Competitive Intelligence
- Branding Guidelines
- EOS Framework (optional but beneficial)
- Psychographic Research

Failure: Pipeline stops if <60% completeness
```

### Gate 2: Strategic Plan Validation (Stage 2)
```
Checks:
- OPSP document created
- V/TO document created
- Strategic narrative created
- All four OPSP sections present
- All V/TO components present

Warning: If any critical section missing
```

### Gate 3: Financial Model Validation (Stage 3)
```
Checks:
- Cash flow projections present
- Unit economics calculated
- Scenario planning included
- Power of One analysis present

Warning: If key metrics missing
```

### Gate 4: Coherence Score (Stage 4)
```
Target: 70%+ strategic coherence
Warning: If <70%, review gaps before presenting to client
Critical: If <60%, strategic review required
```

---

## Integration with Existing Intelligence

### Leveraging Client Intelligence Domain

```javascript
// Strategic Planning builds on Client Intelligence outputs:

Input from client-icp-analyst:
→ Used for "Core Customer" in OPSP Section 2
→ Informs "Target Market" in V/TO Marketing Strategy
→ Shapes customer assumptions in financial model

Input from client-branding-intelligence:
→ Defines "Brand Promise" in OPSP
→ Creates "Three Uniques" in V/TO
→ Establishes positioning vs competitors

Input from client-business-context-analyzer:
→ Informs organizational structure in OPSP People section
→ Shapes operational assumptions in financial model
```

### Leveraging SEO Domain

```javascript
// SEO research informs strategic planning:

Input from seo-keyword-research:
→ Validates customer language and search behavior
→ Identifies market demand signals
→ Informs go-to-market strategy

Input from seo-competitor-analysis:
→ Shapes competitive positioning
→ Identifies market gaps and opportunities
→ Informs SWOT analysis
```

---

## Best Practices

### 1. Gather Intelligence First
```
Before running strategic planning pipeline:
✓ Complete ICP analysis
✓ Complete SEO keyword research
✓ Conduct competitive analysis
✓ Document branding guidelines

Do NOT run strategic planning with <60% intelligence
```

### 2. Preserve Existing EOS Frameworks
```
If client has existing EOS V/TO:
✓ Load existing framework
✓ Preserve core values if well-defined
✓ Update/refine rather than replace
✓ Maintain continuity for client

The strategic-plan-synthesizer agent will:
- Detect existing EOS files
- Preserve stable elements (core values)
- Update dynamic elements (goals, rocks)
```

### 3. Use Conservative Financial Assumptions
```
Financial modeling principles:
✓ Base case = most likely scenario
✓ Worst case = what we must survive
✓ Best case = reasonable optimism (not fantasy)
✓ Validate assumptions with client finance team

Red flags:
✗ Growth rates >100% YoY without strong justification
✗ CAC payback >18 months
✗ LTV:CAC ratio <2:1
```

### 4. Quarterly Rocks Should Be Actionable
```
Good Rocks:
✓ "Launch MVP to 100 beta users by March 31"
✓ "Hire 2 senior developers and 1 product manager"
✓ "Achieve $50K MRR with 20%+ gross margin"

Bad Rocks:
✗ "Improve product" (not measurable)
✗ "Grow the business" (not specific)
✗ "Make customers happy" (outcome, not action)
```

### 5. Strategic Coherence Iteration
```
If coherence score <70%:
1. Review gaps identified in validation stage
2. Address top 3 misalignment issues
3. Re-run strategic synthesis with updates
4. Validate improvement in coherence score

Common gaps:
- ICP doesn't match actual keyword data
- Brand promise not differentiated enough
- 1-year goals unrealistic given resources
- Core values generic (not behavioral)
```

---

## Testing & Validation

### Test the Pipeline

```bash
# 1. Ensure existing intelligence for test client
ls /Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-*/client-intelligence/

# 2. Test intelligence aggregation (Stage 1)
node orchestrai-domains/strategic-planning/test-intelligence-aggregation.js

# 3. Test strategic plan synthesis (Stage 2)
# Use Task tool with strategic-plan-synthesizer agent

# 4. Test financial modeling (Stage 3)
# Use Task tool with financial-modeling-specialist agent

# 5. Test full pipeline execution
# POST to /strategic-planning/execute endpoint
```

### Validate Outputs

```bash
# Check deliverables created
ls /Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-*/deliverables/strategic-planning/

# Expected files:
# - one-page-strategic-plan.md
# - eos-vision-traction-organizer.md
# - strategic-narrative.md
# - financial-projections.json
# - financial-projections-narrative.md
# - executive-package-index.json
```

---

## Troubleshooting

### "Insufficient intelligence data" Error
```
Issue: Intelligence completeness <60%
Solution:
1. Run client-icp-analyst to create ICP
2. Run seo-keyword-research to gather SEO data
3. Document branding guidelines
4. Retry pipeline after intelligence is gathered
```

### Low Strategic Coherence Score
```
Issue: Coherence score <70%
Common causes:
- ICP doesn't match SEO keyword targets
- Brand positioning not differentiated
- Core values generic/not actionable
- 1-year goals unrealistic

Solution:
1. Review coherence validation gaps
2. Address top misalignments
3. Re-run strategic synthesis stage
```

### Missing EOS Components
```
Issue: V/TO missing sections (rocks, goals, etc.)
Solution:
- Check strategic-plan-synthesizer prompt includes all V/TO sections
- Verify agent has access to client intelligence
- Manually add missing sections to V/TO document
```

### Unrealistic Financial Projections
```
Issue: Financial model shows unrealistic growth
Solution:
1. Review assumptions in financial-projections.json
2. Adjust growth rates to conservative baseline
3. Validate CAC and LTV assumptions
4. Re-run financial-modeling-specialist with updated assumptions
```

---

## Next Steps After Strategic Planning

### Immediate Actions (Week 1)
```
1. Leadership Review
   - Present OPSP and V/TO to leadership team
   - Validate strategic priorities and goals
   - Confirm core values alignment

2. Financial Validation
   - Review financial projections with finance team
   - Validate unit economics assumptions
   - Confirm capital requirements

3. Quarterly Rocks Workshop
   - Conduct 90-day planning session
   - Assign ownership for each Rock
   - Establish accountability chart
```

### Ongoing Implementation (Months 1-3)
```
1. Weekly Scorecard (EOS L10 Meetings)
   - Track KPIs weekly
   - Review progress on Rocks
   - Identify and solve issues

2. Monthly Strategic Review
   - Review financial actuals vs projections
   - Adjust forecast based on new data
   - Update marketing strategy as needed

3. Quarterly Planning
   - Celebrate completed Rocks
   - Set new Rocks for next 90 days
   - Review progress toward 1-year plan
```

---

## Related Documentation

### Core Architecture
- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[../../BUSINESS-OPS-MARKETING-PLANNING-MODULE-DESIGN.md](../../BUSINESS-OPS-MARKETING-PLANNING-MODULE-DESIGN.md)** - Complete module design
- **[../client-intelligence/CLAUDE.md](../client-intelligence/CLAUDE.md)** - Client intelligence domain

### Strategic Planning Agents
- **[../../.claude/agents/strategic-plan-synthesizer.md](../../.claude/agents/strategic-plan-synthesizer.md)** - Strategic synthesis agent
- **[../../.claude/agents/financial-modeling-specialist.md](../../.claude/agents/financial-modeling-specialist.md)** - Financial modeling agent
- **[../../.claude/agents/strategic-report-designer.md](../../.claude/agents/strategic-report-designer.md)** - HTML executive report generation agent

### HTML Report Generation
- **[STRATEGIC-REPORT-TEMPLATE.md](STRATEGIC-REPORT-TEMPLATE.md)** - Canonical HTML report template structure (10 sections)
- **[HTML-REPORT-STRATEGY.md](HTML-REPORT-STRATEGY.md)** - HTML report generation strategy and future roadmap

---

**This domain synthesizes all ORCHESTRAI intelligence into executable strategic plans using proven frameworks from Scaling Up and EOS. Use complete pipeline for comprehensive strategic planning, or invoke agents individually for specific deliverables.**
