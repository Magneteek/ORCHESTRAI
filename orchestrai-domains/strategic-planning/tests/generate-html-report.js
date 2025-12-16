/**
 * TEST: Generate Strategic Planning HTML Report
 *
 * Generates beautiful HTML executive report from strategic planning deliverables
 */

const StrategicPlanningHTMLReportGenerator = require('../pipelines/strategic-planning-html-report-generator');
const path = require('path');

async function generateHTMLReport() {
  console.log('╔═══════════════════════════════════════════════════════════════╗');
  console.log('║  STRATEGIC PLANNING HTML REPORT GENERATOR - TEST              ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  const generator = new StrategicPlanningHTMLReportGenerator();

  const config = {
    clientName: 'Rapid Cold Plunge',
    projectPath: '/Users/kris/CLAUDEtools/ORCHESTRAI/projects/rapidcoldplunge-3c7424a5-4fdc-48e3-83f6-d0aa67deb2a9'
  };

  try {
    const result = await generator.generateReport(config);

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║  REPORT GENERATION SUCCESSFUL                                 ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝\n');

    console.log('📊 REPORT DETAILS:');
    console.log(`   Client: ${config.clientName}`);
    console.log(`   Output: ${result.htmlPath}`);
    console.log(`   Size: ${(result.fileSize / 1024).toFixed(2)} KB`);
    console.log(`   Duration: ${(result.duration / 1000).toFixed(2)}s`);

    console.log('\n🚀 NEXT STEPS:');
    console.log(`   1. Open the report: open "${result.htmlPath}"`);
    console.log(`   2. Print/save as PDF using browser print function`);
    console.log(`   3. Share with stakeholders`);

    console.log('\n✅ Test complete!\n');

  } catch (error) {
    console.error('\n❌ Report generation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run test
generateHTMLReport();
