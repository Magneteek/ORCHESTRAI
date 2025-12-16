/**
 * COMPREHENSIVE SINGLE-PAGE TEMPLATE BUILDER
 *
 * Builds a complete single-page intelligence report with:
 * - All sections in one page
 * - Sticky table of contents with scroll-spy
 * - All ICP deep dives
 * - Strategic analysis sections
 * - NO GRADIENTS design system
 */

const fs = require('fs');
const path = require('path');

// Paths
const CSS_PATH = path.join(__dirname, '../../../..', 'orchestrai-system/templates/global/intelligence-reports/design-system/design-system.css');
const TEMPLATE_DIR = __dirname;

/**
 * Read NO GRADIENTS CSS
 */
function getEmbeddedCSS() {
  return fs.readFileSync(CSS_PATH, 'utf8');
}

/**
 * Build Comprehensive Single-Page Template
 */
function buildComprehensiveTemplate() {
  const css = getEmbeddedCSS();

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{CLIENT_NAME}} - Comprehensive Intelligence Report 2025</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
${css}

/* Additional styles for single-page layout */
.page-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 0;
  max-width: 1800px;
  margin: 0 auto;
  background: var(--bg-secondary);
}

.toc-sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  background: var(--bg-primary);
  border-right: 2px solid var(--border-light);
  overflow-y: auto;
  padding: var(--space-6);
  z-index: 100;
}

.toc-title {
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  color: var(--primary-purple);
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 2px solid var(--border-light);
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.toc-link {
  display: block;
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  border-left: 3px solid transparent;
}

.toc-link:hover {
  background-color: var(--purple-10);
  color: var(--primary-purple);
  border-left-color: var(--primary-purple);
}

.toc-link.active {
  background-color: var(--primary-purple);
  color: var(--text-white);
  border-left-color: var(--secondary-purple);
  font-weight: var(--font-semibold);
}

.toc-link.sub-link {
  padding-left: var(--space-8);
  font-size: var(--font-xs);
  font-weight: var(--font-normal);
}

.main-content {
  background: var(--bg-secondary);
  min-height: 100vh;
  padding: 0;
}

.content-section {
  scroll-margin-top: 2rem;
  background: var(--bg-primary);
  margin-bottom: var(--space-6);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
}

.back-to-top {
  position: fixed;
  bottom: var(--space-8);
  right: var(--space-8);
  background-color: var(--primary-purple);
  color: var(--text-white);
  width: 50px;
  height: 50px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--shadow-purple);
  transition: all var(--transition-base);
  opacity: 0;
  visibility: hidden;
  z-index: 1000;
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
}

.back-to-top:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.section-divider {
  height: 3px;
  background-color: var(--primary-purple);
  margin: var(--space-12) 0;
  border-radius: var(--radius-full);
}

.icp-section-header {
  background-color: var(--primary-purple);
  color: var(--text-white);
  padding: var(--space-8);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  margin: 0 0 var(--space-8) 0;
}

.icp-section-title {
  font-size: var(--font-4xl);
  font-weight: var(--font-bold);
  color: var(--text-white);
  margin-bottom: var(--space-3);
}

.icp-section-meta {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.icp-badge {
  background-color: var(--white-20);
  border: 2px solid var(--white-30);
  color: var(--text-white);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
}

/* Responsive */
@media (max-width: 1024px) {
  .page-layout {
    grid-template-columns: 1fr;
  }

  .toc-sidebar {
    display: none;
  }
}

@media print {
  .toc-sidebar {
    display: none;
  }

  .back-to-top {
    display: none;
  }

  .page-layout {
    grid-template-columns: 1fr;
  }

  .content-section {
    page-break-inside: avoid;
  }
}
    </style>
</head>
<body>
    <!-- Hero Section (Full Width) -->
    <section class="hero">
        <div class="hero-content">
            <div class="hero-badge no-print">Comprehensive Intelligence Report</div>
            <h1>{{CLIENT_NAME}}</h1>
            <p class="subtitle">{{TAGLINE}}</p>
            <div style="margin-top: 2rem;">
                <span class="badge badge-purple" style="background: rgba(255,255,255,0.2); border: 2px solid white; font-size: 1rem; padding: 0.5rem 1.5rem;">
                    Generated: {{GENERATION_DATE}}
                </span>
            </div>
        </div>
    </section>

    <!-- Two-Column Layout: TOC + Content -->
    <div class="page-layout">

        <!-- Sticky Table of Contents -->
        <aside class="toc-sidebar no-print">
            <div class="toc-title">📑 Contents</div>
            <nav class="toc-nav" id="toc-nav">
                <a href="#executive-dashboard" class="toc-link">📊 Executive Dashboard</a>
                <a href="#business-overview" class="toc-link">🏢 Business Overview</a>
                <a href="#success-factors" class="toc-link">⭐ Success Factors</a>

                <div style="margin: var(--space-4) 0; padding-top: var(--space-4); border-top: 1px solid var(--border-light);">
                    <div style="font-size: var(--font-xs); font-weight: var(--font-semibold); color: var(--text-tertiary); margin-bottom: var(--space-2); padding: 0 var(--space-4);">CUSTOMER PROFILES</div>
                </div>
                {{TOC_ICP_LINKS}}

                <div style="margin: var(--space-4) 0; padding-top: var(--space-4); border-top: 1px solid var(--border-light);">
                    <div style="font-size: var(--font-xs); font-weight: var(--font-semibold); color: var(--text-tertiary); margin-bottom: var(--space-2); padding: 0 var(--space-4);">STRATEGIC ANALYSIS</div>
                </div>
                <a href="#psychographic-analysis" class="toc-link">🧠 Psychographic Analysis</a>
                <a href="#eos-framework" class="toc-link">🎯 EOS Framework</a>
                <a href="#seo-strategy" class="toc-link">🔍 SEO Strategy</a>
                <a href="#competitive-intelligence" class="toc-link">📈 Competitive Intelligence</a>
            </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">

            <!-- Executive Dashboard -->
            <section id="executive-dashboard" class="content-section" style="margin-top: 0;">
                <div style="padding: var(--space-12);">
                    <div class="section-header">
                        <span class="section-icon">📊</span>
                        <h2 class="section-title">Executive Dashboard</h2>
                    </div>
                    {{STATS_GRID}}
                </div>
            </section>

            <!-- Business Overview -->
            <section id="business-overview" class="content-section">
                <div style="padding: var(--space-12);">
                    <div class="section-header">
                        <span class="section-icon">🏢</span>
                        <h2 class="section-title">Business Overview</h2>
                    </div>
                    <div style="font-size: 1.125rem; line-height: 1.75; color: var(--text-secondary);">
                        {{BUSINESS_OVERVIEW}}
                    </div>
                </div>
            </section>

            <!-- Critical Success Factors -->
            <section id="success-factors" class="content-section">
                <div style="padding: var(--space-12);">
                    <div class="section-header">
                        <span class="section-icon">⭐</span>
                        <h2 class="section-title">Critical Success Factors</h2>
                    </div>
                    {{SUCCESS_FACTORS}}
                </div>
            </section>

            <div class="section-divider" style="margin: var(--space-12) var(--space-12);"></div>

            <!-- ICP Sections (All Personas) -->
            {{ICP_SECTIONS}}

            <div class="section-divider" style="margin: var(--space-12) var(--space-12);"></div>

            <!-- Psychographic Analysis -->
            <section id="psychographic-analysis" class="content-section">
                <div style="padding: var(--space-12);">
                    <div class="section-header">
                        <span class="section-icon">🧠</span>
                        <h2 class="section-title">Psychographic Analysis</h2>
                    </div>
                    {{PSYCHOGRAPHIC_CONTENT}}
                </div>
            </section>

            <!-- EOS Framework -->
            <section id="eos-framework" class="content-section">
                <div style="padding: var(--space-12);">
                    <div class="section-header">
                        <span class="section-icon">🎯</span>
                        <h2 class="section-title">EOS Framework</h2>
                    </div>
                    {{EOS_CONTENT}}
                </div>
            </section>

            <!-- SEO Strategy -->
            <section id="seo-strategy" class="content-section">
                <div style="padding: var(--space-12);">
                    <div class="section-header">
                        <span class="section-icon">🔍</span>
                        <h2 class="section-title">SEO Strategy</h2>
                    </div>
                    {{SEO_CONTENT}}
                </div>
            </section>

            <!-- Competitive Intelligence -->
            <section id="competitive-intelligence" class="content-section">
                <div style="padding: var(--space-12);">
                    <div class="section-header">
                        <span class="section-icon">📈</span>
                        <h2 class="section-title">Competitive Intelligence</h2>
                    </div>
                    {{COMPETITIVE_CONTENT}}
                </div>
            </section>

            <!-- Footer -->
            <footer class="footer" style="margin-top: 0;">
                <div class="container">
                    <div class="footer-title">{{CLIENT_NAME}} Intelligence System</div>
                    <div class="footer-bottom">
                        Comprehensive Intelligence Report | Generated {{GENERATION_DATE}} by ORCHESTRAI
                    </div>
                </div>
            </footer>

        </main>
    </div>

    <!-- Back to Top Button -->
    <div class="back-to-top no-print" id="backToTop">
        <span style="font-size: 1.5rem;">↑</span>
    </div>

    <script>
        // Scroll spy for TOC
        const sections = document.querySelectorAll('.content-section');
        const tocLinks = document.querySelectorAll('.toc-link');

        function updateActiveLink() {
            let currentSection = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 100) {
                    currentSection = section.getAttribute('id');
                }
            });

            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + currentSection) {
                    link.classList.add('active');
                }
            });
        }

        window.addEventListener('scroll', updateActiveLink);
        updateActiveLink();

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Back to top button
        const backToTop = document.getElementById('backToTop');
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    </script>
</body>
</html>`;

  const outputPath = path.join(TEMPLATE_DIR, 'comprehensive-intelligence-template.html');
  fs.writeFileSync(outputPath, template, 'utf8');

  const fileSize = (fs.statSync(outputPath).size / 1024).toFixed(2);
  console.log(`✅ Created: comprehensive-intelligence-template.html (${fileSize} KB)`);
  console.log(`   Embedded CSS: 946 lines`);
  console.log(`   Additional styles: Single-page layout with sticky TOC`);

  return outputPath;
}

// Run if executed directly
if (require.main === module) {
  console.log('\n' + '='.repeat(80));
  console.log('BUILDING COMPREHENSIVE SINGLE-PAGE TEMPLATE');
  console.log('='.repeat(80) + '\n');

  buildComprehensiveTemplate();

  console.log('\n' + '='.repeat(80));
  console.log('✅ BUILD COMPLETE');
  console.log('='.repeat(80) + '\n');
}

module.exports = {
  buildComprehensiveTemplate
};
