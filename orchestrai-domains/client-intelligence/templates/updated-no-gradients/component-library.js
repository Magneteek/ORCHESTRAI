/**
 * COMPONENT LIBRARY - NO GRADIENTS
 *
 * Reusable functions for generating HTML components from JSON data
 * Used with intelligence report templates
 *
 * All components follow NO GRADIENTS design system:
 * - Solid colors only (#667eea, #764ba2, white, grays)
 * - Translucent overlays allowed (rgba)
 * - NO linear-gradient() or radial-gradient()
 */

const COLORS = {
  primaryPurple: '#667eea',
  secondaryPurple: '#764ba2',
  white: '#ffffff',
  bgSecondary: '#f7fafc',
  textPrimary: '#1a202c',
  textSecondary: '#4a5568',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};

/**
 * Generate metric card (solid purple background)
 */
function generateMetricCard(value, label, colorType = 'primary') {
  const bgColor = colorType === 'primary' ? COLORS.primaryPurple : COLORS.secondaryPurple;

  return `
    <div class="metric-card" style="background-color: ${bgColor}">
      <div class="metric-value">${value}</div>
      <div class="metric-label">${label}</div>
    </div>
  `;
}

/**
 * Generate metric card grid from multiple metrics
 */
function generateMetricGrid(metrics) {
  const cards = metrics.map((metric, index) => {
    const colorType = index % 2 === 0 ? 'primary' : 'secondary';
    return generateMetricCard(metric.value, metric.label, colorType);
  }).join('\n');

  return `
    <div class="metric-grid">
      ${cards}
    </div>
  `;
}

/**
 * Generate ICP summary card
 */
function generateICPCard(persona, index) {
  const slug = slugify(persona.name);
  const iconLetter = persona.name.charAt(0);

  return `
    <a href="icp-${slug}-2025.html" class="icp-card" style="text-decoration: none; display: block;">
      <div class="icp-icon">${iconLetter}</div>
      <h3 class="icp-title">${persona.name}</h3>
      <div class="icp-meta">
        <span class="icp-revenue-weight">${persona.revenueWeight || persona.segment} Revenue</span>
      </div>
      <p style="color: var(--text-secondary); margin-top: 1rem;">${truncate(persona.description, 120)}</p>
      <div class="icp-stats" style="margin-top: 1rem;">
        <div class="icp-stats-grid">
          <div class="icp-stat"><strong>Age:</strong> ${persona.demographics?.ageRange || 'N/A'}</div>
          <div class="icp-stat"><strong>Income:</strong> ${persona.demographics?.householdIncome || 'N/A'}</div>
        </div>
      </div>
      <div style="margin-top: 1rem; text-align: center;">
        <span class="badge badge-purple">View Deep Dive →</span>
      </div>
    </a>
  `;
}

/**
 * Generate ICP card grid
 */
function generateICPGrid(personas) {
  const cards = personas.map((persona, index) =>
    generateICPCard(persona, index)
  ).join('\n');

  return `
    <div class="icp-grid">
      ${cards}
    </div>
  `;
}

/**
 * Generate table from array of objects
 */
function generateTable(headers, rows) {
  const headerRow = headers.map(h => `<th>${h}</th>`).join('');
  const bodyRows = rows.map(row => {
    const cells = Object.values(row).map(cell => `<td>${cell}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('\n');

  return `
    <div class="table-container">
      <table>
        <thead>
          <tr>${headerRow}</tr>
        </thead>
        <tbody>
          ${bodyRows}
        </tbody>
      </table>
    </div>
  `;
}

/**
 * Generate acquisition channel table
 */
function generateAcquisitionTable(channels) {
  if (!channels || channels.length === 0) return '<p>No acquisition data available</p>';

  const headers = ['Channel', 'CAC', 'LTV', 'ROI', 'Priority'];
  const rows = channels.map(ch => ({
    channel: ch.name || ch.channel,
    cac: ch.cac || 'N/A',
    ltv: ch.ltv || 'N/A',
    roi: ch.roi || 'N/A',
    priority: `<span class="badge badge-${getPriorityBadge(ch.priority)}">${ch.priority || 'Medium'}</span>`
  }));

  return generateTable(headers, rows);
}

/**
 * Generate demographics grid
 */
function generateDemographicsGrid(demographics) {
  if (!demographics) return '<p>No demographic data available</p>';

  return `
    <div class="feature-grid">
      <div class="feature-card">
        <div class="feature-card-title">Age Range</div>
        <div class="feature-card-content">${demographics.ageRange || 'N/A'}</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-title">Gender Split</div>
        <div class="feature-card-content">${demographics.genderSplit || 'N/A'}</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-title">Income</div>
        <div class="feature-card-content">${demographics.householdIncome || demographics.income || 'N/A'}</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-title">Location</div>
        <div class="feature-card-content">${demographics.locations || demographics.location || 'N/A'}</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-title">Occupation</div>
        <div class="feature-card-content">${demographics.occupations || demographics.occupation || 'N/A'}</div>
      </div>
      <div class="feature-card">
        <div class="feature-card-title">Education</div>
        <div class="feature-card-content">${demographics.education || 'N/A'}</div>
      </div>
    </div>
  `;
}

/**
 * Generate pain points list
 */
function generatePainPointsList(painPoints) {
  if (!painPoints || painPoints.length === 0) return '<p>No pain points data available</p>';

  const items = painPoints.map(point => `
    <div class="feature-card">
      <div class="feature-card-title" style="color: ${COLORS.danger};">⚠️ ${point.title || point}</div>
      <div class="feature-card-content">${point.description || point}</div>
    </div>
  `).join('\n');

  return `<div class="feature-grid">${items}</div>`;
}

/**
 * Generate case study card
 */
function generateCaseStudy(study, index) {
  return `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Case Study ${index + 1}: ${study.title || study.name}</h3>
      </div>
      <div style="margin-bottom: 1rem;">
        <strong style="color: ${COLORS.primaryPurple};">Customer:</strong> ${study.customer || 'Anonymous'}
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>Challenge:</strong> ${study.challenge || study.problem}
      </div>
      <div style="margin-bottom: 1rem;">
        <strong>Solution:</strong> ${study.solution}
      </div>
      <div class="info-box">
        <div class="info-box-title">Results</div>
        <div class="info-box-content">${study.results || study.outcome}</div>
      </div>
    </div>
  `;
}

/**
 * Generate sub-segments section
 */
function generateSubSegments(subSegments) {
  if (!subSegments || Object.keys(subSegments).length === 0) {
    return '<p>No sub-segment data available</p>';
  }

  const segments = Object.entries(subSegments).map(([key, segment]) => `
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">${segment.name || toTitleCase(key)}</h3>
        <span class="badge badge-purple">${segment.percentage || segment.weight || 'N/A'}</span>
      </div>
      <p style="margin-bottom: 1rem;">${segment.description}</p>

      ${segment.demographics ? `
        <div style="background: ${COLORS.bgSecondary}; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem;">
          <strong>Demographics:</strong><br>
          Age: ${segment.demographics.ageRange || 'N/A'}<br>
          Income: ${segment.demographics.income || 'N/A'}<br>
          Training: ${segment.demographics.trainingFrequency || 'N/A'}
        </div>
      ` : ''}

      ${segment.specificPainPoints ? `
        <div style="margin-bottom: 1rem;">
          <strong>Pain Points:</strong>
          <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
            ${segment.specificPainPoints.map(point => `<li>${point}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${segment.acquisitionTactics ? `
        <div>
          <strong>Acquisition Tactics:</strong>
          <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
            ${segment.acquisitionTactics.map(tactic => `<li>${tactic}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `).join('\n');

  return segments;
}

/**
 * Generate navigation breadcrumb
 */
function generateBreadcrumb(clientName, currentPage) {
  return `
    <div style="background: ${COLORS.bgSecondary}; padding: 1rem; border-radius: 0.5rem; margin-bottom: 2rem;">
      <a href="intelligence-hub-2025.html" style="color: ${COLORS.primaryPurple}; text-decoration: none; font-weight: 600;">
        ← Back to ${clientName} Intelligence Hub
      </a>
      ${currentPage ? ` <span style="color: ${COLORS.textSecondary};">/ ${currentPage}</span>` : ''}
    </div>
  `;
}

/**
 * Generate available reports section
 */
function generateReportsSection(reports) {
  const reportCards = reports.map(report => `
    <a href="${report.filename}" class="footer-link" style="display: block; text-decoration: none;">
      <div class="footer-link-title">${report.icon || '📊'} ${report.title}</div>
      <div class="footer-link-desc">${report.description}</div>
    </a>
  `).join('\n');

  return `
    <div class="footer-grid">
      ${reportCards}
    </div>
  `;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function truncate(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

function toTitleCase(str) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

function getPriorityBadge(priority) {
  const p = (priority || '').toLowerCase();
  if (p.includes('high')) return 'success';
  if (p.includes('low')) return 'warning';
  return 'info';
}

function formatCurrency(value) {
  if (!value) return 'N/A';
  if (typeof value === 'string' && value.includes('$')) return value;
  return `$${value.toLocaleString()}`;
}

// ========================================
// EXPORTS
// ========================================

module.exports = {
  // Component generators
  generateMetricCard,
  generateMetricGrid,
  generateICPCard,
  generateICPGrid,
  generateTable,
  generateAcquisitionTable,
  generateDemographicsGrid,
  generatePainPointsList,
  generateCaseStudy,
  generateSubSegments,
  generateBreadcrumb,
  generateReportsSection,

  // Utility functions
  slugify,
  truncate,
  toTitleCase,
  getPriorityBadge,
  formatCurrency,

  // Constants
  COLORS
};
