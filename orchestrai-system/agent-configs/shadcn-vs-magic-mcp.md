# shadcn MCP vs Magic MCP: Complete Guide

## 🎯 Executive Summary

**You need BOTH** - they serve different purposes and work together:

- **shadcn MCP**: For installing base components (Button, Card, Input, etc.)
- **Magic MCP**: For complete composed solutions (Hero sections, Pricing pages, etc.)

---

## 📊 Side-by-Side Comparison

| Feature | shadcn MCP | Magic MCP (21st.dev) |
|---------|------------|---------------------|
| **Purpose** | Install primitives | Complete solutions |
| **Component Type** | Base UI elements | Composed layouts |
| **Complexity** | Simple, single elements | Complex, multi-element |
| **Customization** | You assemble | Pre-assembled |
| **Use Case** | "I need a button" | "I need a pricing page" |
| **Installation** | Component by component | Full sections |
| **Dependencies** | Manages automatically | Uses shadcn internally |
| **Official** | ✅ Official shadcn | Third-party (21st.dev) |

---

## 🔧 What Each MCP Provides

### shadcn MCP Server

**Command Examples:**
```typescript
// Agent can use natural language
"add button component"        → Installs Button
"add card and badge"          → Installs Card + Badge
"install dialog component"    → Installs Dialog
"add form components"         → Installs Input, Label, Form
```

**What it Does:**
```bash
# Automatically runs:
npx shadcn@latest add button
# - Downloads component
# - Installs dependencies (@radix-ui/react-slot, etc.)
# - Places in /components/ui/
# - Updates imports
```

**Available Components** (50+ primitives):
- Accordion, Alert, Badge, Button, Card, Checkbox
- Dialog, Dropdown, Input, Label, Select, Tabs
- Table, Textarea, Toast, Tooltip, etc.

### Magic MCP (21st.dev)

**Command Examples:**
```typescript
// Searches pre-built compositions
"hero section with animated background"
"pricing table with 3 tiers"
"testimonial carousel"
"feature grid with icons"
```

**What it Does:**
```typescript
// Returns complete, composed components
<PricingSection>
  <Card> {/* uses shadcn Card */}
    <Badge>Popular</Badge> {/* uses shadcn Badge */}
    <h3>Pro Plan</h3>
    <ul>...</ul>
    <Button>Subscribe</Button> {/* uses shadcn Button */}
  </Card>
  {/* + 2 more pricing tiers */}
  {/* + animations */}
  {/* + responsive layout */}
</PricingSection>
```

**Available Components** (1000+ compositions):
- Hero sections (animated, video, gradient, etc.)
- Pricing pages (comparison tables, tiered, etc.)
- Testimonials (carousels, grids, featured)
- Features (grids, lists, comparison tables)
- CTAs (animated, gradient, with forms)
- Footers (mega, simple, newsletter)
- Navigation (sticky, animated, sidebar)

---

## 🔄 How They Work Together

### Example Workflow

```typescript
// Step 1: User requests complete feature
User: "Add a pricing page with 3 tiers"

// Step 2: Agent checks Magic MCP first (complete solution)
Agent: mcp__magic__21st_magic_component_builder({
  searchQuery: "pricing cards 3 tiers"
})

// Step 3: Magic MCP returns component that uses shadcn primitives
MagicMCP: Returns PricingSection.tsx
  Requires: Button, Card, Badge from shadcn

// Step 4: If shadcn components missing, agent uses shadcn MCP
Agent: "add button card badge"
shadcnMCP: Installs Button.tsx, Card.tsx, Badge.tsx

// Step 5: Magic MCP component now works perfectly
Result: Complete pricing page with all dependencies
```

---

## 🎯 When to Use Each

### Use shadcn MCP When:

✅ Need **individual primitive components**
```typescript
"I need a button"
"Add a card component"
"Install form inputs"
"Need a dialog modal"
```

✅ Building **custom compositions**
```typescript
// You're assembling your own layout
<Card>
  <h3>Custom Design</h3>
  <Button>Action</Button>
</Card>
```

✅ **Specific shadcn component** requested
```typescript
"Use shadcn button here"
"Add shadcn accordion"
```

### Use Magic MCP When:

✅ Need **complete sections/pages**
```typescript
"Add pricing page"
"Create hero section"
"Build testimonials section"
```

✅ Want **pre-designed layouts**
```typescript
"Landing page with hero, features, pricing"
"Dashboard with stats and charts"
```

✅ Need **complex interactions**
```typescript
"Animated statistics counters"
"Interactive pricing comparison"
"Carousel with auto-play"
```

---

## 🤖 Agent Decision Tree

```
User Request
    ↓
Is it a complete section/page?
    │
    ├─YES → Magic MCP (21st.dev)
    │         ↓
    │    Component uses shadcn primitives?
    │         ↓
    │    Missing primitives?
    │         ↓
    │    shadcn MCP (auto-install missing)
    │
    └─NO → Is it a single primitive?
              ↓
         YES → shadcn MCP
              ↓
         NO → Is it custom composition?
               ↓
          YES → Use existing shadcn primitives
                + build custom composition
```

---

## 📋 Agent Prompt Integration

### Add to Your Frontend Agent:

```markdown
## Component Selection Protocol

**Priority Order:**

1. **Check Magic MCP** (21st.dev) for complete solutions
   - Use for: sections, pages, complex layouts
   - Tool: mcp__magic__21st_magic_component_builder

2. **Check shadcn MCP** for primitives
   - Use for: individual components (button, card, etc.)
   - Tool: shadcn MCP natural language commands

3. **Build custom** only if neither has suitable option

**Dependency Chain:**
- Magic MCP components → require shadcn primitives
- If shadcn primitive missing → auto-install via shadcn MCP
- Ensure all dependencies before integration
```

---

## 💻 Practical Examples

### Example 1: Complete Pricing Page

```typescript
USER: "Add pricing page with 3 tiers and annual/monthly toggle"

AGENT PROCESS:
1. Check Magic MCP: "pricing 3 tiers toggle"
2. Found: PricingToggle component
3. Component requires: Button, Card, Badge, Switch
4. Check existing shadcn components
5. Missing: Switch
6. shadcn MCP: "add switch"
7. Install PricingToggle from Magic MCP
8. ✅ Complete

TIME: ~30 seconds
```

### Example 2: Custom Form

```typescript
USER: "Create custom login form with email, password, remember me"

AGENT PROCESS:
1. Check Magic MCP: "login form" (no exact match)
2. Need custom composition
3. Required primitives: Input, Label, Checkbox, Button
4. shadcn MCP: "add input label checkbox button"
5. Build custom composition using primitives
6. ✅ Complete

TIME: ~45 seconds
```

### Example 3: Full Landing Page

```typescript
USER: "Build landing page with hero, features, pricing, testimonials, footer"

AGENT PROCESS:
1. Parallel Magic MCP searches:
   - Hero section → Found
   - Features grid → Found
   - Pricing section → Found
   - Testimonials → Found
   - Footer → Found
2. All components use shadcn primitives
3. Check installed shadcn components
4. shadcn MCP: Install any missing primitives
5. Integrate all Magic MCP components
6. Create navigation between sections
7. ✅ Complete

TIME: ~2 minutes
```

---

## 📦 Your Current Setup

### Installed (Manual):
```
/components/ui/
  ├── button.tsx        ✅ shadcn
  ├── card.tsx          ✅ shadcn
  ├── badge.tsx         ✅ shadcn
  ├── tabs.tsx          ✅ shadcn
  └── progress.tsx      ✅ shadcn
```

### Available via MCP:

**shadcn MCP** (50+ components):
- All official shadcn/ui components
- From 3 registries (@shadcn, @orchestrai, @magicui)
- Auto-install on demand

**Magic MCP** (1000+ compositions):
- Hero sections (100+ variants)
- Pricing pages (50+ layouts)
- Testimonials (40+ styles)
- Features (60+ grids)
- Forms (30+ types)
- Navigation (20+ styles)

---

## 🔐 Registry Configuration

Your `components.json` has 3 registries:

```json
{
  "registries": {
    "@orchestrai": "https://internal.orchestrai.com/r/{name}.json",
    "@shadcn": "https://ui.shadcn.com/registry/{name}.json",
    "@magicui": "https://magicui.design/r/{name}.json"
  }
}
```

This means:
- shadcn MCP can access all 3 registries
- Magic MCP integrates with @magicui registry
- Custom @orchestrai registry for internal components

---

## 🚀 Workflow Recommendations

### For New Projects:

```
1. Start with Magic MCP (complete sections)
   ↓
2. Magic MCP components reference shadcn primitives
   ↓
3. shadcn MCP auto-installs missing primitives
   ↓
4. Customize compositions as needed
```

### For Existing Projects:

```
1. Inventory existing shadcn components
   ↓
2. Use Magic MCP for new sections
   ↓
3. Reuse existing shadcn primitives
   ↓
4. Only install new primitives when needed
```

---

## 📊 Performance Comparison

| Metric | shadcn MCP | Magic MCP | Manual |
|--------|-----------|-----------|---------|
| **Install Time** | ~10s | ~30s | ~5min |
| **Dependencies** | Auto | Auto | Manual |
| **Customization** | Full | Medium | Full |
| **Complexity** | Simple | Complex | Any |
| **Learning Curve** | Low | Medium | High |

---

## ✅ Recommendation for ORCHESTRAI

### Dual-MCP Strategy:

```typescript
1. **Primary**: Magic MCP (21st.dev)
   - For all complete sections and pages
   - Faster development
   - Consistent design

2. **Secondary**: shadcn MCP
   - For missing primitives
   - Custom simple components
   - Dependency resolution

3. **Fallback**: Manual build
   - Highly custom requirements
   - Performance-critical components
   - Unique interactions
```

### Agent Configuration:

```typescript
agentCapabilities = {
  frontendDeveloper: {
    primaryMCP: "magic-mcp",      // Check first
    secondaryMCP: "shadcn-mcp",   // Install dependencies
    workflow: "magic-first-shadcn-fallback"
  }
}
```

---

## 🎓 Training Your Agents

### Decision Flow:

```
Request → Is it a complete feature?
             │
         YES │  NO
             │   └─→ Is it a shadcn primitive?
             │           │
             ↓       YES │  NO
     Magic MCP          │   └─→ Custom build
             │           ↓
             │   shadcn MCP
             │
             └─→ Check dependencies
                      │
                  Missing?
                      │
                  YES │  NO
                      │   └─→ Integrate
                      ↓
              shadcn MCP (auto-install)
                      │
                      └─→ Integrate
```

---

## 🔧 Implementation Checklist

- [x] shadcn/ui manually installed
- [x] components.json configured with 3 registries
- [x] Magic MCP available
- [ ] shadcn MCP server configured (.mcp.json)
- [ ] Agent prompts updated for dual-MCP workflow
- [ ] Test both MCPs with sample requests
- [ ] Document which components from which MCP
- [ ] Create component registry tracking source

---

## 📞 Quick Reference

### shadcn MCP Commands:
```
"add button"                  → Button component
"add card badge"              → Card + Badge
"install form components"     → Input, Label, Form
"add all dialog components"   → Dialog + related
```

### Magic MCP Searches:
```
"hero animated background"    → Complete hero
"pricing 3 tiers"            → Full pricing page
"testimonial carousel"        → Testimonials section
"feature grid icons"          → Features section
```

---

**Bottom Line**: Both MCPs are essential. Magic MCP builds the house, shadcn MCP provides the bricks! 🏗️✨
