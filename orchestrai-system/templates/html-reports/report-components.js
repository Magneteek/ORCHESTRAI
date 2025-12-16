/**
 * ORCHESTRAI REPORT REUSABLE COMPONENTS
 *
 * Shared HTML components for consistent report structure across all domains.
 * All reports use these standardized sections.
 *
 * Components:
 * - generateHead()       - HTML head with Tailwind, fonts, Chart.js
 * - generateHeader()     - Hero header with gradient background
 * - generateNavigation() - Sticky navigation bar
 * - generateFooter()     - ORCHESTRAI branded footer
 * - generateScripts()    - Interactive JavaScript features
 */

const designSystem = require('./report-design-system');

class ReportComponents {
  /**
   * Generate HTML <head> section
   * Includes Tailwind CSS, Google Fonts, Chart.js, custom styles
   */
  static generateHead(config) {
    const { title, reportType } = config;

    return `
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${title} - ORCHESTRAI Intelligence Report">
    <meta name="generator" content="ORCHESTRAI Multi-Agent Intelligence System">
    <title>${title}</title>

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
            font-family: ${designSystem.typography.fontFamily};
        }

        /* Gradient background class */
        .gradient-bg {
            background: ${designSystem.gradients[reportType] || designSystem.gradients.comprehensive};
        }

        /* Print styles */
        ${designSystem.print.styles}

        /* Smooth scrolling */
        html {
            scroll-behavior: smooth;
        }

        /* Animations */
        ${designSystem.animations.fadeIn.keyframes}

        .${designSystem.animations.fadeIn.class} {
            animation: fadeIn ${designSystem.animations.fadeIn.duration};
        }

        ${designSystem.animations.slideIn.keyframes}

        .${designSystem.animations.slideIn.class} {
            animation: slideIn ${designSystem.animations.slideIn.duration};
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

        /* Card hover effects */
        .card-hover {
            transition: transform 0.2s, box-shadow 0.2s;
        }

        .card-hover:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15);
        }

        /* Tooltips */
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

        /* Progress bars */
        .progress-fill {
            transition: width 1s ease-out;
        }
    </style>`;
  }

  /**
   * Generate hero header section
   * Consistent gradient header with client name, report type, metadata
   */
  static generateHeader(data, config) {
    const { clientName, reportType, reportDate } = config;
    const { title, subtitle, metadata = {} } = data.header || {};

    const displayTitle = title || `${reportType} Report`;
    const displaySubtitle = subtitle || `${clientName} Intelligence Analysis`;

    return `
    <header class="gradient-bg text-white py-16 px-6 ${designSystem.print.hide}">
        <div class="${designSystem.components.container}">
            <div class="flex items-center justify-between mb-8">
                <div class="flex items-center space-x-4">
                    <div class="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                    </div>
                    <div>
                        <div class="text-sm font-semibold uppercase tracking-wider opacity-90">ORCHESTRAI Intelligence</div>
                        <div class="text-xs opacity-75">${reportType} Report</div>
                    </div>
                </div>
                <button onclick="window.print()" class="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition">
                    📄 Export PDF
                </button>
            </div>

            <h1 class="${designSystem.typography.headings.h1.full} text-white fade-in">${displayTitle}</h1>
            <p class="text-xl mb-2 opacity-90">${displaySubtitle}</p>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div class="text-sm opacity-75 mb-1">Client</div>
                    <div class="text-lg font-semibold">${clientName}</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div class="text-sm opacity-75 mb-1">Report Date</div>
                    <div class="text-lg font-semibold">${reportDate || new Date().toLocaleDateString()}</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div class="text-sm opacity-75 mb-1">Generated</div>
                    <div class="text-lg font-semibold">${new Date().toLocaleDateString()}</div>
                </div>
                <div class="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div class="text-sm opacity-75 mb-1">Type</div>
                    <div class="text-lg font-semibold capitalize">${reportType}</div>
                </div>
            </div>

            ${metadata.coherenceScore ? `
            <div class="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <div class="text-sm opacity-75 mb-1">Strategic Coherence</div>
                        <div class="text-4xl font-bold">${metadata.coherenceScore}%</div>
                    </div>
                    <div class="${designSystem.components.badge} ${metadata.coherenceScore >= 85 ? 'bg-green-500' : metadata.coherenceScore >= 70 ? 'bg-blue-500' : 'bg-yellow-500'} text-white">
                        ${metadata.coherenceScore >= 85 ? 'EXCEPTIONAL' : metadata.coherenceScore >= 70 ? 'GOOD' : 'FAIR'}
                    </div>
                </div>
            </div>
            ` : ''}
        </div>
    </header>`;
  }

  /**
   * Generate sticky navigation bar
   * Auto-generated from report sections
   */
  static generateNavigation(config) {
    const { sections = [] } = config;

    const navItems = sections
      .filter(s => s.id !== 'header' && s.id !== 'raw-data' && !s.hidden)
      .map(section => ({
        id: section.id,
        title: section.navTitle || section.title
      }));

    if (navItems.length === 0) {
      return ''; // No navigation if no sections
    }

    return `
    <nav class="${designSystem.components.navbar}">
        <div class="${designSystem.components.container}">
            <div class="flex items-center justify-between">
                <div class="flex space-x-6 overflow-x-auto">
                    ${navItems.map(item => `
                        <a href="#${item.id}" class="${designSystem.components.navLink}">
                            ${item.title}
                        </a>
                    `).join('')}
                </div>
                <button onclick="scrollToTop()" class="text-sm text-gray-600 hover:text-blue-600 ${designSystem.print.hide}">
                    ↑ Top
                </button>
            </div>
        </div>
    </nav>`;
  }

  /**
   * Generate ORCHESTRAI branded footer
   * Consistent footer for all reports
   */
  static generateFooter(config) {
    const { clientName, reportType, reportDate } = config;

    return `
    <footer class="bg-gray-900 text-white py-12 mt-20 ${designSystem.print.hide}">
        <div class="${designSystem.components.container}">
            <div class="grid md:grid-cols-3 gap-8">
                <div>
                    <div class="flex items-center mb-3">
                        <svg class="w-8 h-8 mr-2 opacity-75" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                        </svg>
                        <h3 class="text-xl font-semibold">ORCHESTRAI</h3>
                    </div>
                    <p class="text-gray-400 text-sm">Advanced Multi-Agent Intelligence & Research Platform</p>
                    <p class="text-gray-500 text-xs mt-2">Crystalline Memory Architecture</p>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Client</h4>
                    <p class="text-gray-400">${clientName}</p>
                </div>
                <div>
                    <h4 class="font-bold mb-3">Report Details</h4>
                    <p class="text-gray-400 capitalize">${reportType} Report</p>
                    <p class="text-sm text-gray-500 mt-2">Report Date: ${reportDate || new Date().toLocaleDateString()}</p>
                    <p class="text-sm text-gray-500">Generated: ${new Date().toLocaleString()}</p>
                </div>
            </div>
            <div class="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                <p>Generated by ORCHESTRAI Intelligence System | © ${new Date().getFullYear()} | All Rights Reserved</p>
            </div>
        </div>
    </footer>`;
  }

  /**
   * Generate interactive JavaScript
   * Collapsible sections, smooth scroll, animations, print handling
   */
  static generateScripts() {
    return `
    <script>
        // Smooth scroll to top
        function scrollToTop() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Initialize on DOM ready
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📊 ORCHESTRAI Report initialized');

            // Collapsible sections
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

            console.log('✅ Interactive features loaded');
        });

        // Print handling
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
   * Helper: Escape HTML special characters
   */
  static escapeHtml(text) {
    if (!text) return '';
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Helper: Generate metric card
   * Reusable component for displaying key metrics
   */
  static generateMetricCard(metric) {
    const { label, value, sublabel, color = 'blue' } = metric;

    return `
    <div class="${designSystem.components.card}">
        <p class="text-sm text-gray-500 uppercase tracking-wide mb-2">${label}</p>
        <p class="text-4xl font-bold text-${color}-600">${value}</p>
        ${sublabel ? `<p class="text-xs text-gray-500 mt-2">${sublabel}</p>` : ''}
    </div>`;
  }

  /**
   * Helper: Generate section wrapper
   * Consistent section container with ID and page break
   */
  static generateSectionWrapper(section, content) {
    return `
    <section id="${section.id}" class="${designSystem.components.section} ${section.pageBreak ? designSystem.print.pageBreak : ''}">
        <h2 class="${designSystem.typography.headings.h2.full}">${section.title}</h2>
        ${content}
    </section>`;
  }
}

module.exports = ReportComponents;
