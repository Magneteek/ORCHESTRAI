# Google Search Console MCP Server - Usage Guide

## Overview

The Google Search Console (GSC) MCP server provides direct access to Google Search Console data through the Model Context Protocol. This enables powerful SEO analysis, indexing management, and search performance tracking directly within ORCHESTRAI workflows.

---

## Setup Status ✅

Your GSC MCP server is configured and ready to use after restarting Claude Code.

### Configuration Files

1. **Claude Code MCP Config**: `/Users/kris/.config/claude-code/mcp.json`
   ```json
   {
     "gsc": {
       "command": "npx",
       "args": ["-y", "mcp-server-gsc"],
       "env": {
         "GOOGLE_APPLICATION_CREDENTIALS": "/Users/kris/CLAUDEtools/OAuth Client ID - Krisbal-orchestrai.json"
       }
     }
   }
   ```

2. **Project .env**: Added `GOOGLE_APPLICATION_CREDENTIALS` variable

3. **OAuth Credentials**: `/Users/kris/CLAUDEtools/OAuth Client ID - Krisbal-orchestrai.json`

---

## First-Time Authentication

The first time you use any GSC function, you'll need to complete OAuth authentication:

1. The MCP server will open your browser automatically
2. Log in with your Google account that has Search Console access
3. Grant permissions to the application
4. The MCP server will store the access token for future use

**Note**: This only needs to be done once. After authentication, the token will be automatically refreshed.

---

## Available Functions

### 1. List Sites
**Function**: `mcp__gsc__list_sites`

Lists all websites/properties in your Google Search Console account.

**Example Usage**:
```javascript
// In ORCHESTRAI agent or script
const sites = await mcp__gsc__list_sites();
```

**Use Cases**:
- Discover all properties you have access to
- Verify site ownership and permissions
- Build multi-site analytics dashboards

---

### 2. Search Analytics
**Function**: `mcp__gsc__search_analytics`

Retrieves search performance data including clicks, impressions, CTR, and position.

**Parameters**:
- `siteUrl` (required): The site URL (e.g., "sc-domain:example.com" or "https://www.example.com/")
- `startDate` (required): Start date in YYYY-MM-DD format
- `endDate` (required): End date in YYYY-MM-DD format
- `dimensions` (optional): Comma-separated list (query, page, country, device, searchAppearance)
- `rowLimit` (optional): Maximum rows to return (default: 1000)
- `type` (optional): Search type (web, image, video, news)
- `aggregationType` (optional): How to aggregate results (auto, byPage, byProperty)

**Example Usage**:
```javascript
// Get search performance for last 30 days
const performance = await mcp__gsc__search_analytics({
  siteUrl: "sc-domain:example.com",
  startDate: "2025-10-01",
  endDate: "2025-10-31",
  dimensions: "query,page",
  rowLimit: 100
});

// Analyze by device type
const deviceData = await mcp__gsc__search_analytics({
  siteUrl: "https://www.example.com/",
  startDate: "2025-10-01",
  endDate: "2025-10-31",
  dimensions: "device"
});
```

**Use Cases**:
- Track keyword performance over time
- Identify top-performing pages
- Analyze CTR and position trends
- Compare mobile vs desktop performance
- Monitor international traffic by country

---

### 3. URL Inspection
**Function**: `mcp__gsc__index_inspect`

Inspects a specific URL to check its indexing status, coverage issues, and mobile usability.

**Parameters**:
- `siteUrl` (required): The site URL property
- `inspectionUrl` (required): The fully-qualified URL to inspect
- `languageCode` (optional): Language for issue messages (default: "en-US")

**Example Usage**:
```javascript
// Check if a URL is indexed
const inspection = await mcp__gsc__index_inspect({
  siteUrl: "sc-domain:example.com",
  inspectionUrl: "https://www.example.com/new-article/",
  languageCode: "en-US"
});
```

**Use Cases**:
- Verify new content is indexed
- Diagnose indexing issues
- Check mobile usability
- Identify structured data problems
- Monitor Core Web Vitals for specific URLs

---

### 4. List Sitemaps
**Function**: `mcp__gsc__list_sitemaps`

Lists all sitemaps submitted for a property.

**Parameters**:
- `siteUrl` (required): The site URL
- `sitemapIndex` (optional): Filter by sitemap index URL

**Example Usage**:
```javascript
// List all sitemaps
const sitemaps = await mcp__gsc__list_sitemaps({
  siteUrl: "https://www.example.com/"
});
```

**Use Cases**:
- Audit sitemap coverage
- Check sitemap submission status
- Monitor sitemap errors and warnings

---

### 5. Get Sitemap Details
**Function**: `mcp__gsc__get_sitemap`

Retrieves detailed information about a specific sitemap.

**Parameters**:
- `siteUrl` (required): The site URL
- `feedpath` (required): The sitemap URL

**Example Usage**:
```javascript
// Get sitemap details
const sitemapInfo = await mcp__gsc__get_sitemap({
  siteUrl: "https://www.example.com/",
  feedpath: "https://www.example.com/sitemap.xml"
});
```

**Use Cases**:
- Check sitemap processing status
- Review discovered URLs
- Identify sitemap errors

---

### 6. Submit Sitemap
**Function**: `mcp__gsc__submit_sitemap`

Submits a new sitemap or resubmits an existing one.

**Parameters**:
- `siteUrl` (required): The site URL
- `feedpath` (required): The sitemap URL to submit

**Example Usage**:
```javascript
// Submit a new sitemap
await mcp__gsc__submit_sitemap({
  siteUrl: "https://www.example.com/",
  feedpath: "https://www.example.com/sitemap-new.xml"
});
```

**Use Cases**:
- Submit new sitemaps after site updates
- Force re-crawl of updated content
- Add sitemaps for new site sections

---

## Integration with ORCHESTRAI Agents

### SEO Domain Agents

The following agents can leverage GSC MCP functions:

1. **seo-technical-analysis**
   - Monitor indexing status
   - Track Core Web Vitals
   - Identify technical SEO issues

2. **seo-competitor-analysis**
   - Compare search performance
   - Analyze keyword gaps
   - Track SERP position changes

3. **seo-content-optimization**
   - Identify low-performing pages
   - Find content optimization opportunities
   - Track content performance post-optimization

4. **seo-keyword-research**
   - Discover actual search queries
   - Analyze search intent from real data
   - Identify long-tail opportunities

### Example Agent Integration

```javascript
// In seo-technical-analysis agent
async function analyzeIndexingHealth(domain) {
  // 1. List all sites
  const sites = await mcp__gsc__list_sites();

  // 2. Get search analytics for last 90 days
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 90*24*60*60*1000).toISOString().split('T')[0];

  const analytics = await mcp__gsc__search_analytics({
    siteUrl: `sc-domain:${domain}`,
    startDate,
    endDate,
    dimensions: "page",
    rowLimit: 1000
  });

  // 3. Inspect top pages
  const topPages = analytics.rows.slice(0, 10);
  const inspections = await Promise.all(
    topPages.map(row =>
      mcp__gsc__index_inspect({
        siteUrl: `sc-domain:${domain}`,
        inspectionUrl: row.keys[0]
      })
    )
  );

  // 4. Generate health report
  return {
    totalPages: analytics.rows.length,
    indexingIssues: inspections.filter(i => i.indexStatusResult.verdict !== 'PASS'),
    performanceSummary: calculateMetrics(analytics)
  };
}
```

---

## Common Use Cases

### 1. Content Performance Dashboard

Track how your content is performing in search:

```javascript
// Get page-level performance
const pagePerformance = await mcp__gsc__search_analytics({
  siteUrl: "sc-domain:example.com",
  startDate: "2025-09-01",
  endDate: "2025-10-31",
  dimensions: "page",
  rowLimit: 100
});

// Identify opportunities
const lowCTRPages = pagePerformance.rows
  .filter(row => row.ctr < 0.02 && row.impressions > 100)
  .sort((a, b) => b.impressions - a.impressions);
```

### 2. Keyword Gap Analysis

Find keywords where you're ranking but not getting clicks:

```javascript
const keywordData = await mcp__gsc__search_analytics({
  siteUrl: "sc-domain:example.com",
  startDate: "2025-10-01",
  endDate: "2025-10-31",
  dimensions: "query",
  rowLimit: 1000
});

const opportunityKeywords = keywordData.rows
  .filter(row => row.position <= 10 && row.ctr < 0.05)
  .sort((a, b) => b.impressions - a.impressions);
```

### 3. Indexing Issue Detection

Automatically detect and report indexing problems:

```javascript
// Get all indexed pages
const pages = await mcp__gsc__search_analytics({
  siteUrl: "sc-domain:example.com",
  startDate: "2025-10-01",
  endDate: "2025-10-31",
  dimensions: "page",
  rowLimit: 1000
});

// Inspect critical pages
const criticalPages = pages.rows.slice(0, 50);
const issues = [];

for (const page of criticalPages) {
  const inspection = await mcp__gsc__index_inspect({
    siteUrl: "sc-domain:example.com",
    inspectionUrl: page.keys[0]
  });

  if (inspection.indexStatusResult.verdict !== 'PASS') {
    issues.push({
      url: page.keys[0],
      issue: inspection.indexStatusResult.verdict,
      details: inspection.indexStatusResult
    });
  }
}
```

### 4. Multi-Site Monitoring

Monitor multiple properties from a single dashboard:

```javascript
const sites = await mcp__gsc__list_sites();

const allSiteData = await Promise.all(
  sites.siteEntry.map(async (site) => {
    const analytics = await mcp__gsc__search_analytics({
      siteUrl: site.siteUrl,
      startDate: "2025-10-01",
      endDate: "2025-10-31"
    });

    return {
      site: site.siteUrl,
      clicks: analytics.rows.reduce((sum, row) => sum + row.clicks, 0),
      impressions: analytics.rows.reduce((sum, row) => sum + row.impressions, 0),
      avgPosition: analytics.rows.reduce((sum, row) => sum + row.position, 0) / analytics.rows.length
    };
  })
);
```

---

## Best Practices

### 1. Rate Limiting

Google Search Console API has rate limits. Best practices:

- Cache results when possible
- Batch requests for multiple URLs
- Use appropriate date ranges (don't query day-by-day for historical data)
- Implement exponential backoff for retries

### 2. Date Ranges

- Fresh data: Data for the last 3-4 days is preliminary and may change
- Historical data: Older than 16 months is removed
- Recommended: Use 7-day windows for trend analysis

### 3. Dimension Limits

- Maximum 3 dimensions per query
- Common combinations:
  - `query,page` - Keyword-page performance
  - `page,device` - Page performance by device
  - `query,country` - Keyword performance by location

### 4. Error Handling

Always implement error handling:

```javascript
try {
  const data = await mcp__gsc__search_analytics({
    siteUrl: "sc-domain:example.com",
    startDate: "2025-10-01",
    endDate: "2025-10-31"
  });

  if (!data.rows || data.rows.length === 0) {
    console.log("No data available for this period");
    return;
  }

  // Process data
} catch (error) {
  console.error("GSC API Error:", error.message);
  // Implement retry logic or fallback
}
```

---

## Troubleshooting

### Issue: "ENOENT: no such file or directory"

**Solution**:
- Restart Claude Code to reload MCP configuration
- Verify `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Check that the OAuth credentials file exists

### Issue: Authentication fails

**Solution**:
- Ensure your Google account has access to Search Console
- Check that the OAuth credentials are for the correct project
- Try re-authenticating by removing cached tokens

### Issue: No data returned

**Solution**:
- Verify the site URL format matches Search Console (use `sc-domain:` prefix for domain properties)
- Check that the date range has data (fresh data may not be available)
- Ensure you have permission to access the property

### Issue: Rate limit exceeded

**Solution**:
- Implement caching for frequently accessed data
- Reduce query frequency
- Use broader date ranges instead of multiple narrow queries

---

## Integration Examples

### Example 1: Weekly SEO Health Report

```javascript
async function generateWeeklyReport(siteUrl) {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0];

  // Get weekly data
  const thisWeek = await mcp__gsc__search_analytics({
    siteUrl,
    startDate,
    endDate,
    dimensions: "date"
  });

  // Get previous week for comparison
  const prevEndDate = startDate;
  const prevStartDate = new Date(Date.now() - 14*24*60*60*1000).toISOString().split('T')[0];

  const lastWeek = await mcp__gsc__search_analytics({
    siteUrl,
    startDate: prevStartDate,
    endDate: prevEndDate,
    dimensions: "date"
  });

  // Calculate changes
  const thisWeekTotal = sumMetrics(thisWeek.rows);
  const lastWeekTotal = sumMetrics(lastWeek.rows);

  return {
    clicks: {
      current: thisWeekTotal.clicks,
      change: ((thisWeekTotal.clicks - lastWeekTotal.clicks) / lastWeekTotal.clicks * 100).toFixed(1)
    },
    impressions: {
      current: thisWeekTotal.impressions,
      change: ((thisWeekTotal.impressions - lastWeekTotal.impressions) / lastWeekTotal.impressions * 100).toFixed(1)
    },
    avgPosition: {
      current: thisWeekTotal.avgPosition,
      change: (thisWeekTotal.avgPosition - lastWeekTotal.avgPosition).toFixed(1)
    }
  };
}
```

### Example 2: Content Audit Automation

```javascript
async function auditContentPerformance(siteUrl) {
  // Get all pages with performance data
  const pages = await mcp__gsc__search_analytics({
    siteUrl,
    startDate: "2025-07-01",
    endDate: "2025-10-31",
    dimensions: "page",
    rowLimit: 1000
  });

  // Categorize pages
  const results = {
    highPerformers: [],
    needsOptimization: [],
    indexingIssues: []
  };

  for (const page of pages.rows) {
    const url = page.keys[0];

    // Check indexing status
    const inspection = await mcp__gsc__index_inspect({
      siteUrl,
      inspectionUrl: url
    });

    if (inspection.indexStatusResult.verdict !== 'PASS') {
      results.indexingIssues.push({
        url,
        issue: inspection.indexStatusResult.verdict,
        metrics: page
      });
      continue;
    }

    // Categorize by performance
    if (page.clicks > 100 && page.ctr > 0.05) {
      results.highPerformers.push({ url, metrics: page });
    } else if (page.impressions > 500 && page.ctr < 0.02) {
      results.needsOptimization.push({ url, metrics: page });
    }
  }

  return results;
}
```

---

## Next Steps

1. **Restart Claude Code** to activate the MCP server
2. **Test the connection** by running `mcp__gsc__list_sites`
3. **Complete OAuth flow** when prompted
4. **Start building** SEO automation workflows

---

## Resources

- [Google Search Console API Documentation](https://developers.google.com/webmaster-tools/search-console-api-original)
- [mcp-server-gsc GitHub](https://github.com/johnneerdael/mcp-server-gsc)
- [ORCHESTRAI SEO Domain Documentation](../../orchestrai-domains/seo/CLAUDE.md)

---

## Support

If you encounter issues:

1. Run the verification script: `./scripts/verify-gsc-setup.sh`
2. Check Claude Code logs for MCP server errors
3. Verify OAuth credentials are valid and have necessary permissions
4. Consult the troubleshooting section above

---

**Setup Complete!** 🎉

Your Google Search Console MCP server is ready to supercharge your SEO workflows with real-time search data.
