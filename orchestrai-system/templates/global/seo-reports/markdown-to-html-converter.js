/**
 * SEO Audit Markdown to HTML Converter
 *
 * Converts comprehensive markdown SEO audit reports to beautiful HTML
 * using the premium REDESIGN template style.
 *
 * @module markdown-to-html-converter
 */

const fs = require('fs');
const path = require('path');

/**
 * Convert markdown SEO audit report to HTML
 */
async function convertMarkdownToHTML(markdownPath, outputPath, options = {}) {
    console.log('🎨 Converting Markdown to HTML Report...');
    console.log(`   Input: ${markdownPath}`);
    console.log(`   Output: ${outputPath}`);

    // Read markdown file
    const markdown = fs.readFileSync(markdownPath, 'utf8');

    // Extract metadata from markdown
    const metadata = extractMetadata(markdown);

    // Parse markdown sections
    const sections = parseMarkdownSections(markdown);

    // Generate HTML
    const html = buildHTML(metadata, sections, options);

    // Write output file
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, html, 'utf8');

    console.log('✅ Conversion complete!');
    console.log(`   File: ${outputPath}`);
    console.log(`   Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);

    return outputPath;
}

/**
 * Extract metadata from markdown front matter
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

    // Look for metadata in first 20 lines
    for (let i = 0; i < Math.min(20, lines.length); i++) {
        const line = lines[i];

        if (line.includes('**Client:**')) {
            metadata.clientName = line.replace(/\*\*Client:\*\*\s*/, '').replace(/\(.*?\)/, '').trim();
        }
        if (line.includes('**Industry:**')) {
            metadata.industry = line.replace(/\*\*Industry:\*\*\s*/, '').trim();
        }
        if (line.includes('**Project ID:**')) {
            metadata.projectId = line.replace(/\*\*Project ID:\*\*\s*/, '').trim();
        }
        if (line.includes('**Audit Date:**')) {
            metadata.auditDate = line.replace(/\*\*Audit Date:\*\*\s*/, '').trim();
        }
        if (line.includes('**Markets:**')) {
            const marketsStr = line.replace(/\*\*Markets:\*\*\s*/, '').trim();
            metadata.markets = marketsStr.split(',').map(m => m.trim());
        }
        if (line.includes('**Website:**')) {
            metadata.website = line.replace(/\*\*Website:\*\*\s*/, '').trim();
        }
    }

    return metadata;
}

/**
 * Parse markdown into sections
 */
function parseMarkdownSections(markdown) {
    const sections = [];
    const lines = markdown.split('\n');
    let currentSection = null;
    let currentContent = [];
    let inFrontMatter = false;
    let frontMatterEnd = 0;

    // Find end of front matter (first --- section)
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim() === '---') {
            if (frontMatterEnd > 0) {
                frontMatterEnd = i;
                break;
            }
            frontMatterEnd = i;
        }
    }

    // Start parsing after front matter
    for (let i = frontMatterEnd + 1; i < lines.length; i++) {
        const line = lines[i];

        // Main section headers (##) - with or without numbers
        if (line.match(/^##\s+/)) {
            // Save previous section
            if (currentSection) {
                currentSection.content = currentContent.join('\n');
                sections.push(currentSection);
            }

            // Start new section
            const title = line.replace(/^##\s+(\d+\.\s+)?/, '').trim();
            currentSection = {
                title,
                number: sections.length + 1,
                content: '',
                subsections: []
            };
            currentContent = [];
        } else {
            currentContent.push(line);
        }
    }

    // Save last section
    if (currentSection) {
        currentSection.content = currentContent.join('\n');
        sections.push(currentSection);
    }

    return sections;
}

/**
 * Build complete HTML from sections
 */
function buildHTML(metadata, sections, options) {
    const css = getStylesSection();

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata.clientName} - SEO Audit Report ${new Date().getFullYear()}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    ${css}
</head>
<body>
    <div class="container">
        ${getHeroSection(metadata)}

        <div class="content">
            ${sections.map((section, idx) => getSectionHTML(section, idx + 1)).join('\n')}
            ${getFooterSection(metadata)}
        </div>
    </div>

    <script>
        // Convert markdown content to HTML using marked.js
        document.addEventListener('DOMContentLoaded', function() {
            // Configure marked
            marked.setOptions({
                breaks: true,
                gfm: true
            });

            // Convert all markdown content blocks
            document.querySelectorAll('.markdown-content').forEach(element => {
                element.innerHTML = marked.parse(element.textContent);
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
</body>
</html>`;
}

/**
 * Get styles section
 */
function getStylesSection() {
    const css = fs.readFileSync(
        path.join(__dirname, 'seo-audit-report-template-styles.css'),
        'utf8'
    );
    return `<style>\n${css}\n    </style>`;
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
 * Get section HTML
 */
function getSectionHTML(section, number) {
    return `
        <div class="section">
            <div class="section-header">
                <div class="section-number">${number}</div>
                <h2 class="section-title">${section.title}</h2>
            </div>

            <div class="markdown-content">${section.content}</div>
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
        console.log('Usage: node markdown-to-html-converter.js <markdown-file.md> [output-file.html]');
        console.log('');
        console.log('Example:');
        console.log('  node markdown-to-html-converter.js SEO-AUDIT-REPORT.md report.html');
        process.exit(1);
    }

    const markdownPath = args[0];
    const outputPath = args[1] || markdownPath.replace('.md', '.html');

    convertMarkdownToHTML(markdownPath, outputPath)
        .then(() => {
            console.log('\n✨ Conversion complete!');
            console.log(`   Open: ${outputPath}`);
        })
        .catch(err => {
            console.error('❌ Error converting report:', err.message);
            process.exit(1);
        });
}

module.exports = { convertMarkdownToHTML };
