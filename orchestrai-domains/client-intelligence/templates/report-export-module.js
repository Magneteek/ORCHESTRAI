/**
 * ORCHESTRAI Report Export Module
 *
 * Provides comprehensive export capabilities for HTML intelligence reports:
 * - PDF download (direct, not just print)
 * - Copy as Plain Text
 * - Copy as Markdown (Notion-compatible)
 * - Export as CSV (for Google Sheets)
 * - Export as JSON (structured data)
 * - Copy formatted for Google Sheets
 *
 * Usage: Include this script in HTML reports and call:
 * - exportToPDF() - Direct PDF download
 * - copyAsPlainText() - Copy to clipboard as plain text
 * - copyAsMarkdown() - Copy as Markdown (Notion-compatible)
 * - exportAsCSV() - Download CSV file
 * - exportAsJSON() - Download JSON file
 * - copyForGoogleSheets() - Copy formatted for Sheets
 */

class ReportExportManager {
  constructor() {
    this.reportTitle = document.title || 'Intelligence Report';
    this.reportData = null;
  }

  /**
   * Initialize export manager
   */
  init() {
    console.log('📊 Report Export Manager initialized');

    // Add export toolbar to page if not present
    this.injectExportToolbar();

    // Initialize event listeners
    this.setupEventListeners();
  }

  /**
   * Inject export toolbar into the page
   */
  injectExportToolbar() {
    // Check if toolbar already exists
    if (document.getElementById('export-toolbar')) {
      return;
    }

    const toolbar = document.createElement('div');
    toolbar.id = 'export-toolbar';
    toolbar.className = 'fixed bottom-6 right-6 z-50 no-print';
    toolbar.innerHTML = `
      <div class="bg-white rounded-lg shadow-2xl p-3 border border-gray-200">
        <div class="flex items-center space-x-2 mb-2">
          <span class="text-xs font-semibold text-gray-600 uppercase tracking-wide">Export</span>
          <button onclick="reportExport.toggleToolbar()" class="ml-auto text-gray-400 hover:text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <!-- PDF Export -->
          <button onclick="reportExport.exportToPDF()" class="flex items-center space-x-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
            </svg>
            <span>PDF</span>
          </button>

          <!-- Plain Text -->
          <button onclick="reportExport.copyAsPlainText()" class="flex items-center space-x-2 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>Text</span>
          </button>

          <!-- Markdown (Notion) -->
          <button onclick="reportExport.copyAsMarkdown()" class="flex items-center space-x-2 px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <span>Markdown</span>
          </button>

          <!-- CSV (Sheets) -->
          <button onclick="reportExport.exportAsCSV()" class="flex items-center space-x-2 px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span>CSV</span>
          </button>

          <!-- JSON -->
          <button onclick="reportExport.exportAsJSON()" class="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
            </svg>
            <span>JSON</span>
          </button>

          <!-- Google Sheets Format -->
          <button onclick="reportExport.copyForGoogleSheets()" class="flex items-center space-x-2 px-3 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition text-sm font-medium">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            <span>Sheets</span>
          </button>
        </div>

        <div id="export-status" class="mt-2 text-xs text-center text-gray-500 hidden"></div>
      </div>
    `;

    document.body.appendChild(toolbar);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + E = Export PDF
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        this.exportToPDF();
      }

      // Ctrl/Cmd + Shift + C = Copy as Plain Text
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'c') {
        e.preventDefault();
        this.copyAsPlainText();
      }
    });
  }

  /**
   * Toggle export toolbar visibility
   */
  toggleToolbar() {
    const toolbar = document.getElementById('export-toolbar');
    if (toolbar) {
      toolbar.style.display = toolbar.style.display === 'none' ? 'block' : 'none';
    }
  }

  /**
   * Show status message
   */
  showStatus(message, type = 'success') {
    const statusEl = document.getElementById('export-status');
    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = `mt-2 text-xs text-center ${type === 'success' ? 'text-green-600' : 'text-red-600'}`;
      statusEl.classList.remove('hidden');

      setTimeout(() => statusEl.classList.add('hidden'), 3000);
    }
  }

  /**
   * Export as PDF using html2pdf.js
   */
  async exportToPDF() {
    console.log('📄 Exporting to PDF...');

    try {
      // Check if html2pdf is loaded
      if (typeof html2pdf === 'undefined') {
        // Load html2pdf.js dynamically
        await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');
      }

      const element = document.body;
      const filename = `${this.reportTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.pdf`;

      const opt = {
        margin: 10,
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, dpi: 192, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();

      this.showStatus('✅ PDF downloaded successfully!');
      console.log('✅ PDF exported');

    } catch (error) {
      console.error('❌ PDF export failed:', error);
      this.showStatus('❌ PDF export failed', 'error');
      alert('PDF export failed. Using browser print instead...');
      window.print();
    }
  }

  /**
   * Copy report as plain text
   */
  async copyAsPlainText() {
    console.log('📋 Copying as plain text...');

    try {
      // Get all text content, excluding nav and no-print elements
      const content = this.extractPlainText();

      await navigator.clipboard.writeText(content);

      this.showStatus('✅ Copied as plain text!');
      console.log('✅ Copied to clipboard as plain text');

    } catch (error) {
      console.error('❌ Copy failed:', error);
      this.showStatus('❌ Copy failed', 'error');
    }
  }

  /**
   * Copy report as Markdown (Notion-compatible)
   */
  async copyAsMarkdown() {
    console.log('📝 Copying as Markdown...');

    try {
      const markdown = this.convertToMarkdown();

      await navigator.clipboard.writeText(markdown);

      this.showStatus('✅ Copied as Markdown (Notion-ready)!');
      console.log('✅ Copied to clipboard as Markdown');

    } catch (error) {
      console.error('❌ Copy failed:', error);
      this.showStatus('❌ Copy failed', 'error');
    }
  }

  /**
   * Export report data as CSV
   */
  exportAsCSV() {
    console.log('📊 Exporting as CSV...');

    try {
      const csv = this.convertToCSV();
      const filename = `${this.reportTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.csv`;

      this.downloadFile(csv, filename, 'text/csv');

      this.showStatus('✅ CSV downloaded!');
      console.log('✅ CSV exported');

    } catch (error) {
      console.error('❌ CSV export failed:', error);
      this.showStatus('❌ CSV export failed', 'error');
    }
  }

  /**
   * Export report data as JSON
   */
  exportAsJSON() {
    console.log('💾 Exporting as JSON...');

    try {
      // Extract structured data from report
      const jsonData = this.extractStructuredData();
      const json = JSON.stringify(jsonData, null, 2);
      const filename = `${this.reportTitle.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.json`;

      this.downloadFile(json, filename, 'application/json');

      this.showStatus('✅ JSON downloaded!');
      console.log('✅ JSON exported');

    } catch (error) {
      console.error('❌ JSON export failed:', error);
      this.showStatus('❌ JSON export failed', 'error');
    }
  }

  /**
   * Copy formatted for Google Sheets (TSV format)
   */
  async copyForGoogleSheets() {
    console.log('📊 Copying for Google Sheets...');

    try {
      const tsv = this.convertToTSV();

      await navigator.clipboard.writeText(tsv);

      this.showStatus('✅ Copied! Paste directly into Google Sheets');
      console.log('✅ Copied for Google Sheets');

    } catch (error) {
      console.error('❌ Copy failed:', error);
      this.showStatus('❌ Copy failed', 'error');
    }
  }

  /**
   * Extract plain text from report
   */
  extractPlainText() {
    // Clone document and remove non-content elements
    const clone = document.body.cloneNode(true);

    // Remove nav, toolbars, and no-print elements
    const toRemove = clone.querySelectorAll('.no-print, nav, #export-toolbar, script, style');
    toRemove.forEach(el => el.remove());

    // Get text content with line breaks preserved
    let text = '';

    // Add report title
    const title = clone.querySelector('h1');
    if (title) {
      text += title.textContent.trim() + '\n';
      text += '='.repeat(title.textContent.trim().length) + '\n\n';
    }

    // Process sections
    const sections = clone.querySelectorAll('section');
    sections.forEach(section => {
      const heading = section.querySelector('h2');
      if (heading) {
        text += '\n' + heading.textContent.trim() + '\n';
        text += '-'.repeat(heading.textContent.trim().length) + '\n\n';
      }

      // Get paragraphs and lists
      const content = section.querySelectorAll('p, li, td');
      content.forEach(el => {
        const line = el.textContent.trim();
        if (line) {
          text += line + '\n';
        }
      });

      text += '\n';
    });

    return text;
  }

  /**
   * Convert report to Markdown
   */
  convertToMarkdown() {
    let markdown = '';

    // Title
    const title = document.querySelector('h1');
    if (title) {
      markdown += `# ${title.textContent.trim()}\n\n`;
    }

    // Metadata
    const metaInfo = document.querySelector('header p');
    if (metaInfo) {
      markdown += `> ${metaInfo.textContent.trim()}\n\n`;
    }

    // Sections
    const sections = document.querySelectorAll('section:not(.no-print)');
    sections.forEach(section => {
      const heading = section.querySelector('h2');
      if (heading) {
        markdown += `## ${heading.textContent.trim()}\n\n`;
      }

      // Subsections
      const subheadings = section.querySelectorAll('h3');
      subheadings.forEach(h3 => {
        markdown += `### ${h3.textContent.trim()}\n\n`;
      });

      // Paragraphs
      const paragraphs = section.querySelectorAll('p:not(.no-print)');
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text) {
          markdown += `${text}\n\n`;
        }
      });

      // Lists
      const lists = section.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const items = list.querySelectorAll('li');
        items.forEach(item => {
          markdown += `- ${item.textContent.trim()}\n`;
        });
        markdown += '\n';
      });

      // Tables
      const tables = section.querySelectorAll('table');
      tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
          const cells = row.querySelectorAll('th, td');
          const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());
          markdown += `| ${cellTexts.join(' | ')} |\n`;

          if (index === 0) {
            // Add separator after header row
            markdown += `| ${cellTexts.map(() => '---').join(' | ')} |\n`;
          }
        });
        markdown += '\n';
      });
    });

    markdown += `\n---\n*Generated by ORCHESTRAI Intelligence System*\n`;

    return markdown;
  }

  /**
   * Convert tables to CSV
   */
  convertToCSV() {
    let csv = '';

    // Add report title
    csv += `"${this.reportTitle}"\n\n`;

    // Find all tables
    const tables = document.querySelectorAll('table');

    tables.forEach((table, tableIndex) => {
      // Add table heading if available
      const prevHeading = table.previousElementSibling;
      if (prevHeading && prevHeading.tagName.match(/H[23]/)) {
        csv += `"${prevHeading.textContent.trim()}"\n`;
      }

      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const cellTexts = Array.from(cells).map(cell => {
          const text = cell.textContent.trim().replace(/"/g, '""');
          return `"${text}"`;
        });
        csv += cellTexts.join(',') + '\n';
      });

      csv += '\n';
    });

    return csv;
  }

  /**
   * Convert to TSV (Tab-Separated Values) for Google Sheets
   */
  convertToTSV() {
    let tsv = '';

    // Add report title
    tsv += `${this.reportTitle}\t\n\n`;

    // Find all tables
    const tables = document.querySelectorAll('table');

    tables.forEach(table => {
      // Add table heading
      const prevHeading = table.previousElementSibling;
      if (prevHeading && prevHeading.tagName.match(/H[23]/)) {
        tsv += `${prevHeading.textContent.trim()}\t\n`;
      }

      const rows = table.querySelectorAll('tr');
      rows.forEach(row => {
        const cells = row.querySelectorAll('th, td');
        const cellTexts = Array.from(cells).map(cell => cell.textContent.trim());
        tsv += cellTexts.join('\t') + '\n';
      });

      tsv += '\n';
    });

    return tsv;
  }

  /**
   * Extract structured data for JSON export
   */
  extractStructuredData() {
    const data = {
      metadata: {
        title: this.reportTitle,
        generatedAt: new Date().toISOString(),
        exportedAt: new Date().toISOString()
      },
      sections: []
    };

    // Extract sections
    const sections = document.querySelectorAll('section:not(.no-print)');
    sections.forEach(section => {
      const sectionData = {
        heading: section.querySelector('h2')?.textContent.trim() || 'Untitled Section',
        content: []
      };

      // Extract paragraphs
      const paragraphs = section.querySelectorAll('p');
      paragraphs.forEach(p => {
        const text = p.textContent.trim();
        if (text) {
          sectionData.content.push({ type: 'paragraph', text });
        }
      });

      // Extract lists
      const lists = section.querySelectorAll('ul, ol');
      lists.forEach(list => {
        const items = Array.from(list.querySelectorAll('li')).map(li => li.textContent.trim());
        sectionData.content.push({ type: 'list', items });
      });

      // Extract tables
      const tables = section.querySelectorAll('table');
      tables.forEach(table => {
        const tableData = {
          type: 'table',
          headers: [],
          rows: []
        };

        const headerRow = table.querySelector('tr');
        if (headerRow) {
          tableData.headers = Array.from(headerRow.querySelectorAll('th, td'))
            .map(cell => cell.textContent.trim());
        }

        const dataRows = table.querySelectorAll('tr:not(:first-child)');
        dataRows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('td'))
            .map(cell => cell.textContent.trim());
          tableData.rows.push(cells);
        });

        sectionData.content.push(tableData);
      });

      data.sections.push(sectionData);
    });

    return data;
  }

  /**
   * Download file helper
   */
  downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Load external script dynamically
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
}

// Initialize export manager on page load
const reportExport = new ReportExportManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => reportExport.init());
} else {
  reportExport.init();
}

// Make available globally
window.reportExport = reportExport;
