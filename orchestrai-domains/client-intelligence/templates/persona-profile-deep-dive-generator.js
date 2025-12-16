/**
 * PERSONA PROFILE DEEP DIVE GENERATOR
 *
 * Creates individual deep dive pages for each customer persona including:
 * - Complete demographic profile
 * - Motivations & aspirations
 * - Fears & pain points
 * - Goals & objectives
 * - Buying reasons & triggers
 * - Customer journey visualization
 * - Communication preferences
 *
 * Output: Self-contained HTML for single persona analysis
 */

class PersonaProfileDeepDiveGenerator {
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
   * Generate complete Persona Profile HTML page
   */
  generate(persona, clientName, totalPersonas) {
    const sanitizedName = persona.name.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    ${this.generateHead(persona, clientName)}
</head>
<body class="bg-gray-50 text-gray-900">
    ${this.generateNavigation(persona, clientName, totalPersonas)}
    ${this.generateHeader(persona, clientName)}
    ${this.generateOverview(persona)}
    ${this.generateDemographics(persona)}
    ${this.generateMotivationsSection(persona)}
    ${this.generateFearsSection(persona)}
    ${this.generateGoalsSection(persona)}
    ${this.generateBuyingReasonsSection(persona)}
    ${this.generateFooter(clientName, persona)}
    ${this.generateScripts()}
</body>
</html>`;
  }

  generateHead(persona, clientName) {
    return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${persona.name} - ${clientName} Persona Profile</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print {
            .no-print { display: none !important; }
            body { background: white; }
        }
        .gradient-bg {
            background: linear-gradient(135deg, ${this.colors.indigo} 0%, ${this.colors.purple} 100%);
        }
        .stat-card {
            transition: transform 0.2s;
        }
        .stat-card:hover {
            transform: translateY(-4px);
        }
    </style>`;
  }

  generateNavigation(persona, clientName, totalPersonas) {
    return `
    <nav class="bg-white border-b border-gray-200 no-print sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <a href="index.html" class="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:shadow-lg transition-all font-semibold">
                        <span class="mr-2">←</span>
                        <span>Report Hub</span>
                    </a>
                    <span class="text-gray-300">|</span>
                    <span class="text-sm text-gray-600 font-semibold">${clientName}</span>
                    <span class="text-gray-300">|</span>
                    <span class="text-sm text-gray-500">Customer Persona</span>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="window.print()" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-semibold">
                        📄 Export PDF
                    </button>
                </div>
            </div>
        </div>
    </nav>`;
  }

  generateHeader(persona, clientName) {
    return `
    <header class="gradient-bg text-white py-16">
        <div class="max-w-7xl mx-auto px-4">
            <div class="text-center">
                <div class="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full mb-6">
                    <span class="text-sm font-semibold">${clientName} Customer Persona</span>
                </div>
                <h1 class="text-5xl font-bold mb-4">${persona.name}</h1>
                <p class="text-2xl opacity-90 mb-6">${persona.tagline || 'Customer Profile'}</p>
                <div class="flex items-center justify-center space-x-8 text-white/90">
                    <div class="text-center">
                        <div class="text-4xl font-bold">${persona.percentage}%</div>
                        <div class="text-sm mt-1">Market Share</div>
                    </div>
                    ${persona.demographics?.age ? `
                    <div class="text-center border-l border-white/30 pl-8">
                        <div class="text-2xl font-bold">${persona.demographics.age}</div>
                        <div class="text-sm mt-1">Age Range</div>
                    </div>` : ''}
                    ${persona.demographics?.gender ? `
                    <div class="text-center border-l border-white/30 pl-8">
                        <div class="text-xl font-bold">${persona.demographics.gender.split('(')[0].trim()}</div>
                        <div class="text-sm mt-1">Primary Gender</div>
                    </div>` : ''}
                </div>
            </div>
        </div>
    </header>`;
  }

  generateOverview(persona) {
    if (!persona.demographics) return '';

    return `
    <section class="max-w-7xl mx-auto px-4 py-12">
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">📊 Profile Overview</h2>
            <div class="grid md:grid-cols-3 gap-6">
                ${persona.demographics.location ? `
                <div class="bg-white rounded-lg p-6 shadow-sm">
                    <div class="text-blue-600 text-2xl mb-2">📍</div>
                    <div class="text-sm text-gray-600 mb-1">Location</div>
                    <div class="font-semibold text-gray-900">${persona.demographics.location}</div>
                </div>` : ''}
                ${persona.demographics.occupation ? `
                <div class="bg-white rounded-lg p-6 shadow-sm">
                    <div class="text-purple-600 text-2xl mb-2">💼</div>
                    <div class="text-sm text-gray-600 mb-1">Occupation</div>
                    <div class="font-semibold text-gray-900">${persona.demographics.occupation}</div>
                </div>` : ''}
                ${persona.demographics.householdIncome ? `
                <div class="bg-white rounded-lg p-6 shadow-sm">
                    <div class="text-green-600 text-2xl mb-2">💰</div>
                    <div class="text-sm text-gray-600 mb-1">Household Income</div>
                    <div class="font-semibold text-gray-900">${persona.demographics.householdIncome}</div>
                </div>` : ''}
            </div>
        </div>
    </section>`;
  }

  generateDemographics(persona) {
    if (!persona.demographics) return '';

    const demo = persona.demographics;
    const fields = [
      { label: 'Education', value: demo.education, icon: '🎓' },
      { label: 'Home Ownership', value: demo.homeOwnership, icon: '🏠' },
      { label: 'Household Type', value: demo.householdType, icon: '👨‍👩‍👧‍👦' },
      { label: 'Flock Size', value: demo.flockSize, icon: '🐔' },
      { label: 'Experience Level', value: demo.chickenKeepingExperience, icon: '⭐' }
    ].filter(f => f.value);

    if (fields.length === 0) return '';

    return `
    <section class="max-w-7xl mx-auto px-4 py-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-8">👤 Complete Demographics</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${fields.map(field => `
            <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
                <div class="flex items-center mb-3">
                    <span class="text-3xl mr-3">${field.icon}</span>
                    <h3 class="text-lg font-semibold text-gray-900">${field.label}</h3>
                </div>
                <p class="text-gray-700">${field.value}</p>
            </div>
            `).join('')}
        </div>
    </section>`;
  }

  generateMotivationsSection(persona) {
    if (!persona.motivation || persona.motivation.length === 0) return '';

    return `
    <section class="max-w-7xl mx-auto px-4 py-12 bg-green-50">
        <div class="max-w-5xl mx-auto">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">✨ Primary Motivations</h2>
            <p class="text-lg text-gray-700 mb-8">What emotionally drives ${persona.name.split(' ')[0]} to seek solutions:</p>
            <div class="space-y-4">
                ${persona.motivation.map((motivation, idx) => `
                <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500 transform hover:scale-105 transition-transform">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 bg-green-100 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                            <span class="font-bold text-green-600">${idx + 1}</span>
                        </div>
                        <div class="flex-1">
                            <p class="text-lg text-gray-900">${motivation}</p>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  generateFearsSection(persona) {
    if (!persona.fears || persona.fears.length === 0) return '';

    return `
    <section class="max-w-7xl mx-auto px-4 py-12">
        <div class="max-w-5xl mx-auto">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">😰 Key Fears & Pain Points</h2>
            <p class="text-lg text-gray-700 mb-8">What keeps ${persona.name.split(' ')[0]} awake at night:</p>
            <div class="space-y-4">
                ${persona.fears.map((fear, idx) => `
                <div class="bg-red-50 rounded-lg p-6 shadow-md border-l-4 border-red-500">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 text-3xl mr-4">⚠️</div>
                        <div class="flex-1">
                            <p class="text-lg text-gray-900">${fear}</p>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  generateGoalsSection(persona) {
    if (!persona.goals || persona.goals.length === 0) return '';

    return `
    <section class="max-w-7xl mx-auto px-4 py-12 bg-blue-50">
        <div class="max-w-5xl mx-auto">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">🎯 Concrete Goals & Objectives</h2>
            <p class="text-lg text-gray-700 mb-8">What ${persona.name.split(' ')[0]} wants to achieve:</p>
            <div class="space-y-4">
                ${persona.goals.map((goal, idx) => `
                <div class="bg-white rounded-lg p-6 shadow-md border-l-4 border-blue-500">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-4">
                            <span class="font-bold text-blue-600">${idx + 1}</span>
                        </div>
                        <div class="flex-1">
                            <p class="text-lg text-gray-900">${goal}</p>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  generateBuyingReasonsSection(persona) {
    if (!persona.reasons || persona.reasons.length === 0) return '';

    return `
    <section class="max-w-7xl mx-auto px-4 py-12">
        <div class="max-w-5xl mx-auto">
            <h2 class="text-3xl font-bold text-gray-900 mb-8">💡 Why ${persona.name.split(' ')[0]} Chooses Your Solution</h2>
            <p class="text-lg text-gray-700 mb-8">Key buying triggers and decision factors:</p>
            <div class="grid md:grid-cols-2 gap-6">
                ${persona.reasons.map((reason, idx) => `
                <div class="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 shadow-md border border-purple-200">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 text-3xl mr-4">✓</div>
                        <div class="flex-1">
                            <p class="text-gray-900 font-medium">${reason}</p>
                        </div>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </section>`;
  }

  generateFooter(clientName, persona) {
    return `
    <footer class="bg-gray-900 text-white py-12 mt-16">
        <div class="max-w-7xl mx-auto px-4 text-center">
            <div class="mb-4">
                <h3 class="text-xl font-bold">${persona.name} Profile</h3>
                <p class="text-gray-400 mt-2">${clientName} Customer Intelligence</p>
            </div>
            <div class="text-sm text-gray-400">
                Generated: ${new Date().toLocaleString()} | Powered by ORCHESTRAI
            </div>
        </div>
    </footer>`;
  }

  generateScripts() {
    return `
    <script>
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>`;
  }
}

module.exports = PersonaProfileDeepDiveGenerator;
