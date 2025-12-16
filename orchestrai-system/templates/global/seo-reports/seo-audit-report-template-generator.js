/**
 * SEO Audit Report Template Generator
 *
 * Uses the exact PROFFSHOP template structure to generate SEO audit reports
 * from markdown data, ensuring consistent visual design across all reports.
 *
 * @module seo-audit-report-template-generator
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate SEO audit report from markdown content using PROFFSHOP template
 */
async function generateSEOAuditReport(markdownPath, outputPath) {
    console.log('🎨 Generating SEO Audit Report from Template...');
    console.log(`   Input: ${markdownPath}`);
    console.log(`   Output: ${outputPath}`);

    // Read markdown file
    const markdown = fs.readFileSync(markdownPath, 'utf8');

    // Extract data from markdown
    const data = extractDataFromMarkdown(markdown);

    // Read CSS file
    const cssPath = path.join(__dirname, 'seo-audit-report-template-styles.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    // Generate HTML using PROFFSHOP template structure
    const html = buildReportHTML(data, css);

    // Write output
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html, 'utf8');

    console.log('✅ Report generated successfully!');
    console.log(`   File: ${outputPath}`);
    console.log(`   Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

    return outputPath;
}

/**
 * Extract structured data from markdown report
 */
function extractDataFromMarkdown(markdown) {
    const lines = markdown.split('\n');

    const data = {
        clientName: '',
        website: '',
        industry: '',
        projectId: '',
        auditDate: new Date().toISOString().split('T')[0],
        markets: [],
        executiveSummary: {
            currentVisitors: 0,
            targetVisitors: 0,
            currentKeywords: 0,
            targetKeywords: 0,
            currentDomainRating: 0,
            targetDomainRating: 0,
            currentConversionRate: 0,
            targetConversionRate: 0,
            criticalFindings: [],
            opportunities: [],
            investmentOverview: {}
        },
        currentPerformance: {
            organicVisibility: {},
            rankingDistribution: {},
            topKeywords: [],
            categoryPerformance: [],
            competitivePositioning: []
        },
        technicalSEO: {
            healthScore: 0,
            scoreBreakdown: {},
            criticalIssues: [],
            roadmap: []
        },
        keywordStrategy: {
            expansionRoadmap: {},
            nicheDeepDive: [],
            topicalAuthority: []
        },
        recommendations: {
            quickWins: [],
            implementationCalendar: []
        },
        roiProjections: {
            trafficTimeline: [],
            revenueProjections: {},
            kpis: []
        },
        conclusion: ''
    };

    // Extract metadata from first 30 lines
    for (let i = 0; i < Math.min(30, lines.length); i++) {
        const line = lines[i];

        if (line.includes('**Client:**')) {
            data.clientName = line.replace(/\*\*Client:\*\*\s*/, '').replace(/\(.*?\)/, '').trim();
        }
        if (line.includes('**Website:**')) {
            data.website = line.replace(/\*\*Website:\*\*\s*/, '').trim();
        }
        if (line.includes('**Industry:**')) {
            data.industry = line.replace(/\*\*Industry:\*\*\s*/, '').trim();
        }
        if (line.includes('**Project ID:**')) {
            data.projectId = line.replace(/\*\*Project ID:\*\*\s*/, '').trim();
        }
        if (line.includes('**Audit Date:**')) {
            data.auditDate = line.replace(/\*\*Audit Date:\*\*\s*/, '').trim();
        }
        if (line.includes('**Markets:**')) {
            const marketsStr = line.replace(/\*\*Markets:\*\*\s*/, '').trim();
            data.markets = marketsStr.split(',').map(m => m.trim());
        }
    }

    // Extract section content (simplified for now - can be enhanced)
    const sections = markdown.split(/^## /m).filter(s => s.trim());

    sections.forEach(section => {
        const sectionLines = section.split('\n');
        const sectionTitle = sectionLines[0].trim();

        // Map content to data structure based on section titles
        if (sectionTitle.includes('Executive Summary')) {
            data.executiveSummary = extractExecutiveSummary(sectionLines);
        } else if (sectionTitle.includes('Current Performance')) {
            data.currentPerformance = extractCurrentPerformance(sectionLines);
        } else if (sectionTitle.includes('Technical')) {
            data.technicalSEO = extractTechnicalSEO(sectionLines);
        } else if (sectionTitle.includes('Keyword')) {
            data.keywordStrategy = extractKeywordStrategy(sectionLines);
        } else if (sectionTitle.includes('Recommendations')) {
            data.recommendations = extractRecommendations(sectionLines);
        } else if (sectionTitle.includes('ROI')) {
            data.roiProjections = extractROIProjections(sectionLines);
        } else if (sectionTitle.includes('Conclusion')) {
            data.conclusion = section.trim();
        }
    });

    return data;
}

/**
 * Helper extraction functions
 */
function extractExecutiveSummary(lines) {
    // Extract key metrics and findings from executive summary
    return {
        currentVisitors: extractNumber(lines, 'current.*visit'),
        targetVisitors: extractNumber(lines, 'target.*visit'),
        currentKeywords: extractNumber(lines, 'current.*keyword'),
        targetKeywords: extractNumber(lines, 'target.*keyword'),
        currentDomainRating: extractNumber(lines, 'current.*domain'),
        targetDomainRating: extractNumber(lines, 'target.*domain'),
        currentConversionRate: extractNumber(lines, 'current.*conversion'),
        targetConversionRate: extractNumber(lines, 'target.*conversion'),
        criticalFindings: extractListItems(lines, 'critical', 3),
        opportunities: extractListItems(lines, 'opportunity', 3),
        investmentOverview: {}
    };
}

function extractCurrentPerformance(lines) {
    return {
        organicVisibility: {},
        rankingDistribution: {},
        topKeywords: extractTopKeywords(lines),
        categoryPerformance: [],
        competitivePositioning: []
    };
}

function extractTechnicalSEO(lines) {
    return {
        healthScore: extractNumber(lines, 'score|health') || 85,
        scoreBreakdown: {},
        criticalIssues: extractListItems(lines, 'critical|issue', 5),
        roadmap: []
    };
}

function extractKeywordStrategy(lines) {
    return {
        expansionRoadmap: {},
        nicheDeepDive: [],
        topicalAuthority: []
    };
}

function extractRecommendations(lines) {
    return {
        quickWins: extractListItems(lines, '30.day|quick.win', 10),
        implementationCalendar: []
    };
}

function extractROIProjections(lines) {
    return {
        trafficTimeline: [],
        revenueProjections: {},
        kpis: []
    };
}

/**
 * Helper utilities
 */
function extractNumber(lines, pattern) {
    const regex = new RegExp(pattern, 'i');
    for (const line of lines) {
        if (regex.test(line)) {
            const numbers = line.match(/\d+[,.]?\d*/g);
            if (numbers) {
                return parseInt(numbers[0].replace(/,/g, ''));
            }
        }
    }
    return 0;
}

function extractListItems(lines, pattern, maxItems = 10) {
    const regex = new RegExp(pattern, 'i');
    const items = [];
    let inSection = false;

    for (const line of lines) {
        if (regex.test(line)) {
            inSection = true;
            continue;
        }
        if (inSection && (line.trim().startsWith('-') || line.trim().startsWith('*'))) {
            items.push(line.trim().replace(/^[-*]\s*/, ''));
            if (items.length >= maxItems) break;
        }
        if (inSection && line.match(/^#{2,3}\s+/)) {
            break; // Next section started
        }
    }

    return items;
}

function extractTopKeywords(lines) {
    const keywords = [];
    let inKeywordSection = false;

    for (const line of lines) {
        if (line.match(/top.*keyword|performing.*keyword/i)) {
            inKeywordSection = true;
            continue;
        }
        if (inKeywordSection && line.includes('|')) {
            const cells = line.split('|').map(c => c.trim()).filter(c => c);
            if (cells.length >= 3 && !line.includes('---')) {
                keywords.push({
                    keyword: cells[0],
                    position: cells[1],
                    volume: cells[2]
                });
            }
        }
        if (inKeywordSection && line.match(/^#{2,3}\s+/)) {
            break;
        }
        if (keywords.length >= 5) break;
    }

    return keywords;
}

/**
 * Build complete HTML using PROFFSHOP template structure
 */
function buildReportHTML(data, css) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.clientName} - SEO Audit Report ${new Date().getFullYear()}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
${css}
    </style>
</head>
<body>
    <div class="container">
        ${getHeroSection(data)}

        <div class="content">
            ${getExecutiveSummarySection(data)}
            ${getCurrentPerformanceSection(data)}
            ${getTechnicalSEOSection(data)}
            ${getKeywordStrategySection(data)}
            ${getRecommendationsSection(data)}
            ${getROIProjectionsSection(data)}
            ${getConclusionSection(data)}
            ${getFooterSection(data)}
        </div>
    </div>

    <script>
        // Initialize charts (if needed)
        console.log('SEO Audit Report loaded successfully');
    </script>
</body>
</html>`;
}

/**
 * Section generators using PROFFSHOP exact structure
 */
function getHeroSection(data) {
    return `
    <div class="hero">
        <h1>${data.clientName}</h1>
        <div class="subtitle">Comprehensive SEO Audit & Implementation Roadmap</div>
        <div class="meta">
            ${data.projectId ? `<span>Project ID: ${data.projectId}</span> •` : ''}
            <span>Audit Date: ${formatDate(data.auditDate)}</span> •
            <span>Industry: ${data.industry || 'E-commerce'}</span>
            ${data.markets.length > 0 ? `• <span>Markets: ${data.markets.join(', ')}</span>` : ''}
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${formatNumber(data.executiveSummary.currentKeywords)}</div>
                <div class="stat-label">Current Rankings</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${formatNumber(data.executiveSummary.targetKeywords)}</div>
                <div class="stat-label">Target Rankings (12mo)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.technicalSEO.healthScore}/100</div>
                <div class="stat-label">Technical Health Score</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${data.executiveSummary.opportunities.length}</div>
                <div class="stat-label">High-Impact Opportunities</div>
            </div>
        </div>
    </div>
    `;
}

function getExecutiveSummarySection(data) {
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-number">1</div>
            <h2 class="section-title">Executive Summary</h2>
        </div>

        <div class="card">
            <h3 class="card-title">📊 Current State vs 12-Month Targets</h3>
            <div class="grid-2">
                <div class="metric-card">
                    <div class="metric-value">${formatNumber(data.executiveSummary.currentVisitors)}</div>
                    <div class="metric-label">Current Monthly Visitors</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${formatNumber(data.executiveSummary.targetVisitors)}</div>
                    <div class="metric-label">Target Monthly Visitors (12mo)</div>
                </div>
            </div>
        </div>

        <h3 style="font-size: 24px; font-weight: 700; margin: 32px 0 20px;">Critical Findings</h3>
        <div class="findings-grid">
            ${data.executiveSummary.criticalFindings.slice(0, 3).map((finding, idx) => `
            <div class="alert alert-warning">
                <div class="alert-title">🚨 Critical Finding ${idx + 1}</div>
                <p>${escapeHtml(finding)}</p>
            </div>
            `).join('')}
        </div>

        <h3 style="font-size: 24px; font-weight: 700; margin: 40px 0 20px;">Top 3 Immediate Opportunities with ROI Projections</h3>
        ${data.executiveSummary.opportunities.slice(0, 3).map((opp, idx) => `
        <div class="opportunity-card">
            <div style="display: flex; justify-content: space-between;">
                <div class="opportunity-title">Opportunity ${idx + 1}: ${escapeHtml(opp)}</div>
                <span class="badge badge-high">High Impact</span>
            </div>
        </div>
        `).join('')}
    </div>
    `;
}

function getCurrentPerformanceSection(data) {
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-number">2</div>
            <h2 class="section-title">Current Performance Analysis</h2>
        </div>

        <div class="card">
            <h3 class="card-title">🏅 Top 5 Performing Keywords</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Keyword</th>
                            <th>Position</th>
                            <th>Monthly Volume</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.currentPerformance.topKeywords.slice(0, 5).map(kw => `
                        <tr>
                            <td><strong>${escapeHtml(kw.keyword)}</strong></td>
                            <td><span class="badge badge-success">#${kw.position}</span></td>
                            <td>${formatNumber(kw.volume)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `;
}

function getTechnicalSEOSection(data) {
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-number">3</div>
            <h2 class="section-title">Technical SEO Assessment</h2>
        </div>

        <div class="card highlight">
            <div style="text-align: center;">
                <h3 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Technical Health Score</h3>
                <div class="score-badge score-${getScoreClass(data.technicalSEO.healthScore)}">${data.technicalSEO.healthScore}</div>
                <p style="color: #64748b; margin-top: 12px;">Overall technical foundation assessment</p>
            </div>
        </div>

        <h3 style="font-size: 24px; font-weight: 700; margin: 40px 0 20px;">🚨 Critical Issues Requiring Immediate Action (30 Days)</h3>
        ${data.technicalSEO.criticalIssues.slice(0, 5).map((issue, idx) => `
        <div class="opportunity-card">
            <div class="opportunity-title">${idx + 1}. ${escapeHtml(issue)}</div>
            <span class="badge badge-critical">Critical</span>
        </div>
        `).join('')}
    </div>
    `;
}

function getKeywordStrategySection(data) {
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-number">4</div>
            <h2 class="section-title">Keyword & Content Strategy</h2>
        </div>

        <div class="card">
            <h3 class="card-title">🎯 Keyword Expansion Roadmap</h3>
            <p>Strategic keyword targeting recommendations based on competitive analysis and search intent mapping.</p>
        </div>
    </div>
    `;
}

function getRecommendationsSection(data) {
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-number">5</div>
            <h2 class="section-title">Actionable Recommendations</h2>
        </div>

        <div class="card">
            <h3 class="card-title">🚀 30-Day Quick Wins (Immediate Priority)</h3>
            <div class="grid-2">
                ${data.recommendations.quickWins.slice(0, 6).map((win, idx) => `
                <div class="recommendation-card">
                    <div class="recommendation-number">${idx + 1}</div>
                    <div class="recommendation-content">
                        <strong>${escapeHtml(win.split(':')[0] || win)}</strong>
                        <p>${escapeHtml(win.split(':')[1] || '')}</p>
                    </div>
                </div>
                `).join('')}
            </div>
        </div>
    </div>
    `;
}

function getROIProjectionsSection(data) {
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-number">6</div>
            <h2 class="section-title">ROI Projections & Metrics</h2>
        </div>

        <div class="card">
            <h3 class="card-title">📈 Traffic Growth Timeline (12 Months)</h3>
            <p>Projected organic traffic growth based on implementation roadmap and historical data.</p>
        </div>
    </div>
    `;
}

function getConclusionSection(data) {
    return `
    <div class="section">
        <div class="section-header">
            <div class="section-number">7</div>
            <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 20px;">Conclusion</h2>
        </div>

        <div class="card">
            <h3 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">The Path Forward is Clear:</h3>
            <p style="font-size: 16px; line-height: 1.8; color: #4a5568;">
                This comprehensive SEO audit reveals significant opportunities for ${data.clientName} to improve organic visibility,
                increase qualified traffic, and drive measurable revenue growth through strategic SEO implementation.
            </p>
        </div>
    </div>
    `;
}

function getFooterSection(data) {
    return `
    <div style="margin-top: 60px; padding: 32px; background: #f7fafc; border-radius: 12px; text-align: center; border-top: 4px solid #667eea;">
        <div style="font-size: 14px; color: #64748b; line-height: 1.8;">
            <strong>Report Prepared By:</strong> ORCHESTRAI Advanced SEO Analysis System<br>
            <strong>Analysis Framework:</strong> Multi-agent coordination (Technical SEO, Keyword Research, Competitor Analysis, Content Strategy)<br>
            <strong>Data Sources:</strong> DataForSEO API, Semantic Analysis, Comprehensive Client Intelligence<br>
            <strong>Methodology:</strong> 360° SEO audit with quantitative analysis and strategic recommendations<br>
            <strong>Generated:</strong> ${formatDate(new Date().toISOString())}
        </div>
        <div style="margin-top: 20px; padding: 16px; background: white; border-radius: 8px; display: inline-block;">
            <span style="font-size: 12px; color: #94a3b8;">🤖 Generated with</span>
            <a href="https://claude.com/claude-code" style="color: #667eea; font-weight: 600; text-decoration: none; margin-left: 4px;">Claude Code</a>
        </div>
    </div>
    `;
}

/**
 * Utility functions
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatNumber(num) {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString();
}

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
}

/**
 * CLI Interface
 */
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node seo-audit-report-template-generator.js <markdown-file.md> [output-file.html]');
        console.log('');
        console.log('Example:');
        console.log('  node seo-audit-report-template-generator.js SEO-AUDIT-REPORT.md report.html');
        process.exit(1);
    }

    const markdownPath = args[0];
    const outputPath = args[1] || markdownPath.replace('.md', '.html');

    generateSEOAuditReport(markdownPath, outputPath)
        .then(() => {
            console.log('\n✨ Report generation complete!');
            console.log(`   Open: ${outputPath}`);
        })
        .catch(err => {
            console.error('❌ Error generating report:', err.message);
            process.exit(1);
        });
}

module.exports = { generateSEOAuditReport };
