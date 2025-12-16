# Quick Start: Generate Strategic Planning HTML Report

## Prerequisites

✅ Strategic planning pipeline completed (all deliverables exist)
✅ Project folder: `/projects/[client-uuid]/deliverables/strategic-planning/`

## Step 1: Verify Deliverables Exist (Optional - Agent Validates)

**Note**: The `strategic-report-designer` agent automatically validates required files and will report clear errors if anything is missing. You can verify manually first:

```bash
ls -lh /projects/[client-uuid]/deliverables/strategic-planning/

# Should see REQUIRED files:
# ✓ strategic-narrative.md (40-60 KB)
# ✓ financial-projections.json (50-60 KB)
# ✓ one-page-strategic-plan.md (20-30 KB)

# OPTIONAL files (report continues without these):
# - strategic-coherence-analysis.md (15-25 KB)
# - eos-vision-traction-organizer.md (25-30 KB)
```

If required files are missing, the agent will stop and tell you exactly what's needed.

## Step 2: Copy-Paste Template Command

```javascript
Task(
  subagent_type="strategic-report-designer",
  prompt="Generate comprehensive HTML executive report for [CLIENT NAME].

  Project path: /projects/[CLIENT-UUID]/deliverables/strategic-planning/

  All required files exist in the project directory.
  Follow STRATEGIC-REPORT-TEMPLATE.md structure.
  Include full narrative content with all 10 sections."
)
```

**Replace**:
- `[CLIENT NAME]` → e.g., "Rapid Cold Plunge"
- `[CLIENT-UUID]` → e.g., "rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9"

## Step 3: Wait for Generation

⏱️ Duration: 20-30 minutes
📊 Output: `comprehensive-strategic-report-[timestamp].html` (~106 KB)

## Step 4: Open Report

```bash
open "/projects/[client-uuid]/deliverables/strategic-planning/comprehensive-strategic-report-*.html"
```

---

## Example: Rapid Cold Plunge

```javascript
Task(
  subagent_type="strategic-report-designer",
  prompt="Generate comprehensive HTML executive report for Rapid Cold Plunge.

  Project path: /projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/deliverables/strategic-planning/

  All required files exist in the project directory.
  Follow STRATEGIC-REPORT-TEMPLATE.md structure.
  Include full narrative content with all 10 sections."
)
```

---

## Customization Options

### Focus on Specific Section

```javascript
Task(
  subagent_type="strategic-report-designer",
  prompt="Generate comprehensive HTML report for [CLIENT].

  Give EXTRA DETAIL to the Financial Projections section with:
  - Detailed scenario comparisons
  - Extended Power of One analysis
  - Quarterly financial milestones

  Project path: /projects/[UUID]/deliverables/strategic-planning/"
)
```

### Add Custom Section

```javascript
Task(
  subagent_type="strategic-report-designer",
  prompt="Generate comprehensive HTML report for [CLIENT].

  ADD custom section: 'Investor Pitch Highlights'
  - Key investment thesis points
  - Competitive moat summary
  - Go-to-market timeline

  Insert after Section 3 (Executive Summary).

  Project path: /projects/[UUID]/deliverables/strategic-planning/"
)
```

---

## Troubleshooting

### Error: "Missing required files"
**Solution**: Run strategic planning pipeline first
```bash
POST http://localhost:5501/strategic-planning/execute
```

### Error: "Cannot find project path"
**Solution**: Verify project UUID is correct
```bash
ls /projects/ | grep [client-name]
```

### Report looks incomplete
**Solution**: Check source files have content
```bash
wc -l /projects/[uuid]/deliverables/strategic-planning/*.md
# strategic-narrative.md should be 900+ lines
# one-page-strategic-plan.md should be 200+ lines
```

---

## Future: Slash Command (If Needed)

If you find yourself generating these reports frequently (>1x per month), we can create:

```bash
/strategic-report [project-name]
```

**Current recommendation**: Not needed for infrequent strategic planning reports.
