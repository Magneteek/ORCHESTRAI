#!/usr/bin/env node

/**
 * BATCH REPORT GENERATION SYSTEM
 *
 * Automatically generates ALL intelligence reports for a client project:
 * 1. Comprehensive Intelligence Report (main overview)
 * 2. ICP Deep Dive Report (detailed customer analysis)
 * 3. Psychographic Research Page (cultural/behavioral insights)
 * 4. SEO Intelligence Dashboard (keyword/competitor analysis)
 * 5. Individual Persona Deep Dives (one per persona)
 *
 * Usage:
 *   node batch-generate-all-reports.js [project-path] [client-name]
 *
 * Example:
 *   node batch-generate-all-reports.js \
 *     /Users/kris/CLAUDEtools/ORCHESTRAI/projects/runchicken-F90DEDB5-25F0-4D32-8138-781C675F5BD3 \
 *     RUNCHICKEN
 */

const fs = require('fs');
const path = require('path');

// Import all report generators
const ComprehensiveReportGenerator = require('../../orchestrai-domains/client-intelligence/templates/comprehensive-intelligence-report-generator');
const ICPDeepDiveGenerator = require('../../orchestrai-domains/client-intelligence/templates/icp-deep-dive-template-generator');
const PsychographicReportGenerator = require('../../orchestrai-domains/client-intelligence/templates/psychographic-research-page-generator');
const SEODashboardGenerator = require('../../orchestrai-domains/seo/templates/seo-intelligence-dashboard-generator');

// Configuration
const REPORT_TYPES = {
  COMPREHENSIVE: 'comprehensive-intelligence-report.html',
  ICP_DEEP_DIVE: 'icp-deep-dive-analysis.html',
  PSYCHOGRAPHIC: 'psychographic-research.html',
  SEO_DASHBOARD: 'seo-intelligence-dashboard.html'
};

class BatchReportGenerator {
  constructor(projectPath, clientName) {
    this.projectPath = projectPath;
    this.clientName = clientName;
    this.dataPath = path.join(projectPath, 'client-intelligence', 'comprehensive-intelligence-aggregated.json');

    // Check for transformed SEO data first (template-compatible format), fall back to original
    const transformedSeoPath = path.join(projectPath, 'deliverables', 'seo', 'keyword-research-transformed.json');
    const originalSeoPath = path.join(projectPath, 'deliverables', 'seo', 'keyword-research.json');
    this.seoDataPath = fs.existsSync(transformedSeoPath) ? transformedSeoPath : originalSeoPath;

    this.deliverablePath = path.join(projectPath, 'deliverables', 'research');

    // Ensure deliverables directory exists
    if (!fs.existsSync(this.deliverablePath)) {
      fs.mkdirSync(this.deliverablePath, { recursive: true });
    }

    // Initialize generators
    this.generators = {
      comprehensive: new ComprehensiveReportGenerator(),
      icpDeepDive: new ICPDeepDiveGenerator(),
      psychographic: new PsychographicReportGenerator(),
      seoDashboard: new SEODashboardGenerator()
    };
  }

  loadData() {
    console.log('📂 Loading intelligence data...');

    if (!fs.existsSync(this.dataPath)) {
      throw new Error(`Intelligence data not found: ${this.dataPath}`);
    }

    this.data = JSON.parse(fs.readFileSync(this.dataPath, 'utf8'));
    console.log('   ✓ Loaded comprehensive intelligence data');

    // Validate personas array
    if (!this.data.personas || !Array.isArray(this.data.personas)) {
      console.log('   ⚠️  WARNING: No personas array found in data');
      this.data.personas = [];
    } else {
      console.log(`   ✓ Personas: ${this.data.personas.length}`);
      // Log each persona name for verification
      this.data.personas.forEach((p, idx) => {
        console.log(`      ${idx + 1}. ${p.name || 'Unnamed Persona'} (${p.percentage || 0}%)`);
      });
    }

    console.log(`   ✓ ICP Sections: ${Object.keys(this.data.icp || {}).length}`);
    console.log(`   ✓ Psychographic Sections: ${Object.keys(this.data.psychographic || {}).length}`);

    // Load SEO data if available
    if (fs.existsSync(this.seoDataPath)) {
      this.seoData = JSON.parse(fs.readFileSync(this.seoDataPath, 'utf8'));
      console.log('   ✓ Loaded SEO research data');
    } else {
      console.log('   ⚠️  No SEO data found (will generate placeholder dashboard)');
      this.seoData = null;
    }

    console.log('');
  }

  generateComprehensiveReport() {
    console.log('📊 Generating Comprehensive Intelligence Report...');

    const html = this.generators.comprehensive.generate(
      this.data,
      this.clientName,
      this.data.personas?.length || 0
    );

    const outputPath = path.join(this.deliverablePath, REPORT_TYPES.COMPREHENSIVE);
    fs.writeFileSync(outputPath, html);

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`   ✓ Generated: ${outputPath}`);
    console.log(`   ✓ File size: ${fileSize} KB`);
    console.log('');

    return outputPath;
  }

  generateICPDeepDive() {
    console.log('🎯 Generating ICP Deep Dive Report...');

    if (!this.data.icp || Object.keys(this.data.icp).length === 0) {
      console.log('   ⚠️  No ICP data found, skipping...');
      console.log('');
      return null;
    }

    const html = this.generators.icpDeepDive.generate(
      this.data.icp,
      this.clientName
    );

    const outputPath = path.join(this.deliverablePath, REPORT_TYPES.ICP_DEEP_DIVE);
    fs.writeFileSync(outputPath, html);

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`   ✓ Generated: ${outputPath}`);
    console.log(`   ✓ File size: ${fileSize} KB`);
    console.log('');

    return outputPath;
  }

  generatePsychographicReport() {
    console.log('🧠 Generating Psychographic Research Page...');

    if (!this.data.psychographic || Object.keys(this.data.psychographic).length === 0) {
      console.log('   ⚠️  No psychographic data found, skipping...');
      console.log('');
      return null;
    }

    const html = this.generators.psychographic.generate(
      this.data,
      this.clientName
    );

    const outputPath = path.join(this.deliverablePath, REPORT_TYPES.PSYCHOGRAPHIC);
    fs.writeFileSync(outputPath, html);

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`   ✓ Generated: ${outputPath}`);
    console.log(`   ✓ File size: ${fileSize} KB`);
    console.log('');

    return outputPath;
  }

  generateSEODashboard() {
    console.log('🔍 Generating SEO Intelligence Dashboard...');

    if (!this.seoData) {
      console.log('   ⚠️  No SEO data found, generating placeholder dashboard...');

      // Create placeholder SEO data structure
      this.seoData = {
        metadata: {
          clientName: this.clientName,
          generatedDate: new Date().toISOString(),
          status: 'Pending Research'
        },
        summary: {
          totalKeywords: 0,
          primaryKeywords: [],
          competitorAnalysis: 'Not yet conducted',
          opportunityScore: 'Pending'
        },
        message: 'SEO research pending. Run seo-keyword-research and seo-competitor-analysis agents to populate this dashboard.'
      };
    }

    const html = this.generators.seoDashboard.generate(
      this.seoData,
      this.clientName
    );

    const outputPath = path.join(this.deliverablePath, REPORT_TYPES.SEO_DASHBOARD);
    fs.writeFileSync(outputPath, html);

    const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
    console.log(`   ✓ Generated: ${outputPath}`);
    console.log(`   ✓ File size: ${fileSize} KB`);
    console.log('');

    return outputPath;
  }

  generatePersonaProfiles() {
    console.log('👥 Generating Individual Persona Profiles...');

    if (!this.data.personas || this.data.personas.length === 0) {
      console.log('   ⚠️  No personas found, skipping...');
      console.log('');
      return [];
    }

    const generatedPersonas = [];
    const totalPersonas = this.data.personas.length;

    this.data.personas.forEach((persona, idx) => {
      const sanitizedName = persona.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const filename = `persona-${sanitizedName}.html`;

      console.log(`   Generating persona ${idx + 1}/${totalPersonas}: ${persona.name}...`);

      // Use ICP Deep Dive generator for comprehensive persona pages
      // Pass the main ICP data, not individual persona data
      const personaTitle = `${persona.name} - ${this.clientName}`;
      const html = this.generators.icpDeepDive.generate(
        this.data.icp,
        personaTitle
      );

      const outputPath = path.join(this.deliverablePath, filename);
      fs.writeFileSync(outputPath, html);

      const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
      console.log(`   ✓ Generated: ${outputPath} (${fileSize} KB)`);

      generatedPersonas.push({
        path: outputPath,
        filename: filename,
        persona: persona,
        size: fileSize + ' KB'
      });
    });

    console.log(`   ✓ Total persona profiles generated: ${generatedPersonas.length}`);

    // Validation: Ensure we generated a page for EVERY persona
    if (generatedPersonas.length !== totalPersonas) {
      console.log(`   ⚠️  WARNING: Mismatch! Expected ${totalPersonas} personas, generated ${generatedPersonas.length} pages`);
    } else {
      console.log(`   ✅ VERIFIED: All ${totalPersonas} personas have individual pages`);
    }

    console.log('');

    return generatedPersonas;
  }

  generateIndexPage(generatedReports, personaProfiles = []) {
    console.log('📑 Generating Report Index Page...');

    const indexHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.clientName} - Intelligence Reports</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 py-12">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mb-8 text-white">
            <h1 class="text-4xl font-bold mb-2">${this.clientName}</h1>
            <p class="text-xl opacity-90">Complete Intelligence Reports</p>
            <p class="text-sm mt-4 opacity-75">Generated: ${new Date().toLocaleString()}</p>
        </div>

        <!-- Report Navigation -->
        <div class="grid md:grid-cols-2 gap-6">
            ${generatedReports.map(report => `
            <a href="${path.basename(report.path)}" class="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow p-6 border-l-4 ${report.borderColor}">
                <div class="flex items-center mb-4">
                    <div class="text-3xl mr-4">${report.icon}</div>
                    <div>
                        <h2 class="text-xl font-bold text-gray-900">${report.title}</h2>
                        <p class="text-sm text-gray-600">${report.description}</p>
                    </div>
                </div>
                <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <span class="text-sm text-gray-500">${report.size}</span>
                    <span class="text-blue-600 font-semibold">View Report →</span>
                </div>
            </a>
            `).join('')}
        </div>

        ${personaProfiles.length > 0 ? `
        <!-- Individual Persona Profiles -->
        <div class="mt-12">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">👥 Individual Persona Profiles</h2>
            <p class="text-gray-600 mb-6">Deep dive into each customer segment with detailed profiles</p>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${personaProfiles.map(profile => `
                <a href="${profile.filename}" class="block bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg shadow-md hover:shadow-xl transition-all p-6 border border-purple-200 hover:border-purple-400">
                    <div class="flex items-center mb-3">
                        <div class="text-4xl mr-3">👤</div>
                        <div class="flex-1">
                            <h3 class="font-bold text-gray-900">${profile.persona.name}</h3>
                            <p class="text-sm text-gray-600">${profile.persona.tagline || 'Customer Persona'}</p>
                        </div>
                    </div>
                    <div class="flex justify-between items-center mt-4 pt-4 border-t border-purple-200">
                        <span class="text-sm font-semibold text-purple-600">${profile.persona.percentage}% of market</span>
                        <span class="text-purple-600 font-semibold text-sm">View Profile →</span>
                    </div>
                </a>
                `).join('')}
            </div>
        </div>
        ` : ''}

        <!-- Data Completeness Summary -->
        <div class="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 class="text-2xl font-bold text-gray-900 mb-4">Data Completeness</h2>
            <div class="grid md:grid-cols-4 gap-4">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                    <div class="text-3xl font-bold text-blue-600">${this.data.personas?.length || 0}</div>
                    <div class="text-sm text-gray-600 mt-1">Personas</div>
                </div>
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                    <div class="text-3xl font-bold text-purple-600">${this.data.icp ? '✓' : '○'}</div>
                    <div class="text-sm text-gray-600 mt-1">ICP Analysis</div>
                </div>
                <div class="text-center p-4 bg-indigo-50 rounded-lg">
                    <div class="text-3xl font-bold text-indigo-600">${this.data.psychographic ? '✓' : '○'}</div>
                    <div class="text-sm text-gray-600 mt-1">Psychographic</div>
                </div>
                <div class="text-center p-4 bg-green-50 rounded-lg">
                    <div class="text-3xl font-bold text-green-600">${this.seoData ? '✓' : '○'}</div>
                    <div class="text-sm text-gray-600 mt-1">SEO Research</div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    const indexPath = path.join(this.deliverablePath, 'index.html');
    fs.writeFileSync(indexPath, indexHTML);

    console.log(`   ✓ Generated: ${indexPath}`);
    console.log('');

    return indexPath;
  }

  generateAll() {
    console.log('='.repeat(80));
    console.log(`${this.clientName} - BATCH REPORT GENERATION`);
    console.log('='.repeat(80));
    console.log('');

    this.loadData();

    const generatedReports = [];

    // 1. Comprehensive Intelligence Report
    const comprehensivePath = this.generateComprehensiveReport();
    if (comprehensivePath) {
      generatedReports.push({
        path: comprehensivePath,
        title: 'Comprehensive Intelligence Report',
        description: 'Complete overview with personas, ICP, market intelligence',
        icon: '📊',
        size: (fs.statSync(comprehensivePath).size / 1024).toFixed(2) + ' KB',
        borderColor: 'border-blue-600'
      });
    }

    // 2. ICP Deep Dive
    const icpPath = this.generateICPDeepDive();
    if (icpPath) {
      generatedReports.push({
        path: icpPath,
        title: 'ICP Deep Dive Analysis',
        description: 'Detailed ideal customer profile with pain points and objections',
        icon: '🎯',
        size: (fs.statSync(icpPath).size / 1024).toFixed(2) + ' KB',
        borderColor: 'border-purple-600'
      });
    }

    // 3. Psychographic Research
    const psychoPath = this.generatePsychographicReport();
    if (psychoPath) {
      generatedReports.push({
        path: psychoPath,
        title: 'Psychographic Research',
        description: 'Cultural values, behavioral patterns, emotional triggers',
        icon: '🧠',
        size: (fs.statSync(psychoPath).size / 1024).toFixed(2) + ' KB',
        borderColor: 'border-indigo-600'
      });
    }

    // 4. SEO Intelligence Dashboard
    const seoPath = this.generateSEODashboard();
    if (seoPath) {
      generatedReports.push({
        path: seoPath,
        title: 'SEO Intelligence Dashboard',
        description: 'Keyword research, competitor analysis, content opportunities',
        icon: '🔍',
        size: (fs.statSync(seoPath).size / 1024).toFixed(2) + ' KB',
        borderColor: 'border-green-600'
      });
    }

    // 5. Individual Persona Profiles
    const personaProfiles = this.generatePersonaProfiles();

    // 6. Generate Index Page (Report Hub)
    const indexPath = this.generateIndexPage(generatedReports, personaProfiles);

    // Summary
    console.log('='.repeat(80));
    console.log('✅ BATCH REPORT GENERATION COMPLETE');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Total Main Reports: ${generatedReports.length}`);
    console.log(`Total Persona Profiles: ${personaProfiles.length}`);
    console.log(`GRAND TOTAL: ${generatedReports.length + personaProfiles.length} intelligence deliverables`);
    console.log(`Report Location: ${this.deliverablePath}`);
    console.log('');
    console.log('Main Intelligence Reports:');
    generatedReports.forEach((report, idx) => {
      console.log(`  ${idx + 1}. ${report.title} (${report.size})`);
    });
    console.log('');

    if (personaProfiles.length > 0) {
      console.log('Individual Persona Profiles:');
      personaProfiles.forEach((profile, idx) => {
        console.log(`  ${idx + 1}. ${profile.persona.name} - ${profile.persona.tagline} (${profile.size}) - ${profile.persona.percentage}% market`);
      });
      console.log('');
    }

    console.log('🏠 START HERE - Report Hub:');
    console.log(`  open "${indexPath}"`);
    console.log('');
    console.log('Direct Links to Main Reports:');
    generatedReports.forEach(report => {
      console.log(`  open "${report.path}"`);
    });

    if (personaProfiles.length > 0) {
      console.log('');
      console.log('Direct Links to Persona Profiles:');
      personaProfiles.forEach(profile => {
        console.log(`  open "${profile.path}"`);
      });
    }

    console.log('');

    return {
      generatedReports,
      personaProfiles,
      indexPath,
      deliverablePath: this.deliverablePath
    };
  }
}

// CLI Execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node batch-generate-all-reports.js [project-path] [client-name]');
    console.error('');
    console.error('Example:');
    console.error('  node batch-generate-all-reports.js \\');
    console.error('    /Users/kris/CLAUDEtools/ORCHESTRAI/projects/runchicken-F90DEDB5-25F0-4D32-8138-781C675F5BD3 \\');
    console.error('    RUNCHICKEN');
    process.exit(1);
  }

  const [projectPath, clientName] = args;

  try {
    const generator = new BatchReportGenerator(projectPath, clientName);
    generator.generateAll();
  } catch (error) {
    console.error('❌ Error generating reports:', error.message);
    process.exit(1);
  }
}

module.exports = BatchReportGenerator;
