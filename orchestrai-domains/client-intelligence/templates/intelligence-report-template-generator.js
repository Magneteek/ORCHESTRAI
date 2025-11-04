/**
 * INTELLIGENCE REPORT HTML TEMPLATE GENERATOR
 *
 * Generates professional, interactive HTML templates for intelligence reports
 * using Tailwind CSS and modern JavaScript for a polished presentation.
 *
 * Features:
 * - Responsive design (mobile, tablet, desktop)
 * - Print-friendly styles
 * - Interactive visualizations
 * - Collapsible sections
 * - Data tooltips
 * - Smooth animations
 * - ORCHESTRAI branding
 */

class IntelligenceReportTemplateGenerator {
  constructor() {
    this.colors = {
      primary: '#3B82F6',      // Blue
      secondary: '#8B5CF6',    // Purple
      success: '#10B981',      // Green
      warning: '#F59E0B',      // Amber
      danger: '#EF4444',       // Red
      dark: '#1F2937',         // Gray-800
      light: '#F9FAFB'         // Gray-50
    };
  }

  /**
   * Helper: Convert numbered string list to array
   * "1. Item one\n2. Item two" => ["Item one", "Item two"]
   */
  stringToArray(str) {
    if (Array.isArray(str)) return str;
    if (!str || typeof str !== 'string') return [];

    return str.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        // Remove numbering like "1.", "2.", etc.
        return line.replace(/^\d+\.\s*/, '').trim();
      })
      .filter(item => item.length > 0);
  }

  /**
   * Generate complete HTML report
   */
  generate(reportSpec, jsonData) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${this.generateHead(reportSpec)}
</head>
<body class="bg-gray-50 text-gray-900">
    ${this.generateHeader(reportSpec)}
    ${this.generateNavigationBar(reportSpec)}
    ${this.generateMainContent(reportSpec, jsonData)}
    ${this.generateFooter(reportSpec)}
    ${this.generateScripts()}
</body>
</html>`;
  }

  /**
   * Generate HTML head section
   */
  generateHead(reportSpec) {
    return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${reportSpec.title} - ORCHESTRAI Intelligence Report">
    <title>${reportSpec.title}</title>

    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Chart.js for visualizations -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

    <style>
        body {
            font-family: 'Inter', sans-serif;
        }

        /* Print styles */
        @media print {
            .no-print {
                display: none !important;
            }
            .page-break {
                page-break-before: always;
            }
            header, nav {
                break-inside: avoid;
            }
        }

        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* Collapsible sections */
        .collapsible-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .collapsible-content.expanded {
            max-height: 10000px;
        }

        /* Fade-in animation */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in {
            animation: fadeIn 0.6s ease-out;
        }

        /* Gradient backgrounds */
        .gradient-orchestrai {
            background: linear-gradient(135deg, ${this.colors.primary} 0%, ${this.colors.secondary} 100%);
        }

        /* Card hover effects */
        .card-hover {
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15);
        }

        /* Badge styles */
        .badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .badge-high { background-color: #10B981; color: white; }
        .badge-medium { background-color: #F59E0B; color: white; }
        .badge-low { background-color: #6B7280; color: white; }

        /* Progress bars */
        .progress-bar {
            height: 8px;
            background: #E5E7EB;
            border-radius: 9999px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, ${this.colors.primary}, ${this.colors.secondary});
            transition: width 1s ease-out;
        }

        /* Tooltip */
        [data-tooltip] {
            position: relative;
            cursor: help;
        }

        [data-tooltip]:hover::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            white-space: nowrap;
            font-size: 0.875rem;
            margin-bottom: 0.5rem;
            z-index: 1000;
        }
    </style>`;
  }

  /**
   * Generate header section
   */
  generateHeader(reportSpec) {
    const metadata = reportSpec.metadata;

    return `
    <header class="gradient-orchestrai text-white py-16 px-6 no-print">
        <div class="max-w-7xl mx-auto">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center space-x-4">
                    <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                    </div>
                    <div>
                        <div class="text-sm font-semibold uppercase tracking-wider opacity-90">ORCHESTRAI Intelligence</div>
                        <div class="text-xs opacity-75">${metadata.reportType} Report</div>
                    </div>
                </div>
                <button onclick="window.print()" class="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition">
                    📄 Export PDF
                </button>
            </div>

            <h1 class="text-5xl font-bold mb-4 fade-in">${reportSpec.title}</h1>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div class="text-sm opacity-75 mb-1">Client</div>
                    <div class="text-lg font-semibold">${metadata.client}</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div class="text-sm opacity-75 mb-1">Report Date</div>
                    <div class="text-lg font-semibold">${metadata.reportDate}</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div class="text-sm opacity-75 mb-1">Generated</div>
                    <div class="text-lg font-semibold">${new Date(metadata.generatedAt).toLocaleDateString()}</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div class="text-sm opacity-75 mb-1">Type</div>
                    <div class="text-lg font-semibold capitalize">${metadata.reportType}</div>
                </div>
            </div>
        </div>
    </header>`;
  }

  /**
   * Generate navigation bar
   */
  generateNavigationBar(reportSpec) {
    const navItems = reportSpec.sections
      .filter(s => s.id !== 'header' && s.id !== 'raw-data')
      .map(section => ({
        id: section.id,
        title: section.title
      }));

    return `
    <nav class="sticky top-0 bg-white border-b border-gray-200 shadow-sm z-50 no-print">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex space-x-6 overflow-x-auto">
                    ${navItems.map(item => `
                        <a href="#${item.id}" class="text-sm font-medium text-gray-600 hover:text-blue-600 whitespace-nowrap transition">
                            ${item.title}
                        </a>
                    `).join('')}
                </div>
                <button onclick="scrollToTop()" class="text-sm text-gray-600 hover:text-blue-600">
                    ↑ Top
                </button>
            </div>
        </div>
    </nav>`;
  }

  /**
   * Generate main content area
   */
  generateMainContent(reportSpec, jsonData) {
    let html = '<main class="max-w-7xl mx-auto px-6 py-12">';

    reportSpec.sections.forEach((section, index) => {
      if (section.id === 'header') return; // Skip header, already rendered

      html += this.generateSection(section, jsonData, index);
    });

    html += '</main>';
    return html;
  }

  /**
   * Generate individual section based on type
   */
  generateSection(section, jsonData, index) {
    const sectionClass = index > 0 ? 'page-break' : '';

    let content = '';

    switch (section.type) {
      case 'summary':
        content = this.generateSummarySection(section);
        break;

      case 'eos-overview':
        content = this.generateEOSOverview(section);
        break;

      case 'icp-framework':
        content = this.generateICPFramework(section);
        break;

      case 'personas-grid':
        content = this.generatePersonasGrid(section);
        break;

      case 'psychographic-matrix':
        content = this.generatePsychographicMatrix(section);
        break;

      case 'persona-card':
        content = this.generatePersonaCard(section);
        break;

      case 'journey-map':
        content = this.generateJourneyMap(section);
        break;

      case 'market-analysis':
        content = this.generateMarketAnalysis(section);
        break;

      case 'competitive-matrix':
        content = this.generateCompetitiveMatrix(section);
        break;

      case 'strategy-cards':
        content = this.generateStrategyCards(section);
        break;

      case 'journey-keyword-map':
        content = this.generateJourneyKeywordMap(section);
        break;

      case 'regional-analysis':
        content = this.generateRegionalAnalysis(section);
        break;

      case 'json-viewer':
        content = this.generateJSONViewer(section);
        break;

      default:
        content = this.generateGenericSection(section);
    }

    return `
    <section id="${section.id}" class="mb-16 ${sectionClass}">
        <h2 class="text-3xl font-bold mb-8 text-gray-900">${section.title}</h2>
        ${content}
    </section>`;
  }

  /**
   * Generate EOS overview section
   */
  generateEOSOverview(section) {
    const eos = section.data;

    return `
    <div class="space-y-8">
        ${eos.coreValues && eos.coreValues.length > 0 ? `
        <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
            <h3 class="text-2xl font-semibold mb-6 flex items-center">
                <span class="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">⭐</span>
                Core Values
            </h3>
            <div class="grid md:grid-cols-2 gap-4">
                ${eos.coreValues.map((value, idx) => `
                    <div class="bg-white rounded-lg p-5 shadow-sm">
                        <div class="flex items-start">
                            <span class="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">${idx + 1}</span>
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
        <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
            <h3 class="text-2xl font-semibold mb-6 flex items-center">
                <span class="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">🎯</span>
                Core Focus
            </h3>
            <div class="grid md:grid-cols-2 gap-6">
                <div class="bg-white rounded-lg p-6 shadow-sm">
                    <div class="text-sm font-medium text-purple-600 mb-2">Purpose / Passion</div>
                    <div class="text-lg font-semibold">${eos.coreFocus.purpose}</div>
                </div>
                <div class="bg-white rounded-lg p-6 shadow-sm">
                    <div class="text-sm font-medium text-purple-600 mb-2">Our Niche</div>
                    <div class="text-lg font-semibold">${eos.coreFocus.niche}</div>
                </div>
            </div>
        </div>
        ` : ''}

        ${eos.marketingStrategy ? `
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
            <h3 class="text-2xl font-semibold mb-6 flex items-center">
                <span class="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3">📈</span>
                Marketing Strategy
            </h3>

            ${eos.marketingStrategy.targetMarket ? `
            <div class="mb-6">
                <h4 class="font-semibold text-lg mb-3">Target Market</h4>
                <div class="flex flex-wrap gap-2">
                    ${eos.marketingStrategy.targetMarket.map(market => `
                        <span class="bg-white px-4 py-2 rounded-full text-sm border border-green-200">${market}</span>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${eos.marketingStrategy.threeUniques ? `
            <div class="mb-6">
                <h4 class="font-semibold text-lg mb-3">Three Uniques</h4>
                <div class="grid md:grid-cols-3 gap-4">
                    ${eos.marketingStrategy.threeUniques.map((unique, idx) => `
                        <div class="bg-white rounded-lg p-4 shadow-sm text-center">
                            <div class="text-3xl mb-2">${['🏆', '💎', '⚡'][idx]}</div>
                            <div class="text-sm font-medium">${unique}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${eos.marketingStrategy.provenProcess ? `
            <div class="mb-6">
                <h4 class="font-semibold text-lg mb-3">Proven Process</h4>
                <div class="flex items-center space-x-2 overflow-x-auto pb-4">
                    ${eos.marketingStrategy.provenProcess.map((step, idx) => `
                        <div class="flex items-center flex-shrink-0">
                            <div class="bg-white rounded-lg px-4 py-3 shadow-sm min-w-[150px] text-center">
                                <div class="font-bold text-green-600 mb-1">${idx + 1}</div>
                                <div class="text-xs">${step}</div>
                            </div>
                            ${idx < eos.marketingStrategy.provenProcess.length - 1 ? '<div class="text-2xl text-green-400">→</div>' : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${eos.marketingStrategy.guarantee ? `
            <div class="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
                <div class="font-semibold mb-2">Our Guarantee</div>
                <div class="text-lg italic text-gray-700">"${eos.marketingStrategy.guarantee}"</div>
            </div>
            ` : ''}
        </div>
        ` : ''}
    </div>`;
  }

  /**
   * Generate comprehensive ICP framework section
   */
  generateICPFramework(section) {
    const icp = section.data;

    return `
    <div class="space-y-8">
        ${/* Avatar and basic info */ ''}
        ${icp.avatar || icp.niche ? `
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl p-8 shadow-lg">
            ${icp.avatar ? `<h3 class="text-3xl font-bold mb-2">${icp.avatar}</h3>` : ''}
            ${icp.niche ? `<p class="text-xl text-indigo-100">${icp.niche}</p>` : ''}
        </div>
        ` : ''}

        ${/* Before/After transformation */ ''}
        ${icp.before && icp.after ? `
        <div class="grid md:grid-cols-2 gap-6">
            <div class="bg-red-50 rounded-xl p-6 border-2 border-red-200">
                <h4 class="text-xl font-semibold mb-4 flex items-center text-red-800">
                    <span class="mr-2">❌</span> Before
                </h4>
                ${Array.isArray(icp.before) ? `
                    <ul class="space-y-3">
                        ${icp.before.map(item => `
                            <li class="flex items-start">
                                <span class="text-red-500 mr-2 flex-shrink-0">•</span>
                                <span class="text-sm text-gray-700">${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                ` : `<p class="text-gray-700">${icp.before}</p>`}
            </div>

            <div class="bg-green-50 rounded-xl p-6 border-2 border-green-200">
                <h4 class="text-xl font-semibold mb-4 flex items-center text-green-800">
                    <span class="mr-2">✅</span> After
                </h4>
                ${Array.isArray(icp.after) ? `
                    <ul class="space-y-3">
                        ${icp.after.map(item => `
                            <li class="flex items-start">
                                <span class="text-green-500 mr-2 flex-shrink-0">✓</span>
                                <span class="text-sm text-gray-700">${item}</span>
                            </li>
                        `).join('')}
                    </ul>
                ` : `<p class="text-gray-700">${icp.after}</p>`}
            </div>
        </div>
        ` : ''}

        ${/* Goals and Dreams */ ''}
        <div class="grid md:grid-cols-2 gap-6">
            ${icp.primaryGoals ? `
            <div class="bg-white rounded-xl p-6 shadow-md">
                <h4 class="text-lg font-semibold mb-4 flex items-center">
                    <span class="text-2xl mr-2">🎯</span> Primary Goals
                </h4>
                <ul class="space-y-2">
                    ${this.stringToArray(icp.primaryGoals).map(goal => `
                        <li class="flex items-start text-sm">
                            <span class="text-blue-500 mr-2">▸</span>
                            <span>${goal}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}

            ${icp.dreams ? `
            <div class="bg-white rounded-xl p-6 shadow-md">
                <h4 class="text-lg font-semibold mb-4 flex items-center">
                    <span class="text-2xl mr-2">✨</span> Dreams
                </h4>
                <ul class="space-y-2">
                    ${this.stringToArray(icp.dreams).map(dream => `
                        <li class="flex items-start text-sm">
                            <span class="text-purple-500 mr-2">⭐</span>
                            <span>${dream}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
        </div>

        ${/* Fears and Objections */ ''}
        <div class="grid md:grid-cols-2 gap-6">
            ${icp.biggestFear ? `
            <div class="bg-red-50 rounded-xl p-6 border border-red-200">
                <h4 class="text-lg font-semibold mb-4 flex items-center text-red-800">
                    <span class="text-2xl mr-2">😰</span> Biggest Fears
                </h4>
                <ul class="space-y-2">
                    ${this.stringToArray(icp.biggestFear).map(fear => `
                        <li class="flex items-start text-sm">
                            <span class="text-red-500 mr-2">!</span>
                            <span>${fear}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}

            ${icp.objections ? `
            <div class="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h4 class="text-lg font-semibold mb-4 flex items-center text-yellow-800">
                    <span class="text-2xl mr-2">🤔</span> Common Objections
                </h4>
                <ul class="space-y-2">
                    ${this.stringToArray(icp.objections).map(obj => `
                        <li class="flex items-start text-sm italic text-gray-700">
                            <span class="text-yellow-500 mr-2">"</span>
                            <span>${obj}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}
        </div>

        ${/* Past Experiences (What They Tried) */ ''}
        ${icp.pastExperiences && icp.pastExperiences.length > 0 ? `
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 border border-gray-200">
            <h3 class="text-2xl font-semibold mb-6">What They've Tried Before</h3>
            <div class="space-y-4">
                ${icp.pastExperiences.map((exp, idx) => `
                    <div class="bg-white rounded-lg p-6 shadow-sm">
                        <div class="flex items-start mb-3">
                            <span class="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                            <h5 class="font-semibold text-lg">${exp.title}</h5>
                        </div>
                        <div class="ml-11 space-y-2 text-sm">
                            <div><span class="font-medium text-blue-600">What:</span> ${exp.whatTried}</div>
                            <div><span class="font-medium text-green-600">Why Tried:</span> ${exp.whyTried}</div>
                            <div><span class="font-medium text-red-600">Why Failed:</span> ${exp.whyFailed}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${/* Statistics */ ''}
        ${icp.statistics ? `
        <div class="bg-white rounded-xl p-8 shadow-md border border-gray-200">
            <h3 class="text-2xl font-semibold mb-6">Key Statistics</h3>
            <div class="grid md:grid-cols-2 gap-6">
                ${icp.statistics.negative ? `
                <div>
                    <h4 class="font-semibold mb-4 text-red-700">⚠️ Pain Point Statistics</h4>
                    <ul class="space-y-2">
                        ${icp.statistics.negative.slice(0, 5).map(stat => `
                            <li class="text-sm text-gray-700">• ${stat}</li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                ${icp.statistics.general ? `
                <div>
                    <h4 class="font-semibold mb-4 text-blue-700">📊 General Statistics</h4>
                    <ul class="space-y-2">
                        ${icp.statistics.general.slice(0, 5).map(stat => `
                            <li class="text-sm text-gray-700">• ${stat}</li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
    </div>`;
  }

  /**
   * Generate personas grid section
   */
  generatePersonasGrid(section) {
    const personas = section.data;

    return `
    <div class="grid md:grid-cols-${Math.min(personas.length, 3)} gap-8">
        ${personas.map((persona, idx) => `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
                <div class="gradient-orchestrai text-white p-6">
                    <div class="text-4xl mb-2">${['👩‍💼', '👨‍💼', '👵'][idx] || '👤'}</div>
                    <h3 class="text-2xl font-bold">${persona.name}</h3>
                </div>

                <div class="p-6 space-y-4">
                    ${persona.motivation && persona.motivation.length > 0 ? `
                    <div>
                        <h4 class="font-semibold text-sm text-gray-600 mb-2">MOTIVATION</h4>
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
                        <h4 class="font-semibold text-sm text-gray-600 mb-2">FEARS</h4>
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
                        <h4 class="font-semibold text-sm text-gray-600 mb-2">GOALS</h4>
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
    </div>`;
  }

  /**
   * Generate executive summary section
   */
  generateSummarySection(section) {
    const summary = section.content;

    return `
    <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
        <div class="prose max-w-none">
            ${summary.keyFindings ? `
            <div class="mb-6">
                <h3 class="text-xl font-semibold mb-4 text-gray-900">Key Findings</h3>
                <ul class="space-y-2">
                    ${summary.keyFindings.map(finding => `
                        <li class="flex items-start">
                            <span class="text-blue-600 mr-2">✓</span>
                            <span>${finding}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
            ` : ''}

            ${summary.primaryOpportunities ? `
            <div>
                <h3 class="text-xl font-semibold mb-4 text-gray-900">Primary Opportunities</h3>
                <div class="grid md:grid-cols-2 gap-4">
                    ${summary.primaryOpportunities.map(opp => `
                        <div class="bg-white rounded-lg p-4 border border-blue-100">
                            <div class="flex items-center">
                                <span class="text-2xl mr-3">💡</span>
                                <span class="text-sm">${opp}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    </div>`;
  }

  /**
   * Generate psychographic matrix section
   */
  generatePsychographicMatrix(section) {
    const data = section.data;

    if (data.tradicionalneVrednote) {
      // Slovenian format
      const values = Object.entries(data.tradicionalneVrednote);

      return `
      <div class="grid md:grid-cols-2 gap-6">
          ${values.map(([key, value]) => `
              <div class="bg-white rounded-xl p-6 shadow-md card-hover">
                  <h3 class="text-xl font-semibold mb-4 capitalize">${key}</h3>

                  <div class="mb-4">
                      <div class="text-sm font-medium text-gray-600 mb-2">Psychological Motivation</div>
                      <p class="text-gray-700">${value.psihološkaMotiacija || value.psihološkaMotoacija}</p>
                  </div>

                  <div class="mb-4">
                      <div class="text-sm font-medium text-gray-600 mb-2">Emotional Tone</div>
                      <div class="flex flex-wrap gap-2">
                          ${(value.emocionalniTon || '').split(',').map(emotion =>
                            `<span class="badge badge-low">${emotion.trim()}</span>`
                          ).join('')}
                      </div>
                  </div>

                  ${value.iskaljniIzrazi ? `
                  <div>
                      <div class="text-sm font-medium text-gray-600 mb-2">Search Patterns</div>
                      <div class="text-xs text-gray-600 space-y-1">
                          ${value.iskaljniIzrazi.slice(0, 5).map(term =>
                            `<div>• ${term}</div>`
                          ).join('')}
                      </div>
                  </div>
                  ` : ''}
              </div>
          `).join('')}
      </div>`;
    }

    return this.generateGenericSection(section);
  }

  /**
   * Generate persona card section
   */
  generatePersonaCard(section) {
    const persona = section.data;

    return `
    <div class="bg-white rounded-xl shadow-lg overflow-hidden">
        <div class="gradient-orchestrai text-white p-6">
            <h3 class="text-2xl font-bold">${persona.name}</h3>
            ${persona.role ? `<p class="opacity-90">${persona.role}</p>` : ''}
        </div>

        <div class="p-6">
            ${persona.demographics ? `
            <div class="mb-6">
                <h4 class="font-semibold text-lg mb-3">Demographics</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    ${Object.entries(persona.demographics).map(([key, value]) => `
                        <div>
                            <div class="text-xs text-gray-500 uppercase tracking-wider mb-1">${key}</div>
                            <div class="font-medium">${value}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            ${persona.psychographics ? `
            <div class="grid md:grid-cols-2 gap-6">
                ${persona.psychographics.values ? `
                <div>
                    <h5 class="font-semibold mb-2">Values</h5>
                    <div class="flex flex-wrap gap-2">
                        ${persona.psychographics.values.map(v =>
                          `<span class="badge badge-high">${v}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}

                ${persona.psychographics.motivations ? `
                <div>
                    <h5 class="font-semibold mb-2">Motivations</h5>
                    <div class="flex flex-wrap gap-2">
                        ${persona.psychographics.motivations.map(m =>
                          `<span class="badge badge-medium">${m}</span>`
                        ).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
    </div>`;
  }

  /**
   * Generate customer journey map section
   */
  generateJourneyMap(section) {
    const journey = section.data;
    const stages = Object.entries(journey);

    return `
    <div class="space-y-6">
        ${stages.map(([stage, data], index) => `
            <div class="bg-white rounded-xl p-6 shadow-md">
                <div class="flex items-center mb-4">
                    <div class="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4">
                        ${index + 1}
                    </div>
                    <h3 class="text-xl font-semibold capitalize">${stage}</h3>
                </div>

                <div class="grid md:grid-cols-3 gap-4 ml-14">
                    ${data.triggers ? `
                    <div>
                        <div class="text-sm font-medium text-gray-600 mb-2">Triggers</div>
                        <ul class="text-sm text-gray-700 space-y-1">
                            ${data.triggers.map(t => `<li>• ${t}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${data.contentNeeds || data.evaluationCriteria || data.decisionFactors ? `
                    <div>
                        <div class="text-sm font-medium text-gray-600 mb-2">
                            ${data.contentNeeds ? 'Content Needs' : data.evaluationCriteria ? 'Evaluation Criteria' : 'Decision Factors'}
                        </div>
                        <ul class="text-sm text-gray-700 space-y-1">
                            ${(data.contentNeeds || data.evaluationCriteria || data.decisionFactors || []).map(c => `<li>• ${c}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${data.touchpoints ? `
                    <div>
                        <div class="text-sm font-medium text-gray-600 mb-2">Touchpoints</div>
                        <ul class="text-sm text-gray-700 space-y-1">
                            ${data.touchpoints.map(t => `<li>• ${t}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
            </div>
        `).join('')}
    </div>`;
  }

  /**
   * Generate market analysis section
   */
  generateMarketAnalysis(section) {
    const market = section.data;

    return `
    <div class="grid md:grid-cols-2 gap-6">
        ${market.industrySize ? `
        <div class="bg-white rounded-xl p-6 shadow-md">
            <h4 class="font-semibold text-lg mb-4">Industry Size</h4>
            ${Object.entries(market.industrySize).map(([key, value]) => `
                <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                    <span class="text-sm text-gray-600 capitalize">${key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span class="font-semibold">${value}</span>
                </div>
            `).join('')}
        </div>
        ` : ''}

        ${market.keySegments ? `
        <div class="bg-white rounded-xl p-6 shadow-md">
            <h4 class="font-semibold text-lg mb-4">Key Segments</h4>
            ${market.keySegments.map(segment => `
                <div class="mb-4 last:mb-0">
                    <div class="flex justify-between items-center mb-1">
                        <span class="font-medium">${segment.name}</span>
                        <span class="badge badge-${segment.opportunity === 'high' ? 'high' : segment.opportunity === 'medium' ? 'medium' : 'low'}">
                            ${segment.opportunity}
                        </span>
                    </div>
                    <div class="text-sm text-gray-600">Size: ${segment.size} | Growth: ${segment.growth}</div>
                </div>
            `).join('')}
        </div>
        ` : ''}
    </div>`;
  }

  /**
   * Generate competitive matrix section
   */
  generateCompetitiveMatrix(section) {
    const competitive = section.data;

    return `
    <div class="space-y-6">
        ${competitive.marketLeaders ? `
        <div class="bg-white rounded-xl p-6 shadow-md">
            <h4 class="font-semibold text-lg mb-4">Market Leaders</h4>
            <div class="space-y-4">
                ${competitive.marketLeaders.map(leader => `
                    <div class="border-l-4 border-blue-500 pl-4">
                        <div class="flex justify-between items-center mb-2">
                            <span class="font-semibold">${leader.company}</span>
                            <span class="text-sm text-gray-600">Market Share: ${leader.share}</span>
                        </div>
                        <div class="text-sm grid md:grid-cols-2 gap-2">
                            <div><span class="text-green-600">✓</span> <strong>Strength:</strong> ${leader.strength}</div>
                            <div><span class="text-red-600">✗</span> <strong>Vulnerability:</strong> ${leader.vulnerability}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}

        ${competitive.competitiveGaps ? `
        <div class="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <h4 class="font-semibold text-lg mb-4 text-yellow-900">Competitive Gaps & Opportunities</h4>
            <div class="grid md:grid-cols-3 gap-4">
                ${competitive.competitiveGaps.map(gap => `
                    <div class="bg-white rounded-lg p-4 text-sm">
                        <span class="text-yellow-600 mr-2">⚡</span>${gap}
                    </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
    </div>`;
  }

  /**
   * Generate strategy cards section
   */
  generateStrategyCards(section) {
    const strategies = section.data;

    return `
    <div class="grid md:grid-cols-3 gap-6">
        ${strategies.content ? `
        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
            <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">📝</span>
                <h4 class="font-semibold text-lg">Content Strategy</h4>
            </div>
            ${this.renderStrategyDetails(strategies.content)}
        </div>
        ` : ''}

        ${strategies.seo ? `
        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
            <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">🔍</span>
                <h4 class="font-semibold text-lg">SEO Strategy</h4>
            </div>
            ${this.renderStrategyDetails(strategies.seo)}
        </div>
        ` : ''}

        ${strategies.web ? `
        <div class="bg-white rounded-xl p-6 shadow-md card-hover">
            <div class="flex items-center mb-4">
                <span class="text-3xl mr-3">🌐</span>
                <h4 class="font-semibold text-lg">Web Strategy</h4>
            </div>
            ${this.renderStrategyDetails(strategies.web)}
        </div>
        ` : ''}
    </div>`;
  }

  /**
   * Render strategy details helper
   */
  renderStrategyDetails(strategy) {
    let html = '<div class="space-y-3 text-sm">';

    for (const [key, value] of Object.entries(strategy)) {
      html += `
      <div>
          <div class="font-medium text-gray-700 mb-1 capitalize">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
          ${Array.isArray(value) ? `
              <ul class="text-gray-600 space-y-1 pl-4">
                  ${value.slice(0, 3).map(item => `<li>• ${item}</li>`).join('')}
              </ul>
          ` : `
              <p class="text-gray-600">${value}</p>
          `}
      </div>`;
    }

    html += '</div>';
    return html;
  }

  /**
   * Generate JSON viewer section (collapsible)
   */
  generateJSONViewer(section) {
    const jsonString = JSON.stringify(section.data, null, 2);

    return `
    <div class="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <div class="bg-gray-100 px-6 py-4 flex justify-between items-center border-b border-gray-200">
            <h4 class="font-semibold">Raw Data (JSON)</h4>
            <button
                data-collapsible
                data-target="json-content"
                class="text-sm bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg transition">
                ▶ Show
            </button>
        </div>
        <div id="json-content" class="collapsible-content">
            <pre class="p-6 text-xs overflow-x-auto"><code>${this.escapeHtml(jsonString)}</code></pre>
        </div>
    </div>`;
  }

  /**
   * Generate generic section fallback
   */
  generateGenericSection(section) {
    return `
    <div class="bg-white rounded-xl p-6 shadow-md">
        <pre class="text-sm overflow-x-auto">${this.escapeHtml(JSON.stringify(section.data || section.content, null, 2))}</pre>
    </div>`;
  }

  /**
   * Generate footer
   */
  generateFooter(reportSpec) {
    return `
    <footer class="bg-gray-900 text-white py-12 mt-20 no-print">
        <div class="max-w-7xl mx-auto px-6 text-center">
            <div class="mb-4">
                <svg class="w-10 h-10 mx-auto mb-2 opacity-75" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
                <h3 class="text-xl font-semibold">ORCHESTRAI Intelligence System</h3>
            </div>
            <p class="text-gray-400 text-sm mb-2">Advanced Multi-Agent Intelligence & Research Platform</p>
            <p class="text-gray-500 text-xs">
                Generated: ${new Date(reportSpec.metadata.generatedAt).toLocaleString()} |
                Report Type: ${reportSpec.metadata.reportType} |
                Client: ${reportSpec.metadata.client}
            </p>
        </div>
    </footer>`;
  }

  /**
   * Generate JavaScript
   */
  generateScripts() {
    return `
    <script>
        // Smooth scroll to top
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Collapsible sections
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('[data-collapsible]').forEach(button => {
                button.addEventListener('click', () => {
                    const target = document.getElementById(button.dataset.target);
                    const isExpanded = target.classList.contains('expanded');

                    target.classList.toggle('expanded');
                    button.textContent = isExpanded ? '▶ Show' : '▼ Hide';
                });
            });

            // Fade-in animations on scroll
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('fade-in');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            document.querySelectorAll('section').forEach(section => {
                observer.observe(section);
            });

            // Progress bar animations
            document.querySelectorAll('.progress-fill').forEach(bar => {
                const width = bar.dataset.width || '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 100);
            });
        });

        // Print handler
        window.addEventListener('beforeprint', () => {
            // Expand all collapsible sections for printing
            document.querySelectorAll('.collapsible-content').forEach(el => {
                el.classList.add('expanded');
            });
        });

        window.addEventListener('afterprint', () => {
            // Collapse sections after printing
            document.querySelectorAll('.collapsible-content').forEach(el => {
                if (!el.classList.contains('keep-expanded')) {
                    el.classList.remove('expanded');
                }
            });
        });
    </script>`;
  }

  /**
   * Generate User Journey Keyword Map section
   */
  generateJourneyKeywordMap(section) {
    const journeyData = section.data;
    if (!journeyData) return '<p class="text-gray-500">No user journey data available</p>';

    const stageColors = { awareness: 'blue', consideration: 'yellow', decision: 'green' };

    return `<div class="space-y-8">
        ${Object.entries(journeyData).map(([stageKey, stageData]) => {
          const color = stageColors[stageKey] || 'gray';
          return `<div class="bg-white rounded-xl shadow-md border-l-4 border-${color}-500 overflow-hidden">
              <div class="bg-gradient-to-r from-${color}-50 to-${color}-100 p-6 border-b border-${color}-200">
                  <div class="flex items-center justify-between">
                      <div><h3 class="text-2xl font-bold text-${color}-900">${stageData.stage}</h3>
                      <p class="text-sm text-${color}-700 mt-1">${stageData.description}</p></div>
                      <div class="text-right"><div class="text-3xl font-bold text-${color}-600">${stageData.count || 0}</div>
                      <div class="text-xs text-${color}-600 uppercase">Keywords</div></div>
                  </div>
                  <div class="mt-3"><span class="inline-block bg-${color}-200 text-${color}-800 px-3 py-1 rounded-full text-xs font-semibold">${stageData.intent}</span></div>
              </div>
              ${stageData.keywords && stageData.keywords.length > 0 ? `<div class="p-6"><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      ${stageData.keywords.slice(0, 12).map(kwData => `<div class="bg-gray-50 rounded-lg p-4 hover:shadow-md transition">
                              <div class="font-semibold text-gray-900 mb-2">"${kwData.keyword}"</div>
                              ${kwData.culturalValue ? `<div class="text-xs text-gray-600 mb-1"><span class="font-medium">Value:</span> ${kwData.culturalValue}</div>` : ''}
                              ${kwData.emotionalTone ? `<div class="text-xs text-gray-600 mb-1"><span class="font-medium">Tone:</span> ${kwData.emotionalTone}</div>` : ''}
                          </div>`).join('')}
                  </div>
                  ${stageData.keywords.length > 12 ? `<div class="mt-4 text-center"><span class="text-sm text-gray-500">+ ${stageData.keywords.length - 12} more keywords</span></div>` : ''}
              </div>` : '<div class="p-6 text-gray-500 text-center">No keywords mapped yet</div>'}
          </div>`;
        }).join('')}
    </div>`;
  }

  /**
   * Generate Regional Analysis section
   */
  generateRegionalAnalysis(section) {
    const regionalData = section.data;
    if (!regionalData || Object.keys(regionalData).length === 0) return '<p class="text-gray-500">No regional data available</p>';
    return `<div class="grid md:grid-cols-2 gap-6">
        ${Object.entries(regionalData).map(([regionName, regionData]) => `<div class="bg-white rounded-xl shadow-md p-6">
                <h3 class="text-xl font-semibold mb-4 text-gray-900">${regionName}</h3>
                ${regionData.iskalnePrednosti ? `<div class="mb-4"><h5 class="font-medium text-sm text-gray-700 mb-2">Search Preferences:</h5><ul class="space-y-1">${regionData.iskalnePrednosti.map(pref => `<li class="text-sm text-gray-600">• ${pref}</li>`).join('')}</ul></div>` : ''}
            </div>`).join('')}
    </div>`;
  }

  /**
   * Escape HTML special characters
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = IntelligenceReportTemplateGenerator;
