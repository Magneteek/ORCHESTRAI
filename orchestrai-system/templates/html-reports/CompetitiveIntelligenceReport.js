/**
 * COMPETITIVE INTELLIGENCE REPORT TEMPLATE
 *
 * Comprehensive competitive landscape analysis with competitor profiles,
 * SWOT analysis, market positioning, feature comparison, and strategic insights.
 *
 * Features:
 * - Market landscape overview
 * - Detailed competitor profiles with SWOT
 * - Competitive positioning matrix
 * - Market share analysis
 * - Feature comparison table
 * - Pricing comparison
 * - Competitive advantages/disadvantages
 * - Strategic recommendations
 * - Back-to-hub navigation
 */

const OrchestRAIReportMasterTemplate = require('./OrchestRAIReportMasterTemplate');

class CompetitiveIntelligenceReport extends OrchestRAIReportMasterTemplate {
  constructor() {
    super();
  }

  /**
   * Generate main content for competitive intelligence page
   */
  generateMainContent(data, config) {
    const {
      overview = {},
      competitors = [],
      marketPositioning = {},
      featureComparison = {},
      pricingAnalysis = {},
      competitiveAdvantages = [],
      competitiveDisadvantages = [],
      strategicRecommendations = [],
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

      <!-- Competitive Intelligence Overview Section -->
      <section class="py-20 px-6">
        <div class="max-w-6xl mx-auto">
          ${this.generateCompetitiveOverview(overview)}

          ${competitors.length > 0 ? this.generateCompetitorProfiles(competitors) : ''}

          ${Object.keys(marketPositioning).length > 0 ? this.generateMarketPositioning(marketPositioning) : ''}

          ${Object.keys(featureComparison).length > 0 ? this.generateFeatureComparison(featureComparison) : ''}

          ${Object.keys(pricingAnalysis).length > 0 ? this.generatePricingAnalysis(pricingAnalysis) : ''}

          ${this.generateCompetitiveAnalysis(competitiveAdvantages, competitiveDisadvantages)}

          ${strategicRecommendations.length > 0 ? this.generateStrategicRecommendations(strategicRecommendations) : ''}
        </div>
      </section>
    `;
  }

  /**
   * Generate competitive overview section
   */
  generateCompetitiveOverview(overview) {
    const {
      title = 'Competitive Intelligence & Market Analysis',
      description,
      totalCompetitors,
      marketSize,
      marketGrowth,
      competitiveIntensity,
      keyInsights = []
    } = overview;

    return `
      <div class="${this.designSystem.components.cardGradient} p-12 mb-12">
        <h1 class="text-5xl font-extrabold text-gray-900 text-center mb-6">${this.escapeHtml(title)}</h1>
        ${description ? `
          <p class="text-2xl text-gray-700 text-center mb-8 leading-relaxed">${this.escapeHtml(description)}</p>
        ` : ''}

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          ${totalCompetitors ? `
            <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-purple-600 mb-1">${totalCompetitors}</div>
              <div class="text-sm text-gray-600">Active Competitors</div>
            </div>
          ` : ''}
          ${marketSize ? `
            <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-blue-600 mb-1">${this.escapeHtml(marketSize)}</div>
              <div class="text-sm text-gray-600">Market Size</div>
            </div>
          ` : ''}
          ${marketGrowth ? `
            <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-green-600 mb-1">${this.escapeHtml(marketGrowth)}</div>
              <div class="text-sm text-gray-600">Growth Rate</div>
            </div>
          ` : ''}
          ${competitiveIntensity ? `
            <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-orange-600 mb-1">${this.escapeHtml(competitiveIntensity)}</div>
              <div class="text-sm text-gray-600">Competition Level</div>
            </div>
          ` : ''}
        </div>

        ${keyInsights.length > 0 ? `
          <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Key Market Insights</h3>
            <ul class="space-y-2">
              ${keyInsights.map(insight => `
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-gray-700">${this.escapeHtml(insight)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate competitor profiles with SWOT
   */
  generateCompetitorProfiles(competitors) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Competitor Profiles</h2>
        <div class="space-y-8">
          ${competitors.map((competitor, index) => `
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div class="flex items-start justify-between mb-4">
                <div class="flex items-center">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                    ${index + 1}
                  </div>
                  <div>
                    <h3 class="text-2xl font-bold text-gray-900">${this.escapeHtml(competitor.name)}</h3>
                    ${competitor.tagline ? `
                      <p class="text-gray-600 italic">"${this.escapeHtml(competitor.tagline)}"</p>
                    ` : ''}
                  </div>
                </div>
                ${competitor.threatLevel ? `
                  <span class="${this.designSystem.components.badge} ${this.getThreatLevelBadgeColor(competitor.threatLevel)}">
                    ${this.escapeHtml(competitor.threatLevel)} Threat
                  </span>
                ` : ''}
              </div>

              ${competitor.description ? `
                <p class="text-gray-700 mb-6">${this.escapeHtml(competitor.description)}</p>
              ` : ''}

              ${competitor.metrics ? `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  ${competitor.metrics.marketShare ? `
                    <div class="bg-white rounded p-3 text-center">
                      <div class="text-2xl font-bold text-purple-600">${competitor.metrics.marketShare}%</div>
                      <div class="text-xs text-gray-600">Market Share</div>
                    </div>
                  ` : ''}
                  ${competitor.metrics.revenue ? `
                    <div class="bg-white rounded p-3 text-center">
                      <div class="text-2xl font-bold text-blue-600">${this.escapeHtml(competitor.metrics.revenue)}</div>
                      <div class="text-xs text-gray-600">Revenue</div>
                    </div>
                  ` : ''}
                  ${competitor.metrics.employees ? `
                    <div class="bg-white rounded p-3 text-center">
                      <div class="text-2xl font-bold text-green-600">${competitor.metrics.employees}</div>
                      <div class="text-xs text-gray-600">Employees</div>
                    </div>
                  ` : ''}
                  ${competitor.metrics.founded ? `
                    <div class="bg-white rounded p-3 text-center">
                      <div class="text-2xl font-bold text-orange-600">${competitor.metrics.founded}</div>
                      <div class="text-xs text-gray-600">Founded</div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              ${competitor.swot ? this.generateSWOTAnalysis(competitor.swot) : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate SWOT analysis for a competitor
   */
  generateSWOTAnalysis(swot) {
    const { strengths = [], weaknesses = [], opportunities = [], threats = [] } = swot;

    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        ${strengths.length > 0 ? `
          <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-4 border border-green-100">
            <h4 class="font-bold text-gray-900 mb-2 flex items-center">
              <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              Strengths
            </h4>
            <ul class="space-y-1 text-sm text-gray-700">
              ${strengths.map(s => `<li>• ${this.escapeHtml(s)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${weaknesses.length > 0 ? `
          <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-100">
            <h4 class="font-bold text-gray-900 mb-2 flex items-center">
              <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              Weaknesses
            </h4>
            <ul class="space-y-1 text-sm text-gray-700">
              ${weaknesses.map(w => `<li>• ${this.escapeHtml(w)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${opportunities.length > 0 ? `
          <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <h4 class="font-bold text-gray-900 mb-2 flex items-center">
              <svg class="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
              </svg>
              Opportunities
            </h4>
            <ul class="space-y-1 text-sm text-gray-700">
              ${opportunities.map(o => `<li>• ${this.escapeHtml(o)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${threats.length > 0 ? `
          <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-100">
            <h4 class="font-bold text-gray-900 mb-2 flex items-center">
              <svg class="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
              Threats
            </h4>
            <ul class="space-y-1 text-sm text-gray-700">
              ${threats.map(t => `<li>• ${this.escapeHtml(t)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate market positioning matrix
   */
  generateMarketPositioning(marketPositioning) {
    const { description, segments = [] } = marketPositioning;

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Market Positioning</h2>
        ${description ? `
          <p class="text-gray-700 text-lg mb-6">${this.escapeHtml(description)}</p>
        ` : ''}

        ${segments.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${segments.map(segment => `
              <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                <h3 class="text-xl font-bold text-gray-900 mb-3">${this.escapeHtml(segment.position)}</h3>
                <p class="text-gray-700 mb-4">${this.escapeHtml(segment.description)}</p>
                ${segment.companies && segment.companies.length > 0 ? `
                  <div class="flex flex-wrap gap-2">
                    ${segment.companies.map(company => `
                      <span class="${this.designSystem.components.badge} bg-purple-100 text-purple-800">
                        ${this.escapeHtml(company)}
                      </span>
                    `).join('')}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate feature comparison table
   */
  generateFeatureComparison(featureComparison) {
    const { features = [], competitors = [] } = featureComparison;
    if (features.length === 0 || competitors.length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Feature Comparison</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white border border-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                  Feature
                </th>
                ${competitors.map(comp => `
                  <th class="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">
                    ${this.escapeHtml(comp)}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              ${features.map(feature => `
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 text-sm font-medium text-gray-900">
                    ${this.escapeHtml(feature.name)}
                  </td>
                  ${competitors.map(comp => {
                    const status = feature.availability[comp];
                    return `
                      <td class="px-6 py-4 text-center">
                        ${this.getFeatureStatusIcon(status)}
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  /**
   * Generate pricing analysis
   */
  generatePricingAnalysis(pricingAnalysis) {
    const { description, tiers = [] } = pricingAnalysis;

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Pricing Analysis</h2>
        ${description ? `
          <p class="text-gray-700 text-lg mb-6">${this.escapeHtml(description)}</p>
        ` : ''}

        ${tiers.length > 0 ? `
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${tiers.map(tier => `
              <div class="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                <h3 class="text-xl font-bold text-gray-900 mb-2">${this.escapeHtml(tier.tier)}</h3>
                <div class="text-3xl font-bold text-purple-600 mb-4">${this.escapeHtml(tier.price)}</div>
                ${tier.features ? `
                  <ul class="space-y-2 text-sm text-gray-700 text-left">
                    ${tier.features.map(f => `<li class="flex items-start"><span class="text-green-500 mr-2">✓</span>${this.escapeHtml(f)}</li>`).join('')}
                  </ul>
                ` : ''}
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate competitive advantages and disadvantages
   */
  generateCompetitiveAnalysis(advantages, disadvantages) {
    if (advantages.length === 0 && disadvantages.length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Competitive Analysis</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${advantages.length > 0 ? `
            <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-100">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg class="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Our Advantages
              </h3>
              <ul class="space-y-3">
                ${advantages.map(adv => `
                  <li class="flex items-start">
                    <span class="text-green-600 font-bold mr-2">+</span>
                    <span class="text-gray-700">${this.escapeHtml(adv)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}

          ${disadvantages.length > 0 ? `
            <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border border-red-100">
              <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <svg class="w-6 h-6 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                Areas to Address
              </h3>
              <ul class="space-y-3">
                ${disadvantages.map(dis => `
                  <li class="flex items-start">
                    <span class="text-red-600 font-bold mr-2">−</span>
                    <span class="text-gray-700">${this.escapeHtml(dis)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate strategic recommendations
   */
  generateStrategicRecommendations(strategicRecommendations) {
    return `
      <div class="${this.designSystem.components.card} p-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Strategic Recommendations</h2>
        <div class="space-y-6">
          ${strategicRecommendations.map((rec, index) => `
            <div class="flex items-start bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-4">
                ${index + 1}
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-2">${this.escapeHtml(rec.recommendation)}</h3>
                <p class="text-gray-700 mb-3">${this.escapeHtml(rec.description)}</p>
                ${rec.impact ? `
                  <div class="flex items-center mb-2">
                    <span class="text-sm font-semibold text-gray-600 mr-2">Expected Impact:</span>
                    <span class="${this.designSystem.components.badge} ${this.getImpactBadgeColor(rec.impact)}">
                      ${this.escapeHtml(rec.impact)}
                    </span>
                  </div>
                ` : ''}
                ${rec.timeframe ? `
                  <div class="text-sm text-gray-600">
                    ⏱️ Timeframe: ${this.escapeHtml(rec.timeframe)}
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
   * Helper: Get threat level badge color
   */
  getThreatLevelBadgeColor(threatLevel) {
    const colors = {
      'critical': 'bg-red-100 text-red-800',
      'high': 'bg-orange-100 text-orange-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[threatLevel.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Helper: Get feature status icon
   */
  getFeatureStatusIcon(status) {
    if (status === true || status === 'yes' || status === 'full') {
      return '<span class="text-green-500 text-xl">✓</span>';
    } else if (status === 'partial' || status === 'limited') {
      return '<span class="text-yellow-500 text-xl">◐</span>';
    } else if (status === false || status === 'no') {
      return '<span class="text-red-500 text-xl">✗</span>';
    }
    return '<span class="text-gray-400 text-xl">−</span>';
  }

  /**
   * Helper: Get impact badge color
   */
  getImpactBadgeColor(impact) {
    const colors = {
      'high': 'bg-green-100 text-green-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-blue-100 text-blue-800'
    };
    return colors[impact.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }
}

module.exports = CompetitiveIntelligenceReport;
