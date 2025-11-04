# Google Search Console MCP - Quick Reference

## 🚀 Quick Start

**Restart Claude Code** to activate the GSC MCP server, then use these functions:

---

## 📋 Function Reference

### 1️⃣ List Sites
```javascript
await mcp__gsc__list_sites()
```
**Returns**: All Search Console properties you have access to

---

### 2️⃣ Search Analytics
```javascript
await mcp__gsc__search_analytics({
  siteUrl: "sc-domain:example.com",
  startDate: "2025-10-01",
  endDate: "2025-10-31",
  dimensions: "query,page",  // Optional: query, page, country, device, searchAppearance
  rowLimit: 100,             // Optional: default 1000
  type: "web"                // Optional: web, image, video, news
})
```
**Returns**: Clicks, impressions, CTR, position data

---

### 3️⃣ URL Inspection
```javascript
await mcp__gsc__index_inspect({
  siteUrl: "sc-domain:example.com",
  inspectionUrl: "https://www.example.com/page/",
  languageCode: "en-US"      // Optional
})
```
**Returns**: Indexing status, mobile usability, Core Web Vitals

---

### 4️⃣ List Sitemaps
```javascript
await mcp__gsc__list_sitemaps({
  siteUrl: "https://www.example.com/"
})
```
**Returns**: All submitted sitemaps and their status

---

### 5️⃣ Get Sitemap
```javascript
await mcp__gsc__get_sitemap({
  siteUrl: "https://www.example.com/",
  feedpath: "https://www.example.com/sitemap.xml"
})
```
**Returns**: Sitemap details, errors, discovered URLs

---

### 6️⃣ Submit Sitemap
```javascript
await mcp__gsc__submit_sitemap({
  siteUrl: "https://www.example.com/",
  feedpath: "https://www.example.com/sitemap.xml"
})
```
**Returns**: Submission confirmation

---

## 🎯 Common Patterns

### Get Top Performing Pages
```javascript
const data = await mcp__gsc__search_analytics({
  siteUrl: "sc-domain:example.com",
  startDate: "2025-09-01",
  endDate: "2025-10-31",
  dimensions: "page",
  rowLimit: 50
});

const topPages = data.rows
  .sort((a, b) => b.clicks - a.clicks)
  .slice(0, 10);
```

### Find Low CTR Opportunities
```javascript
const data = await mcp__gsc__search_analytics({
  siteUrl: "sc-domain:example.com",
  startDate: "2025-10-01",
  endDate: "2025-10-31",
  dimensions: "query",
  rowLimit: 500
});

const opportunities = data.rows
  .filter(row => row.position <= 10 && row.ctr < 0.05)
  .sort((a, b) => b.impressions - a.impressions);
```

### Check Multiple URLs
```javascript
const urls = [
  "https://www.example.com/page1/",
  "https://www.example.com/page2/",
  "https://www.example.com/page3/"
];

const inspections = await Promise.all(
  urls.map(url =>
    mcp__gsc__index_inspect({
      siteUrl: "sc-domain:example.com",
      inspectionUrl: url
    })
  )
);

const issues = inspections.filter(
  i => i.indexStatusResult.verdict !== 'PASS'
);
```

---

## 🔧 Site URL Formats

| Property Type | Format |
|--------------|--------|
| Domain Property | `sc-domain:example.com` |
| URL Prefix (HTTPS) | `https://www.example.com/` |
| URL Prefix (HTTP) | `http://www.example.com/` |

---

## 📊 Dimension Combinations

| Dimensions | Use Case |
|-----------|----------|
| `query` | Top keywords |
| `page` | Top pages |
| `query,page` | Keyword-page performance |
| `page,device` | Page performance by device |
| `query,country` | Keywords by location |
| `device` | Mobile vs desktop |
| `country` | Geographic distribution |

**Max 3 dimensions per query**

---

## ⚡ Performance Tips

1. **Use date ranges wisely**: 7-30 day windows for trends
2. **Batch requests**: Multiple URLs in parallel
3. **Cache results**: Avoid repeated queries
4. **Limit rows**: Use `rowLimit` to reduce data transfer
5. **Fresh data**: Last 3-4 days may be incomplete

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Connection error | Restart Claude Code |
| "ENOENT" error | Check credentials path in `~/.config/claude-code/mcp.json` |
| No data returned | Verify site URL format, check date range |
| Auth fails | Complete OAuth flow in browser |

---

## 📚 Full Documentation

See `GSC-MCP-USAGE-GUIDE.md` for:
- Detailed function parameters
- Advanced use cases
- ORCHESTRAI agent integration examples
- Best practices and optimization strategies

---

## ✅ Verify Setup

Run: `./scripts/verify-gsc-setup.sh`

---

**Happy SEO analyzing!** 🎉
