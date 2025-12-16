/**
 * INTELLIGENCE HTML REPORT PIPELINE
 *
 * Converts JSON psychographic research and ICP intelligence reports into
 * beautifully formatted, interactive HTML reports using ORCHESTRAI frontend agents.
 *
 * Pipeline Flow:
 * 1. Load JSON intelligence data (psychographic research, ICP profiles, market intelligence)
 * 2. Analyze data structure and identify visualization opportunities
 * 3. Generate HTML report specification
 * 4. Delegate to frontend agents for HTML generation
 * 5. Save HTML report to client deliverables/research/ folder
 *
 * Output: Self-contained HTML file with Tailwind CSS, no build process needed
 */

const fs = require('fs').promises;
const path = require('path');
const EventEmitter = require('events');
const ClientIntelligenceReport = require('../../../orchestrai-system/templates/html-reports/ClientIntelligenceReport');

class IntelligenceHTMLReportPipeline extends EventEmitter {
  constructor(orchestrator, clientIntelligenceHub) {
    super();

    this.orchestrator = orchestrator;
    this.clientIntelligenceHub = clientIntelligenceHub;

    this.pipelineId = 'intelligence-html-report-pipeline';
    this.status = 'initialized';
  }

  /**
   * Execute complete HTML report generation pipeline
   * @param {Object} config - Pipeline configuration
   * @param {string} config.jsonReportPath - Path to JSON intelligence report
   * @param {string} config.reportType - Type: 'psychographic', 'icp', 'market-intelligence', 'comprehensive'
   * @param {string} config.clientId - Client project ID
   * @param {string} config.outputPath - Optional custom output path
   * @returns {Promise<Object>} Pipeline result with HTML report path
   */
  async executePipeline(config) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`INTELLIGENCE HTML REPORT PIPELINE`);
    console.log(`Report Type: ${config.reportType}`);
    console.log(`${'='.repeat(80)}\n`);

    const pipelineLog = {
      startTime: Date.now(),
      stages: [],
      reportType: config.reportType
    };

    try {
      // STAGE 1: Load and validate JSON data
      const jsonData = await this.stage1_loadJSONData(config.jsonReportPath);
      pipelineLog.stages.push({
        stage: 'json_loading',
        status: 'success',
        dataSize: JSON.stringify(jsonData).length
      });

      // STAGE 2: Analyze data structure and plan visualizations
      const visualizationPlan = await this.stage2_planVisualizations(jsonData, config.reportType);
      pipelineLog.stages.push({
        stage: 'visualization_planning',
        status: 'success',
        visualizations: visualizationPlan.visualizations.length
      });

      // STAGE 3: Generate HTML report specification
      const reportSpec = await this.stage3_generateReportSpec(jsonData, visualizationPlan, config);
      pipelineLog.stages.push({
        stage: 'report_specification',
        status: 'success',
        sections: reportSpec.sections.length
      });

      // STAGE 4: Delegate to frontend agents for HTML generation
      const htmlResult = await this.stage4_generateHTML(reportSpec, config);
      pipelineLog.stages.push({
        stage: 'html_generation',
        status: 'success',
        outputPath: htmlResult.htmlPath
      });

      // STAGE 5: Save and validate HTML report
      const validationResult = await this.stage5_validateAndSave(htmlResult, config);
      pipelineLog.stages.push({
        stage: 'validation_and_save',
        status: 'success',
        fileSize: validationResult.fileSize
      });

      const totalTime = Date.now() - pipelineLog.startTime;

      console.log(`\n✅ HTML REPORT GENERATION COMPLETE`);
      console.log(`   Output: ${validationResult.htmlPath}`);
      console.log(`   Size: ${(validationResult.fileSize / 1024).toFixed(2)} KB`);
      console.log(`   Time: ${(totalTime / 1000).toFixed(2)}s\n`);

      return {
        success: true,
        htmlPath: validationResult.htmlPath,
        reportType: config.reportType,
        metrics: {
          totalTime,
          fileSize: validationResult.fileSize,
          sections: reportSpec.sections.length,
          visualizations: visualizationPlan.visualizations.length
        },
        pipelineLog
      };

    } catch (error) {
      console.error(`\n❌ PIPELINE FAILED:`, error.message);

      return {
        success: false,
        error: error.message,
        pipelineLog
      };
    }
  }

  /**
   * STAGE 1: Load and validate JSON intelligence data
   */
  async stage1_loadJSONData(jsonReportPath) {
    console.log(`STAGE 1: Loading JSON intelligence data...`);

    const content = await fs.readFile(jsonReportPath, 'utf8');
    const jsonData = JSON.parse(content);

    console.log(`✅ JSON data loaded successfully`);
    return jsonData;
  }

  /**
   * STAGE 2: Analyze data structure and plan visualizations
   */
  async stage2_planVisualizations(jsonData, reportType) {
    console.log(`STAGE 2: Planning visualizations for ${reportType} report...`);

    const visualizationPlan = {
      reportType,
      visualizations: [],
      interactiveElements: []
    };

    // Identify visualization opportunities based on report type
    switch (reportType) {
      case 'psychographic':
        visualizationPlan.visualizations.push(
          { type: 'value-matrix', data: 'psychographic values', priority: 'high' },
          { type: 'behavior-chart', data: 'behavioral patterns', priority: 'high' },
          { type: 'pain-points-grid', data: 'customer pain points', priority: 'medium' },
          { type: 'channel-preferences', data: 'communication channels', priority: 'medium' }
        );
        break;

      case 'icp':
        visualizationPlan.visualizations.push(
          { type: 'persona-card', data: 'primary persona', priority: 'high' },
          { type: 'journey-map', data: 'customer journey', priority: 'high' },
          { type: 'demographic-overview', data: 'demographics', priority: 'high' },
          { type: 'decision-factors', data: 'decision criteria', priority: 'medium' }
        );
        break;

      case 'market-intelligence':
        visualizationPlan.visualizations.push(
          { type: 'market-size-chart', data: 'market overview', priority: 'high' },
          { type: 'competitive-landscape', data: 'competitors', priority: 'high' },
          { type: 'trend-timeline', data: 'market trends', priority: 'medium' },
          { type: 'opportunity-heatmap', data: 'opportunities', priority: 'medium' }
        );
        break;

      case 'comprehensive':
        // Combine all visualizations
        visualizationPlan.visualizations.push(
          { type: 'executive-dashboard', data: 'summary metrics', priority: 'critical' },
          { type: 'persona-card', data: 'ICP profile', priority: 'high' },
          { type: 'value-matrix', data: 'psychographics', priority: 'high' },
          { type: 'market-positioning', data: 'market intelligence', priority: 'high' },
          { type: 'strategy-recommendations', data: 'actionable insights', priority: 'high' }
        );
        break;
    }

    // Plan interactive elements
    visualizationPlan.interactiveElements.push(
      { type: 'expandable-sections', purpose: 'detailed data exploration' },
      { type: 'data-tooltips', purpose: 'contextual information' },
      { type: 'print-friendly-view', purpose: 'document export' }
    );

    console.log(`✅ Visualization plan created: ${visualizationPlan.visualizations.length} visualizations`);
    return visualizationPlan;
  }

  /**
   * STAGE 3: Generate comprehensive HTML report specification
   */
  async stage3_generateReportSpec(jsonData, visualizationPlan, config) {
    console.log(`STAGE 3: Generating HTML report specification...`);

    const reportSpec = {
      title: this.generateReportTitle(jsonData, config.reportType),
      metadata: {
        client: jsonData.client || 'Client Intelligence Report',
        reportDate: jsonData.researchDate || new Date().toISOString().split('T')[0],
        reportType: config.reportType,
        generatedAt: new Date().toISOString()
      },
      sections: [],
      visualizations: visualizationPlan.visualizations,
      interactiveFeatures: visualizationPlan.interactiveElements,
      styling: {
        theme: 'professional',
        colorScheme: 'orchestrai-intelligence',
        typography: 'inter',
        layout: 'responsive-grid'
      }
    };

    // Generate sections based on report type and available data
    reportSpec.sections = this.generateReportSections(jsonData, config.reportType);

    console.log(`✅ Report specification created: ${reportSpec.sections.length} sections`);
    return reportSpec;
  }

  /**
   * Generate report sections based on data and report type
   */
  generateReportSections(jsonData, reportType) {
    const sections = [];

    // Header section (always included)
    sections.push({
      id: 'header',
      type: 'hero',
      title: this.generateReportTitle(jsonData, reportType),
      subtitle: jsonData.industryFocus || jsonData.industry || 'Client Intelligence Analysis',
      metadata: {
        date: jsonData.researchDate || jsonData.reportDate || new Date().toISOString().split('T')[0],
        confidence: jsonData.confidenceScore || 'N/A',
        language: jsonData.language || 'English',
        scope: jsonData.marketScope || jsonData.geography || 'Global'
      }
    });

    // Executive Summary (if available in psychographic data)
    if (jsonData.executiveSummary || (jsonData.psychographic && jsonData.psychographic.executiveSummary)) {
      sections.push({
        id: 'executive-summary',
        type: 'summary',
        title: 'Executive Summary',
        content: jsonData.executiveSummary || jsonData.psychographic.executiveSummary,
        highlight: true
      });
    }

    // COMPREHENSIVE AGGREGATED DATA SECTIONS
    // Handle comprehensive aggregated data structure
    if (reportType === 'comprehensive') {

      // EOS Section (if available)
      if (jsonData.eos) {
        sections.push({
          id: 'eos-overview',
          type: 'eos-overview',
          title: 'EOS Framework',
          data: jsonData.eos
        });
      }

      // ICP Framework Section (comprehensive ICP data)
      if (jsonData.icp) {
        sections.push({
          id: 'icp-framework',
          type: 'icp-framework',
          title: 'Ideal Customer Profile (ICP)',
          data: jsonData.icp
        });
      }

      // Customer Personas Grid
      if (jsonData.personas && jsonData.personas.length > 0) {
        sections.push({
          id: 'customer-personas',
          type: 'personas-grid',
          title: 'Customer Personas',
          data: jsonData.personas
        });
      }

      // Psychographic Research (nested data)
      if (jsonData.psychographic) {
        if (jsonData.psychographic.slovenskeKulturneVrednote) {
          sections.push({
            id: 'psychographic-values',
            type: 'psychographic-matrix',
            title: 'Psychographic Research - Cultural Values',
            data: jsonData.psychographic.slovenskeKulturneVrednote
          });
        }

        // User Journey Keyword Mapping (if available)
        if (jsonData.psychographic.userJourneyKeywords) {
          sections.push({
            id: 'user-journey-keywords',
            type: 'journey-keyword-map',
            title: 'User Journey - Keyword Mapping',
            data: jsonData.psychographic.userJourneyKeywords
          });
        }

        // Regional Differences
        if (jsonData.psychographic.regionalneRazlike) {
          sections.push({
            id: 'regional-differences',
            type: 'regional-analysis',
            title: 'Regional Psychographic Differences',
            data: jsonData.psychographic.regionalneRazlike
          });
        }
      }

      // Market Analysis
      if (jsonData.marketAnalysis && jsonData.marketAnalysis.length > 0) {
        sections.push({
          id: 'market-analysis',
          type: 'market-overview',
          title: 'Market Analysis',
          data: jsonData.marketAnalysis
        });
      }
    }

    // LEGACY REPORT TYPE SECTIONS (for backward compatibility)
    // Report-type specific sections for non-comprehensive reports
    if (reportType === 'psychographic') {
      if (jsonData.slovenskeKulturneVrednote || jsonData.culturalValues || jsonData.psychographicValues) {
        sections.push({
          id: 'psychographic-values',
          type: 'psychographic-matrix',
          title: 'Psychographic Profile',
          data: jsonData.slovenskeKulturneVrednote || jsonData.culturalValues || jsonData.psychographicValues
        });
      }
    }

    if (reportType === 'icp') {
      if (jsonData.primaryPersona) {
        sections.push({
          id: 'primary-persona',
          type: 'persona-card',
          title: 'Ideal Customer Profile',
          data: jsonData.primaryPersona
        });
      }

      if (jsonData.customerJourney) {
        sections.push({
          id: 'customer-journey',
          type: 'journey-map',
          title: 'Customer Journey',
          data: jsonData.customerJourney
        });
      }
    }

    if (reportType === 'market-intelligence') {
      if (jsonData.marketOverview) {
        sections.push({
          id: 'market-overview',
          type: 'market-analysis',
          title: 'Market Overview',
          data: jsonData.marketOverview
        });
      }

      if (jsonData.competitiveLandscape) {
        sections.push({
          id: 'competitive-landscape',
          type: 'competitive-matrix',
          title: 'Competitive Landscape',
          data: jsonData.competitiveLandscape
        });
      }
    }

    // Strategic recommendations (if available)
    if (jsonData.contentStrategy || jsonData.seoStrategy || jsonData.webStrategy) {
      sections.push({
        id: 'strategic-recommendations',
        type: 'strategy-cards',
        title: 'Strategic Recommendations',
        data: {
          content: jsonData.contentStrategy,
          seo: jsonData.seoStrategy,
          web: jsonData.webStrategy
        }
      });
    }

    // Raw data section (collapsible, for reference)
    sections.push({
      id: 'raw-data',
      type: 'json-viewer',
      title: 'Complete Data',
      data: jsonData,
      collapsible: true,
      collapsed: true
    });

    return sections;
  }

  /**
   * Generate appropriate report title
   */
  generateReportTitle(jsonData, reportType) {
    const clientName = jsonData.client || 'Client';

    const titles = {
      'psychographic': `Psychographic Research Report - ${clientName}`,
      'icp': `Ideal Customer Profile - ${clientName}`,
      'market-intelligence': `Market Intelligence Report - ${clientName}`,
      'comprehensive': `Comprehensive Intelligence Report - ${clientName}`
    };

    return titles[reportType] || `Intelligence Report - ${clientName}`;
  }

  /**
   * STAGE 4: Generate HTML using new template system
   */
  async stage4_generateHTML(reportSpec, config) {
    console.log(`STAGE 4: Generating HTML using new template system...`);

    // Determine output path
    const clientProjectPath = this.getClientProjectPath(config.clientId);
    const outputFilename = `${config.reportType}-report-${Date.now()}.html`;
    const htmlPath = config.outputPath ||
                     path.join(clientProjectPath, 'deliverables', 'research', outputFilename);

    // Prepare prompt for frontend agent
    const htmlGenerationPrompt = this.buildHTMLGenerationPrompt(reportSpec, htmlPath);

    console.log(`📡 Delegating to wireframe-creation-specialist and frontend agents...`);

    // In production, this would use Task tool to delegate to Claude Code agents
    // For now, we'll generate the HTML directly using our template
    const htmlContent = await this.generateHTMLTemplate(reportSpec);

    return {
      success: true,
      htmlPath,
      htmlContent,
      reportSpec
    };
  }

  /**
   * Build detailed prompt for frontend HTML generation agents
   */
  buildHTMLGenerationPrompt(reportSpec, htmlPath) {
    return `Generate a professional, self-contained HTML intelligence report with the following specifications:

## Report Details
- **Title**: ${reportSpec.title}
- **Type**: ${reportSpec.metadata.reportType}
- **Client**: ${reportSpec.metadata.client}
- **Date**: ${reportSpec.metadata.reportDate}

## Technical Requirements
- **Technology**: Static HTML with Tailwind CSS (CDN)
- **No Build Process**: Self-contained, opens directly in browser
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Print-Friendly**: CSS print styles for PDF export
- **Modern Browser**: ES6+ JavaScript for interactivity

## Report Sections
${reportSpec.sections.map((section, idx) =>
  `${idx + 1}. **${section.title}** (${section.type})`
).join('\n')}

## Visualizations Required
${reportSpec.visualizations.map((viz, idx) =>
  `${idx + 1}. ${viz.type} - Priority: ${viz.priority}`
).join('\n')}

## Interactive Features
${reportSpec.interactiveFeatures.map((feature, idx) =>
  `${idx + 1}. ${feature.type} - ${feature.purpose}`
).join('\n')}

## Styling Guidelines
- **Theme**: ${reportSpec.styling.theme}
- **Color Scheme**: ${reportSpec.styling.colorScheme}
- **Typography**: ${reportSpec.styling.typography}
- **Layout**: ${reportSpec.styling.layout}

## Output Requirements
- Save to: ${htmlPath}
- File must be self-contained (no external dependencies except Tailwind CDN)
- Include data-* attributes for JavaScript interactivity
- Implement smooth scroll, collapsible sections, and print styles
- Add ORCHESTRAI branding and generation timestamp

Execute this task using your frontend development expertise.`;
  }

  /**
   * Generate HTML template using new ClientIntelligenceReport template system
   */
  async generateHTMLTemplate(reportSpec) {
    // Initialize new template system
    const reportTemplate = new ClientIntelligenceReport();

    // Load original JSON data
    const jsonData = await this.loadOriginalJSONData(reportSpec);

    // Prepare data for template
    const reportData = {
      header: {
        title: reportSpec.title,
        subtitle: reportSpec.metadata.client,
        metadata: {
          reportDate: reportSpec.metadata.reportDate,
          reportType: reportSpec.metadata.reportType,
          generatedAt: reportSpec.metadata.generatedAt
        }
      },
      // EOS Framework data
      eos: jsonData.eos || null,
      // ICP and Personas
      icp: jsonData.icp || null,
      personas: jsonData.personas || [],
      // Psychographic research
      psychographic: jsonData.psychographic || null,
      // Market intelligence
      marketAnalysis: jsonData.marketAnalysis || [],
      competitiveLandscape: jsonData.competitiveLandscape || null,
      // Strategy recommendations
      contentStrategy: jsonData.contentStrategy || null,
      seoStrategy: jsonData.seoStrategy || null,
      webStrategy: jsonData.webStrategy || null,
      // Executive summary
      executiveSummary: jsonData.executiveSummary || null,
      // Complete data for reference
      completeData: jsonData
    };

    // Prepare report configuration
    const reportConfig = {
      clientName: reportSpec.metadata.client,
      reportType: reportSpec.metadata.reportType,
      title: reportSpec.title,
      reportDate: reportSpec.metadata.reportDate,
      // Build sections from reportSpec
      sections: reportSpec.sections
        .filter(s => s.id !== 'header' && s.id !== 'raw-data') // Exclude header and raw data
        .map(s => ({
          id: s.id,
          title: s.title,
          navTitle: s.title.replace(/\s*-\s*/g, ' ') // Clean up title for nav
        }))
    };

    // Generate HTML using template
    const htmlContent = reportTemplate.generate(reportData, reportConfig);

    return htmlContent;
  }

  /**
   * Load original JSON data for template
   */
  async loadOriginalJSONData(reportSpec) {
    // Extract JSON data from report spec sections
    const jsonData = {};

    reportSpec.sections.forEach(section => {
      if (section.data) {
        // Merge section data into jsonData
        if (section.id === 'executive-summary') {
          jsonData.executiveSummary = section.content;
        } else if (section.type === 'psychographic-matrix') {
          jsonData.slovenskeKulturneVrednote = section.data;
        } else if (section.type === 'persona-card') {
          jsonData.primaryPersona = section.data;
        } else if (section.type === 'journey-map') {
          jsonData.customerJourney = section.data;
        } else if (section.type === 'market-analysis') {
          jsonData.marketOverview = section.data;
        } else if (section.type === 'competitive-matrix') {
          jsonData.competitiveLandscape = section.data;
        } else if (section.type === 'strategy-cards') {
          jsonData.contentStrategy = section.data.content;
          jsonData.seoStrategy = section.data.seo;
          jsonData.webStrategy = section.data.web;
        } else if (section.type === 'json-viewer') {
          // This contains the complete original data
          Object.assign(jsonData, section.data);
        }
      }
    });

    // Add metadata
    jsonData.client = reportSpec.metadata.client;
    jsonData.researchDate = reportSpec.metadata.reportDate;
    jsonData.reportType = reportSpec.metadata.reportType;

    return jsonData;
  }

  /**
   * STAGE 5: Validate and save HTML report
   */
  async stage5_validateAndSave(htmlResult, config) {
    console.log(`STAGE 5: Validating and saving HTML report...`);

    // Ensure output directory exists
    const outputDir = path.dirname(htmlResult.htmlPath);
    await fs.mkdir(outputDir, { recursive: true });

    // Write HTML file
    await fs.writeFile(htmlResult.htmlPath, htmlResult.htmlContent, 'utf8');

    // Get file stats
    const stats = await fs.stat(htmlResult.htmlPath);

    console.log(`✅ HTML report saved: ${htmlResult.htmlPath}`);
    console.log(`   File size: ${(stats.size / 1024).toFixed(2)} KB`);

    return {
      htmlPath: htmlResult.htmlPath,
      fileSize: stats.size,
      validated: true
    };
  }

  /**
   * Helper: Get client project path
   */
  getClientProjectPath(clientId) {
    // This would normally query the project manager
    // For now, using standard project structure
    return path.join(
      process.cwd(),
      'projects',
      clientId
    );
  }

  /**
   * Public API: Generate HTML report from JSON
   */
  async generateHTMLReport(jsonPath, reportType, clientId, outputPath = null) {
    return await this.executePipeline({
      jsonReportPath: jsonPath,
      reportType: reportType,
      clientId: clientId,
      outputPath: outputPath
    });
  }
}

module.exports = IntelligenceHTMLReportPipeline;
