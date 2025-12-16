/**
 * STRATEGIC PLANNING HTML REPORT GENERATOR
 *
 * Converts strategic planning deliverables (OPSP, V/TO, Financial Projections)
 * into a beautifully formatted, interactive HTML executive report.
 *
 * Pipeline Flow:
 * 1. Load all strategic planning deliverables (markdown + JSON)
 * 2. Parse and structure data for visualization
 * 3. Generate executive dashboard with:
 *    - Strategic Coherence Scorecard
 *    - One-Page Strategic Plan (OPSP) visual
 *    - Financial Projections charts (24-month runway)
 *    - Unit Economics dashboard (LTV:CAC, payback, margins)
 *    - Quarterly Rocks timeline
 *    - Power of One sensitivity analysis
 * 4. Create self-contained HTML file with Tailwind CSS
 * 5. Save to client deliverables/strategic-planning/ folder
 *
 * Output: Beautiful HTML report ready to present to stakeholders
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');
const StrategicPlanningReport = require('../../../orchestrai-system/templates/html-reports/StrategicPlanningReport');

class StrategicPlanningHTMLReportGenerator extends EventEmitter {
  constructor() {
    super();
    this.pipelineId = 'strategic-planning-html-report';
  }

  /**
   * Generate complete HTML report for strategic planning deliverables
   */
  async generateReport(config) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`STRATEGIC PLANNING HTML REPORT GENERATOR`);
    console.log(`Client: ${config.clientName}`);
    console.log(`${'='.repeat(80)}\n`);

    const startTime = Date.now();

    try {
      // Stage 1: Load all strategic planning deliverables
      console.log('📂 Stage 1: Loading strategic planning deliverables...');
      const data = await this.loadStrategicPlanningData(config.projectPath);
      console.log(`   ✓ Loaded ${Object.keys(data).length} deliverables`);

      // Stage 2: Parse and structure data
      console.log('\n📊 Stage 2: Parsing and structuring data...');
      const structuredData = await this.structureDataForVisualization(data);
      console.log(`   ✓ Structured ${structuredData.sections.length} report sections`);

      // Stage 3: Generate HTML report using new template system
      console.log('\n🎨 Stage 3: Generating HTML report (new template system)...');
      const htmlContent = await this.generateHTMLContent(structuredData, config);
      console.log(`   ✓ Generated ${(htmlContent.length / 1024).toFixed(2)} KB HTML`);

      // Stage 4: Save HTML report
      console.log('\n💾 Stage 4: Saving HTML report...');
      const outputPath = path.join(
        config.projectPath,
        'deliverables/strategic-planning',
        `strategic-plan-executive-report-${Date.now()}.html`
      );
      await fs.writeFile(outputPath, htmlContent, 'utf8');
      const stats = await fs.stat(outputPath);
      console.log(`   ✓ Saved to: ${outputPath}`);
      console.log(`   ✓ File size: ${(stats.size / 1024).toFixed(2)} KB`);

      const totalTime = Date.now() - startTime;

      console.log(`\n✅ HTML REPORT GENERATION COMPLETE`);
      console.log(`   Duration: ${(totalTime / 1000).toFixed(2)}s`);
      console.log(`   Output: ${outputPath}\n`);

      return {
        success: true,
        htmlPath: outputPath,
        fileSize: stats.size,
        duration: totalTime
      };

    } catch (error) {
      console.error('\n❌ HTML Report Generation Failed:', error.message);
      throw error;
    }
  }

  /**
   * Load all strategic planning deliverables
   */
  async loadStrategicPlanningData(projectPath) {
    const basePath = path.join(projectPath, 'deliverables/strategic-planning');
    const data = {};

    // Load financial projections JSON
    try {
      const financialPath = path.join(basePath, 'financial-projections.json');
      const financialContent = await fs.readFile(financialPath, 'utf8');
      data.financialProjections = JSON.parse(financialContent);
    } catch (e) {
      console.log('   ⚠️  financial-projections.json not found');
    }

    // Load strategic coherence analysis
    try {
      const coherencePath = path.join(basePath, 'strategic-coherence-analysis.md');
      data.coherenceAnalysis = await fs.readFile(coherencePath, 'utf8');
    } catch (e) {
      console.log('   ⚠️  strategic-coherence-analysis.md not found');
    }

    // Load OPSP
    try {
      const opspPath = path.join(basePath, 'one-page-strategic-plan.md');
      data.opsp = await fs.readFile(opspPath, 'utf8');
    } catch (e) {
      console.log('   ⚠️  one-page-strategic-plan.md not found');
    }

    // Load V/TO
    try {
      const vtoPath = path.join(basePath, 'eos-vision-traction-organizer.md');
      data.vto = await fs.readFile(vtoPath, 'utf8');
    } catch (e) {
      console.log('   ⚠️  eos-vision-traction-organizer.md not found');
    }

    // Load strategic narrative
    try {
      const narrativePath = path.join(basePath, 'strategic-narrative.md');
      data.strategicNarrative = await fs.readFile(narrativePath, 'utf8');
    } catch (e) {
      console.log('   ⚠️  strategic-narrative.md not found');
    }

    return data;
  }

  /**
   * Structure data for visualization
   */
  async structureDataForVisualization(data) {
    const structured = {
      sections: [],
      charts: [],
      dashboards: []
    };

    // Extract strategic coherence score
    if (data.coherenceAnalysis) {
      const scoreMatch = data.coherenceAnalysis.match(/Strategic Coherence Score:\s*(\d+)\/100/i);
      if (scoreMatch) {
        structured.coherenceScore = parseInt(scoreMatch[1]);
      }
    }

    // Extract financial metrics
    if (data.financialProjections) {
      structured.financialMetrics = {
        unitEconomics: data.financialProjections.unitEconomics || {},
        breakEven: data.financialProjections.breakEven || {},
        scenarios: data.financialProjections.scenarios || {},
        powerOfOne: data.financialProjections.powerOfOne || {},
        monthlyProjections: data.financialProjections.monthlyProjections || []
      };
    }

    // Extract quarterly rocks from OPSP
    if (data.opsp) {
      const rocksSection = data.opsp.match(/### Quarterly Rocks[\s\S]*?(?=###|$)/);
      if (rocksSection) {
        structured.quarterlyRocks = this.parseQuarterlyRocks(rocksSection[0]);
      }
    }

    // Extract strategic priorities
    if (data.opsp) {
      const prioritiesSection = data.opsp.match(/### (?:3-7|7) Strategic Priorities[\s\S]*?(?=###|$)/);
      if (prioritiesSection) {
        structured.strategicPriorities = this.parseStrategicPriorities(prioritiesSection[0]);
      }
    }

    // Define report sections
    structured.sections = [
      { id: 'executive-summary', title: 'Executive Summary', data: data.strategicNarrative },
      { id: 'coherence-scorecard', title: 'Strategic Coherence', data: structured.coherenceScore },
      { id: 'financial-dashboard', title: 'Financial Projections', data: structured.financialMetrics },
      { id: 'opsp', title: 'One-Page Strategic Plan', data: data.opsp },
      { id: 'quarterly-rocks', title: 'Q1 2026 Rocks', data: structured.quarterlyRocks },
      { id: 'unit-economics', title: 'Unit Economics', data: structured.financialMetrics?.unitEconomics },
      { id: 'power-of-one', title: 'Power of One Analysis', data: structured.financialMetrics?.powerOfOne }
    ];

    return structured;
  }

  /**
   * Parse quarterly rocks from markdown
   */
  parseQuarterlyRocks(rocksText) {
    const rocks = [];
    const rockMatches = rocksText.matchAll(/\*\*Rock #\d+: (.*?)\*\*/g);

    for (const match of rockMatches) {
      rocks.push(match[1].trim());
    }

    return rocks;
  }

  /**
   * Parse strategic priorities from markdown
   */
  parseStrategicPriorities(prioritiesText) {
    const priorities = [];
    const priorityMatches = prioritiesText.matchAll(/\*\*Priority #\d+: (.*?)\*\*/g);

    for (const match of priorityMatches) {
      priorities.push(match[1].trim());
    }

    return priorities;
  }

  /**
   * Generate complete HTML content using new template system
   */
  async generateHTMLContent(structuredData, config) {
    // Initialize new template system
    const reportTemplate = new StrategicPlanningReport();

    // Prepare data for template
    const reportData = {
      header: {
        title: `${config.clientName} Strategic Plan`,
        subtitle: 'Executive Report & Financial Projections',
        metadata: {
          coherenceScore: structuredData.coherenceScore || 0
        }
      },
      coherenceScore: structuredData.coherenceScore || 0,
      financialMetrics: structuredData.financialMetrics || {},
      strategicPriorities: structuredData.strategicPriorities || [],
      quarterlyRocks: structuredData.quarterlyRocks || []
    };

    // Prepare report configuration
    const reportConfig = {
      clientName: config.clientName,
      reportType: 'strategic',
      title: `${config.clientName} Strategic Plan`,
      reportDate: new Date().toLocaleDateString(),
      sections: [
        { id: 'coherence-scorecard', title: 'Strategic Coherence', navTitle: 'Coherence' },
        { id: 'unit-economics', title: 'Unit Economics', navTitle: 'Economics' },
        { id: 'financial-projections', title: 'Financial Runway', navTitle: 'Financials' },
        { id: 'strategic-priorities', title: 'Strategic Priorities', navTitle: 'Priorities' },
        { id: 'quarterly-rocks', title: 'Q1 2026 Rocks', navTitle: 'Rocks' },
        { id: 'power-of-one', title: 'Power of One', navTitle: 'Power of 1' }
      ]
    };

    // Generate HTML using template
    const html = reportTemplate.generate(reportData, reportConfig);

    return html;
  }
}

module.exports = StrategicPlanningHTMLReportGenerator;

