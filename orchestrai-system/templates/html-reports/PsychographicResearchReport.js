/**
 * PSYCHOGRAPHIC RESEARCH REPORT TEMPLATE
 *
 * Deep dive into customer behavioral research, cultural values,
 * user journey mapping, and psychographic segmentation.
 *
 * Features:
 * - Cultural values analysis
 * - Behavioral patterns
 * - User journey keyword mapping
 * - Regional differences
 * - Pain points by segment
 * - Chart.js visualizations
 * - Back-to-hub navigation
 */

const OrchestRAIReportMasterTemplate = require('./OrchestRAIReportMasterTemplate');

class PsychographicResearchReport extends OrchestRAIReportMasterTemplate {
  constructor() {
    super();
  }

  /**
   * Generate main content for psychographic research page
   */
  generateMainContent(data, config) {
    const {
      overview = {},
      culturalValues = [],
      behavioralPatterns = [],
      userJourneyMapping = {},
      regionalDifferences = [],
      painPointsBySegment = [],
      motivationsBySegment = [],
      actionableInsights = [],
      hubLink = 'intelligence-report-2025.html'
    } = data;

    return `
      <!-- Back to Hub Navigation -->
      <div class="bg-white py-4 px-6 sticky top-0 z-50 shadow-md no-print">
        <div class="max-w-6xl mx-auto">
          <a href="${hubLink}" class="inline-flex items-center text-purple-600 hover:text-purple-800 font-semibold transition">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Back to Intelligence Hub
          </a>
        </div>
      </div>

      <!-- Research Overview Section -->
      <section class="py-20 px-6">
        <div class="max-w-6xl mx-auto">
          ${this.generateResearchOverview(overview)}

          ${culturalValues.length > 0 ? this.generateCulturalValues(culturalValues) : ''}

          ${behavioralPatterns.length > 0 ? this.generateBehavioralPatterns(behavioralPatterns) : ''}

          ${Object.keys(userJourneyMapping).length > 0 ? this.generateUserJourneyMapping(userJourneyMapping) : ''}

          ${regionalDifferences.length > 0 ? this.generateRegionalDifferences(regionalDifferences) : ''}

          ${painPointsBySegment.length > 0 ? this.generatePainPointsBySegment(painPointsBySegment) : ''}

          ${motivationsBySegment.length > 0 ? this.generateMotivationsBySegment(motivationsBySegment) : ''}

          ${actionableInsights.length > 0 ? this.generateActionableInsights(actionableInsights) : ''}
        </div>
      </section>
    `;
  }

  /**
   * Generate research overview section
   */
  generateResearchOverview(overview) {
    const { title = 'Psychographic Research', description, keyFindings = [], methodology } = overview;

    return `
      <div class="${this.designSystem.components.cardGradient} p-12 mb-12">
        <h1 class="text-5xl font-extrabold text-gray-900 text-center mb-6">${this.escapeHtml(title)}</h1>
        ${description ? `
          <p class="text-2xl text-gray-700 text-center mb-8 leading-relaxed">${this.escapeHtml(description)}</p>
        ` : ''}

        ${keyFindings.length > 0 ? `
          <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-8 mb-6">
            <h3 class="text-2xl font-bold text-gray-900 mb-4">Key Findings</h3>
            <ul class="space-y-3">
              ${keyFindings.map(finding => `
                <li class="flex items-start">
                  <svg class="w-6 h-6 text-purple-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-gray-700 text-lg">${this.escapeHtml(finding)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}

        ${methodology ? `
          <div class="bg-white bg-opacity-70 backdrop-blur-sm rounded-lg p-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-2">Research Methodology</h4>
            <p class="text-gray-700">${this.escapeHtml(methodology)}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate cultural values analysis
   */
  generateCulturalValues(culturalValues) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Cultural Values Analysis</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${culturalValues.map(value => `
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
              <h3 class="text-xl font-bold text-gray-900 mb-3">${this.escapeHtml(value.value)}</h3>
              <p class="text-gray-700 mb-4">${this.escapeHtml(value.description)}</p>
              ${value.importance ? `
                <div class="flex items-center mb-3">
                  <span class="text-sm font-semibold text-gray-600 mr-3">Importance:</span>
                  <div class="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div class="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500" style="width: ${value.importance}%"></div>
                  </div>
                  <span class="ml-3 text-sm font-bold text-purple-600">${value.importance}%</span>
                </div>
              ` : ''}
              ${value.examples && value.examples.length > 0 ? `
                <div class="mt-3">
                  <div class="text-sm font-semibold text-gray-600 mb-2">Examples:</div>
                  <ul class="space-y-1 text-sm text-gray-600">
                    ${value.examples.map(ex => `<li>• ${this.escapeHtml(ex)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate behavioral patterns section
   */
  generateBehavioralPatterns(behavioralPatterns) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Behavioral Patterns & Preferences</h2>
        <div class="space-y-6">
          ${behavioralPatterns.map(pattern => `
            <div class="bg-gray-50 rounded-lg p-6">
              <div class="flex items-start justify-between mb-4">
                <h3 class="text-xl font-bold text-gray-900">${this.escapeHtml(pattern.pattern)}</h3>
                ${pattern.prevalence ? `
                  <span class="${this.designSystem.components.badge} bg-purple-100 text-purple-800">
                    ${pattern.prevalence}% prevalence
                  </span>
                ` : ''}
              </div>
              <p class="text-gray-700 mb-4">${this.escapeHtml(pattern.description)}</p>
              ${pattern.indicators && pattern.indicators.length > 0 ? `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  ${pattern.indicators.map(indicator => `
                    <div class="flex items-center bg-white rounded p-3">
                      <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                      <span class="text-sm text-gray-700">${this.escapeHtml(indicator)}</span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate user journey keyword mapping
   */
  generateUserJourneyMapping(userJourneyMapping) {
    const { stages = [] } = userJourneyMapping;
    if (stages.length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">User Journey & Keyword Mapping</h2>
        <div class="relative">
          <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          <div class="space-y-8">
            ${stages.map((stage, index) => `
              <div class="relative pl-16">
                <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  ${index + 1}
                </div>
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">${this.escapeHtml(stage.stageName)}</h3>
                  <p class="text-gray-700 mb-4">${this.escapeHtml(stage.description)}</p>

                  ${stage.intent ? `
                    <div class="mb-4">
                      <span class="text-sm font-semibold text-gray-600">Search Intent: </span>
                      <span class="${this.designSystem.components.badge} ${this.getIntentBadgeColor(stage.intent)}">
                        ${this.escapeHtml(stage.intent)}
                      </span>
                    </div>
                  ` : ''}

                  ${stage.keywords && stage.keywords.length > 0 ? `
                    <div class="mb-4">
                      <div class="text-sm font-semibold text-gray-600 mb-2">Key Search Terms:</div>
                      <div class="flex flex-wrap gap-2">
                        ${stage.keywords.map(kw => `
                          <span class="${this.designSystem.components.badge} bg-blue-100 text-blue-800">
                            ${this.escapeHtml(kw)}
                          </span>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}

                  ${stage.contentTypes && stage.contentTypes.length > 0 ? `
                    <div>
                      <div class="text-sm font-semibold text-gray-600 mb-2">Recommended Content Types:</div>
                      <div class="flex flex-wrap gap-2">
                        ${stage.contentTypes.map(ct => `
                          <span class="${this.designSystem.components.badge} bg-green-100 text-green-800">
                            ${this.escapeHtml(ct)}
                          </span>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate regional differences analysis
   */
  generateRegionalDifferences(regionalDifferences) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Regional & Demographic Differences</h2>
        <div class="space-y-6">
          ${regionalDifferences.map(region => `
            <div class="border border-gray-200 rounded-lg p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-3">${this.escapeHtml(region.region)}</h3>
              <p class="text-gray-700 mb-4">${this.escapeHtml(region.description)}</p>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${region.characteristics && region.characteristics.length > 0 ? `
                  <div class="bg-gray-50 rounded p-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Key Characteristics</h4>
                    <ul class="space-y-1 text-sm text-gray-700">
                      ${region.characteristics.map(char => `<li>• ${this.escapeHtml(char)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}

                ${region.preferences && region.preferences.length > 0 ? `
                  <div class="bg-gray-50 rounded p-4">
                    <h4 class="font-semibold text-gray-900 mb-2">Preferences</h4>
                    <ul class="space-y-1 text-sm text-gray-700">
                      ${region.preferences.map(pref => `<li>• ${this.escapeHtml(pref)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate pain points by segment
   */
  generatePainPointsBySegment(painPointsBySegment) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Pain Points by Customer Segment</h2>
        <div class="space-y-6">
          ${painPointsBySegment.map(segment => `
            <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border border-red-100">
              <h3 class="text-xl font-bold text-gray-900 mb-4">${this.escapeHtml(segment.segmentName)}</h3>
              <ul class="space-y-3">
                ${segment.painPoints.map(pain => `
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <span class="text-gray-900 font-semibold">${this.escapeHtml(pain.pain)}</span>
                      ${pain.severity ? `
                        <span class="ml-2 text-xs ${this.designSystem.components.badge} ${this.getSeverityBadgeColor(pain.severity)}">
                          ${this.escapeHtml(pain.severity)}
                        </span>
                      ` : ''}
                      ${pain.solution ? `
                        <p class="text-sm text-gray-600 mt-1">💡 ${this.escapeHtml(pain.solution)}</p>
                      ` : ''}
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate motivations by segment
   */
  generateMotivationsBySegment(motivationsBySegment) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Motivations by Customer Segment</h2>
        <div class="space-y-6">
          ${motivationsBySegment.map(segment => `
            <div class="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
              <h3 class="text-xl font-bold text-gray-900 mb-4">${this.escapeHtml(segment.segmentName)}</h3>
              <ul class="space-y-3">
                ${segment.motivations.map(motivation => `
                  <li class="flex items-start">
                    <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <span class="text-gray-900 font-semibold">${this.escapeHtml(motivation.motivation)}</span>
                      ${motivation.strength ? `
                        <span class="ml-2 text-xs ${this.designSystem.components.badge} ${this.getStrengthBadgeColor(motivation.strength)}">
                          ${this.escapeHtml(motivation.strength)}
                        </span>
                      ` : ''}
                      ${motivation.trigger ? `
                        <p class="text-sm text-gray-600 mt-1">🎯 ${this.escapeHtml(motivation.trigger)}</p>
                      ` : ''}
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate actionable insights section
   */
  generateActionableInsights(actionableInsights) {
    return `
      <div class="${this.designSystem.components.card} p-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Actionable Insights & Recommendations</h2>
        <div class="space-y-6">
          ${actionableInsights.map((insight, index) => `
            <div class="flex items-start bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-4">
                ${index + 1}
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-2">${this.escapeHtml(insight.insight)}</h3>
                <p class="text-gray-700 mb-3">${this.escapeHtml(insight.description)}</p>
                ${insight.priority ? `
                  <div class="flex items-center mb-3">
                    <span class="text-sm font-semibold text-gray-600 mr-2">Priority:</span>
                    <span class="${this.designSystem.components.badge} ${this.getPriorityBadgeColor(insight.priority)}">
                      ${this.escapeHtml(insight.priority)}
                    </span>
                  </div>
                ` : ''}
                ${insight.actions && insight.actions.length > 0 ? `
                  <div class="bg-white rounded p-4 mt-3">
                    <div class="text-sm font-semibold text-gray-900 mb-2">Action Steps:</div>
                    <ul class="space-y-1 text-sm text-gray-700">
                      ${insight.actions.map(action => `<li>▸ ${this.escapeHtml(action)}</li>`).join('')}
                    </ul>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Helper: Get intent badge color
   */
  getIntentBadgeColor(intent) {
    const colors = {
      'informational': 'bg-blue-100 text-blue-800',
      'navigational': 'bg-purple-100 text-purple-800',
      'commercial': 'bg-orange-100 text-orange-800',
      'transactional': 'bg-green-100 text-green-800'
    };
    return colors[intent.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Helper: Get severity badge color
   */
  getSeverityBadgeColor(severity) {
    const colors = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800'
    };
    return colors[severity.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Helper: Get strength badge color
   */
  getStrengthBadgeColor(strength) {
    const colors = {
      'primary': 'bg-green-100 text-green-800',
      'secondary': 'bg-blue-100 text-blue-800',
      'tertiary': 'bg-purple-100 text-purple-800'
    };
    return colors[strength.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Helper: Get priority badge color
   */
  getPriorityBadgeColor(priority) {
    const colors = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800'
    };
    return colors[priority.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }
}

module.exports = PsychographicResearchReport;
