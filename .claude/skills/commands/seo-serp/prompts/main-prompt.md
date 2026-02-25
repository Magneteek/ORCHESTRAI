# SEO SERP Analysis

Analyze search engine results pages (SERPs) to understand ranking competitors, SERP features, and optimization opportunities.

## Usage

```bash
/seo-serp [keyword] [location_code?] [language?]
```

## Arguments

- `keyword` (required) - The search query to analyze (e.g., "dental implants near me")
- `location_code` (optional) - DataForSEO location code (default: 2840 for USA)
- `language` (optional) - Language name (default: "English")

## Examples

```bash
# Basic SERP analysis
/seo-serp "dental implants"

# Local search analysis
/seo-serp "tandarts maribor" 2705 "Slovenian"

# Long-tail keyword
/seo-serp "best dental implants for seniors 2025"
```

## Instructions

**CRITICAL: Use MCP tools ONLY. No custom scripts. Follow AGENT-MCP-QUICKSTART.md patterns.**

### Step 1: Parse Command Arguments

Extract keyword, location, and language parameters from command.

### Step 2: Analyze SERP Competitors

Use MCP tool to get ranking pages and their metrics:

```javascript
const serpData = await mcp__dataforseo__serp_competitors({
  keyword: keyword,
  location_code: location_code || 2840,
  language_name: language_name || "English",
  limit: 20
});
```

### Step 3: Get Search Intent

Understand what type of content ranks:

```javascript
const intentData = await mcp__dataforseo__search_intent({
  keywords: [keyword],
  location_code: location_code || 2840,
  language_name: language_name || "English"
});
```

### Step 4: Get Keyword Metrics

Fetch search volume and competition data:

```javascript
const keywordData = await mcp__dataforseo__keyword_overview({
  keywords: [keyword],
  location_code: location_code || 2840,
  language_name: language_name || "English"
});
```

### Step 5: Analyze SERP Features

Identify which SERP features are present (featured snippets, people also ask, local pack, etc.)

### Step 6: Generate Competitive Report

Format comprehensive SERP analysis:

```markdown
# SERP Analysis: [keyword]

## Search Intent
- Primary: [intent_type]
- Confidence: [percentage]%

## Keyword Metrics
- Search Volume: [volume]/month
- Competition: [level]
- CPC: $[amount]

## Top 10 Ranking Pages
| Pos | Domain | Page | Authority | Title |
|-----|--------|------|-----------|-------|
| 1   | [domain] | [path] | [DA] | [title] |
...

## SERP Features Detected
✅ Featured Snippet (Position 0)
✅ People Also Ask (4 questions)
✅ Related Searches
❌ Local Pack
❌ Video Carousel

## Content Pattern Analysis
- Average word count: [number]
- Common topics: [topic1], [topic2], [topic3]
- Content type: [article/guide/product page]

## Optimization Opportunities
1. [Specific actionable recommendation]
2. [Another recommendation]
3. [Another recommendation]
```

## Expected Output Format

```
# SERP Analysis: dental implants cost

## Search Intent
- Primary: Commercial Investigation (72% confidence)
- Secondary: Informational (28% confidence)

## Keyword Metrics
- Search Volume: 8,200/month
- Competition: Medium (48/100)
- CPC: $12.50

## Top 10 Ranking Pages
| Pos | Domain | Page Authority | Title |
|-----|--------|----------------|-------|
| 1   | webmd.com | 85 | Dental Implants: What You Need to Know About Cost |
| 2   | healthline.com | 82 | How Much Do Dental Implants Cost in 2025? |
| 3   | ada.org | 78 | Dental Implant Costs and Information |
...

## SERP Features Detected
✅ Featured Snippet (healthline.com - cost breakdown table)
✅ People Also Ask (6 questions)
✅ Related Searches
❌ Local Pack (not triggered for this query)
❌ Video Carousel

## Content Pattern Analysis
- Average article length: 2,800 words
- Common sections: Cost breakdown, factors affecting price, insurance coverage
- Format: In-depth guides with pricing tables

## Optimization Opportunities
1. **Target Featured Snippet**: Create clear pricing table with itemized costs
2. **Answer PAA Questions**: Include dedicated FAQ section
3. **Update for 2025**: Rankings favor recent "2025" dates in titles
4. **Add Visual Content**: Top 3 results all have cost comparison charts
5. **Local Angle**: Consider "near me" variation for local services
```

## Error Handling

- **No SERP data**: Report keyword too niche or API issue
- **Rate limiting**: Suggest retry timing
- **Invalid location**: Show valid location codes

## Success Criteria

✅ Uses MCP tools exclusively
✅ Code under 50 lines
✅ Returns data in under 10 seconds
✅ Identifies actionable opportunities
✅ Clear competitive landscape view

## Anti-Patterns to Avoid

❌ Manual scraping or HTTP requests
❌ Creating custom SERP scraper
❌ Hardcoded API credentials
❌ Overengineered analysis (>100 lines)

## Related Commands

- `/seo-keyword [keyword]` - Get keyword metrics
- `/seo-compare [domain1] [domain2]` - Domain comparison
- `/seo-audit [url]` - Start comprehensive crawl

## Use Cases

- **Content Planning**: Understand what type of content ranks
- **Competitor Research**: Identify who dominates SERPs
- **Feature Targeting**: Determine which SERP features to optimize for
- **Gap Analysis**: Find opportunities competitors miss
