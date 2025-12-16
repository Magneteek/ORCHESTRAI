/**
 * Enhanced SEO Audit Markdown to HTML Converter
 *
 * Sophisticated parser that maps markdown patterns to REDESIGN template components
 * (cards, opportunity boxes, styled tables, badges, progress bars, etc.)
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert markdown to HTML with REDESIGN template components
 */
async function convertMarkdownToHTML(markdownPath, outputPath) {
    console.log('🎨 Converting Markdown to Enhanced HTML Report...');
    console.log(`   Input: ${markdownPath}`);
    console.log(`   Output: ${outputPath}`);

    const markdown = fs.readFileSync(markdownPath, 'utf8');
    const metadata = extractMetadata(markdown);
    const sections = parseEnhancedSections(markdown);
    const html = buildEnhancedHTML(metadata, sections);

    fs.writeFileSync(outputPath, html, 'utf8');

    console.log('✅ Enhanced conversion complete!');
    console.log(`   File: ${outputPath}`);
    console.log(`   Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

    return outputPath;
}

/**
 * Extract metadata
 */
function extractMetadata(markdown) {
    const lines = markdown.split('\n');
    const metadata = {
        clientName: '',
        website: '',
        industry: '',
        projectId: '',
        auditDate: new Date().toISOString().split('T')[0],
        markets: []
    };

    for (let i = 0; i < Math.min(20, lines.length); i++) {
        const line = lines[i];
        if (line.includes('**Client:**')) metadata.clientName = line.replace(/\*\*Client:\*\*\s*/, '').trim();
        if (line.includes('**Industry:**')) metadata.industry = line.replace(/\*\*Industry:\*\*\s*/, '').trim();
        if (line.includes('**Project ID:**')) metadata.projectId = line.replace(/\*\*Project ID:\*\*\s*/, '').trim();
        if (line.includes('**Report Date:**') || line.includes('**Audit Date:**')) {
            metadata.auditDate = line.replace(/\*\*(Report Date|Audit Date):\*\*\s*/, '').trim();
        }
        if (line.includes('**Target Markets:**') || line.includes('**Markets:**')) {
            const marketsStr = line.replace(/\*\*(Target Markets|Markets):\*\*\s*/, '').trim();
            metadata.markets = marketsStr.split(',').map(m => m.trim());
        }
        if (line.includes('**Website:**')) metadata.website = line.replace(/\*\*Website:\*\*\s*/, '').trim();
    }

    return metadata;
}

/**
 * Parse markdown into enhanced sections with component mapping
 */
function parseEnhancedSections(markdown) {
    const lines = markdown.split('\n');
    const sections = [];
    let currentSection = null;
    let currentContent = [];
    let skipUntilAfterDivider = true;

    for (const line of lines) {
        // Skip until after first ---
        if (skipUntilAfterDivider) {
            if (line.trim() === '---') {
                skipUntilAfterDivider = false;
            }
            continue;
        }

        // Main section headers (##)
        if (line.match(/^##\s+/)) {
            // Save previous section
            if (currentSection) {
                currentSection.content = currentContent.join('\n');
                currentSection.html = convertSectionContent(currentSection.title, currentContent);
                sections.push(currentSection);
            }

            // Start new section
            const title = line.replace(/^##\s+/, '').trim();
            currentSection = {
                title,
                number: sections.length + 1,
                content: '',
                html: ''
            };
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    }

    // Save last section
    if (currentSection) {
        currentSection.content = currentContent.join('\n');
        currentSection.html = convertSectionContent(currentSection.title, currentContent);
        sections.push(currentSection);
    }

    return sections;
}

/**
 * Convert section content to HTML with REDESIGN components
 */
function convertSectionContent(sectionTitle, lines) {
    let html = '';
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Skip empty lines
        if (!line.trim()) {
            i++;
            continue;
        }

        // Detect tables
        if (line.includes('|') && lines[i + 1] && lines[i + 1].includes('|')) {
            const tableData = extractTable(lines, i);
            html += convertTableToHTML(tableData.rows, tableData.headers);
            i = tableData.endIndex;
            continue;
        }

        // Detect "Opportunity" sections
        if (line.match(/^####?\s+Opportunity\s+\d+:/i) || line.includes('**Impact**:')) {
            const opportunityData = extractOpportunity(lines, i);
            html += convertOpportunityToHTML(opportunityData);
            i = opportunityData.endIndex;
            continue;
        }

        // Detect "DISCOVERY" or "CRITICAL FINDING" sections
        if (line.match(/^\*\*DISCOVERY\s+\d+:/i) || line.match(/^\*\*CRITICAL\s+/i)) {
            const findingData = extractFinding(lines, i);
            html += convertFindingToHTML(findingData);
            i = findingData.endIndex;
            continue;
        }

        // Detect lists with priorities
        if (line.match(/^(1|2|3|4|5)\.\s+\*\*/)) {
            const listData = extractPriorityList(lines, i);
            html += convertPriorityListToHTML(listData);
            i = listData.endIndex;
            continue;
        }

        // Regular H3 headers
        if (line.match(/^###\s+/)) {
            const title = line.replace(/^###\s+/, '');
            html += `<h3 style="font-size: 24px; font-weight: 700; margin: 32px 0 20px;">${escapeHtml(title)}</h3>\n`;
            i++;
            continue;
        }

        // Regular H4 headers
        if (line.match(/^####\s+/)) {
            const title = line.replace(/^####\s+/, '');
            html += `<h4 style="font-size: 18px; font-weight: 700; margin: 24px 0 12px;">${escapeHtml(title)}</h4>\n`;
            i++;
            continue;
        }

        // Regular paragraphs and lists
        const paragraphData = extractParagraph(lines, i);
        html += convertParagraphToHTML(paragraphData.content);
        i = paragraphData.endIndex;

        // Safety check: ensure we always advance to prevent infinite loops
        if (i === paragraphData.endIndex && paragraphData.content.length === 0) {
            i++; // Force advance if no content was extracted
        }
    }

    return html;
}

/**
 * Extract table from lines
 */
function extractTable(lines, startIndex) {
    const headers = [];
    const rows = [];
    let i = startIndex;

    // Parse header row
    const headerLine = lines[i].split('|').map(h => h.trim()).filter(h => h);
    headers.push(...headerLine);
    i += 2; // Skip header and separator line

    // Parse data rows
    while (i < lines.length && lines[i].includes('|')) {
        const rowData = lines[i].split('|').map(c => c.trim()).filter(c => c);
        if (rowData.length > 0) {
            rows.push(rowData);
        }
        i++;
    }

    return { headers, rows, endIndex: i };
}

/**
 * Convert table to styled HTML
 */
function convertTableToHTML(rows, headers) {
    let html = '<div class="card"><div class="table-container"><table><thead><tr>';

    // Headers
    headers.forEach(h => {
        html += `<th>${convertInlineMarkdown(h)}</th>`;
    });
    html += '</tr></thead><tbody>';

    // Rows
    rows.forEach(row => {
        html += '<tr>';
        row.forEach((cell, idx) => {
            html += `<td>${convertInlineMarkdown(cell)}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table></div></div>\n';
    return html;
}

/**
 * Extract opportunity section
 */
function extractOpportunity(lines, startIndex) {
    const opportunity = {
        title: '',
        impact: '',
        effort: '',
        timeline: '',
        bullets: [],
        endIndex: startIndex + 1
    };

    let i = startIndex;
    const titleLine = lines[i];

    // Extract title
    opportunity.title = titleLine.replace(/^####?\s+/, '').replace(/\*\*/g, '').trim();
    i++;

    // Extract impact/effort/timeline if on next line
    if (lines[i] && lines[i].includes('**Impact**:')) {
        const metaLine = lines[i];
        opportunity.impact = metaLine.match(/\*\*Impact\*\*:\s*(\w+)/)?.[1] || '';
        opportunity.effort = metaLine.match(/\*\*Effort\*\*:\s*(\w+)/)?.[1] || '';
        opportunity.timeline = metaLine.match(/\*\*Timeline\*\*:\s*([^|]+)/)?.[1]?.trim() || '';
        i++;
    }

    // Skip empty line
    if (!lines[i]?.trim()) i++;

    // Extract bullet points
    while (i < lines.length && (lines[i].trim().startsWith('-') || lines[i].trim().startsWith('**'))) {
        opportunity.bullets.push(lines[i].trim());
        i++;
    }

    opportunity.endIndex = i;
    return opportunity;
}

/**
 * Convert opportunity to HTML component
 */
function convertOpportunityToHTML(opp) {
    const badgeClass = opp.impact === 'Critical' || opp.impact === 'High' ? 'badge-critical' : 'badge-high';

    let html = '<div class="opportunity-card">';
    html += '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">';
    html += `<div class="opportunity-title">${escapeHtml(opp.title)}</div>`;
    if (opp.impact) {
        html += `<span class="badge ${badgeClass}">${opp.impact}</span>`;
    }
    html += '</div>';

    // Add bullets
    if (opp.bullets.length > 0) {
        html += '<div style="color: #4a5568; margin-top: 12px;">';
        opp.bullets.forEach(bullet => {
            html += `<p style="margin-bottom: 8px;">${convertInlineMarkdown(bullet.replace(/^-\s*/, ''))}</p>`;
        });
        html += '</div>';
    }

    html += '</div>\n';
    return html;
}

/**
 * Extract finding/discovery section
 */
function extractFinding(lines, startIndex) {
    const finding = {
        title: '',
        content: [],
        endIndex: startIndex + 1
    };

    let i = startIndex;
    finding.title = lines[i].replace(/\*\*/g, '').trim();
    i++;

    // Collect content until next discovery or empty line sequence
    while (i < lines.length) {
        if (lines[i].match(/^\*\*(DISCOVERY|CRITICAL)/i) ||
            (lines[i].trim() === '' && lines[i+1]?.trim() === '')) {
            break;
        }
        if (lines[i].trim()) {
            finding.content.push(lines[i]);
        }
        i++;
    }

    finding.endIndex = i;
    return finding;
}

/**
 * Convert finding to alert box HTML
 */
function convertFindingToHTML(finding) {
    const alertClass = finding.title.includes('CRITICAL') ? 'alert-warning' : 'alert-info';

    let html = `<div class="alert ${alertClass}">`;
    html += '<div>';
    html += `<strong>${escapeHtml(finding.title)}</strong><br>`;
    finding.content.forEach(line => {
        html += convertInlineMarkdown(line) + '<br>';
    });
    html += '</div></div>\n';
    return html;
}

/**
 * Extract priority list
 */
function extractPriorityList(lines, startIndex) {
    const items = [];
    let i = startIndex;

    while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(lines[i]);
        i++;
    }

    return { items, endIndex: i };
}

/**
 * Convert priority list to styled HTML
 */
function convertPriorityListToHTML(listData) {
    let html = '<div class="grid-2">';

    listData.items.forEach((item, idx) => {
        const isCritical = idx < 3; // First 3 items are critical
        const bgColor = isCritical ? '#fef2f2' : '#f0fdf4';
        const borderColor = isCritical ? '#fca5a5' : '#86efac';

        html += `<div class="card" style="background: ${bgColor}; border-color: ${borderColor};">`;
        html += convertInlineMarkdown(item);
        html += '</div>';
    });

    html += '</div>\n';
    return html;
}

/**
 * Extract paragraph
 */
function extractParagraph(lines, startIndex) {
    const content = [];
    let i = startIndex;

    while (i < lines.length && lines[i].trim() &&
           !lines[i].match(/^#{2,4}\s+/) &&
           !lines[i].includes('|') &&
           !lines[i].match(/^\*\*(DISCOVERY|CRITICAL|Opportunity)/i)) {
        content.push(lines[i]);
        i++;
    }

    return { content, endIndex: i };
}

/**
 * Convert paragraph to HTML
 */
function convertParagraphToHTML(lines) {
    if (lines.length === 0) return '';

    let html = '<div class="card"><div class="card-content">';
    lines.forEach(line => {
        html += `<p style="margin-bottom: 12px;">${convertInlineMarkdown(line)}</p>`;
    });
    html += '</div></div>\n';
    return html;
}

/**
 * Convert inline markdown (bold, italic, links)
 */
function convertInlineMarkdown(text) {
    return text
        .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color: #667eea;">$1</a>')
        .replace(/`(.+?)`/g, '<code style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: monospace;">$1</code>');
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Build complete HTML
 */
function buildEnhancedHTML(metadata, sections) {
    const css = fs.readFileSync(
        path.join(__dirname, 'seo-audit-report-template-styles.css'),
        'utf8'
    );

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.clientName} - SEO Audit Report ${new Date().getFullYear()}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    <style>
${css}
    </style>
</head>
<body>
    <div class="container">
        ${getHeroSection(metadata)}

        <div class="content">
            ${sections.map((section, idx) => `
            <div class="section">
                <div class="section-header">
                    <div class="section-number">${idx + 1}</div>
                    <h2 class="section-title">${section.title}</h2>
                </div>
                ${section.html}
            </div>
            `).join('\n')}

            ${getFooterSection(metadata)}
        </div>
    </div>

    <script>
        // Animate progress bars
        setTimeout(() => {
            document.querySelectorAll('.progress-fill').forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => { bar.style.width = width; }, 100);
            });
        }, 500);
    </script>
</body>
</html>`;
}

/**
 * Get hero section
 */
function getHeroSection(metadata) {
    return `
        <div class="hero">
            <h1>${metadata.clientName}</h1>
            <div class="subtitle">Comprehensive SEO Audit & Implementation Roadmap</div>
            <div class="meta">
                ${metadata.projectId ? `<span>Project ID: ${metadata.projectId}</span> •` : ''}
                <span>Audit Date: ${formatDate(metadata.auditDate)}</span> •
                <span>Industry: ${metadata.industry || 'E-commerce'}</span>
                ${metadata.markets.length > 0 ? `• <span>Markets: ${metadata.markets.join(', ')}</span>` : ''}
            </div>
        </div>
    `;
}

/**
 * Get footer section
 */
function getFooterSection(metadata) {
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
 * Format date
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * CLI Interface
 */
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.log('Usage: node enhanced-markdown-to-html-converter.js <markdown-file.md> [output-file.html]');
        process.exit(1);
    }

    const markdownPath = args[0];
    const outputPath = args[1] || markdownPath.replace('.md', '.html');

    convertMarkdownToHTML(markdownPath, outputPath)
        .then(() => {
            console.log('\n✨ Enhanced conversion complete!');
            console.log(`   Open: ${outputPath}`);
        })
        .catch(err => {
            console.error('❌ Error:', err.message);
            process.exit(1);
        });
}

module.exports = { convertMarkdownToHTML };
