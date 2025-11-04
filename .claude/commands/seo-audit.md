# SEO Technical Audit (Start Crawl)

Start a comprehensive technical SEO audit crawl for a website. Returns task ID for later retrieval of results.

## Usage

```bash
/seo-audit [url] [max_pages?] [enable_js?]
```

## Arguments

- `url` (required) - Full website URL to audit (e.g., "https://example.com")
- `max_pages` (optional) - Maximum pages to crawl (default: 100, max: 1000)
- `enable_js` (optional) - Enable JavaScript rendering (default: true)

## Examples

```bash
# Basic audit (100 pages, JS enabled)
/seo-audit https://example.com

# Large site audit
/seo-audit https://largesite.com 500

# Audit without JavaScript
/seo-audit https://staticsite.com 200 false
```

## Instructions

**CRITICAL: Use MCP tools ONLY. No custom scripts. Follow AGENT-MCP-QUICKSTART.md patterns.**

### Step 1: Validate URL

- Check URL format (must include https://)
- Verify domain is accessible
- Remove trailing slashes

### Step 2: Start Comprehensive Crawl

Use DataForSEO MCP tool with optimal settings:

```javascript
const crawlTask = await mcp__dataforseo__onpage_task_post({
  target: url,
  max_crawl_pages: max_pages || 100,
  enable_javascript: enable_js !== false,
  enable_browser_rendering: true,  // For Core Web Vitals
  load_resources: true,            // For complete analysis
  calculate_keyword_density: true, // For content optimization
  check_spell: true                // For quality checks
});

const taskId = crawlTask.tasks[0].id;
```

### Step 3: Save Task Reference

Store task ID and metadata for later retrieval:

```javascript
const taskMetadata = {
  task_id: taskId,
  url: url,
  max_pages: max_pages || 100,
  started_at: new Date().toISOString(),
  status: "queued"
};

// Save to project if part of client work
// Otherwise just display
```

### Step 4: Provide User Instructions

Display clear next steps:

```markdown
# SEO Audit Started: [url]

✅ Crawl task successfully initiated

## Task Details
- **Task ID**: `[task_id]`
- **Target**: [url]
- **Max Pages**: [max_pages]
- **JavaScript**: [enabled/disabled]
- **Browser Rendering**: Enabled (Core Web Vitals)

## Status
Current Status: **Queued for processing**

Expected completion time:
- Small sites (<100 pages): 10-20 minutes
- Medium sites (100-300 pages): 20-40 minutes
- Large sites (300+ pages): 40-90 minutes

## Next Steps

### Check Crawl Progress
```bash
/seo-status [task_id]
```

### Get Full Report (when complete)
```bash
/seo-report [task_id]
```

## What's Being Analyzed

This comprehensive audit will provide:

✅ **Technical SEO**
- Page load speeds and Core Web Vitals
- Mobile responsiveness
- HTTPS and security
- Robots.txt and sitemap analysis
- Canonical tags and redirects

✅ **On-Page SEO**
- Title tags and meta descriptions
- Heading structure (H1-H6)
- Image alt text
- Internal linking structure
- Content quality signals

✅ **Issues Detection**
- 404 errors and broken links
- Duplicate content
- Orphaned pages
- Redirect chains
- Missing meta tags
- Slow loading pages

✅ **Content Analysis**
- Keyword density
- Content length and quality
- Readability scores
- Spelling and grammar

## Estimated API Cost
- Pages crawled: [max_pages]
- Estimated cost: $[calculated] DataForSEO credits

---

💡 **Tip**: Bookmark this task ID: `[task_id]`

You can check status at any time with `/seo-status [task_id]`
```

## Expected Output Format

```
# SEO Audit Started: https://deletereviews.nl

✅ Crawl task successfully initiated

## Task Details
- **Task ID**: `10291318-8161-0216-0000-1d9d23d22aba`
- **Target**: https://deletereviews.nl
- **Max Pages**: 300
- **JavaScript**: Enabled
- **Browser Rendering**: Enabled (Core Web Vitals)

## Status
Current Status: **Queued for processing**

Expected completion time: 30-45 minutes (300 page crawl)

## Next Steps

### Check Crawl Progress
```bash
/seo-status 10291318-8161-0216-0000-1d9d23d22aba
```

### Get Full Report (when complete)
```bash
/seo-report 10291318-8161-0216-0000-1d9d23d22aba
```

## What's Being Analyzed

This comprehensive audit will provide:

✅ Technical SEO (Core Web Vitals, mobile, HTTPS, robots.txt)
✅ On-Page SEO (titles, metas, headings, images, links)
✅ Issues Detection (404s, broken links, duplicates, orphans)
✅ Content Analysis (keyword density, quality, readability)

## Estimated API Cost
- Pages crawled: 300
- Estimated cost: $3.00 DataForSEO credits

---

💡 **Tip**: Save this task ID for later retrieval
```

## Error Handling

- **Invalid URL format**: Show correct format example
- **URL not accessible**: Check if site is online
- **Max pages exceeded**: Warn about 1000 page limit
- **API rate limit**: Suggest retry timing
- **Insufficient credits**: Check DataForSEO account balance

## Success Criteria

✅ Uses MCP tool exclusively (no custom crawlers)
✅ Code under 40 lines
✅ Returns task ID immediately
✅ Clear user instructions for next steps
✅ Realistic time estimates

## Anti-Patterns to Avoid

❌ Creating custom crawler scripts
❌ Polling for completion in this command (use /seo-status)
❌ Hardcoding credentials
❌ Blocking until crawl completes
❌ Overengineering (>688 lines like the anti-pattern)

## Related Commands

- `/seo-status [task-id]` - Check crawl progress
- `/seo-report [task-id]` - Generate full report
- `/seo-keyword [keyword]` - Quick keyword lookup
- `/seo-compare [domain1] [domain2]` - Competitive comparison

## Use Cases

- **New Client Onboarding**: Baseline audit before starting work
- **Competitor Analysis**: Audit competitor sites for insights
- **Regular Monitoring**: Quarterly health checks
- **Pre-Launch Checks**: Validate site before going live
- **Issue Discovery**: Find technical problems proactively

## Configuration Options

### Quick Audit (Fast)
```bash
/seo-audit https://example.com 50 false
```
- Small sample size
- No JavaScript overhead
- Results in ~10 minutes

### Standard Audit (Recommended)
```bash
/seo-audit https://example.com 100
```
- Good coverage for most sites
- JavaScript enabled
- Results in ~20 minutes

### Comprehensive Audit (Deep)
```bash
/seo-audit https://example.com 500
```
- Full site analysis
- All features enabled
- Results in ~60 minutes

## Important Notes

1. **Save Task ID**: You'll need this to retrieve results
2. **Check Progress**: Use `/seo-status` to monitor crawl
3. **Be Patient**: Large crawls take time (15-90 minutes)
4. **API Costs**: Each page crawled costs DataForSEO credits
5. **Browser Rendering**: Enabled by default for accurate Core Web Vitals

---

**Remember**: This command only STARTS the crawl. Use `/seo-status` to check progress and `/seo-report` to get results.
