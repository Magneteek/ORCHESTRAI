/**
 * CLIENT INTELLIGENCE REPORT TEMPLATE
 *
 * Child class extending OrchestRAIReportMasterTemplate for comprehensive client
 * intelligence reports including ICP analysis, psychographics, EOS framework,
 * and market positioning.
 *
 * Report Sections:
 * - Executive Summary (key findings + opportunities)
 * - EOS Overview (Core Values, Core Focus, Marketing Strategy)
 * - ICP Framework (Before/After transformation, Goals/Fears/Objections)
 * - Personas Grid (multiple customer personas)
 * - Psychographic Matrix (cultural values + emotional triggers)
 * - Market Analysis (trends, pain points, opportunities)
 * - Competitive Matrix (competitor positioning)
 * - Strategy Cards (recommendations)
 * - Journey Map (customer journey stages + keywords)
 *
 * Usage:
 *   const ClientIntelligenceReport = require('./ClientIntelligenceReport');
 *   const report = new ClientIntelligenceReport();
 *   const html = report.generate(data, config);
 */

const OrchestRAIReportMasterTemplate = require('./OrchestRAIReportMasterTemplate');

class ClientIntelligenceReport extends OrchestRAIReportMasterTemplate {
  constructor() {
    super();
  }

  /**
   * OVERRIDE: Generate client intelligence-specific content
   * @param {Object} data - Client intelligence data
   * @param {Object} data.summary - Executive summary with key findings
   * @param {Object} data.eos - EOS framework (Core Values, Core Focus, Marketing Strategy)
   * @param {Object} data.icp - Ideal Customer Profile framework
   * @param {Array} data.personas - Customer personas
   * @param {Object} data.psychographics - Psychographic analysis
   * @param {Object} data.marketAnalysis - Market trends and opportunities
   * @param {Object} data.competitive - Competitive positioning
   * @param {Array} data.strategy - Strategic recommendations
   * @param {Object} data.journeyMap - Customer journey mapping
   * @param {Object} config - Report configuration
   */
  generateMainContent(data, config) {
    const {
      summary,
      eos,
      icp,
      personas = [],
      psychographics,
      marketAnalysis,
      competitive,
      strategy = [],
      journeyMap,
      rawData
    } = data;

    return `
    <!-- Executive Summary -->
    ${summary ? this.generateExecutiveSummary(summary) : ''}

    <!-- EOS Framework Overview -->
    ${eos ? this.generateEOSOverview(eos) : ''}

    <!-- ICP Framework -->
    ${icp ? this.generateICPFramework(icp) : ''}

    <!-- Customer Personas -->
    ${personas.length > 0 ? this.generatePersonasGrid(personas) : ''}

    <!-- Psychographic Matrix -->
    ${psychographics ? this.generatePsychographicMatrix(psychographics) : ''}

    <!-- Market Analysis -->
    ${marketAnalysis ? this.generateMarketAnalysis(marketAnalysis) : ''}

    <!-- Competitive Positioning -->
    ${competitive ? this.generateCompetitiveMatrix(competitive) : ''}

    <!-- Strategic Recommendations -->
    ${strategy.length > 0 ? this.generateStrategyCards(strategy) : ''}

    <!-- Customer Journey Map -->
    ${journeyMap ? this.generateJourneyMap(journeyMap) : ''}

    <!-- Raw Data Viewer -->
    ${rawData ? this.generateJSONViewer(rawData, 'Complete Intelligence Data') : ''}
    `;
  }

  /**
   * Generate EOS Framework Overview section
   */
  generateEOSOverview(eos) {
    return `
    <section id="eos-overview" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">EOS Business Framework</h2>

      ${eos.coreValues && eos.coreValues.length > 0 ? `
      <div class="${this.designSystem.components.cardGradient} mb-8">
        <h3 class="${this.designSystem.typography.headings.h3.full}">⭐ Core Values</h3>
        <div class="${this.designSystem.components.grid2}">
          ${eos.coreValues.map((value, idx) => `
            <div class="${this.designSystem.components.card}">
              <div class="flex items-start">
                <span class="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                <div>
                  <div class="font-semibold text-lg mb-1">${value.name}</div>
                  <div class="text-sm text-gray-600">${value.description}</div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${eos.coreFocus ? `
      <div class="${this.designSystem.components.cardGradient} mb-8">
        <h3 class="${this.designSystem.typography.headings.h3.full}">🎯 Core Focus</h3>
        <div class="${this.designSystem.components.grid2}">
          <div class="${this.designSystem.components.card}">
            <div class="text-sm font-medium text-purple-600 mb-2">Purpose / Passion</div>
            <div class="text-lg font-semibold">${eos.coreFocus.purpose}</div>
          </div>
          <div class="${this.designSystem.components.card}">
            <div class="text-sm font-medium text-purple-600 mb-2">Our Niche</div>
            <div class="text-lg font-semibold">${eos.coreFocus.niche}</div>
          </div>
        </div>
      </div>
      ` : ''}

      ${eos.marketingStrategy ? `
      <div class="${this.designSystem.components.cardGradient}">
        <h3 class="${this.designSystem.typography.headings.h3.full}">📈 Marketing Strategy</h3>

        ${eos.marketingStrategy.targetMarket ? `
        <div class="mb-6">
          <h4 class="${this.designSystem.typography.headings.h4.full}">Target Market</h4>
          <div class="flex flex-wrap gap-2">
            ${eos.marketingStrategy.targetMarket.map(market => `
              ${this.generateBadge(market, 'medium')}
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${eos.marketingStrategy.threeUniques ? `
        <div class="mb-6">
          <h4 class="${this.designSystem.typography.headings.h4.full}">Three Uniques</h4>
          <div class="${this.designSystem.components.grid3}">
            ${eos.marketingStrategy.threeUniques.map((unique, idx) => `
              <div class="${this.designSystem.components.card} text-center">
                <div class="text-4xl mb-3">${['🏆', '💎', '⚡'][idx]}</div>
                <div class="font-medium">${unique}</div>
              </div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        ${eos.marketingStrategy.guarantee ? `
        <div class="${this.designSystem.components.card} ${this.designSystem.components.borderLeft} border-green-500">
          <div class="font-semibold mb-2">Our Guarantee</div>
          <div class="text-lg italic text-gray-700">"${eos.marketingStrategy.guarantee}"</div>
        </div>
        ` : ''}
      </div>
      ` : ''}
    </section>`;
  }

  /**
   * Generate ICP Framework section
   */
  generateICPFramework(icp) {
    return `
    <section id="icp-framework" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Ideal Customer Profile (ICP)</h2>

      ${icp.avatar || icp.niche ? `
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 shadow-lg mb-8">
        ${icp.avatar ? `<h3 class="text-3xl font-bold mb-2">${icp.avatar}</h3>` : ''}
        ${icp.niche ? `<p class="text-xl text-indigo-100">${icp.niche}</p>` : ''}
      </div>
      ` : ''}

      ${icp.before && icp.after ? `
      <div class="${this.designSystem.components.grid2} mb-8">
        <div class="bg-red-50 rounded-xl p-6 border-2 border-red-200">
          <h4 class="${this.designSystem.typography.headings.h4.full} text-red-800">
            <span class="mr-2">❌</span> Before
          </h4>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(icp.before).map(item => `
              <li class="${this.designSystem.components.listItem}">
                <span class="text-red-500 mr-2 flex-shrink-0">•</span>
                <span class="text-sm text-gray-700">${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <div class="bg-green-50 rounded-xl p-6 border-2 border-green-200">
          <h4 class="${this.designSystem.typography.headings.h4.full} text-green-800">
            <span class="mr-2">✅</span> After
          </h4>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(icp.after).map(item => `
              <li class="${this.designSystem.components.listItem}">
                <span class="text-green-500 mr-2 flex-shrink-0">✓</span>
                <span class="text-sm text-gray-700">${item}</span>
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
      ` : ''}

      <div class="${this.designSystem.components.grid2} mb-8">
        ${icp.primaryGoals ? `
        <div class="${this.designSystem.components.card}">
          <h4 class="${this.designSystem.typography.headings.h4.full}">
            <span class="text-2xl mr-2">🎯</span> Primary Goals
          </h4>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(icp.primaryGoals).map(goal => `
              <li class="${this.designSystem.components.listItem}">
                <span class="${this.designSystem.components.listBullet}">▸</span>
                <span class="text-sm">${goal}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${icp.dreams ? `
        <div class="${this.designSystem.components.card}">
          <h4 class="${this.designSystem.typography.headings.h4.full}">
            <span class="text-2xl mr-2">✨</span> Dreams
          </h4>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(icp.dreams).map(dream => `
              <li class="${this.designSystem.components.listItem}">
                <span class="text-purple-500 mr-2 flex-shrink-0">⭐</span>
                <span class="text-sm">${dream}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>

      <div class="${this.designSystem.components.grid2}">
        ${icp.biggestFear ? `
        <div class="bg-red-50 rounded-xl p-6 border border-red-200">
          <h4 class="${this.designSystem.typography.headings.h4.full} text-red-800">
            <span class="text-2xl mr-2">😰</span> Biggest Fears
          </h4>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(icp.biggestFear).map(fear => `
              <li class="${this.designSystem.components.listItem}">
                <span class="text-red-500 mr-2">!</span>
                <span class="text-sm">${fear}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${icp.objections ? `
        <div class="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <h4 class="${this.designSystem.typography.headings.h4.full} text-yellow-800">
            <span class="text-2xl mr-2">🤔</span> Common Objections
          </h4>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(icp.objections).map(obj => `
              <li class="${this.designSystem.components.listItem}">
                <span class="text-yellow-500 mr-2">"</span>
                <span class="text-sm italic text-gray-700">${obj}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    </section>`;
  }

  /**
   * Generate Personas Grid section
   */
  generatePersonasGrid(personas) {
    return `
    <section id="customer-personas" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Customer Personas</h2>

      <div class="grid md:grid-cols-${Math.min(personas.length, 3)} gap-8">
        ${personas.map((persona, idx) => `
          <div class="${this.designSystem.components.card} overflow-hidden p-0">
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
              <div class="text-4xl mb-2">${['👩‍💼', '👨‍💼', '👵', '👨‍🏫', '👩‍⚕️'][idx] || '👤'}</div>
              <h3 class="text-2xl font-bold">${persona.name}</h3>
            </div>

            <div class="p-6 space-y-4">
              ${persona.motivation && persona.motivation.length > 0 ? `
              <div>
                <h4 class="font-semibold text-sm text-gray-600 mb-2 uppercase">Motivation</h4>
                <ul class="space-y-1">
                  ${persona.motivation.slice(0, 3).map(m => `
                    <li class="text-sm flex items-start">
                      <span class="text-green-500 mr-1">✓</span>
                      <span>${m}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
              ` : ''}

              ${persona.fears && persona.fears.length > 0 ? `
              <div>
                <h4 class="font-semibold text-sm text-gray-600 mb-2 uppercase">Fears</h4>
                <ul class="space-y-1">
                  ${persona.fears.slice(0, 3).map(f => `
                    <li class="text-sm flex items-start">
                      <span class="text-red-500 mr-1">⚠</span>
                      <span>${f}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
              ` : ''}

              ${persona.goals && persona.goals.length > 0 ? `
              <div>
                <h4 class="font-semibold text-sm text-gray-600 mb-2 uppercase">Goals</h4>
                <ul class="space-y-1">
                  ${persona.goals.slice(0, 3).map(g => `
                    <li class="text-sm flex items-start">
                      <span class="text-blue-500 mr-1">→</span>
                      <span>${g}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>`;
  }

  /**
   * Generate Psychographic Matrix section
   */
  generatePsychographicMatrix(psychographics) {
    return `
    <section id="psychographics" class="${this.designSystem.components.section} ${this.designSystem.print.pageBreak}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Psychographic Matrix</h2>
      <p class="${this.designSystem.typography.body.base} mb-8">
        Deep psychographic analysis of customer motivations, values, and emotional triggers.
      </p>

      <div class="${this.designSystem.components.grid2}">
        ${psychographics.values ? Object.entries(psychographics.values).map(([key, value]) => `
          <div class="${this.designSystem.components.cardHover}">
            <h3 class="${this.designSystem.typography.headings.h3.full} capitalize">${key}</h3>

            ${value.motivation ? `
            <div class="mb-4">
              <div class="text-sm font-medium text-gray-600 mb-2">Psychological Motivation</div>
              <p class="text-gray-700">${value.motivation}</p>
            </div>
            ` : ''}

            ${value.emotionalTone ? `
            <div class="mb-4">
              <div class="text-sm font-medium text-gray-600 mb-2">Emotional Tone</div>
              <div class="flex flex-wrap gap-2">
                ${value.emotionalTone.split(',').map(emotion =>
                  this.generateBadge(emotion.trim(), 'low')
                ).join('')}
              </div>
            </div>
            ` : ''}

            ${value.triggers ? `
            <div>
              <div class="text-sm font-medium text-gray-600 mb-2">Key Triggers</div>
              <ul class="${this.designSystem.components.list}">
                ${this.stringToArray(value.triggers).slice(0, 4).map(trigger => `
                  <li class="${this.designSystem.components.listItem}">
                    <span class="${this.designSystem.components.listBullet}">▸</span>
                    <span class="text-sm">${trigger}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}
          </div>
        `).join('') : ''}
      </div>
    </section>`;
  }

  /**
   * Generate Market Analysis section
   */
  generateMarketAnalysis(marketAnalysis) {
    return `
    <section id="market-analysis" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Market Analysis</h2>

      ${marketAnalysis.trends ? `
      <div class="${this.designSystem.components.cardGradient} mb-8">
        <h3 class="${this.designSystem.typography.headings.h3.full}">📊 Market Trends</h3>
        <ul class="${this.designSystem.components.list}">
          ${this.stringToArray(marketAnalysis.trends).map(trend => `
            <li class="${this.designSystem.components.listItem}">
              <span class="${this.designSystem.components.listBullet}">✓</span>
              <span>${trend}</span>
            </li>
          `).join('')}
        </ul>
      </div>
      ` : ''}

      ${marketAnalysis.painPoints ? `
      <div class="${this.designSystem.components.cardGradient} mb-8">
        <h3 class="${this.designSystem.typography.headings.h3.full}">⚠️ Market Pain Points</h3>
        <div class="${this.designSystem.components.grid2}">
          ${this.stringToArray(marketAnalysis.painPoints).map(pain => `
            <div class="${this.designSystem.components.card} border-l-4 border-red-500">
              <p class="text-gray-700">${pain}</p>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${marketAnalysis.opportunities ? `
      <div class="${this.designSystem.components.cardGradient}">
        <h3 class="${this.designSystem.typography.headings.h3.full}">💡 Strategic Opportunities</h3>
        <div class="${this.designSystem.components.grid2}">
          ${this.stringToArray(marketAnalysis.opportunities).map(opp => `
            <div class="${this.designSystem.components.card} border-l-4 border-green-500">
              <p class="text-gray-700">${opp}</p>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </section>`;
  }

  /**
   * Generate Competitive Matrix section
   */
  generateCompetitiveMatrix(competitive) {
    return `
    <section id="competitive-positioning" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Competitive Positioning</h2>

      ${competitive.differentiators ? `
      <div class="${this.designSystem.components.cardGradient} mb-8">
        <h3 class="${this.designSystem.typography.headings.h3.full}">🏆 Key Differentiators</h3>
        <div class="${this.designSystem.components.grid2}">
          ${this.stringToArray(competitive.differentiators).map((diff, idx) => `
            <div class="${this.designSystem.components.card} border-l-4 border-purple-500">
              <div class="flex items-start">
                <span class="text-3xl mr-3">${['⚡', '💎', '🎯', '🚀'][idx] || '✨'}</span>
                <p class="text-gray-700 flex-1">${diff}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${competitive.competitors && competitive.competitors.length > 0 ? `
      <div class="${this.designSystem.components.card}">
        <h3 class="${this.designSystem.typography.headings.h3.full}">Competitive Landscape</h3>
        ${this.generateTable(
          ['Competitor', 'Strengths', 'Weaknesses', 'Our Advantage'],
          competitive.competitors.map(comp => [
            comp.name,
            comp.strengths?.slice(0, 2).join(', ') || 'N/A',
            comp.weaknesses?.slice(0, 2).join(', ') || 'N/A',
            comp.ourAdvantage || 'N/A'
          ])
        )}
      </div>
      ` : ''}
    </section>`;
  }

  /**
   * Generate Strategy Cards section
   */
  generateStrategyCards(strategy) {
    return `
    <section id="strategic-recommendations" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Strategic Recommendations</h2>

      <div class="${this.designSystem.components.grid2}">
        ${strategy.map((item, idx) => `
          <div class="${this.designSystem.components.cardHover} border-l-4 ${idx % 2 === 0 ? 'border-blue-500' : 'border-purple-500'}">
            <div class="flex items-center mb-4">
              <span class="text-4xl mr-3">${['🎯', '📈', '💡', '🚀', '⚡', '💎'][idx] || '✨'}</span>
              <h3 class="${this.designSystem.typography.headings.h3.full} mb-0">${item.title || `Strategy ${idx + 1}`}</h3>
            </div>
            <p class="${this.designSystem.typography.body.base} mb-4">${item.description || item}</p>
            ${item.priority ? this.generateBadge(`Priority: ${item.priority}`, item.priority === 'High' ? 'high' : item.priority === 'Medium' ? 'medium' : 'low') : ''}
          </div>
        `).join('')}
      </div>
    </section>`;
  }

  /**
   * Generate Customer Journey Map section
   */
  generateJourneyMap(journeyMap) {
    const stages = journeyMap.stages || [];

    return `
    <section id="customer-journey" class="${this.designSystem.components.section} ${this.designSystem.print.pageBreak}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Customer Journey Map</h2>
      <p class="${this.designSystem.typography.body.base} mb-8">
        Comprehensive mapping of customer touchpoints, emotions, and keyword alignment throughout the buying journey.
      </p>

      <div class="space-y-8">
        ${stages.map((stage, idx) => `
          <div class="${this.designSystem.components.cardGradient}">
            <div class="flex items-center mb-6">
              <div class="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                ${idx + 1}
              </div>
              <div class="flex-1">
                <h3 class="${this.designSystem.typography.headings.h3.full} mb-0">${stage.name}</h3>
                <p class="text-sm text-gray-600">${stage.description || ''}</p>
              </div>
            </div>

            <div class="grid md:grid-cols-2 gap-6">
              ${stage.touchpoints ? `
              <div>
                <h4 class="${this.designSystem.typography.headings.h4.full}">🎯 Touchpoints</h4>
                <ul class="${this.designSystem.components.list}">
                  ${this.stringToArray(stage.touchpoints).map(tp => `
                    <li class="${this.designSystem.components.listItem}">
                      <span class="${this.designSystem.components.listBullet}">▸</span>
                      <span class="text-sm">${tp}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
              ` : ''}

              ${stage.emotions ? `
              <div>
                <h4 class="${this.designSystem.typography.headings.h4.full}">💭 Emotions</h4>
                <div class="flex flex-wrap gap-2">
                  ${this.stringToArray(stage.emotions).map(emotion =>
                    this.generateBadge(emotion, 'medium')
                  ).join('')}
                </div>
              </div>
              ` : ''}
            </div>

            ${stage.keywords ? `
            <div class="mt-6">
              <h4 class="${this.designSystem.typography.headings.h4.full}">🔍 Target Keywords</h4>
              <div class="flex flex-wrap gap-2">
                ${this.stringToArray(stage.keywords).map(keyword =>
                  `<span class="text-sm bg-white px-3 py-1 rounded-full border border-purple-200">${keyword}</span>`
                ).join('')}
              </div>
            </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>`;
  }
}

module.exports = ClientIntelligenceReport;
