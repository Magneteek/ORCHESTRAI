# Advertising Enhanced Domain

## Domain Overview

The Advertising Enhanced Domain provides advanced advertising campaign creation and optimization across multiple platforms (Google Ads, Meta, LinkedIn, Reddit) with search intent matching, Quality Score optimization, and creative variation testing.

**Domain Focus**: Platform-specific ad optimization, A/B testing, psychological triggers, conversion optimization

---

## Specialized Agents

### Platform-Specific Advertising Agents
- **`google-ads-specialist`** - Search intent matching, Quality Score optimization, Performance Max campaigns
- **`meta-ads-specialist`** - Facebook/Instagram ads with 2024 creative frameworks, UGC content
- **`linkedin-ads-specialist`** - B2B advertising, professional audiences, lead generation
- **`reddit-ads-specialist`** - Community-based marketing, authentic engagement

### Creative & Optimization Agents
- **`ad-copy-variation-generator`** - A/B testing, platform optimization, psychological triggers
- **`landing-page-optimizer`** - CRO methodologies, conversion optimization
- **`conversion-optimization-specialist`** - Funnel optimization, user journey mapping

**See [../../.claude/agents/](../../.claude/agents/) for complete agent definitions.**

---

## Advertising Workflows

### 1. Multi-Platform Campaign Creation

**Parallel Platform Execution**

```
Task tool (parallel launch) →
  - google-ads-specialist → Google Search/Performance Max campaigns
  - meta-ads-specialist → Facebook/Instagram creative
  - linkedin-ads-specialist → B2B lead gen campaigns
  - reddit-ads-specialist → Community engagement ads

All execute simultaneously (massive time savings)
```

**Use When**: Launching comprehensive multi-channel advertising campaigns

### 2. Ad Copy Variation Generation

**Direct Agent Invocation**

```
Task tool → ad-copy-variation-generator → Multiple Variations

Deliverables:
- A/B test variations (minimum 3 per platform)
- Psychological trigger integration
- Platform-specific optimization
- Character count compliance
```

**Use When**: Need multiple ad copy variations for testing

### 3. Landing Page Optimization

**Direct Agent Invocation**

```
Task tool → landing-page-optimizer → CRO Analysis

Analysis:
- Conversion funnel friction points
- User journey mapping
- A/B testing recommendations
- Heat map insights
```

**Use When**: Optimizing landing page conversion rates

---

## Platform-Specific Best Practices

### Google Ads
```
Quality Score Optimization:
- Keyword-ad-landing page alignment
- Expected CTR improvement
- Ad relevance enhancement
- Landing page experience

Performance Max:
- Asset variety (images, videos, headlines)
- Audience signal quality
- Creative performance monitoring
```

### Meta Ads (Facebook/Instagram)
```
2024 Creative Frameworks:
- UGC (User Generated Content) style
- Mobile-first vertical video
- Thumb-stopping hooks (first 3 seconds)
- Clear CTAs with urgency

Audience Targeting:
- Detailed targeting + Advantage+
- Lookalike audience optimization
- Retargeting pixel implementation
```

### LinkedIn Ads
```
B2B Professional Targeting:
- Job title and seniority targeting
- Company size and industry
- Lead generation forms (native)
- Thought leadership content

Content Strategy:
- Professional, value-focused messaging
- Industry pain point addressing
- Case study and proof point usage
```

### Reddit Ads
```
Community-Based Approach:
- Subreddit targeting relevance
- Authentic, non-salesy messaging
- Conversation ad formats
- Community engagement focus

Success Factors:
- Blend with organic content
- Provide genuine value
- Avoid corporate speak
```

---

## Integration with Universal Agent Pattern

```javascript
// Multi-platform campaign launch (PARALLEL)
Task(subagent_type="google-ads-specialist", prompt="Create search campaign...")
Task(subagent_type="meta-ads-specialist", prompt="Create Facebook ads...")
Task(subagent_type="linkedin-ads-specialist", prompt="Create B2B campaign...")
// All platforms developed simultaneously

// Ad copy variations
Task(
  subagent_type="ad-copy-variation-generator",
  prompt="Generate 5 A/B test variations for Google Search ads..."
)

// Landing page optimization
Task(
  subagent_type="landing-page-optimizer",
  prompt="Analyze landing page for conversion optimization..."
)
```

---

## MCP Integration

### DATAforSEO for Advertising
```javascript
// Keyword research for Google Ads
mcp__dataforseo__keyword_overview(keywords: ["target keyword"])
mcp__dataforseo__search_intent(keywords: ["keyword"])

// Competitor ad analysis
mcp__dataforseo__serp_competitors(keyword: "target keyword")
```

### Memory Integration
```javascript
// Reference client ICP for audience targeting
const icp = await memory.retrieve(`${clientName}-ICP`)

// Use psychographics for ad messaging
const targetSegment = icp.segments[0]
const adMessaging = targetSegment.painPoints // Use in ad copy
```

---

## File Organization

```
/projects/[client-uuid]/
├── deliverables/
│   └── advertising/
│       ├── google-ads/
│       │   ├── search-campaigns/
│       │   ├── performance-max/
│       │   └── ad-copy-variations.json
│       ├── meta-ads/
│       │   ├── facebook-campaigns/
│       │   ├── instagram-campaigns/
│       │   └── creative-assets/
│       ├── linkedin-ads/
│       │   ├── lead-gen-campaigns/
│       │   └── thought-leadership/
│       ├── reddit-ads/
│       │   └── community-campaigns/
│       └── landing-pages/
│           ├── cro-analysis.json
│           └── ab-test-recommendations.json
```

---

## Conversion Optimization Framework

### Funnel Analysis
```
Awareness → Interest → Consideration → Action

Optimization Points:
- Ad relevance (CTR improvement)
- Landing page alignment (bounce rate reduction)
- Value proposition clarity (engagement)
- Friction removal (conversion rate)
- Trust signals (credibility)
```

### A/B Testing Strategy
```
Test Priority:
1. Headlines (highest impact)
2. Call-to-action (CTA)
3. Value proposition
4. Social proof
5. Visual elements

Statistical Significance:
- Minimum 100 conversions per variation
- 95% confidence level
- Run until significance achieved
```

---

## Related Documentation

- **[../../CLAUDE.md](../../CLAUDE.md)** - Main ORCHESTRAI architecture
- **[../../.claude/agents/google-ads-specialist.md](../../.claude/agents/google-ads-specialist.md)** - Google Ads agent
- **[../seo/CLAUDE.md](../seo/CLAUDE.md)** - SEO domain for keyword research integration

---

**This domain follows the Universal Agent Delegation Pattern with platform-specific optimization. Launch multiple platform agents in parallel for efficiency.**
