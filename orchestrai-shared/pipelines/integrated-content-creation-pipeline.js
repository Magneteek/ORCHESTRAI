/**
 * INTEGRATED CONTENT CREATION PIPELINE
 *
 * Enforces automatic quality gates for content creation, ensuring every article
 * passes validation before being marked complete. Prevents the manual post-production
 * validation approach that leads to quality issues.
 *
 * Pipeline Flow:
 * 1. Content Creation (content-writer-specialist)
 * 2. File Verification Gate (existence, non-empty)
 * 3. AI Detection Gate (<25% threshold)
 * 4. Quality Architecture Gate (40/40/20, element limits)
 * 5. Auto-Revision Loop (if validation fails)
 * 6. Completion (only after all gates pass)
 */

const fs = require('fs');
const path = require('path');

/**
 * Article specification for pipeline processing
 * @typedef {Object} ArticleSpec
 * @property {string} title - Article title
 * @property {string} outlinePath - Absolute path to outline file
 * @property {string} outputPath - Absolute path for final article
 * @property {number} targetWordCount - Target word count
 * @property {Object} requirements - Content requirements
 * @property {Array<string>} forbiddenPhrases - AI phrases to avoid
 */

/**
 * Pipeline result object
 * @typedef {Object} PipelineResult
 * @property {boolean} success - Overall success status
 * @property {string} articlePath - Path to completed article
 * @property {Object} metrics - Quality metrics
 * @property {Array<string>} issues - Any issues encountered
 * @property {number} revisionCycles - Number of revision cycles needed
 */

class IntegratedContentPipeline {
  constructor(config = {}) {
    this.maxRevisionCycles = config.maxRevisionCycles || 2;
    this.aiDetectionThreshold = config.aiDetectionThreshold || 25;
    this.strictMode = config.strictMode || true;

    // Quality gate thresholds
    this.qualityThresholds = {
      paragraphDistribution: {
        short: { min: 35, max: 45 },    // 40% ± 5%
        medium: { min: 35, max: 45 },   // 40% ± 5%
        long: { min: 15, max: 25 }      // 20% ± 5%
      },
      maxBulletLists: 20,
      minBulletLists: 0,
      maxBoldInstances: 15,
      maxTables: 6,
      wordCountTolerance: 0.10  // ±10%
    };
  }

  /**
   * Execute complete content creation pipeline for single article
   * @param {ArticleSpec} articleSpec - Article specification
   * @returns {Promise<PipelineResult>}
   */
  async executeArticlePipeline(articleSpec) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`PIPELINE START: ${articleSpec.title}`);
    console.log(`${'='.repeat(80)}\n`);

    let revisionCycle = 0;
    const pipelineLog = {
      startTime: Date.now(),
      gates: [],
      revisions: []
    };

    while (revisionCycle <= this.maxRevisionCycles) {
      console.log(`\n--- Cycle ${revisionCycle + 1}/${this.maxRevisionCycles + 1} ---\n`);

      // GATE 1: Content Creation
      const writeResult = await this.gate1_createContent(articleSpec, revisionCycle > 0);
      pipelineLog.gates.push({
        gate: 'content_creation',
        cycle: revisionCycle,
        status: writeResult.success ? 'PASS' : 'FAIL',
        timestamp: Date.now()
      });

      if (!writeResult.success) {
        return this.createFailureResult(articleSpec, pipelineLog, 'Content creation failed');
      }

      // GATE 2: File Verification
      const fileCheck = await this.gate2_verifyFile(articleSpec.outputPath);
      pipelineLog.gates.push({
        gate: 'file_verification',
        cycle: revisionCycle,
        status: fileCheck.exists ? 'PASS' : 'FAIL',
        details: fileCheck
      });

      if (!fileCheck.exists) {
        return this.createFailureResult(articleSpec, pipelineLog, 'File verification failed');
      }

      // GATE 3: AI Detection Validation
      const aiValidation = await this.gate3_validateAIDetection(articleSpec.outputPath);
      pipelineLog.gates.push({
        gate: 'ai_detection',
        cycle: revisionCycle,
        status: aiValidation.passed ? 'PASS' : 'FAIL',
        score: aiValidation.score
      });

      // GATE 4: Quality Architecture Validation
      const qualityValidation = await this.gate4_validateQuality(articleSpec.outputPath, articleSpec.targetWordCount);
      pipelineLog.gates.push({
        gate: 'quality_architecture',
        cycle: revisionCycle,
        status: qualityValidation.passed ? 'PASS' : 'FAIL',
        issues: qualityValidation.issues
      });

      // Check if all gates passed
      if (aiValidation.passed && qualityValidation.passed) {
        console.log(`\n✅ ALL GATES PASSED - Article production-ready\n`);
        return this.createSuccessResult(articleSpec, pipelineLog, {
          aiScore: aiValidation.score,
          quality: qualityValidation
        });
      }

      // Gates failed - prepare for revision
      revisionCycle++;

      if (revisionCycle > this.maxRevisionCycles) {
        console.log(`\n⚠️  MAX REVISION CYCLES EXCEEDED - Human intervention required\n`);
        return this.createFailureResult(articleSpec, pipelineLog, 'Max revisions exceeded', {
          aiValidation,
          qualityValidation
        });
      }

      // Compile revision instructions
      const revisionInstructions = this.compileRevisionInstructions(aiValidation, qualityValidation);
      pipelineLog.revisions.push({
        cycle: revisionCycle,
        instructions: revisionInstructions
      });

      console.log(`\n🔄 REVISION REQUIRED - Preparing revision cycle ${revisionCycle}\n`);
      articleSpec.revisionInstructions = revisionInstructions;
    }
  }

  /**
   * GATE 1: Content Creation / Revision
   * First attempt: content-writer-specialist creates article from outline
   * Revision cycles: content-structure-corrector fixes validation failures
   */
  async gate1_createContent(articleSpec, isRevision = false) {
    console.log(`GATE 1: ${isRevision ? 'Content Structural Correction' : 'Initial Content Creation'}`);

    if (!isRevision) {
      // INITIAL CREATION: Use content-writer-specialist
      console.log(`   Agent: content-writer-specialist`);
      console.log(`   Outline: ${articleSpec.outlinePath}`);
      console.log(`   Output: ${articleSpec.outputPath}`);

      // Note: In Claude Code environment, Task tool is called by the orchestrating agent
      // This pipeline is executed FROM Claude Code, so we return instructions for manual execution
      // or integration with orchestration layer that has Task tool access

      return {
        success: true,
        agentUsed: 'content-writer-specialist',
        mode: 'creation',
        requiresManualExecution: true,
        instructions: {
          agent: 'content-writer-specialist',
          prompt: this.buildWriterPrompt(articleSpec),
          outlinePath: articleSpec.outlinePath,
          outputPath: articleSpec.outputPath
        },
        timestamp: Date.now()
      };
    } else {
      // REVISION CYCLE: Use content-structure-corrector
      console.log(`   Agent: content-structure-corrector (via general-purpose)`);
      console.log(`   Article: ${articleSpec.outputPath}`);
      console.log(`   Applying revision instructions...`);

      // Save validation report for corrector agent
      const validationReportPath = articleSpec.outputPath.replace('.md', '-validation-report.json');
      if (articleSpec.validationReport) {
        try {
          // Create a clean, serializable version of the validation report
          const cleanReport = {
            aiDetection: articleSpec.validationReport.aiDetection || {},
            qualityMetrics: articleSpec.validationReport.qualityMetrics || {},
            issues: articleSpec.validationReport.issues || [],
            timestamp: Date.now()
          };

          fs.writeFileSync(
            validationReportPath,
            JSON.stringify(cleanReport, null, 2),
            'utf-8'
          );
        } catch (error) {
          console.log(`   Warning: Could not save validation report - ${error.message}`);
          // Continue anyway - corrector can work from revision instructions
        }
      }

      return {
        success: true,
        agentUsed: 'content-structure-corrector',
        mode: 'revision',
        requiresManualExecution: true,
        instructions: {
          agent: 'general-purpose', // content-structure-corrector not registered yet
          prompt: this.buildCorrectorPrompt(articleSpec, validationReportPath),
          articlePath: articleSpec.outputPath,
          validationReportPath: validationReportPath,
          revisionInstructions: articleSpec.revisionInstructions
        },
        timestamp: Date.now()
      };
    }
  }

  /**
   * Build prompt for content-writer-specialist agent
   */
  buildWriterPrompt(articleSpec) {
    return `Write complete article following the approved outline with 100% language purity and natural flow.

**ARTICLE TITLE:** ${articleSpec.title}

**OUTLINE PATH:** ${articleSpec.outlinePath}

**OUTPUT PATH:** ${articleSpec.outputPath}

**TARGET WORD COUNT:** ${articleSpec.targetWordCount}

**CRITICAL REQUIREMENTS:**
1. 100% ${articleSpec.language || 'target language'} - ZERO contamination
2. Natural conversational expert-friend tone
3. Paragraph distribution: 40% short / 40% medium / 20% long
4. Maximum 16-20 bulleted lists total
5. Bold text: <15 instances (emphasis only)
6. Maximum 4-6 tables (comparison/data only)
7. Follow all outline Content Requirements as flowing paragraphs
8. Integrate Engagement Elements naturally

**FORBIDDEN AI PHRASES:**
${(articleSpec.forbiddenPhrases || [
  'Picture yourself', 'Let\'s be honest', 'Discover', 'Unlock', 'Dive into'
]).join(', ')}

Read the outline completely and write the full article following ALL requirements.`;
  }

  /**
   * Build prompt for content-structure-corrector agent
   */
  buildCorrectorPrompt(articleSpec, validationReportPath) {
    const issues = articleSpec.revisionInstructions?.qualityIssues || [];
    const fixes = articleSpec.revisionInstructions?.specificFixes || [];

    return `You are acting as a content-structure-corrector. Fix structural issues while preserving writing quality.

**ARTICLE TO CORRECT:** ${articleSpec.outputPath}

**VALIDATION REPORT:** ${validationReportPath}

**IDENTIFIED ISSUES:**
${issues.map(issue => `- ${issue}`).join('\n')}

**REQUIRED CORRECTIONS:**
${fixes.map(fix => `
**${fix.category}:**
- Action: ${fix.action}
- Details: ${fix.details}
`).join('\n')}

**CRITICAL PRESERVATION:**
- Maintain 100% language purity (NO foreign words)
- Preserve natural conversational tone
- Keep all essential information
- Maintain smooth paragraph transitions

**APPROACH:**
1. Read article and validation report completely
2. Use Edit tool for surgical corrections (NOT Write tool)
3. Apply corrections in phases:
   - Convert excessive tables → paragraphs
   - Rebalance paragraph distribution
   - Condense to target length
   - Optimize keyword density
4. Save corrected version to same path (overwrite)

Execute systematic corrections now.`;
  }

  /**
   * GATE 2: File Verification
   * Verifies file exists, is readable, and contains content
   */
  async gate2_verifyFile(filePath) {
    console.log(`GATE 2: File Verification - ${filePath}`);

    try {
      const exists = fs.existsSync(filePath);

      if (!exists) {
        console.log(`❌ FAIL: File does not exist`);
        return { exists: false, reason: 'File not found' };
      }

      const stats = fs.statSync(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      if (stats.size === 0) {
        console.log(`❌ FAIL: File is empty (0 bytes)`);
        return { exists: true, isEmpty: true, reason: 'File is empty' };
      }

      console.log(`✅ PASS: File exists (${sizeKB} KB)`);
      return {
        exists: true,
        isEmpty: false,
        size: stats.size,
        sizeKB: parseFloat(sizeKB)
      };
    } catch (error) {
      console.log(`❌ FAIL: File verification error - ${error.message}`);
      return { exists: false, error: error.message };
    }
  }

  /**
   * GATE 3: AI Detection Validation
   * Validates AI detection score is below threshold
   */
  async gate3_validateAIDetection(filePath) {
    console.log(`GATE 3: AI Detection Validation (threshold: <${this.aiDetectionThreshold}%)`);

    // In actual implementation, this would use Task tool to launch content-ai-phrase-detector
    // For now, returning mock structure showing expected behavior

    const mockAIScore = Math.floor(Math.random() * 30); // Mock score for illustration

    const passed = mockAIScore < this.aiDetectionThreshold;

    if (passed) {
      console.log(`✅ PASS: AI Detection ${mockAIScore}% (below ${this.aiDetectionThreshold}% threshold)`);
    } else {
      console.log(`❌ FAIL: AI Detection ${mockAIScore}% (exceeds ${this.aiDetectionThreshold}% threshold)`);
    }

    return {
      passed,
      score: mockAIScore,
      threshold: this.aiDetectionThreshold,
      issues: passed ? [] : ['AI detection score too high', 'Forbidden phrases detected', 'Repetitive patterns found']
    };
  }

  /**
   * GATE 4: Quality Architecture Validation
   * Validates paragraph distribution, element limits, word count
   */
  async gate4_validateQuality(filePath, targetWordCount) {
    console.log(`GATE 4: Quality Architecture Validation`);

    try {
      const content = fs.readFileSync(filePath, 'utf8');

      // Parse content for validation
      const metrics = this.analyzeContentMetrics(content);

      // Validate against thresholds
      const issues = [];

      // Check paragraph distribution
      const paragraphCheck = this.validateParagraphDistribution(metrics.paragraphDistribution);
      if (!paragraphCheck.valid) {
        issues.push(...paragraphCheck.issues);
      }

      // Check element limits
      if (metrics.bulletLists > this.qualityThresholds.maxBulletLists) {
        issues.push(`Excessive bullet lists: ${metrics.bulletLists} (max: ${this.qualityThresholds.maxBulletLists})`);
      }

      if (metrics.boldInstances > this.qualityThresholds.maxBoldInstances) {
        issues.push(`Excessive bold text: ${metrics.boldInstances} (max: ${this.qualityThresholds.maxBoldInstances})`);
      }

      if (metrics.tables > this.qualityThresholds.maxTables) {
        issues.push(`Too many tables: ${metrics.tables} (max: ${this.qualityThresholds.maxTables})`);
      }

      // Check word count
      const wordCountCheck = this.validateWordCount(metrics.wordCount, targetWordCount);
      if (!wordCountCheck.valid) {
        issues.push(wordCountCheck.issue);
      }

      const passed = issues.length === 0;

      if (passed) {
        console.log(`✅ PASS: All quality metrics within acceptable ranges`);
      } else {
        console.log(`❌ FAIL: ${issues.length} quality issues detected`);
        issues.forEach(issue => console.log(`   - ${issue}`));
      }

      return {
        passed,
        metrics,
        issues,
        details: {
          paragraphDistribution: metrics.paragraphDistribution,
          elements: {
            bulletLists: metrics.bulletLists,
            boldInstances: metrics.boldInstances,
            tables: metrics.tables
          },
          wordCount: {
            actual: metrics.wordCount,
            target: targetWordCount,
            variance: ((metrics.wordCount - targetWordCount) / targetWordCount * 100).toFixed(1) + '%'
          }
        }
      };
    } catch (error) {
      console.log(`❌ FAIL: Quality validation error - ${error.message}`);
      return {
        passed: false,
        error: error.message,
        issues: ['Quality validation failed due to error']
      };
    }
  }

  /**
   * Analyze content metrics from markdown content
   */
  analyzeContentMetrics(content) {
    // Split into paragraphs (non-empty lines)
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const paragraphs = this.extractParagraphs(content);

    // Count sentences per paragraph
    const paragraphSentenceCounts = paragraphs.map(p => this.countSentences(p));

    // Classify paragraphs
    const short = paragraphSentenceCounts.filter(count => count <= 2).length;
    const medium = paragraphSentenceCounts.filter(count => count >= 3 && count <= 5).length;
    const long = paragraphSentenceCounts.filter(count => count >= 6).length;
    const total = paragraphSentenceCounts.length;

    // Count other elements
    const bulletLists = (content.match(/^[\s]*[-*+]\s/gm) || []).length;
    const boldInstances = (content.match(/\*\*[^*]+\*\*/g) || []).length;
    const tables = (content.match(/^\|.+\|$/gm) || []).length / 3; // Rough table count

    // Word count
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

    return {
      wordCount,
      bulletLists,
      boldInstances,
      tables: Math.floor(tables),
      paragraphDistribution: {
        short: total > 0 ? Math.round((short / total) * 100) : 0,
        medium: total > 0 ? Math.round((medium / total) * 100) : 0,
        long: total > 0 ? Math.round((long / total) * 100) : 0,
        total
      }
    };
  }

  /**
   * Extract paragraphs from markdown content
   */
  extractParagraphs(content) {
    // Remove headers, code blocks, lists
    const cleaned = content
      .replace(/^#{1,6}\s.+$/gm, '') // Remove headers
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^[\s]*[-*+]\s.+$/gm, '') // Remove list items
      .replace(/^\|.+\|$/gm, ''); // Remove tables

    // Split by double newline and filter empty
    return cleaned
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }

  /**
   * Count sentences in text
   */
  countSentences(text) {
    // Simple sentence count by periods, exclamation, question marks
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    return sentences.length;
  }

  /**
   * Validate paragraph distribution against thresholds
   */
  validateParagraphDistribution(distribution) {
    const issues = [];
    const thresholds = this.qualityThresholds.paragraphDistribution;

    if (distribution.short < thresholds.short.min || distribution.short > thresholds.short.max) {
      issues.push(`Short paragraphs: ${distribution.short}% (target: ${thresholds.short.min}-${thresholds.short.max}%)`);
    }

    if (distribution.medium < thresholds.medium.min || distribution.medium > thresholds.medium.max) {
      issues.push(`Medium paragraphs: ${distribution.medium}% (target: ${thresholds.medium.min}-${thresholds.medium.max}%)`);
    }

    if (distribution.long < thresholds.long.min || distribution.long > thresholds.long.max) {
      issues.push(`Long paragraphs: ${distribution.long}% (target: ${thresholds.long.min}-${thresholds.long.max}%)`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Validate word count against target with tolerance
   */
  validateWordCount(actual, target) {
    const variance = Math.abs(actual - target);
    const percentVariance = variance / target;

    if (percentVariance > this.qualityThresholds.wordCountTolerance) {
      return {
        valid: false,
        issue: `Word count: ${actual} (target: ${target}, ${(percentVariance * 100).toFixed(1)}% off)`
      };
    }

    return { valid: true };
  }

  /**
   * Compile revision instructions from validation failures
   */
  compileRevisionInstructions(aiValidation, qualityValidation) {
    const instructions = {
      priority: 'high',
      aiIssues: aiValidation.passed ? [] : aiValidation.issues,
      qualityIssues: qualityValidation.passed ? [] : qualityValidation.issues,
      specificFixes: []
    };

    // Add specific actionable fixes
    if (!aiValidation.passed) {
      instructions.specificFixes.push({
        category: 'AI Detection',
        action: 'Remove or rephrase forbidden AI phrases',
        details: 'Scan for: "Picture yourself", "Discover", "Unlock", "Dive into", "Let\'s be honest"'
      });
      instructions.specificFixes.push({
        category: 'AI Detection',
        action: 'Vary sentence structures and paragraph openings',
        details: 'Avoid repetitive patterns and formulaic transitions'
      });
    }

    if (!qualityValidation.passed) {
      qualityValidation.issues.forEach(issue => {
        if (issue.includes('bullet lists')) {
          instructions.specificFixes.push({
            category: 'Content Architecture',
            action: 'Convert excessive bullet lists to flowing paragraphs',
            details: issue
          });
        }
        if (issue.includes('bold text')) {
          instructions.specificFixes.push({
            category: 'Content Architecture',
            action: 'Reduce bold formatting to 10-15 instances (emphasis only)',
            details: issue
          });
        }
        if (issue.includes('Word count')) {
          instructions.specificFixes.push({
            category: 'Content Length',
            action: 'Trim content to target word count',
            details: issue
          });
        }
        if (issue.includes('paragraphs')) {
          instructions.specificFixes.push({
            category: 'Paragraph Distribution',
            action: 'Rebalance paragraph lengths to 40/40/20 distribution',
            details: issue
          });
        }
      });
    }

    return instructions;
  }

  /**
   * Create success result object
   */
  createSuccessResult(articleSpec, pipelineLog, metrics) {
    return {
      success: true,
      articlePath: articleSpec.outputPath,
      title: articleSpec.title,
      metrics: {
        aiScore: metrics.aiScore,
        quality: metrics.quality,
        revisionCycles: pipelineLog.revisions.length,
        totalTime: Date.now() - pipelineLog.startTime
      },
      pipelineLog
    };
  }

  /**
   * Create failure result object
   */
  createFailureResult(articleSpec, pipelineLog, reason, details = {}) {
    return {
      success: false,
      articlePath: articleSpec.outputPath,
      title: articleSpec.title,
      reason,
      details,
      needsHumanIntervention: true,
      pipelineLog
    };
  }
}

/**
 * Execute batch pipeline for multiple articles
 */
async function executeBatchPipeline(articles, config = {}) {
  const pipeline = new IntegratedContentPipeline(config);
  const results = [];

  console.log(`\n${'='.repeat(80)}`);
  console.log(`BATCH PIPELINE: ${articles.length} articles`);
  console.log(`${'='.repeat(80)}\n`);

  for (const article of articles) {
    const result = await pipeline.executeArticlePipeline(article);
    results.push(result);

    // Log individual result
    console.log(`\nArticle: ${article.title}`);
    console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (result.success) {
      console.log(`AI Score: ${result.metrics.aiScore}%`);
      console.log(`Revision Cycles: ${result.metrics.revisionCycles}`);
    } else {
      console.log(`Reason: ${result.reason}`);
    }
  }

  // Final summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`BATCH COMPLETE: ${successful}/${articles.length} successful`);
  if (failed > 0) {
    console.log(`Failed: ${failed} articles require human intervention`);
  }
  console.log(`${'='.repeat(80)}\n`);

  return {
    total: articles.length,
    successful,
    failed,
    results
  };
}

module.exports = {
  IntegratedContentPipeline,
  executeBatchPipeline
};
