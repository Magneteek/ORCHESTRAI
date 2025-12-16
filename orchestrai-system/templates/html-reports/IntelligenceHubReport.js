/**
 * INTELLIGENCE HUB REPORT TEMPLATE
 *
 * Main dashboard/hub for multi-page intelligence report suite.
 * Links to 7 detail pages: 3 ICP personas, psychographic research,
 * EOS framework, SEO strategy, and competitive intelligence.
 *
 * This template is optimized for executive overview and navigation.
 */

const OrchestRAIReportMasterTemplate = require('./OrchestRAIReportMasterTemplate');

class IntelligenceHubReport extends OrchestRAIReportMasterTemplate {
  constructor() {
    super();
  }

  /**
   * Generate main content for intelligence hub
   * @param {Object} data - Hub data (metrics, ICP summaries, previews)
   * @param {Object} config - Configuration (client name, sections, links)
   */
  generateMainContent(data, config) {
    const { metrics = {}, businessOverview = '', criticalFactors = [], icpSummaries = [],
            seoPreview = {}, competitivePreview = {}, eosPreview = {}, psychographicPreview = {},
            strategicPriorities = [], timeline = {} } = data;

    return `
      <!-- Executive Summary Section -->
      <section class="py-20 px-6" id="executive-summary">
        <div class="max-w-6xl mx-auto">
          <div class="${this.designSystem.components.card} p-12 mb-12">
            <h2 class="${this.designSystem.typography.headings.h2.full} mb-8">Executive Intelligence Dashboard</h2>

            <!-- Key Metrics Grid -->
            ${this.generateMetricsGrid(metrics, 4)}

            <!-- Business Overview -->
            ${this.generateBusinessOverview(businessOverview)}

            <!-- Critical Success Factors -->
            ${this.generateCriticalFactors(criticalFactors)}
          </div>

          <!-- ICP Summary Cards -->
          ${this.generateICPSummaryCards(icpSummaries, config)}

          <!-- Intelligence Previews -->
          ${this.generateIntelligencePreviews({
            seoPreview,
            competitivePreview,
            eosPreview,
            psychographicPreview
          }, config)}

          <!-- Strategic Priorities Timeline -->
          ${this.generateStrategicTimeline(strategicPriorities, timeline)}
        </div>
      </section>

      <!-- Footer Navigation Grid -->
      ${this.generateFooterNavigation(config)}
    `;
  }

  /**
   * Generate business overview section
   */
  generateBusinessOverview(overview) {
    if (!overview) return '';

    return `
      <div class="mb-12">
        <h3 class="${this.designSystem.typography.headings.h3.full} mb-4">Business Overview</h3>
        <div class="prose prose-lg max-w-none">
          ${this.escapeHtml(overview).split('\n\n').map(p => `<p class="text-gray-700 text-lg leading-relaxed mb-4">${p}</p>`).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate critical success factors grid
   */
  generateCriticalFactors(factors) {
    if (!factors || factors.length === 0) return '';

    return `
      <div>
        <h3 class="${this.designSystem.typography.headings.h3.full} mb-6">Critical Success Factors</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${factors.map(factor => `
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-100">
              <h4 class="text-xl font-semibold text-gray-900 mb-3">${this.escapeHtml(factor.title)}</h4>
              <p class="text-gray-700">${this.escapeHtml(factor.description)}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Generate ICP summary cards with links to detail pages
   * Grid adapts dynamically based on persona count
   */
  generateICPSummaryCards(icpSummaries, config) {
    if (!icpSummaries || icpSummaries.length === 0) return '';

    const personaCount = icpSummaries.length;

    // Dynamic grid class based on persona count
    const getGridClass = (count) => {
      if (count === 1) return 'grid-cols-1';
      if (count === 2) return 'grid-cols-1 md:grid-cols-2';
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    };

    const gridClass = getGridClass(personaCount);

    return `
      <h2 class="${this.designSystem.typography.headings.h2.full} mb-8">Ideal Customer Profiles (${personaCount})</h2>
      <div class="grid ${gridClass} gap-8 mb-12">
        ${icpSummaries.map(icp => this.generateICPCard(icp)).join('')}
      </div>
    `;
  }

  /**
   * Generate single ICP summary card
   */
  generateICPCard(icp) {
    const { name, segment, revenueWeight, relevance, description, economics = {}, detailPageLink } = icp;

    return `
      <div class="${this.designSystem.components.card} p-8 hover:shadow-2xl transition-shadow">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-4 mx-auto">
          ${this.escapeHtml(segment || 'ICP')}
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2 text-center">${this.escapeHtml(name)}</h3>
        <div class="text-center mb-4">
          <span class="text-purple-600 font-semibold text-lg">${revenueWeight}% Revenue Weight</span>
          <span class="mx-2">•</span>
          <span class="text-gray-600">${relevance}% Relevance</span>
        </div>
        <p class="text-gray-700 mb-6">${this.escapeHtml(description)}</p>

        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><span class="font-semibold">LTV:</span> ${economics.ltv || 'N/A'}</div>
            <div><span class="font-semibold">CAC:</span> ${economics.cac || 'N/A'}</div>
            <div><span class="font-semibold">Payback:</span> ${economics.payback || 'N/A'}</div>
            <div><span class="font-semibold">Churn:</span> ${economics.churn || 'N/A'}</div>
          </div>
        </div>

        ${detailPageLink ? `
          <a href="${detailPageLink}" class="block text-center ${this.designSystem.components.btn} ${this.designSystem.components.btnPrimary} no-print">
            View Complete ICP →
          </a>
        ` : ''}
      </div>
    `;
  }

  /**
   * Generate intelligence preview sections
   */
  generateIntelligencePreviews(previews, config) {
    const { seoPreview, competitivePreview, eosPreview, psychographicPreview } = previews;

    return `
      <!-- SEO Strategy Preview -->
      ${seoPreview && seoPreview.summary ? `
        <div class="${this.designSystem.components.card} p-8 mb-8">
          <h3 class="${this.designSystem.typography.headings.h3.full} mb-4">SEO Strategy Highlights</h3>
          <div class="prose prose-lg max-w-none mb-6">
            <p class="text-gray-700">${this.escapeHtml(seoPreview.summary)}</p>
          </div>
          ${seoPreview.detailPageLink ? `
            <a href="${seoPreview.detailPageLink}" class="block text-center ${this.designSystem.components.btn} ${this.designSystem.components.btnPrimary} no-print max-w-md mx-auto">
              View Complete SEO Strategy →
            </a>
          ` : ''}
        </div>
      ` : ''}

      <!-- Competitive Intelligence Preview -->
      ${competitivePreview && competitivePreview.summary ? `
        <div class="${this.designSystem.components.card} p-8 mb-8">
          <h3 class="${this.designSystem.typography.headings.h3.full} mb-4">Competitive Landscape</h3>
          <div class="prose prose-lg max-w-none mb-6">
            <p class="text-gray-700">${this.escapeHtml(competitivePreview.summary)}</p>
          </div>
          ${competitivePreview.detailPageLink ? `
            <a href="${competitivePreview.detailPageLink}" class="block text-center ${this.designSystem.components.btn} ${this.designSystem.components.btnPrimary} no-print max-w-md mx-auto">
              View Complete Competitive Analysis →
            </a>
          ` : ''}
        </div>
      ` : ''}

      <!-- EOS Framework Preview -->
      ${eosPreview && eosPreview.summary ? `
        <div class="${this.designSystem.components.card} p-8 mb-8">
          <h3 class="${this.designSystem.typography.headings.h3.full} mb-4">EOS Framework</h3>
          <div class="prose prose-lg max-w-none mb-6">
            <p class="text-gray-700">${this.escapeHtml(eosPreview.summary)}</p>
          </div>
          ${eosPreview.detailPageLink ? `
            <a href="${eosPreview.detailPageLink}" class="block text-center ${this.designSystem.components.btn} ${this.designSystem.components.btnPrimary} no-print max-w-md mx-auto">
              View Complete EOS Framework →
            </a>
          ` : ''}
        </div>
      ` : ''}

      <!-- Psychographic Research Preview -->
      ${psychographicPreview && psychographicPreview.summary ? `
        <div class="${this.designSystem.components.card} p-8 mb-8">
          <h3 class="${this.designSystem.typography.headings.h3.full} mb-4">Psychographic Research</h3>
          <div class="prose prose-lg max-w-none mb-6">
            <p class="text-gray-700">${this.escapeHtml(psychographicPreview.summary)}</p>
          </div>
          ${psychographicPreview.detailPageLink ? `
            <a href="${psychographicPreview.detailPageLink}" class="block text-center ${this.designSystem.components.btn} ${this.designSystem.components.btnPrimary} no-print max-w-md mx-auto">
              View Complete Psychographic Research →
            </a>
          ` : ''}
        </div>
      ` : ''}
    `;
  }

  /**
   * Generate strategic priorities timeline
   */
  generateStrategicTimeline(priorities, timeline) {
    if (!timeline || (!timeline.q1 && !timeline.year)) return '';

    return `
      <div class="${this.designSystem.components.card} p-8">
        <h3 class="${this.designSystem.typography.headings.h3.full} mb-8">Strategic Priorities</h3>
        <div class="space-y-8">
          ${timeline.q1 ? `
            <div class="relative pl-8 border-l-4 border-purple-600">
              <div class="absolute -left-3 top-0 w-6 h-6 rounded-full bg-purple-600"></div>
              <h4 class="text-xl font-bold text-gray-900 mb-2">${timeline.q1.title || 'Q1 2026 Priorities'}</h4>
              <ul class="space-y-2 text-gray-700">
                ${timeline.q1.items ? timeline.q1.items.map(item => `<li>• ${this.escapeHtml(item)}</li>`).join('') : ''}
              </ul>
              ${timeline.q1.outcomes ? `
                <div class="mt-3 bg-purple-50 rounded-lg p-3">
                  <p class="text-sm font-semibold text-purple-900">Expected Outcomes: ${this.escapeHtml(timeline.q1.outcomes)}</p>
                </div>
              ` : ''}
            </div>
          ` : ''}

          ${timeline.year ? `
            <div class="relative pl-8 border-l-4 border-green-600">
              <div class="absolute -left-3 top-0 w-6 h-6 rounded-full bg-green-600"></div>
              <h4 class="text-xl font-bold text-gray-900 mb-2">${timeline.year.title || '2026 Strategic Goals'}</h4>
              <ul class="space-y-2 text-gray-700">
                ${timeline.year.items ? timeline.year.items.map(item => `<li>• ${this.escapeHtml(item)}</li>`).join('') : ''}
              </ul>
              ${timeline.year.outcomes ? `
                <div class="mt-3 bg-green-50 rounded-lg p-3">
                  <p class="text-sm font-semibold text-green-900">Expected Outcomes: ${this.escapeHtml(timeline.year.outcomes)}</p>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate footer navigation grid
   */
  generateFooterNavigation(config) {
    const { detailPages = [] } = config;

    if (detailPages.length === 0) return '';

    return `
      <footer class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white py-12 no-print">
        <div class="max-w-6xl mx-auto px-6">
          <h3 class="text-2xl font-bold mb-6">Explore Detailed Reports</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${detailPages.map(page => `
              <a href="${page.link}" class="bg-white bg-opacity-10 hover:bg-opacity-20 transition rounded-lg p-4">
                <h4 class="font-semibold mb-2">${this.escapeHtml(page.title)}</h4>
                <p class="text-sm text-white text-opacity-80">${this.escapeHtml(page.description)}</p>
              </a>
            `).join('')}
          </div>
          <div class="mt-8 pt-8 border-t border-white border-opacity-20 text-center text-sm text-white text-opacity-60">
            <p>${config.clientName} - Client Intelligence Hub ${new Date().getFullYear()} | Generated by ORCHESTRAI Multi-Agent System</p>
          </div>
        </div>
      </footer>
    `;
  }

  /**
   * Custom scripts for intelligence hub
   */
  generateCustomScripts(data, config) {
    return `
      <script>
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
          anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
              target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
              });
            }
          });
        });
      </script>
    `;
  }
}

module.exports = IntelligenceHubReport;
