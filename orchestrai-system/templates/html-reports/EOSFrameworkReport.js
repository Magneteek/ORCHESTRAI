/**
 * EOS FRAMEWORK REPORT TEMPLATE
 *
 * Entrepreneurial Operating System (EOS) strategic framework page.
 * Visualizes Vision/Traction Organizer (V/TO) with 8 key sections:
 * Core Values, Core Focus, 10-Year Target, 3-Year Picture, 1-Year Plan,
 * Quarterly Rocks, Issues List, and Accountability Chart.
 *
 * Features:
 * - Complete V/TO visualization
 * - Strategic timeline (10Y → 3Y → 1Y → 90D)
 * - Accountability chart
 * - Rocks tracking with progress
 * - Issues list with priorities
 * - Back-to-hub navigation
 */

const OrchestRAIReportMasterTemplate = require('./OrchestRAIReportMasterTemplate');

class EOSFrameworkReport extends OrchestRAIReportMasterTemplate {
  constructor() {
    super();
  }

  /**
   * Generate main content for EOS framework page
   */
  generateMainContent(data, config) {
    const {
      overview = {},
      coreValues = [],
      coreFocus = {},
      tenYearTarget = {},
      threeYearPicture = {},
      oneYearPlan = {},
      quarterlyRocks = [],
      issuesList = [],
      accountabilityChart = {},
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

      <!-- EOS Framework Overview Section -->
      <section class="py-20 px-6">
        <div class="max-w-6xl mx-auto">
          ${this.generateEOSOverview(overview)}

          ${coreValues.length > 0 ? this.generateCoreValues(coreValues) : ''}

          ${Object.keys(coreFocus).length > 0 ? this.generateCoreFocus(coreFocus) : ''}

          ${this.generateStrategicTimeline(tenYearTarget, threeYearPicture, oneYearPlan)}

          ${quarterlyRocks.length > 0 ? this.generateQuarterlyRocks(quarterlyRocks) : ''}

          ${issuesList.length > 0 ? this.generateIssuesList(issuesList) : ''}

          ${Object.keys(accountabilityChart).length > 0 ? this.generateAccountabilityChart(accountabilityChart) : ''}
        </div>
      </section>
    `;
  }

  /**
   * Generate EOS framework overview
   */
  generateEOSOverview(overview) {
    const { title = 'EOS Framework - Vision/Traction Organizer', description, implementationStatus } = overview;

    return `
      <div class="${this.designSystem.components.cardGradient} p-12 mb-12">
        <h1 class="text-5xl font-extrabold text-gray-900 text-center mb-6">${this.escapeHtml(title)}</h1>
        ${description ? `
          <p class="text-2xl text-gray-700 text-center mb-8 leading-relaxed">${this.escapeHtml(description)}</p>
        ` : ''}

        ${implementationStatus ? `
          <div class="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-6">
            <div class="flex items-center justify-between mb-3">
              <span class="text-lg font-semibold text-gray-900">Implementation Status</span>
              <span class="text-2xl font-bold text-purple-600">${implementationStatus.percentage || 0}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div class="bg-gradient-to-r from-purple-500 to-indigo-600 h-4 rounded-full transition-all duration-500" style="width: ${implementationStatus.percentage || 0}%"></div>
            </div>
            ${implementationStatus.note ? `
              <p class="text-sm text-gray-600 mt-3">${this.escapeHtml(implementationStatus.note)}</p>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate core values section
   */
  generateCoreValues(coreValues) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Core Values</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${coreValues.map(value => `
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100 text-center">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                ${this.escapeHtml(value.value.charAt(0).toUpperCase())}
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-3">${this.escapeHtml(value.value)}</h3>
              <p class="text-gray-700 text-sm">${this.escapeHtml(value.description)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate core focus section
   */
  generateCoreFocus(coreFocus) {
    const { niche, purpose, passion } = coreFocus;

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Core Focus</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${niche ? `
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <svg class="w-6 h-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3h.5a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-.5a1.5 1.5 0 00-3 0v.5a1 1 0 01-1 1H6a1 1 0 01-1-1v-3a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1V6a1 1 0 011-1h3a1 1 0 001-1v-.5z"/>
                </svg>
                Niche
              </h3>
              <p class="text-gray-700">${this.escapeHtml(niche)}</p>
            </div>
          ` : ''}

          ${purpose ? `
            <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-100">
              <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <svg class="w-6 h-6 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                Purpose
              </h3>
              <p class="text-gray-700">${this.escapeHtml(purpose)}</p>
            </div>
          ` : ''}
        </div>

        ${passion ? `
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-100 mt-6">
            <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center">
              <svg class="w-6 h-6 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
              </svg>
              Passion
            </h3>
            <p class="text-gray-700 text-lg">${this.escapeHtml(passion)}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate strategic timeline (10Y → 3Y → 1Y)
   */
  generateStrategicTimeline(tenYearTarget, threeYearPicture, oneYearPlan) {
    if (!tenYearTarget.target && !threeYearPicture.vision && !oneYearPlan.goals) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-8">Strategic Timeline</h2>
        <div class="relative">
          <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500"></div>
          <div class="space-y-12">
            ${tenYearTarget.target ? `
              <div class="relative pl-16">
                <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  10Y
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
                  <h3 class="text-2xl font-bold text-gray-900 mb-3">10-Year Target</h3>
                  <p class="text-gray-700 text-lg mb-4">${this.escapeHtml(tenYearTarget.target)}</p>
                  ${tenYearTarget.metrics && tenYearTarget.metrics.length > 0 ? `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      ${tenYearTarget.metrics.map(metric => `
                        <div class="bg-white rounded p-3 text-center">
                          <div class="text-2xl font-bold text-purple-600">${this.escapeHtml(metric.value)}</div>
                          <div class="text-xs text-gray-600 mt-1">${this.escapeHtml(metric.label)}</div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}

            ${threeYearPicture.vision ? `
              <div class="relative pl-16">
                <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm">
                  3Y
                </div>
                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border border-blue-100">
                  <h3 class="text-2xl font-bold text-gray-900 mb-3">3-Year Picture</h3>
                  <p class="text-gray-700 text-lg mb-4">${this.escapeHtml(threeYearPicture.vision)}</p>
                  ${threeYearPicture.revenue ? `
                    <div class="bg-white rounded p-4 mb-3">
                      <span class="text-sm font-semibold text-gray-600">Target Revenue: </span>
                      <span class="text-xl font-bold text-blue-600">${this.escapeHtml(threeYearPicture.revenue)}</span>
                    </div>
                  ` : ''}
                  ${threeYearPicture.profit ? `
                    <div class="bg-white rounded p-4">
                      <span class="text-sm font-semibold text-gray-600">Target Profit: </span>
                      <span class="text-xl font-bold text-green-600">${this.escapeHtml(threeYearPicture.profit)}</span>
                    </div>
                  ` : ''}
                </div>
              </div>
            ` : ''}

            ${oneYearPlan.goals ? `
              <div class="relative pl-16">
                <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                  1Y
                </div>
                <div class="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-6 border border-green-100">
                  <h3 class="text-2xl font-bold text-gray-900 mb-4">1-Year Plan</h3>
                  ${Array.isArray(oneYearPlan.goals) ? `
                    <ul class="space-y-2">
                      ${oneYearPlan.goals.map(goal => `
                        <li class="flex items-start">
                          <svg class="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                          <span class="text-gray-700">${this.escapeHtml(goal)}</span>
                        </li>
                      `).join('')}
                    </ul>
                  ` : `<p class="text-gray-700">${this.escapeHtml(oneYearPlan.goals)}</p>`}
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate quarterly rocks (90-day priorities)
   */
  generateQuarterlyRocks(quarterlyRocks) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Quarterly Rocks (90-Day Priorities)</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${quarterlyRocks.map(rock => `
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div class="flex items-start justify-between mb-3">
                <h3 class="text-lg font-bold text-gray-900 flex-1">${this.escapeHtml(rock.rock)}</h3>
                ${rock.progress !== undefined ? `
                  <span class="${this.designSystem.components.badge} ${this.getProgressBadgeColor(rock.progress)}">
                    ${rock.progress}%
                  </span>
                ` : ''}
              </div>

              ${rock.owner ? `
                <div class="flex items-center mb-3">
                  <svg class="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                  </svg>
                  <span class="text-sm text-gray-600">Owner: <span class="font-semibold">${this.escapeHtml(rock.owner)}</span></span>
                </div>
              ` : ''}

              ${rock.progress !== undefined ? `
                <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
                  <div class="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500" style="width: ${rock.progress}%"></div>
                </div>
              ` : ''}

              ${rock.dueDate ? `
                <div class="flex items-center text-sm text-gray-600">
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                  </svg>
                  Due: ${this.escapeHtml(rock.dueDate)}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate issues list
   */
  generateIssuesList(issuesList) {
    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Issues List</h2>
        <div class="space-y-4">
          ${issuesList.map(issue => `
            <div class="flex items-start bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex-shrink-0 mr-4">
                ${issue.priority ? `
                  <span class="${this.designSystem.components.badge} ${this.getPriorityBadgeColor(issue.priority)}">
                    ${this.escapeHtml(issue.priority)}
                  </span>
                ` : ''}
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 mb-1">${this.escapeHtml(issue.issue)}</h3>
                ${issue.description ? `
                  <p class="text-sm text-gray-600 mb-2">${this.escapeHtml(issue.description)}</p>
                ` : ''}
                ${issue.owner ? `
                  <div class="flex items-center text-xs text-gray-500">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                    </svg>
                    ${this.escapeHtml(issue.owner)}
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
   * Generate accountability chart
   */
  generateAccountabilityChart(accountabilityChart) {
    const { positions = [] } = accountabilityChart;
    if (positions.length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Accountability Chart</h2>
        <div class="space-y-6">
          ${positions.map(position => `
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-xl font-bold text-gray-900">${this.escapeHtml(position.role)}</h3>
                  ${position.person ? `
                    <p class="text-gray-600 mt-1">${this.escapeHtml(position.person)}</p>
                  ` : ''}
                </div>
                ${position.level ? `
                  <span class="${this.designSystem.components.badge} bg-indigo-100 text-indigo-800">
                    ${this.escapeHtml(position.level)}
                  </span>
                ` : ''}
              </div>

              ${position.responsibilities && position.responsibilities.length > 0 ? `
                <div class="bg-white rounded p-4">
                  <div class="text-sm font-semibold text-gray-900 mb-2">Key Responsibilities:</div>
                  <ul class="space-y-1 text-sm text-gray-700">
                    ${position.responsibilities.map(resp => `<li>• ${this.escapeHtml(resp)}</li>`).join('')}
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
   * Helper: Get progress badge color
   */
  getProgressBadgeColor(progress) {
    if (progress >= 80) return 'bg-green-100 text-green-800';
    if (progress >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  }

  /**
   * Helper: Get priority badge color (reused from parent)
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

module.exports = EOSFrameworkReport;
