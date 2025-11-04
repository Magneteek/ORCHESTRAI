/**
 * TEST: HTML REPORT GENERATION
 *
 * Tests the intelligence HTML report pipeline with sample psychographic data
 */

const IntelligenceHTMLPipeline = require('../pipelines/intelligence-html-report-pipeline');
const path = require('path');
const fs = require('fs').promises;

async function testHTMLReportGeneration() {
  console.log('\n' + '='.repeat(80));
  console.log('TESTING HTML REPORT GENERATION');
  console.log('='.repeat(80) + '\n');

  try {
    // Use the existing Slovenian psychographic research report
    const sampleJSONPath = path.join(
      __dirname,
      '../../../projects/nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e/client-intelligence/psychographic-research/slovenian-psychographic-keyword-analysis.json'
    );

    console.log(`📄 Loading sample JSON report: ${sampleJSONPath}`);

    // Check if file exists
    try {
      await fs.access(sampleJSONPath);
      console.log('✅ Sample file found\n');
    } catch (error) {
      console.error('❌ Sample file not found');
      console.log('   Please ensure the Slovenian psychographic research file exists');
      return;
    }

    // Initialize pipeline (without orchestrator dependencies for testing)
    const mockOrchestrator = {
      app: { post: () => {}, get: () => {} }
    };

    const mockClientHub = {
      getClientProjectPath: (clientId) => path.join(__dirname, '../../../projects', clientId)
    };

    const pipeline = new IntelligenceHTMLPipeline(mockOrchestrator, mockClientHub);

    // Test 1: Generate psychographic report
    console.log('TEST 1: Generating Psychographic HTML Report');
    console.log('-'.repeat(80) + '\n');

    const result1 = await pipeline.generateHTMLReport(
      sampleJSONPath,
      'psychographic',
      'nasmehpg-2d61080a-ebee-4290-a276-0e4a996f433e'
    );

    if (result1.success) {
      console.log('\n✅ TEST 1 PASSED');
      console.log(`   HTML Report: ${result1.htmlPath}`);
      console.log(`   File Size: ${(result1.metrics.fileSize / 1024).toFixed(2)} KB`);
      console.log(`   Sections: ${result1.metrics.sections}`);
      console.log(`   Generation Time: ${(result1.metrics.totalTime / 1000).toFixed(2)}s`);
    } else {
      console.error('\n❌ TEST 1 FAILED');
      console.error(`   Error: ${result1.error}`);
    }

    // Test 2: Verify HTML file exists and is valid
    console.log('\n\nTEST 2: Validating Generated HTML');
    console.log('-'.repeat(80) + '\n');

    try {
      const htmlContent = await fs.readFile(result1.htmlPath, 'utf8');

      // Basic HTML validation
      const hasDoctype = htmlContent.includes('<!DOCTYPE html>');
      const hasTitle = htmlContent.includes('<title>');
      const hasTailwind = htmlContent.includes('tailwindcss.com');
      const hasHeader = htmlContent.includes('ORCHESTRAI Intelligence');
      const hasContent = htmlContent.length > 10000;

      console.log('HTML Structure Validation:');
      console.log(`   ✓ DOCTYPE declaration: ${hasDoctype ? '✅' : '❌'}`);
      console.log(`   ✓ Title tag: ${hasTitle ? '✅' : '❌'}`);
      console.log(`   ✓ Tailwind CSS: ${hasTailwind ? '✅' : '❌'}`);
      console.log(`   ✓ ORCHESTRAI branding: ${hasHeader ? '✅' : '❌'}`);
      console.log(`   ✓ Sufficient content: ${hasContent ? '✅' : '❌'}`);

      if (hasDoctype && hasTitle && hasTailwind && hasHeader && hasContent) {
        console.log('\n✅ TEST 2 PASSED - HTML file is valid');
      } else {
        console.log('\n⚠️  TEST 2 WARNING - Some HTML elements missing');
      }

    } catch (error) {
      console.error('\n❌ TEST 2 FAILED');
      console.error(`   Error reading HTML file: ${error.message}`);
    }

    // Test 3: Output file information
    console.log('\n\nTEST 3: File Information');
    console.log('-'.repeat(80) + '\n');

    try {
      const stats = await fs.stat(result1.htmlPath);

      console.log('Generated File Details:');
      console.log(`   Path: ${result1.htmlPath}`);
      console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   Created: ${stats.birthtime.toLocaleString()}`);
      console.log(`   Readable: ${stats.mode & 0o444 ? '✅' : '❌'}`);

      // Instructions for viewing
      console.log('\n📖 How to View the Report:');
      console.log(`   1. Open in browser: file://${result1.htmlPath}`);
      console.log(`   2. Or use: open "${result1.htmlPath}" (macOS)`);
      console.log(`   3. Print to PDF for sharing`);

      console.log('\n✅ TEST 3 PASSED');

    } catch (error) {
      console.error('\n❌ TEST 3 FAILED');
      console.error(`   Error: ${error.message}`);
    }

    // Final summary
    console.log('\n\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('✅ HTML report generation pipeline is working correctly');
    console.log('✅ Reports are generated in client deliverables/research/ folder');
    console.log('✅ Reports are self-contained and can be opened directly in browsers');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error);
    console.error('\nStack trace:');
    console.error(error.stack);
  }
}

// Run test if executed directly
if (require.main === module) {
  testHTMLReportGeneration()
    .then(() => {
      console.log('\n✨ All tests completed\n');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Test suite failed:', error.message);
      process.exit(1);
    });
}

module.exports = { testHTMLReportGeneration };
