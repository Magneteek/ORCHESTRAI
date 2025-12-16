/**
 * EXAMPLE GENERATOR
 *
 * Demonstrates how to use templates with real client data
 * Uses Rapid Cold Plunge as an example
 */

const fs = require('fs');
const path = require('path');
const components = require('./component-library');

// Paths
const TEMPLATE_DIR = __dirname;
const RAPID_COLD_PLUNGE_DATA = path.join(__dirname, '../../../..', 'projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/client-intelligence/integrated-client-context.json');
const OUTPUT_DIR = path.join(__dirname, '../../../..', 'projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9/deliverables/client-intelligence');

/**
 * Generate Intelligence Hub for Rapid Cold Plunge
 */
function generateIntelligenceHub() {
  console.log('\n📊 Generating Intelligence Hub...');

  // Load template
  const template = fs.readFileSync(
    path.join(TEMPLATE_DIR, 'intelligence-hub-template.html'),
    'utf8'
  );

  // Load data
  const data = JSON.parse(fs.readFileSync(RAPID_COLD_PLUNGE_DATA, 'utf8'));

  // Generate components
  const metrics = [
    { value: '$4,800-$7,200', label: 'Lifetime Value (LTV)' },
    { value: '$550-$850', label: 'Customer Acquisition Cost' },
    { value: '3', label: 'ICP Segments' },
    { value: data.personas.length, label: 'Total Personas' }
  ];

  const statsGrid = components.generateMetricGrid(metrics);
  const icpCards = components.generateICPGrid(data.personas);

  // Success factors list
  const successFactors = data.executiveSynthesis?.criticalSuccessFactors
    ? `<ul style="font-size: 1.125rem; line-height: 2; color: var(--text-secondary); padding-left: 2rem;">
        ${data.executiveSynthesis.criticalSuccessFactors.map(factor =>
          `<li><strong style="color: ${components.COLORS.primaryPurple};">✓</strong> ${factor}</li>`
        ).join('\n')}
      </ul>`
    : '<p>No success factors data available</p>';

  // Available reports
  const reports = [
    {
      icon: '👥',
      title: 'ICP Deep Dives',
      description: `${data.personas.length} detailed customer profiles with psychographic analysis`,
      filename: '#'
    },
    {
      icon: '🧠',
      title: 'Psychographic Research',
      description: 'Cross-persona behavioral patterns and decision frameworks',
      filename: 'psychographic-research-comprehensive-2025.html'
    },
    {
      icon: '🎯',
      title: 'EOS Framework',
      description: 'Strategic Vision/Traction Organizer and quarterly rocks',
      filename: 'eos-framework-2025.html'
    },
    {
      icon: '🔍',
      title: 'SEO Strategy',
      description: 'Keyword research, content strategy, and optimization roadmap',
      filename: 'seo-strategy-comprehensive-2025.html'
    },
    {
      icon: '📈',
      title: 'Competitive Intelligence',
      description: 'Market analysis, competitor positioning, and opportunities',
      filename: 'competitive-intelligence-2025.html'
    }
  ];

  const reportsSection = components.generateReportsSection(reports);

  // Replace variables
  let html = template
    .replace(/{{CLIENT_NAME}}/g, data.meta?.clientName || 'Rapid Cold Plunge')
    .replace(/{{TAGLINE}}/g, 'Premium Cold Plunge Intelligence Hub')
    .replace(/{{GENERATION_DATE}}/g, new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
    .replace('{{STATS_GRID}}', statsGrid)
    .replace('{{BUSINESS_OVERVIEW}}', data.executiveSynthesis?.whatIsRapidColdPlunge || 'Business overview not available')
    .replace('{{SUCCESS_FACTORS}}', successFactors)
    .replace('{{ICP_CARDS}}', icpCards)
    .replace('{{REPORTS_AVAILABLE}}', reportsSection);

  // Save report
  const outputPath = path.join(OUTPUT_DIR, 'intelligence-hub-2025.html');
  fs.writeFileSync(outputPath, html, 'utf8');

  const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
  console.log(`✅ Intelligence Hub created: ${fileSize} KB`);
  console.log(`   Location: ${outputPath}`);

  return outputPath;
}

/**
 * Generate ICP Deep Dive for a specific persona
 */
function generateICPDeepDive(personaData, clientData) {
  console.log(`\n👤 Generating ICP Deep Dive: ${personaData.name}...`);

  // Load template
  const template = fs.readFileSync(
    path.join(TEMPLATE_DIR, 'icp-deep-dive-template.html'),
    'utf8'
  );

  // Generate components
  const breadcrumb = components.generateBreadcrumb(
    clientData.meta?.clientName || 'Rapid Cold Plunge',
    personaData.name
  );

  const demographicsGrid = components.generateDemographicsGrid(personaData.demographics);

  // Psychographics content
  const psychographicsContent = personaData.psychographics
    ? `<div class="feature-grid">
        ${Object.entries(personaData.psychographics).map(([key, value]) => `
          <div class="feature-card">
            <div class="feature-card-title">${components.toTitleCase(key)}</div>
            <div class="feature-card-content">${Array.isArray(value) ? value.join(', ') : value}</div>
          </div>
        `).join('')}
      </div>`
    : '<p>No psychographic data available</p>';

  const painPoints = components.generatePainPointsList(
    personaData.painPoints || personaData.challenges || []
  );

  const acquisitionTable = components.generateAcquisitionTable(
    personaData.acquisitionChannels || []
  );

  const caseStudies = personaData.caseStudies
    ? personaData.caseStudies.map((study, idx) =>
        components.generateCaseStudy(study, idx)
      ).join('\n')
    : '<p>No case studies available</p>';

  const subSegments = components.generateSubSegments(personaData.subSegments || {});

  // Replace variables
  let html = template
    .replace(/{{CLIENT_NAME}}/g, clientData.meta?.clientName || 'Rapid Cold Plunge')
    .replace(/{{PERSONA_NAME}}/g, personaData.name)
    .replace(/{{REVENUE_WEIGHT}}/g, personaData.revenueWeight || personaData.segment)
    .replace(/{{RELEVANCE_SCORE}}/g, personaData.relevance || '95')
    .replace(/{{GENERATION_DATE}}/g, new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
    .replace('{{BREADCRUMB}}', breadcrumb)
    .replace('{{OVERVIEW_TEXT}}', personaData.description || 'No overview available')
    .replace('{{DEMOGRAPHICS_GRID}}', demographicsGrid)
    .replace('{{PSYCHOGRAPHICS_CONTENT}}', psychographicsContent)
    .replace('{{PAIN_POINTS}}', painPoints)
    .replace('{{ACQUISITION_TABLE}}', acquisitionTable)
    .replace('{{CASE_STUDIES}}', caseStudies)
    .replace('{{SUB_SEGMENTS}}', subSegments);

  // Save report
  const filename = `icp-${components.slugify(personaData.name)}-2025.html`;
  const outputPath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(outputPath, html, 'utf8');

  const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
  console.log(`✅ ICP Deep Dive created: ${fileSize} KB`);
  console.log(`   Location: ${outputPath}`);

  return outputPath;
}

/**
 * Generate all reports for Rapid Cold Plunge
 */
function generateAllReports() {
  console.log('\n' + '='.repeat(80));
  console.log('RAPID COLD PLUNGE - INTELLIGENCE REPORTS GENERATION');
  console.log('='.repeat(80));

  const startTime = Date.now();

  try {
    // Load client data
    const clientData = JSON.parse(fs.readFileSync(RAPID_COLD_PLUNGE_DATA, 'utf8'));

    // Generate intelligence hub
    const hubPath = generateIntelligenceHub();

    // Generate ICP deep dives for each persona
    const icpPaths = clientData.personas.map(persona =>
      generateICPDeepDive(persona, clientData)
    );

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(80));
    console.log('✅ GENERATION COMPLETE');
    console.log(`   Total files: ${1 + icpPaths.length}`);
    console.log(`   Generation time: ${totalTime}s`);
    console.log(`   Output directory: ${OUTPUT_DIR}`);
    console.log('='.repeat(80) + '\n');

    // Verify NO GRADIENTS
    console.log('🔍 Verifying NO GRADIENTS compliance...');
    const allFiles = [hubPath, ...icpPaths];
    let totalGradients = 0;

    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      const gradients = (content.match(/linear-gradient|radial-gradient/g) || []).length;
      totalGradients += gradients;
      console.log(`   ${path.basename(file)}: ${gradients} gradients`);
    });

    if (totalGradients === 0) {
      console.log('\n✅ NO GRADIENTS VERIFIED: All files are gradient-free!');
    } else {
      console.log(`\n⚠️  WARNING: Found ${totalGradients} gradients across all files`);
    }

    return {
      hubPath,
      icpPaths,
      totalTime,
      totalGradients
    };

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    throw error;
  }
}

// Run if executed directly
if (require.main === module) {
  generateAllReports();
}

module.exports = {
  generateIntelligenceHub,
  generateICPDeepDive,
  generateAllReports
};
