# SEO Domain Comparison

Quick competitive analysis comparing two domains' keyword rankings, traffic estimates, and overlap opportunities.

## Usage

```bash
/seo-compare [domain1] [domain2] [location_code?] [language?]
```

## Arguments

- `domain1` (required) - First domain to compare (e.g., "example.com")
- `domain2` (required) - Competitor domain (e.g., "competitor.com")
- `location_code` (optional) - DataForSEO location code (default: 2840 for USA)
- `language` (optional) - Language name (default: "English")

## Examples

```bash
# Basic domain comparison
/seo-compare example.com competitor.com

# Netherlands market
/seo-compare mijnbedrijf.nl concurrent.nl 2528 "Dutch"

# Slovenia comparison
/seo-compare nasmeh.si konkurent.si 2705 "Slovenian"
```

## Instructions

**CRITICAL: Use MCP tools ONLY. No custom scripts. Follow AGENT-MCP-QUICKSTART.md patterns.**

### Step 1: Parse Domains

Extract domain1 and domain2 from command arguments. Remove http/https if present.

### Step 2: Get Competitor Domains

Find related competitors for context:

```javascript
const competitors1 = await mcp__dataforseo__competitor_domains({
  target: domain1,
  location_code: location_code || 2840,
  language_name: language_name || "English",
  limit: 10
});

const competitors2 = await mcp__dataforseo__competitor_domains({
  target: domain2,
  location_code: location_code || 2840,
  language_name: language_name || "English",
  limit: 10
});
```

### Step 3: Get Keyword Rankings

Fetch ranking keywords for both domains:

```javascript
const domain1Keywords = await mcp__dataforseo__domain_keywords({
  target: domain1,
  location_code: location_code || 2840,
  language_name: language_name || "English",
  limit: 100
});

const domain2Keywords = await mcp__dataforseo__domain_keywords({
  target: domain2,
  location_code: location_code || 2840,
  language_name: language_name || "English",
  limit: 100
});
```

### Step 4: Find Keyword Overlap

Identify keywords both domains rank for:

```javascript
const intersection = await mcp__dataforseo__domain_intersection({
  targets: [domain1, domain2],
  location_code: location_code || 2840,
  language_name: language_name || "English",
  limit: 50
});
```

### Step 5: Estimate Traffic

Get traffic estimates for both:

```javascript
const trafficData = await mcp__dataforseo__traffic_estimation({
  targets: [domain1, domain2],
  location_code: location_code || 2840,
  language_name: language_name || "English"
});
```

### Step 6: Generate Comparison Report

Format comprehensive competitive analysis:

```markdown
# Domain Comparison: [domain1] vs [domain2]

## Overview
| Metric | [domain1] | [domain2] | Winner |
|--------|-----------|-----------|--------|
| Ranking Keywords | [count] | [count] | [domain] |
| Est. Monthly Traffic | [traffic] | [traffic] | [domain] |
| Avg. Keyword Position | [pos] | [pos] | [domain] |
| Top 3 Rankings | [count] | [count] | [domain] |
| Top 10 Rankings | [count] | [count] | [domain] |

## Keyword Overlap Analysis
- Shared Keywords: [count]
- [domain1] Unique: [count]
- [domain2] Unique: [count]

### Head-to-Head Keywords (Top 10)
| Keyword | Volume | [domain1] Pos | [domain2] Pos | Opportunity |
|---------|--------|---------------|---------------|-------------|
| [kw] | [vol] | [pos] | [pos] | [analysis] |
...

## Competitive Gaps

### Keywords [domain2] Ranks For (You Don't)
1. [keyword] - Position [#] - [volume] searches/month
2. [keyword] - Position [#] - [volume] searches/month
...

### Keywords You Rank Better For
1. [keyword] - Your [#] vs Their [#] - [volume] searches/month
2. [keyword] - Your [#] vs Their [#] - [volume] searches/month
...

## Traffic Analysis
- [domain1] Est. Traffic: [traffic]/month
- [domain2] Est. Traffic: [traffic]/month
- Traffic Gap: [percentage]% [higher/lower]

## Strategic Recommendations
1. [Specific actionable recommendation]
2. [Another recommendation]
3. [Another recommendation]
```

## Expected Output Format

```
# Domain Comparison: nasmeh.si vs konkurent.si

## Overview
| Metric | nasmeh.si | konkurent.si | Winner |
|--------|-----------|--------------|--------|
| Ranking Keywords | 1,247 | 856 | nasmeh.si ✅ |
| Est. Monthly Traffic | 12,500 | 8,200 | nasmeh.si ✅ |
| Avg. Keyword Position | 18.3 | 24.7 | nasmeh.si ✅ |
| Top 3 Rankings | 34 | 18 | nasmeh.si ✅ |
| Top 10 Rankings | 156 | 98 | nasmeh.si ✅ |

## Keyword Overlap Analysis
- Shared Keywords: 342
- nasmeh.si Unique: 905
- konkurent.si Unique: 514

### Head-to-Head Keywords (Top 10)
| Keyword | Volume | nasmeh.si | konkurent.si | Opportunity |
|---------|--------|-----------|--------------|-------------|
| zobni implantati | 1,200 | #3 | #7 | Strengthen lead |
| zobna ordinacija | 800 | #8 | #4 | Gap to close |
| beljenje zob | 650 | #2 | #12 | Dominant |
...

## Competitive Gaps

### Keywords konkurent.si Ranks For (You Don't)
1. estetska stomatologija - Position #5 - 450 searches/month
2. ortodont maribor - Position #3 - 320 searches/month
3. zobna kirurgija - Position #8 - 280 searches/month

### Keywords You Rank Better For
1. zobni implantati maribor - Your #2 vs Their #15 - 600 searches/month
2. stomatologija maribor - Your #1 vs Their #8 - 500 searches/month
3. zobna protetika - Your #4 vs Their #18 - 380 searches/month

## Traffic Analysis
- nasmeh.si Est. Traffic: 12,500/month
- konkurent.si Est. Traffic: 8,200/month
- Traffic Gap: 52% higher ✅

## Strategic Recommendations
1. **Target Gap Keywords**: Focus on "estetska stomatologija" and "ortodont maribor" where competitor ranks but you don't
2. **Strengthen Leads**: Optimize top 10 keywords where you're close to surpassing competitor
3. **Defend Dominance**: Maintain strong rankings for keywords where you're already #1-3
4. **Local Optimization**: You have strong "maribor" keyword performance - expand this advantage
```

## Error Handling

- **Invalid domain**: Check format (no http://, just domain.com)
- **No ranking data**: Domain too new or not indexed
- **Rate limiting**: Suggest retry timing

## Success Criteria

✅ Uses MCP tools exclusively
✅ Code under 60 lines
✅ Returns data in under 15 seconds
✅ Clear competitive landscape
✅ Actionable gap analysis

## Anti-Patterns to Avoid

❌ Scraping domains directly
❌ Custom API integration scripts
❌ Hardcoded credentials
❌ Overengineered comparison (>100 lines)

## Related Commands

- `/seo-keyword [keyword]` - Deep keyword analysis
- `/seo-serp [keyword]` - SERP competitive view
- `/seo-audit [url]` - Full technical audit

## Use Cases

- **Competitive Research**: Understand competitor strengths/weaknesses
- **Content Gap Analysis**: Find keywords to target
- **Market Positioning**: See where you stand in competitive landscape
- **Strategic Planning**: Prioritize SEO efforts based on opportunities
