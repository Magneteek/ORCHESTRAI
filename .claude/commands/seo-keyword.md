# SEO Keyword Analysis

Get instant keyword metrics including search volume, CPC, competition, and related keywords.

## Usage

```bash
/seo-keyword [keyword] [location_code?] [language?]
```

## Arguments

- `keyword` (required) - The keyword to analyze (e.g., "dental implants")
- `location_code` (optional) - DataForSEO location code (default: 2840 for USA)
- `language` (optional) - Language name (default: "English")

## Examples

```bash
# Basic usage
/seo-keyword "dental implants"

# Netherlands market
/seo-keyword "tandarts implantaten" 2528 "Dutch"

# Multiple words
/seo-keyword "best seo tools 2025"
```

## Instructions

**CRITICAL: Use MCP tools ONLY. No custom scripts. Follow AGENT-MCP-QUICKSTART.md patterns.**

### Step 1: Extract Parameters

Parse the command arguments:
- First argument after command = keyword
- Second argument (if present) = location_code
- Third argument (if present) = language_name

### Step 2: Get Keyword Data

Use MCP tool to fetch comprehensive keyword metrics:

```javascript
const keywordData = await mcp__dataforseo__keyword_overview({
  keywords: [keyword],
  location_code: location_code || 2840,
  language_name: language_name || "English"
});
```

### Step 3: Get Related Keywords

Fetch related terms for context:

```javascript
const relatedData = await mcp__dataforseo__related_keywords({
  keyword: keyword,
  location_code: location_code || 2840,
  language_name: language_name || "English",
  limit: 20
});
```

### Step 4: Get Search Intent

Analyze search intent classification:

```javascript
const intentData = await mcp__dataforseo__search_intent({
  keywords: [keyword],
  location_code: location_code || 2840,
  language_name: language_name || "English"
});
```

### Step 5: Generate Report

Format results into clear markdown output:

```markdown
# Keyword Analysis: [keyword]

## Core Metrics
- Search Volume: [monthly_searches]
- CPC (Cost Per Click): $[cpc]
- Competition: [competition_level] ([competition_index]/100)
- Keyword Difficulty: [difficulty]

## Search Intent
- Primary: [informational/commercial/transactional/navigational]
- Confidence: [intent_probability]%

## Related Keywords (Top 10)
1. [keyword] - [volume] searches/month
2. [keyword] - [volume] searches/month
...

## Recommendations
[Based on metrics, suggest content strategy]
```

## Expected Output Format

```
# Keyword Analysis: dental implants

## Core Metrics
- Search Volume: 12,500/month
- CPC (Cost Per Click): $8.50
- Competition: Medium (45/100)
- Keyword Difficulty: 62/100

## Search Intent
- Primary: Commercial (78% confidence)
- Secondary: Informational (22% confidence)

## Related Keywords (Top 10)
1. dental implant cost - 8,200 searches/month
2. teeth implants - 6,700 searches/month
3. dental implants near me - 5,400 searches/month
...

## Recommendations
✅ High commercial intent - excellent for service pages
✅ Medium competition - achievable with quality content
⚠️ Consider "dental implant cost" for supporting content
```

## Error Handling

- **Invalid keyword**: Show clear error message
- **API rate limit**: Suggest waiting before retry
- **No data found**: Report keyword has insufficient data

## Success Criteria

✅ Uses MCP tools exclusively (no axios/curl)
✅ Code under 40 lines
✅ Returns data in under 5 seconds
✅ Clear, actionable output format
✅ Handles errors gracefully

## Anti-Patterns to Avoid

❌ Creating custom DataForSEO API integration
❌ Hardcoding credentials
❌ Using HTTP requests instead of MCP tools
❌ Writing >50 lines of code

## Related Commands

- `/seo-serp [keyword]` - Analyze SERP results
- `/seo-compare [domain1] [domain2]` - Compare domains
- `/seo-audit [url]` - Start full site crawl
