/**
 * SEO STRATEGY REPORT TEMPLATE
 *
 * Comprehensive SEO strategy with keyword research, competitive analysis,
 * content recommendations, technical SEO priorities, and implementation roadmap.
 *
 * Features:
 * - Keyword research overview with search volumes
 * - Competitive gap analysis
 * - Search intent mapping
 * - Content strategy recommendations
 * - Technical SEO priorities
 * - Link building strategy
 * - Local SEO (if applicable)
 * - Implementation timeline with phases
 * - Back-to-hub navigation
 *
 * NOTE: All intelligence report pages should be in the same folder for
 * easy server deployment with relative links. Default hubLink: 'intelligence-report-2025.html'
 */

const OrchestRAIReportMasterTemplate = require('./OrchestRAIReportMasterTemplate');

class SEOStrategyReport extends OrchestRAIReportMasterTemplate {
  constructor() {
    super();
  }

  /**
   * Generate main content for SEO strategy page
   */
  generateMainContent(data, config) {
    const {
      overview = {},
      keywordClusters = [],
      competitiveAnalysis = {},
      contentStrategy = {},
      technicalSEO = {},
      linkBuilding = {},
      localSEO = {},
      implementationTimeline = {},
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

      <!-- SEO Strategy Overview Section -->
      <section class="py-20 px-6">
        <div class="max-w-6xl mx-auto">
          ${this.generateSEOOverview(overview)}

          ${keywordClusters.length > 0 ? this.generateKeywordClusters(keywordClusters) : ''}

          ${Object.keys(competitiveAnalysis).length > 0 ? this.generateCompetitiveAnalysis(competitiveAnalysis) : ''}

          ${Object.keys(contentStrategy).length > 0 ? this.generateContentStrategy(contentStrategy) : ''}

          ${Object.keys(technicalSEO).length > 0 ? this.generateTechnicalSEO(technicalSEO) : ''}

          ${Object.keys(linkBuilding).length > 0 ? this.generateLinkBuilding(linkBuilding) : ''}

          ${Object.keys(localSEO).length > 0 ? this.generateLocalSEO(localSEO) : ''}

          ${Object.keys(implementationTimeline).length > 0 ? this.generateImplementationTimeline(implementationTimeline) : ''}
        </div>
      </section>
    `;
  }

  /**
   * Generate SEO strategy overview
   */
  generateSEOOverview(overview) {
    const {
      title = 'SEO Strategy & Implementation Roadmap',
      description,
      totalKeywords,
      totalSearchVolume,
      opportunityScore,
      competitionLevel,
      keyFindings = []
    } = overview;

    return `
      <div class="${this.designSystem.components.cardGradient} p-12 mb-12">
        <h1 class="text-5xl font-extrabold text-gray-900 text-center mb-6">${this.escapeHtml(title)}</h1>
        ${description ? `
          <p class="text-2xl text-gray-700 text-center mb-8 leading-relaxed">${this.escapeHtml(description)}</p>
        ` : ''}

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          ${totalKeywords ? `
            <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-purple-600 mb-1">${totalKeywords}</div>
              <div class="text-sm text-gray-600">Total Keywords</div>
            </div>
          ` : ''}
          ${totalSearchVolume ? `
            <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-blue-600 mb-1">${totalSearchVolume}</div>
              <div class="text-sm text-gray-600">Monthly Searches</div>
            </div>
          ` : ''}
          ${opportunityScore ? `
            <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-green-600 mb-1">${opportunityScore}/100</div>
              <div class="text-sm text-gray-600">Opportunity Score</div>
            </div>
          ` : ''}
          ${competitionLevel ? `
            <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-orange-600 mb-1">${this.escapeHtml(competitionLevel)}</div>
              <div class="text-sm text-gray-600">Competition</div>
            </div>
          ` : ''}
        </div>

        ${keyFindings.length > 0 ? `
          <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Key Strategic Findings</h3>
            <ul class="space-y-2">
              ${keyFindings.map(finding => `
                <li class="flex items-start">
                  <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-gray-700">${this.escapeHtml(finding)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate keyword clusters section
   */
  generateKeywordClusters(keywordClusters) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Keyword Clusters & Opportunities</h2>
        <div class="space-y-6">
          ${keywordClusters.map(cluster => `
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">${this.escapeHtml(cluster.clusterName)}</h3>
                  <p class="text-gray-700 mb-3">${this.escapeHtml(cluster.description)}</p>
                </div>
                ${cluster.priority ? `
                  <span class="${this.designSystem.components.badge} ${this.getPriorityBadgeColor(cluster.priority)}">
                    ${this.escapeHtml(cluster.priority)} Priority
                  </span>
                ` : ''}
              </div>

              ${cluster.searchVolume || cluster.difficulty ? `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  ${cluster.searchVolume ? `
                    <div class="bg-white rounded p-3 text-center">
                      <div class="text-2xl font-bold text-blue-600">${cluster.searchVolume}</div>
                      <div class="text-xs text-gray-600">Monthly Volume</div>
                    </div>
                  ` : ''}
                  ${cluster.difficulty ? `
                    <div class="bg-white rounded p-3 text-center">
                      <div class="text-2xl font-bold text-orange-600">${cluster.difficulty}/100</div>
                      <div class="text-xs text-gray-600">Difficulty</div>
                    </div>
                  ` : ''}
                  ${cluster.opportunity ? `
                    <div class="bg-white rounded p-3 text-center">
                      <div class="text-2xl font-bold text-green-600">${cluster.opportunity}/100</div>
                      <div class="text-xs text-gray-600">Opportunity</div>
                    </div>
                  ` : ''}
                  ${cluster.keywords ? `
                    <div class="bg-white rounded p-3 text-center">
                      <div class="text-2xl font-bold text-purple-600">${cluster.keywords.length}</div>
                      <div class="text-xs text-gray-600">Keywords</div>
                    </div>
                  ` : ''}
                </div>
              ` : ''}

              ${cluster.keywords && cluster.keywords.length > 0 ? `
                <div class="bg-white rounded p-4">
                  <div class="text-sm font-semibold text-gray-900 mb-3">Top Keywords:</div>
                  <div class="flex flex-wrap gap-2">
                    ${cluster.keywords.slice(0, 10).map(kw => `
                      <span class="${this.designSystem.components.badge} bg-blue-100 text-blue-800">
                        ${this.escapeHtml(kw)}
                      </span>
                    `).join('')}
                    ${cluster.keywords.length > 10 ? `
                      <span class="${this.designSystem.components.badge} bg-gray-100 text-gray-600">
                        +${cluster.keywords.length - 10} more
                      </span>
                    ` : ''}
                  </div>
                </div>
              ` : ''}

              ${cluster.contentRecommendation ? `
                <div class="mt-4 bg-purple-50 rounded p-4 border border-purple-100">
                  <div class="text-sm font-semibold text-purple-900 mb-1">💡 Content Recommendation</div>
                  <p class="text-sm text-gray-700">${this.escapeHtml(cluster.contentRecommendation)}</p>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate competitive analysis section
   */
  generateCompetitiveAnalysis(competitiveAnalysis) {
    const { topCompetitors = [], gapAnalysis = [], strengths = [], weaknesses = [] } = competitiveAnalysis;

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Competitive SEO Analysis</h2>

        ${topCompetitors.length > 0 ? `
          <div class="mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Top Competitors</h3>
            <div class="space-y-4">
              ${topCompetitors.map((competitor, index) => `
                <div class="bg-gray-50 rounded-lg p-4 flex items-center">
                  <div class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-4">
                    ${index + 1}
                  </div>
                  <div class="flex-1">
                    <div class="font-bold text-gray-900">${this.escapeHtml(competitor.domain)}</div>
                    ${competitor.description ? `
                      <div class="text-sm text-gray-600">${this.escapeHtml(competitor.description)}</div>
                    ` : ''}
                  </div>
                  ${competitor.domainAuthority ? `
                    <div class="text-right">
                      <div class="text-2xl font-bold text-purple-600">${competitor.domainAuthority}</div>
                      <div class="text-xs text-gray-600">DA</div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${gapAnalysis.length > 0 ? `
          <div class="mb-8">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Keyword Gap Opportunities</h3>
            <div class="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
              <ul class="space-y-2">
                ${gapAnalysis.map(gap => `
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3 3a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 011.414-1.414L9 10.586l2.293-2.293a1 1 0 011.414 1.414z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-700">${this.escapeHtml(gap)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        ` : ''}

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${strengths.length > 0 ? `
            <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-100">
              <h4 class="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Competitive Strengths
              </h4>
              <ul class="space-y-1 text-sm text-gray-700">
                ${strengths.map(strength => `<li>• ${this.escapeHtml(strength)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${weaknesses.length > 0 ? `
            <div class="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-6 border border-red-100">
              <h4 class="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <svg class="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
                Areas for Improvement
              </h4>
              <ul class="space-y-1 text-sm text-gray-700">
                ${weaknesses.map(weakness => `<li>• ${this.escapeHtml(weakness)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate content strategy section
   */
  generateContentStrategy(contentStrategy) {
    const { recommendations = [], contentGaps = [], contentTypes = [] } = contentStrategy;

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Content Strategy</h2>

        ${recommendations.length > 0 ? `
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Strategic Recommendations</h3>
            <div class="space-y-3">
              ${recommendations.map(rec => `
                <div class="flex items-start bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100">
                  <svg class="w-5 h-5 text-purple-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-gray-700">${this.escapeHtml(rec)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${contentGaps.length > 0 ? `
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Content Gaps to Address</h3>
            <div class="bg-yellow-50 rounded-lg p-6 border border-yellow-100">
              <ul class="space-y-2">
                ${contentGaps.map(gap => `
                  <li class="flex items-start">
                    <svg class="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                    </svg>
                    <span class="text-gray-700">${this.escapeHtml(gap)}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        ` : ''}

        ${contentTypes.length > 0 ? `
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-4">Recommended Content Types</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              ${contentTypes.map(type => `
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 text-center border border-blue-100">
                  <div class="text-2xl mb-2">${this.getContentTypeIcon(type.type)}</div>
                  <div class="font-semibold text-gray-900 text-sm">${this.escapeHtml(type.type)}</div>
                  ${type.priority ? `
                    <div class="text-xs text-gray-600 mt-1">${this.escapeHtml(type.priority)} priority</div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate technical SEO section
   */
  generateTechnicalSEO(technicalSEO) {
    const { priorities = [], fixes = [], optimizations = [] } = technicalSEO;

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Technical SEO Priorities</h2>

        ${priorities.length > 0 ? `
          <div class="space-y-4">
            ${priorities.map(priority => `
              <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex items-start justify-between mb-3">
                  <h3 class="text-lg font-bold text-gray-900 flex-1">${this.escapeHtml(priority.item)}</h3>
                  ${priority.priority ? `
                    <span class="${this.designSystem.components.badge} ${this.getPriorityBadgeColor(priority.priority)}">
                      ${this.escapeHtml(priority.priority)}
                    </span>
                  ` : ''}
                </div>
                <p class="text-gray-700 mb-3">${this.escapeHtml(priority.description)}</p>
                ${priority.impact ? `
                  <div class="text-sm text-gray-600">
                    <span class="font-semibold">Expected Impact:</span> ${this.escapeHtml(priority.impact)}
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
   * Generate link building section
   */
  generateLinkBuilding(linkBuilding) {
    const { strategy, tactics = [], targetDomains = [] } = linkBuilding;

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Link Building Strategy</h2>

        ${strategy ? `
          <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100 mb-6">
            <p class="text-gray-700 text-lg">${this.escapeHtml(strategy)}</p>
          </div>
        ` : ''}

        ${tactics.length > 0 ? `
          <div class="mb-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Link Building Tactics</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${tactics.map(tactic => `
                <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 class="font-semibold text-gray-900 mb-2">${this.escapeHtml(tactic.tactic)}</h4>
                  <p class="text-sm text-gray-700">${this.escapeHtml(tactic.description)}</p>
                  ${tactic.difficulty ? `
                    <div class="mt-2">
                      <span class="text-xs ${this.designSystem.components.badge} ${this.getDifficultyBadgeColor(tactic.difficulty)}">
                        ${this.escapeHtml(tactic.difficulty)} difficulty
                      </span>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        ${targetDomains.length > 0 ? `
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-4">Target Link Prospects</h3>
            <div class="bg-white rounded-lg p-4 border border-gray-200">
              <div class="flex flex-wrap gap-2">
                ${targetDomains.map(domain => `
                  <span class="${this.designSystem.components.badge} bg-blue-100 text-blue-800">
                    ${this.escapeHtml(domain)}
                  </span>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate local SEO section
   */
  generateLocalSEO(localSEO) {
    const { enabled, recommendations = [], locations = [] } = localSEO;
    if (!enabled) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Local SEO Strategy</h2>

        ${recommendations.length > 0 ? `
          <div class="space-y-3 mb-6">
            ${recommendations.map(rec => `
              <div class="flex items-start bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-100">
                <svg class="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                <span class="text-gray-700">${this.escapeHtml(rec)}</span>
              </div>
            `).join('')}
          </div>
        ` : ''}

        ${locations.length > 0 ? `
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-4">Target Locations</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              ${locations.map(location => `
                <div class="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <div class="text-2xl mb-2">📍</div>
                  <div class="font-semibold text-gray-900">${this.escapeHtml(location)}</div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate implementation timeline
   */
  generateImplementationTimeline(implementationTimeline) {
    const { phases = [] } = implementationTimeline;
    if (phases.length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Implementation Timeline</h2>
        <div class="relative">
          <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500"></div>
          <div class="space-y-8">
            ${phases.map((phase, index) => `
              <div class="relative pl-16">
                <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  ${this.escapeHtml(phase.phase || `Phase ${index + 1}`)}
                </div>
                <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">${this.escapeHtml(phase.title)}</h3>
                  ${phase.duration ? `
                    <div class="text-sm text-gray-600 mb-3">⏱️ ${this.escapeHtml(phase.duration)}</div>
                  ` : ''}
                  ${phase.tasks && phase.tasks.length > 0 ? `
                    <ul class="space-y-2">
                      ${phase.tasks.map(task => `
                        <li class="flex items-start">
                          <svg class="w-4 h-4 text-purple-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                          <span class="text-sm text-gray-700">${this.escapeHtml(task)}</span>
                        </li>
                      `).join('')}
                    </ul>
                  ` : ''}
                  ${phase.expectedOutcome ? `
                    <div class="mt-4 bg-purple-50 rounded p-3 border border-purple-100">
                      <div class="text-xs font-semibold text-purple-900 mb-1">Expected Outcome</div>
                      <p class="text-sm text-gray-700">${this.escapeHtml(phase.expectedOutcome)}</p>
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
   * Helper: Get content type icon
   */
  getContentTypeIcon(type) {
    const icons = {
      'blog': '📝',
      'guide': '📚',
      'case study': '💼',
      'video': '🎥',
      'infographic': '📊',
      'comparison': '⚖️',
      'faq': '❓',
      'tutorial': '🎓'
    };
    return icons[type.toLowerCase()] || '📄';
  }

  /**
   * Helper: Get priority badge color (reused)
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

  /**
   * Helper: Get difficulty badge color
   */
  getDifficultyBadgeColor(difficulty) {
    const colors = {
      'easy': 'bg-green-100 text-green-800',
      'moderate': 'bg-yellow-100 text-yellow-800',
      'difficult': 'bg-orange-100 text-orange-800',
      'very difficult': 'bg-red-100 text-red-800'
    };
    return colors[difficulty.toLowerCase()] || 'bg-gray-100 text-gray-800';
  }
}

module.exports = SEOStrategyReport;
