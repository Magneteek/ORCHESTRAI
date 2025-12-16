# Frontend Skill Usage Example

**Created**: December 16, 2025
**Purpose**: Demonstrate practical usage of the `frontend-design` skill

---

## Example 1: Simple Landing Page

### User Request
```
"Create a landing page for QuartzIQ - a B2B strategic planning tool.
The brand is about clarity, precision, and crystalline thinking."
```

### System Response Pattern

**Step 1: Recognize Creative Request**
- Keywords detected: "landing page," "brand," "clarity"
- Decision: Use `frontend-design` skill for creative direction

**Step 2: Invoke Skill**
```
Skill tool → skill="frontend-design:frontend-design"
```

**Step 3: Creative Execution**
The skill guides me to:
1. Choose bold aesthetic (e.g., "Crystalline Minimalism")
2. Select distinctive typography (e.g., JetBrains Mono + Instrument Serif)
3. Create unique color palette (crystal blues, sharp whites, geometric accents)
4. Implement creative animations (geometric formations, parallax)
5. Generate production-ready static HTML/CSS/JS

**Output**: Single HTML file with embedded CSS/JS, ready to deploy

---

## Example 2: Distinctive Component

### User Request
```
"Design a pricing card component that feels premium and different from
typical SaaS pricing tables. The brand is luxury cold plunge recovery."
```

### System Response Pattern

**Step 1: Recognize Creative Request**
- Keywords detected: "distinctive," "different from typical," "premium"
- Decision: Use `frontend-design` skill

**Step 2: Invoke Skill**
```
Skill tool → skill="frontend-design:frontend-design"
```

**Step 3: Creative Execution**
1. Aesthetic choice: "Organic Luxury" (natural materials, flowing forms)
2. Typography: Canela + Suisse International
3. Color: Deep ocean blues, ice whites, warm wood tones
4. Unique features: Flowing SVG shapes, frost texture overlays
5. Micro-interactions: Ripple effects on hover, smooth transitions

**Output**: React component with distinctive visual identity

---

## Example 3: Hybrid Workflow (Skill + Agent)

### User Request
```
"Create a bold marketing site for FuertePro (home services in Fuerteventura)
with full SEO optimization and production deployment."
```

### System Response Pattern

**Step 1: Recognize Hybrid Needs**
- Creative design required (distinctive aesthetic)
- Production infrastructure required (SEO, deployment)
- Decision: Use skill THEN agents

**Step 2: Creative Design Phase**
```
Skill tool → skill="frontend-design:frontend-design"
```
Output: Bold, distinctive static site (Spanish/English bilingual)

**Step 3: SEO Enhancement Phase**
```
Task tool → subagent_type="seo-technical-analysis"
```
Output: Technical SEO optimization, Core Web Vitals

**Step 4: Content Integration Phase**
```
Task tool → subagent_type="content-writer-specialist"
```
Output: SEO-optimized Spanish/English content

**Step 5: Deployment Phase**
```
Task tool → subagent_type="devops-deployment-specialist"
```
Output: Production hosting, monitoring, CI/CD

---

## Example 4: When NOT to Use the Skill

### User Request
```
"Build a production Next.js dashboard with user authentication,
PostgreSQL database, and comprehensive E2E testing."
```

### System Response Pattern

**Step 1: Recognize Production Requirements**
- No creative/distinctive design request
- Complex production infrastructure
- Multi-file system implementation
- Decision: Use agents/pipelines ONLY (skip skill)

**Step 2: Pipeline Orchestration**
```
orchestrai-master-coordinator → design-development-pipeline + api-development-pipeline + comprehensive-testing-pipeline
```

**Why No Skill?**
- No aesthetic creativity required
- Focus on functionality, not distinctive design
- Standard production patterns appropriate
- Multiple agents need coordination

---

## Decision Tree: When to Use What

```
User Request
    ↓
Is creative/distinctive design the focus?
    ├─ YES → Use frontend-design skill
    │         ↓
    │    Production integration needed?
    │         ├─ YES → Skill + Agents (hybrid)
    │         └─ NO → Skill only
    │
    └─ NO → Skip skill, use agents/pipelines
              ↓
         Complex production system?
              ├─ YES → Use orchestrai-master-coordinator + pipelines
              └─ NO → Use specific agent via Task tool
```

---

## Practical Tips

### 1. **Recognize Skill-Appropriate Requests**
Trigger phrases:
- "distinctive," "creative," "bold," "unique"
- "different from typical"
- "landing page" (without backend requirements)
- "premium aesthetic"
- "memorable design"

### 2. **Know When to Skip the Skill**
Skip skill for:
- "Build a dashboard" (functional focus)
- "Create an API" (no design component)
- "Implement authentication" (backend logic)
- "Production app with testing" (infrastructure focus)

### 3. **Combine for Best Results**
Use hybrid workflow for:
- "Creative site with SEO"
- "Distinctive design + deployment"
- "Bold landing page + monitoring"

### 4. **Don't Over-Complicate**
- Simple creative landing page? → Skill ONLY
- Production app? → Agents/pipelines ONLY
- Both? → Skill THEN agents

---

## Testing the Skill

### Quick Test
```
User: "Create a distinctive 'About Us' component for a luxury wellness brand"

Expected System Behavior:
1. Recognize creative request
2. Invoke: Skill tool → skill="frontend-design:frontend-design"
3. Generate creative HTML/CSS/JS component
4. Provide unique aesthetic choices (typography, colors, animations)

Result: ✅ Skill-generated creative component
```

### Verify Skill is Available
```bash
# Check plugin installation
cat /Users/kris/.claude/plugins/installed_plugins.json | grep frontend-design

# Should show: "frontend-design@claude-plugins-official"
```

---

## Summary

### Key Takeaways

1. **Skill = Creative Guidance**: Use for distinctive, creative UI/UX work
2. **Agents = Production Execution**: Use for complex multi-file systems
3. **Hybrid = Best of Both**: Skill for design, agents for infrastructure
4. **Simple Decisions**: Follow the decision tree above

### Quick Reference

| Request Type | Tool to Use |
|-------------|------------|
| Distinctive landing page | `frontend-design` skill |
| Production dashboard | Agents/pipelines |
| Creative site + deployment | Skill + agents |
| Standard component | Agents only |

---

**Last Updated**: December 16, 2025
**Status**: ✅ Ready to use
**Next**: Try the skill with a creative request!
