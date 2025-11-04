# WIREFRAME COMPLIANCE PROTOCOL - MANDATORY FOR ALL DEVELOPMENT

## 🚨 CRITICAL: Design-to-Development Handoff Requirements

### **MANDATORY ELEMENTS FOR ALL DEVELOPMENT REQUESTS**

**1. EXPLICIT WIREFRAME FILE REFERENCES**
```
REQUIRED IN EVERY DEVELOPMENT PROMPT:
- **WIREFRAME REFERENCE**: [exact file path to wireframe]
- **DESIGN STRATEGY**: [exact file path to design strategy]  
- **COMPONENT LIBRARY**: [exact file path to component specs]
- **BRAND ASSETS**: [exact file paths to logos, graphics, colors]
```

**2. TECHNICAL SPECIFICATION REQUIREMENTS**
```
MANDATORY TECHNICAL SPECS:
- **CSS Framework**: Tailwind CSS (never custom CSS without explicit approval)
- **Layout Structure**: Specify columns, sidebar placement, navigation type
- **Responsive Breakpoints**: Mobile, tablet, desktop specifications
- **Component Requirements**: Exact component implementations needed
```

**3. BRAND ASSET INTEGRATION**
```
REQUIRED BRAND ELEMENTS:
- **Logo Integration**: QuartzIQ logo in header and footer
- **Color Palette**: Exact brand colors with hex codes
- **Typography**: Brand font specifications
- **Graphics/Icons**: Brand-specific visual elements
```

**4. VALIDATION CHECKPOINT PROTOCOL**
```
BEFORE COMPLETION, VALIDATE:
✅ Wireframe layout structure matches exactly
✅ All specified components are implemented
✅ Brand assets are properly integrated
✅ Technical specifications are followed
✅ Responsive behavior matches wireframes
```

## 📝 **CORRECT DEVELOPMENT PROMPT TEMPLATE**

```
DEVELOPMENT REQUEST TEMPLATE:
Create [HTML/CSS/Component] for [Project] following exact wireframe specifications.

**WIREFRAME COMPLIANCE REQUIREMENTS**:
- **Wireframe File**: [exact file path]
- **Layout Structure**: [two-column with sidebar | single-column | grid layout]
- **Navigation Type**: [sidebar navigation | sticky header | mobile hamburger]
- **CSS Framework**: Tailwind CSS (mandatory)

**BRAND ASSET INTEGRATION**:
- **Logo**: QuartzIQ logo - [file path or URL]
- **Colors**: Primary: #1A2944, Secondary: #357494, Accent: #3F86A4
- **Typography**: Inter font family with specified weights

**TECHNICAL SPECIFICATIONS**:
- **Responsive**: Mobile-first with breakpoints at 768px, 1024px
- **Components**: [list specific components needed]
- **Performance**: Core Web Vitals compliant
- **Accessibility**: WCAG 2.1 AA compliance

**VALIDATION REQUIREMENTS**:
- Verify wireframe layout compliance before completion
- Test responsive behavior across all breakpoints
- Validate brand asset integration
- Confirm technical specification adherence

**REFERENCE FILES**:
- Design Strategy: [file path]
- Wireframe: [file path] 
- Component Library: [file path]
- Brand Guidelines: [file path]
```

## 🔄 **CROSS-AGENT MEMORY INTEGRATION**

**Design agents MUST store in crystalline memory:**
```json
{
  "designRequirements": {
    "layoutStructure": "two-column-with-sidebar",
    "navigationStyle": "sidebar-sticky",
    "cssFramework": "tailwind",
    "brandAssets": {
      "logo": "quartziq-logo-full.svg",
      "primaryColor": "#1A2944",
      "typography": "Inter"
    },
    "wireframeCompliance": "mandatory"
  }
}
```

**Development agents MUST retrieve and validate against these requirements.**

## ⚠️ **FAILURE PREVENTION MEASURES**

**1. Agent Prompt Validation**
- Development prompts must include wireframe file paths
- Missing references = automatic prompt rejection
- Generic instructions not allowed

**2. Completion Validation**
- Mandatory wireframe compliance check
- Brand asset integration verification
- Technical specification confirmation

**3. Cross-Agent Communication**
- Design requirements stored in shared memory
- Development agents must access design specifications
- Validation agents verify compliance

## 🚀 **IMPLEMENTATION FOR FUTURE PROJECTS**

**Every development request must include:**
1. ✅ Exact wireframe file paths
2. ✅ Mandatory technical specifications  
3. ✅ Brand asset integration requirements
4. ✅ Validation checkpoint protocol
5. ✅ Cross-agent memory integration

**This protocol prevents design-to-development handoff failures and ensures wireframe compliance on every project.**