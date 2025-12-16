/**
 * COMPREHENSIVE SINGLE-PAGE GENERATOR
 *
 * Generates complete intelligence report with ALL sections in one page
 */

const fs = require('fs');
const path = require('path');
const components = require('./component-library');

// Paths
const TEMPLATE_DIR = __dirname;
const RAPID_COLD_PLUNGE_DATA = path.join(__dirname, '../../../..', 'projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/client-intelligence/integrated-client-context.json');
const OUTPUT_DIR = path.join(__dirname, '../../../..', 'projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/deliverables/client-intelligence');

/**
 * Generate complete ICP section for a persona
 */
function generateICPSection(persona, index, clientName) {
  const slug = components.slugify(persona.name);
  const sectionId = `icp-${slug}`;

  return `
<section id="${sectionId}" class="content-section">
    <!-- ICP Header -->
    <div class="icp-section-header">
        <div class="icp-section-title">${persona.name}</div>
        <div class="icp-section-meta">
            <span class="icp-badge">${persona.revenueWeight || persona.segment} Revenue</span>
            <span class="icp-badge">${persona.relevance || '95'}% Relevance</span>
            <span class="icp-badge">Segment ${index + 1} of {{PERSONA_COUNT}}</span>
        </div>
    </div>

    <!-- ICP Content -->
    <div style="padding: var(--space-12);">

        <!-- Overview -->
        <div style="margin-bottom: var(--space-10);">
            <h3 style="font-size: var(--font-3xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--space-4);">
                📋 Overview
            </h3>
            <p style="font-size: 1.125rem; line-height: 1.75; color: var(--text-secondary);">
                ${persona.description || 'No description available'}
            </p>
        </div>

        <!-- Demographics -->
        <div style="margin-bottom: var(--space-10);">
            <h3 style="font-size: var(--font-3xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--space-6);">
                📊 Demographics
            </h3>
            ${components.generateDemographicsGrid(persona.demographics)}
        </div>

        <!-- Psychographics -->
        ${persona.psychographics ? `
        <div style="margin-bottom: var(--space-10);">
            <h3 style="font-size: var(--font-3xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--space-6);">
                🧠 Psychographics
            </h3>
            <div class="feature-grid">
                ${Object.entries(persona.psychographics).map(([key, value]) => `
                    <div class="feature-card">
                        <div class="feature-card-title">${components.toTitleCase(key)}</div>
                        <div class="feature-card-content">${Array.isArray(value) ? value.join(', ') : value}</div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Pain Points -->
        ${persona.painPoints || persona.challenges ? `
        <div style="margin-bottom: var(--space-10);">
            <h3 style="font-size: var(--font-3xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--space-6);">
                ⚠️ Pain Points & Challenges
            </h3>
            ${components.generatePainPointsList(persona.painPoints || persona.challenges || [])}
        </div>
        ` : ''}

        <!-- Acquisition Channels -->
        ${persona.acquisitionChannels ? `
        <div style="margin-bottom: var(--space-10);">
            <h3 style="font-size: var(--font-3xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--space-6);">
                📈 Acquisition Channels
            </h3>
            ${components.generateAcquisitionTable(persona.acquisitionChannels)}
        </div>
        ` : ''}

        <!-- Case Studies -->
        ${persona.caseStudies && persona.caseStudies.length > 0 ? `
        <div style="margin-bottom: var(--space-10);">
            <h3 style="font-size: var(--font-3xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--space-6);">
                💼 Case Studies
            </h3>
            ${persona.caseStudies.map((study, idx) => components.generateCaseStudy(study, idx)).join('\n')}
        </div>
        ` : ''}

        <!-- Sub-Segments -->
        ${persona.subSegments && Object.keys(persona.subSegments).length > 0 ? `
        <div style="margin-bottom: var(--space-10);">
            <h3 style="font-size: var(--font-3xl); font-weight: var(--font-bold); color: var(--text-primary); margin-bottom: var(--space-6);">
                🎯 Sub-Segments
            </h3>
            ${components.generateSubSegments(persona.subSegments)}
        </div>
        ` : ''}

    </div>
</section>
  `;
}

/**
 * Generate TOC links for all ICPs
 */
function generateTOCLinks(personas) {
  return personas.map((persona, index) => {
    const slug = components.slugify(persona.name);
    return `
<a href="#icp-${slug}" class="toc-link">👤 ${persona.name}</a>
<a href="#icp-${slug}" class="toc-link sub-link">📋 Overview</a>
<a href="#icp-${slug}" class="toc-link sub-link">📊 Demographics</a>
<a href="#icp-${slug}" class="toc-link sub-link">⚠️ Pain Points</a>
    `.trim();
  }).join('\n');
}

/**
 * Generate psychographic content
 */
function generatePsychographicContent(data) {
  if (!data.personas || data.personas.length === 0) {
    return '<p>No psychographic data available</p>';
  }

  return `
    <div class="info-box">
        <div class="info-box-title">Cross-Persona Analysis</div>
        <div class="info-box-content">
            Comparative behavioral analysis across all ${data.personas.length} customer segments
        </div>
    </div>

    <div style="margin-top: var(--space-10);">
        <h3 style="font-size: var(--font-2xl); font-weight: var(--font-bold); margin-bottom: var(--space-6);">Persona Comparison Matrix</h3>
        ${data.personas.map((persona, idx) => `
            <div class="feature-card" style="margin-bottom: var(--space-6);">
                <div class="feature-card-title" style="color: ${components.COLORS.primaryPurple};">
                    ${persona.name} (${persona.revenueWeight || persona.segment})
                </div>
                <div class="feature-card-content">
                    ${persona.description}
                </div>
                ${persona.psychographics ? `
                    <div style="margin-top: var(--space-4); padding-top: var(--space-4); border-top: 1px solid var(--border-light);">
                        <strong>Key Traits:</strong>
                        ${Object.entries(persona.psychographics).slice(0, 3).map(([key, value]) =>
                            `<span class="badge badge-purple" style="margin: 0.25rem;">${components.toTitleCase(key)}</span>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        `).join('')}
    </div>
  `;
}

/**
 * Generate EOS Framework content
 */
function generateEOSContent(data) {
  const eos = data.operationalPriorities || data.strategicContext || {};

  return `
    <div class="info-box" style="margin-bottom: var(--space-8);">
        <div class="info-box-title">Vision/Traction Organizer (V/TO)</div>
        <div class="info-box-content">
            Strategic framework for ${data.meta?.clientName || 'the business'} based on EOS methodology
        </div>
    </div>

    <div class="feature-grid" style="margin-bottom: var(--space-10);">
        <div class="feature-card">
            <div class="feature-card-title">🎯 10-Year Target</div>
            <div class="feature-card-content">
                ${data.executiveSynthesis?.tenYearVision || 'Vision not yet defined'}
            </div>
        </div>

        <div class="feature-card">
            <div class="feature-card-title">📅 3-Year Picture</div>
            <div class="feature-card-content">
                ${eos.threeYearPicture || data.strategicContext?.businessPriorities?.slice(0, 3).join(', ') || 'Planning in progress'}
            </div>
        </div>

        <div class="feature-card">
            <div class="feature-card-title">🔑 Core Values</div>
            <div class="feature-card-content">
                ${eos.coreValues || data.executiveSynthesis?.criticalSuccessFactors?.slice(0, 2).join(', ') || 'Values being defined'}
            </div>
        </div>

        <div class="feature-card">
            <div class="feature-card-title">⚡ Quarterly Rocks</div>
            <div class="feature-card-content">
                ${eos.quarterlyRocks || data.strategicContext?.businessPriorities?.slice(0, 3).join(' • ') || 'Priorities being set'}
            </div>
        </div>
    </div>

    ${data.strategicContext?.businessPriorities ? `
    <h3 style="font-size: var(--font-2xl); font-weight: var(--font-bold); margin-bottom: var(--space-6);">Strategic Priorities</h3>
    <ul style="font-size: 1.125rem; line-height: 2; color: var(--text-secondary); padding-left: 2rem;">
        ${data.strategicContext.businessPriorities.map(priority =>
            `<li><strong style="color: ${components.COLORS.primaryPurple};">✓</strong> ${priority}</li>`
        ).join('\n')}
    </ul>
    ` : ''}
  `;
}

/**
 * Generate SEO Strategy content
 */
function generateSEOContent(data) {
  const seo = data.seoAndContentStrategy || {};

  return `
    <div class="info-box" style="margin-bottom: var(--space-8);">
        <div class="info-box-title">SEO & Content Strategy</div>
        <div class="info-box-content">
            Keyword research, content pillars, and optimization roadmap
        </div>
    </div>

    <div class="feature-grid">
        <div class="feature-card">
            <div class="feature-card-title">🔍 Primary Keywords</div>
            <div class="feature-card-content">
                ${seo.primaryKeywords?.join(', ') || 'Keyword research in progress'}
            </div>
        </div>

        <div class="feature-card">
            <div class="feature-card-title">📝 Content Pillars</div>
            <div class="feature-card-content">
                ${seo.contentPillars?.join(', ') || 'Content strategy being developed'}
            </div>
        </div>

        <div class="feature-card">
            <div class="feature-card-title">🎯 Target Audience</div>
            <div class="feature-card-content">
                ${data.personas?.map(p => p.name).join(', ') || 'Audience segments'}
            </div>
        </div>

        <div class="feature-card">
            <div class="feature-card-title">📈 Optimization Focus</div>
            <div class="feature-card-content">
                ${seo.optimizationFocus || 'Technical SEO, content quality, link building'}
            </div>
        </div>
    </div>

    ${seo.contentStrategy ? `
    <div style="margin-top: var(--space-10);">
        <h3 style="font-size: var(--font-2xl); font-weight: var(--font-bold); margin-bottom: var(--space-6);">Content Strategy</h3>
        <p style="font-size: 1.125rem; line-height: 1.75; color: var(--text-secondary);">
            ${seo.contentStrategy}
        </p>
    </div>
    ` : ''}
  `;
}

/**
 * Generate Competitive Intelligence content
 */
function generateCompetitiveContent(data) {
  const market = data.marketIntelligence || {};
  const competitive = data.strategicContext?.competitiveAdvantages || [];

  return `
    <div class="info-box" style="margin-bottom: var(--space-8);">
        <div class="info-box-title">Market & Competitive Analysis</div>
        <div class="info-box-content">
            ${market.marketOverview || 'Comprehensive market analysis and competitive positioning'}
        </div>
    </div>

    <div class="metric-grid" style="margin-bottom: var(--space-10);">
        ${components.generateMetricCard(market.marketSize || 'TBD', 'Market Size', 'primary')}
        ${components.generateMetricCard(market.growthRate || 'TBD', 'Growth Rate', 'secondary')}
        ${components.generateMetricCard(market.competitors?.length || 'TBD', 'Key Competitors', 'primary')}
        ${components.generateMetricCard(market.marketShare || 'TBD', 'Market Share', 'secondary')}
    </div>

    ${competitive.length > 0 ? `
    <h3 style="font-size: var(--font-2xl); font-weight: var(--font-bold); margin-bottom: var(--space-6);">Competitive Advantages</h3>
    <div class="feature-grid">
        ${competitive.map((advantage, idx) => `
            <div class="feature-card">
                <div class="feature-card-title" style="color: ${components.COLORS.success};">✓ Advantage ${idx + 1}</div>
                <div class="feature-card-content">${advantage}</div>
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${data.strategicContext?.primaryChallenges ? `
    <div style="margin-top: var(--space-10);">
        <h3 style="font-size: var(--font-2xl); font-weight: var(--font-bold); margin-bottom: var(--space-6);">Market Challenges</h3>
        <ul style="font-size: 1.125rem; line-height: 2; color: var(--text-secondary); padding-left: 2rem;">
            ${data.strategicContext.primaryChallenges.map(challenge =>
                `<li><strong style="color: ${components.COLORS.warning};">⚠️</strong> ${challenge}</li>`
            ).join('\n')}
        </ul>
    </div>
    ` : ''}
  `;
}

/**
 * Generate Complete Comprehensive Report
 */
function generateComprehensiveReport(clientData) {
  console.log('\n📊 Generating Comprehensive Single-Page Intelligence Report...');

  // Load template
  const template = fs.readFileSync(
    path.join(TEMPLATE_DIR, 'comprehensive-intelligence-template.html'),
    'utf8'
  );

  // Generate all sections
  const metrics = [
    { value: clientData.unitEconomicsAndFinancials?.ltv || '$4,800-$7,200', label: 'Lifetime Value (LTV)' },
    { value: clientData.unitEconomicsAndFinancials?.cac || '$550-$850', label: 'Customer Acquisition Cost' },
    { value: clientData.personas.length.toString(), label: 'ICP Segments' },
    { value: (clientData.marketIntelligence?.marketSize || 'TBD'), label: 'Market Size' }
  ];

  const statsGrid = components.generateMetricGrid(metrics);

  const successFactors = clientData.executiveSynthesis?.criticalSuccessFactors
    ? `<ul style="font-size: 1.125rem; line-height: 2; color: var(--text-secondary); padding-left: 2rem;">
        ${clientData.executiveSynthesis.criticalSuccessFactors.map(factor =>
          `<li><strong style="color: ${components.COLORS.primaryPurple};">✓</strong> ${factor}</li>`
        ).join('\n')}
      </ul>`
    : '<p>No success factors data available</p>';

  // Generate all ICP sections
  const icpSections = clientData.personas.map((persona, index) =>
    generateICPSection(persona, index, clientData.meta?.clientName)
  ).join('\n');

  // Generate TOC links for ICPs
  const tocICPLinks = generateTOCLinks(clientData.personas);

  // Generate strategic sections
  const psychographicContent = generatePsychographicContent(clientData);
  const eosContent = generateEOSContent(clientData);
  const seoContent = generateSEOContent(clientData);
  const competitiveContent = generateCompetitiveContent(clientData);

  // Replace all variables
  let html = template
    .replace(/{{CLIENT_NAME}}/g, clientData.meta?.clientName || 'Client')
    .replace(/{{TAGLINE}}/g, 'Comprehensive Intelligence Report 2025')
    .replace(/{{GENERATION_DATE}}/g, new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
    .replace(/{{PERSONA_COUNT}}/g, clientData.personas.length.toString())
    .replace('{{STATS_GRID}}', statsGrid)
    .replace('{{BUSINESS_OVERVIEW}}', clientData.executiveSynthesis?.whatIsRapidColdPlunge || clientData.business?.overview || 'Business overview not available')
    .replace('{{SUCCESS_FACTORS}}', successFactors)
    .replace('{{TOC_ICP_LINKS}}', tocICPLinks)
    .replace('{{ICP_SECTIONS}}', icpSections)
    .replace('{{PSYCHOGRAPHIC_CONTENT}}', psychographicContent)
    .replace('{{EOS_CONTENT}}', eosContent)
    .replace('{{SEO_CONTENT}}', seoContent)
    .replace('{{COMPETITIVE_CONTENT}}', competitiveContent);

  return html;
}

/**
 * Generate and save comprehensive report
 */
function generateAndSave() {
  console.log('\n' + '='.repeat(80));
  console.log('RAPID COLD PLUNGE - COMPREHENSIVE SINGLE-PAGE REPORT');
  console.log('='.repeat(80));

  const startTime = Date.now();

  try {
    // Load client data
    const clientData = JSON.parse(fs.readFileSync(RAPID_COLD_PLUNGE_DATA, 'utf8'));

    // Generate comprehensive report
    const html = generateComprehensiveReport(clientData);

    // Save report
    const outputPath = path.join(OUTPUT_DIR, 'comprehensive-intelligence-report-2025.html');
    fs.writeFileSync(outputPath, html, 'utf8');

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n✅ GENERATION COMPLETE');
    console.log(`   File: comprehensive-intelligence-report-2025.html`);
    console.log(`   Size: ${fileSize} KB`);
    console.log(`   Time: ${totalTime}s`);
    console.log(`   Location: ${outputPath}`);

    // Verify NO GRADIENTS
    console.log('\n🔍 Verifying NO GRADIENTS compliance...');
    const gradients = (html.match(/linear-gradient|radial-gradient/g) || []).length;
    console.log(`   Gradients found: ${gradients}`);

    if (gradients === 0) {
      console.log('\n✅ NO GRADIENTS VERIFIED: Report is gradient-free!');
    } else {
      console.log(`\n⚠️  WARNING: Found ${gradients} gradients`);
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ SUCCESS - Comprehensive Report Ready');
    console.log('='.repeat(80) + '\n');

    return outputPath;

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  generateAndSave();
}

module.exports = {
  generateComprehensiveReport,
  generateAndSave
};
