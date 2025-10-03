# Magic MCP Integration for ORCHESTRAI Agents

## Overview

Magic MCP tools provide automated UI component discovery and integration from 21st.dev. All development agents should use these tools **proactively** when building frontend features.

## Available MCP Tools

### 1. `mcp__magic__21st_magic_component_builder`
**Purpose**: Search, fetch, and integrate UI components automatically

**When to Use**:
- User requests a new UI element
- Building a new page or section
- Need a specific component (pricing, hero, testimonials, etc.)

**Parameters**:
```typescript
{
  message: string,              // Full user request
  searchQuery: string,          // 2-4 words describing component
  absolutePathToCurrentFile: string,
  absolutePathToProjectDirectory: string,
  standaloneRequestQuery: string  // Context about what to build
}
```

**Example**:
```typescript
mcp__magic__21st_magic_component_builder({
  message: "Add an animated pricing section with 3 tiers",
  searchQuery: "pricing cards animated",
  absolutePathToCurrentFile: "/path/to/current/file.tsx",
  absolutePathToProjectDirectory: "/path/to/project",
  standaloneRequestQuery: "Pricing section with 3-tier comparison cards, hover animations, and feature highlights"
})
```

### 2. `mcp__magic__21st_magic_component_inspiration`
**Purpose**: Browse available components before building

**When to Use**:
- User asks "what's available?"
- Exploring design options
- Need to show user component variations

**Parameters**:
```typescript
{
  message: string,
  searchQuery: string  // Component type to explore
}
```

### 3. `mcp__magic__21st_magic_component_refiner`
**Purpose**: Improve existing UI components

**When to Use**:
- User wants to redesign/refine existing component
- Requested with /ui or /21 commands
- Component needs visual enhancement

**Parameters**:
```typescript
{
  userMessage: string,
  absolutePathToRefiningFile: string,
  context: string  // What specifically to improve
}
```

---

## 🤖 Agent Decision Tree

### Frontend Development Agent Workflow

```
┌─────────────────────────────┐
│   User Request Received     │
└──────────┬──────────────────┘
           │
           ▼
    ┌─────────────────┐
    │ Parse Intent    │
    └─────┬───────────┘
          │
          ▼
    Is it UI-related? ──NO──► Continue with regular workflow
          │
         YES
          │
          ▼
    ┌──────────────────────────────┐
    │ Check Existing Components    │
    └──────┬───────────────────────┘
           │
           ▼
    Component exists? ──YES──► Reuse existing component
           │
           NO
           │
           ▼
    ┌──────────────────────────────────────┐
    │ AUTO-TRIGGER:                        │
    │ mcp__magic__21st_magic_component_    │
    │ inspiration (exploration)            │
    └──────┬───────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ Found suitable component?            │
    └──────┬───────────────────────────────┘
           │
       YES │  NO ──► Build custom component
           │
           ▼
    ┌──────────────────────────────────────┐
    │ AUTO-TRIGGER:                        │
    │ mcp__magic__21st_magic_component_    │
    │ builder (integration)                │
    └──────┬───────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ Customize for brand/requirements     │
    └──────┬───────────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │ Integrate with existing codebase     │
    └──────────────────────────────────────┘
```

---

## 📋 Agent Prompt Templates

### Template 1: Proactive Component Search

```markdown
When user requests: "{user_request}"

AGENT INTERNAL PROCESS:
1. Identify UI component type: {component_type}
2. Check existing: grep -r "{component_name}" components/
3. If not found:
   - AUTOMATICALLY call mcp__magic__21st_magic_component_inspiration
   - searchQuery: "{2-4 word description}"
4. Review options
5. If suitable component found:
   - AUTOMATICALLY call mcp__magic__21st_magic_component_builder
   - Integrate component
   - Customize for brand
6. Report to user with preview link
```

### Template 2: Component Discovery

```markdown
USER: "I need a {component_type}"

AGENT RESPONSE:
1. "Let me search for available {component_type} components..."
2. → mcp__magic__21st_magic_component_inspiration
3. "I found {N} options. Here are the top matches:"
   - Option 1: {description}
   - Option 2: {description}
4. "Which would you like to use, or should I show more options?"
```

### Template 3: Full Integration

```markdown
USER: "Add {feature} to the {page}"

AGENT PROCESS:
1. Parse requirement: {feature} = {component_type}
2. Search: mcp__magic__21st_magic_component_inspiration
3. Select best match based on:
   - Feature requirements
   - Design consistency
   - Technical compatibility
4. Integrate: mcp__magic__21st_magic_component_builder
5. Customize:
   - Update colors to brand palette
   - Adjust copy for voice/tone
   - Integrate with existing state management
6. Create demo page: /demos/{component_name}
7. Report: "✅ {Feature} added. View at: {url}"
```

---

## 🎯 Best Practices for Agents

### 1. **Always Search First**
```typescript
// WRONG
User: "Add pricing section"
Agent: *Starts building from scratch*

// RIGHT
User: "Add pricing section"
Agent: *Searches Magic MCP library first*
Agent: *Finds existing solution*
Agent: *Integrates and customizes*
```

### 2. **Batched Operations**
```typescript
// When multiple components needed
User: "Build landing page with hero, features, pricing, testimonials"

Agent Process:
- Search ALL components first (4 parallel searches)
- Review all options
- Integrate all components (batched)
- Create cohesive page
```

### 3. **Customization After Integration**
```typescript
// Integration flow
1. Fetch component from Magic MCP (get base)
2. Integrate into project structure (place in correct location)
3. Update branding (colors, fonts, copy)
4. Connect to data sources (APIs, state)
5. Add project-specific features (auth, analytics)
```

### 4. **Documentation Updates**
```typescript
// After integration, update:
- Component registry
- Design system docs
- Usage examples
- Storybook/demo pages
```

---

## 🔧 Configuration for Development Agents

### Agent System Prompt Addition

Add this to your development agent system prompts:

```markdown
## UI Component Development Protocol

When building UI features:

1. **ALWAYS use Magic MCP tools first** before building custom components
2. **Search before building**: Check 21st.dev library via mcp__magic__21st_magic_component_inspiration
3. **Integrate when found**: Use mcp__magic__21st_magic_component_builder for automatic setup
4. **Customize after integration**: Brand colors, copy, functionality
5. **Document usage**: Create demo pages and usage examples

Magic MCP Tools Available:
- mcp__magic__21st_magic_component_builder (integration)
- mcp__magic__21st_magic_component_inspiration (discovery)
- mcp__magic__21st_magic_component_refiner (improvement)

Use these tools **proactively** without waiting for explicit user request.
```

---

## 📊 Success Metrics

Track these metrics for Magic MCP usage:

- **Component Reuse Rate**: % of components from Magic MCP vs custom built
- **Integration Time**: Time from request to deployment
- **Customization Depth**: How much modification needed after integration
- **User Satisfaction**: Quality of integrated components

**Target KPIs**:
- 70%+ components from Magic MCP library
- <5 minutes integration time per component
- Minimal customization needed
- High consistency across project

---

## 🚀 Example Agent Interactions

### Example 1: Pricing Section

```
USER: "Add a pricing section to the homepage"

AGENT (Internal):
- Detected: UI component request
- Type: Pricing section
- Action: Search Magic MCP

AGENT (To User):
"Searching for pricing components..."

AGENT (Internal):
- mcp__magic__21st_magic_component_inspiration({ searchQuery: "pricing cards" })
- Found: 5 options
- Best match: 3-tier pricing with animations

AGENT (To User):
"Found perfect pricing component with 3-tier layout and hover animations. Integrating now..."

AGENT (Internal):
- mcp__magic__21st_magic_component_builder(...)
- Customize colors: brand palette
- Update copy: product names
- Create demo: /pricing-demo

AGENT (To User):
"✅ Pricing section added! View at: http://localhost:5500/pricing
Features: 3 tiers, hover animations, responsive layout"
```

### Example 2: Complete Landing Page

```
USER: "Build a landing page for our AI product"

AGENT (Internal):
- Detected: Multi-component page
- Components needed: hero, features, testimonials, CTA, footer
- Action: Batch search

AGENT (To User):
"Building landing page. Searching for components..."

AGENT (Internal):
- 5 parallel searches via Magic MCP
- Select best matches for each section
- Plan integration order

AGENT (To User):
"Found all components. Integrating:
- Hero with animated background ✅
- Feature grid with icons ✅
- Testimonial carousel ✅
- CTA section ✅
- Footer ✅

Customizing for brand..."

AGENT (Internal):
- Update all colors
- Replace placeholder content
- Connect sections
- Add navigation
- Create routes

AGENT (To User):
"✅ Landing page complete!
View at: http://localhost:5500/landing
Includes: Hero, Features, Testimonials, CTA, Footer
All components responsive and branded."
```

---

## 🎓 Training Scenarios for Agents

### Scenario 1: Component Already Exists
```
Test: User requests component that already exists in codebase
Expected: Agent checks existing components first, reuses if found
Fallback: If customization needed, use refiner tool
```

### Scenario 2: No Suitable Component Found
```
Test: User requests highly custom component
Expected: Agent searches Magic MCP first, determines no match, builds custom
Log: Record custom build for future library addition
```

### Scenario 3: Multiple Component Options
```
Test: Magic MCP returns multiple suitable options
Expected: Agent presents top 2-3 options to user for selection
User Interaction: "Which style do you prefer?"
```

---

## 📁 File Structure for MCP Integrations

```
/components/
  /ui/                    # Base components from Magic MCP (minimal changes)
    button.tsx
    card.tsx
    pricing-card.tsx      # From Magic MCP

  /blocks/                # Composed components (customized)
    pricing-section.tsx   # Magic MCP + customization
    hero-stats.tsx        # Magic MCP + brand integration

  /features/              # Feature-specific compositions
    landing-page.tsx      # Multiple Magic MCP components

/app/
  /demos/                 # Demo pages for all components
    pricing/
    hero-stats/

/docs/
  /components/            # Component documentation
    magic-mcp-sources.md  # Track which came from Magic MCP
```

---

## 🔐 Security & Quality Controls

### Pre-Integration Checks
- [ ] Component matches requirements
- [ ] No security vulnerabilities in dependencies
- [ ] Meets accessibility standards (WCAG 2.1)
- [ ] Compatible with existing tech stack
- [ ] Performance acceptable (Lighthouse score)

### Post-Integration Review
- [ ] Proper TypeScript types
- [ ] No console errors
- [ ] Responsive on all breakpoints
- [ ] Dark mode compatible (if applicable)
- [ ] Documentation created

---

## 📞 When to Escalate to Manual Integration

Escalate to manual process when:
1. Component requires heavy modification (>50% changes)
2. Security concerns with dependencies
3. Performance issues identified
4. Accessibility requirements not met
5. Technical compatibility issues

In these cases:
- Use Magic MCP for **inspiration only**
- Build custom solution
- Document why custom build was necessary
- Consider contributing back to Magic MCP library

---

## 🎯 Summary: Agent Action Items

**For Development Agents**:
1. ✅ Add Magic MCP tools to your available toolkit
2. ✅ Include search-first workflow in decision tree
3. ✅ Use proactively without waiting for explicit command
4. ✅ Customize after integration for brand consistency
5. ✅ Create demo pages for all integrated components

**For System Orchestrator**:
1. ✅ Monitor MCP usage metrics
2. ✅ Track component reuse vs custom builds
3. ✅ Maintain component registry
4. ✅ Coordinate between agents for consistency

**For Quality Assurance**:
1. ✅ Validate all MCP integrations
2. ✅ Ensure accessibility compliance
3. ✅ Performance testing
4. ✅ Cross-browser compatibility
