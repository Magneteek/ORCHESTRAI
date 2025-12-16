/**
 * ORCHESTRAI REPORT MASTER TEMPLATE
 *
 * Base class for all ORCHESTRAI HTML reports. Provides consistent structure,
 * styling, and interactive features across all report types.
 *
 * Child Classes (extend this):
 * - StrategicPlanningReport      - Financial projections, OPSP, V/TO
 * - ClientIntelligenceReport     - ICP, psychographic, EOS, comprehensive
 * - SEOAnalysisReport            - Keyword research, SERP analysis, competitor analysis
 * - PsychographicResearchReport  - Cultural values, emotional triggers, user journey
 *
 * Usage:
 *   class MyReport extends OrchestRAIReportMasterTemplate {
 *     generateMainContent(data, config) {
 *       // Implement report-specific content
 *     }
 *   }
 */

const designSystem = require('./report-design-system');
const ReportComponents = require('./report-components');

class OrchestRAIReportMasterTemplate {
  constructor() {
    this.designSystem = designSystem;
    this.components = ReportComponents;
  }

  /**
   * MAIN GENERATION METHOD
   * Generates complete HTML report with consistent structure
   *
   * @param {Object} data - Report data (varies by report type)
   * @param {Object} config - Report configuration
   * @param {string} config.clientName - Client name
   * @param {string} config.reportType - Report type (strategic, intelligence, seo, etc.)
   * @param {string} config.title - Report title
   * @param {string} config.reportDate - Report date (optional)
   * @param {Array} config.sections - Section definitions for navigation
   * @returns {string} Complete HTML document
   */
  generate(data, config) {
    // Ensure config has required fields
    const fullConfig = this.validateAndEnrichConfig(config);

    // Generate complete HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${this.components.generateHead(fullConfig)}
</head>
<body class="bg-gray-50 text-gray-900">
    ${this.components.generateHeader(data, fullConfig)}
    ${this.components.generateNavigation(fullConfig)}

    <main class="${this.designSystem.components.container}">
        ${this.generateMainContent(data, fullConfig)}
    </main>

    ${this.components.generateFooter(fullConfig)}
    ${this.components.generateScripts()}
    ${this.generateCustomScripts(data, fullConfig)}
</body>
</html>`;
  }

  /**
   * ABSTRACT METHOD: Generate report-specific content
   * Child classes MUST override this method
   *
   * @param {Object} data - Report data
   * @param {Object} config - Report configuration
   * @returns {string} HTML content for report body
   */
  generateMainContent(data, config) {
    throw new Error('Child class must implement generateMainContent() method');
  }

  /**
   * OPTIONAL: Generate custom JavaScript for report type
   * Child classes can override for report-specific interactivity
   *
   * @param {Object} data - Report data
   * @param {Object} config - Report configuration
   * @returns {string} Custom JavaScript (wrapped in <script> tags)
   */
  generateCustomScripts(data, config) {
    return ''; // No custom scripts by default
  }

  /**
   * Validate and enrich configuration
   * Ensures all required fields are present
   */
  validateAndEnrichConfig(config) {
    const enriched = {
      clientName: config.clientName || 'Client',
      reportType: config.reportType || 'intelligence',
      title: config.title || `${config.reportType || 'Intelligence'} Report`,
      reportDate: config.reportDate || new Date().toLocaleDateString(),
      sections: config.sections || [],
      ...config
    };

    return enriched;
  }

  /**
   * HELPER: Generate executive summary section
   * Reusable across multiple report types
   */
  generateExecutiveSummary(summary) {
    if (!summary) return '';

    return `
    <section id="executive-summary" class="${this.designSystem.components.section}">
        <h2 class="${this.designSystem.typography.headings.h2.full}">Executive Summary</h2>

        <div class="${this.designSystem.components.cardGradient}">
            ${summary.keyFindings ? `
            <div class="mb-6">
                <h3 class="${this.designSystem.typography.headings.h3.full}">Key Findings</h3>
                <ul class="${this.designSystem.components.list}">
                    ${summary.keyFindings.map(finding => `
                        <li class="${this.designSystem.components.listItem}">
                            <span class="${this.designSystem.components.listBullet}">✓</span>
                            <span>${finding}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}

            ${summary.primaryOpportunities ? `
            <div>
                <h3 class="${this.designSystem.typography.headings.h3.full}">Primary Opportunities</h3>
                <div class="${this.designSystem.components.grid2}">
                    ${summary.primaryOpportunities.map(opp => `
                        <div class="${this.designSystem.components.card}">
                            <div class="flex items-center">
                                <span class="text-2xl mr-3">💡</span>
                                <span class="text-sm">${opp}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${typeof summary === 'string' ? `
            <div class="prose max-w-none">
                <p class="${this.designSystem.typography.body.base}">${summary}</p>
            </div>
            ` : ''}
        </div>
    </section>`;
  }

  /**
   * HELPER: Generate metric cards grid
   * Reusable for displaying key metrics
   */
  generateMetricsGrid(metrics, columns = 4) {
    if (!metrics || metrics.length === 0) return '';

    const gridClass = columns === 4 ? this.designSystem.components.grid4 :
                      columns === 3 ? this.designSystem.components.grid3 :
                      this.designSystem.components.grid2;

    return `
    <div class="${gridClass}">
        ${metrics.map(metric => this.components.generateMetricCard(metric)).join('')}
    </div>`;
  }

  /**
   * HELPER: Generate collapsible JSON viewer
   * Useful for raw data sections
   */
  generateJSONViewer(data, title = 'Complete Data') {
    const jsonString = JSON.stringify(data, null, 2);

    return `
    <section id="raw-data" class="${this.designSystem.components.section}">
        <div class="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
            <div class="bg-gray-100 px-6 py-4 flex justify-between items-center border-b border-gray-200">
                <h4 class="font-semibold">${title}</h4>
                <button
                    data-collapsible
                    data-target="json-content"
                    class="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition">
                    ▶ Show
                </button>
            </div>
            <div id="json-content" class="collapsible-content">
                <pre class="p-6 text-xs overflow-x-auto"><code>${this.components.escapeHtml(jsonString)}</code></pre>
            </div>
        </div>
    </section>`;
  }

  /**
   * HELPER: Generate progress bar with percentage
   */
  generateProgressBar(label, percentage, color = 'blue') {
    return `
    <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-gray-700">${label}</span>
            <span class="text-sm font-semibold text-${color}-600">${percentage}%</span>
        </div>
        <div class="${this.designSystem.components.progressBar}">
            <div class="${this.designSystem.components.progressFill}" data-width="${percentage}%" style="width: 0%"></div>
        </div>
    </div>`;
  }

  /**
   * HELPER: Generate badge with color
   */
  generateBadge(text, level = 'medium') {
    const badgeClass = level === 'high' ? this.designSystem.components.badgeHigh :
                       level === 'low' ? this.designSystem.components.badgeLow :
                       this.designSystem.components.badgeMedium;

    return `<span class="${badgeClass}">${text}</span>`;
  }

  /**
   * HELPER: Convert string to array (for list processing)
   */
  stringToArray(str) {
    if (Array.isArray(str)) return str;
    if (!str || typeof str !== 'string') return [];

    return str.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(item => item.length > 0);
  }

  /**
   * HELPER: Generate standard section wrapper
   */
  generateSection(section, content) {
    return this.components.generateSectionWrapper(section, content);
  }

  /**
   * HELPER: Generate Chart.js configuration
   * Returns JavaScript code for initializing a chart
   */
  generateChartJS(canvasId, chartConfig) {
    return `
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('${canvasId}');
            if (ctx) {
                new Chart(ctx.getContext('2d'), ${JSON.stringify(chartConfig)});
            }
        });
    </script>`;
  }

  /**
   * HELPER: Generate responsive table
   */
  generateTable(headers, rows) {
    return `
    <div class="overflow-x-auto">
        <table class="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead class="bg-gray-50">
                <tr>
                    ${headers.map(header => `
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ${header}
                        </th>
                    `).join('')}
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                ${rows.map(row => `
                    <tr class="hover:bg-gray-50">
                        ${row.map(cell => `
                            <td class="px-6 py-4 text-sm text-gray-900">
                                ${cell}
                            </td>
                        `).join('')}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>`;
  }
}

module.exports = OrchestRAIReportMasterTemplate;
