# SEO Report Generator - Pipeline Integration Guide

Quick guide for integrating the SEO Audit Report Generator into ORCHESTRAI pipelines.

## 🎯 Integration Points

### 1. SEO Research Pipeline

**File**: `orchestrai-domains/seo/pipelines/seo-research-pipeline.js`

Add report generation as the final stage:

```javascript
const { generateSEOAuditReport } = require('../../../orchestrai-system/templates/global/seo-reports/seo-audit-report-generator');
const path = require('path');

async function runSEOResearchPipeline(projectId, clientName, website) {
  console.log('🔍 Starting SEO Research Pipeline...');

  // Stage 1: Keyword Research
  const keywordData = await runKeywordResearch(website);

  // Stage 2: Technical Audit
  const technicalData = await runTechnicalAudit(website);

  // Stage 3: Competitor Analysis
  const competitiveData = await runCompetitorAnalysis(website);

  // Stage 4: Compile Audit Data
  const auditData = {
    projectId,
    clientName,
    website,
    industry: determineIndustry(website), // Your logic
    auditDate: new Date().toISOString().split('T')[0],
    markets: determineMarkets(website), // Your logic

    currentMetrics: {
      rankingKeywords: technicalData.rankingKeywords || 0,
      monthlyTraffic: technicalData.monthlyTraffic || 0,
      domainAuthority: technicalData.domainAuthority || 0,
      technicalScore: technicalData.overallScore || 0,
      organicValue: technicalData.organicValue || 0,
      topRankings: technicalData.topRankings || 0
    },

    targetMetrics: calculateTargets(technicalData, keywordData),

    technicalSEO: technicalData,
    keywords: keywordData,
    competitive: competitiveData,
    roi: calculateROI(technicalData, keywordData),

    executiveSummary: generateExecutiveSummary(technicalData, keywordData, competitiveData),

    chartData: {
      trafficGrowth: calculateTrafficGrowth(
        technicalData.monthlyTraffic,
        targetMetrics.monthlyTraffic
      )
    }
  };

  // Stage 5: Generate HTML Report
  const outputPath = path.join(
    'projects',
    projectId,
    'deliverables',
    'seo',
    `${clientName.toUpperCase()}-SEO-AUDIT-REPORT.html`
  );

  await generateSEOAuditReport(auditData, outputPath);

  console.log('✅ SEO Research Pipeline Complete!');
  console.log(`   Report: ${outputPath}`);

  return { auditData, reportPath: outputPath };
}
```

### 2. Helper Functions

Add these helper functions to your pipeline:

```javascript
/**
 * Calculate 12-month target metrics based on current state
 */
function calculateTargets(technicalData, keywordData) {
  const current = technicalData;
  const multiplier = 20; // Conservative 20x growth

  return {
    rankingKeywords: Math.min(keywordData.totalKeywords || 500, current.rankingKeywords * multiplier),
    monthlyTraffic: Math.round(current.monthlyTraffic * multiplier),
    domainAuthority: Math.min(100, current.domainAuthority + 15),
    technicalScore: Math.min(100, current.technicalScore + 8),
    organicValue: Math.round(current.organicValue * multiplier),
    topRankings: Math.round((keywordData.totalKeywords || 500) * 0.05) // 5% of total keywords
  };
}

/**
 * Calculate traffic growth milestones
 */
function calculateTrafficGrowth(currentTraffic, targetTraffic) {
  const month3 = Math.round(currentTraffic + (targetTraffic - currentTraffic) * 0.15);
  const month6 = Math.round(currentTraffic + (targetTraffic - currentTraffic) * 0.45);
  const month9 = Math.round(currentTraffic + (targetTraffic - currentTraffic) * 0.75);

  return [currentTraffic, month3, month6, month9, targetTraffic];
}

/**
 * Calculate ROI projections
 */
function calculateROI(technicalData, keywordData) {
  const totalKeywords = keywordData.totalKeywords || 500;
  const avgCPC = keywordData.averageCPC || 2.0;

  // Conservative investment estimate: €30-40 per keyword
  const investment = Math.round((totalKeywords * 35) / 1000) * 1000;
  const investmentRange = `${investment - 6000}-${investment + 6000}`;

  // Revenue projection based on traffic value growth
  const currentValue = technicalData.organicValue || 0;
  const month6Value = Math.round(currentValue * 300);
  const month12Value = Math.round(currentValue * 850);
  const month24Value = Math.round(currentValue * 1850);

  // Calculate ROI
  const roi = Math.round(((month24Value - investment) / investment) * 100);

  return {
    year1Investment: investmentRange,
    roi24Month: `${roi}%`,
    breakEvenMonth: Math.round((investment / (month12Value / 12))),
    projectedRevenue: {
      month6: month6Value,
      month12: month12Value,
      month24: month24Value
    }
  };
}

/**
 * Generate executive summary text
 */
function generateExecutiveSummary(technicalData, keywordData, competitiveData) {
  const current = technicalData;
  const keywords = keywordData.totalKeywords || 0;

  return `This comprehensive SEO audit reveals ${current.clientName || 'the website'} stands at a critical inflection point. ` +
    `While the baseline shows ${current.rankingKeywords} ranking keywords and ${current.monthlyTraffic} monthly visits, ` +
    `the technical foundation is ${current.technicalScore >= 90 ? 'robust' : 'solid'} (${current.technicalScore}/100 score) ` +
    `and the market opportunity is extraordinary. With ${keywords} researched keywords across multiple niches, ` +
    `there is significant potential to transform from visibility obscurity to category-defining authority.`;
}
```

## 📦 Package Export Pattern

For use in other domains/agents:

```javascript
// orchestrai-shared/reporting/seo-report-generator.js
const { generateSEOAuditReport } = require('../../orchestrai-system/templates/global/seo-reports/seo-audit-report-generator');

module.exports = {
  generateSEOReport: generateSEOAuditReport
};
```

Then import anywhere:

```javascript
const { generateSEOReport } = require('../orchestrai-shared/reporting/seo-report-generator');
```

## 🤖 Agent Integration

For use with specialized agents (e.g., `seo-technical-analysis`, `seo-competitor-analysis`):

```javascript
// In your agent script
const { generateSEOAuditReport } = require('./orchestrai-system/templates/global/seo-reports/seo-audit-report-generator');

async function runSEOAudit(projectPath, clientData) {
  // ... perform analysis ...

  // Generate report
  const reportData = {
    projectId: clientData.projectId,
    clientName: clientData.name,
    website: clientData.website,
    currentMetrics: analysisResults.current,
    targetMetrics: analysisResults.targets,
    // ... more data
  };

  const reportPath = `${projectPath}/deliverables/seo/${clientData.name}-SEO-AUDIT-REPORT.html`;
  await generateSEOAuditReport(reportData, reportPath);

  return { analysis: analysisResults, report: reportPath };
}
```

## 🔄 Automated Report Regeneration

For projects that need periodic reports:

```javascript
// scripts/regenerate-seo-reports.js
const fs = require('fs');
const path = require('path');
const { generateSEOAuditReport } = require('./orchestrai-system/templates/global/seo-reports/seo-audit-report-generator');

async function regenerateAllSEOReports() {
  const projectsDir = 'projects';
  const projects = fs.readdirSync(projectsDir);

  for (const project of projects) {
    const dataPath = path.join(projectsDir, project, 'deliverables', 'seo', '*-audit-data.json');

    // Check if audit data exists
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      const outputPath = path.join(
        projectsDir,
        project,
        'deliverables',
        'seo',
        `${data.clientName}-SEO-AUDIT-REPORT.html`
      );

      console.log(`📊 Regenerating report for ${data.clientName}...`);
      await generateSEOAuditReport(data, outputPath);
      console.log(`   ✅ ${outputPath}`);
    }
  }

  console.log('\n✨ All SEO reports regenerated!');
}

regenerateAllSEOReports().catch(console.error);
```

Run with:
```bash
node scripts/regenerate-seo-reports.js
```

## 📋 Quick Reference

### Minimum Required Data

```javascript
{
  projectId: "uuid",
  clientName: "Name",
  website: "https://...",
  currentMetrics: { rankingKeywords, monthlyTraffic, domainAuthority, technicalScore, organicValue, topRankings },
  targetMetrics: { rankingKeywords, monthlyTraffic, domainAuthority, technicalScore, organicValue, topRankings }
}
```

### Full Data Structure

See `example-seo-audit-data.json` for complete structure.

### Command Line Usage

```bash
node orchestrai-system/templates/global/seo-reports/seo-audit-report-generator.js \
  <data-file.json> \
  [output-path.html]
```

### Programmatic Usage

```javascript
const { generateSEOAuditReport } = require('./path/to/generator');
await generateSEOAuditReport(data, outputPath);
```

## ✅ Integration Checklist

- [ ] Add generator import to pipeline
- [ ] Create helper functions for metric calculations
- [ ] Add report generation as final pipeline stage
- [ ] Test with sample project data
- [ ] Verify output HTML renders correctly
- [ ] Add error handling for missing data
- [ ] Document pipeline integration in domain CLAUDE.md
- [ ] Update pipeline README with report generation step

## 🎯 Next Steps

1. **Add to SEO Domain**: Update `orchestrai-domains/seo/CLAUDE.md` with report generation instructions
2. **Create Slash Command**: Add `/seo-report` command in `.claude/commands/`
3. **Agent Integration**: Enable `seo-technical-analysis` agent to auto-generate reports
4. **Batch Processing**: Create batch script for multiple projects
5. **Template Variants**: Create industry-specific template variations

---

**Report Generator Location**: `/orchestrai-system/templates/global/seo-reports/`
**Documentation**: `README.md` in same directory
**Example Data**: `example-seo-audit-data.json`
