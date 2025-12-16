/**
 * PERSONA DETAIL REPORT TEMPLATE
 *
 * Detailed analysis of individual ICP persona/segment.
 * Used for dedicated pages for each customer segment (B2B, B2C, etc.)
 *
 * Features:
 * - Complete demographics
 * - Pain points & motivations
 * - Unit economics (LTV, CAC, payback, churn)
 * - Acquisition channels
 * - Journey mapping
 * - Back-to-hub navigation
 */

const OrchestRAIReportMasterTemplate = require('./OrchestRAIReportMasterTemplate');

class PersonaDetailReport extends OrchestRAIReportMasterTemplate {
  constructor() {
    super();
  }

  /**
   * Generate main content for persona detail page
   */
  generateMainContent(data, config) {
    const { persona = {}, hubLink = 'intelligence-report-2025.html' } = data;
    const { name, segment, description, demographics = {}, painPoints = [],
            motivations = [], economics = {}, channels = [], journey = [] } = persona;

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

      <!-- Persona Overview Section -->
      <section class="py-20 px-6">
        <div class="max-w-6xl mx-auto">
          ${this.generatePersonaOverview(persona)}

          ${this.generateDemographics(demographics)}

          ${this.generatePainPoints(painPoints)}

          ${this.generateMotivations(motivations)}

          ${this.generateUnitEconomics(economics)}

          ${this.generateAcquisitionChannels(channels)}

          ${journey.length > 0 ? this.generateCustomerJourney(journey) : ''}
        </div>
      </section>
    `;
  }

  /**
   * Generate persona overview card
   */
  generatePersonaOverview(persona) {
    return `
      <div class="${this.designSystem.components.cardGradient} p-12 mb-12">
        <div class="w-32 h-32 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center text-white text-5xl font-bold mb-6 mx-auto">
          ${this.escapeHtml(persona.segment || 'ICP')}
        </div>
        <h1 class="text-5xl font-extrabold text-gray-900 text-center mb-4">${this.escapeHtml(persona.name)}</h1>
        <p class="text-2xl text-gray-700 text-center mb-8">${this.escapeHtml(persona.description)}</p>

        <div class="flex justify-center gap-4 flex-wrap">
          ${persona.revenueWeight ? `
            <div class="${this.designSystem.components.badge} bg-purple-100 text-purple-800">
              ${persona.revenueWeight}% Revenue Weight
            </div>
          ` : ''}
          ${persona.relevance ? `
            <div class="${this.designSystem.components.badge} bg-blue-100 text-blue-800">
              ${persona.relevance}% Strategic Relevance
            </div>
          ` : ''}
          ${persona.segment ? `
            <div class="${this.designSystem.components.badge} bg-green-100 text-green-800">
              ${this.escapeHtml(persona.segment)} Segment
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate demographics section
   */
  generateDemographics(demographics) {
    if (!demographics || Object.keys(demographics).length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Demographics</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${Object.entries(demographics).map(([key, value]) => `
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">${this.escapeHtml(key)}</div>
              <div class="text-lg font-bold text-gray-900">${this.escapeHtml(value)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate pain points section
   */
  generatePainPoints(painPoints) {
    if (!painPoints || painPoints.length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Pain Points</h2>
        <ul class="space-y-4">
          ${painPoints.map(pain => `
            <li class="flex items-start">
              <svg class="w-6 h-6 text-red-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700 text-lg">${this.escapeHtml(pain)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Generate motivations section
   */
  generateMotivations(motivations) {
    if (!motivations || motivations.length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Motivations</h2>
        <ul class="space-y-4">
          ${motivations.map(motivation => `
            <li class="flex items-start">
              <svg class="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <span class="text-gray-700 text-lg">${this.escapeHtml(motivation)}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Generate unit economics dashboard
   */
  generateUnitEconomics(economics) {
    if (!economics || Object.keys(economics).length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Unit Economics</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          ${economics.ltv ? `
            <div class="text-center">
              <div class="text-4xl font-bold text-purple-600 mb-2">${economics.ltv}</div>
              <div class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Lifetime Value</div>
            </div>
          ` : ''}
          ${economics.cac ? `
            <div class="text-center">
              <div class="text-4xl font-bold text-blue-600 mb-2">${economics.cac}</div>
              <div class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Customer Acquisition Cost</div>
            </div>
          ` : ''}
          ${economics.payback ? `
            <div class="text-center">
              <div class="text-4xl font-bold text-green-600 mb-2">${economics.payback}</div>
              <div class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Payback Period</div>
            </div>
          ` : ''}
          ${economics.churn ? `
            <div class="text-center">
              <div class="text-4xl font-bold text-orange-600 mb-2">${economics.churn}</div>
              <div class="text-sm font-semibold text-gray-600 uppercase tracking-wide">Churn Rate</div>
            </div>
          ` : ''}
        </div>

        ${economics.ltvCacRatio ? `
          <div class="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
            <div class="text-center">
              <div class="text-5xl font-bold text-purple-700 mb-2">${economics.ltvCacRatio}</div>
              <div class="text-lg font-semibold text-gray-700">LTV:CAC Ratio</div>
              <p class="text-sm text-gray-600 mt-2">Target: 3:1 to 5:1 | ${parseFloat(economics.ltvCacRatio) >= 3 ? '✅ Excellent' : '⚠️ Needs Improvement'}</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate acquisition channels section
   */
  generateAcquisitionChannels(channels) {
    if (!channels || channels.length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8 mb-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Top Acquisition Channels</h2>
        <div class="space-y-4">
          ${channels.map(channel => `
            <div>
              <div class="flex justify-between items-center mb-2">
                <span class="font-semibold text-gray-900">${this.escapeHtml(channel.name)}</span>
                <span class="text-purple-600 font-bold">${channel.effectiveness}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div class="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500" style="width: ${channel.effectiveness}%"></div>
              </div>
              ${channel.note ? `
                <p class="text-sm text-gray-600 mt-1">${this.escapeHtml(channel.note)}</p>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate customer journey section
   */
  generateCustomerJourney(journey) {
    if (!journey || journey.length === 0) return '';

    return `
      <div class="${this.designSystem.components.card} p-8">
        <h2 class="${this.designSystem.typography.headings.h2.full} mb-6">Customer Journey</h2>
        <div class="relative">
          <div class="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          <div class="space-y-8">
            ${journey.map((stage, index) => `
              <div class="relative pl-16">
                <div class="absolute left-0 top-0 w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  ${index + 1}
                </div>
                <div class="bg-gray-50 rounded-lg p-6">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">${this.escapeHtml(stage.stage)}</h3>
                  <p class="text-gray-700">${this.escapeHtml(stage.description)}</p>
                  ${stage.touchpoints ? `
                    <div class="mt-3">
                      <div class="text-sm font-semibold text-gray-600 mb-2">Key Touchpoints:</div>
                      <div class="flex flex-wrap gap-2">
                        ${stage.touchpoints.map(tp => `
                          <span class="${this.designSystem.components.badge} bg-purple-100 text-purple-800">${this.escapeHtml(tp)}</span>
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
}

module.exports = PersonaDetailReport;
