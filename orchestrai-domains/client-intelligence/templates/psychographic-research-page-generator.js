/**
 * PSYCHOGRAPHIC RESEARCH PAGE TEMPLATE GENERATOR
 *
 * Creates comprehensive psychographic analysis pages including:
 * - Cultural Values Matrix
 * - Behavioral Patterns
 * - Emotional Triggers
 * - Communication Preferences
 * - Trust Building Factors
 * - Persona Profiles
 * - Past Experiences & Failed Attempts
 *
 * Output: Self-contained HTML with export toolbar
 */

class PsychographicResearchPageGenerator {
  constructor() {
    this.colors = {
      primary: '#3B82F6',      // Blue
      success: '#10B981',      // Green
      warning: '#F59E0B',      // Amber
      danger: '#EF4444',       // Red
      purple: '#8B5CF6',       // Purple
      indigo: '#6366F1',       // Indigo
      pink: '#EC4899',         // Pink
      teal: '#14B8A6'          // Teal
    };
  }

  /**
   * Generate complete Psychographic Research HTML page
   */
  generate(data, clientName) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${this.generateHead(clientName)}
</head>
<body class="bg-gray-50 text-gray-900">
    ${this.generateNavigation(clientName)}
    ${this.generateHeader(data, clientName)}
    ${this.generateTableOfContents()}
    ${this.generateCulturalValuesSection(data)}
    ${this.generateBehavioralPatternsSection(data)}
    ${this.generateEmotionalTriggersSection(data)}
    ${this.generatePersonasSection(data)}
    ${this.generatePastExperiencesSection(data)}
    ${this.generateTrustFactorsSection(data)}
    ${this.generateFooter(clientName)}
    ${this.generateScripts()}
</body>
</html>`;
  }

  /**
   * Generate HTML head
   */
  generateHead(clientName) {
    return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Psychographic Research - ${clientName}</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

    <!-- html2pdf.js for PDF export -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

    <!-- ORCHESTRAI Export Module -->
    <script src="../../../orchestrai-domains/client-intelligence/templates/report-export-module.js"></script>

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        @media print {
            .no-print { display: none !important; }
            .page-break { page-break-before: always; }
        }

        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .gradient-psycho {
            background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
        }

        .section-divider {
            background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            height: 3px;
            border-radius: 2px;
        }
    </style>`;
  }

  /**
   * Generate navigation bar
   */
  generateNavigation(clientName) {
    return `
    <nav class="no-print sticky top-0 z-50 bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <h1 class="text-xl font-bold text-orange-600">Psychographic Research</h1>
                    <span class="ml-4 text-gray-500">|</span>
                    <span class="ml-4 text-gray-700">${clientName}</span>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="comprehensive-intelligence-report.html" class="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Back to Overview
                    </a>
                    <button onclick="window.print()" class="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition text-sm font-medium">
                        Print Report
                    </button>
                </div>
            </div>
        </div>
    </nav>`;
  }

  /**
   * Generate header section
   */
  generateHeader(data, clientName) {
    const completeness = data.metadata?.completeness || 100;

    return `
    <header class="gradient-psycho text-gray-900 py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-4xl md:text-5xl font-bold mb-4">Psychographic Research</h1>
                    <p class="text-xl mb-2">Deep Cultural Values & Behavioral Analysis</p>
                    <p class="text-sm opacity-75">${clientName} | Generated: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="hidden md:block">
                    <div class="bg-white bg-opacity-30 backdrop-blur-lg rounded-lg p-6 text-center min-w-[120px]">
                        <div class="text-5xl font-bold mb-2">${completeness}%</div>
                        <div class="text-sm">Data Completeness</div>
                    </div>
                </div>
            </div>

            ${data.eos?.coreFocus ? `
            <div class="mt-8 bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-2">${data.eos.coreFocus.purpose || 'Purpose'}</h2>
                <p class="text-lg opacity-90">${data.eos.coreFocus.niche || ''}</p>
            </div>
            ` : ''}
        </div>
    </header>`;
  }

  /**
   * Generate table of contents
   */
  generateTableOfContents() {
    return `
    <section id="toc" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Table of Contents</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${[
                  { id: 'cultural-values', title: 'Cultural Values Matrix', color: 'blue' },
                  { id: 'behavioral-patterns', title: 'Behavioral Patterns', color: 'purple' },
                  { id: 'emotional-triggers', title: 'Emotional Triggers', color: 'pink' },
                  { id: 'personas', title: 'Customer Personas', color: 'green' },
                  { id: 'past-experiences', title: 'Past Experiences', color: 'red' },
                  { id: 'trust-factors', title: 'Trust Building Factors', color: 'indigo' }
                ].map(item => `
                    <a href="#${item.id}" class="block p-4 border-l-4 border-${item.color}-500 bg-gray-50 hover:bg-gray-100 transition rounded-r-lg">
                        <div class="font-semibold text-${item.color}-700">${item.title}</div>
                        <div class="text-sm text-gray-600 mt-1">In-depth analysis</div>
                    </a>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate cultural values section
   */
  generateCulturalValuesSection(data) {
    if (!data.eos || !data.eos.coreValues) return '';

    const coreValues = data.eos.coreValues || [];

    return `
    <section id="cultural-values" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Cultural Values Matrix</h2>
            <p class="text-gray-600 mb-8">Core values and principles that drive decision-making</p>

            <div class="grid md:grid-cols-2 gap-6">
                ${coreValues.map((value, idx) => `
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                        <div class="flex items-start">
                            <span class="inline-block bg-blue-500 text-white rounded-full w-10 h-10 text-center text-lg font-bold mr-4 flex-shrink-0 leading-10">${idx + 1}</span>
                            <div>
                                <h3 class="text-lg font-bold text-blue-900 mb-2">${value.name}</h3>
                                <p class="text-blue-800 text-sm">${value.description}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate behavioral patterns section
   */
  generateBehavioralPatternsSection(data) {
    // Extract behavioral patterns from ICP bad habits and consequences
    const badHabits = this.stringToArray(data.icp?.badHabits || '');
    const consequences = this.stringToArray(data.icp?.consequences || '');

    return `
    <section id="behavioral-patterns" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Behavioral Patterns</h2>
            <p class="text-gray-600 mb-8">Current behaviors, habits, and their impact</p>

            <div class="grid md:grid-cols-2 gap-8">
                ${badHabits.length > 0 ? `
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-orange-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Current Patterns
                    </h3>
                    <div class="space-y-3">
                        ${badHabits.map((habit, idx) => `
                            <div class="bg-white rounded-lg p-4 border-l-4 border-orange-500">
                                <div class="flex items-start">
                                    <span class="inline-block bg-orange-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                                    <p class="text-orange-900 text-sm">${habit}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${consequences.length > 0 ? `
                <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-red-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Impact & Consequences
                    </h3>
                    <div class="space-y-3">
                        ${consequences.map((consequence, idx) => `
                            <div class="bg-white rounded-lg p-4 border-l-4 border-red-600">
                                <div class="flex items-start">
                                    <span class="inline-block bg-red-600 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                                    <p class="text-red-900 text-sm">${consequence}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate emotional triggers section
   */
  generateEmotionalTriggersSection(data) {
    const biggestFears = this.stringToArray(data.icp?.biggestFear || '');
    const primaryComplaint = this.stringToArray(data.icp?.primaryComplaint || '');

    return `
    <section id="emotional-triggers" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Emotional Triggers</h2>
            <p class="text-gray-600 mb-8">Deep-seated fears and pain points that drive action</p>

            <div class="grid md:grid-cols-2 gap-8">
                ${biggestFears.length > 0 ? `
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-purple-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Biggest Fears
                    </h3>
                    <div class="space-y-3">
                        ${biggestFears.map((fear, idx) => `
                            <div class="bg-white bg-opacity-70 rounded-lg p-4 border-l-4 border-purple-500">
                                <div class="flex items-start">
                                    <span class="inline-block bg-purple-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                                    <p class="text-purple-900 text-sm">${fear}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${primaryComplaint.length > 0 ? `
                <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-pink-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Primary Pain Points
                    </h3>
                    <div class="space-y-3">
                        ${primaryComplaint.map((complaint, idx) => `
                            <div class="bg-white bg-opacity-70 rounded-lg p-4 border-l-4 border-pink-500">
                                <div class="flex items-start">
                                    <span class="inline-block bg-pink-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                                    <p class="text-pink-900 text-sm">${complaint}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate personas section
   */
  generatePersonasSection(data) {
    if (!data.personas || data.personas.length === 0) return '';

    return `
    <section id="personas" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Customer Personas</h2>
            <p class="text-gray-600 mb-8">Detailed profiles of target customer segments</p>

            <div class="space-y-8">
                ${data.personas.map((persona, idx) => `
                    <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                        <div class="flex items-start mb-4">
                            <div class="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0 text-xl font-bold">
                                ${idx + 1}
                            </div>
                            <div>
                                <h3 class="text-2xl font-bold text-green-900">${persona.name}</h3>
                            </div>
                        </div>

                        <div class="grid md:grid-cols-2 gap-6 mt-6">
                            ${persona.motivation && persona.motivation.length > 0 ? `
                            <div class="bg-white bg-opacity-60 rounded-lg p-4">
                                <h4 class="font-bold text-green-900 mb-3 flex items-center">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                                    </svg>
                                    Motivations
                                </h4>
                                <ul class="space-y-2">
                                    ${persona.motivation.map(item => `
                                        <li class="text-green-800 text-sm flex items-start">
                                            <span class="text-green-500 mr-2">•</span>
                                            <span>${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            ` : ''}

                            ${persona.painPoints && persona.painPoints.length > 0 ? `
                            <div class="bg-white bg-opacity-60 rounded-lg p-4">
                                <h4 class="font-bold text-green-900 mb-3 flex items-center">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                    </svg>
                                    Pain Points
                                </h4>
                                <ul class="space-y-2">
                                    ${persona.painPoints.map(item => `
                                        <li class="text-green-800 text-sm flex items-start">
                                            <span class="text-green-500 mr-2">•</span>
                                            <span>${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            ` : ''}

                            ${persona.goals && persona.goals.length > 0 ? `
                            <div class="bg-white bg-opacity-60 rounded-lg p-4">
                                <h4 class="font-bold text-green-900 mb-3 flex items-center">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    Goals
                                </h4>
                                <ul class="space-y-2">
                                    ${persona.goals.map(item => `
                                        <li class="text-green-800 text-sm flex items-start">
                                            <span class="text-green-500 mr-2">•</span>
                                            <span>${item}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate past experiences section
   */
  generatePastExperiencesSection(data) {
    if (!data.icp || !data.icp.pastExperiences || data.icp.pastExperiences.length === 0) return '';

    return `
    <section id="past-experiences" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Past Experiences & Failed Attempts</h2>
            <p class="text-gray-600 mb-8">What customers tried before and why it didn't work</p>

            <div class="space-y-6">
                ${data.icp.pastExperiences.map((exp, idx) => `
                    <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                        <div class="flex items-start mb-4">
                            <span class="inline-block bg-red-500 text-white rounded-full w-10 h-10 text-center text-lg font-bold mr-4 flex-shrink-0 leading-10">${idx + 1}</span>
                            <h3 class="text-xl font-bold text-red-900">${exp.title}</h3>
                        </div>

                        <div class="space-y-4">
                            ${exp.whatTried ? `
                            <div class="bg-white bg-opacity-60 rounded-lg p-4">
                                <h4 class="font-semibold text-red-900 mb-2">What They Tried</h4>
                                <p class="text-red-800 text-sm">${exp.whatTried}</p>
                            </div>
                            ` : ''}

                            ${exp.whyTried ? `
                            <div class="bg-white bg-opacity-60 rounded-lg p-4">
                                <h4 class="font-semibold text-red-900 mb-2">Why They Tried It</h4>
                                <p class="text-red-800 text-sm">${exp.whyTried}</p>
                            </div>
                            ` : ''}

                            ${exp.whyFailed ? `
                            <div class="bg-white bg-opacity-60 rounded-lg p-4 border-l-4 border-red-600">
                                <h4 class="font-semibold text-red-900 mb-2 flex items-center">
                                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                    Why It Failed
                                </h4>
                                <p class="text-red-900 text-sm font-medium">${exp.whyFailed}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate trust factors section
   */
  generateTrustFactorsSection(data) {
    const promises = this.stringToArray(data.icp?.promises || '');
    const threeUniques = data.eos?.marketingStrategy?.threeUniques || [];

    return `
    <section id="trust-factors" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Trust Building Factors</h2>
            <p class="text-gray-600 mb-8">What builds credibility and reduces perceived risk</p>

            <div class="grid md:grid-cols-2 gap-8">
                ${promises.length > 0 ? `
                <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-indigo-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        Key Promises
                    </h3>
                    <div class="space-y-3">
                        ${promises.map((promise, idx) => `
                            <div class="bg-white bg-opacity-70 rounded-lg p-4 border-l-4 border-indigo-500">
                                <div class="flex items-start">
                                    <span class="inline-block bg-indigo-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                                    <p class="text-indigo-900 text-sm">${promise}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${threeUniques.length > 0 ? `
                <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-teal-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                        </svg>
                        Unique Differentiators
                    </h3>
                    <div class="space-y-3">
                        ${threeUniques.map((unique, idx) => `
                            <div class="bg-white bg-opacity-70 rounded-lg p-4 border-l-4 border-teal-500">
                                <div class="flex items-start">
                                    <span class="inline-block bg-teal-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                                    <p class="text-teal-900 text-sm font-medium">${unique}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate footer
   */
  generateFooter(clientName) {
    return `
    <footer class="bg-gray-900 text-white py-12 mt-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid md:grid-cols-3 gap-8">
                <div>
                    <h3 class="text-2xl font-bold mb-4 gradient-psycho bg-clip-text text-transparent">ORCHESTRAI</h3>
                    <p class="text-gray-400">Advanced Multi-Agent Intelligence System</p>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Client</h4>
                    <p class="text-gray-400">${clientName}</p>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Report Type</h4>
                    <p class="text-gray-400">Psychographic Research Analysis</p>
                    <p class="text-sm text-gray-500 mt-2">Generated: ${new Date().toLocaleString()}</p>
                </div>
            </div>
            <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>Generated by ORCHESTRAI Intelligence System | Crystalline Memory Architecture</p>
            </div>
        </div>
    </footer>`;
  }

  /**
   * Generate scripts for interactivity
   */
  generateScripts() {
    return `
    <script>
        // Initialize on DOM ready
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Psychographic Research page loaded');

            // Smooth scroll for TOC links
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

            // Add fade-in animation to sections
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver(function(entries) {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '0';
                        entry.target.style.transform = 'translateY(20px)';
                        entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, 100);

                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            // Observe all sections
            document.querySelectorAll('section').forEach(section => {
                observer.observe(section);
            });

            // Print handling
            window.addEventListener('beforeprint', function() {
                console.log('Preparing for print...');
            });

            console.log('✅ Psychographic Research interactive features initialized');
        });
    </script>`;
  }

  /**
   * Helper: Convert string to array
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
}

module.exports = PsychographicResearchPageGenerator;
