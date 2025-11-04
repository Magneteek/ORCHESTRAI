/**
 * TEST: COMPREHENSIVE INTELLIGENCE REPORT
 *
 * Tests the complete intelligence aggregation and HTML generation
 * combining EOS, ICP, Personas, and Psychographic research
 */

const path = require('path');
const ComprehensiveIntelligenceAggregator = require('../pipelines/comprehensive-intelligence-aggregator');
const IntelligenceHTMLPipeline = require('../pipelines/intelligence-html-report-pipeline');

async function testComprehensiveReport() {
  console.log('\n' + '='.repeat(80));
  console.log('COMPREHENSIVE INTELLIGENCE REPORT TEST');
  console.log('='.repeat(80) + '\n');

  try {
    const clientIntelligencePath = path.join(
      __dirname,
      '../../../projects/nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e/client-intelligence'
    );

    // STEP 1: Aggregate all intelligence data
    console.log('STEP 1: Aggregating Intelligence Data');
    console.log('-'.repeat(80) + '\n');

    const aggregator = new ComprehensiveIntelligenceAggregator(clientIntelligencePath);
    const aggregatedData = await aggregator.aggregateAll();

    console.log('\n📊 Aggregation Summary:');
    console.log(`   EOS Data: ${aggregatedData.eos ? '✅' : '❌'}`);
    console.log(`   ICP Data: ${aggregatedData.icp ? '✅' : '❌'}`);
    console.log(`   Personas: ${aggregatedData.personas.length} personas`);
    console.log(`   Psychographic Research: ${aggregatedData.psychographic ? '✅' : '❌'}`);
    console.log(`   Market Analysis: ${aggregatedData.marketAnalysis.length} files`);
    console.log(`   Client Profile: ${aggregatedData.clientProfile ? '✅' : '❌'}`);
    console.log(`   Completeness: ${aggregatedData.metadata.completeness}%`);

    // Export aggregated JSON for reference
    const aggregatedJSONPath = path.join(
      clientIntelligencePath,
      'comprehensive-intelligence-aggregated.json'
    );
    await aggregator.exportToJSON(aggregatedJSONPath);

    // STEP 2: Generate HTML Report
    console.log('\n\nSTEP 2: Generating Comprehensive HTML Report');
    console.log('-'.repeat(80) + '\n');

    const mockOrchestrator = { app: { post: () => {}, get: () => {} } };
    const mockClientHub = {
      getClientProjectPath: (clientId) => path.join(__dirname, '../../../projects', clientId)
    };

    const pipeline = new IntelligenceHTMLPipeline(mockOrchestrator, mockClientHub);

    // Use custom report specification for comprehensive report
    const result = await pipeline.executePipeline({
      jsonReportPath: aggregatedJSONPath,
      reportType: 'comprehensive',
      clientId: 'nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e'
    });

    if (result.success) {
      console.log('\n✅ COMPREHENSIVE REPORT GENERATED');
      console.log(`   Output: ${result.htmlPath}`);
      console.log(`   File Size: ${(result.metrics.fileSize / 1024).toFixed(2)} KB`);
      console.log(`   Sections: ${result.metrics.sections}`);
      console.log(`   Generation Time: ${(result.metrics.totalTime / 1000).toFixed(2)}s`);

      // STEP 3: Open in browser
      console.log('\n\nSTEP 3: Opening Report in Browser');
      console.log('-'.repeat(80) + '\n');

      const { exec } = require('child_process');
      exec(`open "${result.htmlPath}"`, (error) => {
        if (error) {
          console.log('⚠️  Could not auto-open browser');
          console.log(`   Manually open: ${result.htmlPath}`);
        } else {
          console.log('✅ Report opened in default browser');
        }
      });

      // STEP 4: Report Summary
      console.log('\n\n' + '='.repeat(80));
      console.log('REPORT CONTENTS');
      console.log('='.repeat(80));

      console.log('\n📋 Included Sections:');
      if (aggregatedData.eos) {
        console.log('   ✓ EOS (Entrepreneurial Operating System)');
        console.log('     - Core Values');
        console.log('     - Core Focus (Purpose & Niche)');
        console.log('     - Marketing Strategy');
        console.log('     - Proven Process');
      }

      if (aggregatedData.icp) {
        console.log('   ✓ ICP (Ideal Customer Profile)');
        console.log('     - Before/After Transformation');
        console.log('     - Primary & Secondary Goals');
        console.log('     - Dreams & Promises');
        console.log('     - Fears & Objections');
        console.log('     - Past Experiences (What They Tried)');
        console.log('     - Key Statistics');
      }

      if (aggregatedData.personas && aggregatedData.personas.length > 0) {
        console.log(`   ✓ Customer Personas (${aggregatedData.personas.length})`);
        aggregatedData.personas.forEach(p => {
          console.log(`     - ${p.name}`);
        });
      }

      if (aggregatedData.psychographic) {
        console.log('   ✓ Psychographic Research');
        console.log('     - Cultural Values Matrix');
        console.log('     - Regional Differences');
        console.log('     - Search Patterns');
        console.log('     - Emotional Triggers');
      }

      console.log('\n📖 How to Use the Report:');
      console.log('   1. Navigate through sections using the sticky navigation bar');
      console.log('   2. Click "Export PDF" to save for client presentations');
      console.log('   3. Use collapsible sections to explore detailed data');
      console.log('   4. Share the HTML file directly - it works offline');

      console.log('\n✨ Report Features:');
      console.log('   ✓ Interactive navigation');
      console.log('   ✓ Print-friendly styling');
      console.log('   ✓ Responsive design (mobile, tablet, desktop)');
      console.log('   ✓ Self-contained (no external dependencies except CDN)');
      console.log('   ✓ ORCHESTRAI branding');

      console.log('\n' + '='.repeat(80));
      console.log('TEST COMPLETE - Comprehensive Intelligence Report Ready!');
      console.log('='.repeat(80) + '\n');

      return {
        success: true,
        htmlPath: result.htmlPath,
        aggregatedData: aggregatedData
      };

    } else {
      console.error('\n❌ REPORT GENERATION FAILED');
      console.error(`   Error: ${result.error}`);
      return { success: false, error: result.error };
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error);
    console.error('\nStack trace:');
    console.error(error.stack);
    return { success: false, error: error.message };
  }
}

// Run test if executed directly
if (require.main === module) {
  testComprehensiveReport()
    .then((result) => {
      if (result.success) {
        console.log('\n✅ All tests passed successfully!\n');
        process.exit(0);
      } else {
        console.error('\n❌ Tests failed\n');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Test suite crashed:', error.message);
      process.exit(1);
    });
}

module.exports = { testComprehensiveReport };
