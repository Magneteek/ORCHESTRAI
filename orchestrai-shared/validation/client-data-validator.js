/**
 * Client Data Validation Utility
 *
 * Validates client intelligence data before report generation.
 * Ensures all required fields are present and properly structured.
 *
 * Usage:
 *   const validator = require('./client-data-validator');
 *   const result = validator.validateClientData(clientData, seoData);
 *   if (!result.valid) {
 *     console.error(result.errors);
 *     throw new Error('Validation failed');
 *   }
 */

class ClientDataValidator {
  /**
   * Validate complete client data for report generation
   * @param {Object} clientData - Integrated client context data
   * @param {Object} seoData - SEO keyword research data (optional)
   * @returns {Object} - { valid: boolean, errors: [], warnings: [], info: {} }
   */
  static validateClientData(clientData, seoData = null) {
    const errors = [];
    const warnings = [];
    const info = {};

    // CRITICAL: Client name
    if (!clientData.clientName) {
      errors.push('❌ CRITICAL: Missing client name (clientData.clientName)');
    } else {
      info.clientName = clientData.clientName;
    }

    // CRITICAL: ICP Personas
    if (!clientData.personas || !Array.isArray(clientData.personas)) {
      errors.push('❌ CRITICAL: Missing personas array (clientData.personas)');
    } else {
      const personaCount = clientData.personas.length;

      if (personaCount === 0) {
        errors.push('❌ CRITICAL: No ICP personas found. Need at least 1 persona.');
      } else if (personaCount > 10) {
        warnings.push(`⚠️  WARNING: ${personaCount} personas found. Report may be very long. Consider consolidating.`);
      }

      // Validate persona structure
      const invalidPersonas = clientData.personas.filter(p => !p.name || !p.segment);
      if (invalidPersonas.length > 0) {
        errors.push(`❌ CRITICAL: ${invalidPersonas.length} persona(s) missing 'name' or 'segment' field`);
      }

      info.personaCount = personaCount;
      info.personas = clientData.personas.map(p => ({
        name: p.name,
        segment: p.segment,
        hasEconomics: !!(p.economics || p.unitEconomics)
      }));
    }

    // Business Overview (important but not critical)
    const hasBusinessOverview = !!(
      clientData.business?.overview ||
      clientData.businessContext ||
      clientData.overview
    );

    if (!hasBusinessOverview) {
      warnings.push('⚠️  WARNING: No business overview found. Report will lack context.');
    }

    // SEO Data validation (if provided)
    if (seoData) {
      if (!seoData.keywords || !Array.isArray(seoData.keywords)) {
        warnings.push('⚠️  WARNING: No SEO keywords found (seoData.keywords)');
      } else {
        info.keywordCount = seoData.keywords.length;
      }
    }

    // Brand Data (optional but recommended)
    if (!clientData.brand && !clientData.branding) {
      warnings.push('⚠️  WARNING: No brand data found. Report will lack brand intelligence.');
    }

    // Summary
    const valid = errors.length === 0;

    return {
      valid,
      errors,
      warnings,
      info,
      summary: this.generateSummary(valid, errors, warnings, info)
    };
  }

  /**
   * Generate human-readable validation summary
   */
  static generateSummary(valid, errors, warnings, info) {
    if (!valid) {
      return {
        status: 'FAILED',
        message: `Validation failed with ${errors.length} critical error(s). Cannot proceed with report generation.`,
        errors,
        warnings
      };
    }

    const personaCount = info.personaCount || 0;
    const totalPages = 5 + personaCount; // 5 fixed pages + N ICP pages

    return {
      status: 'PASSED',
      message: `✅ Validation passed. Ready to generate ${totalPages}-page report suite.`,
      details: {
        clientName: info.clientName,
        personaCount: personaCount,
        totalPages: totalPages,
        icpPages: personaCount,
        fixedPages: 5,
        personas: info.personas || [],
        hasKeywords: !!(info.keywordCount && info.keywordCount > 0),
        keywordCount: info.keywordCount || 0
      },
      warnings: warnings.length > 0 ? warnings : null
    };
  }

  /**
   * Sanitize persona name for filename
   * @param {string} name - Persona name
   * @returns {string} - Sanitized filename
   */
  static sanitizePersonaName(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50); // Max 50 chars
  }

  /**
   * Generate expected filenames for all report pages
   * @param {Object} clientData - Client data with personas
   * @returns {Object} - { icpPages: [], fixedPages: [] }
   */
  static generateExpectedFilenames(clientData) {
    if (!clientData.personas || !Array.isArray(clientData.personas)) {
      return { icpPages: [], fixedPages: [] };
    }

    const icpPages = clientData.personas.map(persona => ({
      name: persona.name,
      segment: persona.segment,
      filename: `icp-${this.sanitizePersonaName(persona.name)}-2025.html`
    }));

    const fixedPages = [
      { type: 'hub', filename: 'intelligence-report-2025.html' },
      { type: 'psychographic', filename: 'psychographic-research-extensive-2025.html' },
      { type: 'eos', filename: 'eos-framework-2025.html' },
      { type: 'competitive', filename: 'competitive-intelligence-2025.html' },
      { type: 'seo', filename: 'seo-strategy-comprehensive-2025.html' }
    ];

    return {
      icpPages,
      fixedPages,
      allFilenames: [
        ...fixedPages.map(p => p.filename),
        ...icpPages.map(p => p.filename)
      ]
    };
  }

  /**
   * Log validation results to console
   * @param {Object} result - Validation result
   */
  static logValidationResults(result) {
    console.log('\n' + '='.repeat(70));
    console.log('CLIENT DATA VALIDATION');
    console.log('='.repeat(70) + '\n');

    if (result.valid) {
      console.log(result.summary.message);
      console.log(`\nClient: ${result.summary.details.clientName}`);
      console.log(`ICP Segments: ${result.summary.details.personaCount}`);
      console.log(`Total Pages: ${result.summary.details.totalPages} (${result.summary.details.icpPages} ICP + ${result.summary.details.fixedPages} fixed)`);

      if (result.summary.details.personas && result.summary.details.personas.length > 0) {
        console.log('\nICP Personas:');
        result.summary.details.personas.forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.name} (${p.segment}) ${p.hasEconomics ? '✓ Economics' : '⚠ No economics'}`);
        });
      }

      if (result.warnings && result.warnings.length > 0) {
        console.log('\nWarnings:');
        result.warnings.forEach(w => console.log(`  ${w}`));
      }
    } else {
      console.log('❌ VALIDATION FAILED\n');
      console.log('Critical Errors:');
      result.errors.forEach(e => console.log(`  ${e}`));

      if (result.warnings && result.warnings.length > 0) {
        console.log('\nWarnings:');
        result.warnings.forEach(w => console.log(`  ${w}`));
      }
    }

    console.log('\n' + '='.repeat(70) + '\n');

    return result.valid;
  }

  /**
   * Quick validation check - throws error if invalid
   * @param {Object} clientData - Client data
   * @param {Object} seoData - SEO data (optional)
   * @throws {Error} - If validation fails
   */
  static validateOrThrow(clientData, seoData = null) {
    const result = this.validateClientData(clientData, seoData);
    this.logValidationResults(result);

    if (!result.valid) {
      throw new Error(
        `Client data validation failed:\n${result.errors.join('\n')}`
      );
    }

    return result;
  }
}

module.exports = ClientDataValidator;

// Example usage:
// const validator = require('./client-data-validator');
// const clientData = JSON.parse(fs.readFileSync('integrated-client-context.json'));
// const seoData = JSON.parse(fs.readFileSync('keyword-research-VALIDATED.json'));
// const result = validator.validateOrThrow(clientData, seoData);
// console.log(`Generating ${result.summary.details.totalPages} pages...`);
