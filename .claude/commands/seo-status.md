# SEO Audit Status Check

Check the progress of a running SEO audit crawl. Shows current status, pages processed, and estimated completion time.

## Usage

```bash
/seo-status [task-id]
```

## Arguments

- `task-id` (required) - Task ID from `/seo-audit` command (e.g., "10291318-8161-0216-0000-1d9d23d22aba")

## Examples

```bash
# Check crawl status
/seo-status 10291318-8161-0216-0000-1d9d23d22aba

# Copy-paste from previous audit
/seo-status [paste task ID here]
```

## Instructions

**CRITICAL: Use MCP tools ONLY. No custom scripts. Follow AGENT-MCP-QUICKSTART.md patterns.**

### Step 1: Validate Task ID

Check task ID format (UUID pattern: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

### Step 2: Query Crawl Status

Use MCP tool to get current status:

```javascript
const statusData = await mcp__dataforseo__onpage_summary({
  id: taskId
});

const task = statusData.tasks[0];
const statusCode = task.status_code;
const statusMessage = task.status_message;
```

### Step 3: Interpret Status Codes

DataForSEO status codes:
- **20000**: Crawl completed successfully
- **40601**: Crawl in progress (processing)
- **40602**: Crawl queued (waiting to start)
- **40603**: Crawl failed (error occurred)

### Step 4: Calculate Progress

If crawling is in progress, estimate completion:

```javascript
const pagesProcessed = task.result?.[0]?.crawl_progress || 0;
const maxPages = task.data?.max_crawl_pages || 100;
const progressPercent = Math.round((pagesProcessed / maxPages) * 100);
```

### Step 5: Display Status Report

Format user-friendly status update:

```markdown
# SEO Audit Status

## Task Information
- **Task ID**: `[task_id]`
- **Target URL**: [url]
- **Status**: [In Queue / Processing / Complete / Failed]

## Progress
[Progress bar visual]
[X] of [max_pages] pages processed ([percentage]%)

## Timing
- Started: [timestamp]
- Running for: [duration]
- Estimated completion: [time remaining]

## What Happens Next

[Instructions based on status]
```

## Expected Output Formats

### Status: Queued (40602)

```
# SEO Audit Status

## Task Information
- **Task ID**: `10291318-8161-0216-0000-1d9d23d22aba`
- **Target URL**: https://deletereviews.nl
- **Status**: ⏳ **In Queue** (waiting to start)

## Queue Information
Your crawl is queued for processing. DataForSEO processes crawls sequentially.

**Typical queue times:**
- Off-peak hours: 2-5 minutes
- Peak hours: 10-15 minutes

## What Happens Next

✅ Your crawl will automatically start when resources become available
✅ No action needed from you
✅ Check back in 5-10 minutes

### Check Again
```bash
/seo-status 10291318-8161-0216-0000-1d9d23d22aba
```
```

### Status: Processing (40601)

```
# SEO Audit Status

## Task Information
- **Task ID**: `10291318-8161-0216-0000-1d9d23d22aba`
- **Target URL**: https://deletereviews.nl
- **Status**: 🔄 **Processing** (actively crawling)

## Progress
████████████░░░░░░░░ 178 of 300 pages (59%)

## Timing
- Started: 2025-01-15 14:23:00
- Running for: 18 minutes
- Estimated completion: 12 minutes remaining

## Current Activity
✅ Crawling pages
✅ Analyzing content
✅ Checking links
✅ Measuring Core Web Vitals

## What Happens Next

The crawl is progressing well. Check back in 10-15 minutes for completion.

### Check Again
```bash
/seo-status 10291318-8161-0216-0000-1d9d23d22aba
```

### Get Report (when complete)
```bash
/seo-report 10291318-8161-0216-0000-1d9d23d22aba
```
```

### Status: Complete (20000)

```
# SEO Audit Status

## Task Information
- **Task ID**: `10291318-8161-0216-0000-1d9d23d22aba`
- **Target URL**: https://deletereviews.nl
- **Status**: ✅ **COMPLETE** (ready for analysis)

## Results Summary
████████████████████ 300 of 300 pages (100%)

## Timing
- Started: 2025-01-15 14:23:00
- Completed: 2025-01-15 15:08:00
- Total time: 45 minutes

## Quick Stats
- **Pages Crawled**: 300
- **Links Analyzed**: 4,782
- **Issues Found**: 47
  - Critical: 8
  - Warnings: 23
  - Recommendations: 16

## What Happens Next

✅ Your crawl is complete and ready for analysis!
✅ Generate comprehensive report to see all findings

### Generate Full Report
```bash
/seo-report 10291318-8161-0216-0000-1d9d23d22aba
```

This will provide:
- Detailed technical analysis
- Page-by-page breakdown
- Issue prioritization
- Actionable recommendations
```

### Status: Failed (40603)

```
# SEO Audit Status

## Task Information
- **Task ID**: `10291318-8161-0216-0000-1d9d23d22aba`
- **Target URL**: https://deletereviews.nl
- **Status**: ❌ **FAILED** (error occurred)

## Error Information
- **Error Code**: [error_code]
- **Error Message**: [error_message]

## Common Causes
1. **Site Unreachable**: Domain not responding or blocked
2. **Robots.txt Blocked**: Site disallows crawling
3. **Authentication Required**: Site requires login
4. **Rate Limiting**: Too many requests to site
5. **Invalid URL**: URL format incorrect

## What To Do

### Try Again
```bash
/seo-audit https://deletereviews.nl 300
```

### Or Contact Support
If error persists, check:
- Is the site online and accessible?
- Does robots.txt allow crawling?
- Is there a firewall blocking DataForSEO?
```

## Error Handling

- **Invalid task ID**: Show format example
- **Task not found**: Verify task ID is correct
- **API error**: Show error message and suggest retry
- **Timeout**: Task too old (DataForSEO keeps results for 30 days)

## Success Criteria

✅ Uses MCP tool exclusively
✅ Code under 30 lines
✅ Clear visual progress indicators
✅ Actionable next steps
✅ Handles all status codes

## Anti-Patterns to Avoid

❌ Polling in tight loop
❌ Creating custom status checker
❌ Hardcoded status messages
❌ Blocking until completion
❌ Overengineered status display (>50 lines)

## Related Commands

- `/seo-audit [url]` - Start new crawl
- `/seo-report [task-id]` - Generate full report (when complete)
- `/seo-keyword [keyword]` - Quick keyword data
- `/seo-compare [domain1] [domain2]` - Domain comparison

## Use Cases

- **Monitor Progress**: Check how far crawl has progressed
- **Plan Next Steps**: Know when to generate report
- **Troubleshoot Issues**: Identify if crawl failed
- **Estimate Timing**: See how much longer until completion

## Status Code Reference

| Code | Status | Meaning | Action |
|------|--------|---------|--------|
| 20000 | Complete | Crawl finished | Generate report |
| 40601 | Processing | Actively crawling | Wait 10-15 min |
| 40602 | In Queue | Waiting to start | Wait 5-10 min |
| 40603 | Failed | Error occurred | Check error and retry |

## Important Notes

1. **Don't Poll Excessively**: Check every 5-10 minutes, not every 30 seconds
2. **Task Expiration**: Results stored for 30 days, then deleted
3. **No Manual Refresh**: Status updates automatically when you check
4. **Progress Estimates**: Based on typical crawl speeds, may vary

---

**Pro Tip**: Save task IDs in project notes for easy reference later.
