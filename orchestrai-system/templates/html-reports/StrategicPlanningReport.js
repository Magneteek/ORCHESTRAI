/**
 * STRATEGIC PLANNING REPORT TEMPLATE
 *
 * Child class extending OrchestRAIReportMasterTemplate for strategic planning reports.
 * Implements Scaling Up OPSP and EOS frameworks with financial projections.
 *
 * Report Sections:
 * - Strategic Coherence Scorecard
 * - Unit Economics Dashboard (LTV:CAC, payback, margins)
 * - 24-Month Financial Runway (Chart.js visualization)
 * - Strategic Priorities (7 key priorities)
 * - Quarterly Rocks (90-day execution plan)
 * - Power of One Analysis
 *
 * Usage:
 *   const StrategicPlanningReport = require('./StrategicPlanningReport');
 *   const report = new StrategicPlanningReport();
 *   const html = report.generate(data, config);
 */

const OrchestRAIReportMasterTemplate = require('./OrchestRAIReportMasterTemplate');

class StrategicPlanningReport extends OrchestRAIReportMasterTemplate {
  constructor() {
    super();
  }

  /**
   * OVERRIDE: Generate strategic planning-specific content
   * @param {Object} data - Strategic planning data
   * @param {Object} data.coherenceScore - Strategic coherence percentage (0-100)
   * @param {Object} data.financialMetrics - Financial projections and unit economics
   * @param {Array} data.strategicPriorities - 7 strategic priorities
   * @param {Array} data.quarterlyRocks - Q1 quarterly rocks (90-day priorities)
   * @param {Object} config - Report configuration
   */
  generateMainContent(data, config) {
    const { coherenceScore = 0, financialMetrics = {}, strategicPriorities = [], quarterlyRocks = [] } = data;
    const { unitEconomics = {}, powerOfOne = {} } = financialMetrics;

    return `
    <!-- Strategic Coherence Scorecard -->
    ${this.generateCoherenceScorecard(coherenceScore)}

    <!-- Unit Economics Dashboard -->
    ${this.generateUnitEconomicsDashboard(unitEconomics)}

    <!-- Financial Projections Chart -->
    ${this.generateFinancialChartSection()}

    <!-- Strategic Priorities -->
    ${this.generateStrategicPriorities(strategicPriorities)}

    <!-- Quarterly Rocks -->
    ${this.generateQuarterlyRocks(quarterlyRocks)}

    <!-- Power of One Analysis -->
    ${powerOfOne && Object.keys(powerOfOne).length > 0 ? this.generatePowerOfOne(powerOfOne) : ''}
    `;
  }

  /**
   * Generate Strategic Coherence Scorecard section
   */
  generateCoherenceScorecard(coherenceScore) {
    const badgeLevel = coherenceScore >= 85 ? 'high' : coherenceScore >= 70 ? 'medium' : 'low';
    const badgeText = coherenceScore >= 85 ? 'EXCEPTIONAL' : coherenceScore >= 70 ? 'GOOD' : coherenceScore >= 60 ? 'FAIR' : 'NEEDS WORK';
    const targetThreshold = 70;

    return `
    <section id="coherence-scorecard" class="${this.designSystem.components.section}">
      <div class="${this.designSystem.components.cardGradient}">
        <h2 class="${this.designSystem.typography.headings.h2.full}">Strategic Coherence Analysis</h2>

        <div class="flex items-center justify-between mb-8 flex-wrap gap-6">
          <div>
            <p class="text-gray-600 mb-2">Overall Strategic Alignment</p>
            <div class="flex items-center gap-4">
              <div class="text-6xl font-bold text-purple-600">${coherenceScore}%</div>
              ${this.generateBadge(badgeText, badgeLevel)}
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500 mb-1">Target Threshold</p>
            <p class="text-2xl font-semibold text-gray-700">${targetThreshold}%+</p>
          </div>
        </div>

        ${this.generateProgressBar('Strategic Coherence', coherenceScore, 'purple')}

        <div class="mt-6 p-4 bg-white/60 rounded-lg">
          <p class="${this.designSystem.typography.body.base}">
            <strong>What This Score Measures:</strong> This coherence score analyzes alignment across ICP psychographics ↔ SEO targeting,
            brand positioning ↔ competitive differentiation, core values ↔ operations, and
            strategic goals ↔ execution feasibility.
          </p>
        </div>
      </div>
    </section>`;
  }

  /**
   * Generate Unit Economics Dashboard (4 metric cards)
   */
  generateUnitEconomicsDashboard(unitEconomics) {
    const metrics = [
      {
        label: 'LTV:CAC Ratio',
        value: unitEconomics.ltvCacRatio ? `${unitEconomics.ltvCacRatio.toFixed(1)}:1` : 'N/A',
        sublabel: 'Target: 3-5:1 (Healthy)',
        color: 'green'
      },
      {
        label: 'Payback Period',
        value: unitEconomics.paybackPeriodMonths ? `${unitEconomics.paybackPeriodMonths.toFixed(1)} mo` : 'N/A',
        sublabel: 'Target: <12 months',
        color: 'blue'
      },
      {
        label: 'Customer LTV',
        value: unitEconomics.ltv ? `$${unitEconomics.ltv.toLocaleString()}` : 'N/A',
        sublabel: 'Lifetime value per customer',
        color: 'purple'
      },
      {
        label: 'Contribution Margin',
        value: unitEconomics.contributionMargin ? `${(unitEconomics.contributionMargin * 100).toFixed(0)}%` : 'N/A',
        sublabel: 'Revenue after variable costs',
        color: 'indigo'
      }
    ];

    return `
    <section id="unit-economics" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Unit Economics Dashboard</h2>
      ${this.generateMetricsGrid(metrics, 4)}
    </section>`;
  }

  /**
   * Generate Financial Chart Section (placeholder for Chart.js)
   */
  generateFinancialChartSection() {
    return `
    <section id="financial-projections" class="${this.designSystem.components.section}">
      <div class="${this.designSystem.components.card}">
        <h2 class="${this.designSystem.typography.headings.h2.full}">24-Month Financial Runway</h2>
        <div style="position: relative; height: 400px; width: 100%;">
          <canvas id="financialChart"></canvas>
        </div>
        <div class="mt-6 text-sm text-gray-600">
          <p><strong>Chart Data:</strong> Revenue (blue), EBITDA (green), Cash Position (orange)</p>
          <p class="mt-2">Interactive chart showing projected financial performance over 24 months. Hover for detailed values.</p>
        </div>
      </div>
    </section>`;
  }

  /**
   * Generate Strategic Priorities section
   */
  generateStrategicPriorities(priorities) {
    if (!priorities || priorities.length === 0) {
      return '';
    }

    return `
    <section id="strategic-priorities" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Strategic Priorities for 2026</h2>
      <p class="${this.designSystem.typography.body.base} mb-6">
        Seven strategic priorities aligned with the Scaling Up OPSP framework, focusing on sustainable growth and operational excellence.
      </p>

      <div class="${this.designSystem.components.grid2}">
        ${priorities.map((priority, index) => `
          <div class="flex items-start gap-4 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 ${this.designSystem.print.keepTogether}">
            <div class="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
              ${index + 1}
            </div>
            <div class="flex-1">
              <p class="font-bold text-gray-900 text-lg leading-tight">${priority}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
  }

  /**
   * Generate Quarterly Rocks section
   */
  generateQuarterlyRocks(rocks) {
    if (!rocks || rocks.length === 0) {
      return '';
    }

    return `
    <section id="quarterly-rocks" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Q1 2026 Rocks (90-Day Priorities)</h2>
      <p class="${this.designSystem.typography.body.base} mb-6">
        Quarterly rocks represent the 3-7 most important priorities for the next 90 days. Each rock should be measurable and have clear ownership.
      </p>

      <div class="space-y-4">
        ${rocks.map((rock, index) => `
          <div class="flex items-start gap-4 p-6 bg-white rounded-xl shadow-md ${this.designSystem.print.keepTogether}">
            <div class="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
              ${index + 1}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900 text-lg">${rock}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
  }

  /**
   * Generate Power of One Analysis section
   */
  generatePowerOfOne(powerOfOne) {
    const { priceIncrease, volumeIncrease, cogsDecrease, opexDecrease, inventoryImprovement, salesImprovement, payablesImprovement } = powerOfOne;

    const hasData = priceIncrease || volumeIncrease || cogsDecrease || opexDecrease || inventoryImprovement || salesImprovement || payablesImprovement;

    if (!hasData) {
      return '';
    }

    return `
    <section id="power-of-one" class="${this.designSystem.components.section} ${this.designSystem.print.pageBreak}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Power of One Analysis</h2>
      <p class="${this.designSystem.typography.body.base} mb-6">
        The <strong>Power of One</strong> (from Scaling Up) shows the impact of 1% improvement across seven key levers.
        Small improvements across multiple levers create exponential impact.
      </p>

      <div class="${this.designSystem.components.cardGradient}">
        <div class="grid md:grid-cols-2 gap-6">
          ${priceIncrease ? `
          <div>
            <h4 class="${this.designSystem.typography.headings.h4.full}">💰 1% Price Increase</h4>
            <p class="text-3xl font-bold text-green-600 mb-2">$${priceIncrease.toLocaleString()}</p>
            <p class="text-sm text-gray-600">Additional annual profit from 1% price increase</p>
          </div>
          ` : ''}

          ${volumeIncrease ? `
          <div>
            <h4 class="${this.designSystem.typography.headings.h4.full}">📈 1% Volume Increase</h4>
            <p class="text-3xl font-bold text-blue-600 mb-2">$${volumeIncrease.toLocaleString()}</p>
            <p class="text-sm text-gray-600">Additional annual profit from 1% more sales</p>
          </div>
          ` : ''}

          ${cogsDecrease ? `
          <div>
            <h4 class="${this.designSystem.typography.headings.h4.full}">🏭 1% COGS Decrease</h4>
            <p class="text-3xl font-bold text-purple-600 mb-2">$${cogsDecrease.toLocaleString()}</p>
            <p class="text-sm text-gray-600">Additional annual profit from 1% lower COGS</p>
          </div>
          ` : ''}

          ${opexDecrease ? `
          <div>
            <h4 class="${this.designSystem.typography.headings.h4.full}">💼 1% OpEx Decrease</h4>
            <p class="text-3xl font-bold text-indigo-600 mb-2">$${opexDecrease.toLocaleString()}</p>
            <p class="text-sm text-gray-600">Additional annual profit from 1% lower operating expenses</p>
          </div>
          ` : ''}

          ${inventoryImprovement ? `
          <div>
            <h4 class="${this.designSystem.typography.headings.h4.full}">📦 1% Inventory Days</h4>
            <p class="text-3xl font-bold text-orange-600 mb-2">$${inventoryImprovement.toLocaleString()}</p>
            <p class="text-sm text-gray-600">Cash freed by reducing inventory days 1%</p>
          </div>
          ` : ''}

          ${salesImprovement ? `
          <div>
            <h4 class="${this.designSystem.typography.headings.h4.full}">🤝 1% Sales Days</h4>
            <p class="text-3xl font-bold text-teal-600 mb-2">$${salesImprovement.toLocaleString()}</p>
            <p class="text-sm text-gray-600">Cash freed by collecting receivables 1% faster</p>
          </div>
          ` : ''}

          ${payablesImprovement ? `
          <div>
            <h4 class="${this.designSystem.typography.headings.h4.full}">💳 1% Payables Days</h4>
            <p class="text-3xl font-bold text-pink-600 mb-2">$${payablesImprovement.toLocaleString()}</p>
            <p class="text-sm text-gray-600">Cash preserved by extending payables 1%</p>
          </div>
          ` : ''}
        </div>

        <div class="mt-8 p-4 bg-white/60 rounded-lg">
          <p class="${this.designSystem.typography.body.small}">
            <strong>Strategic Insight:</strong> Focus on the top 3 levers with highest impact and lowest execution risk.
            Achieving 1% improvement on just 3 levers can significantly accelerate profitability and cash flow.
          </p>
        </div>
      </div>
    </section>`;
  }

  /**
   * OVERRIDE: Generate Chart.js initialization for financial chart
   */
  generateCustomScripts(data, config) {
    const { financialMetrics = {} } = data;
    const { monthlyProjections = [] } = financialMetrics;

    if (monthlyProjections.length === 0) {
      return `
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const canvas = document.getElementById('financialChart');
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.font = '16px Inter';
            ctx.fillStyle = '#6B7280';
            ctx.textAlign = 'center';
            ctx.fillText('Financial projection data not available', canvas.width / 2, canvas.height / 2);
          }
        });
      </script>`;
    }

    return `
    <script>
      // Initialize Financial Runway Chart with Chart.js
      document.addEventListener('DOMContentLoaded', function() {
        try {
          const monthlyData = ${JSON.stringify(monthlyProjections)};

          const canvas = document.getElementById('financialChart');
          if (!canvas) {
            console.error('Canvas element not found');
            return;
          }

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.error('Could not get canvas context');
            return;
          }

          console.log('📊 Initializing Chart.js with', monthlyData.length, 'months of data');

          new Chart(ctx, {
            type: 'line',
            data: {
              labels: monthlyData.map((m, i) => 'M' + (i + 1)),
              datasets: [
                {
                  label: 'Revenue',
                  data: monthlyData.map(m => m.revenue?.totalRevenue || 0),
                  borderColor: 'rgb(99, 102, 241)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderWidth: 3,
                  tension: 0.3,
                  fill: true
                },
                {
                  label: 'EBITDA',
                  data: monthlyData.map(m => m.ebitda || 0),
                  borderColor: 'rgb(16, 185, 129)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderWidth: 3,
                  tension: 0.3,
                  fill: true
                },
                {
                  label: 'Cash Position',
                  data: monthlyData.map(m => m.cashFlow?.endingCash || 0),
                  borderColor: 'rgb(245, 158, 11)',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderWidth: 3,
                  tension: 0.3,
                  fill: true
                }
              ]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index',
                intersect: false
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  labels: {
                    font: { size: 14, weight: 'bold', family: 'Inter' },
                    padding: 20
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                        label += ': ';
                      }
                      label += '$' + context.parsed.y.toLocaleString();
                      return label;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '$' + (value / 1000).toFixed(0) + 'K';
                    }
                  }
                }
              }
            }
          });

          console.log('✅ Financial chart initialized successfully');
        } catch (error) {
          console.error('❌ Error initializing chart:', error);
          const canvas = document.getElementById('financialChart');
          if (canvas) {
            canvas.insertAdjacentHTML('afterend',
              '<p class="text-red-600 text-center mt-4">Error loading chart. Please refresh the page.</p>');
          }
        }
      });
    </script>`;
  }
}

module.exports = StrategicPlanningReport;
