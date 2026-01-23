# Quick Maps Ranking Check Scripts

Ultra-fast Google Maps position tracking for daily checks.

**Performance**: 5-10 keywords in 10-30 seconds (vs. 2+ hours for full pipeline)

---

## Available Scripts

### 1. `quick-maps-check.js` (Generic)

**Core library** - Use for any client or custom configurations.

```bash
# Direct execution with default config
node quick-maps-check.js

# Or import and use programmatically
const QuickMapsChecker = require('./quick-maps-check');
```

### 2. `nasmehpg-quick-check.js` (Pre-configured)

**nasmehPG client** - Pre-configured with business details and keywords.

```bash
# Just run it!
node nasmehpg-quick-check.js

# Edit keywords in the file before running
```

---

## Quick Start (nasmehPG Example)

### Option 1: Run Pre-configured Script

```bash
cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/local-seo/scripts
node nasmehpg-quick-check.js
```

**Expected output**:
```
🦷 nasmehPG Google Maps Quick Check

╔════════════════════════════════════════════════════════╗
║       Quick Maps Ranking Check                         ║
╚════════════════════════════════════════════════════════╝

📍 Business: Hiša lepega nasmeha PG
📌 Location: Ljubljana,Slovenia
🔍 Keywords: 8
💰 Estimated cost: €2.40
⏱️  Estimated time: 24 seconds

────────────────────────────────────────────────────────

[1/8] zobni implantati Ljubljana...
  🟢 TOP 3 #2 | ⭐ 4.8 (127 reviews)

[2/8] implantacija Ljubljana...
  🟡 POS #5 | ⭐ 4.8 (127 reviews)

[3/8] dentalna klinika Ljubljana...
  🟡 POS #7 | ⭐ 4.8 (127 reviews)

... (continues for all keywords)

────────────────────────────────────────────────────────

✅ Quick check complete!

📊 Results Summary:
   • Keywords checked: 8/8
   • Ranked in local pack: 2
   • Top 3 positions: 2
   • Not ranked: 1
   • Duration: 26s

💾 Results saved: .../deliverables/local-seo/quick-ranking-check.json

═══════════════════════════════════════════════════════════════════
  QUICK MAPS RANKING CHECK - RESULTS
═══════════════════════════════════════════════════════════════════

🟢 TOP 3 POSITIONS (In Local Pack):
──────────────────────────────────────────────────────────────────
  #2 | zobni implantati Ljubljana
     Rating: 4.8 (127 reviews)
  #3 | zobozdravnik Ljubljana implantati
     Rating: 4.8 (127 reviews)

🟡 RANKED (Outside Local Pack):
──────────────────────────────────────────────────────────────────
  #5 | implantacija Ljubljana
  #7 | dentalna klinika Ljubljana
  #9 | implantacija brez bolečine

🔴 NOT RANKED:
──────────────────────────────────────────────────────────────────
  ❌ | celostna dentalna oskrba

═══════════════════════════════════════════════════════════════════

🎯 QUICK WIN OPPORTUNITIES (Positions 4-10):
──────────────────────────────────────────────────────────────────
  #5 | implantacija Ljubljana
     → Can reach Top 3 with optimization
  #7 | dentalna klinika Ljubljana
     → Can reach Top 3 with optimization
  #9 | implantacija brez bolečine
     → Can reach Top 3 with optimization

💡 NEXT STEPS:
──────────────────────────────────────────────────────────────────
  ✅ FOCUS ON QUICK WINS - Optimize these keywords first:
     • implantacija Ljubljana (currently #5)
     • dentalna klinika Ljubljana (currently #7)
     • implantacija brez bolečine (currently #9)
  ⚠️  1 keywords not ranked - Consider long-tail variations

═══════════════════════════════════════════════════════════════════
```

**Time**: 26 seconds ✓
**Cost**: €2.40 ✓
**Deliverables**: JSON + Text report ✓

---

## Option 2: Custom Configuration (Any Client)

```javascript
const QuickMapsChecker = require('./quick-maps-check');

const checker = new QuickMapsChecker();

const results = await checker.trackRankings({
  businessName: 'Your Business Name',
  keywords: [
    'keyword 1',
    'keyword 2',
    'keyword 3'
  ],
  location: 'City,Country',
  language: 'English',
  locationCode: 2840, // USA (optional)
  projectId: 'your-project-uuid' // Optional - saves to project folder
});

// Get results
console.log(results.summary);
console.log(checker.generateTextReport());
```

---

## Option 3: Via Task Tool (Agent Wrapper)

```javascript
// In Claude Code, run:
Task(
  subagent_type="general-purpose",
  description="Run quick maps check",
  prompt=`Run the quick maps check for nasmehPG:

cd /Users/kris/CLAUDEtools/ORCHESTRAI/orchestrai-domains/local-seo/scripts
node nasmehpg-quick-check.js

This will track 8 keywords for nasmehPG and save results.`
)
```

---

## Features

### ✅ Ultra-Fast Execution
- **5 keywords**: 15-20 seconds
- **10 keywords**: 25-35 seconds
- **20 keywords**: 50-70 seconds

### ✅ Cancellable with Ctrl+C
Press `Ctrl+C` at any time to:
- Stop execution immediately
- Save partial results
- Display what was completed

### ✅ Real-Time Progress
```
[3/8] dentalna klinika Ljubljana...
  🟡 POS #7 | ⭐ 4.8 (127 reviews)
```

### ✅ Automatic Deliverables
Results saved to:
- Project folder: `projects/{uuid}/deliverables/local-seo/quick-ranking-check.json`
- Temp folder (fallback): `temp/quick-check-{timestamp}.json`

### ✅ Quick Win Detection
Automatically identifies keywords in positions 4-10 (easy optimization targets)

### ✅ Cost Transparency
Shows estimated API cost before execution

---

## Output Format

### JSON Output
```json
{
  "checkType": "quick_maps_ranking",
  "checkDate": "2026-01-22T10:30:00.000Z",
  "partial": false,
  "businessName": "Hiša lepega nasmeha PG",
  "location": "Ljubljana,Slovenia",
  "totalResults": 8,
  "summary": {
    "rankedInLocalPack": 2,
    "top3Positions": 2,
    "notRanked": 1,
    "averagePosition": 5.6
  },
  "results": [
    {
      "keyword": "zobni implantati Ljubljana",
      "position": 2,
      "inLocalPack": true,
      "title": "Hiša lepega nasmeha PG",
      "rating": 4.8,
      "reviews": 127,
      "address": "...",
      "phone": "...",
      "searchDate": "2026-01-22T10:30:00.000Z",
      "location": "Ljubljana,Slovenia"
    }
  ]
}
```

---

## Configuration Options

```javascript
{
  // REQUIRED
  businessName: string,      // Exact business name in Google
  keywords: string[],        // Array of keywords (max 20)
  location: string,          // "City,Country" format

  // OPTIONAL
  language: string,          // Default: 'English'
  locationCode: number,      // DataForSEO location code
  projectId: string,         // Project UUID for saving
  saveResults: boolean       // Default: true
}
```

### Location Codes (Common)
```
USA: 2840
UK: 2826
Netherlands: 2528
Slovenia: 2705 (Ljubljana), 2710 (Maribor), 2659 (Celje)
Germany: 2276
```

Full list: https://docs.dataforseo.com/v3/appendix/locations/

---

## Comparison: Quick Check vs. Full Pipeline

| Feature | Quick Check | Full Pipeline |
|---------|------------|---------------|
| **Time** | 10-30 seconds | 30-160 minutes |
| **Keywords** | 5-10 (max 20) | 20-50+ |
| **Scope** | Position tracking only | Full audit + optimization |
| **API Calls** | 5-20 | 80-200+ |
| **Cost** | €1.50-€6 | €24-€60 |
| **Use Case** | Daily checks | Monthly audits |
| **Cancellable** | ✅ Yes | ❌ No |
| **Progress** | ✅ Real-time | ❌ None |
| **Deliverables** | ✅ Always | ❌ Only if complete |

---

## Troubleshooting

### Error: "mcp__dataforseo__serp_google_maps is not defined"

**Solution**: Run inside Claude Code with DataForSEO MCP server access.

```bash
# Can't run directly with node - needs MCP access
# Instead, use Task tool in Claude Code:

Task(
  subagent_type="general-purpose",
  prompt="Run: node orchestrai-domains/local-seo/scripts/nasmehpg-quick-check.js"
)
```

### Error: "Business not found in results"

**Cause**: Business name doesn't match Google listing exactly.

**Solution**: Check exact business name in Google Maps:
1. Search for your business on Google Maps
2. Copy the **exact** name shown
3. Update `businessName` in config

### Partial Results Only

**Cause**: Cancelled with Ctrl+C or error occurred.

**Solution**: Check `quick-check-partial.json` for saved results up to the error.

---

## Best Practices

### Daily Checks (Recommended)
```javascript
keywords: [
  'primary keyword 1',
  'primary keyword 2',
  'primary keyword 3',
  'quick win keyword 1',
  'quick win keyword 2'
] // 5 keywords max for speed
```

**Frequency**: Daily or weekly
**Time**: 15-20 seconds
**Cost**: €1.50 per check

### Weekly Deep Check
```javascript
keywords: [
  // All primary keywords (5-7)
  // All quick wins (3-5)
  // Test keywords (2-3)
] // 10-15 keywords
```

**Frequency**: Weekly
**Time**: 30-45 seconds
**Cost**: €3-4.50 per check

### Monthly Comprehensive Audit
Use the **full pipeline** instead:
```bash
node orchestrai-domains/local-seo/pipelines/local-seo-pipeline.js
```

---

## Integration with Other Tools

### Export to Google Sheets

```javascript
const results = await checker.trackRankings(config);

// Convert to CSV format
const csv = [
  ['Keyword', 'Position', 'In Local Pack', 'Rating', 'Reviews'].join(','),
  ...results.results.map(r => [
    r.keyword,
    r.position || 'Not Ranked',
    r.inLocalPack ? 'Yes' : 'No',
    r.rating || 'N/A',
    r.reviews
  ].join(','))
].join('\n');

// Save CSV
require('fs').writeFileSync('rankings.csv', csv);
```

### Notion Integration

Use `gbp-content-transformer` to create Notion updates from quick wins.

### HighLevel CRM

Export quick wins to HighLevel for automated follow-up campaigns.

---

## Scheduling (Optional)

### Daily Checks with Cron

```bash
# Add to crontab (crontab -e)
0 9 * * * cd /Users/kris/CLAUDEtools/ORCHESTRAI && node orchestrai-domains/local-seo/scripts/nasmehpg-quick-check.js >> logs/maps-check.log 2>&1
```

Runs daily at 9:00 AM, saves logs.

---

## Support

**Issues?** Check:
1. DataForSEO MCP server is configured
2. Business name matches Google exactly
3. Location format is correct ("City,Country")
4. Keywords are < 20

**Need help?** See main docs: `/orchestrai-domains/local-seo/CLAUDE.md`

---

## License

MIT - Part of ORCHESTRAI system
