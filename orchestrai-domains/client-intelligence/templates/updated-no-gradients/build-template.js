/**
 * TEMPLATE BUILDER
 *
 * Builds complete HTML templates with embedded NO GRADIENTS CSS
 * Reads the design-system.css and injects it into template placeholders
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
 * Build Intelligence Hub Template
 */
function buildIntelligenceHubTemplate() {
  const css = getEmbeddedCSS();

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{CLIENT_NAME}} - Intelligence Hub 2025</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
${css}
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-content">
            <div class="hero-badge no-print">Intelligence Report</div>
            <h1>{{CLIENT_NAME}}</h1>
            <p class="subtitle">{{TAGLINE}}</p>
            <div style="margin-top: 2rem;">
                <span class="badge badge-purple">Generated: {{GENERATION_DATE}}</span>
            </div>
        </div>
    </section>

    <!-- Main Content -->
    <div class="container" style="padding-top: 4rem; padding-bottom: 4rem;">

        <!-- Executive Metrics -->
        <section class="section">
            <div class="section-header">
                <span class="section-icon">📊</span>
                <h2 class="section-title">Executive Dashboard</h2>
            </div>
            {{STATS_GRID}}
        </section>

        <!-- Business Overview -->
        <section class="section">
            <div class="section-header">
                <span class="section-icon">🏢</span>
                <h2 class="section-title">Business Overview</h2>
            </div>
            <div style="font-size: 1.125rem; line-height: 1.75; color: var(--text-secondary);">
                {{BUSINESS_OVERVIEW}}
            </div>
        </section>

        <!-- Critical Success Factors -->
        <section class="section">
            <div class="section-header">
                <span class="section-icon">⭐</span>
                <h2 class="section-title">Critical Success Factors</h2>
            </div>
            {{SUCCESS_FACTORS}}
        </section>

        <!-- ICP Segments -->
        <section class="section">
            <div class="section-header">
                <span class="section-icon">👥</span>
                <h2 class="section-title">Ideal Customer Profiles</h2>
            </div>
            <p style="margin-bottom: 2rem; color: var(--text-secondary); font-size: 1.125rem;">
                Click any profile to view detailed psychographic analysis, acquisition strategies, and case studies.
            </p>
            {{ICP_CARDS}}
        </section>

        <!-- Strategic Reports Available -->
        <section class="section" style="background-color: var(--secondary-purple); color: var(--text-white);">
            <div class="section-header" style="border-bottom-color: rgba(255,255,255,0.2);">
                <span class="section-icon" style="color: var(--text-white);">📁</span>
                <h2 class="section-title" style="color: var(--text-white);">Strategic Intelligence Reports</h2>
            </div>
            <p style="margin-bottom: 2rem; opacity: 0.9; font-size: 1.125rem;">
                Comprehensive analysis across all business domains
            </p>
            {{REPORTS_AVAILABLE}}
        </section>

    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-title">{{CLIENT_NAME}} Intelligence System</div>
            <div class="footer-bottom">
                Generated {{GENERATION_DATE}} by ORCHESTRAI Intelligence Platform
            </div>
        </div>
    </footer>

    <script>
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    </script>
</body>
</html>`;

  const outputPath = path.join(TEMPLATE_DIR, 'intelligence-hub-template.html');
  fs.writeFileSync(outputPath, template, 'utf8');
  console.log(`✅ Created: intelligence-hub-template.html (${template.length} bytes)`);
  return outputPath;
}

/**
 * Build ICP Deep Dive Template
 */
function buildICPDeepDiveTemplate() {
  const css = getEmbeddedCSS();

  const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{PERSONA_NAME}} - {{CLIENT_NAME}}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
${css}
    </style>
</head>
<body>
    <!-- Hero Section -->
    <section class="hero" style="min-height: 60vh;">
        <div class="hero-content">
            <div class="hero-badge no-print">ICP Deep Dive</div>
            <h1>{{PERSONA_NAME}}</h1>
            <p class="subtitle">{{CLIENT_NAME}} Customer Profile</p>
            <div style="margin-top: 2rem;">
                <span class="badge badge-purple" style="background: rgba(255,255,255,0.2); border: 2px solid white; font-size: 1.125rem; padding: 0.75rem 1.5rem;">
                    {{REVENUE_WEIGHT}} Revenue Weight
                </span>
                <span class="badge badge-purple" style="background: rgba(255,255,255,0.2); border: 2px solid white; font-size: 1.125rem; padding: 0.75rem 1.5rem; margin-left: 1rem;">
                    {{RELEVANCE_SCORE}}% Relevance
                </span>
            </div>
        </div>
    </section>

    <!-- Sticky Navigation -->
    <div class="sticky-nav no-print">
        <nav>
            <a href="#overview">Overview</a>
            <a href="#demographics">Demographics</a>
            <a href="#psychographics">Psychographics</a>
            <a href="#pain-points">Pain Points</a>
            <a href="#acquisition">Acquisition</a>
            <a href="#case-studies">Case Studies</a>
            <a href="#sub-segments">Sub-Segments</a>
        </nav>
    </div>

    <!-- Main Content -->
    <div class="container" style="padding-top: 4rem; padding-bottom: 4rem;">

        {{BREADCRUMB}}

        <!-- Overview -->
        <section id="overview" class="section">
            <div class="section-header">
                <span class="section-icon">📋</span>
                <h2 class="section-title">Overview</h2>
            </div>
            <div style="font-size: 1.125rem; line-height: 1.75; color: var(--text-secondary);">
                {{OVERVIEW_TEXT}}
            </div>
        </section>

        <!-- Demographics -->
        <section id="demographics" class="section">
            <div class="section-header">
                <span class="section-icon">📊</span>
                <h2 class="section-title">Demographics</h2>
            </div>
            {{DEMOGRAPHICS_GRID}}
        </section>

        <!-- Psychographics -->
        <section id="psychographics" class="section">
            <div class="section-header">
                <span class="section-icon">🧠</span>
                <h2 class="section-title">Psychographics</h2>
            </div>
            {{PSYCHOGRAPHICS_CONTENT}}
        </section>

        <!-- Pain Points -->
        <section id="pain-points" class="section">
            <div class="section-header">
                <span class="section-icon">⚠️</span>
                <h2 class="section-title">Pain Points & Challenges</h2>
            </div>
            {{PAIN_POINTS}}
        </section>

        <!-- Acquisition Channels -->
        <section id="acquisition" class="section">
            <div class="section-header">
                <span class="section-icon">📈</span>
                <h2 class="section-title">Acquisition Channels</h2>
            </div>
            {{ACQUISITION_TABLE}}
        </section>

        <!-- Case Studies -->
        <section id="case-studies" class="section">
            <div class="section-header">
                <span class="section-icon">💼</span>
                <h2 class="section-title">Case Studies</h2>
            </div>
            {{CASE_STUDIES}}
        </section>

        <!-- Sub-Segments -->
        <section id="sub-segments" class="section">
            <div class="section-header">
                <span class="section-icon">🎯</span>
                <h2 class="section-title">Sub-Segments</h2>
            </div>
            {{SUB_SEGMENTS}}
        </section>

    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-title">{{CLIENT_NAME}} Intelligence System</div>
            <div class="footer-bottom">
                ICP Analysis: {{PERSONA_NAME}} | Generated {{GENERATION_DATE}}
            </div>
        </div>
    </footer>
</body>
</html>`;

  const outputPath = path.join(TEMPLATE_DIR, 'icp-deep-dive-template.html');
  fs.writeFileSync(outputPath, template, 'utf8');
  console.log(`✅ Created: icp-deep-dive-template.html (${template.length} bytes)`);
  return outputPath;
}

/**
 * Build all templates
 */
function buildAllTemplates() {
  console.log('\n' + '='.repeat(80));
  console.log('BUILDING NO GRADIENTS INTELLIGENCE REPORT TEMPLATES');
  console.log('='.repeat(80) + '\n');

  const templates = [];

  templates.push(buildIntelligenceHubTemplate());
  templates.push(buildICPDeepDiveTemplate());

  console.log('\n' + '='.repeat(80));
  console.log(`✅ BUILD COMPLETE: ${templates.length} templates created`);
  console.log('='.repeat(80) + '\n');

  return templates;
}

// Run if executed directly
if (require.main === module) {
  buildAllTemplates();
}

module.exports = {
  buildAllTemplates,
  buildIntelligenceHubTemplate,
  buildICPDeepDiveTemplate
};
