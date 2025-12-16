/**
 * ICP DEEP DIVE REPORT TEMPLATE
 *
 * Child class extending OrchestRAIReportMasterTemplate for focused ICP analysis reports.
 * Provides comprehensive psychographic deep-dive into ideal customer profiles.
 *
 * Report Sections:
 * - Customer Avatar Overview (avatar, niche, triggers)
 * - Before/After Transformation (pain → relief journey)
 * - Goals & Aspirations (primary goals, secondary goals, dreams)
 * - Complaints & Pain Points (categorized by theme)
 * - Objections & Barriers (price, trust, time objections)
 * - Bad Habits & Consequences (current behaviors)
 * - Biggest Fears (emotional, financial, social, health)
 * - Statistics & Market Data
 * - Customer Journey Map
 *
 * Usage:
 *   const ICPDeepDiveReport = require('./ICPDeepDiveReport');
 *   const report = new ICPDeepDiveReport();
 *   const html = report.generate(data, config);
 */

const OrchestRAIReportMasterTemplate = require('./OrchestRAIReportMasterTemplate');

class ICPDeepDiveReport extends OrchestRAIReportMasterTemplate {
  constructor() {
    super();
  }

  /**
   * OVERRIDE: Generate ICP deep dive-specific content
   * @param {Object} data - ICP deep dive data
   * @param {string} data.avatar - Primary customer avatar
   * @param {string} data.niche - Market niche
   * @param {string} data.trigger - Trigger events
   * @param {Array|string} data.before - Before transformation states
   * @param {Array|string} data.after - After transformation states
   * @param {Array|string} data.primaryGoals - Primary goals
   * @param {Array|string} data.secondaryGoals - Secondary goals
   * @param {Array|string} data.dreams - Dreams and aspirations
   * @param {Object} data.complaints - Complaints categorized by theme
   * @param {Object} data.objections - Objections (price, trust, time)
   * @param {Object} data.badHabits - Bad habits and consequences
   * @param {Object} data.fears - Fears (emotional, financial, social, health)
   * @param {Object} data.statistics - Market statistics
   * @param {Object} data.journey - Customer journey stages
   * @param {Object} config - Report configuration
   */
  generateMainContent(data, config) {
    return `
    <!-- Table of Contents -->
    ${this.generateTableOfContents()}

    <!-- Customer Avatar Overview -->
    ${this.generateAvatarOverview(data)}

    <!-- Before/After Transformation -->
    ${data.before && data.after ? this.generateBeforeAfterSection(data) : ''}

    <!-- Goals & Aspirations -->
    ${this.generateGoalsSection(data)}

    <!-- Complaints & Pain Points -->
    ${data.complaints ? this.generateComplaintsSection(data.complaints) : ''}

    <!-- Objections & Barriers -->
    ${data.objections ? this.generateObjectionsSection(data.objections) : ''}

    <!-- Bad Habits & Consequences -->
    ${data.badHabits ? this.generateBadHabitsSection(data.badHabits) : ''}

    <!-- Biggest Fears -->
    ${data.fears ? this.generateFearsSection(data.fears) : ''}

    <!-- Statistics & Market Data -->
    ${data.statistics ? this.generateStatisticsSection(data.statistics) : ''}

    <!-- Customer Journey -->
    ${data.journey ? this.generateJourneySection(data.journey) : ''}

    <!-- Raw Data Viewer -->
    ${this.generateJSONViewer(data, 'Complete ICP Data')}
    `;
  }

  /**
   * Generate Table of Contents
   */
  generateTableOfContents() {
    const sections = [
      { id: 'avatar', title: 'Customer Avatar', color: 'purple', icon: '👤' },
      { id: 'before-after', title: 'Before/After States', color: 'blue', icon: '🔄' },
      { id: 'goals', title: 'Goals & Dreams', color: 'green', icon: '🎯' },
      { id: 'complaints', title: 'Pain Points & Complaints', color: 'red', icon: '⚠️' },
      { id: 'objections', title: 'Objections & Barriers', color: 'yellow', icon: '🤔' },
      { id: 'bad-habits', title: 'Bad Habits & Consequences', color: 'orange', icon: '🚫' },
      { id: 'fears', title: 'Biggest Fears', color: 'purple', icon: '😰' },
      { id: 'statistics', title: 'Statistics & Market Data', color: 'indigo', icon: '📊' },
      { id: 'journey', title: 'Customer Journey', color: 'pink', icon: '🗺️' }
    ];

    return `
    <section id="table-of-contents" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Table of Contents</h2>

      <div class="${this.designSystem.components.grid3}">
        ${sections.map(item => `
          <a href="#${item.id}" class="block p-5 border-l-4 border-${item.color}-500 bg-gray-50 hover:bg-gray-100 transition rounded-r-lg ${this.designSystem.print.hide}">
            <div class="flex items-center mb-2">
              <span class="text-2xl mr-2">${item.icon}</span>
              <span class="font-semibold text-gray-900">${item.title}</span>
            </div>
            <div class="text-sm text-gray-600">Deep dive analysis</div>
          </a>
        `).join('')}
      </div>
    </section>`;
  }

  /**
   * Generate Customer Avatar Overview
   */
  generateAvatarOverview(data) {
    if (!data.avatar && !data.niche && !data.trigger) return '';

    return `
    <section id="avatar" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Customer Avatar Overview</h2>

      <div class="${this.designSystem.components.grid3}">
        ${data.avatar ? `
        <div class="${this.designSystem.components.cardGradient}">
          <h3 class="${this.designSystem.typography.headings.h3.full}">👤 Primary Avatar</h3>
          <p class="text-lg text-gray-800">${data.avatar}</p>
        </div>
        ` : ''}

        ${data.niche ? `
        <div class="${this.designSystem.components.cardGradient}">
          <h3 class="${this.designSystem.typography.headings.h3.full}">🎯 Market Niche</h3>
          <p class="text-lg text-gray-800">${data.niche}</p>
        </div>
        ` : ''}

        ${data.trigger ? `
        <div class="${this.designSystem.components.cardGradient}">
          <h3 class="${this.designSystem.typography.headings.h3.full}">⚡ Trigger Events</h3>
          <p class="text-lg text-gray-800">${data.trigger}</p>
        </div>
        ` : ''}
      </div>
    </section>`;
  }

  /**
   * Generate Before/After Transformation Section
   */
  generateBeforeAfterSection(data) {
    const before = this.stringToArray(data.before);
    const after = this.stringToArray(data.after);

    return `
    <section id="before-after" class="${this.designSystem.components.section} ${this.designSystem.print.pageBreak}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Before/After Transformation</h2>
      <p class="${this.designSystem.typography.body.base} mb-8">
        Understanding the customer's journey from pain to relief
      </p>

      <div class="${this.designSystem.components.grid2}">
        <!-- BEFORE State -->
        <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-8">
          <div class="flex items-center mb-6">
            <div class="bg-red-500 text-white rounded-full w-14 h-14 flex items-center justify-center mr-4 text-2xl">
              ❌
            </div>
            <h3 class="${this.designSystem.typography.headings.h3.full} mb-0 text-red-900">BEFORE</h3>
          </div>
          <div class="space-y-4">
            ${before.map(item => `
              <div class="bg-white bg-opacity-60 rounded-lg p-4 border-l-4 border-red-500">
                <p class="text-red-900">${item}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- AFTER State -->
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8">
          <div class="flex items-center mb-6">
            <div class="bg-green-500 text-white rounded-full w-14 h-14 flex items-center justify-center mr-4 text-2xl">
              ✅
            </div>
            <h3 class="${this.designSystem.typography.headings.h3.full} mb-0 text-green-900">AFTER</h3>
          </div>
          <div class="space-y-4">
            ${after.map(item => `
              <div class="bg-white bg-opacity-60 rounded-lg p-4 border-l-4 border-green-500">
                <p class="text-green-900">${item}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </section>`;
  }

  /**
   * Generate Goals & Aspirations Section
   */
  generateGoalsSection(data) {
    if (!data.primaryGoals && !data.secondaryGoals && !data.dreams) return '';

    const primaryGoals = this.stringToArray(data.primaryGoals);
    const secondaryGoals = this.stringToArray(data.secondaryGoals);
    const dreams = this.stringToArray(data.dreams);

    return `
    <section id="goals" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">Goals & Aspirations</h2>
      <p class="${this.designSystem.typography.body.base} mb-8">
        What customers want to achieve and become
      </p>

      <div class="grid md:grid-cols-${dreams.length > 0 ? '3' : '2'} gap-6">
        ${primaryGoals.length > 0 ? `
        <div class="${this.designSystem.components.card}">
          <h3 class="${this.designSystem.typography.headings.h3.full}">🎯 Primary Goals</h3>
          <ul class="${this.designSystem.components.list}">
            ${primaryGoals.map(goal => `
              <li class="${this.designSystem.components.listItem}">
                <span class="${this.designSystem.components.listBullet}">▸</span>
                <span class="text-sm">${goal}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${secondaryGoals.length > 0 ? `
        <div class="${this.designSystem.components.card}">
          <h3 class="${this.designSystem.typography.headings.h3.full}">🎲 Secondary Goals</h3>
          <ul class="${this.designSystem.components.list}">
            ${secondaryGoals.map(goal => `
              <li class="${this.designSystem.components.listItem}">
                <span class="text-blue-400 mr-2">○</span>
                <span class="text-sm">${goal}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${dreams.length > 0 ? `
        <div class="${this.designSystem.components.card} bg-gradient-to-br from-purple-50 to-pink-50">
          <h3 class="${this.designSystem.typography.headings.h3.full}">✨ Dreams & Aspirations</h3>
          <ul class="${this.designSystem.components.list}">
            ${dreams.map(dream => `
              <li class="${this.designSystem.components.listItem}">
                <span class="text-purple-500 mr-2">⭐</span>
                <span class="text-sm">${dream}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    </section>`;
  }

  /**
   * Generate Complaints Section (categorized)
   */
  generateComplaintsSection(complaints) {
    return `
    <section id="complaints" class="${this.designSystem.components.section} ${this.designSystem.print.pageBreak}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">⚠️ Pain Points & Complaints</h2>

      <div class="${this.designSystem.components.grid2}">
        ${Object.entries(complaints).map(([category, items]) => `
          <div class="${this.designSystem.components.card} border-l-4 border-red-500">
            <h3 class="${this.designSystem.typography.headings.h3.full} capitalize">${category}</h3>
            <ul class="${this.designSystem.components.list}">
              ${this.stringToArray(items).map(item => `
                <li class="${this.designSystem.components.listItem}">
                  <span class="text-red-500 mr-2">!</span>
                  <span class="text-sm">${item}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
    </section>`;
  }

  /**
   * Generate Objections Section (price, trust, time)
   */
  generateObjectionsSection(objections) {
    const objectionTypes = [
      { key: 'price', title: 'Price Objections', icon: '💰', color: 'yellow' },
      { key: 'trust', title: 'Trust Objections', icon: '🤝', color: 'orange' },
      { key: 'time', title: 'Time Objections', icon: '⏰', color: 'blue' }
    ];

    return `
    <section id="objections" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">🤔 Objections & Barriers</h2>

      <div class="${this.designSystem.components.grid3}">
        ${objectionTypes.map(({ key, title, icon, color }) => `
          ${objections[key] ? `
          <div class="${this.designSystem.components.card} bg-${color}-50 border-l-4 border-${color}-500">
            <h3 class="${this.designSystem.typography.headings.h3.full}">${icon} ${title}</h3>
            <ul class="${this.designSystem.components.list}">
              ${this.stringToArray(objections[key]).map(obj => `
                <li class="${this.designSystem.components.listItem}">
                  <span class="text-${color}-500 mr-2">"</span>
                  <span class="text-sm italic">${obj}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          ` : ''}
        `).join('')}
      </div>
    </section>`;
  }

  /**
   * Generate Bad Habits Section
   */
  generateBadHabitsSection(badHabits) {
    return `
    <section id="bad-habits" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">🚫 Bad Habits & Consequences</h2>

      <div class="${this.designSystem.components.grid2}">
        ${badHabits.habits ? `
        <div class="${this.designSystem.components.card} bg-orange-50 border-l-4 border-orange-500">
          <h3 class="${this.designSystem.typography.headings.h3.full}">Current Bad Habits</h3>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(badHabits.habits).map(habit => `
              <li class="${this.designSystem.components.listItem}">
                <span class="text-orange-500 mr-2">⊘</span>
                <span class="text-sm">${habit}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${badHabits.consequences ? `
        <div class="${this.designSystem.components.card} bg-red-50 border-l-4 border-red-500">
          <h3 class="${this.designSystem.typography.headings.h3.full}">Consequences</h3>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(badHabits.consequences).map(consequence => `
              <li class="${this.designSystem.components.listItem}">
                <span class="text-red-500 mr-2">▼</span>
                <span class="text-sm">${consequence}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    </section>`;
  }

  /**
   * Generate Fears Section (emotional, financial, social, health)
   */
  generateFearsSection(fears) {
    const fearTypes = [
      { key: 'emotional', title: 'Emotional Fears', icon: '💔', color: 'purple' },
      { key: 'financial', title: 'Financial Fears', icon: '💸', color: 'red' },
      { key: 'social', title: 'Social Fears', icon: '👥', color: 'blue' },
      { key: 'health', title: 'Health Fears', icon: '🏥', color: 'green' }
    ];

    return `
    <section id="fears" class="${this.designSystem.components.section} ${this.designSystem.print.pageBreak}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">😰 Biggest Fears</h2>

      <div class="${this.designSystem.components.grid2}">
        ${fearTypes.map(({ key, title, icon, color }) => `
          ${fears[key] ? `
          <div class="${this.designSystem.components.card} bg-${color}-50 border-l-4 border-${color}-500">
            <h3 class="${this.designSystem.typography.headings.h3.full}">${icon} ${title}</h3>
            <ul class="${this.designSystem.components.list}">
              ${this.stringToArray(fears[key]).map(fear => `
                <li class="${this.designSystem.components.listItem}">
                  <span class="text-${color}-500 mr-2">!</span>
                  <span class="text-sm">${fear}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          ` : ''}
        `).join('')}
      </div>
    </section>`;
  }

  /**
   * Generate Statistics Section
   */
  generateStatisticsSection(statistics) {
    return `
    <section id="statistics" class="${this.designSystem.components.section}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">📊 Statistics & Market Data</h2>

      <div class="${this.designSystem.components.grid2}">
        ${statistics.negative ? `
        <div class="${this.designSystem.components.card} bg-red-50 border-l-4 border-red-500">
          <h3 class="${this.designSystem.typography.headings.h3.full}">⚠️ Pain Point Statistics</h3>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(statistics.negative).slice(0, 7).map(stat => `
              <li class="${this.designSystem.components.listItem}">
                <span class="${this.designSystem.components.listBullet}">▸</span>
                <span class="text-sm">${stat}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${statistics.general ? `
        <div class="${this.designSystem.components.card} bg-blue-50 border-l-4 border-blue-500">
          <h3 class="${this.designSystem.typography.headings.h3.full}">📈 General Statistics</h3>
          <ul class="${this.designSystem.components.list}">
            ${this.stringToArray(statistics.general).slice(0, 7).map(stat => `
              <li class="${this.designSystem.components.listItem}">
                <span class="${this.designSystem.components.listBullet}">▸</span>
                <span class="text-sm">${stat}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}
      </div>
    </section>`;
  }

  /**
   * Generate Customer Journey Section
   */
  generateJourneySection(journey) {
    const stages = journey.stages || [];

    return `
    <section id="journey" class="${this.designSystem.components.section} ${this.designSystem.print.pageBreak}">
      <h2 class="${this.designSystem.typography.headings.h2.full}">🗺️ Customer Journey</h2>
      <p class="${this.designSystem.typography.body.base} mb-8">
        Mapping the complete customer experience from awareness to advocacy
      </p>

      <div class="space-y-6">
        ${stages.map((stage, idx) => `
          <div class="${this.designSystem.components.cardGradient}">
            <div class="flex items-center mb-4">
              <div class="bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold text-lg mr-4">
                ${idx + 1}
              </div>
              <div class="flex-1">
                <h3 class="${this.designSystem.typography.headings.h3.full} mb-0">${stage.name}</h3>
                <p class="text-sm text-gray-600">${stage.description || ''}</p>
              </div>
            </div>

            ${stage.activities ? `
            <div class="mt-4">
              <h4 class="${this.designSystem.typography.headings.h4.full}">Activities</h4>
              <ul class="${this.designSystem.components.list}">
                ${this.stringToArray(stage.activities).map(activity => `
                  <li class="${this.designSystem.components.listItem}">
                    <span class="${this.designSystem.components.listBullet}">▸</span>
                    <span class="text-sm">${activity}</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>`;
  }
}

module.exports = ICPDeepDiveReport;
