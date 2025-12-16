/**
 * SEO Audit Report Generator
 *
 * Generates professional, interactive SEO audit reports using the premium template
 * with ShadCN UI design principles, Tailwind CSS, and Chart.js visualizations.
 *
 * @module seo-audit-report-generator
 */

const fs = require('fs');
const path = require('path');

/**
 * Generate SEO Audit Report HTML
 *
 * @param {Object} data - SEO audit data
 * @param {string} data.projectId - Project UUID
 * @param {string} data.clientName - Client business name
 * @param {string} data.website - Client website URL
 * @param {string} data.industry - Industry description
 * @param {string} data.auditDate - Audit date (YYYY-MM-DD)
 * @param {Array<string>} data.markets - Array of target markets
 * @param {Object} data.currentMetrics - Current performance metrics
 * @param {Object} data.targetMetrics - 12-month target metrics
 * @param {Object} data.technicalSEO - Technical SEO assessment data
 * @param {Object} data.keywords - Keyword research data
 * @param {Object} data.competitive - Competitive analysis data
 * @param {Object} data.roi - ROI projections and metrics
 * @param {string} outputPath - Path where the HTML file should be saved
 * @returns {Promise<string>} Path to generated HTML file
 */
async function generateSEOAuditReport(data, outputPath) {
    console.log('🎨 Generating SEO Audit Report...');
    console.log(`   Client: ${data.clientName}`);
    console.log(`   Project ID: ${data.projectId}`);
    console.log(`   Output: ${outputPath}`);

    // Validate required data
    validateData(data);

    // Generate HTML from template
    const html = buildReportHTML(data);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write HTML file
    fs.writeFileSync(outputPath, html, 'utf8');

    console.log('✅ SEO Audit Report generated successfully!');
    console.log(`   File: ${outputPath}`);
    console.log(`   Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

    return outputPath;
}

/**
 * Validate required data structure
 */
function validateData(data) {
    const required = ['projectId', 'clientName', 'website', 'currentMetrics', 'targetMetrics'];
    const missing = required.filter(field => !data[field]);

    if (missing.length > 0) {
        throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
}

/**
 * Build complete HTML report
 */
function buildReportHTML(data) {
    // Set defaults for optional fields
    const defaults = {
        industry: 'E-commerce',
        auditDate: new Date().toISOString().split('T')[0],
        markets: ['Primary Market'],
        technicalSEO: {},
        keywords: {},
        competitive: {},
        roi: {}
    };

    const d = { ...defaults, ...data };

    // Calculate growth percentages
    const growthCalcs = calculateGrowth(d.currentMetrics, d.targetMetrics);

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${d.clientName} - SEO Audit Report ${new Date().getFullYear()}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    ${getStylesSection()}
</head>
<body>
    <div class="container">
        ${getHeroSection(d, growthCalcs)}

        <div class="content">
            ${getExecutiveSummarySection(d, growthCalcs)}
            ${getCurrentPerformanceSection(d)}
            ${getTechnicalSEOSection(d)}
            ${getKeywordStrategySection(d)}
            ${getRecommendationsSection(d)}
            ${getROISection(d)}
            ${getConclusionSection(d)}
            ${getFooterSection(d)}
        </div>
    </div>

    ${getScriptsSection(d)}
</body>
</html>`;
}

/**
 * Calculate growth percentages
 */
function calculateGrowth(current, target) {
    const calc = (curr, targ) => {
        const growth = ((targ - curr) / curr * 100).toFixed(0);
        return growth > 0 ? `+${growth}%` : `${growth}%`;
    };

    return {
        keywords: calc(current.rankingKeywords || 0, target.rankingKeywords || 0),
        traffic: calc(current.monthlyTraffic || 0, target.monthlyTraffic || 0),
        domainAuthority: calc(current.domainAuthority || 0, target.domainAuthority || 0),
        technicalScore: calc(current.technicalScore || 0, target.technicalScore || 0),
        organicValue: calc(current.organicValue || 0, target.organicValue || 0),
        topRankings: target.topRankings || 0
    };
}

/**
 * Get styles section (complete CSS from template)
 */
function getStylesSection() {
    // Return the complete styles from the original template
    // (Keeping the same CSS as the working template)
    const css = fs.readFileSync(
        path.join(__dirname, 'seo-audit-report-template-styles.css'),
        'utf8'
    );
    return `<style>\n${css}\n    </style>`;
}

/**
 * Get hero section HTML
 */
function getHeroSection(d, growth) {
    const current = d.currentMetrics;
    const target = d.targetMetrics;

    return `
        <div class="hero">
            <h1>${d.clientName}</h1>
            <div class="subtitle">Comprehensive SEO Audit & Implementation Roadmap</div>
            <div class="meta">
                <span>Project ID: ${d.projectId}</span> •
                <span>Audit Date: ${formatDate(d.auditDate)}</span> •
                <span>Industry: ${d.industry}</span> •
                <span>Markets: ${d.markets.join(', ')}</span>
            </div>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">Ranking Keywords</div>
                    <div class="stat-value">
                        <span>${current.rankingKeywords || 0}</span>
                        <span class="stat-arrow">→</span>
                        <span class="stat-target">${target.rankingKeywords || 0}+</span>
                    </div>
                    <div class="stat-growth">${growth.keywords} Growth</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Monthly Traffic</div>
                    <div class="stat-value">
                        <span>${current.monthlyTraffic || 0}</span>
                        <span class="stat-arrow">→</span>
                        <span class="stat-target">${target.monthlyTraffic || 0}+</span>
                    </div>
                    <div class="stat-growth">${growth.traffic} Growth</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Domain Authority</div>
                    <div class="stat-value">
                        <span>${current.domainAuthority || 0}</span>
                        <span class="stat-arrow">→</span>
                        <span class="stat-target">${target.domainAuthority || 0}</span>
                    </div>
                    <div class="stat-growth">${growth.domainAuthority} Growth</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Technical SEO Score</div>
                    <div class="stat-value">
                        <span>${current.technicalScore || 0}</span>
                        <span class="stat-arrow">→</span>
                        <span class="stat-target">${target.technicalScore || 0}</span>
                    </div>
                    <div class="stat-growth">${growth.technicalScore} Improvement</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Monthly Organic Value</div>
                    <div class="stat-value">
                        <span>€${current.organicValue || 0}</span>
                        <span class="stat-arrow">→</span>
                        <span class="stat-target">€${target.organicValue || 0}+</span>
                    </div>
                    <div class="stat-growth">${growth.organicValue} Growth</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Top 3 Rankings</div>
                    <div class="stat-value">
                        <span>${current.topRankings || 0}</span>
                        <span class="stat-arrow">→</span>
                        <span class="stat-target">${target.topRankings || 0}</span>
                    </div>
                    <div class="stat-growth">New Opportunity</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Get executive summary section
 * (Placeholder - will be populated with actual data)
 */
function getExecutiveSummarySection(d, growth) {
    return `
        <div class="section">
            <div class="section-header">
                <div class="section-number">1</div>
                <h2 class="section-title">Executive Summary</h2>
            </div>

            <div class="alert alert-info">
                <span style="font-size: 24px;">💡</span>
                <div>
                    <strong>Key Insight:</strong> ${d.executiveSummary || 'This comprehensive SEO audit reveals significant growth opportunities to transform organic visibility into category-defining authority.'}
                </div>
            </div>

            <div class="card">
                <h3 class="card-title">📊 Current State vs 12-Month Targets</h3>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Metric</th>
                                <th>Current</th>
                                <th>12-Month Target</th>
                                <th>Growth</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${getMetricsTableRows(d.currentMetrics, d.targetMetrics, growth)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get metrics table rows
 */
function getMetricsTableRows(current, target, growth) {
    const metrics = [
        ['Ranking Keywords', current.rankingKeywords || 0, target.rankingKeywords || 0, growth.keywords],
        ['Monthly Organic Traffic', `${current.monthlyTraffic || 0} visits`, `${target.monthlyTraffic || 0}+ visits`, growth.traffic],
        ['Domain Authority', `${current.domainAuthority || 0}/100`, `${target.domainAuthority || 0}/100`, growth.domainAuthority],
        ['Top 3 Rankings', `${current.topRankings || 0} keywords`, `${target.topRankings || 0} keywords`, 'New'],
        ['Monthly Organic Value', `€${current.organicValue || 0}`, `€${target.organicValue || 0}+`, growth.organicValue],
        ['Technical SEO Score', `${current.technicalScore || 0}/100`, `${target.technicalScore || 0}/100`, growth.technicalScore]
    ];

    return metrics.map(([metric, curr, targ, grw]) => `
        <tr>
            <td>${metric}</td>
            <td>${curr}</td>
            <td>${targ}</td>
            <td><span class="badge badge-success">${grw}</span></td>
        </tr>
    `).join('');
}

/**
 * Get current performance section
 */
function getCurrentPerformanceSection(d) {
    return `
        <div class="section">
            <div class="section-header">
                <div class="section-number">2</div>
                <h2 class="section-title">Current Performance Analysis</h2>
            </div>

            <div class="card">
                <h3 class="card-title">📈 Organic Visibility Metrics</h3>
                <div class="grid-3" style="margin-top: 20px;">
                    <div style="text-align: center; padding: 16px;">
                        <div style="font-size: 36px; font-weight: 800; color: #667eea;">${d.currentMetrics.monthlyTraffic || 0}</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Monthly Visits</div>
                    </div>
                    <div style="text-align: center; padding: 16px;">
                        <div style="font-size: 36px; font-weight: 800; color: #667eea;">€${d.currentMetrics.organicValue || 0}</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Traffic Value</div>
                    </div>
                    <div style="text-align: center; padding: 16px;">
                        <div style="font-size: 36px; font-weight: 800; color: #667eea;">${d.currentMetrics.rankingKeywords || 0}</div>
                        <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Ranking Keywords</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get technical SEO section
 */
function getTechnicalSEOSection(d) {
    const techScore = d.technicalSEO?.overallScore || d.currentMetrics.technicalScore || 0;

    return `
        <div class="section">
            <div class="section-header">
                <div class="section-number">3</div>
                <h2 class="section-title">Technical SEO Assessment</h2>
            </div>

            <div class="card" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h3 style="font-size: 28px; font-weight: 800; margin-bottom: 8px;">Technical Health Score</h3>
                        <p style="color: #166534; font-weight: 600;">Status: ${getScoreStatus(techScore)}</p>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 64px; font-weight: 900; color: #16a34a;">${techScore}</div>
                        <div style="font-size: 18px; color: #166534;">/100</div>
                    </div>
                </div>
                <div class="progress-container">
                    <div class="progress-label">
                        <span>Technical Performance</span>
                        <span>${techScore}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${techScore}%;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get score status text
 */
function getScoreStatus(score) {
    if (score >= 95) return 'EXCELLENT - Industry Leading';
    if (score >= 90) return 'GOOD - Strong foundation';
    if (score >= 80) return 'FAIR - Needs improvement';
    return 'POOR - Critical issues';
}

/**
 * Get keyword strategy section
 */
function getKeywordStrategySection(d) {
    return `
        <div class="section">
            <div class="section-header">
                <div class="section-number">4</div>
                <h2 class="section-title">Keyword & Content Strategy</h2>
            </div>

            <div class="card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);">
                <h3 class="card-title">🎯 Keyword Portfolio Expansion</h3>
                <div style="text-align: center; margin: 24px 0;">
                    <div style="font-size: 72px; font-weight: 900; color: #92400e; margin-bottom: 8px;">
                        ${d.currentMetrics.rankingKeywords || 0} → ${d.targetMetrics.rankingKeywords || 0}
                    </div>
                    <div style="font-size: 20px; color: #78350f;">Keywords to Target for Growth</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get recommendations section
 */
function getRecommendationsSection(d) {
    return `
        <div class="section">
            <div class="section-header">
                <div class="section-number">5</div>
                <h2 class="section-title">Actionable Recommendations</h2>
            </div>

            <div class="card" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-left: 4px solid #dc2626;">
                <h3 class="card-title">🚀 30-Day Quick Wins (Immediate Priority)</h3>
                <p style="color: #64748b; margin-top: 12px;">
                    Priority recommendations based on current audit findings will be detailed in the complete implementation plan.
                </p>
            </div>
        </div>
    `;
}

/**
 * Get ROI section
 */
function getROISection(d) {
    const roi = d.roi || {};

    return `
        <div class="section">
            <div class="section-header">
                <div class="section-number">6</div>
                <h2 class="section-title">ROI Projections & Metrics</h2>
            </div>

            <div class="card">
                <h3 class="card-title">📈 Traffic Growth Timeline (12 Months)</h3>
                <div class="chart-container">
                    <canvas id="trafficChart"></canvas>
                </div>
            </div>

            <div class="card" style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);">
                <h3 class="card-title">💰 Investment Overview</h3>
                <div class="grid-2" style="margin-top: 20px;">
                    <div>
                        <h4 style="font-weight: 700; margin-bottom: 12px;">Year 1 Investment</h4>
                        <p style="font-size: 32px; font-weight: 800; color: #667eea;">€${roi.year1Investment || 'TBD'}</p>
                    </div>
                    <div>
                        <h4 style="font-weight: 700; margin-bottom: 12px;">24-Month ROI</h4>
                        <p style="font-size: 32px; font-weight: 800; color: #16a34a;">${roi.roi24Month || 'TBD'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get conclusion section
 */
function getConclusionSection(d) {
    return `
        <div class="section">
            <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 20px;">Conclusion</h2>
                <p style="font-size: 18px; line-height: 1.8; margin-bottom: 20px;">
                    This comprehensive SEO audit reveals ${d.clientName} stands at a critical inflection point.
                    The baseline provides a clear starting point—but the opportunity for growth is extraordinary.
                </p>
                <div style="text-align: center; margin-top: 32px;">
                    <div style="font-size: 48px; font-weight: 900; margin-bottom: 8px;">${d.roi?.roi24Month || 'High ROI Potential'}</div>
                    <div style="font-size: 20px; opacity: 0.95;">Strategic Growth Opportunity</div>
                </div>
                <div style="margin-top: 32px; padding: 20px; background: rgba(255,255,255,0.2); border-radius: 12px; text-align: center;">
                    <strong style="font-size: 18px;">✅ DOCUMENT STATUS: COMPLETE AND READY FOR IMPLEMENTATION</strong><br>
                    <span style="font-size: 14px; opacity: 0.9; margin-top: 8px; display: block;">
                        Next Action: Schedule implementation kickoff meeting • Start Date: Immediately
                    </span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Get footer section
 */
function getFooterSection(d) {
    return `
        <div style="margin-top: 60px; padding: 32px; background: #f7fafc; border-radius: 12px; text-align: center; border-top: 4px solid #667eea;">
            <div style="font-size: 14px; color: #64748b; line-height: 1.8;">
                <strong>Report Prepared By:</strong> ORCHESTRAI Advanced SEO Analysis System<br>
                <strong>Analysis Framework:</strong> Multi-agent coordination (Technical SEO, Keyword Research, Competitor Analysis, Content Strategy)<br>
                <strong>Data Sources:</strong> DataForSEO API, Google Search Console, Comprehensive Client Intelligence<br>
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
 * Get scripts section
 */
function getScriptsSection(d) {
    return `
    <script>
        window.addEventListener('DOMContentLoaded', function() {
            // Traffic Growth Chart
            const trafficCtx = document.getElementById('trafficChart').getContext('2d');
            new Chart(trafficCtx, {
                type: 'line',
                data: {
                    labels: ['Current', 'Month 3', 'Month 6', 'Month 9', 'Month 12'],
                    datasets: [{
                        label: 'Organic Sessions',
                        data: ${JSON.stringify(d.chartData?.trafficGrowth || [d.currentMetrics.monthlyTraffic, 0, 0, 0, d.targetMetrics.monthlyTraffic])},
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 6,
                        pointBackgroundColor: '#667eea',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#e2e8f0' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });

            // Animate progress bars
            setTimeout(() => {
                document.querySelectorAll('.progress-fill').forEach(bar => {
                    const width = bar.style.width;
                    bar.style.width = '0%';
                    setTimeout(() => { bar.style.width = width; }, 100);
                });
            }, 500);
        });
    </script>
    `;
}

/**
 * CLI Interface
 */
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node seo-audit-report-generator.js <data-file.json> [output-path.html]');
        console.log('');
        console.log('Example:');
        console.log('  node seo-audit-report-generator.js seo-audit-data.json report.html');
        process.exit(1);
    }

    const dataFile = args[0];
    const outputPath = args[1] || 'seo-audit-report.html';

    try {
        const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
        generateSEOAuditReport(data, outputPath)
            .then(() => {
                console.log('\n✨ Report generation complete!');
                console.log(`   Open: ${outputPath}`);
            })
            .catch(err => {
                console.error('❌ Error generating report:', err.message);
                process.exit(1);
            });
    } catch (err) {
        console.error('❌ Error reading data file:', err.message);
        process.exit(1);
    }
}

module.exports = { generateSEOAuditReport };
