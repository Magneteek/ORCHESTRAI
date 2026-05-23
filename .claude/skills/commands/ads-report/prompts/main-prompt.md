---
name: ads-report
description: Generates an HTML advertising performance report with Chart.js visualizations. Accepts pasted data from Google Ads and/or Meta Ads. Compares to previous period if a saved baseline exists. Saves report to project deliverables.
domain: commands
tools: Read, Write, Glob
model: sonnet
color: orange
thinking:
  enabled: true
  budget: 3000
---

You generate a polished HTML advertising performance report from pasted platform data. The output is a single self-contained HTML file with Chart.js charts that a client can open in any browser or that you can convert to PDF.

**Principle**: Numbers without context are noise. Every metric shown must have a comparison (vs. previous period or vs. target), a trend direction, and — where performance is poor — a recommended action.

---

## Required Inputs

| Input | Required | Notes |
|-------|----------|-------|
| **Client name or project UUID** | Yes | To find project folder and load previous snapshot |
| **Reporting period** | Yes | e.g. `May 2026` or `2026-05` |
| **Google Ads data** | Conditional | Paste from Google Ads UI or export. Skip if not running Google. |
| **Meta Ads data** | Conditional | Paste from Meta Ads Manager or export. Skip if not running Meta. |
| **Budget** | Optional | Monthly budget per platform — to show budget utilisation |
| **Targets / KPIs** | Optional | Target CPA, target ROAS, or target lead volume |

**Minimum accepted data per platform:**
- Campaign name(s), impressions, clicks, spend, conversions (or leads), CPA/CPL
- Additional useful: CTR, CPC, ROAS, frequency (Meta), QS (Google)

---

## Step 1: Load Previous Period Snapshot

```
Glob: projects/[client]*/deliverables/advertising/ads-snapshot-*.json
```

Read the most recent snapshot. This provides previous-period metrics for comparison.

If no snapshot exists: note "First report — period-over-period comparison will be available next month." Proceed without comparisons.

---

## Step 2: Parse Pasted Data

Parse the pasted data into structured objects. Accept any reasonable format:
- Table copied from Ads Manager / Google Ads UI
- CSV-style paste
- Written summary ("Google Ads: €1,200 spend, 340 clicks, 18 leads, CPA €66")

For each platform, extract:

**Google Ads:**
```json
{
  "platform": "Google Ads",
  "period": "2026-05",
  "campaigns": [
    {
      "name": "Campaign name",
      "impressions": N,
      "clicks": N,
      "ctr": X.X,
      "avg_cpc": X.XX,
      "spend": XX.XX,
      "conversions": N,
      "cpa": XX.XX,
      "conversion_rate": X.X
    }
  ],
  "totals": {
    "impressions": N,
    "clicks": N,
    "ctr": X.X,
    "spend": XX.XX,
    "conversions": N,
    "cpa": XX.XX
  }
}
```

**Meta Ads:**
```json
{
  "platform": "Meta Ads",
  "period": "2026-05",
  "campaigns": [...],
  "totals": {
    "impressions": N,
    "reach": N,
    "frequency": X.X,
    "clicks": N,
    "ctr": X.X,
    "spend": XX.XX,
    "results": N,
    "cpr": XX.XX,
    "cpm": XX.XX
  }
}
```

---

## Step 3: Calculate Key Metrics & Comparisons

For each metric, calculate:
- Current value
- Previous period value (from snapshot, if available)
- Change: absolute and percentage
- Direction: ▲ (improved), ▼ (worse), — (stable, ±5%)

**Direction conventions** (higher is not always better):
| Metric | ▲ = | ▼ = |
|--------|-----|-----|
| Conversions / leads | Better | Worse |
| Spend | Higher spend | Lower spend |
| CPA / CPL | Worse (higher cost) | Better (lower cost) |
| CTR | Better | Worse |
| ROAS | Better | Worse |
| Frequency (Meta) | Warning if > 3 | Good |
| Impressions | More reach | Less reach |

---

## Step 4: Performance Assessment

For each platform, classify overall performance:

**Status:**
- ✅ **On track**: CPA within 20% of target; conversions meeting target volume
- ⚠️ **Monitor**: CPA 20–50% above target OR conversions 20–40% below target
- ❌ **Underperforming**: CPA > 50% above target OR conversions < 60% of target
- 🏆 **Outperforming**: CPA > 20% below target AND conversions meeting/exceeding target

**Generate specific observations for each platform:**
- Best performing campaign (lowest CPA with sufficient volume)
- Worst performing campaign (highest CPA or zero conversions)
- Budget utilisation (spend vs. budget if budget was provided)
- Any red flags (frequency > 3 on Meta, QS < 5 on Google, no conversions in 7+ days)

---

## Step 5: Generate HTML Report

Produce a single self-contained HTML file. Include Chart.js from CDN. No external CSS dependencies — inline all styles.

**Report structure:**

```
1. Header (client name, period, prepared date)
2. Platform summary cards (one per active platform)
3. Combined chart: Spend vs Conversions trend (line chart, if prior period exists)
4. Google Ads section:
   - Metrics summary table
   - Campaign performance breakdown table
   - Bar chart: CPA by campaign
5. Meta Ads section:
   - Metrics summary table  
   - Campaign performance breakdown table
   - Bar chart: CPR/CPL by campaign
   - Frequency warning if applicable
6. Recommendations (top 3 actions)
7. Next period targets
```

**HTML template:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Client Name] — Ads Report [Period]</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; }
    .container { max-width: 1100px; margin: 0 auto; padding: 32px 24px; }
    .header { background: #0f172a; color: white; padding: 32px; border-radius: 12px; margin-bottom: 32px; }
    .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 4px; }
    .header p { color: #94a3b8; font-size: 14px; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .card { background: white; border-radius: 10px; padding: 20px; border: 1px solid #e2e8f0; }
    .card .label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .card .value { font-size: 28px; font-weight: 700; color: #0f172a; }
    .card .change { font-size: 13px; margin-top: 4px; }
    .card .change.up { color: #16a34a; }
    .card .change.down { color: #dc2626; }
    .card .change.neutral { color: #64748b; }
    .section { background: white; border-radius: 10px; padding: 24px; border: 1px solid #e2e8f0; margin-bottom: 24px; }
    .section h2 { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; }
    .section h3 { font-size: 14px; font-weight: 600; color: #475569; margin: 20px 0 10px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #f1f5f9; text-align: left; padding: 10px 12px; font-weight: 600; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:last-child td { border-bottom: none; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; }
    .badge-green { background: #dcfce7; color: #16a34a; }
    .badge-red { background: #fee2e2; color: #dc2626; }
    .badge-yellow { background: #fef9c3; color: #ca8a04; }
    .badge-blue { background: #dbeafe; color: #2563eb; }
    .chart-container { position: relative; height: 280px; margin: 16px 0; }
    .rec-list { list-style: none; }
    .rec-list li { padding: 12px 0; border-bottom: 1px solid #f1f5f9; display: flex; gap: 12px; align-items: flex-start; }
    .rec-list li:last-child { border-bottom: none; }
    .rec-priority { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
    .priority-high { background: #fee2e2; color: #dc2626; }
    .priority-med { background: #fef9c3; color: #ca8a04; }
    .priority-low { background: #dcfce7; color: #16a34a; }
    .footer { text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px; }
    .status-ok { color: #16a34a; }
    .status-warn { color: #ca8a04; }
    .status-bad { color: #dc2626; }
    .status-great { color: #2563eb; }
    .platform-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 2px solid #e2e8f0; }
    .platform-header h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 0; border: none; padding: 0; }
    .platform-status { font-size: 13px; font-weight: 600; }
  </style>
</head>
<body>
<div class="container">

  <!-- HEADER -->
  <div class="header">
    <h1>[Client Name] — Advertising Performance Report</h1>
    <p>Period: [Month YYYY] &nbsp;·&nbsp; Prepared: [Date] &nbsp;·&nbsp; Platforms: [list]</p>
  </div>

  <!-- SUMMARY CARDS -->
  <div class="cards">
    <div class="card">
      <div class="label">Total Spend</div>
      <div class="value">€[N]</div>
      <div class="change [up/down/neutral]">[▲/▼/—] €[N] vs prev. period</div>
    </div>
    <div class="card">
      <div class="label">Total Conversions</div>
      <div class="value">[N]</div>
      <div class="change [up/down/neutral]">[▲/▼/—] [N] vs prev. period</div>
    </div>
    <div class="card">
      <div class="label">Blended CPA</div>
      <div class="value">€[N]</div>
      <div class="change [up/down/neutral]">[▲/▼/—] €[N] vs prev. period</div>
    </div>
    <div class="card">
      <div class="label">Total Clicks</div>
      <div class="value">[N]</div>
      <div class="change neutral">Blended CTR: [X]%</div>
    </div>
  </div>

  <!-- SPEND vs CONVERSIONS TREND (if prior period exists) -->
  <div class="section">
    <h2>Trend: Spend vs. Conversions</h2>
    <div class="chart-container">
      <canvas id="trendChart"></canvas>
    </div>
  </div>

  <!-- GOOGLE ADS SECTION (if applicable) -->
  <div class="section">
    <div class="platform-header">
      <h2>Google Ads</h2>
      <span class="platform-status status-[ok/warn/bad]">[✅ On track / ⚠️ Monitor / ❌ Underperforming]</span>
    </div>
    <h3>Summary</h3>
    <table>
      <tr><th>Metric</th><th>This period</th><th>Previous</th><th>Change</th></tr>
      <tr><td>Spend</td><td>€[N]</td><td>€[N]</td><td class="[up/down/neutral]">[▲/▼/—][N]%</td></tr>
      <tr><td>Impressions</td><td>[N]</td><td>[N]</td><td>[▲/▼/—][N]%</td></tr>
      <tr><td>Clicks</td><td>[N]</td><td>[N]</td><td>[▲/▼/—][N]%</td></tr>
      <tr><td>CTR</td><td>[X]%</td><td>[X]%</td><td>[▲/▼/—][N]pp</td></tr>
      <tr><td>Avg. CPC</td><td>€[X]</td><td>€[X]</td><td>[▲/▼/—][N]%</td></tr>
      <tr><td>Conversions</td><td>[N]</td><td>[N]</td><td>[▲/▼/—][N]%</td></tr>
      <tr><td>CPA</td><td>€[N]</td><td>€[N]</td><td>[▲/▼/—][N]%</td></tr>
    </table>

    <h3>Campaign Breakdown</h3>
    <table>
      <tr><th>Campaign</th><th>Spend</th><th>Clicks</th><th>Conv.</th><th>CPA</th><th>Status</th></tr>
      <!-- repeat per campaign -->
      <tr>
        <td>[Campaign name]</td>
        <td>€[N]</td>
        <td>[N]</td>
        <td>[N]</td>
        <td>€[N]</td>
        <td><span class="badge badge-green">Best</span></td>
      </tr>
    </table>

    <h3>CPA by Campaign</h3>
    <div class="chart-container">
      <canvas id="googleCpaChart"></canvas>
    </div>
  </div>

  <!-- META ADS SECTION (if applicable) -->
  <div class="section">
    <div class="platform-header">
      <h2>Meta Ads</h2>
      <span class="platform-status status-[ok/warn/bad]">[✅ On track / ⚠️ Monitor / ❌ Underperforming]</span>
    </div>
    <h3>Summary</h3>
    <table>
      <tr><th>Metric</th><th>This period</th><th>Previous</th><th>Change</th></tr>
      <tr><td>Spend</td><td>€[N]</td><td>€[N]</td><td>[▲/▼/—][N]%</td></tr>
      <tr><td>Reach</td><td>[N]</td><td>[N]</td><td>[▲/▼/—][N]%</td></tr>
      <tr><td>Frequency</td><td>[X]</td><td>[X]</td><td>[▲/▼/—][N]</td></tr>
      <tr><td>CPM</td><td>€[N]</td><td>€[N]</td><td>[▲/▼/—][N]%</td></tr>
      <tr><td>Clicks</td><td>[N]</td><td>[N]</td><td>[▲/▼/—][N]%</td></tr>
      <tr><td>CTR</td><td>[X]%</td><td>[X]%</td><td>[▲/▼/—][N]pp</td></tr>
      <tr><td>Results</td><td>[N]</td><td>[N]</td><td>[▲/▼/—][N]%</td></tr>
      <tr><td>Cost per Result</td><td>€[N]</td><td>€[N]</td><td>[▲/▼/—][N]%</td></tr>
    </table>

    <h3>Campaign Breakdown</h3>
    <table>
      <tr><th>Campaign</th><th>Spend</th><th>Reach</th><th>Freq.</th><th>Results</th><th>CPR</th><th>Status</th></tr>
      <!-- repeat per campaign -->
    </table>

    <h3>Cost per Result by Campaign</h3>
    <div class="chart-container">
      <canvas id="metaCprChart"></canvas>
    </div>
  </div>

  <!-- RECOMMENDATIONS -->
  <div class="section">
    <h2>Recommendations</h2>
    <ul class="rec-list">
      <li>
        <span class="rec-priority priority-high">HIGH</span>
        <span>[Specific action — which campaign/ad set, what to change, expected impact]</span>
      </li>
      <li>
        <span class="rec-priority priority-med">MED</span>
        <span>[Specific action]</span>
      </li>
      <li>
        <span class="rec-priority priority-low">LOW</span>
        <span>[Specific action]</span>
      </li>
    </ul>
  </div>

  <div class="footer">
    <p>Report generated by ORCHESTRAI · Data source: client-provided platform exports · [Date]</p>
  </div>

</div>

<script>
// Trend Chart (spend vs conversions)
const trendCtx = document.getElementById('trendChart').getContext('2d');
new Chart(trendCtx, {
  type: 'bar',
  data: {
    labels: ['[Prev Period]', '[Current Period]'],
    datasets: [
      {
        label: 'Spend (€)',
        data: [[prev_spend], [curr_spend]],
        backgroundColor: 'rgba(37, 99, 235, 0.7)',
        yAxisID: 'y'
      },
      {
        label: 'Conversions',
        data: [[prev_conv], [curr_conv]],
        type: 'line',
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        pointBackgroundColor: '#16a34a',
        borderWidth: 2,
        yAxisID: 'y1'
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { type: 'linear', position: 'left', title: { display: true, text: 'Spend (€)' } },
      y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Conversions' } }
    }
  }
});

// Google CPA by Campaign
const googleCtx = document.getElementById('googleCpaChart').getContext('2d');
new Chart(googleCtx, {
  type: 'bar',
  data: {
    labels: [/* campaign names */],
    datasets: [{
      label: 'CPA (€)',
      data: [/* CPA values */],
      backgroundColor: [/* green for best, red for worst, blue for others */]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'CPA (€)' } } }
  }
});

// Meta CPR by Campaign
const metaCtx = document.getElementById('metaCprChart').getContext('2d');
new Chart(metaCtx, {
  type: 'bar',
  data: {
    labels: [/* campaign names */],
    datasets: [{
      label: 'Cost per Result (€)',
      data: [/* CPR values */],
      backgroundColor: [/* colors */]
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, title: { display: true, text: 'CPR (€)' } } }
  }
});
</script>
</body>
</html>
```

---

## Step 6: Save Snapshot & Report

**Save the data snapshot** (for next-period comparison):
```
Write: projects/[uuid]/deliverables/advertising/ads-snapshot-[YYYY-MM].json
Content: { period, google: { totals, campaigns }, meta: { totals, campaigns } }
```

**Save the HTML report**:
```
Write: projects/[uuid]/deliverables/advertising/ads-report-[YYYY-MM].html
```

---

## Chart Color Logic

Use consistent colors:
- **Best performer** (lowest CPA with ≥ 5 conversions): `rgba(22, 163, 74, 0.8)` (green)
- **Worst performer** (highest CPA, or 0 conversions with spend): `rgba(220, 38, 38, 0.8)` (red)
- **All others**: `rgba(37, 99, 235, 0.7)` (blue)
- **If frequency > 3.5 (Meta)**: flag bar in amber `rgba(202, 138, 4, 0.8)`

---

## Recommendations Logic

Generate exactly 3 recommendations. Priority order:

1. **Immediate action** (HIGH): Zero-conversion campaigns with spend; frequency > 4; CPA > 2× account average
2. **Optimisation** (MED): Budget shift from worst to best performer; creative refresh needed; bid strategy change
3. **Growth** (LOW): Winning campaign underfunded; new audience to test; lookalike expansion

Each recommendation must be specific:
- BAD: "Improve creative"
- GOOD: "Meta — [Campaign name] has frequency 4.8 with declining CTR (0.4%). Pause top 2 ads, introduce 1–2 fresh creatives this week before frequency hits 5."

---

## Handling Single Platform

If only Google Ads data is provided: omit Meta section entirely. If only Meta: omit Google section. Do not show empty sections.

---

## What NOT to Do

- Do not show a trend chart if there's no previous period snapshot — omit that section with a note "Trend available from next month"
- Do not fill in chart data with placeholder values — only use actual parsed numbers
- Do not write generic recommendations — every recommendation must reference a specific campaign by name
- Do not save the report to a temp folder — always save to the project deliverables path
- Do not omit the JSON snapshot — without it, next month's report can't show period-over-period comparison
