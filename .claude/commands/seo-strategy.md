# SEO Strategy Report Generation

Generate a comprehensive SEO strategy report page using validated keyword research data. Part of the intelligence report suite but can be generated independently.

## Usage

```bash
/seo-strategy [client-name or uuid]
```

## Arguments

- `client-name or uuid` (required) - Client name (e.g., "scoreornot") or full project UUID

## Examples

```bash
# Using client name
/seo-strategy scoreornot

# Using full UUID
/seo-strategy scoreornot-6656f290-306b-4ddd-8540-e0883bb89c8a

# Other clients
/seo-strategy quartziq
/seo-strategy rapidcoldplunge
```

## Instructions

### Step 1: Resolve Project Path

```javascript
const projectName = args[0]; // Client name or UUID
let projectPath;

// Check if full UUID provided
if (projectName.includes('-')) {
  projectPath = `/Users/kris/CLAUDEtools/ORCHESTRAI/projects/${projectName}`;
} else {
  // Search for project by name
  const projectsDir = '/Users/kris/CLAUDEtools/ORCHESTRAI/projects';
  const projects = fs.readdirSync(projectsDir);
  const match = projects.find(p => p.toLowerCase().startsWith(projectName.toLowerCase()));

  if (!match) {
    console.error(`❌ Project not found: ${projectName}`);
    console.log('Available projects:', projects.map(p => p.split('-')[0]).join(', '));
    return;
  }

  projectPath = `${projectsDir}/${match}`;
}

console.log(`📂 Project: ${projectPath.split('/').pop()}`);
```

### Step 2: Load Required Data

Load SEO keyword research and client context:

```javascript
const fs = require('fs');
const path = require('path');

// Load keyword research (VALIDATED version preferred)
const keywordFiles = [
  `${projectPath}/deliverables/seo/keyword-research-VALIDATED.json`,
  `${projectPath}/deliverables/seo/keyword-research.json`,
  `${projectPath}/client-intelligence/keyword-research.json`
];

let keywordData;
for (const file of keywordFiles) {
  if (fs.existsSync(file)) {
    keywordData = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log(`✅ Loaded keywords from: ${path.basename(file)}`);
    break;
  }
}

if (!keywordData) {
  console.error('❌ No keyword research data found. Run keyword research first.');
  return;
}

// Load client context (optional but recommended)
const contextFile = `${projectPath}/client-intelligence/integrated-client-context.json`;
let clientContext = {};
if (fs.existsSync(contextFile)) {
  clientContext = JSON.parse(fs.readFileSync(contextFile, 'utf8'));
  console.log('✅ Loaded client context');
}
```

### Step 3: Transform Data for Template

Structure the data for the SEOStrategyReport template:

```javascript
const seoData = {
  overview: {
    title: `SEO Strategy & Implementation Roadmap - ${clientContext.businessName || 'Client'}`,
    description: 'Comprehensive keyword research, competitive analysis, content strategy, and implementation plan for organic search growth.',
    totalKeywords: keywordData.total_keywords || keywordData.keywords?.length || 0,
    totalSearchVolume: keywordData.total_monthly_volume || 'N/A',
    opportunityScore: keywordData.opportunity_score || calculateOpportunityScore(keywordData),
    competitionLevel: keywordData.competition_level || 'Medium',
    keyFindings: keywordData.key_findings || [
      'Low competition opportunity in primary market',
      'Strong search volume for brand + category keywords',
      'Content gap opportunities identified',
      'Local SEO optimization potential'
    ]
  },

  keywordClusters: transformKeywordClusters(keywordData),

  competitiveAnalysis: {
    topCompetitors: keywordData.top_competitors || [],
    gapAnalysis: keywordData.gap_analysis || [],
    strengths: clientContext.competitive_strengths || [],
    weaknesses: clientContext.competitive_weaknesses || []
  },

  contentStrategy: {
    recommendations: keywordData.content_recommendations || [
      'Create comprehensive guides for primary keywords',
      'Develop FAQ section targeting long-tail queries',
      'Build resource library for industry topics',
      'Optimize existing pages for search intent'
    ],
    contentGaps: keywordData.content_gaps || [],
    contentTypes: [
      { type: 'Blog', priority: 'High' },
      { type: 'Guide', priority: 'High' },
      { type: 'FAQ', priority: 'Medium' },
      { type: 'Case Study', priority: 'Medium' }
    ]
  },

  technicalSEO: {
    priorities: [
      {
        item: 'Schema Markup Implementation',
        description: 'Add structured data for better SERP features',
        priority: 'High',
        impact: 'Improved click-through rates and rich snippets'
      },
      {
        item: 'Core Web Vitals Optimization',
        description: 'Optimize LCP, FID, and CLS for better rankings',
        priority: 'High',
        impact: 'Direct Google ranking factor'
      },
      {
        item: 'Mobile-First Indexing',
        description: 'Ensure mobile experience is optimized',
        priority: 'Medium',
        impact: 'Critical for Google mobile-first indexing'
      }
    ]
  },

  linkBuilding: {
    strategy: 'Focus on high-authority industry publications, local business directories, and strategic partnerships for quality backlinks.',
    tactics: [
      {
        tactic: 'Industry Guest Posting',
        description: 'Contribute expert articles to industry publications',
        difficulty: 'Moderate'
      },
      {
        tactic: 'Local Business Directories',
        description: 'List in relevant local and industry directories',
        difficulty: 'Easy'
      },
      {
        tactic: 'Strategic Partnerships',
        description: 'Build relationships with complementary businesses',
        difficulty: 'Moderate'
      }
    ],
    targetDomains: keywordData.link_opportunities || []
  },

  localSEO: clientContext.local_market ? {
    enabled: true,
    recommendations: [
      'Optimize Google Business Profile',
      'Build local citations across directories',
      'Create location-specific landing pages',
      'Gather and respond to customer reviews'
    ],
    locations: clientContext.target_locations || []
  } : { enabled: false },

  implementationTimeline: {
    phases: [
      {
        phase: 'Q1',
        title: 'Foundation & Quick Wins',
        duration: 'Months 1-3',
        tasks: [
          'Implement priority keywords on existing pages',
          'Set up Google Business Profile',
          'Create initial content pieces',
          'Fix technical SEO issues'
        ],
        expectedOutcome: '50-100 monthly organic visitors, ranking for 10-15 keywords'
      },
      {
        phase: 'Q2',
        title: 'Content Expansion',
        duration: 'Months 4-6',
        tasks: [
          'Publish 2-3 comprehensive guides',
          'Build local citations',
          'Launch link building campaign',
          'Optimize for featured snippets'
        ],
        expectedOutcome: '150-250 monthly organic visitors, ranking for 25-35 keywords'
      },
      {
        phase: 'Q3-Q4',
        title: 'Authority & Scale',
        duration: 'Months 7-12',
        tasks: [
          'Expand content library',
          'Build strategic partnerships',
          'Scale link building efforts',
          'Optimize for semantic search'
        ],
        expectedOutcome: '400-600 monthly organic visitors, ranking for 50+ keywords'
      }
    ]
  },

  hubLink: 'intelligence-report-2025.html'
};

// Helper function to transform keyword clusters
function transformKeywordClusters(keywordData) {
  const clusters = keywordData.keyword_clusters || keywordData.clusters || [];

  return clusters.map(cluster => ({
    clusterName: cluster.cluster_name || cluster.name,
    description: cluster.description || '',
    searchVolume: cluster.total_volume || cluster.search_volume,
    difficulty: cluster.avg_difficulty || cluster.difficulty || 50,
    opportunity: cluster.opportunity_score || 70,
    priority: cluster.priority || 'Medium',
    keywords: cluster.keywords || [],
    contentRecommendation: cluster.content_recommendation || ''
  }));
}

// Helper function to calculate opportunity score
function calculateOpportunityScore(keywordData) {
  const avgDifficulty = keywordData.avg_difficulty || 50;
  const totalVolume = keywordData.total_monthly_volume || 0;

  // Simple scoring: Low difficulty + high volume = high opportunity
  const volumeScore = Math.min((totalVolume / 1000) * 40, 40);
  const difficultyScore = (100 - avgDifficulty) * 0.6;

  return Math.round(volumeScore + difficultyScore);
}
```

### Step 4: Generate HTML Report

Use the SEOStrategyReport template:

```javascript
const SEOStrategyReport = require('../../orchestrai-system/templates/html-reports/SEOStrategyReport');

const config = {
  clientName: clientContext.businessName || projectPath.split('/').pop().split('-')[0],
  reportDate: new Date().toISOString().split('T')[0],
  reportType: 'SEO Strategy'
};

const seoReport = new SEOStrategyReport();
const html = seoReport.generateReport(seoData, config);

console.log('✅ SEO strategy report generated');
```

### Step 5: Save to File

Save to the SEO deliverables directory:

```javascript
const outputDir = `${projectPath}/deliverables/seo`;

// Create directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('📁 Created SEO directory');
}

const outputFile = `${outputDir}/seo-strategy-comprehensive-2025.html`;
fs.writeFileSync(outputFile, html, 'utf8');

console.log('');
console.log('🎉 SEO Strategy Report Generated!');
console.log('');
console.log(`📄 File: ${outputFile}`);
console.log(`🔗 Open: file://${outputFile}`);
console.log('');
console.log('📊 Report includes:');
console.log('  ✅ Keyword cluster analysis');
console.log('  ✅ Competitive landscape');
console.log('  ✅ Content strategy recommendations');
console.log('  ✅ Technical SEO priorities');
console.log('  ✅ Link building tactics');
console.log('  ✅ Implementation timeline');
console.log('');
```

## Output Location

```
/projects/[client-uuid]/deliverables/seo/
└── seo-strategy-comprehensive-2025.html
```

## Report Sections

The generated report includes:

1. **SEO Overview**
   - Total keywords analyzed
   - Monthly search volume
   - Opportunity score (0-100)
   - Competition level
   - Key strategic findings

2. **Keyword Clusters**
   - Cluster name and description
   - Search volume and difficulty
   - Opportunity score
   - Priority ranking
   - Top 10 keywords per cluster
   - Content recommendations

3. **Competitive Analysis**
   - Top competitors with domain authority
   - Keyword gap opportunities
   - SWOT analysis (strengths/weaknesses)

4. **Content Strategy**
   - Strategic recommendations
   - Content gaps to address
   - Recommended content types (blog, guide, FAQ, etc.)

5. **Technical SEO**
   - Priority technical issues
   - Schema markup recommendations
   - Core Web Vitals optimization
   - Mobile-first indexing

6. **Link Building**
   - Overall strategy
   - Specific tactics with difficulty levels
   - Target domain prospects

7. **Local SEO** (if applicable)
   - Google Business Profile optimization
   - Local citations strategy
   - Target locations

8. **Implementation Timeline**
   - Q1: Foundation & Quick Wins (Months 1-3)
   - Q2: Content Expansion (Months 4-6)
   - Q3-Q4: Authority & Scale (Months 7-12)
   - Expected outcomes per phase

## Design Features

- **Purple/Indigo Gradient**: Consistent with intelligence report suite
- **Back-to-Hub Navigation**: Links to main intelligence report
- **Responsive Layout**: Mobile-friendly design
- **Print-Optimized**: Professional print CSS
- **Interactive Elements**: Collapsible sections, smooth scroll
- **Visual Hierarchy**: Color-coded priorities and badges

## Data Requirements

**Required**:
- Keyword research data (JSON file)
  - Location: `deliverables/seo/keyword-research-VALIDATED.json` (preferred)
  - Or: `deliverables/seo/keyword-research.json`
  - Or: `client-intelligence/keyword-research.json`

**Optional but Recommended**:
- Client context data
  - Location: `client-intelligence/integrated-client-context.json`
  - Enhances report with business context

## Error Handling

```javascript
// Missing keyword data
if (!keywordData) {
  console.error('❌ No keyword research data found');
  console.log('💡 Run keyword research first:');
  console.log('   /seo-keyword [primary keyword]');
  return;
}

// Project not found
if (!fs.existsSync(projectPath)) {
  console.error(`❌ Project directory not found: ${projectPath}`);
  console.log('Available projects:');
  // List available projects
  return;
}

// Invalid project structure
if (!fs.existsSync(`${projectPath}/deliverables`)) {
  console.error('❌ Invalid project structure');
  console.log('💡 Run /init-client-project first');
  return;
}
```

## Integration with Full Suite

This command generates only the SEO strategy page. To generate the complete 8-page intelligence suite, use:

```bash
/intel-report [client-name]
```

The SEO strategy page integrates seamlessly with the full suite:
- **Back-to-Hub Link**: Returns to main intelligence dashboard
- **Consistent Design**: Matches all other pages
- **Proper File Location**: Lives in `../seo/` subdirectory
- **Cross-References**: Can link to competitive intelligence and ICP pages

## Use Cases

1. **Update SEO Strategy**: Regenerate after new keyword research
2. **Quarterly Reviews**: Refresh strategy with new data
3. **Client Presentations**: Standalone SEO presentation
4. **Strategy Iterations**: Quick updates without regenerating full suite
5. **A/B Testing**: Test different SEO approaches

## Performance

- **Generation Time**: ~30-60 seconds
- **File Size**: ~150-200KB (depending on keyword count)
- **Dependencies**: Node.js, fs module, SEOStrategyReport template

## Related Commands

- `/seo-keyword [keyword]` - Run keyword research first
- `/intel-report [client]` - Generate full 8-page suite
- `/mini-report [client]` - Generate executive dashboard
- `/seo-audit [url]` - Technical SEO audit
- `/seo-compare [domain1] [domain2]` - Competitive analysis

## Pro Tips

1. **Run keyword research first**: Use `/seo-keyword` to gather data
2. **Validate data**: Ensure keyword research JSON is complete
3. **Update regularly**: Regenerate quarterly to track progress
4. **Combine with full suite**: Use alongside `/intel-report` for complete documentation
5. **Check navigation**: Verify back-to-hub link works correctly

---

**Ready to generate professional SEO strategy reports! 🚀**
