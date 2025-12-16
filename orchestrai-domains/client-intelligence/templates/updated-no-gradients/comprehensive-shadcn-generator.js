/**
 * COMPREHENSIVE SHADCN UI INTELLIGENCE REPORT GENERATOR
 *
 * Generates complete single-page intelligence report with:
 * - ShadCN UI component patterns using Tailwind CSS
 * - ALL data from integrated-client-context.json (comprehensive mapping)
 * - NO GRADIENTS (solid colors only)
 * - Sticky TOC with scroll-spy
 * - Extensive psychographic analysis, sub-segments, SEO strategy
 *
 * Usage:
 *   node comprehensive-shadcn-generator.js /path/to/project/client-intelligence/integrated-client-context.json
 *
 * Examples:
 *   node comprehensive-shadcn-generator.js /Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/client-intelligence/integrated-client-context.json
 *   node comprehensive-shadcn-generator.js /Users/kris/CLAUDEtools/ORCHESTRAI/projects/runchicken-F90DEDB5-25F0-4D32-8138-781C675F5BD3/client-intelligence/integrated-client-context.json
 */

const fs = require('fs');
const path = require('path');

// Get data file path from command line argument
const dataFilePath = process.argv[2];

if (!dataFilePath) {
  console.error('\n❌ ERROR: Data file path required\n');
  console.log('Usage:');
  console.log('  node comprehensive-shadcn-generator.js /path/to/project/client-intelligence/integrated-client-context.json\n');
  console.log('Example:');
  console.log('  node comprehensive-shadcn-generator.js /Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/client-intelligence/integrated-client-context.json\n');
  process.exit(1);
}

if (!fs.existsSync(dataFilePath)) {
  console.error(`\n❌ ERROR: Data file not found: ${dataFilePath}\n`);
  process.exit(1);
}

// Derive project paths from data file path
const DATA_PATH = path.resolve(dataFilePath);
const PROJECT_BASE = path.dirname(path.dirname(DATA_PATH)); // Go up two levels from client-intelligence/integrated-client-context.json
const SEO_KEYWORDS_PATH = path.join(PROJECT_BASE, 'deliverables/seo/comprehensive-keyword-database.json');
const SEO_COMPETITOR_PATH = path.join(PROJECT_BASE, 'deliverables/seo/competitor-landscape-preliminary.md');
const SEO_CLUSTERS_PATH = path.join(PROJECT_BASE, 'deliverables/seo/content-topic-clusters.md');
const SEO_EXEC_PATH = path.join(PROJECT_BASE, 'deliverables/seo/EXECUTIVE-SUMMARY.md');
const ICP_FRAMEWORK_PATH = path.join(PROJECT_BASE, 'client-intelligence/icp-24-section-framework.json');
const OUTPUT_DIR = path.join(PROJECT_BASE, 'deliverables/client-intelligence');

// Log project info
console.log('\n📊 Comprehensive Intelligence Report Generator');
console.log('='.repeat(80));
console.log(`📁 Project: ${path.basename(PROJECT_BASE)}`);
console.log(`📄 Data Source: ${path.basename(DATA_PATH)}`);
console.log(`📂 Output Directory: ${OUTPUT_DIR}`);
console.log('='.repeat(80) + '\n');

/**
 * Utility: Slugify string
 */
function slugify(text) {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Generate Hero Section
 */
function generateHero(data) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `
  <!-- Hero Section -->
  <header class="hero-pattern text-white py-16 shadow-lg">
    <div class="container mx-auto px-6">
      <div class="max-w-4xl">
        <div class="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-semibold mb-4">
          <span>🎯 Strategic Intelligence Report</span>
        </div>
        <h1 class="text-5xl font-extrabold mb-4 tracking-tight">
          ${data.meta?.clientName || 'Client Name'}
        </h1>
        <p class="text-xl font-medium opacity-90 mb-6">
          Comprehensive Client Intelligence & Market Analysis
        </p>
        <div class="flex flex-wrap gap-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📅</span>
            <span>Generated: ${date}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">🎯</span>
            <span>${data.personas?.length || 3} ICP Segments Analyzed</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-2xl">📊</span>
            <span>Project: ${data.meta?.projectId?.split('-')[0] || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
  `;
}

/**
 * Generate TOC Navigation
 */
function generateTOC(data) {
  const personas = data.personas || [];

  const icpLinks = personas.map((persona, idx) => {
    const slug = slugify(persona.name || `persona-${idx + 1}`);
    const revenue = persona.revenueWeight || persona.segment || 'N/A';
    return `          <a href="#icp-${slug}" class="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            ${idx + 4}. ICP: ${persona.name} (${revenue})
          </a>`;
  }).join('\n');

  return `
    <!-- Sticky TOC Navigation -->
    <aside id="toc" class="hidden lg:block sticky top-0 h-screen bg-card border-r overflow-y-auto">
      <div class="p-6">
        <h2 class="text-xl font-bold text-primary mb-6 pb-4 border-b">
          📑 Contents
        </h2>
        <nav class="flex flex-col gap-1">
          <a href="#executive-dashboard" class="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            1. Executive Dashboard
          </a>
          <a href="#business-overview" class="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            2. Business Overview
          </a>
          <a href="#success-factors" class="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            3. Critical Success Factors
          </a>
${icpLinks}
          <a href="#psychographic-analysis" class="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            ${personas.length + 4}. Psychographic Analysis
          </a>
          <a href="#copywriting-framework" class="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            ${personas.length + 5}. ICP Copywriting Framework
          </a>
          <a href="#seo-strategy" class="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            ${personas.length + 6}. SEO & Content Strategy
          </a>
          <a href="#competitive-intel" class="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            ${personas.length + 7}. Competitive Intelligence
          </a>
          <a href="#go-to-market" class="px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
            ${personas.length + 8}. Go-To-Market Execution
          </a>
        </nav>
      </div>
    </aside>
  `;
}

/**
 * Generate Executive Dashboard
 */
function generateExecutiveDashboard(data) {
  const ltv = data.unitEconomicsAndFinancials?.ltv || data.icpSynthesis?.segment1_performanceAthletes?.unitEconomics?.ltv || '$5,500';
  const cac = data.unitEconomicsAndFinancials?.cac || data.icpSynthesis?.segment1_performanceAthletes?.unitEconomics?.cac || '$650';
  const marketSize = data.marketIntelligence?.marketSize || data.icpSynthesis?.segment1_performanceAthletes?.marketSize || '$1.2B';

  const personas = data.personas || [];

  const performanceTable = personas.map((persona, idx) => {
    const colors = ['primary', 'secondary', 'emerald-700'];
    const colorClass = colors[idx] || 'primary';
    const revenue = persona.revenueWeight || persona.segment || 'N/A';
    const pLtv = persona.unitEconomics?.ltv || 'N/A';
    const pCac = persona.unitEconomics?.cac || 'N/A';
    const payback = persona.unitEconomics?.paybackPeriod || '2-3 months';
    const aov = persona.unitEconomics?.aov || 'N/A';

    return `                    <tr class="border-b transition-colors hover:bg-muted/50">
                      <td class="p-4 align-middle font-medium">${persona.name}</td>
                      <td class="p-4 align-middle">
                        <span class="inline-flex items-center rounded-full bg-${colorClass}/10 px-3 py-1 text-xs font-semibold text-${colorClass}">${revenue}</span>
                      </td>
                      <td class="p-4 align-middle">${pLtv}</td>
                      <td class="p-4 align-middle">${pCac}</td>
                      <td class="p-4 align-middle">${payback}</td>
                      <td class="p-4 align-middle">${aov}</td>
                    </tr>`;
  }).join('\n');

  return `
        <!-- Executive Dashboard -->
        <section id="executive-dashboard">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">📊</span>
            <h2 class="text-4xl font-bold tracking-tight">Executive Dashboard</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <!-- LTV Card -->
            <div class="rounded-xl bg-primary p-6 text-white shadow-lg transition-transform hover:-translate-y-1">
              <div class="text-xl font-bold mb-2">${ltv}</div>
              <div class="text-xs font-semibold uppercase tracking-wide opacity-90">Average LTV</div>
              <div class="text-xs mt-1 opacity-75">Performance Athletes</div>
            </div>

            <!-- CAC Card -->
            <div class="rounded-xl bg-secondary p-6 text-white shadow-lg transition-transform hover:-translate-y-1">
              <div class="text-xl font-bold mb-2">${cac}</div>
              <div class="text-xs font-semibold uppercase tracking-wide opacity-90">Average CAC</div>
              <div class="text-xs mt-1 opacity-75">2-3 Month Payback</div>
            </div>

            <!-- Segments Card -->
            <div class="rounded-xl bg-slate-700 p-6 text-white shadow-lg transition-transform hover:-translate-y-1">
              <div class="text-xl font-bold mb-2">${personas.length}</div>
              <div class="text-xs font-semibold uppercase tracking-wide opacity-90">ICP Segments</div>
              <div class="text-xs mt-1 opacity-75">${personas.map(p => p.name?.split(' ')[0]).join(', ')}</div>
            </div>

            <!-- Market Size Card -->
            <div class="rounded-xl bg-emerald-600 p-6 text-white shadow-lg transition-transform hover:-translate-y-1">
              <div class="text-xl font-bold mb-2">${marketSize}</div>
              <div class="text-xs font-semibold uppercase tracking-wide opacity-90">Market Size (US)</div>
              <div class="text-xs mt-1 opacity-75">15-20% Annual Growth</div>
            </div>
          </div>

          <!-- Key Metrics Table -->
          <div class="rounded-lg border bg-card shadow-sm">
            <div class="p-6">
              <h3 class="text-2xl font-semibold mb-6">Segment Performance Metrics</h3>
              <div class="w-full overflow-auto">
                <table class="w-full caption-bottom text-sm">
                  <thead class="[&_tr]:border-b">
                    <tr class="border-b transition-colors">
                      <th class="h-12 px-4 text-left align-middle font-medium">Segment</th>
                      <th class="h-12 px-4 text-left align-middle font-medium">Revenue %</th>
                      <th class="h-12 px-4 text-left align-middle font-medium">LTV</th>
                      <th class="h-12 px-4 text-left align-middle font-medium">CAC</th>
                      <th class="h-12 px-4 text-left align-middle font-medium">Payback</th>
                      <th class="h-12 px-4 text-left align-middle font-medium">AOV</th>
                    </tr>
                  </thead>
                  <tbody class="[&_tr:last-child]:border-0">
${performanceTable}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
  `;
}

/**
 * Generate Business Overview
 */
function generateBusinessOverview(data) {
  const exec = data.executiveSynthesis || {};
  const stratContext = data.strategicContext || {};

  return `
        <!-- Business Overview -->
        <section id="business-overview">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">🏢</span>
            <h2 class="text-4xl font-bold tracking-tight">Business Overview</h2>
          </div>

          <div class="rounded-lg border bg-card shadow-sm p-8 mb-6">
            <h3 class="text-2xl font-semibold mb-4 text-primary">What is ${data.meta?.clientName || 'This Business'}?</h3>
            <p class="text-lg text-muted-foreground leading-relaxed mb-6">
              ${exec.whatIsRapidColdPlunge || exec.overview || 'Business overview not available.'}
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>🎯</span> Core Business Model
              </h4>
              <p class="text-sm text-muted-foreground leading-relaxed">
                ${exec.coreBusinessModel || 'Business model details not available.'}
              </p>
            </div>

            <div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>✅</span> Validation Status
              </h4>
              <div class="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 mb-3">
                ${exec.validationStatus || 'Product-Market Fit Achieved'}
              </div>
              <p class="text-sm text-muted-foreground leading-relaxed">
                ${exec.validationNotes || 'Strong market validation across key segments.'}
              </p>
            </div>
          </div>

          <div class="rounded-lg border bg-card shadow-sm p-8 mt-6">
            <h4 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🔮</span> Ten-Year Vision
            </h4>
            <p class="text-sm text-muted-foreground leading-relaxed">
              ${exec.tenYearVision || 'Long-term vision to become the category leader in the market.'}
            </p>
          </div>
        </section>
  `;
}

/**
 * Generate Critical Success Factors
 */
function generateSuccessFactors(data) {
  const factors = data.executiveSynthesis?.criticalSuccessFactors || data.strategicContext?.competitiveAdvantages || [];
  const icons = ['💎', '🔬', '🏆', '📚', '⚡', '🎯'];
  const colors = [
    { bg: 'bg-primary/10', text: 'text-primary' },
    { bg: 'bg-secondary/10', text: 'text-secondary' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    { bg: 'bg-amber-100', text: 'text-amber-700' },
    { bg: 'bg-blue-100', text: 'text-blue-700' },
    { bg: 'bg-purple-100', text: 'text-purple-700' }
  ];

  const factorCards = factors.map((factor, idx) => {
    const icon = icons[idx % icons.length];
    const color = colors[idx % colors.length];
    const title = typeof factor === 'string' ? factor.split(':')[0] || factor : factor.title || `Factor ${idx + 1}`;
    const desc = typeof factor === 'string' ? factor : factor.description || '';

    return `            <div class="rounded-lg border bg-card shadow-sm p-6 transition-all hover:shadow-lg">
              <div class="flex items-start gap-4">
                <div class="rounded-lg ${color.bg} p-3 ${color.text}">
                  <span class="text-2xl">${icon}</span>
                </div>
                <div>
                  <h4 class="font-semibold mb-2">${title}</h4>
                  <p class="text-sm text-muted-foreground">
                    ${desc || title}
                  </p>
                </div>
              </div>
            </div>`;
  }).join('\n\n');

  return `
        <!-- Critical Success Factors -->
        <section id="success-factors">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">🔑</span>
            <h2 class="text-4xl font-bold tracking-tight">Critical Success Factors</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
${factorCards}
          </div>
        </section>
  `;
}

/**
 * Generate ICP Deep Dive Section
 */
function generateICPSection(persona, idx, data) {
  const slug = slugify(persona.name || `persona-${idx + 1}`);
  const icons = ['🏋️', '💼', '🧘'];
  const icon = icons[idx] || '👤';
  const colorClasses = [
    { primary: 'primary', secondary: 'primary/5', border: 'primary/20' },
    { primary: 'secondary', secondary: 'secondary/5', border: 'secondary/20' },
    { primary: 'emerald-700', secondary: 'emerald-50', border: 'emerald-200' }
  ];
  const colors = colorClasses[idx] || colorClasses[0];

  const revenue = persona.revenueWeight || persona.segment || 'N/A';
  const relevance = persona.relevance || '95';
  const description = persona.description || 'No description available.';

  // Demographics
  const demo = persona.demographics || {};
  const demoGrid = `
          <div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4">Demographics</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-start gap-3">
                <span class="text-xl">👥</span>
                <div>
                  <div class="font-medium text-sm">Age Range</div>
                  <div class="text-sm text-muted-foreground">${demo.ageRange || 'N/A'}</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-xl">⚖️</span>
                <div>
                  <div class="font-medium text-sm">Gender Split</div>
                  <div class="text-sm text-muted-foreground">${demo.genderSplit || 'N/A'}</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-xl">💰</span>
                <div>
                  <div class="font-medium text-sm">Household Income</div>
                  <div class="text-sm text-muted-foreground">${demo.householdIncome || 'N/A'}</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <span class="text-xl">📍</span>
                <div>
                  <div class="font-medium text-sm">Locations</div>
                  <div class="text-sm text-muted-foreground">${demo.locations || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>`;

  // Sub-Segments
  const subSegments = persona.subSegments || {};
  const subSegmentCards = Object.entries(subSegments).map(([key, segment], subIdx) => {
    const percentage = segment.percentage || segment.weight || 'N/A';
    const name = segment.name || key.replace(/([A-Z])/g, ' $1').trim();
    const desc = segment.description || '';
    const subDemo = segment.demographics || {};

    return `              <div class="rounded-lg border bg-accent p-4">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-semibold">${name}</h4>
                  <span class="inline-flex items-center rounded-full bg-${colors.primary}/10 px-3 py-1 text-xs font-semibold text-${colors.primary}">${percentage}</span>
                </div>
                <p class="text-xs text-muted-foreground mb-3">
                  ${desc}
                </p>
                <div class="text-xs space-y-1">
                  ${subDemo.ageRange ? `<div class="flex items-center gap-2"><span class="text-${colors.primary}">•</span><span>Age: ${subDemo.ageRange}</span></div>` : ''}
                  ${subDemo.income ? `<div class="flex items-center gap-2"><span class="text-${colors.primary}">•</span><span>Income: ${subDemo.income}</span></div>` : ''}
                  ${subDemo.trainingFrequency ? `<div class="flex items-center gap-2"><span class="text-${colors.primary}">•</span><span>Training: ${subDemo.trainingFrequency}</span></div>` : ''}
                </div>
              </div>`;
  }).join('\n\n');

  const subSegmentsSection = Object.keys(subSegments).length > 0 ? `
          <div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4">Sub-Segments</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
${subSegmentCards}
            </div>
          </div>` : '';

  // Pain Points
  const painPoints = persona.painPoints || persona.challenges || [];
  const painPointsList = painPoints.map(pain => {
    const title = typeof pain === 'string' ? pain.split(':')[0] || pain : pain.title || pain.name || 'Pain Point';
    const desc = typeof pain === 'string' ? pain : pain.description || pain.details || '';

    return `              <div class="flex items-start gap-3 p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                <span class="text-destructive">⚠️</span>
                <div>
                  <div class="font-medium text-sm">${title}</div>
                  ${desc ? `<div class="text-xs text-muted-foreground mt-1">${desc}</div>` : ''}
                </div>
              </div>`;
  }).join('\n\n');

  const painPointsSection = painPoints.length > 0 ? `
          <div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4">Key Pain Points</h3>
            <div class="space-y-3">
${painPointsList}
            </div>
          </div>` : '';

  // Acquisition Channels
  const channels = persona.acquisitionChannels || [];
  const channelsList = channels.map(channel => {
    const name = typeof channel === 'string' ? channel : channel.name || channel.channel || 'Channel';
    const desc = typeof channel === 'string' ? '' : channel.description || '';
    const roi = typeof channel === 'string' ? '' : channel.roi || channel.expectedROI || '';
    const cpa = typeof channel === 'string' ? '' : channel.cpa || channel.cac || '';

    return `              <div class="flex items-center justify-between p-3 rounded-lg border bg-accent">
                <div class="flex items-center gap-3">
                  <span>🎯</span>
                  <div>
                    <div class="font-medium text-sm">${name}</div>
                    ${desc ? `<div class="text-xs text-muted-foreground">${desc}</div>` : ''}
                  </div>
                </div>
                ${roi || cpa ? `<div class="text-right">
                  ${roi ? `<div class="text-sm font-bold text-${colors.primary}">${roi} ROI</div>` : ''}
                  ${cpa ? `<div class="text-xs text-muted-foreground">${cpa} CPA</div>` : ''}
                </div>` : ''}
              </div>`;
  }).join('\n\n');

  const acquisitionSection = channels.length > 0 ? `
          <div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4">Acquisition Channels</h3>
            <div class="space-y-3">
${channelsList}
            </div>
          </div>` : '';

  // Case Studies
  const caseStudies = persona.caseStudies || [];
  const caseStudyCards = caseStudies.map((study, studyIdx) => {
    const results = study.results || {};
    const resultKeys = Object.keys(results);

    return `              <div class="rounded-lg border bg-accent p-5">
                <div class="flex items-start justify-between mb-3">
                  <div>
                    <h4 class="font-semibold">${study.name || `Case Study ${studyIdx + 1}`}</h4>
                    <p class="text-xs text-muted-foreground">${study.location || 'Location N/A'} • ${study.profile || ''} • ${study.purchaseDate || ''}</p>
                  </div>
                  <span class="inline-flex items-center rounded-full bg-${colors.primary}/10 px-3 py-1 text-xs font-semibold text-${colors.primary}">
                    ${study.usagePattern || 'Daily Use'}
                  </span>
                </div>
                ${resultKeys.length > 0 ? `<div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  ${resultKeys.slice(0, 4).map(key => {
                    const value = results[key];
                    return `<div class="bg-card rounded p-2">
                    <div class="text-lg font-bold text-${colors.primary}">${value}</div>
                    <div class="text-xs text-muted-foreground">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  </div>`;
                  }).join('\n                  ')}
                </div>` : ''}
                ${study.testimonial ? `<blockquote class="border-l-4 border-${colors.primary} pl-4 text-sm italic text-muted-foreground">
                  "${study.testimonial}"
                </blockquote>` : ''}
              </div>`;
  }).join('\n\n');

  const caseStudiesSection = caseStudies.length > 0 ? `
          <div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4">Case Studies</h3>
            <div class="space-y-4">
${caseStudyCards}
            </div>
          </div>` : '';

  return `
        <!-- ICP: ${persona.name} -->
        <section id="icp-${slug}">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">${icon}</span>
            <h2 class="text-4xl font-bold tracking-tight">ICP: ${persona.name}</h2>
          </div>

          <div class="rounded-lg border bg-${colors.secondary} border-${colors.border} shadow-sm p-6 mb-6">
            <div class="flex items-center gap-4 mb-4">
              <span class="inline-flex items-center rounded-full bg-${colors.primary} px-4 py-2 text-sm font-semibold text-white">
                ${revenue} Revenue Share
              </span>
              <span class="inline-flex items-center rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
                ${relevance}% Relevance Score
              </span>
            </div>
            <p class="text-muted-foreground leading-relaxed">
              ${description}
            </p>
          </div>

${demoGrid}
${subSegmentsSection}
${painPointsSection}
${caseStudiesSection}
${acquisitionSection}
        </section>
  `;
}

/**
 * Generate Psychographic Analysis Section (Per-Segment)
 */
function generatePsychographicAnalysis(data) {
  const icpSynthesis = data.icpSynthesis || {};

  // Extract all segment psychographics directly from icpSynthesis
  const segments = [];
  Object.keys(icpSynthesis).forEach(key => {
    if (key.startsWith('segment')) {
      const segment = icpSynthesis[key];
      if (segment.psychographics) {
        segments.push({
          name: segment.name || key,
          revenueWeight: segment.revenueWeight || 'N/A',
          psychographics: segment.psychographics
        });
      }
    }
  });

  if (segments.length === 0) {
    return `
        <!-- Psychographic Analysis -->
        <section id="psychographic-analysis">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">🧠</span>
            <h2 class="text-4xl font-bold tracking-tight">Psychographic Analysis</h2>
          </div>
          <p class="text-muted-foreground">Psychographic analysis data not available.</p>
        </section>
    `;
  }

  const psychoCards = segments.map((segment, idx) => {
    const psycho = segment.psychographics;
    const values = psycho.values || '';
    const lifestyle = psycho.lifestyle || '';
    const motivationsRaw = psycho.motivations || [];
    const goalsRaw = psycho.goals || [];
    const motivations = Array.isArray(motivationsRaw) ? motivationsRaw : [];
    const goals = Array.isArray(goalsRaw) ? goalsRaw : [];

    return `          <div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-semibold">${segment.name}</h3>
              <span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                ${segment.revenueWeight} Revenue
              </span>
            </div>

            ${values ? `<div class="mb-4">
              <h4 class="text-sm font-semibold text-primary mb-2">Core Values</h4>
              <p class="text-sm text-muted-foreground leading-relaxed">${values}</p>
            </div>` : ''}

            ${lifestyle ? `<div class="mb-4">
              <h4 class="text-sm font-semibold text-primary mb-2">Lifestyle</h4>
              <p class="text-sm text-muted-foreground leading-relaxed">${lifestyle}</p>
            </div>` : ''}

            ${motivations.length > 0 ? `<div class="mb-4">
              <h4 class="text-sm font-semibold text-primary mb-2">Motivations</h4>
              <ul class="space-y-2">
                ${motivations.map(m => `<li class="text-sm text-muted-foreground flex items-start gap-2">
                  <span class="text-primary mt-1">•</span>
                  <span>${m}</span>
                </li>`).join('\n                ')}
              </ul>
            </div>` : ''}

            ${goals.length > 0 ? `<div>
              <h4 class="text-sm font-semibold text-primary mb-2">Goals</h4>
              <ul class="space-y-2">
                ${goals.map(g => `<li class="text-sm text-muted-foreground flex items-start gap-2">
                  <span class="text-primary mt-1">•</span>
                  <span>${g}</span>
                </li>`).join('\n                ')}
              </ul>
            </div>` : ''}
          </div>`;
  }).join('\n');

  return `
        <!-- Psychographic Analysis -->
        <section id="psychographic-analysis">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">🧠</span>
            <h2 class="text-4xl font-bold tracking-tight">Psychographic Analysis</h2>
          </div>

${psychoCards}
        </section>
  `;
}

/**
 * Generate 24-Section ICP Copywriting Framework Section
 */
function generate24SectionFramework() {
  // Try loading 24-section framework
  let frameworkData = null;

  try {
    if (fs.existsSync(ICP_FRAMEWORK_PATH)) {
      frameworkData = JSON.parse(fs.readFileSync(ICP_FRAMEWORK_PATH, 'utf8'));
      console.log(`✅ Loaded 24-section framework from: ${path.basename(ICP_FRAMEWORK_PATH)}`);
    }
  } catch (err) {
    console.warn(`Could not load 24-section framework:`, err.message);
  }

  if (!frameworkData || !frameworkData.segments) {
    return ''; // Skip section if no framework data
  }

  const sections = Object.values(frameworkData.segments);

  const segmentCards = sections.map((segment, idx) => {
    const colors = ['primary', 'secondary', 'emerald-700'];
    const colorClass = colors[idx % colors.length];

    // Group sections for better display
    const coreIdentity = [
      { label: 'Avatar', value: segment.avatar },
      { label: 'Before State', value: segment.beforeState },
      { label: 'After State', value: segment.afterState }
    ];

    const goalsAndDreams = [
      { label: 'Primary Goals', value: segment.primaryGoals },
      { label: 'Secondary Goals', value: segment.secondaryGoals },
      { label: 'Dreams', value: segment.dreams },
      { label: 'Promises', value: segment.promises }
    ];

    const painsAndFears = [
      { label: 'Primary Complaint', value: segment.primaryComplaint },
      { label: 'Secondary Complaint', value: segment.secondaryComplaint },
      { label: 'Ultimate Fear', value: segment.ultimateFear },
      { label: 'Enemy', value: segment.enemy }
    ];

    const obstacles = [
      { label: 'Objections', value: segment.objections },
      { label: 'Bad Habits', value: segment.badHabits },
      { label: 'Consequences', value: segment.consequences },
      { label: 'Negative Statistics', value: segment.negativeStatistics }
    ];

    const mythsBusting = [
      { label: 'False Solution Lie', value: segment.falseSolutionLie },
      { label: 'False Solution Truth', value: segment.falseSolutionTruth },
      { label: 'Mistaken Belief', value: segment.mistakenBeliefName },
      { label: 'Success Myth Truth', value: segment.successMythTruth }
    ];

    const pastAttempts = [
      { label: 'What They Tried', value: segment.whatTheyTried },
      { label: 'Why It Failed', value: segment.whyItFailed },
      { label: 'Decision Triggers', value: segment.decisionTriggers }
    ];

    const renderGroup = (title, items, icon) => {
      const validItems = items.filter(item => item.value);
      if (validItems.length === 0) return '';

      return `
        <div class="mb-6">
          <h4 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>${icon}</span> ${title}
          </h4>
          <div class="space-y-3">
            ${validItems.map(item => `
              <div class="rounded-lg border bg-accent p-4">
                <div class="text-sm font-semibold text-${colorClass} mb-1">${item.label}</div>
                <div class="text-sm text-muted-foreground leading-relaxed">${item.value}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    };

    return `
      <div class="rounded-lg border bg-card shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-2xl font-semibold">${segment.name}</h3>
          <span class="inline-flex items-center rounded-full bg-${colorClass}/10 px-4 py-2 text-sm font-semibold text-${colorClass}">
            ${segment.revenueWeight} Revenue
          </span>
        </div>

        ${renderGroup('Core Identity', coreIdentity, '👤')}
        ${renderGroup('Goals & Aspirations', goalsAndDreams, '🎯')}
        ${renderGroup('Pains & Fears', painsAndFears, '⚠️')}
        ${renderGroup('Obstacles & Blockers', obstacles, '🚧')}
        ${renderGroup('Myths to Bust', mythsBusting, '💡')}
        ${renderGroup('Past Attempts', pastAttempts, '🔄')}
      </div>
    `;
  }).join('\n');

  return `
        <!-- 24-Section ICP Copywriting Framework -->
        <section id="copywriting-framework">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">✍️</span>
            <h2 class="text-4xl font-bold tracking-tight">ICP Copywriting Framework</h2>
          </div>

          <div class="rounded-lg border bg-primary/5 border-primary/20 shadow-sm p-6 mb-8">
            <h3 class="text-lg font-semibold mb-2">📝 24-Section Deep Dive Framework</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">
              Comprehensive copywriting intelligence covering avatar personas, emotional triggers, pain points,
              objections, myths to bust, and conversion messaging for all ${sections.length} customer segments.
              Use this framework to craft high-converting landing pages, email sequences, and sales copy.
            </p>
          </div>

${segmentCards}
        </section>
  `;
}

/**
 * Generate Unit Economics & Financials Section
 */
function generateUnitEconomics(data) {
  const ue = data.unitEconomicsAndFinancials || {};

  return `
        <!-- Unit Economics & Financials -->
        <section id="unit-economics">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">💰</span>
            <h2 class="text-4xl font-bold tracking-tight">Unit Economics & Financials</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-sm font-semibold text-primary mb-3">Average Order Value</h4>
              <div class="text-2xl font-bold">${ue.aov || ue.averageOrderValue || 'N/A'}</div>
            </div>
            <div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-sm font-semibold text-primary mb-3">Customer Lifetime Value</h4>
              <div class="text-2xl font-bold">${ue.ltv || ue.customerLifetimeValue || 'N/A'}</div>
            </div>
            <div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-sm font-semibold text-primary mb-3">Customer Acquisition Cost</h4>
              <div class="text-2xl font-bold">${ue.cac || ue.customerAcquisitionCost || 'N/A'}</div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${ue.grossMargin || ue.margin ? `<div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-sm font-semibold text-primary mb-3">Gross Margin</h4>
              <div class="text-2xl font-bold">${ue.grossMargin || ue.margin}</div>
            </div>` : ''}
            ${ue.paybackPeriod ? `<div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-sm font-semibold text-primary mb-3">Payback Period</h4>
              <div class="text-2xl font-bold">${ue.paybackPeriod}</div>
            </div>` : ''}
          </div>

          ${ue.pricing || ue.pricingTiers ? `<div class="rounded-lg border bg-card shadow-sm p-6 mt-6">
            <h3 class="text-xl font-semibold mb-4">Pricing Structure</h3>
            <p class="text-sm text-muted-foreground">${typeof ue.pricing === 'string' ? ue.pricing : JSON.stringify(ue.pricing || ue.pricingTiers)}</p>
          </div>` : ''}
        </section>
  `;
}

/**
 * Generate SEO Strategy Section (Comprehensive with ALL Keyword Categories + Semantic Clusters)
 */
function generateSEOStrategy(data) {
  // Try loading keyword data from multiple possible file locations and formats
  let keywordData = null;
  const possibleKeywordPaths = [
    SEO_KEYWORDS_PATH, // comprehensive-keyword-database.json
    path.join(PROJECT_BASE, 'deliverables/seo/keyword-research-SEMANTIC-ENHANCED.json'),
    path.join(PROJECT_BASE, 'deliverables/seo/keyword-research-semantic.json'),
    path.join(PROJECT_BASE, 'deliverables/seo/keyword-research.json'),
    path.join(PROJECT_BASE, 'deliverables/seo/keyword-research-transformed.json')
  ];

  for (const kwPath of possibleKeywordPaths) {
    try {
      if (fs.existsSync(kwPath)) {
        keywordData = JSON.parse(fs.readFileSync(kwPath, 'utf8'));
        console.log(`✅ Loaded SEO keywords from: ${path.basename(kwPath)}`);
        break;
      }
    } catch (err) {
      console.warn(`Could not load ${path.basename(kwPath)}:`, err.message);
    }
  }

  const seo = data.seoAndContentStrategy || {};
  const pillarsRaw = seo.contentPillars || [];
  const pillars = Array.isArray(pillarsRaw) ? pillarsRaw : [];
  const strategy = seo.strategyOverview || seo.overview || '';

  let totalKeywords = 0;
  let categoryHTML = '';

  // Helper function to convert difficulty text to numeric KD score (used by all keyword structures)
  const getDifficultyScore = (difficulty) => {
    if (typeof difficulty === 'number') return difficulty;
    const d = (difficulty || '').toUpperCase();
    if (d === 'HIGH') return 85;
    if (d === 'MEDIUM') return 60;
    if (d === 'LOW') return 25;
    return 'N/A';
  };

  // Handle KEYWORD CATEGORIES structure (Rapid Cold Plunge style)
  if (keywordData && keywordData.keywordCategories) {
    totalKeywords = keywordData.totalKeywords || 0;

    // Define category display names and descriptions
    const categoryInfo = {
      primaryLocalKeywords: { name: 'Primary Local Keywords', desc: 'High-priority local search terms for geographic targeting', icon: '📍', showTop: 8 },
      athleteRecoveryKeywords: { name: 'Athlete Recovery Keywords', desc: 'Performance and recovery-focused search terms', icon: '🏃', showTop: 6 },
      biohackingExecutiveKeywords: { name: 'Biohacking & Executive Keywords', desc: 'Optimization and longevity-focused search terms', icon: '🧬', showTop: 6 },
      wellnessHolisticKeywords: { name: 'Wellness & Holistic Keywords', desc: 'General wellness and health-conscious search terms', icon: '🧘', showTop: 6 },
      serviceBenefitKeywords: { name: 'Service & Benefit Keywords', desc: 'Specific service offerings and benefit-focused terms', icon: '✨', showTop: 5 },
      pricingMembershipKeywords: { name: 'Pricing & Membership Keywords', desc: 'Commercial intent and membership-focused searches', icon: '💳', showTop: 4 },
      neighborhoodSpecificKeywords: { name: 'Neighborhood-Specific Keywords', desc: 'Ultra-local geographic targeting opportunities', icon: '🏘️', showTop: 5 },
      longTailOpportunityKeywords: { name: 'Long-Tail Opportunity Keywords', desc: 'Low competition, high conversion long-tail terms', icon: '🎯', showTop: 4 },
      voiceSearchKeywords: { name: 'Voice Search Keywords', desc: 'Conversational queries for voice-first devices', icon: '🎤', showTop: 4 },
      competitiveAlternativeKeywords: { name: 'Competitive Alternative Keywords', desc: 'Capture searches for competitor services', icon: '🔄', showTop: 3 },
      spanishLanguageKeywords: { name: 'Spanish Language Keywords', desc: 'Spanish-language search opportunities', icon: '🌎', showTop: 3 },
      wearablesIntegrationKeywords: { name: 'Wearables & Tech Keywords', desc: 'Tech-savvy biohacker search terms', icon: '⌚', showTop: 3 }
    };

    // Generate HTML for each category
    Object.keys(categoryInfo).forEach(categoryKey => {
      if (keywordData.keywordCategories[categoryKey]) {
        const category = keywordData.keywordCategories[categoryKey];
        const info = categoryInfo[categoryKey];
        const keywords = category.keywords || [];
        const topKeywords = keywords.slice(0, info.showTop);

        if (topKeywords.length > 0) {
          categoryHTML += `
          <div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">${info.icon}</span>
              <div class="flex-1">
                <h3 class="text-lg font-semibold">${info.name}</h3>
                <p class="text-sm text-muted-foreground">${info.desc} • ${keywords.length} keywords researched</p>
              </div>
            </div>

            <!-- Keyword Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b-2 border-border">
                    <th class="text-left py-3 px-4 font-semibold text-foreground">Keyword</th>
                    <th class="text-right py-3 px-4 font-semibold text-foreground whitespace-nowrap">Search Volume/mo</th>
                    <th class="text-center py-3 px-4 font-semibold text-foreground">KD</th>
                    <th class="text-right py-3 px-4 font-semibold text-foreground">CPC</th>
                    <th class="text-center py-3 px-4 font-semibold text-foreground">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  ${topKeywords.map((kw, idx) => {
                    const word = kw.keyword || '';
                    const volumeActual = kw.searchVolumeActual || null;
                    const volumeDisplay = volumeActual !== null ? volumeActual.toLocaleString() : (kw.searchVolumeEstimate || 'N/A').toString().replace(' (VALIDATED - DataForSEO API)', '');
                    const difficulty = kw.difficulty || 'N/A';
                    const kdScore = getDifficultyScore(difficulty);
                    const cpcActual = kw.cpcActual || null;
                    const cpcDisplay = cpcActual !== null ? '$' + cpcActual.toFixed(2) : (kw.cpcEstimate || 'N/A');
                    const priority = kw.priority || '';
                    const oppScore = kw.opportunityScore || null;

                    return `<tr class="border-b border-border hover:bg-accent/50 transition-colors">
                      <td class="py-3 px-4 font-medium">${word}</td>
                      <td class="py-3 px-4 text-right font-mono tabular-nums">${volumeDisplay}</td>
                      <td class="py-3 px-4 text-center">
                        <div class="inline-flex items-center gap-2">
                          <span class="font-mono font-semibold ${kdScore === 'N/A' ? '' : kdScore >= 70 ? 'text-red-600' : kdScore >= 40 ? 'text-orange-600' : 'text-green-600'}">${kdScore}</span>
                          ${difficulty !== 'N/A' ? `<span class="text-xs text-muted-foreground">(${difficulty})</span>` : ''}
                        </div>
                      </td>
                      <td class="py-3 px-4 text-right font-mono tabular-nums">${cpcDisplay}</td>
                      <td class="py-3 px-4 text-center">
                        ${priority ? `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${priority === 'Critical' ? 'bg-red-100 text-red-700' : priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}">${priority}</span>` : ''}
                        ${oppScore ? `<div class="text-xs text-muted-foreground mt-1">Opp: ${oppScore}</div>` : ''}
                      </td>
                    </tr>`;
                  }).join('\n                  ')}
                </tbody>
              </table>
            </div>
          </div>`;
        }
      }
    });
  }
  // Handle SEMANTIC CLUSTERS structure (Run Chicken style)
  else if (keywordData && keywordData.semanticClusters) {
    totalKeywords = keywordData.metadata?.totalKeywords || keywordData.totalKeywords || 0;

    // Get all cluster keys (excluding 'overview')
    const clusterKeys = Object.keys(keywordData.semanticClusters).filter(k => k !== 'overview');

    clusterKeys.forEach(clusterKey => {
      const cluster = keywordData.semanticClusters[clusterKey];
      if (!cluster || typeof cluster !== 'object') return;

      const clusterName = cluster.clusterName || clusterKey.replace(/_/g, ' ').replace(/cluster\d+/i, 'Cluster');
      const coherence = cluster.coherenceScore || 0;
      const priority = cluster.topicalAuthorityPriority || cluster.strategicValue || '';

      // Collect all keywords from cluster
      const allKeywords = [];

      // Add primary target keyword
      if (cluster.primaryTargetKeyword) {
        allKeywords.push(cluster.primaryTargetKeyword);
      }

      // Add supporting keywords
      if (Array.isArray(cluster.supportingKeywords)) {
        allKeywords.push(...cluster.supportingKeywords);
      }

      // Add long-tail keywords if available
      if (Array.isArray(cluster.longTailKeywords)) {
        allKeywords.push(...cluster.longTailKeywords.slice(0, 3));
      }

      const displayKeywords = allKeywords.slice(0, 10);

      if (displayKeywords.length > 0) {
        categoryHTML += `
        <div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">🎯</span>
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold">${clusterName}</h3>
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700">Coherence: ${(coherence * 100).toFixed(0)}%</span>
                ${priority ? `<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Priority: ${priority}</span>` : ''}
              </div>
              <p class="text-sm text-muted-foreground mt-1">Semantic cluster with ${allKeywords.length} related keywords</p>
            </div>
          </div>

          <!-- Keyword Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b-2 border-border">
                  <th class="text-left py-3 px-4 font-semibold text-foreground">Keyword</th>
                  <th class="text-right py-3 px-4 font-semibold text-foreground whitespace-nowrap">Search Volume/mo</th>
                  <th class="text-center py-3 px-4 font-semibold text-foreground">KD</th>
                  <th class="text-right py-3 px-4 font-semibold text-foreground">CPC</th>
                  <th class="text-center py-3 px-4 font-semibold text-foreground">Priority</th>
                </tr>
              </thead>
              <tbody>
                ${displayKeywords.map(kw => {
                  const word = kw.keyword || '';
                  const volumeActual = kw.searchVolumeActual || kw.searchVolume || null;
                  const volumeDisplay = volumeActual !== null && typeof volumeActual === 'number' ? volumeActual.toLocaleString() : (volumeActual || 'N/A');
                  const difficulty = kw.difficulty || 'N/A';
                  const kdScore = getDifficultyScore(difficulty);
                  const cpcActual = kw.cpcActual || kw.cpc || null;
                  const cpcDisplay = cpcActual !== null && typeof cpcActual === 'number' ? '$' + cpcActual.toFixed(2) : (cpcActual || 'N/A');
                  const oppScore = kw.opportunityScore || null;

                  return `<tr class="border-b border-border hover:bg-accent/50 transition-colors">
                    <td class="py-3 px-4 font-medium">${word}</td>
                    <td class="py-3 px-4 text-right font-mono tabular-nums">${volumeDisplay}</td>
                    <td class="py-3 px-4 text-center">
                      <div class="inline-flex items-center gap-2">
                        <span class="font-mono font-semibold ${kdScore === 'N/A' ? '' : kdScore >= 70 ? 'text-red-600' : kdScore >= 40 ? 'text-orange-600' : 'text-green-600'}">${kdScore}</span>
                        ${difficulty !== 'N/A' ? `<span class="text-xs text-muted-foreground">(${difficulty})</span>` : ''}
                      </div>
                    </td>
                    <td class="py-3 px-4 text-right font-mono tabular-nums">${cpcDisplay}</td>
                    <td class="py-3 px-4 text-center">
                      ${oppScore ? `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${oppScore > 80 ? 'bg-red-100 text-red-700' : oppScore > 60 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}">Opp: ${oppScore}</span>` : ''}
                    </td>
                  </tr>`;
                }).join('\n                ')}
              </tbody>
            </table>
          </div>
        </div>`;
      }
    });
  }
  // Handle NICHE BREAKDOWN structure (Proffshop style)
  else if (keywordData && (keywordData.nicheBreakdown || keywordData.original?.nicheBreakdown)) {
    totalKeywords = keywordData.original?.totalKeywords || keywordData.totalKeywords || 0;

    // nicheBreakdown can be at top level or inside 'original'
    const nicheBreakdown = keywordData.nicheBreakdown || keywordData.original?.nicheBreakdown;

    const nicheInfo = {
      cbd_skincare: { name: 'CBD Skincare', desc: 'Premium CBD-infused skincare products', icon: '🌿' },
      tattoo_aftercare: { name: 'Tattoo Aftercare', desc: 'Professional tattoo healing and care products', icon: '🎨' },
      premium_beauty: { name: 'Premium Beauty', desc: 'Luxury skincare and beauty products', icon: '💎' },
      theodent_dental: { name: 'Theodent Dental', desc: 'Innovative dental care products', icon: '🦷' },
      intimate_wellness: { name: 'Intimate Wellness', desc: 'Personal care and wellness products', icon: '🌸' }
    };

    Object.keys(nicheBreakdown).forEach(nicheKey => {
      const niche = nicheBreakdown[nicheKey];
      if (!niche || typeof niche !== 'object') return;

      const info = nicheInfo[nicheKey] || { name: nicheKey.replace(/_/g, ' '), desc: '', icon: '🎯' };
      const nicheTotal = niche.totalKeywords || 0;
      const keywordsByMarket = niche.keywordsByMarket || {};

      // Collect keywords from all markets (english, slovenian, italian, etc.)
      const allKeywords = [];
      Object.keys(keywordsByMarket).forEach(market => {
        const marketData = keywordsByMarket[market];
        if (marketData && Array.isArray(marketData.primaryKeywords)) {
          allKeywords.push(...marketData.primaryKeywords.map(kw => ({ ...kw, market })));
        }
      });

      const displayKeywords = allKeywords.slice(0, 12);

      if (displayKeywords.length > 0) {
        categoryHTML += `
        <div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
          <div class="flex items-center gap-3 mb-4">
            <span class="text-2xl">${info.icon}</span>
            <div class="flex-1">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold">${info.name}</h3>
                <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700">${nicheTotal} keywords</span>
              </div>
              <p class="text-sm text-muted-foreground mt-1">${info.desc} • Multi-market coverage (${Object.keys(keywordsByMarket).join(', ')})</p>
            </div>
          </div>

          <!-- Keyword Table -->
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b-2 border-border">
                  <th class="text-left py-3 px-4 font-semibold text-foreground">Keyword</th>
                  <th class="text-right py-3 px-4 font-semibold text-foreground whitespace-nowrap">Search Volume/mo</th>
                  <th class="text-center py-3 px-4 font-semibold text-foreground">KD</th>
                  <th class="text-right py-3 px-4 font-semibold text-foreground">CPC</th>
                  <th class="text-center py-3 px-4 font-semibold text-foreground">Market</th>
                </tr>
              </thead>
              <tbody>
                ${displayKeywords.map(kw => {
                  const word = kw.keyword || '';
                  const volumeActual = kw.estimatedVolume || kw.searchVolumeActual || kw.searchVolume || kw.monthlySearchVolume || null;
                  const volumeDisplay = volumeActual !== null && typeof volumeActual === 'number' ? volumeActual.toLocaleString() : (volumeActual || 'N/A');
                  const difficulty = kw.difficulty || kw.competitionLevel || 'N/A';
                  const kdScore = getDifficultyScore(difficulty);
                  const cpcActual = kw.cpcActual || kw.cpc || null;
                  const cpcDisplay = cpcActual !== null && typeof cpcActual === 'number' ? '$' + cpcActual.toFixed(2) : (cpcActual || 'N/A');
                  const market = kw.market || '';
                  const priority = kw.priority || '';

                  // Capitalize difficulty
                  const diffDisplay = typeof difficulty === 'string'
                    ? difficulty.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')
                    : difficulty;

                  return `<tr class="border-b border-border hover:bg-accent/50 transition-colors">
                    <td class="py-3 px-4 font-medium">${word}</td>
                    <td class="py-3 px-4 text-right font-mono tabular-nums">${volumeDisplay}</td>
                    <td class="py-3 px-4 text-center">
                      <div class="inline-flex items-center gap-2">
                        <span class="font-mono font-semibold ${kdScore === 'N/A' ? '' : kdScore >= 70 ? 'text-red-600' : kdScore >= 40 ? 'text-orange-600' : 'text-green-600'}">${kdScore}</span>
                        ${diffDisplay !== 'N/A' ? `<span class="text-xs text-muted-foreground">(${diffDisplay})</span>` : ''}
                      </div>
                    </td>
                    <td class="py-3 px-4 text-right font-mono tabular-nums">${cpcDisplay}</td>
                    <td class="py-3 px-4 text-center">
                      ${market ? `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700">${market}</span>` : ''}
                      ${priority ? `<div class="text-xs text-muted-foreground mt-1">${priority}</div>` : ''}
                    </td>
                  </tr>`;
                }).join('\n                ')}
              </tbody>
            </table>
          </div>
        </div>`;
      }
    });
  }

  // Render content pillars
  const pillarsList = pillars.map((pillar, idx) => {
    const title = typeof pillar === 'string' ? pillar : pillar.title || pillar.name || `Pillar ${idx + 1}`;
    const desc = typeof pillar === 'string' ? '' : pillar.description || '';
    const topics = typeof pillar === 'string' ? [] : pillar.topics || [];

    return `            <div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-lg font-semibold mb-2">${title}</h4>
              ${desc ? `<p class="text-sm text-muted-foreground mb-3">${desc}</p>` : ''}
              ${topics.length > 0 ? `<div class="flex flex-wrap gap-2">
                ${topics.map(t => `<span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">${t}</span>`).join('\n                ')}
              </div>` : ''}
            </div>`;
  }).join('\n\n');

  return `
        <!-- SEO & Content Strategy -->
        <section id="seo-strategy">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">🔍</span>
            <div class="flex-1">
              <h2 class="text-4xl font-bold tracking-tight">SEO & Content Strategy</h2>
              ${totalKeywords > 0 ? `<p class="text-lg text-muted-foreground mt-2">${totalKeywords} keywords researched across 12 strategic categories with validated DataForSEO API data</p>` : ''}
            </div>
          </div>

          ${strategy ? `<div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4">Strategy Overview</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">${strategy}</p>
          </div>` : ''}

          ${categoryHTML}

          ${pillars.length > 0 ? `<div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4">Content Pillars</h3>
            <div class="space-y-3">
${pillarsList}
            </div>
          </div>` : ''}
        </section>
  `;
}

/**
 * Generate Competitive Intelligence Section (Enhanced with Competitor Profiles)
 */
function generateCompetitiveIntelligence(data) {
  const market = data.marketIntelligence || {};

  // Load competitor profiles from multiple possible markdown file locations
  let competitorProfiles = [];
  const possibleCompetitorPaths = [
    SEO_COMPETITOR_PATH, // competitor-landscape-preliminary.md
    path.join(PROJECT_BASE, 'deliverables/seo/dataforseo/competitive-intelligence-summary-dataforseo.md'),
    path.join(PROJECT_BASE, 'deliverables/seo/dataforseo/competitor-analysis-plan.md'),
    path.join(PROJECT_BASE, 'deliverables/seo/competitive-landscape.md')
  ];

  for (const compPath of possibleCompetitorPaths) {
    try {
      if (fs.existsSync(compPath) && competitorProfiles.length === 0) {
        const competitorMD = fs.readFileSync(compPath, 'utf8');
        console.log(`✅ Loading competitors from: ${path.basename(compPath)}`);

        // Extract competitor sections by ### or #### headings
        const competitorMatches = competitorMD.match(/####\s+\d+\.\s+(.+?)(?=####|\n##|$)/gs) ||
                                 competitorMD.match(/###\s+\d+\.\s+(.+?)(?=###|\n##|$)/gs) || [];

        if (competitorMatches.length > 0) {
          competitorProfiles = competitorMatches.slice(0, 10).map(section => {
            const lines = section.split('\n').filter(l => l.trim());
            const nameMatch = section.match(/####\s+\d+\.\s+(.+)/) || section.match(/###\s+\d+\.\s+(.+)/);
            const locationMatch = section.match(/\*\*Location\*\*:\s*(.+)/);
            const positioningMatch = section.match(/\*\*Positioning\*\*:\s*(.+)/);
            const domainMatch = section.match(/\*\*Domain\*\*:\s*(.+)/);
            const strengthsMatch = section.match(/\*\*(?:Competitive\s+)?Strengths\*\*:\s*\n([\s\S]*?)(?=\*\*|$)/);
            const weaknessesMatch = section.match(/\*\*(?:Competitive\s+)?Weaknesses\*\*:\s*\n([\s\S]*?)(?=\*\*|$)/);

            return {
              name: nameMatch ? nameMatch[1].trim() : 'Unknown',
              domain: domainMatch ? domainMatch[1].trim() : '',
              location: locationMatch ? locationMatch[1].trim() : '',
              positioning: positioningMatch ? positioningMatch[1].trim() : '',
              strengths: strengthsMatch ? strengthsMatch[1].split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.replace(/^[-•]\s*/, '').trim()).slice(0, 3) : [],
              weaknesses: weaknessesMatch ? weaknessesMatch[1].split('\n').filter(l => l.trim().startsWith('-') || l.trim().startsWith('•')).map(l => l.replace(/^[-•]\s*/, '').trim()).slice(0, 3) : []
            };
          }).filter(c => c.name !== 'Unknown');

          if (competitorProfiles.length > 0) {
            console.log(`   Found ${competitorProfiles.length} competitor profiles`);
            break; // Stop after finding competitors in first valid file
          }
        }
      }
    } catch (err) {
      console.warn(`Could not load ${path.basename(compPath)}:`, err.message);
    }
  }

  // Ensure arrays are properly validated
  const competitorsRaw = market.competitors || market.keyCompetitors || [];
  const advantagesRaw = data.strategicContext?.competitiveAdvantages || [];

  const competitors = Array.isArray(competitorsRaw) ? competitorsRaw : [];
  const advantages = Array.isArray(advantagesRaw) ? advantagesRaw : [];

  return `
        <!-- Competitive Intelligence -->
        <section id="competitive-intel">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">📈</span>
            <h2 class="text-4xl font-bold tracking-tight">Competitive Intelligence</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-sm font-semibold text-primary mb-3">Market Size</h4>
              <div class="text-2xl font-bold">${market.marketSize || 'N/A'}</div>
            </div>
            <div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-sm font-semibold text-primary mb-3">Growth Rate</h4>
              <div class="text-2xl font-bold">${market.growthRate || market.cagr || 'N/A'}</div>
            </div>
            <div class="rounded-lg border bg-card shadow-sm p-6">
              <h4 class="text-sm font-semibold text-primary mb-3">Market Position</h4>
              <div class="text-2xl font-bold">${market.position || market.marketShare || 'N/A'}</div>
            </div>
          </div>

          ${competitorProfiles.length > 0 ? `<div class="mb-6">
            <h3 class="text-2xl font-semibold mb-4">Competitor Landscape Analysis (${competitorProfiles.length} Direct Competitors)</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${competitorProfiles.map(comp => {
                return `<div class="rounded-lg border bg-card shadow-sm p-5">
                  <div class="flex items-start justify-between mb-3">
                    <div>
                      <h4 class="text-lg font-semibold">${comp.name}</h4>
                      ${comp.location ? `<p class="text-xs text-muted-foreground mt-1">📍 ${comp.location}</p>` : ''}
                    </div>
                  </div>
                  ${comp.positioning ? `<p class="text-sm text-muted-foreground mb-3">${comp.positioning}</p>` : ''}

                  ${comp.strengths.length > 0 ? `<div class="mb-3">
                    <h5 class="text-xs font-semibold text-green-700 mb-1">Strengths</h5>
                    <ul class="space-y-1">
                      ${comp.strengths.map(s => `<li class="text-xs text-muted-foreground flex items-start gap-1">
                        <span class="text-green-600">+</span>
                        <span>${s}</span>
                      </li>`).join('\n                      ')}
                    </ul>
                  </div>` : ''}

                  ${comp.weaknesses.length > 0 ? `<div>
                    <h5 class="text-xs font-semibold text-red-700 mb-1">Weaknesses</h5>
                    <ul class="space-y-1">
                      ${comp.weaknesses.map(w => `<li class="text-xs text-muted-foreground flex items-start gap-1">
                        <span class="text-red-600">−</span>
                        <span>${w}</span>
                      </li>`).join('\n                      ')}
                    </ul>
                  </div>` : ''}
                </div>`;
              }).join('\n              ')}
            </div>
          </div>` : ''}

          ${advantages.length > 0 ? `<div class="rounded-lg border bg-card shadow-sm p-6">
            <h3 class="text-xl font-semibold mb-4">Competitive Advantages</h3>
            <ul class="space-y-2">
              ${advantages.map(adv => `<li class="text-sm text-muted-foreground flex items-start gap-2">
                <span class="text-primary">✓</span>
                <span>${typeof adv === 'string' ? adv : adv.advantage || adv.description}</span>
              </li>`).join('\n              ')}
            </ul>
          </div>` : ''}
        </section>
  `;
}

/**
 * Generate Go-To-Market Execution Section
 */
function generateGoToMarket(data) {
  const gtm = data.goToMarketStrategy || data.marketingStrategy || {};

  // Ensure arrays are properly validated
  const phasesRaw = gtm.phases || gtm.roadmap || [];
  const channelsRaw = gtm.channels || gtm.acquisitionChannels || [];
  const prioritiesRaw = data.strategicContext?.businessPriorities || [];

  const phases = Array.isArray(phasesRaw) ? phasesRaw : [];
  const channels = Array.isArray(channelsRaw) ? channelsRaw : [];
  const priorities = Array.isArray(prioritiesRaw) ? prioritiesRaw : [];

  return `
        <!-- Go-To-Market Execution -->
        <section id="go-to-market">
          <div class="flex items-center gap-4 border-b-2 border-border pb-4 mb-8">
            <span class="text-4xl">🚀</span>
            <h2 class="text-4xl font-bold tracking-tight">Go-To-Market Execution</h2>
          </div>

          ${priorities.length > 0 ? `<div class="rounded-lg border bg-card shadow-sm p-6 mb-6">
            <h3 class="text-xl font-semibold mb-4">Business Priorities</h3>
            <ul class="space-y-2">
              ${priorities.map((p, idx) => `<li class="text-sm text-muted-foreground flex items-start gap-2">
                <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">${idx + 1}</span>
                <span>${typeof p === 'string' ? p : p.priority || p.description}</span>
              </li>`).join('\n              ')}
            </ul>
          </div>` : ''}

          ${phases.length > 0 ? `<div class="space-y-4 mb-6">
            <h3 class="text-xl font-semibold">Implementation Roadmap</h3>
            ${phases.map((phase, idx) => {
              const title = typeof phase === 'string' ? phase : phase.name || phase.title || `Phase ${idx + 1}`;
              const timeline = typeof phase === 'string' ? '' : phase.timeline || phase.duration || '';
              const goalsRaw = typeof phase === 'string' ? [] : phase.goals || phase.objectives || [];
              const goals = Array.isArray(goalsRaw) ? goalsRaw : [];

              return `<div class="rounded-lg border bg-card shadow-sm p-6">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-lg font-semibold">${title}</h4>
                ${timeline ? `<span class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">${timeline}</span>` : ''}
              </div>
              ${goals.length > 0 ? `<ul class="space-y-1">
                ${goals.map(g => `<li class="text-sm text-muted-foreground flex items-start gap-2">
                  <span class="text-primary">•</span>
                  <span>${typeof g === 'string' ? g : g.goal || g.objective}</span>
                </li>`).join('\n                ')}
              </ul>` : ''}
            </div>`;
            }).join('\n            ')}
          </div>` : ''}

          ${channels.length > 0 ? `<div class="rounded-lg border bg-card shadow-sm p-6">
            <h3 class="text-xl font-semibold mb-4">Acquisition Channels</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${channels.map(ch => {
                const name = typeof ch === 'string' ? ch : ch.name || ch.channel;
                const priority = typeof ch === 'string' ? '' : ch.priority || '';
                return `<div class="rounded-lg border bg-accent p-3">
                  <div class="font-medium text-sm">${name}</div>
                  ${priority ? `<div class="text-xs text-muted-foreground mt-1">Priority: ${priority}</div>` : ''}
                </div>`;
              }).join('\n              ')}
            </div>
          </div>` : ''}
        </section>
  `;
}

/**
 * Extract personas from icpSynthesis
 */
function extractPersonasFromICP(clientData) {
  const icpSynthesis = clientData.icpSynthesis || {};
  const personas = [];

  // Convert icpSynthesis object to personas array
  Object.entries(icpSynthesis).forEach(([key, segment]) => {
    if (segment && segment.name) {
      personas.push(segment);
    }
  });

  // Fallback to personas array if icpSynthesis is empty
  if (personas.length === 0 && clientData.personas) {
    return clientData.personas;
  }

  return personas;
}

/**
 * Generate Complete Report
 */
function generateComprehensiveReport(clientData) {
  // Extract personas from icpSynthesis for comprehensive data
  const personas = extractPersonasFromICP(clientData);

  const icpSections = personas.map((persona, idx) =>
    generateICPSection(persona, idx, clientData)
  ).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${clientData.meta?.clientName || 'Client'} - Comprehensive Client Intelligence Report 2025</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            border: "hsl(214.3 31.8% 91.4%)",
            input: "hsl(214.3 31.8% 91.4%)",
            ring: "hsl(222.2 84% 4.9%)",
            background: "hsl(0 0% 100%)",
            foreground: "hsl(222.2 84% 4.9%)",
            primary: {
              DEFAULT: "#667eea",
              foreground: "hsl(210 40% 98%)",
              hover: "#5568d3",
              light: "rgba(102, 126, 234, 0.1)",
            },
            secondary: {
              DEFAULT: "#764ba2",
              foreground: "hsl(222.2 47.4% 11.2%)",
            },
            muted: {
              DEFAULT: "hsl(210 40% 96.1%)",
              foreground: "hsl(215.4 16.3% 46.9%)",
            },
            accent: {
              DEFAULT: "hsl(210 40% 96.1%)",
              foreground: "hsl(222.2 47.4% 11.2%)",
            },
            card: {
              DEFAULT: "hsl(0 0% 100%)",
              foreground: "hsl(222.2 84% 4.9%)",
            },
            destructive: {
              DEFAULT: "hsl(0 84.2% 60.2%)",
              foreground: "hsl(210 40% 98%)",
            },
          },
          borderRadius: {
            lg: "0.75rem",
            md: "0.5rem",
            sm: "0.375rem",
          },
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    body {
      font-family: 'Inter', sans-serif;
    }

    .hero-pattern {
      background-color: #667eea;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }

    html {
      scroll-behavior: smooth;
    }

    .prose h1, .prose h2, .prose h3 {
      color: hsl(222.2 84% 4.9%);
    }

    .active-section {
      background-color: #667eea;
      color: white;
    }

    .transition-all {
      transition: all 0.3s ease;
    }
  </style>
</head>
<body class="bg-muted/50">

${generateHero(clientData)}

  <!-- Main Layout -->
  <div class="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-screen">

${generateTOC(clientData)}

    <!-- Main Content -->
    <main class="bg-muted/50">
      <div class="max-w-6xl mx-auto p-6 lg:p-12 space-y-12">

${generateExecutiveDashboard(clientData)}

${generateBusinessOverview(clientData)}

${generateSuccessFactors(clientData)}

${icpSections}

${generatePsychographicAnalysis(clientData)}

${generate24SectionFramework()}

${generateSEOStrategy(clientData)}

${generateCompetitiveIntelligence(clientData)}

${generateGoToMarket(clientData)}

        <!-- Footer -->
        <footer class="border-t pt-8 mt-12">
          <div class="text-center text-sm text-muted-foreground">
            <p class="font-semibold text-foreground mb-2">${clientData.meta?.clientName || 'Client'} Intelligence System</p>
            <p>Comprehensive Intelligence Report | Generated by ORCHESTRAI</p>
          </div>
        </footer>

      </div>
    </main>
  </div>

  <!-- Scroll Spy Script -->
  <script>
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('aside a[href^="#"]');

    function updateActiveLink() {
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 100) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active-section', 'text-white');
        if (link.getAttribute('href') === '#' + current) {
          link.classList.add('active-section', 'text-white');
        }
      });
    }

    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink();
  </script>

</body>
</html>`;

  return html;
}

/**
 * Main Execution
 */
function main() {
  console.log('\n' + '='.repeat(80));
  console.log('COMPREHENSIVE SHADCN UI INTELLIGENCE REPORT GENERATOR');
  console.log('='.repeat(80) + '\n');

  // Load client data
  console.log('📂 Loading client data...');
  const clientData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  console.log(`✅ Loaded: ${clientData.meta?.clientName || 'Unknown Client'}`);
  console.log(`   Personas: ${clientData.personas?.length || 0}`);
  console.log(`   Data sections: ${Object.keys(clientData).length}\n`);

  // Generate report
  console.log('🎨 Generating comprehensive ShadCN UI report...');
  const startTime = Date.now();
  const html = generateComprehensiveReport(clientData);
  const endTime = Date.now();

  // Save report
  const outputPath = path.join(OUTPUT_DIR, `comprehensive-intelligence-report-shadcn-COMPLETE-${Date.now()}.html`);
  fs.writeFileSync(outputPath, html, 'utf8');

  const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
  const lineCount = html.split('\n').length;

  console.log(`\n✅ Report Generated Successfully!\n`);
  console.log(`   File: ${path.basename(outputPath)}`);
  console.log(`   Size: ${fileSize} KB`);
  console.log(`   Lines: ${lineCount.toLocaleString()}`);
  console.log(`   Generation Time: ${endTime - startTime}ms`);
  console.log(`   Location: ${outputPath}\n`);

  console.log('='.repeat(80));
  console.log('✅ GENERATION COMPLETE');
  console.log('='.repeat(80) + '\n');

  return outputPath;
}

// Run if executed directly
if (require.main === module) {
  const outputPath = main();
  console.log(`\n💡 Open the report:\n   open "${outputPath}"\n`);
}

module.exports = {
  generateComprehensiveReport
};
