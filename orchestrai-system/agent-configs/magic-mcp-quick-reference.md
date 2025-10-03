# Magic MCP Quick Reference for Agents

## 🚀 Quick Decision Matrix

| User Says | Agent Action | MCP Tool |
|-----------|--------------|----------|
| "Add a {component}" | Search first | `inspiration` → `builder` |
| "Build a {page}" | Search all components | Multiple `inspiration` calls |
| "Make {component} better" | Refine existing | `refiner` |
| "What {components} are available?" | Browse library | `inspiration` |
| "Show me {component} options" | Present choices | `inspiration` |

---

## 📋 One-Line Commands

### Search for Component
```typescript
mcp__magic__21st_magic_component_inspiration({
  message: "{full_request}",
  searchQuery: "{2-4 words}"
})
```

### Integrate Component
```typescript
mcp__magic__21st_magic_component_builder({
  message: "{full_request}",
  searchQuery: "{2-4 words}",
  absolutePathToCurrentFile: "{current_file}",
  absolutePathToProjectDirectory: "{project_root}",
  standaloneRequestQuery: "{detailed_context}"
})
```

### Refine Component
```typescript
mcp__magic__21st_magic_component_refiner({
  userMessage: "{improvement_request}",
  absolutePathToRefiningFile: "{file_to_improve}",
  context: "{specific_improvements}"
})
```

---

## 🎯 Common Component Searches

| Component Type | Search Query |
|----------------|--------------|
| **Hero Sections** | "hero animated background" |
| **Pricing** | "pricing cards comparison" |
| **Testimonials** | "testimonial carousel" |
| **Features** | "feature grid icons" |
| **Stats/Metrics** | "statistics counters" |
| **Forms** | "contact form validation" |
| **Navigation** | "navbar responsive" |
| **Footer** | "footer links social" |
| **CTA** | "call to action button" |
| **Cards** | "card hover animation" |
| **Tables** | "data table sortable" |
| **Modals** | "modal dialog" |
| **Accordions** | "accordion FAQ" |
| **Tabs** | "tabs navigation" |
| **Carousels** | "image carousel" |

---

## ⚡ Agent Prompt Shortcuts

### Auto-Search Pattern
```markdown
When I receive UI component request:
1. AUTO-RUN: mcp__magic__21st_magic_component_inspiration
2. If found → AUTO-RUN: mcp__magic__21st_magic_component_builder
3. Customize for brand
4. Report completion with URL
```

### Exploration Pattern
```markdown
User asks: "What {type} components are available?"
1. RUN: mcp__magic__21st_magic_component_inspiration
2. Present top 3-5 options with descriptions
3. Ask: "Which would you like to use?"
4. On selection → RUN: mcp__magic__21st_magic_component_builder
```

### Refinement Pattern
```markdown
User says: "Improve/redesign {component}"
1. Identify file path
2. RUN: mcp__magic__21st_magic_component_refiner
3. Apply improvements
4. Show before/after comparison
```

---

## 🔄 Standard Agent Workflow

```
REQUEST → SEARCH → SELECT → INTEGRATE → CUSTOMIZE → DEMO → REPORT
   ↓         ↓         ↓         ↓            ↓          ↓        ↓
 Parse   Inspiration  Best    Builder    Brand+Copy   Create   URL
 Intent    MCP      Match     MCP        Updates     /demo    Link
```

---

## 📊 Component Integration Checklist

After Magic MCP integration:
- [ ] Files in correct location (`/components/ui/` or `/components/blocks/`)
- [ ] Dependencies installed
- [ ] Imports resolved
- [ ] Brand colors applied
- [ ] Copy updated for voice/tone
- [ ] Demo page created (`/app/demos/{name}/`)
- [ ] Responsive tested
- [ ] Dark mode compatible
- [ ] No TypeScript errors
- [ ] Navigation link added (if applicable)

---

## 🎨 Customization Standards

After integrating from Magic MCP, always customize:

### Colors
```typescript
// Replace generic colors with brand
"bg-primary" → Keep (uses theme)
"bg-blue-600" → Replace with brand color
"text-gray-500" → Keep (neutral)
```

### Copy
```typescript
// Replace placeholder text
"Your Product Name" → "ORCHESTRAI"
"Description here" → Actual product description
"Get Started" → Brand-specific CTA
```

### Spacing
```typescript
// Ensure consistent spacing
className="p-6" → Matches design system
className="mt-8" → Follows spacing scale
```

---

## 🚨 Error Handling

### Component Not Found
```markdown
1. Search with alternative queries
2. Search related component types
3. If still not found → Build custom
4. Log for future Magic MCP contribution
```

### Integration Errors
```markdown
1. Check dependency conflicts
2. Verify import paths
3. Ensure TypeScript compatibility
4. Test in isolation first
5. Gradually integrate into existing code
```

### Customization Issues
```markdown
1. Keep original as reference
2. Create custom variant
3. Document changes made
4. Test thoroughly before deployment
```

---

## 💡 Pro Tips for Agents

1. **Batch Searches**: When building pages, search all components in parallel
2. **Version Control**: Keep Magic MCP originals in `/components/ui/`, customizations in `/components/blocks/`
3. **Documentation**: Always create demo pages for integrated components
4. **Consistency**: Use same component library patterns across project
5. **Performance**: Monitor bundle size after integrations

---

## 🎓 Example Agent Conversations

### Example 1: Simple Component
```
USER: "Add pricing section"
AGENT: *Searches Magic MCP* "Found pricing component. Integrating..."
AGENT: *Integrates and customizes* "✅ Complete: http://localhost:5500/pricing"
```

### Example 2: Multiple Components
```
USER: "Build landing page"
AGENT: *Parallel searches* "Found: hero, features, testimonials, CTA"
AGENT: *Integrates all* "Customizing for brand..."
AGENT: "✅ Complete: http://localhost:5500/landing"
```

### Example 3: Refinement
```
USER: "Make hero section more modern"
AGENT: *Runs refiner on existing component* "Enhanced with:"
AGENT: "- Gradient backgrounds, - Smooth animations, - Better typography"
AGENT: "✅ Updated: http://localhost:5500/hero"
```

---

## 📝 Quick Copy-Paste for Agents

### Standard Search Call
```typescript
const results = await mcp__magic__21st_magic_component_inspiration({
  message: userRequest,
  searchQuery: "component type"
})
```

### Standard Integration Call
```typescript
await mcp__magic__21st_magic_component_builder({
  message: userRequest,
  searchQuery: "component type",
  absolutePathToCurrentFile: __filename,
  absolutePathToProjectDirectory: process.cwd(),
  standaloneRequestQuery: "Detailed description of what to build"
})
```

### Standard Refinement Call
```typescript
await mcp__magic__21st_magic_component_refiner({
  userMessage: improvementRequest,
  absolutePathToRefiningFile: "/path/to/component.tsx",
  context: "Specific improvements needed"
})
```

---

## 🔗 Related Documentation

- Full workflow: `/orchestrai-system/agent-configs/magic-mcp-workflow.md`
- Component registry: `/docs/components/`
- Design system: `/docs/design-system/`
- Agent system prompts: `/orchestrai-system/agent-configs/`

---

## 📞 Support

- Magic MCP issues: Check 21st.dev documentation
- Integration problems: Review `/orchestrai-system/troubleshooting/`
- Agent questions: System orchestrator
