# SEO Audit Report Generator

Professional, interactive SEO audit report generator using modern component-based design with ShadCN UI principles, Tailwind CSS, and Chart.js visualizations.

## 📋 Overview

This system generates beautiful, client-ready SEO audit reports in HTML format. Each report includes:

- **Modern Design**: ShadCN UI components with gradient themes (#667eea to #764ba2)
- **Interactive Charts**: Chart.js visualizations for traffic growth, ranking distribution, and revenue projections
- **Responsive Layout**: Mobile-friendly design with print optimization
- **Professional Components**: Cards, badges, progress bars, tables, timelines
- **Standalone HTML**: Complete reports that work without external dependencies (CDN-based assets)

## 🎨 Design Features

- **Hero Dashboard**: 6 key metric cards with current → target transitions and growth percentages
- **Component-Based Layout**: Modular card system for easy content organization
- **Data Visualization**: Line charts, pie charts, and bar charts for metrics
- **Animated Elements**: Progress bars with shimmer effects, hover transitions
- **Print-Optimized**: Clean print styles for PDF generation

## 📂 Files

```
orchestrai-system/templates/global/seo-reports/
├── seo-audit-report-generator.js          # Main generator script
├── seo-audit-report-template-styles.css   # Complete CSS template
├── example-seo-audit-data.json            # Example input data structure
└── README.md                               # This documentation
```

## 🚀 Quick Start

### 1. Prepare Your Data

Create a JSON file with your SEO audit data following this structure:

```json
{
  "projectId": "PROJECT-UUID",
  "clientName": "Client Business Name",
  "website": "https://www.clientwebsite.com",
  "industry": "E-commerce",
  "auditDate": "2025-12-09",
  "markets": ["United States", "European Union"],

  "currentMetrics": {
    "rankingKeywords": 24,
    "monthlyTraffic": 31,
    "domainAuthority": 28,
    "technicalScore": 91,
    "organicValue": 28,
    "topRankings": 0
  },

  "targetMetrics": {
    "rankingKeywords": 500,
    "monthlyTraffic": 1150,
    "domainAuthority": 45,
    "technicalScore": 99,
    "organicValue": 1450,
    "topRankings": 25
  },

  "roi": {
    "year1Investment": "12,000-18,000",
    "roi24Month": "197%"
  }
}
```

See `example-seo-audit-data.json` for the complete data structure.

### 2. Generate Report

#### Command Line Usage:

```bash
node orchestrai-system/templates/global/seo-reports/seo-audit-report-generator.js \
  my-seo-data.json \
  output-report.html
```

#### Programmatic Usage:

```javascript
const { generateSEOAuditReport } = require('./seo-audit-report-generator');

const data = {
  projectId: 'abc-123',
  clientName: 'ACME Corp',
  // ... your data
};

const outputPath = '/path/to/output/report.html';

await generateSEOAuditReport(data, outputPath);
```

### 3. View Report

Open the generated HTML file in any browser. The report is standalone and includes all necessary assets via CDN:
- Tailwind CSS
- Chart.js
- Google Fonts (Inter)

## 📊 Data Structure Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `projectId` | string | Project UUID |
| `clientName` | string | Client business name |
| `website` | string | Client website URL |
| `currentMetrics` | object | Current performance metrics |
| `targetMetrics` | object | 12-month target metrics |

### Current/Target Metrics Object

```json
{
  "rankingKeywords": 24,        // Number of ranking keywords
  "monthlyTraffic": 31,          // Monthly organic traffic visits
  "domainAuthority": 28,         // Domain authority (0-100)
  "technicalScore": 91,          // Technical SEO score (0-100)
  "organicValue": 28,            // Monthly organic traffic value (€)
  "topRankings": 0               // Number of top 3 rankings
}
```

### Optional Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `industry` | string | 'E-commerce' | Industry description |
| `auditDate` | string (YYYY-MM-DD) | Today | Audit date |
| `markets` | array | ['Primary Market'] | Target markets |
| `technicalSEO` | object | {} | Technical SEO details |
| `keywords` | object | {} | Keyword research data |
| `competitive` | object | {} | Competitive analysis |
| `roi` | object | {} | ROI projections |
| `executiveSummary` | string | Default text | Custom executive summary |
| `chartData` | object | Generated | Custom chart data |

## 🔄 Integration with SEO Pipeline

### Adding to SEO Research Pipeline

```javascript
// In your SEO research pipeline script:
const { generateSEOAuditReport } = require('./orchestrai-system/templates/global/seo-reports/seo-audit-report-generator');

async function runSEOAuditPipeline(projectId, clientName) {
  // 1. Run keyword research
  const keywordData = await runKeywordResearch();

  // 2. Run technical audit
  const technicalData = await runTechnicalAudit();

  // 3. Run competitor analysis
  const competitiveData = await runCompetitorAnalysis();

  // 4. Compile data
  const reportData = {
    projectId,
    clientName,
    website: clientData.website,
    currentMetrics: {
      rankingKeywords: technicalData.rankingKeywords,
      monthlyTraffic: technicalData.monthlyTraffic,
      // ...
    },
    targetMetrics: {
      rankingKeywords: keywordData.totalKeywords,
      monthlyTraffic: calculateProjectedTraffic(),
      // ...
    },
    technicalSEO: technicalData,
    keywords: keywordData,
    competitive: competitiveData,
    roi: calculateROI()
  };

  // 5. Generate HTML report
  const outputPath = `projects/${projectId}/deliverables/seo/${clientName}-SEO-AUDIT-REPORT.html`;
  await generateSEOAuditReport(reportData, outputPath);

  console.log(`✅ SEO Audit Report generated: ${outputPath}`);
}
```

### Example: Proffshop Integration

```bash
# Create data JSON from existing research
node scripts/compile-seo-audit-data.js proffshop-B44E4D66 > proffshop-data.json

# Generate report
node orchestrai-system/templates/global/seo-reports/seo-audit-report-generator.js \
  proffshop-data.json \
  projects/proffshop-B44E4D66-D62C-4318-8EE6-D487729B76E3/deliverables/seo/PROFFSHOP-SEO-AUDIT-REPORT.html
```

## 🎯 Output Sections

The generated report includes these sections:

1. **Hero Dashboard** - 6 key metric cards with growth percentages
2. **Executive Summary** - Overview and key insights
3. **Current Performance Analysis** - Detailed current state metrics
4. **Technical SEO Assessment** - Technical health score and status
5. **Keyword & Content Strategy** - Keyword portfolio expansion plan
6. **Actionable Recommendations** - Priority action items
7. **ROI Projections & Metrics** - Investment overview and traffic growth chart
8. **Conclusion** - Summary and next steps

## 🎨 Customization

### Changing Colors

Edit `seo-audit-report-template-styles.css`:

```css
/* Current gradient: #667eea to #764ba2 (purple/indigo) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Change to your brand colors */
background: linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%);
```

### Adding Custom Sections

1. Create a new section function in `seo-audit-report-generator.js`:

```javascript
function getCustomSection(d) {
  return `
    <div class="section">
      <div class="section-header">
        <div class="section-number">7</div>
        <h2 class="section-title">Custom Section Title</h2>
      </div>
      <div class="card">
        <h3 class="card-title">Your Content Here</h3>
        <!-- Custom content -->
      </div>
    </div>
  `;
}
```

2. Add to `buildReportHTML()`:

```javascript
<div class="content">
  ${getExecutiveSummarySection(d, growthCalcs)}
  ${getCurrentPerformanceSection(d)}
  ${getTechnicalSEOSection(d)}
  ${getKeywordStrategySection(d)}
  ${getRecommendationsSection(d)}
  ${getROISection(d)}
  ${getCustomSection(d)}  <!-- Add here -->
  ${getConclusionSection(d)}
  ${getFooterSection(d)}
</div>
```

## 📈 Chart Customization

Charts use Chart.js. Customize in `getScriptsSection()`:

```javascript
// Traffic Growth Chart
new Chart(trafficCtx, {
  type: 'line',  // Change to 'bar', 'pie', etc.
  data: {
    labels: ['Current', 'Month 3', 'Month 6', 'Month 9', 'Month 12'],
    datasets: [{
      label: 'Organic Sessions',
      data: [31, 210, 520, 850, 1150],
      borderColor: '#667eea',  // Customize colors
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      // ... more options
    }]
  }
});
```

## 🔍 Troubleshooting

### Report Not Displaying Correctly

- Ensure internet connection for CDN assets (Tailwind, Chart.js, Google Fonts)
- Check browser console for JavaScript errors
- Validate your input JSON structure

### Charts Not Rendering

- Verify `chartData` in your input JSON
- Check Chart.js version compatibility
- Ensure canvas elements have IDs matching script selectors

### Missing Data

- Required fields: `projectId`, `clientName`, `website`, `currentMetrics`, `targetMetrics`
- Optional fields will use defaults if not provided
- Check console output for validation errors

## 📝 Best Practices

1. **Data Validation**: Always validate your input JSON before generation
2. **Consistent Metrics**: Ensure current and target metrics use the same units
3. **Realistic Targets**: Base target metrics on industry benchmarks and historical data
4. **Complete Data**: Provide as much optional data as possible for richer reports
5. **Version Control**: Track generated reports in project deliverables directory

## 🔗 Related Documentation

- **Content Creation Guide**: `/CONTENT-CREATION-GUIDE.md`
- **SEO Domain Guide**: `/orchestrai-domains/seo/CLAUDE.md`
- **Client Intelligence**: `/orchestrai-domains/client-intelligence/CLAUDE.md`
- **Pipeline Architecture**: `/orchestrai-shared/pipelines/README.md`

## 💡 Examples

### Minimal Example

```json
{
  "projectId": "test-123",
  "clientName": "Test Client",
  "website": "https://test.com",
  "currentMetrics": {
    "rankingKeywords": 10,
    "monthlyTraffic": 50,
    "domainAuthority": 25,
    "technicalScore": 85,
    "organicValue": 100,
    "topRankings": 0
  },
  "targetMetrics": {
    "rankingKeywords": 100,
    "monthlyTraffic": 500,
    "domainAuthority": 40,
    "technicalScore": 95,
    "organicValue": 1000,
    "topRankings": 10
  }
}
```

### Full Example

See `example-seo-audit-data.json` for complete structure with all optional fields.

---

**Generated Reports Are**:
- ✅ Client-ready (professional design)
- ✅ Standalone (works without external files)
- ✅ Interactive (charts, hover effects)
- ✅ Print-friendly (optimized for PDF)
- ✅ Responsive (mobile-compatible)
- ✅ Reusable (template-based generation)

**Perfect For**:
- SEO audit deliverables
- Client presentations
- Proposal attachments
- Progress reports
- Strategy documentation
