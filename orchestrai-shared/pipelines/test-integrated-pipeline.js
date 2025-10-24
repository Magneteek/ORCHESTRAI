#!/usr/bin/env node

/**
 * TEST: Integrated Content Pipeline
 *
 * This script demonstrates and tests the integrated content creation pipeline
 * with all 8 FTV articles, showing how automatic quality gates prevent
 * shipping substandard content.
 */

const { IntegratedContentPipeline } = require('./integrated-content-creation-pipeline');
const path = require('path');

// FTV Project paths
const FTV_PROJECT_BASE = '/Users/kris/CLAUDEtools/ORCHESTRAI/projects/ftv-6C8329A4-5FB6-4F4A-A3D0-269B6B1FF67C';
const OUTLINES_DIR = `${FTV_PROJECT_BASE}/deliverables/content/outlines`;
const OUTPUT_DIR = `${FTV_PROJECT_BASE}/deliverables/content/english/tourism`;

// Define all 8 articles for Month 1
const MONTH_1_ARTICLES = [
  {
    title: 'Fuerteventura Weather & Best Time to Visit',
    outlinePath: path.join(OUTLINES_DIR, 'weather-best-time-pillar-outline.md'),
    outputPath: path.join(OUTPUT_DIR, 'weather-best-time-visit-fuerteventura.md'),
    targetWordCount: 3200,
    priority: 1
  },
  {
    title: 'Fuerteventura in November Complete Guide',
    outlinePath: path.join(OUTLINES_DIR, 'november-weather-outline.md'),
    outputPath: path.join(OUTPUT_DIR, 'fuerteventura-in-november-complete-guide.md'),
    targetWordCount: 1800,
    priority: 1
  },
  {
    title: 'Fuerteventura in December Complete Guide',
    outlinePath: path.join(OUTLINES_DIR, 'december-weather-outline.md'),
    outputPath: path.join(OUTPUT_DIR, 'fuerteventura-in-december-complete-guide.md'),
    targetWordCount: 1800,
    priority: 1
  },
  {
    title: 'Fuerteventura in January Complete Guide',
    outlinePath: path.join(OUTLINES_DIR, 'january-weather-outline.md'),
    outputPath: path.join(OUTPUT_DIR, 'fuerteventura-in-january-complete-guide.md'),
    targetWordCount: 1800,
    priority: 1
  },
  {
    title: 'Best Beaches in Fuerteventura Complete Guide',
    outlinePath: path.join(OUTLINES_DIR, 'beaches-pillar-outline.md'),
    outputPath: path.join(OUTPUT_DIR, 'best-beaches-fuerteventura-complete-guide.md'),
    targetWordCount: 4500,
    priority: 1
  },
  {
    title: 'Corralejo Beaches Complete Guide',
    outlinePath: path.join(OUTLINES_DIR, 'corralejo-beaches-outline.md'),
    outputPath: path.join(OUTPUT_DIR, 'corralejo-beaches-complete-guide.md'),
    targetWordCount: 2500,
    priority: 1
  },
  {
    title: 'Fuerteventura vs Lanzarote Complete Comparison',
    outlinePath: path.join(OUTLINES_DIR, 'fuerteventura-vs-lanzarote-outline.md'),
    outputPath: path.join(OUTPUT_DIR, 'fuerteventura-vs-lanzarote-complete-comparison.md'),
    targetWordCount: 3000,
    priority: 1
  },
  {
    title: 'Fuerteventura vs Tenerife Complete Comparison',
    outlinePath: path.join(OUTLINES_DIR, 'fuerteventura-vs-tenerife-outline.md'),
    outputPath: path.join(OUTPUT_DIR, 'fuerteventura-vs-tenerife-complete-comparison.md'),
    targetWordCount: 2800,
    priority: 1
  }
];

/**
 * Test Phase 1: Validate Existing Articles
 * Check the 4 articles that currently exist to see their current quality status
 */
async function testPhase1_ValidateExisting() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 1: VALIDATE EXISTING ARTICLES (Quality Baseline)');
  console.log('='.repeat(80) + '\n');

  const pipeline = new IntegratedContentPipeline({
    maxRevisionCycles: 0, // Don't revise, just validate
    aiDetectionThreshold: 25,
    strictMode: true
  });

  const existingArticles = MONTH_1_ARTICLES.slice(1, 5); // November, December, January, Beaches

  console.log('Testing 4 existing articles to establish quality baseline...\n');

  for (const article of existingArticles) {
    console.log(`\nValidating: ${article.title}`);
    console.log('-'.repeat(60));

    // Gate 2: File Verification
    const fileCheck = await pipeline.gate2_verifyFile(article.outputPath);

    if (!fileCheck.exists) {
      console.log(`❌ File does not exist: ${article.outputPath}`);
      continue;
    }

    console.log(`✅ File exists: ${fileCheck.sizeKB} KB`);

    // Gate 3 & 4: Validation (mocked, but shows structure)
    const aiValidation = await pipeline.gate3_validateAIDetection(article.outputPath);
    const qualityValidation = await pipeline.gate4_validateQuality(article.outputPath, article.targetWordCount);

    console.log(`\nAI Detection: ${aiValidation.score}% ${aiValidation.passed ? '✅' : '❌'}`);
    console.log(`Quality Check: ${qualityValidation.passed ? '✅ PASS' : '❌ FAIL'}`);

    if (!qualityValidation.passed) {
      console.log('\nQuality Issues:');
      qualityValidation.issues.forEach(issue => console.log(`  - ${issue}`));
    }

    console.log('\nMetrics:');
    console.log(`  Paragraphs: ${qualityValidation.details.paragraphDistribution.short}% short, ` +
                `${qualityValidation.details.paragraphDistribution.medium}% medium, ` +
                `${qualityValidation.details.paragraphDistribution.long}% long`);
    console.log(`  Lists: ${qualityValidation.details.elements.bulletLists} (max: 20)`);
    console.log(`  Bold: ${qualityValidation.details.elements.boldInstances} (max: 15)`);
    console.log(`  Tables: ${qualityValidation.details.elements.tables} (max: 6)`);
    console.log(`  Word Count: ${qualityValidation.details.wordCount.actual} / ${article.targetWordCount} ` +
                `(${qualityValidation.details.wordCount.variance})`);
  }

  console.log('\n' + '='.repeat(80));
  console.log('PHASE 1 COMPLETE: Baseline established');
  console.log('='.repeat(80) + '\n');
}

/**
 * Test Phase 2: Demonstrate Pipeline Flow
 * Show how the integrated pipeline would handle a single article from scratch
 */
async function testPhase2_DemonstratePipeline() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 2: DEMONSTRATE INTEGRATED PIPELINE FLOW');
  console.log('='.repeat(80) + '\n');

  const pipeline = new IntegratedContentPipeline({
    maxRevisionCycles: 2,
    aiDetectionThreshold: 25,
    strictMode: true
  });

  // Use the Weather Pillar as example
  const testArticle = MONTH_1_ARTICLES[0];

  console.log(`Demo Article: ${testArticle.title}`);
  console.log(`Target Word Count: ${testArticle.targetWordCount}\n`);

  console.log('Pipeline Flow Demonstration:');
  console.log('-'.repeat(60));

  console.log('\n1. GATE 1: Content Creation');
  console.log('   → Launch content-writer-specialist agent');
  console.log('   → Pass outline, requirements, strictures');
  console.log('   → Agent writes article');
  console.log('   ✅ Content creation complete\n');

  console.log('2. GATE 2: File Verification');
  console.log('   → Check file exists at output path');
  console.log('   → Verify file is readable and non-empty');
  const fileExists = await pipeline.gate2_verifyFile(testArticle.outputPath);
  if (fileExists.exists) {
    console.log(`   ✅ File verified: ${fileExists.sizeKB} KB`);
  } else {
    console.log('   ❌ File not found (expected for demo)');
    console.log('   → Would escalate to error handling');
  }
  console.log();

  console.log('3. GATE 3: AI Detection Validation');
  console.log('   → Launch content-ai-phrase-detector agent');
  console.log('   → Scan for forbidden phrases');
  console.log('   → Calculate AI detection risk score');
  console.log('   → Example: 22% detected (✅ PASS < 25%)');
  console.log('   ✅ AI detection passed\n');

  console.log('4. GATE 4: Quality Architecture Validation');
  console.log('   → Launch content-quality-validator agent');
  console.log('   → Check paragraph distribution (40/40/20)');
  console.log('   → Verify element limits (lists, bold, tables)');
  console.log('   → Validate word count (±10%)');
  console.log('   → Example: Found 32 lists (❌ FAIL > 20)');
  console.log('   ❌ Quality check failed\n');

  console.log('5. REVISION LOOP (Cycle 1)');
  console.log('   → Compile specific fix instructions');
  console.log('   → "Convert 12+ lists to flowing paragraphs"');
  console.log('   → "Reduce bold from 40 to 15 instances"');
  console.log('   → Launch writer in REVISION mode');
  console.log('   → Return to Gate 2 (file verification)\n');

  console.log('6. RE-VALIDATION');
  console.log('   → File verified again');
  console.log('   → AI Detection: 19% (✅ PASS)');
  console.log('   → Quality Check: All metrics passed (✅ PASS)');
  console.log('   ✅ All gates passed\n');

  console.log('7. COMPLETION');
  console.log('   → Mark article as production-ready');
  console.log('   → Update tracking systems');
  console.log('   → Return success metrics');
  console.log('   ✅ Article complete with guaranteed quality\n');

  console.log('-'.repeat(60));
  console.log('\nKey Improvements Over Previous Approach:');
  console.log('  ✓ Automatic file verification (catches silent failures)');
  console.log('  ✓ Integrated validation (not manual post-check)');
  console.log('  ✓ Automatic revision (targeted fixes, not rewrites)');
  console.log('  ✓ Quality guarantee (no "complete" without passing gates)');
  console.log('  ✓ Transparent progress (clear gate status)');

  console.log('\n' + '='.repeat(80));
  console.log('PHASE 2 COMPLETE: Pipeline flow demonstrated');
  console.log('='.repeat(80) + '\n');
}

/**
 * Test Phase 3: Show Batch Processing Benefits
 */
async function testPhase3_BatchProcessing() {
  console.log('\n' + '='.repeat(80));
  console.log('PHASE 3: BATCH PROCESSING WITH QUALITY GATES');
  console.log('='.repeat(80) + '\n');

  console.log('Previous Approach:');
  console.log('  1. Launch 8 agents in parallel');
  console.log('  2. All report "success"');
  console.log('  3. Manual validation discovers:');
  console.log('     - 4 files missing (silent failures)');
  console.log('     - 4 files with quality issues');
  console.log('     - 0 articles actually production-ready');
  console.log('  4. Expensive manual rework required\n');

  console.log('-'.repeat(60) + '\n');

  console.log('Integrated Pipeline Approach:');
  console.log('  1. Launch 8 pipeline orchestrators');
  console.log('  2. Each runs through all quality gates');
  console.log('  3. Automatic validation at each step:');
  console.log('     ✓ File exists (or immediate error)');
  console.log('     ✓ AI detection <25% (or auto-revise)');
  console.log('     ✓ Quality metrics (or auto-revise)');
  console.log('  4. Only mark "complete" after passing all gates');
  console.log('  5. Result: 8 production-ready articles guaranteed\n');

  console.log('Benefits:');
  console.log('  • No false success reporting');
  console.log('  • No manual quality checks needed');
  console.log('  • Automatic targeted revisions');
  console.log('  • Consistent quality across all articles');
  console.log('  • Clear escalation for true failures\n');

  console.log('Example Batch Results:');
  console.log('-'.repeat(60));
  MONTH_1_ARTICLES.forEach((article, index) => {
    // Simulate realistic pipeline results
    const cycles = Math.floor(Math.random() * 2); // 0-1 revision cycles
    const aiScore = 15 + Math.floor(Math.random() * 10); // 15-24%

    console.log(`\n${index + 1}. ${article.title}`);
    console.log(`   Status: ✅ SUCCESS`);
    console.log(`   AI Score: ${aiScore}%`);
    console.log(`   Revision Cycles: ${cycles}`);
    console.log(`   Final Word Count: ${article.targetWordCount} (±5%)`);
  });

  console.log('\n' + '-'.repeat(60));
  console.log('Batch Summary:');
  console.log('  Total: 8 articles');
  console.log('  Successful: 8/8 (100%)');
  console.log('  Failed: 0 (would be escalated to human)');
  console.log('  Average revision cycles: 0.5');
  console.log('  All articles production-ready: YES ✅');

  console.log('\n' + '='.repeat(80));
  console.log('PHASE 3 COMPLETE: Batch processing benefits shown');
  console.log('='.repeat(80) + '\n');
}

/**
 * Main test execution
 */
async function runTests() {
  console.log('\n' + '█'.repeat(80));
  console.log('   INTEGRATED CONTENT PIPELINE - COMPREHENSIVE TEST');
  console.log('█'.repeat(80));

  try {
    // Phase 1: Validate existing articles to show current state
    await testPhase1_ValidateExisting();

    // Phase 2: Demonstrate how integrated pipeline works
    await testPhase2_DemonstratePipeline();

    // Phase 3: Show batch processing benefits
    await testPhase3_BatchProcessing();

    console.log('\n' + '█'.repeat(80));
    console.log('   ALL TESTS COMPLETE');
    console.log('█'.repeat(80));
    console.log('\nNext Steps:');
    console.log('1. Review pipeline architecture and flow');
    console.log('2. Implement Task tool wrappers for agent integration');
    console.log('3. Run live test with 8 FTV articles');
    console.log('4. Measure quality improvements vs. previous approach');
    console.log('5. Document lessons learned and optimize thresholds\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  MONTH_1_ARTICLES,
  testPhase1_ValidateExisting,
  testPhase2_DemonstratePipeline,
  testPhase3_BatchProcessing
};
