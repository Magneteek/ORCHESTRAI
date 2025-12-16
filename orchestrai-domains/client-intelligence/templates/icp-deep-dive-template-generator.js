/**
 * ICP DEEP DIVE PAGE TEMPLATE GENERATOR
 *
 * Creates comprehensive, interactive pages for complete ICP analysis including:
 * - Customer Avatar & Demographics
 * - Before/After States
 * - Goals (Primary & Secondary)
 * - Dreams & Aspirations
 * - Complaints & Pain Points
 * - Objections & Barriers
 * - Bad Habits & Consequences
 * - Biggest Fears
 * - Statistics & Market Data
 * - Customer Journey Map
 *
 * Output: Self-contained HTML with export toolbar
 */

class ICPDeepDiveTemplateGenerator {
  constructor() {
    this.colors = {
      primary: '#3B82F6',      // Blue
      success: '#10B981',      // Green
      warning: '#F59E0B',      // Amber
      danger: '#EF4444',       // Red
      purple: '#8B5CF6',       // Purple
      indigo: '#6366F1'        // Indigo
    };
  }

  /**
   * Generate complete ICP Deep Dive HTML page
   */
  generate(icpData, clientName) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${this.generateHead(clientName)}
</head>
<body class="bg-gray-50 text-gray-900">
    ${this.generateNavigation(clientName)}
    ${this.generateHeader(icpData, clientName)}
    ${this.generateTableOfContents()}
    ${this.generateAvatarSection(icpData)}
    ${this.generateBeforeAfterSection(icpData)}
    ${this.generateGoalsSection(icpData)}
    ${this.generateComplaintsSection(icpData)}
    ${this.generateObjectionsSection(icpData)}
    ${this.generateBadHabitsSection(icpData)}
    ${this.generateFearsSection(icpData)}
    ${this.generateStatisticsSection(icpData)}
    ${this.generateJourneySection(icpData)}
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
    <title>ICP Deep Dive - ${clientName}</title>

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
                    <h1 class="text-xl font-bold text-purple-600">ICP Deep Dive</h1>
                    <span class="ml-4 text-gray-500">|</span>
                    <span class="ml-4 text-gray-700">${clientName}</span>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="comprehensive-intelligence-report.html" class="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Back to Overview
                    </a>
                    <button onclick="window.print()" class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition text-sm font-medium">
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
  generateHeader(icpData, clientName) {
    return `
    <header class="gradient-bg text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-4xl md:text-5xl font-bold mb-4">Ideal Customer Profile</h1>
                    <p class="text-xl mb-2">Complete Psychographic Analysis</p>
                    <p class="text-sm opacity-90">${clientName} | Generated: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="hidden md:block">
                    <div class="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 text-center">
                        <div class="text-5xl font-bold mb-2">100%</div>
                        <div class="text-sm opacity-90">Profile Completeness</div>
                    </div>
                </div>
            </div>

            ${icpData.avatar ? `
            <div class="mt-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-2">Customer Avatar</h2>
                <p class="text-lg">${icpData.avatar}</p>
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
                  { id: 'before-after', title: 'Before/After States', color: 'blue' },
                  { id: 'goals', title: 'Goals & Dreams', color: 'green' },
                  { id: 'complaints', title: 'Pain Points & Complaints', color: 'red' },
                  { id: 'objections', title: 'Objections & Barriers', color: 'yellow' },
                  { id: 'bad-habits', title: 'Bad Habits & Consequences', color: 'orange' },
                  { id: 'fears', title: 'Biggest Fears', color: 'purple' },
                  { id: 'statistics', title: 'Statistics & Market Data', color: 'indigo' },
                  { id: 'journey', title: 'Customer Journey', color: 'pink' }
                ].map(item => `
                    <a href="#${item.id}" class="block p-4 border-l-4 border-${item.color}-500 bg-gray-50 hover:bg-gray-100 transition rounded-r-lg">
                        <div class="font-semibold text-${item.color}-700">${item.title}</div>
                        <div class="text-sm text-gray-600 mt-1">Deep dive analysis</div>
                    </a>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate avatar section
   */
  generateAvatarSection(icpData) {
    if (!icpData.avatar && !icpData.niche && !icpData.trigger) return '';

    return `
    <section id="avatar" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">Customer Avatar Overview</h2>

            <div class="grid md:grid-cols-3 gap-6">
                ${icpData.avatar ? `
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                    <h3 class="text-lg font-bold text-purple-900 mb-3">Primary Avatar</h3>
                    <p class="text-purple-800">${icpData.avatar}</p>
                </div>
                ` : ''}

                ${icpData.niche ? `
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                    <h3 class="text-lg font-bold text-blue-900 mb-3">Market Niche</h3>
                    <p class="text-blue-800">${icpData.niche}</p>
                </div>
                ` : ''}

                ${icpData.trigger ? `
                <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                    <h3 class="text-lg font-bold text-green-900 mb-3">Trigger Events</h3>
                    <p class="text-green-800">${icpData.trigger}</p>
                </div>
                ` : ''}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate before/after section
   */
  generateBeforeAfterSection(icpData) {
    if (!icpData.before || !icpData.after) return '';

    const before = Array.isArray(icpData.before) ? icpData.before : this.stringToArray(icpData.before);
    const after = Array.isArray(icpData.after) ? icpData.after : this.stringToArray(icpData.after);

    return `
    <section id="before-after" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Before/After Transformation</h2>
            <p class="text-gray-600 mb-8">Understanding the customer's journey from pain to relief</p>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- BEFORE State -->
                <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <div class="flex items-center mb-4">
                        <div class="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-3">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-red-900">BEFORE</h3>
                    </div>
                    <div class="space-y-4">
                        ${before.map(item => `
                            <div class="bg-white bg-opacity-50 rounded-lg p-4 border-l-4 border-red-500">
                                <p class="text-red-900">${item}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- AFTER State -->
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <div class="flex items-center mb-4">
                        <div class="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-3">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-green-900">AFTER</h3>
                    </div>
                    <div class="space-y-4">
                        ${after.map(item => `
                            <div class="bg-white bg-opacity-50 rounded-lg p-4 border-l-4 border-green-500">
                                <p class="text-green-900">${item}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate goals section
   */
  generateGoalsSection(icpData) {
    if (!icpData.primaryGoals && !icpData.secondaryGoals && !icpData.dreams) return '';

    const primaryGoals = this.stringToArray(icpData.primaryGoals);
    const secondaryGoals = this.stringToArray(icpData.secondaryGoals);
    const dreams = this.stringToArray(icpData.dreams);

    return `
    <section id="goals" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Goals & Aspirations</h2>
            <p class="text-gray-600 mb-8">What customers want to achieve and dream about</p>

            <div class="grid md:grid-cols-3 gap-8">
                <!-- Primary Goals -->
                ${primaryGoals.length > 0 ? `
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-blue-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Primary Goals
                    </h3>
                    <div class="space-y-3">
                        ${primaryGoals.map((goal, idx) => `
                            <div class="bg-white bg-opacity-60 rounded-lg p-3">
                                <span class="inline-block bg-blue-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-2">${idx + 1}</span>
                                <span class="text-blue-900">${goal}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Secondary Goals -->
                ${secondaryGoals.length > 0 ? `
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-purple-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                        </svg>
                        Secondary Goals
                    </h3>
                    <div class="space-y-3">
                        ${secondaryGoals.map((goal, idx) => `
                            <div class="bg-white bg-opacity-60 rounded-lg p-3">
                                <span class="inline-block bg-purple-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-2">${idx + 1}</span>
                                <span class="text-purple-900">${goal}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Dreams -->
                ${dreams.length > 0 ? `
                <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-pink-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
                        </svg>
                        Dreams & Aspirations
                    </h3>
                    <div class="space-y-3">
                        ${dreams.map((dream, idx) => `
                            <div class="bg-white bg-opacity-60 rounded-lg p-3">
                                <span class="inline-block bg-pink-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-2">${idx + 1}</span>
                                <span class="text-pink-900">${dream}</span>
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
   * Generate complaints section
   */
  generateComplaintsSection(icpData) {
    if (!icpData.primaryComplaint && !icpData.secondaryComplaint) return '';

    const primaryComplaints = this.stringToArray(icpData.primaryComplaint);
    const secondaryComplaints = this.stringToArray(icpData.secondaryComplaint);

    return `
    <section id="complaints" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Pain Points & Complaints</h2>
            <p class="text-gray-600 mb-8">What frustrates and bothers customers the most</p>

            <div class="grid md:grid-cols-2 gap-8">
                <!-- Primary Complaints -->
                ${primaryComplaints.length > 0 ? `
                <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-red-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Primary Complaints
                    </h3>
                    <div class="space-y-3">
                        ${primaryComplaints.map((complaint, idx) => `
                            <div class="bg-white rounded-lg p-4 border-l-4 border-red-500 shadow-sm">
                                <div class="flex items-start">
                                    <span class="inline-block bg-red-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                                    <p class="text-red-900">${complaint}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                <!-- Secondary Complaints -->
                ${secondaryComplaints.length > 0 ? `
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-orange-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                        </svg>
                        Secondary Complaints
                    </h3>
                    <div class="space-y-3">
                        ${secondaryComplaints.map((complaint, idx) => `
                            <div class="bg-white rounded-lg p-4 border-l-4 border-orange-500 shadow-sm">
                                <div class="flex items-start">
                                    <span class="inline-block bg-orange-500 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                                    <p class="text-orange-900">${complaint}</p>
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

  /**
   * Generate objections section
   */
  generateObjectionsSection(icpData) {
    if (!icpData.objections) return '';

    const objections = this.stringToArray(icpData.objections);
    if (objections.length === 0) return '';

    // Categorize objections (simple keyword matching)
    const categorized = {
      price: objections.filter(o => /price|cost|expensive|afford|budget|money/i.test(o)),
      trust: objections.filter(o => /trust|scam|fraud|legitimate|credential|proof|guarantee/i.test(o)),
      time: objections.filter(o => /time|busy|schedule|quick|fast|slow|wait/i.test(o)),
      authority: objections.filter(o => /decide|permission|spouse|partner|boss|authority/i.test(o)),
      need: objections.filter(o => /need|necessary|alternative|option|already|satisfied/i.test(o))
    };

    // Collect uncategorized
    const allCategorized = [...categorized.price, ...categorized.trust, ...categorized.time, ...categorized.authority, ...categorized.need];
    const uncategorized = objections.filter(o => !allCategorized.includes(o));

    return `
    <section id="objections" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Objections & Barriers</h2>
            <p class="text-gray-600 mb-8">Common objections and how to address them</p>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${categorized.price.length > 0 ? `
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-yellow-900 mb-3 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Price Objections
                    </h3>
                    <div class="space-y-2">
                        ${categorized.price.map(obj => `
                            <div class="bg-white bg-opacity-60 rounded p-3 text-sm text-yellow-900">
                                • ${obj}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${categorized.trust.length > 0 ? `
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-blue-900 mb-3 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                        </svg>
                        Trust Objections
                    </h3>
                    <div class="space-y-2">
                        ${categorized.trust.map(obj => `
                            <div class="bg-white bg-opacity-60 rounded p-3 text-sm text-blue-900">
                                • ${obj}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${categorized.time.length > 0 ? `
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-green-900 mb-3 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Time Objections
                    </h3>
                    <div class="space-y-2">
                        ${categorized.time.map(obj => `
                            <div class="bg-white bg-opacity-60 rounded p-3 text-sm text-green-900">
                                • ${obj}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${categorized.authority.length > 0 ? `
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-purple-900 mb-3 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        Authority Objections
                    </h3>
                    <div class="space-y-2">
                        ${categorized.authority.map(obj => `
                            <div class="bg-white bg-opacity-60 rounded p-3 text-sm text-purple-900">
                                • ${obj}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${categorized.need.length > 0 ? `
                <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-red-900 mb-3 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Need Objections
                    </h3>
                    <div class="space-y-2">
                        ${categorized.need.map(obj => `
                            <div class="bg-white bg-opacity-60 rounded p-3 text-sm text-red-900">
                                • ${obj}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${uncategorized.length > 0 ? `
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                        Other Objections
                    </h3>
                    <div class="space-y-2">
                        ${uncategorized.map(obj => `
                            <div class="bg-white bg-opacity-60 rounded p-3 text-sm text-gray-900">
                                • ${obj}
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>

            ${icpData.promises ? `
            <!-- How to Address Objections -->
            <div class="mt-12">
                <h3 class="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    How We Address These Objections
                </h3>
                <p class="text-gray-600 mb-6">Our value propositions and promises that overcome customer hesitation</p>

                <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border-l-4 border-green-500">
                    <div class="space-y-4">
                        ${this.stringToArray(icpData.promises).map((promise, idx) => `
                            <div class="flex items-start bg-white rounded-lg p-4 shadow-sm">
                                <span class="inline-block bg-green-500 text-white rounded-full w-8 h-8 text-center text-sm font-bold mr-4 flex-shrink-0 leading-8">${idx + 1}</span>
                                <div>
                                    <p class="text-gray-900 font-medium">${promise}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    </section>`;
  }

  /**
   * Generate bad habits section
   */
  generateBadHabitsSection(icpData) {
    if (!icpData.badHabits && !icpData.consequences) return '';

    const badHabits = this.stringToArray(icpData.badHabits);
    const consequences = this.stringToArray(icpData.consequences);
    const enemies = this.stringToArray(icpData.enemy || '');

    return `
    <section id="bad-habits" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Bad Habits & Consequences</h2>
            <p class="text-gray-600 mb-8">Current behaviors and their negative impact</p>

            <div class="grid md:grid-cols-${enemies.length > 0 ? '3' : '2'} gap-8">
                ${badHabits.length > 0 ? `
                <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-orange-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Current Bad Habits
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
                        Consequences of Inaction
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

                ${enemies.length > 0 ? `
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-purple-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        "Enemy" Mindsets
                    </h3>
                    <div class="space-y-3">
                        ${enemies.map((enemy, idx) => `
                            <div class="bg-white rounded-lg p-4 border-l-4 border-purple-600">
                                <div class="flex items-start">
                                    <span class="inline-block bg-purple-600 text-white rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                                    <p class="text-purple-900 text-sm">${enemy}</p>
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
   * Generate fears section
   */
  generateFearsSection(icpData) {
    if (!icpData.biggestFear) return '';

    const allFears = this.stringToArray(icpData.biggestFear);
    if (allFears.length === 0) return '';

    // Categorize fears by type
    const categorized = {
      emotional: allFears.filter(f => /embarrass|shame|reject|fail|disappoint|judg|anxious|stress|worry/i.test(f)),
      financial: allFears.filter(f => /money|cost|expensive|broke|debt|afford|waste|invest/i.test(f)),
      social: allFears.filter(f => /family|friend|spouse|relationship|reputation|respect|status/i.test(f)),
      health: allFears.filter(f => /health|pain|sick|injury|damage|harm|die|death/i.test(f))
    };

    // Collect uncategorized
    const allCategorized = [...categorized.emotional, ...categorized.financial, ...categorized.social, ...categorized.health];
    const uncategorized = allFears.filter(f => !allCategorized.includes(f));

    return `
    <section id="fears" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Biggest Fears</h2>
            <p class="text-gray-600 mb-8">Deep-seated fears that drive decision-making</p>

            <div class="grid md:grid-cols-2 gap-6">
                ${categorized.emotional.length > 0 ? `
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-purple-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        Emotional Fears
                    </h3>
                    <div class="space-y-3">
                        ${categorized.emotional.map(fear => `
                            <div class="bg-white bg-opacity-70 rounded-lg p-3 border-l-4 border-purple-500">
                                <p class="text-purple-900 text-sm">• ${fear}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${categorized.financial.length > 0 ? `
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-green-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Financial Fears
                    </h3>
                    <div class="space-y-3">
                        ${categorized.financial.map(fear => `
                            <div class="bg-white bg-opacity-70 rounded-lg p-3 border-l-4 border-green-500">
                                <p class="text-green-900 text-sm">• ${fear}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${categorized.social.length > 0 ? `
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-blue-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        Social Fears
                    </h3>
                    <div class="space-y-3">
                        ${categorized.social.map(fear => `
                            <div class="bg-white bg-opacity-70 rounded-lg p-3 border-l-4 border-blue-500">
                                <p class="text-blue-900 text-sm">• ${fear}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${categorized.health.length > 0 ? `
                <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-red-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        Health/Safety Fears
                    </h3>
                    <div class="space-y-3">
                        ${categorized.health.map(fear => `
                            <div class="bg-white bg-opacity-70 rounded-lg p-3 border-l-4 border-red-500">
                                <p class="text-red-900 text-sm">• ${fear}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${uncategorized.length > 0 ? `
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Other Fears
                    </h3>
                    <div class="space-y-3">
                        ${uncategorized.map(fear => `
                            <div class="bg-white bg-opacity-70 rounded-lg p-3 border-l-4 border-gray-500">
                                <p class="text-gray-900 text-sm">• ${fear}</p>
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
   * Generate statistics section
   */
  generateStatisticsSection(icpData) {
    if (!icpData.statistics || (!icpData.statistics.negative && !icpData.statistics.positive)) return '';

    const negativeStats = Array.isArray(icpData.statistics.negative)
      ? icpData.statistics.negative
      : this.stringToArray(icpData.statistics.negative || '');
    const positiveStats = Array.isArray(icpData.statistics.positive)
      ? icpData.statistics.positive
      : this.stringToArray(icpData.statistics.positive || '');

    return `
    <section id="statistics" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Statistics & Market Data</h2>
            <p class="text-gray-600 mb-8">Compelling data that amplifies pain and opportunity</p>

            <div class="grid md:grid-cols-2 gap-8">
                ${negativeStats.length > 0 ? `
                <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                    <div class="flex items-center mb-6">
                        <div class="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-3">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-red-900">Pain Amplifiers</h3>
                    </div>
                    <div class="space-y-4">
                        ${negativeStats.map((stat, idx) => `
                            <div class="bg-white rounded-lg p-5 border-l-4 border-red-600 shadow-sm">
                                <div class="flex items-start">
                                    <span class="inline-block bg-red-600 text-white rounded-full w-8 h-8 text-center text-sm font-bold mr-3 flex-shrink-0 leading-8">${idx + 1}</span>
                                    <div>
                                        <p class="text-red-900 font-medium">${stat}</p>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}

                ${positiveStats.length > 0 ? `
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <div class="flex items-center mb-6">
                        <div class="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-3">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold text-green-900">Opportunity Markers</h3>
                    </div>
                    <div class="space-y-4">
                        ${positiveStats.map((stat, idx) => `
                            <div class="bg-white rounded-lg p-5 border-l-4 border-green-600 shadow-sm">
                                <div class="flex items-start">
                                    <span class="inline-block bg-green-600 text-white rounded-full w-8 h-8 text-center text-sm font-bold mr-3 flex-shrink-0 leading-8">${idx + 1}</span>
                                    <div>
                                        <p class="text-green-900 font-medium">${stat}</p>
                                    </div>
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
   * Generate customer journey section
   */
  generateJourneySection(icpData) {
    // Try to extract journey data from ICP or use placeholder structure
    const journey = icpData.journey || {
      awareness: this.stringToArray(icpData.awarenessStage || 'Customer realizes they have a problem'),
      consideration: this.stringToArray(icpData.considerationStage || 'Customer researches potential solutions'),
      decision: this.stringToArray(icpData.decisionStage || 'Customer evaluates specific options and makes a choice')
    };

    return `
    <section id="journey" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Customer Journey Map</h2>
            <p class="text-gray-600 mb-8">Understanding how customers move from awareness to purchase</p>

            <!-- Journey Timeline -->
            <div class="relative">
                <!-- Progress Line -->
                <div class="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-300 via-purple-300 to-green-300 hidden md:block"></div>

                <div class="grid md:grid-cols-3 gap-8 relative">
                    <!-- Stage 1: Awareness -->
                    <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                        <div class="flex flex-col items-center mb-4">
                            <div class="bg-blue-500 text-white rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-lg">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold text-blue-900">Awareness Stage</h3>
                            <p class="text-sm text-blue-700 text-center mt-1">Customer identifies the problem</p>
                        </div>
                        <div class="space-y-3 mt-6">
                            ${(Array.isArray(journey.awareness) ? journey.awareness : this.stringToArray(journey.awareness)).map(item => `
                                <div class="bg-white bg-opacity-70 rounded p-3">
                                    <p class="text-blue-900 text-sm">• ${item}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Stage 2: Consideration -->
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                        <div class="flex flex-col items-center mb-4">
                            <div class="bg-purple-500 text-white rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-lg">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold text-purple-900">Consideration Stage</h3>
                            <p class="text-sm text-purple-700 text-center mt-1">Customer explores solutions</p>
                        </div>
                        <div class="space-y-3 mt-6">
                            ${(Array.isArray(journey.consideration) ? journey.consideration : this.stringToArray(journey.consideration)).map(item => `
                                <div class="bg-white bg-opacity-70 rounded p-3">
                                    <p class="text-purple-900 text-sm">• ${item}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Stage 3: Decision -->
                    <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                        <div class="flex flex-col items-center mb-4">
                            <div class="bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center mb-3 shadow-lg">
                                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                            </div>
                            <h3 class="text-xl font-bold text-green-900">Decision Stage</h3>
                            <p class="text-sm text-green-700 text-center mt-1">Customer makes a choice</p>
                        </div>
                        <div class="space-y-3 mt-6">
                            ${(Array.isArray(journey.decision) ? journey.decision : this.stringToArray(journey.decision)).map(item => `
                                <div class="bg-white bg-opacity-70 rounded p-3">
                                    <p class="text-green-900 text-sm">• ${item}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
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
                    <h3 class="text-2xl font-bold mb-4 gradient-bg bg-clip-text text-transparent">ORCHESTRAI</h3>
                    <p class="text-gray-400">Advanced Multi-Agent Intelligence System</p>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Client</h4>
                    <p class="text-gray-400">${clientName}</p>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Report Type</h4>
                    <p class="text-gray-400">ICP Deep Dive Analysis</p>
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
            console.log('ICP Deep Dive page loaded');

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

            console.log('✅ ICP Deep Dive interactive features initialized');
        });
    </script>`;
  }
}

module.exports = ICPDeepDiveTemplateGenerator;
