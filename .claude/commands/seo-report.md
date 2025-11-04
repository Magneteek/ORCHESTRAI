# SEO Audit Report Generation

Generate a comprehensive technical SEO audit report from a completed crawl. Provides detailed analysis, issue prioritization, and actionable recommendations.

## Usage

```bash
/seo-report [task-id] [save-to-project?]
```

## Arguments

- `task-id` (required) - Task ID from completed `/seo-audit` crawl
- `save-to-project` (optional) - Project UUID to save report to (e.g., "nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e")

## Examples

```bash
# Generate report (display only)
/seo-report 10291318-8161-0216-0000-1d9d23d22aba

# Generate and save to client project
/seo-report 10291318-8161-0216-0000-1d9d23d22aba nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e
```

## Instructions

**CRITICAL: Use MCP tools ONLY. No custom scripts. Follow AGENT-MCP-QUICKSTART.md and seo-audit-clean-example.md patterns (~30 lines).**

### Step 1: Verify Crawl Completion

Check that crawl is complete before generating report:

```javascript
const status = await mcp__dataforseo__onpage_summary({ id: taskId });

if (status.tasks[0].status_code !== 20000) {
  console.log("Crawl not complete. Current status:", status.tasks[0].status_message);
  console.log("Use /seo-status to monitor progress.");
  return;
}
```

### Step 2: Retrieve All Audit Data

Use MCP tools in parallel for efficiency:

```javascript
const [
  summary,
  allPages,
  pages404,
  brokenLinks,
  redirectChains,
  duplicateTags,
  nonIndexable,
  allLinks,
  resources
] = await Promise.all([
  mcp__dataforseo__onpage_summary({ id: taskId }),
  mcp__dataforseo__onpage_pages({ id: taskId, limit: 1000 }),
  mcp__dataforseo__onpage_pages({ id: taskId, filters: ["status_code", "=", 404] }),
  mcp__dataforseo__onpage_links({ id: taskId, filters: ["broken", "=", true] }),
  mcp__dataforseo__onpage_redirect_chains({ id: taskId }),
  mcp__dataforseo__onpage_duplicate_tags({ id: taskId }),
  mcp__dataforseo__onpage_non_indexable({ id: taskId }),
  mcp__dataforseo__onpage_links({ id: taskId, limit: 10000 }),
  mcp__dataforseo__onpage_resources({ id: taskId, limit: 500 })
]);
```

### Step 3: Analyze Internal Linking

Build page map and calculate link metrics:

```javascript
const pageMap = new Map();
allPages.forEach(p => pageMap.set(p.url, { ...p, inbound: 0, outbound: 0 }));

allLinks.forEach(l => {
  const target = pageMap.get(l.url_to);
  if (target) target.inbound++;
  const source = pageMap.get(l.url_from);
  if (source) source.outbound++;
});

const orphaned = Array.from(pageMap.values())
  .filter(p => p.inbound === 0 && p.url !== summary.tasks[0].result[0].crawl_status.target);

const excessive = Array.from(pageMap.values())
  .filter(p => p.outbound > 100);
```

### Step 4: Analyze Performance

Identify slow pages and Core Web Vitals issues:

```javascript
const slowPages = allPages.filter(p => p.page_timing?.time_to_interactive > 3000);
const largeCWV = allPages.filter(p => p.page_timing?.cumulative_layout_shift > 0.1);
```

### Step 5: Generate Comprehensive Report

Format markdown report with executive summary, detailed findings, and prioritized recommendations:

```markdown
# Technical SEO Audit Report

**Target**: [url]
**Crawl Date**: [date]
**Pages Analyzed**: [count]
**Task ID**: `[task_id]`

---

## Executive Summary

[2-3 paragraph summary of overall site health]

**Overall Health Score**: [X]/100

**Critical Issues**: [count]
**Warnings**: [count]
**Recommendations**: [count]

---

## Critical Issues 🚨

### 1. [Issue Category]
**Severity**: Critical
**Pages Affected**: [count]

[Description of issue]

**Impact**: [SEO/UX impact description]

**Action Required**:
1. [Specific step]
2. [Specific step]

---

## Technical SEO Analysis

### Site Crawlability
- ✅ Robots.txt: [status]
- ✅ XML Sitemap: [status]
- ⚠️ Crawl Depth: Max [depth] levels

### HTTPS & Security
- ✅ SSL Certificate: Valid
- ✅ Mixed Content: None detected
- ✅ Security Headers: [status]

### Mobile Optimization
- ✅ Mobile-Friendly: [yes/no]
- ✅ Viewport Tag: Present
- ⚠️ Touch Elements: [spacing issues count]

### Core Web Vitals
- **LCP** (Largest Contentful Paint): [value]s
- **FID** (First Input Delay): [value]ms
- **CLS** (Cumulative Layout Shift): [value]

[X] pages pass Core Web Vitals thresholds
[Y] pages need optimization

---

## On-Page SEO Analysis

### Title Tags
- ✅ Present: [count]/[total] pages
- ⚠️ Missing: [count] pages
- ⚠️ Duplicate: [count] pages
- ⚠️ Too Long (>60 chars): [count] pages
- ⚠️ Too Short (<30 chars): [count] pages

### Meta Descriptions
- ✅ Present: [count]/[total] pages
- ⚠️ Missing: [count] pages
- ⚠️ Duplicate: [count] pages
- ⚠️ Too Long (>160 chars): [count] pages

### Heading Structure
- ✅ H1 Present: [count]/[total] pages
- ⚠️ Missing H1: [count] pages
- ⚠️ Multiple H1: [count] pages
- ✅ Proper Hierarchy: [percentage]%

### Image Optimization
- Total Images: [count]
- ⚠️ Missing Alt Text: [count] images
- ⚠️ Large Files (>500KB): [count] images
- ✅ Modern Formats (WebP): [count] images

---

## Internal Linking Analysis

### Link Distribution
- Total Internal Links: [count]
- Average Links Per Page: [avg]
- Max Links on Single Page: [max] ([url])

### Orphaned Pages
[count] pages with zero inbound internal links

**Critical Orphans**:
1. [url] - [page_title]
2. [url] - [page_title]
...

### Excessive Outbound Links
[count] pages with >100 outbound links

**Pages to Review**:
1. [url] - [count] links
2. [url] - [count] links

---

## Error Detection

### 404 Not Found Errors
[count] pages return 404 status

**Top 404 Pages**:
1. [url] - [inbound_links] inbound links
2. [url] - [inbound_links] inbound links
...

### Broken Links
[count] broken internal/external links detected

**Critical Broken Links**:
1. [source_url] → [broken_url]
2. [source_url] → [broken_url]

### Redirect Chains
[count] redirect chains detected

**Longest Chains** (>2 hops):
1. [url] → [url] → [url] (3 hops)
2. [url] → [url] → [url] → [url] (4 hops)

### Duplicate Content
[count] sets of duplicate title/description tags

**Duplicates to Fix**:
1. Title: "[title]" - [count] pages
2. Description: "[desc]" - [count] pages

---

## Content Analysis

### Content Length
- Average Words Per Page: [avg]
- Thin Content (<300 words): [count] pages
- Substantial Content (>1000 words): [count] pages

### Keyword Density
Top keywords across site:
1. [keyword] - [frequency] occurrences
2. [keyword] - [frequency] occurrences
...

---

## Performance Analysis

### Page Load Speed
- Average Load Time: [time]s
- Fastest Page: [time]s - [url]
- Slowest Page: [time]s - [url]

### Pages >3s Load Time
[count] pages exceed recommended load time

**Slowest Pages**:
1. [url] - [time]s
2. [url] - [time]s

### Resource Optimization
- Total Resources: [count]
- CSS Files: [count] ([total_size]MB)
- JavaScript Files: [count] ([total_size]MB)
- Images: [count] ([total_size]MB)

**Optimization Opportunities**:
- Minify CSS: Save [size]MB
- Compress Images: Save [size]MB
- Enable Caching: Reduce [count] requests

---

## Indexability Analysis

### Non-Indexable Pages
[count] pages blocked from indexing

**Blocked Pages**:
1. [url] - Reason: [noindex/robots.txt/canonical]
2. [url] - Reason: [noindex/robots.txt/canonical]

### Canonical Tags
- ✅ Canonical Present: [count]/[total] pages
- ⚠️ Missing Canonical: [count] pages
- ⚠️ Incorrect Canonical: [count] pages

---

## Recommendations

### Priority 1: Critical (Fix Immediately)
1. **Fix Broken Links**: [count] broken links causing 404 errors
   - Impact: Lost link equity, poor UX
   - Effort: 2-4 hours

2. **Resolve Orphaned Pages**: [count] pages unreachable via internal links
   - Impact: Pages won't be crawled or ranked
   - Effort: 1-2 hours

### Priority 2: High (Fix This Week)
1. **Optimize Core Web Vitals**: [count] pages failing thresholds
   - Impact: Google ranking factor
   - Effort: 4-8 hours

2. **Fix Duplicate Content**: [count] duplicate title/meta tags
   - Impact: Competing with yourself in SERPs
   - Effort: 2-3 hours

### Priority 3: Medium (Fix This Month)
1. **Improve Page Speed**: [count] slow loading pages
   - Impact: User experience and rankings
   - Effort: 8-16 hours

2. **Optimize Images**: [count] images missing alt text
   - Impact: Accessibility and image SEO
   - Effort: 3-5 hours

### Priority 4: Low (Ongoing Optimization)
1. **Content Expansion**: [count] thin content pages
   - Impact: Better rankings for target keywords
   - Effort: Ongoing

---

## Next Steps

1. **Address Critical Issues**: Start with Priority 1 items
2. **Monitor Progress**: Re-audit in 30 days
3. **Track Rankings**: Monitor keyword positions for improved pages
4. **Implement Fixes**: Use prioritized recommendation list

---

## Technical Details

**Crawl Configuration**:
- Max Pages: [max_pages]
- JavaScript: [enabled/disabled]
- Browser Rendering: [enabled/disabled]
- Crawl Duration: [duration]

**Data Collection**:
- Pages Analyzed: [count]
- Links Analyzed: [count]
- Resources Analyzed: [count]
- Total Data Points: [estimated_count]

---

*Report generated by ORCHESTRAI SEO Analysis System*
*Task ID: `[task_id]`*
*Generated: [timestamp]*
```

### Step 6: Save Report (Optional)

If project UUID provided, save to deliverables:

```javascript
if (projectUuid) {
  const reportPath = `/Users/kris/CLAUDEtools/ORCHESTRAI/projects/${projectUuid}/deliverables/seo/audit-report-${Date.now()}.md`;
  // Save report markdown to file
}
```

## Expected Output Format

See complete example in `/examples/seo-audit-clean-example.md`

Key sections:
- Executive summary with health score
- Critical issues (red flags)
- Technical SEO analysis (crawlability, HTTPS, mobile)
- On-page SEO (titles, metas, headings, images)
- Internal linking (orphans, excessive links)
- Error detection (404s, broken links, redirects)
- Content analysis (length, keywords)
- Performance (speed, Core Web Vitals)
- Indexability (robots, canonicals)
- Prioritized recommendations

## Error Handling

- **Crawl not complete**: Show status and suggest `/seo-status`
- **Task expired**: Task data deleted (>30 days old)
- **No data available**: Crawl may have failed
- **Invalid task ID**: Check format
- **Save failed**: Project directory doesn't exist

## Success Criteria

✅ Uses MCP tools exclusively (follow clean example)
✅ Code ~30-40 lines (data retrieval + analysis)
✅ Comprehensive report covering all aspects
✅ Prioritized, actionable recommendations
✅ Professional formatting

## Anti-Patterns to Avoid

❌ Creating 688-line custom script (like the anti-pattern)
❌ Hardcoded analysis thresholds
❌ Missing prioritization
❌ Generic recommendations
❌ Poor formatting

## Related Commands

- `/seo-audit [url]` - Start new crawl
- `/seo-status [task-id]` - Check progress
- `/seo-keyword [keyword]` - Keyword analysis
- `/seo-compare [domain1] [domain2]` - Competitive analysis

## Use Cases

- **Client Onboarding**: Initial audit for new clients
- **Quarterly Reviews**: Regular health checks
- **Pre-Launch**: Validate site before going live
- **Post-Migration**: Verify everything still works
- **Competitive Analysis**: Audit competitor sites

## Report Customization

### Quick Report (Essential Issues Only)
Focus on Critical and High priority items only.

### Standard Report (Recommended)
All sections with prioritized recommendations.

### Comprehensive Report (Everything)
Include all data points, raw metrics, and technical details.

## Important Notes

1. **Data Retrieval**: Use `Promise.all()` for parallel MCP tool calls
2. **Analysis Logic**: Keep it simple (<10 lines per metric)
3. **Formatting**: Use clear markdown with emojis for visual hierarchy
4. **Prioritization**: Always include Priority 1-4 categories
5. **Actionability**: Every recommendation must be specific and actionable

---

**Pro Tip**: Save reports to project deliverables for client documentation and progress tracking.

## Example Workflow

```bash
# 1. Start audit
/seo-audit https://example.com 300

# Output: Task ID: abc123...

# 2. Check status (wait 20-30 minutes)
/seo-status abc123...

# Output: Complete!

# 3. Generate report
/seo-report abc123...

# Output: Full comprehensive report

# 4. Save to client project
/seo-report abc123... client-uuid-here
```

---

**Remember**: This is the culmination of the audit process. Make it comprehensive, actionable, and professional.
