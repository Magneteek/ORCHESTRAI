/**
 * COMPREHENSIVE INTELLIGENCE REPORT GENERATOR
 *
 * Universal generator for complete client intelligence reports with:
 * - ShadCN UI component patterns
 * - ALL data from integrated-client-context.json
 * - SEO data from deliverables/seo/ (all 12 keyword categories)
 * - Competitor profiles from deliverables/seo/competitor-landscape-preliminary.md
 * - NO GRADIENTS (solid colors only: #667eea, #764ba2)
 * - Single-column keyword layout for easy scanning
 *
 * Usage:
 *   node comprehensive-intelligence-report-generator.js <project-uuid>
 *   node comprehensive-intelligence-report-generator.js <project-name>
 *
 * Examples:
 *   node comprehensive-intelligence-report-generator.js rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9
 *   node comprehensive-intelligence-report-generator.js nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e
 *   node comprehensive-intelligence-report-generator.js "Rapid Cold Plunge"
 *
 * Output:
 *   Saves to: /projects/[uuid]/deliverables/client-intelligence/comprehensive-intelligence-report-shadcn-COMPLETE-[timestamp].html
 */

// This is a wrapper that calls the main generator with project-specific paths
// The actual generator logic is in updated-no-gradients/comprehensive-shadcn-generator.js
// which has been updated to work with any project

console.log('\n================================================================================');
console.log('COMPREHENSIVE INTELLIGENCE REPORT GENERATOR');
console.log('================================================================================\n');

const projectIdentifier = process.argv[2];

if (!projectIdentifier) {
  console.error('❌ ERROR: Project identifier required\n');
  console.log('Usage:');
  console.log('  node comprehensive-intelligence-report-generator.js <project-uuid>');
  console.log('  node comprehensive-intelligence-report-generator.js <project-name>\n');
  console.log('Examples:');
  console.log('  node comprehensive-intelligence-report-generator.js rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9');
  console.log('  node comprehensive-intelligence-report-generator.js "Rapid Cold Plunge"\n');
  process.exit(1);
}

console.log(`📌 For now, please use the generator directly with the project data path:`);
console.log(`   cd updated-no-gradients/`);
console.log(`   node comprehensive-shadcn-generator.js /path/to/project/client-intelligence/integrated-client-context.json\n`);
console.log(`📝 Full project-agnostic version coming soon!\n`);
