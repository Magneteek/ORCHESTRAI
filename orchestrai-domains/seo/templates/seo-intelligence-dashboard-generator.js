/**
 * SEO INTELLIGENCE DASHBOARD TEMPLATE GENERATOR
 *
 * Creates comprehensive, interactive SEO dashboards including:
 * - Keyword Research Overview
 * - Primary Keyword Clusters
 * - Semantic Clustering Analysis
 * - Search Intent Mapping
 * - Competitor Intelligence
 * - SERP Feature Opportunities
 * - Local SEO Data (if applicable)
 * - Implementation Roadmap
 *
 * Output: Self-contained HTML with export toolbar
 */

class SEOIntelligenceDashboardGenerator {
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
   * Generate complete SEO Intelligence Dashboard HTML page
   */
  generate(seoData, clientName) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${this.generateHead(clientName)}
</head>
<body class="bg-gray-50 text-gray-900">
    ${this.generateNavigation(clientName)}
    ${this.generateHeader(seoData, clientName)}
    ${this.generateTableOfContents()}
    ${this.generateOverviewSection(seoData)}
    ${this.generateKeywordClustersSection(seoData)}
    ${this.generateSemanticAnalysisSection(seoData)}
    ${this.generateSearchIntentSection(seoData)}
    ${this.generateCompetitorSection(seoData)}
    ${this.generateOpportunityScoreSection(seoData)}
    ${this.generateLocalSEOSection(seoData)}
    ${this.generateRoadmapSection(seoData)}
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
    <title>SEO Intelligence Dashboard - ${clientName}</title>

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

        .gradient-seo {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .section-divider {
            background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
            height: 3px;
            border-radius: 2px;
        }

        .keyword-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            margin: 2px;
        }

        .difficulty-low { background-color: #D1FAE5; color: #065F46; }
        .difficulty-medium { background-color: #FEF3C7; color: #92400E; }
        .difficulty-high { background-color: #FEE2E2; color: #991B1B; }
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
                    <h1 class="text-xl font-bold text-pink-600">SEO Intelligence Dashboard</h1>
                    <span class="ml-4 text-gray-500">|</span>
                    <span class="ml-4 text-gray-700">${clientName}</span>
                </div>
                <div class="flex items-center space-x-4">
                    <a href="comprehensive-intelligence-report.html" class="text-sm text-gray-600 hover:text-gray-900 flex items-center">
                        <i class="fas fa-arrow-left mr-2"></i>
                        Back to Overview
                    </a>
                    <button onclick="window.print()" class="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition text-sm font-medium">
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
  generateHeader(seoData, clientName) {
    const totalKeywords = seoData.totalKeywordsAnalyzed || 0;
    const confidenceScore = seoData.confidenceScore || 0;

    return `
    <header class="gradient-seo text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-4xl md:text-5xl font-bold mb-4">SEO Intelligence Dashboard</h1>
                    <p class="text-xl mb-2">Comprehensive Keyword & Competitor Analysis</p>
                    <p class="text-sm opacity-90">${clientName} | Generated: ${new Date().toLocaleDateString()}</p>
                </div>
                <div class="hidden md:flex space-x-4">
                    <div class="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 text-center min-w-[120px]">
                        <div class="text-4xl font-bold mb-2">${totalKeywords}</div>
                        <div class="text-sm opacity-90">Keywords Analyzed</div>
                    </div>
                    <div class="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 text-center min-w-[120px]">
                        <div class="text-4xl font-bold mb-2">${confidenceScore}%</div>
                        <div class="text-sm opacity-90">Confidence Score</div>
                    </div>
                </div>
            </div>

            ${seoData.executiveSummary ? `
            <div class="mt-8 bg-white bg-opacity-10 backdrop-blur-md rounded-lg p-6">
                <h2 class="text-2xl font-bold mb-4">Key Findings</h2>
                <div class="grid md:grid-cols-2 gap-4">
                    ${(seoData.executiveSummary.keyFindings || []).slice(0, 4).map((finding, idx) => `
                        <div class="flex items-start">
                            <span class="inline-block bg-white bg-opacity-30 rounded-full w-6 h-6 text-center text-sm font-bold mr-3 flex-shrink-0">${idx + 1}</span>
                            <p class="text-sm">${finding}</p>
                        </div>
                    `).join('')}
                </div>
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
                  { id: 'overview', title: 'Research Overview', color: 'blue' },
                  { id: 'clusters', title: 'Keyword Clusters', color: 'purple' },
                  { id: 'semantic', title: 'Semantic Analysis', color: 'pink' },
                  { id: 'intent', title: 'Search Intent Mapping', color: 'green' },
                  { id: 'competitors', title: 'Competitor Intelligence', color: 'red' },
                  { id: 'opportunities', title: 'Opportunity Score', color: 'yellow' },
                  { id: 'local-seo', title: 'Local SEO Data', color: 'teal' },
                  { id: 'roadmap', title: 'Implementation Roadmap', color: 'indigo' }
                ].map(item => `
                    <a href="#${item.id}" class="block p-4 border-l-4 border-${item.color}-500 bg-gray-50 hover:bg-gray-100 transition rounded-r-lg">
                        <div class="font-semibold text-${item.color}-700">${item.title}</div>
                        <div class="text-sm text-gray-600 mt-1">Detailed analysis</div>
                    </a>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate overview section
   */
  generateOverviewSection(seoData) {
    const totalKeywords = seoData.totalKeywordsAnalyzed || 0;
    const language = seoData.language || 'English';
    const marketScope = seoData.marketScope || 'Global';
    const confidenceScore = seoData.confidenceScore || 0;

    return `
    <section id="overview" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Keyword Research Overview</h2>
            <p class="text-gray-600 mb-8">Comprehensive analysis of search landscape and opportunities</p>

            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <div class="text-blue-600 text-sm font-semibold mb-2">TOTAL KEYWORDS</div>
                    <div class="text-4xl font-bold text-blue-900">${totalKeywords}</div>
                    <div class="text-sm text-blue-700 mt-2">Analyzed & Categorized</div>
                </div>

                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <div class="text-purple-600 text-sm font-semibold mb-2">LANGUAGE</div>
                    <div class="text-2xl font-bold text-purple-900">${language}</div>
                    <div class="text-sm text-purple-700 mt-2">Primary Market Language</div>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <div class="text-green-600 text-sm font-semibold mb-2">MARKET SCOPE</div>
                    <div class="text-2xl font-bold text-green-900">${marketScope}</div>
                    <div class="text-sm text-green-700 mt-2">Geographic Target</div>
                </div>

                <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6">
                    <div class="text-pink-600 text-sm font-semibold mb-2">CONFIDENCE</div>
                    <div class="text-4xl font-bold text-pink-900">${confidenceScore}%</div>
                    <div class="text-sm text-pink-700 mt-2">Data Reliability Score</div>
                </div>
            </div>

            ${seoData.executiveSummary?.marketSizeEstimate || seoData.executiveSummary?.growthProjection ? `
            <div class="grid md:grid-cols-2 gap-6">
                ${seoData.executiveSummary.marketSizeEstimate ? `
                <div class="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-indigo-900 mb-3 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Market Size Estimate
                    </h3>
                    <p class="text-indigo-800">${seoData.executiveSummary.marketSizeEstimate}</p>
                </div>
                ` : ''}

                ${seoData.executiveSummary.growthProjection ? `
                <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6">
                    <h3 class="text-lg font-bold text-teal-900 mb-3 flex items-center">
                        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                        </svg>
                        Growth Projection
                    </h3>
                    <p class="text-teal-800">${seoData.executiveSummary.growthProjection}</p>
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
    </section>`;
  }

  /**
   * Generate keyword clusters section
   */
  generateKeywordClustersSection(seoData) {
    if (!seoData.primarneKljucneBesede) return '';

    const clusters = Object.entries(seoData.primarneKljucneBesede || {});

    return `
    <section id="clusters" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Primary Keyword Clusters</h2>
            <p class="text-gray-600 mb-8">Organized by semantic topic and search intent</p>

            <div class="space-y-8">
                ${clusters.map(([clusterName, keywords], idx) => `
                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                        <h3 class="text-xl font-bold text-purple-900 mb-4 flex items-center">
                            <span class="inline-block bg-purple-500 text-white rounded-full w-8 h-8 text-center text-sm font-bold mr-3 leading-8">${idx + 1}</span>
                            ${this.formatClusterName(clusterName)}
                        </h3>

                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead>
                                    <tr class="bg-purple-200 bg-opacity-50">
                                        <th class="text-left p-3 text-purple-900 font-semibold">Keyword</th>
                                        <th class="text-center p-3 text-purple-900 font-semibold">Volume</th>
                                        <th class="text-center p-3 text-purple-900 font-semibold">Difficulty</th>
                                        <th class="text-center p-3 text-purple-900 font-semibold">CPC</th>
                                        <th class="text-center p-3 text-purple-900 font-semibold">Intent</th>
                                        <th class="text-center p-3 text-purple-900 font-semibold">Opportunity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${keywords.map((kw, kwIdx) => `
                                        <tr class="${kwIdx % 2 === 0 ? 'bg-white' : 'bg-purple-50 bg-opacity-30'}">
                                            <td class="p-3 font-medium text-purple-900">${kw.keyword}</td>
                                            <td class="p-3 text-center text-gray-700">${kw.searchVolume?.toLocaleString() || 'N/A'}</td>
                                            <td class="p-3 text-center">
                                                <span class="keyword-badge ${this.getDifficultyClass(kw.difficulty)}">
                                                    ${kw.difficulty || 'N/A'}
                                                </span>
                                            </td>
                                            <td class="p-3 text-center text-gray-700">€${kw.cpc || 'N/A'}</td>
                                            <td class="p-3 text-center">
                                                <span class="keyword-badge" style="background-color: ${this.getIntentColor(kw.commercialIntent)}; color: white;">
                                                    ${kw.commercialIntent || 'N/A'}
                                                </span>
                                            </td>
                                            <td class="p-3 text-center">
                                                <span class="inline-block bg-green-500 text-white rounded-full w-12 h-12 text-center font-bold leading-12 text-sm" style="line-height: 3rem;">
                                                    ${kw.opportunityScore || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate semantic analysis section
   */
  generateSemanticAnalysisSection(seoData) {
    // This section would display semantic clustering data if available
    // For now, create a placeholder that shows the concept
    return `
    <section id="semantic" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Semantic Clustering Analysis</h2>
            <p class="text-gray-600 mb-8">Topic relationships and content opportunities</p>

            <div class="bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg p-6">
                <p class="text-pink-900 text-center text-lg">
                    <svg class="w-16 h-16 mx-auto mb-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Semantic clustering visualization will be generated from semantic-clustering-analysis data
                </p>
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate search intent section
   */
  generateSearchIntentSection(seoData) {
    return `
    <section id="intent" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Search Intent Mapping</h2>
            <p class="text-gray-600 mb-8">Understanding user intent across keyword portfolio</p>

            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 text-center">
                    <svg class="w-12 h-12 mx-auto mb-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-lg font-bold text-blue-900 mb-2">Informational</h3>
                    <p class="text-sm text-blue-700">Research & learning queries</p>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 text-center">
                    <svg class="w-12 h-12 mx-auto mb-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <h3 class="text-lg font-bold text-green-900 mb-2">Navigational</h3>
                    <p class="text-sm text-green-700">Brand & location searches</p>
                </div>

                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 text-center">
                    <svg class="w-12 h-12 mx-auto mb-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <h3 class="text-lg font-bold text-yellow-900 mb-2">Commercial</h3>
                    <p class="text-sm text-yellow-700">Comparison & investigation</p>
                </div>

                <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 text-center">
                    <svg class="w-12 h-12 mx-auto mb-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <h3 class="text-lg font-bold text-red-900 mb-2">Transactional</h3>
                    <p class="text-sm text-red-700">Ready to buy</p>
                </div>
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate competitor section
   */
  generateCompetitorSection(seoData) {
    return `
    <section id="competitors" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Competitor Intelligence</h2>
            <p class="text-gray-600 mb-8">Competitive landscape and gap analysis</p>

            <div class="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6">
                <p class="text-red-900 text-center text-lg">
                    <svg class="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Competitor analysis data will be populated from competitor-intelligence files
                </p>
            </div>
        </div>
    </section>`;
  }

  /**
   * Generate opportunity score section
   */
  generateOpportunityScoreSection(seoData) {
    const opportunities = seoData.executiveSummary?.primaryOpportunities || [];

    return `
    <section id="opportunities" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">High-Opportunity Keywords</h2>
            <p class="text-gray-600 mb-8">Top opportunities for quick wins and strategic gains</p>

            ${opportunities.length > 0 ? `
            <div class="grid md:grid-cols-2 gap-6">
                ${opportunities.map((opp, idx) => `
                    <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                        <div class="flex items-start">
                            <span class="inline-block bg-green-500 text-white rounded-full w-8 h-8 text-center text-sm font-bold mr-3 flex-shrink-0 leading-8">${idx + 1}</span>
                            <div>
                                <p class="text-green-900 font-medium">${opp}</p>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ` : `
            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 text-center">
                <p class="text-yellow-900">Opportunity analysis will be generated from keyword data</p>
            </div>
            `}
        </div>
    </section>`;
  }

  /**
   * Generate local SEO section
   */
  generateLocalSEOSection(seoData) {
    const marketScope = seoData.marketScope || '';
    const isLocalMarket = marketScope && marketScope !== 'Global';

    return `
    <section id="local-seo" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Local SEO Analysis</h2>
            <p class="text-gray-600 mb-8">Geographic targeting and local search opportunities</p>

            ${isLocalMarket ? `
            <div class="bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg p-6">
                <h3 class="text-xl font-bold text-teal-900 mb-4 flex items-center">
                    <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Target Market: ${marketScope}
                </h3>
                <p class="text-teal-800">Local search optimization data will be populated from local SEO analysis files</p>
            </div>
            ` : `
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 text-center">
                <p class="text-gray-700">No local market targeting configured (Global market scope)</p>
            </div>
            `}
        </div>
    </section>`;
  }

  /**
   * Generate implementation roadmap
   */
  generateRoadmapSection(seoData) {
    return `
    <section id="roadmap" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-break">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <h2 class="text-3xl font-bold text-gray-900 mb-2">Implementation Roadmap</h2>
            <p class="text-gray-600 mb-8">Phased approach to SEO execution</p>

            <div class="space-y-6">
                <!-- Phase 1: Quick Wins -->
                <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                    <div class="flex items-start">
                        <div class="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                            1
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-green-900 mb-2">Phase 1: Quick Wins (Months 1-3)</h3>
                            <div class="space-y-2">
                                <div class="bg-white bg-opacity-60 rounded p-3">
                                    <p class="text-green-900 font-medium">✓ Target low-competition, high-intent keywords</p>
                                </div>
                                <div class="bg-white bg-opacity-60 rounded p-3">
                                    <p class="text-green-900 font-medium">✓ Optimize existing high-performing pages</p>
                                </div>
                                <div class="bg-white bg-opacity-60 rounded p-3">
                                    <p class="text-green-900 font-medium">✓ Implement basic on-page SEO improvements</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Phase 2: Content Development -->
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                    <div class="flex items-start">
                        <div class="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                            2
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-blue-900 mb-2">Phase 2: Content Development (Months 4-6)</h3>
                            <div class="space-y-2">
                                <div class="bg-white bg-opacity-60 rounded p-3">
                                    <p class="text-blue-900 font-medium">✓ Create pillar content for primary keyword clusters</p>
                                </div>
                                <div class="bg-white bg-opacity-60 rounded p-3">
                                    <p class="text-blue-900 font-medium">✓ Build semantic topic clusters</p>
                                </div>
                                <div class="bg-white bg-opacity-60 rounded p-3">
                                    <p class="text-blue-900 font-medium">✓ Develop content addressing all search intents</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Phase 3: Authority Building -->
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                    <div class="flex items-start">
                        <div class="bg-purple-500 text-white rounded-full w-12 h-12 flex items-center justify-center mr-4 flex-shrink-0 font-bold">
                            3
                        </div>
                        <div class="flex-1">
                            <h3 class="text-xl font-bold text-purple-900 mb-2">Phase 3: Authority Building (Months 7-12)</h3>
                            <div class="space-y-2">
                                <div class="bg-white bg-opacity-60 rounded p-3">
                                    <p class="text-purple-900 font-medium">✓ Target competitive, high-value keywords</p>
                                </div>
                                <div class="bg-white bg-opacity-60 rounded p-3">
                                    <p class="text-purple-900 font-medium">✓ Build topical authority across all clusters</p>
                                </div>
                                <div class="bg-white bg-opacity-60 rounded p-3">
                                    <p class="text-purple-900 font-medium">✓ Implement advanced technical SEO</p>
                                </div>
                            </div>
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
                    <h3 class="text-2xl font-bold mb-4 gradient-seo bg-clip-text text-transparent">ORCHESTRAI</h3>
                    <p class="text-gray-400">Advanced Multi-Agent Intelligence System</p>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Client</h4>
                    <p class="text-gray-400">${clientName}</p>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Report Type</h4>
                    <p class="text-gray-400">SEO Intelligence Dashboard</p>
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
            console.log('SEO Intelligence Dashboard loaded');

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

            console.log('✅ SEO Intelligence Dashboard interactive features initialized');
        });
    </script>`;
  }

  /**
   * Helper methods
   */
  formatClusterName(name) {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getDifficultyClass(difficulty) {
    if (!difficulty) return 'difficulty-medium';
    if (difficulty < 30) return 'difficulty-low';
    if (difficulty < 60) return 'difficulty-medium';
    return 'difficulty-high';
  }

  getIntentColor(intent) {
    const colors = {
      'high': '#10B981',
      'medium': '#F59E0B',
      'low': '#6B7280',
      'informational': '#3B82F6',
      'commercial': '#F59E0B',
      'transactional': '#EF4444',
      'navigational': '#8B5CF6'
    };
    return colors[intent?.toLowerCase()] || '#6B7280';
  }
}

module.exports = SEOIntelligenceDashboardGenerator;
