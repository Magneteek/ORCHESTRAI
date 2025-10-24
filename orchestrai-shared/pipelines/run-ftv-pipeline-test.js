#!/usr/bin/env node

/**
 * FTV Pipeline Test Runner
 *
 * Orchestrates the creation of all 8 Month 1 FTV articles using the
 * integrated content pipeline with quality gates enforced.
 *
 * This script provides:
 * - Sequential article processing with quality gates
 * - Clear instructions for launching agents via Task tool
 * - Progress tracking and validation
 * - Comprehensive results reporting
 *
 * Usage:
 *   node run-ftv-pipeline-test.js                    # Run all 8 articles
 *   node run-ftv-pipeline-test.js --article=0        # Run single article by index
 *   node run-ftv-pipeline-test.js --batch=4          # Run in batches of 4
 */

const { ContentPipelineTaskOrchestrator } = require('./content-pipeline-task-orchestrator');
const path = require('path');
const readline = require('readline');

// FTV Project Configuration
const FTV_PROJECT_BASE = '/Users/kris/CLAUDEtools/ORCHESTRAI/projects/ftv-6C8329A4-5FB6-4F4A-A3D0-269B6B1FF67C';
const OUTLINES_DIR = `${FTV_PROJECT_BASE}/deliverables/content/outlines`;
const OUTPUT_DIR = `${FTV_PROJECT_BASE}/deliverables/content/english/tourism`;

// All 8 Month 1 Articles
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

class FTVPipelineTestRunner {
  constructor() {
    this.orchestrator = new ContentPipelineTaskOrchestrator({
      maxRevisionCycles: 2,
      aiDetectionThreshold: 25,
      strictMode: true,
      verbose: true
    });

    this.results = [];
    this.startTime = Date.now();
  }

  /**
   * Main execution method - orchestrates all articles through pipeline
   */
  async run(options = {}) {
    console.log('\n' + '█'.repeat(80));
    console.log('   FTV CONTENT PIPELINE - INTEGRATED QUALITY GATES TEST');
    console.log('█'.repeat(80));
    console.log('\nThis test will create all 8 Month 1 FTV articles with automatic quality');
    console.log('validation at each step. The pipeline enforces quality gates to ensure');
    console.log('no article is marked "complete" without passing all validation criteria.');
    console.log('\n' + '═'.repeat(80));

    // Determine which articles to process
    const articlesToProcess = this.getArticlesToProcess(options);

    console.log(`\nProcessing ${articlesToProcess.length} article(s):`);
    articlesToProcess.forEach((article, index) => {
      console.log(`  ${index + 1}. ${article.title} (${article.targetWordCount} words)`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n⚠️  IMPORTANT: Agent Launch Instructions');
    console.log('-'.repeat(80));
    console.log('This orchestrator will prepare comprehensive prompts for each agent.');
    console.log('You must launch these agents via Claude Code\'s Task tool:');
    console.log('\n  1. Orchestrator prints agent prompt');
    console.log('  2. You launch agent via Task tool with that prompt');
    console.log('  3. Wait for agent completion');
    console.log('  4. Press ENTER to continue to next gate');
    console.log('\n' + '═'.repeat(80));

    await this.waitForUserReady();

    // Process articles sequentially
    for (let i = 0; i < articlesToProcess.length; i++) {
      const article = articlesToProcess[i];
      console.log(`\n\n${'█'.repeat(80)}`);
      console.log(`   ARTICLE ${i + 1}/${articlesToProcess.length}: ${article.title}`);
      console.log('█'.repeat(80));

      const result = await this.processArticle(article, i + 1);
      this.results.push(result);

      // Progress summary
      this.printProgressSummary();

      if (i < articlesToProcess.length - 1) {
        console.log('\n' + '-'.repeat(80));
        console.log('Ready to proceed to next article? Press ENTER...');
        await this.waitForUser();
      }
    }

    // Final summary
    this.printFinalSummary();
  }

  /**
   * Process a single article through complete pipeline
   */
  async processArticle(articleSpec, articleNumber) {
    const articleResult = {
      article: articleSpec.title,
      startTime: Date.now(),
      success: false,
      cycles: [],
      finalStatus: 'PENDING'
    };

    // GATE 0: Outline Verification & Approval (MANDATORY BLOCKING GATE)
    console.log('\n' + '='.repeat(60));
    console.log('GATE 0: Outline Verification & Approval');
    console.log('='.repeat(60));

    const outlineCheck = await this.orchestrator.gate0_verifyAndApproveOutline(articleSpec);

    if (!outlineCheck.exists) {
      console.log('\n❌ PIPELINE STOPPED: Outline does not exist');
      console.log('   The outline must be created before proceeding.');
      console.log(`   Expected path: ${articleSpec.outlinePath}`);
      console.log('\n📋 Required Actions:');
      console.log('   1. Create comprehensive outline following CLAUDE.md workflow');
      console.log('   2. Save outline to the path above');
      console.log('   3. Restart pipeline for this article');

      articleResult.finalStatus = 'FAILED_OUTLINE_MISSING';
      articleResult.endTime = Date.now();
      return articleResult;
    }

    // Outline exists - now get user approval
    console.log('\n⚠️  MANDATORY CHECKPOINT: Outline Approval Required');
    console.log('='.repeat(60));
    console.log('Per CLAUDE.md: "DO NOT proceed to writing without explicit approval"');
    console.log('\nOutline Details:');
    console.log(`   Path: ${outlineCheck.path}`);
    console.log(`   Size: ${outlineCheck.sizeKB} KB`);
    console.log('\n📋 Review Checklist:');
    console.log('   ✓ Psychographic integration specified');
    console.log('   ✓ Keyword mapping defined');
    console.log('   ✓ Word count planning for each section');
    console.log('   ✓ Internal linking architecture planned');
    console.log('   ✓ CTA strategy defined per psychographic segment');
    console.log('\n' + '='.repeat(60));

    const approvalInput = await this.getUserInput('\nApprove outline and proceed to writing? (y/n): ');
    const outlineApproved = approvalInput.toLowerCase() === 'y';

    if (!outlineApproved) {
      console.log('\n⏸️  PIPELINE PAUSED: Outline not approved');
      console.log('   Revise the outline and restart pipeline when ready.');

      articleResult.finalStatus = 'PAUSED_OUTLINE_NOT_APPROVED';
      articleResult.endTime = Date.now();
      return articleResult;
    }

    console.log('\n✅ Outline approved - proceeding to content creation...');

    let revisionCycle = 0;
    const maxCycles = this.orchestrator.maxRevisionCycles;

    while (revisionCycle <= maxCycles) {
      console.log(`\n${'▓'.repeat(80)}`);
      console.log(`   ${revisionCycle === 0 ? 'INITIAL CREATION' : `REVISION CYCLE ${revisionCycle}`}`);
      console.log('▓'.repeat(80));

      const cycleResult = {
        cycle: revisionCycle,
        gates: {}
      };

      // GATE 1: Content Creation
      console.log('\n' + '='.repeat(60));
      console.log('GATE 1: Content Creation');
      console.log('='.repeat(60));

      const writerLaunch = await this.orchestrator.gate1_launchContentWriter(
        articleSpec,
        revisionCycle > 0
      );

      console.log('\n📋 AGENT PROMPT READY:');
      console.log('-'.repeat(60));
      console.log(writerLaunch.prompt);
      console.log('-'.repeat(60));

      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('1. Copy the prompt above');
      console.log('2. Launch content-writer-specialist agent via Task tool');
      console.log('3. Wait for agent completion');
      console.log('4. Press ENTER to continue with validation...\n');

      await this.waitForUser();

      cycleResult.gates.contentCreation = {
        status: 'COMPLETED',
        timestamp: writerLaunch.timestamp
      };

      // GATE 2: File Verification
      const fileCheck = await this.orchestrator.gate2_verifyFile(articleSpec.outputPath);
      cycleResult.gates.fileVerification = fileCheck;

      if (!fileCheck.passed) {
        console.log('\n❌ PIPELINE FAILED: File verification failed');
        console.log('   The agent reported success but the file does not exist.');
        console.log('   This is a critical failure requiring manual investigation.');

        articleResult.finalStatus = 'FAILED_FILE_VERIFICATION';
        articleResult.cycles.push(cycleResult);
        articleResult.endTime = Date.now();
        return articleResult;
      }

      // GATE 3: AI Detection
      console.log('\n' + '='.repeat(60));
      console.log('GATE 3: AI Detection Validation');
      console.log('='.repeat(60));

      const aiDetectorLaunch = await this.orchestrator.gate3_launchAIDetector(articleSpec.outputPath);

      console.log('\n📋 AGENT PROMPT READY:');
      console.log('-'.repeat(60));
      console.log(aiDetectorLaunch.prompt);
      console.log('-'.repeat(60));

      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('1. Copy the prompt above');
      console.log('2. Launch content-ai-phrase-detector agent via Task tool');
      console.log('3. Wait for agent completion and note the detection score');
      console.log('4. Enter the AI detection score (0-100): ');

      const aiScore = await this.getUserInput('AI detection score: ');
      const aiPassed = parseFloat(aiScore) < this.orchestrator.aiDetectionThreshold;

      cycleResult.gates.aiDetection = {
        status: aiPassed ? 'PASSED' : 'FAILED',
        score: parseFloat(aiScore),
        passed: aiPassed,
        threshold: this.orchestrator.aiDetectionThreshold
      };

      console.log(aiPassed ? '✅ AI Detection: PASSED' : '❌ AI Detection: FAILED');

      // GATE 4: Quality Validation
      console.log('\n' + '='.repeat(60));
      console.log('GATE 4: Quality Architecture Validation');
      console.log('='.repeat(60));

      const qualityValidatorLaunch = await this.orchestrator.gate4_launchQualityValidator(
        articleSpec.outputPath,
        articleSpec.targetWordCount
      );

      console.log('\n📋 AGENT PROMPT READY:');
      console.log('-'.repeat(60));
      console.log(qualityValidatorLaunch.prompt);
      console.log('-'.repeat(60));

      console.log('\n⚠️  ACTION REQUIRED:');
      console.log('1. Copy the prompt above');
      console.log('2. Launch content-quality-validator agent via Task tool');
      console.log('3. Wait for agent completion');
      console.log('4. Did quality validation PASS? (y/n): ');

      const qualityPassedInput = await this.getUserInput('Quality validation passed (y/n): ');
      const qualityPassed = qualityPassedInput.toLowerCase() === 'y';

      cycleResult.gates.qualityValidation = {
        status: qualityPassed ? 'PASSED' : 'FAILED',
        passed: qualityPassed
      };

      console.log(qualityPassed ? '✅ Quality Validation: PASSED' : '❌ Quality Validation: FAILED');

      // Check if all gates passed
      if (aiPassed && qualityPassed) {
        console.log('\n' + '🎉'.repeat(40));
        console.log('✅ ALL GATES PASSED - ARTICLE COMPLETE');
        console.log('🎉'.repeat(40));

        articleResult.success = true;
        articleResult.finalStatus = 'COMPLETED';
        articleResult.cycles.push(cycleResult);
        articleResult.endTime = Date.now();
        articleResult.totalCycles = revisionCycle;
        return articleResult;
      }

      // Gates failed - need revision
      console.log('\n⚠️  Validation gates failed - preparing revision...');

      revisionCycle++;

      if (revisionCycle > maxCycles) {
        console.log('\n❌ MAX REVISION CYCLES EXCEEDED');
        console.log('   Human intervention required.');

        articleResult.finalStatus = 'FAILED_MAX_CYCLES';
        articleResult.cycles.push(cycleResult);
        articleResult.endTime = Date.now();
        return articleResult;
      }

      // Compile revision instructions
      console.log('\n📝 Compiling revision instructions...');
      console.log('Please provide specific issues found by validation agents:');

      const revisionIssues = await this.getUserInput('Enter issues (comma-separated): ');

      articleSpec.revisionInstructions = {
        aiIssues: !aiPassed ? [`AI detection score too high: ${aiScore}%`] : [],
        qualityIssues: !qualityPassed ? revisionIssues.split(',').map(s => s.trim()) : [],
        specificFixes: []
      };

      articleResult.cycles.push(cycleResult);

      console.log('\n' + '-'.repeat(80));
      console.log(`Starting revision cycle ${revisionCycle}...`);
      console.log('-'.repeat(80));
    }

    return articleResult;
  }

  /**
   * Get articles to process based on options
   */
  getArticlesToProcess(options) {
    if (options.article !== undefined) {
      const index = parseInt(options.article);
      if (index >= 0 && index < MONTH_1_ARTICLES.length) {
        return [MONTH_1_ARTICLES[index]];
      }
    }

    if (options.batch) {
      const batchSize = parseInt(options.batch);
      return MONTH_1_ARTICLES.slice(0, batchSize);
    }

    return MONTH_1_ARTICLES;
  }

  /**
   * Print progress summary
   */
  printProgressSummary() {
    console.log('\n' + '═'.repeat(80));
    console.log('   PROGRESS SUMMARY');
    console.log('═'.repeat(80));

    const completed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const total = this.results.length;

    console.log(`\nCompleted: ${completed}/${total}`);
    console.log(`Failed: ${failed}/${total}`);
    console.log(`Success Rate: ${((completed / total) * 100).toFixed(1)}%`);

    if (this.results.length > 0) {
      console.log('\nArticle Status:');
      this.results.forEach((result, index) => {
        const statusEmoji = result.success ? '✅' : '❌';
        const status = result.finalStatus;
        const cycles = result.totalCycles !== undefined ? ` (${result.totalCycles} cycles)` : '';
        console.log(`  ${statusEmoji} ${result.article}: ${status}${cycles}`);
      });
    }

    console.log('═'.repeat(80));
  }

  /**
   * Print final comprehensive summary
   */
  printFinalSummary() {
    console.log('\n\n' + '█'.repeat(80));
    console.log('   FINAL PIPELINE TEST RESULTS');
    console.log('█'.repeat(80));

    const completed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;
    const totalTime = ((Date.now() - this.startTime) / 1000 / 60).toFixed(1);

    console.log('\n📊 Overall Statistics:');
    console.log('-'.repeat(60));
    console.log(`Total Articles: ${this.results.length}`);
    console.log(`Successfully Completed: ${completed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Success Rate: ${((completed / this.results.length) * 100).toFixed(1)}%`);
    console.log(`Total Time: ${totalTime} minutes`);

    console.log('\n📋 Detailed Results:');
    console.log('-'.repeat(60));

    this.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.article}`);
      console.log(`   Status: ${result.finalStatus}`);
      console.log(`   Cycles: ${result.cycles.length}`);

      if (result.success) {
        console.log(`   ✅ Production-ready article created`);
      } else {
        console.log(`   ❌ Failed: ${result.finalStatus}`);
      }
    });

    console.log('\n' + '═'.repeat(80));
    console.log('   Pipeline Benefits Demonstrated:');
    console.log('═'.repeat(80));
    console.log('✓ Automatic file verification (catches silent failures)');
    console.log('✓ Integrated validation (not manual post-check)');
    console.log('✓ Quality gates enforce standards automatically');
    console.log('✓ Clear success/failure status per article');
    console.log('✓ No false "complete" without passing all gates');

    console.log('\n' + '█'.repeat(80));
    console.log('   TEST COMPLETE');
    console.log('█'.repeat(80) + '\n');
  }

  /**
   * Wait for user input
   */
  async waitForUser() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question('', () => {
        rl.close();
        resolve();
      });
    });
  }

  /**
   * Wait for user ready confirmation
   */
  async waitForUserReady() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question('\nReady to begin? Press ENTER to start...', () => {
        rl.close();
        resolve();
      });
    });
  }

  /**
   * Get user input with prompt
   */
  async getUserInput(prompt) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise(resolve => {
      rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer);
      });
    });
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {};

  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--article=')) {
      options.article = arg.split('=')[1];
    }
    if (arg.startsWith('--batch=')) {
      options.batch = arg.split('=')[1];
    }
  });

  const runner = new FTVPipelineTestRunner();
  await runner.run(options);
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });
}

module.exports = {
  FTVPipelineTestRunner,
  MONTH_1_ARTICLES
};
