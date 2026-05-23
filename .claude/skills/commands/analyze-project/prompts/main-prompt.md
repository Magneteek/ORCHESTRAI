# Analyze Project Structure

**Usage**: `/analyze-project [project-name-or-uuid]`

Perform comprehensive analysis of a client project's structure, deliverables, and progress.

## Analysis Workflow

### Phase 1: Project Discovery
1. Locate project directory in `/projects/`
2. Load `project-metadata.json`
3. Identify client name and UUID

### Phase 2: Deliverable Inventory
Scan and catalog all deliverables:
- **SEO**: Keyword research, competitor analysis, strategies
- **Content**: Articles, copy variations, multi-language content
- **Design**: Wireframes, mockups, design systems
- **Development**: Frontend, backend, deployment configs
- **Research**: Market analysis, psychographic profiles, ICP data

### Phase 3: Project Context Review
Read `CLAUDE.md` at the project root:
- [ ] Client context and business objectives
- [ ] Technical decisions recorded (plugins, stack, permalink structure)
- [ ] Progress log — what's been done
- [ ] What's Done checklist status
- [ ] What's Next — current priorities
- [ ] Client-specific learnings

### Phase 4: Quality Assessment
Evaluate:
- **File Organization**: Compliance with CLAUDE.md rules
- **Template Usage**: Global template references
- **Naming Consistency**: File and folder naming standards
- **Deliverable Completeness**: Are projects finished or partial?
- **Technology Choices**: Appropriate complexity for each deliverable

### Phase 5: Optimization Opportunities
Identify:
- Missing deliverables or gaps
- Redundant or duplicate files
- Potential pipeline automation opportunities
- Cross-selling or upselling possibilities

## Output Format

### 1. Executive Summary
- Client overview
- Total deliverables count
- Project health score (0-100)
- Progress status (from CLAUDE.md)

### 2. Detailed Inventory
```
📁 /projects/[client]-[uuid]/
├── 📊 Client Intelligence
│   ├── [List files with descriptions]
└── 📦 Deliverables
    ├── SEO: [count] items
    ├── Content: [count] items
    ├── Design: [count] items
    └── Development: [count] items
```

### 3. Quality Metrics
- File organization compliance: ✅/⚠️/❌
- Template usage: ✅/⚠️/❌
- CLAUDE.md completeness: ✅/⚠️/❌
- Technology appropriateness: ✅/⚠️/❌

### 4. Recommendations
Priority-ranked list of:
- Critical issues to fix
- Optimization opportunities
- Next logical deliverables

### 5. Next Steps
Actionable recommendations for:
- Immediate actions required
- Short-term improvements (this week)
- Long-term enhancements (this month)
