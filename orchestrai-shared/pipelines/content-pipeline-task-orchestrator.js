#!/usr/bin/env node

/**
 * Content Pipeline Task Orchestrator
 *
 * Implements the integrated content pipeline using Claude Code's Task tool
 * to coordinate actual agent launches with quality gates enforced.
 *
 * This orchestrator bridges the abstract pipeline architecture to concrete
 * agent coordination, launching content-writer-specialist, content-ai-phrase-detector,
 * and content-quality-validator agents through the Task tool.
 */

const fs = require('fs').promises;
const path = require('path');

class ContentPipelineTaskOrchestrator {
  constructor(config = {}) {
    this.maxRevisionCycles = config.maxRevisionCycles || 2;
    this.aiDetectionThreshold = config.aiDetectionThreshold || 25;
    this.strictMode = config.strictMode !== false;
    this.verbose = config.verbose !== false;

    // Quality thresholds matching integrated-content-creation-pipeline.js
    this.qualityThresholds = config.qualityThresholds || {
      paragraphDistribution: {
        short: { min: 35, max: 45 },
        medium: { min: 35, max: 45 },
        long: { min: 15, max: 25 }
      },
      maxBulletLists: 20,
      maxBoldInstances: 15,
      maxTables: 6,
      wordCountTolerance: 0.10
    };
  }

  /**
   * GATE 0: Outline Verification & Approval (MANDATORY BLOCKING GATE)
   *
   * CRITICAL: Per CLAUDE.md mandatory workflow:
   * "Phase 3: Outline Approval (MANDATORY CHECKPOINT)"
   * "DO NOT proceed to writing without explicit approval"
   *
   * This gate:
   * 1. Verifies outline file exists
   * 2. Blocks until user confirms outline is approved
   * 3. Only allows progression after explicit user permission
   */
  async gate0_verifyAndApproveOutline(articleSpec) {
    this.log(`\n${'='.repeat(60)}`);
    this.log('GATE 0: Outline Verification & Approval (BLOCKING)');
    this.log('='.repeat(60));

    // Check if outline file exists
    try {
      const stats = await fs.stat(articleSpec.outlinePath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      this.log(`✅ Outline file exists: ${articleSpec.outlinePath}`);
      this.log(`   Size: ${sizeKB} KB`);

      return {
        passed: false, // Always requires user approval, even if file exists
        exists: true,
        path: articleSpec.outlinePath,
        sizeKB: parseFloat(sizeKB),
        requiresApproval: true,
        message: 'Outline exists but requires user approval before proceeding'
      };
    } catch (error) {
      this.log(`❌ Outline file NOT FOUND: ${articleSpec.outlinePath}`);
      this.log(`   Error: ${error.message}`);
      this.log(`\n⚠️  REQUIRED ACTION:`);
      this.log(`   1. Create comprehensive outline at: ${articleSpec.outlinePath}`);
      this.log(`   2. Follow CLAUDE.md mandatory workflow:`);
      this.log(`      - Phase 1: Research & Analysis`);
      this.log(`      - Phase 2: Outline Creation`);
      this.log(`      - Phase 3: Outline Approval (this gate)`);
      this.log(`   3. Return to pipeline after outline is created and approved`);

      return {
        passed: false,
        exists: false,
        path: articleSpec.outlinePath,
        error: error.message,
        requiresCreation: true,
        message: 'Outline must be created before proceeding to writing'
      };
    }
  }

  /**
   * GATE 1: Launch Content Writer Agent
   *
   * Launches content-writer-specialist through Task tool with comprehensive instructions
   */
  async gate1_launchContentWriter(articleSpec, isRevision = false) {
    this.log(`\n${'='.repeat(60)}`);
    this.log(`GATE 1: Content Creation${isRevision ? ' (REVISION)' : ''}`);
    this.log('='.repeat(60));

    const promptMode = isRevision ? 'REVISION MODE' : 'CREATION MODE';

    const agentPrompt = this.buildWriterPrompt(articleSpec, isRevision);

    this.log(`Launching content-writer-specialist agent...`);
    this.log(`Mode: ${promptMode}`);
    this.log(`Output: ${articleSpec.outputPath}`);

    // In Claude Code environment, this would use the Task tool
    // For now, return a structure that indicates how to launch
    return {
      agentType: 'content-writer-specialist',
      prompt: agentPrompt,
      expectedOutput: articleSpec.outputPath,
      launchInstruction: 'USE_TASK_TOOL',
      timestamp: Date.now()
    };
  }

  /**
   * Build comprehensive prompt for content writer agent
   */
  buildWriterPrompt(articleSpec, isRevision) {
    const baseInstructions = `
${isRevision ? '=== REVISION TASK ===' : '=== CONTENT CREATION TASK ==='}

**Article Title**: ${articleSpec.title}
**Target Word Count**: ${articleSpec.targetWordCount} words (±10% tolerance)
**Output Path**: ${articleSpec.outputPath}
**Outline Path**: ${articleSpec.outlinePath}

${isRevision ? this.buildRevisionInstructions(articleSpec) : this.buildCreationInstructions(articleSpec)}

**MANDATORY QUALITY STANDARDS**:

1. **Paragraph Distribution (40/40/20 Rule)**:
   - 40% Short paragraphs (1-2 sentences)
   - 40% Medium paragraphs (3-5 sentences)
   - 20% Long paragraphs (6+ sentences)

2. **Content Architecture Limits**:
   - Maximum 20 bullet lists total
   - Maximum 15 bold text instances (emphasis only)
   - Maximum 6 tables
   - Bold text: DO NOT use for structural headings or paragraph starters

3. **Natural Writing Flow**:
   - Conversational tone throughout
   - Smooth transitions between paragraphs
   - Varied sentence structures
   - Reader-centric language (address reader directly)

4. **AI Detection Prevention**:
   - Avoid forbidden phrases: "Picture yourself", "Let's be honest", "Discover", "Unlock"
   - No repetitive section openings
   - Use specific details over generic superlatives
   - Include realistic scenarios and examples

**File Output Requirements**:
- Write final article to: ${articleSpec.outputPath}
- Ensure file is created successfully
- Verify file contains complete article before reporting success

${this.buildForbiddenPhrasesSection()}

**SUCCESS CRITERIA**:
- Article written to correct path
- Word count within target ±10%
- All quality standards met
- Natural, conversational flow maintained
- AI detection risk minimized
`;

    return baseInstructions.trim();
  }

  buildCreationInstructions(articleSpec) {
    return `
**Your Task**: Read the comprehensive outline at ${articleSpec.outlinePath} and create a complete, high-quality article following all requirements.

**Workflow**:
1. Read the outline file to understand structure and requirements
2. Write article following outline guidance
3. Ensure natural conversational flow throughout
4. Implement proper paragraph distribution
5. Maintain content architecture limits
6. Write complete article to output path
7. Verify file creation before completion
`;
  }

  buildRevisionInstructions(articleSpec) {
    if (!articleSpec.revisionInstructions) {
      return '**No specific revision instructions provided - perform general quality improvement**';
    }

    const instructions = articleSpec.revisionInstructions;
    let revisionPrompt = `
**REVISION REQUIRED**: The article at ${articleSpec.outputPath} failed quality validation.

**Issues to Fix**:
`;

    if (instructions.aiIssues && instructions.aiIssues.length > 0) {
      revisionPrompt += `\n**AI Detection Issues**:\n`;
      instructions.aiIssues.forEach(issue => {
        revisionPrompt += `- ${issue}\n`;
      });
    }

    if (instructions.qualityIssues && instructions.qualityIssues.length > 0) {
      revisionPrompt += `\n**Quality Architecture Issues**:\n`;
      instructions.qualityIssues.forEach(issue => {
        revisionPrompt += `- ${issue}\n`;
      });
    }

    if (instructions.specificFixes && instructions.specificFixes.length > 0) {
      revisionPrompt += `\n**Specific Fixes Required**:\n`;
      instructions.specificFixes.forEach(fix => {
        revisionPrompt += `\n**${fix.category}**: ${fix.action}\n`;
        revisionPrompt += `   Details: ${fix.details}\n`;
      });
    }

    revisionPrompt += `
**Your Task**:
1. Read the existing article at ${articleSpec.outputPath}
2. Apply the specific fixes listed above
3. Maintain the article's core content and message
4. Make targeted corrections, not complete rewrites
5. Ensure all quality standards are met
6. Save the revised article to the same path
`;

    return revisionPrompt;
  }

  buildForbiddenPhrasesSection() {
    return `
**FORBIDDEN AI PHRASES** (DO NOT USE):
- "Picture yourself"
- "Let's be honest"
- "If you've ever dreamed of"
- "Here's what makes [X] special"
- "Discover the magic of"
- "Unlock the secrets of"
- "Embark on a journey"
- "Nestled in"
- "Hidden gem"

**Pattern Avoidance**:
- Don't start multiple sections with questions
- Avoid repetitive "But here's the thing..." transitions
- Don't use weak intensifiers like "very", "really", "quite"
- Replace generic superlatives with specific details
`;
  }

  /**
   * GATE 2: Verify File Exists
   *
   * Critical gate that catches silent failures - agents can report success
   * even when file write fails
   */
  async gate2_verifyFile(filePath) {
    this.log(`\n${'='.repeat(60)}`);
    this.log('GATE 2: File Verification');
    this.log('='.repeat(60));

    try {
      const stats = await fs.stat(filePath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      this.log(`✅ File exists: ${filePath}`);
      this.log(`   Size: ${sizeKB} KB`);

      return {
        passed: true,
        exists: true,
        path: filePath,
        sizeKB: parseFloat(sizeKB),
        sizeBytes: stats.size
      };
    } catch (error) {
      this.log(`❌ File verification FAILED: ${filePath}`);
      this.log(`   Error: ${error.message}`);

      return {
        passed: false,
        exists: false,
        path: filePath,
        error: error.message
      };
    }
  }

  /**
   * GATE 3: Launch AI Detection Agent
   *
   * Validates content for AI-generated phrase patterns
   */
  async gate3_launchAIDetector(filePath) {
    this.log(`\n${'='.repeat(60)}`);
    this.log('GATE 3: AI Detection Validation');
    this.log('='.repeat(60));

    const agentPrompt = `
**AI Detection Analysis Task**

Analyze the article at: ${filePath}

**Your Task**:
1. Scan the entire article for forbidden AI phrases
2. Identify repetitive patterns that signal AI generation
3. Check for weak intensifiers and generic superlatives
4. Calculate overall AI detection risk score (0-100%)
5. Provide specific examples of detected patterns

**Forbidden Phrases to Check**:
${this.buildForbiddenPhrasesSection()}

**Output Format**:
Provide a JSON-formatted response with:
- detectionScore: number (0-100, percentage of AI-like content)
- passed: boolean (true if score < ${this.aiDetectionThreshold}%)
- detectedPhrases: array of specific phrases found
- patternIssues: array of repetitive patterns identified
- recommendations: array of specific improvements

**Success Threshold**: AI detection score must be <${this.aiDetectionThreshold}% to pass
**Ideal Range**: 15-25% (human-like detection level)
`;

    this.log(`Launching content-ai-phrase-detector agent...`);
    this.log(`Target: ${filePath}`);
    this.log(`Threshold: <${this.aiDetectionThreshold}%`);

    return {
      agentType: 'content-ai-phrase-detector',
      prompt: agentPrompt,
      targetFile: filePath,
      threshold: this.aiDetectionThreshold,
      launchInstruction: 'USE_TASK_TOOL',
      timestamp: Date.now()
    };
  }

  /**
   * GATE 4: Launch Quality Validator Agent
   *
   * Validates content architecture and quality standards
   */
  async gate4_launchQualityValidator(filePath, targetWordCount) {
    this.log(`\n${'='.repeat(60)}`);
    this.log('GATE 4: Quality Architecture Validation');
    this.log('='.repeat(60));

    const agentPrompt = `
**Quality Architecture Validation Task**

Analyze the article at: ${filePath}

**Your Task**:
Perform comprehensive quality validation against these standards:

**1. Paragraph Distribution (40/40/20 Rule)**:
   - Count all paragraphs in the article
   - Categorize each by length:
     * Short: 1-2 sentences
     * Medium: 3-5 sentences
     * Long: 6+ sentences
   - Calculate percentages
   - **Pass Criteria**:
     * Short: 35-45% (target 40%)
     * Medium: 35-45% (target 40%)
     * Long: 15-25% (target 20%)

**2. Content Architecture Limits**:
   - Count bullet lists: Maximum ${this.qualityThresholds.maxBulletLists}
   - Count bold text instances: Maximum ${this.qualityThresholds.maxBoldInstances}
   - Count tables: Maximum ${this.qualityThresholds.maxTables}
   - Bold text audit: Should be emphasis only, NOT structural headings

**3. Word Count Validation**:
   - Target: ${targetWordCount} words
   - Tolerance: ±${this.qualityThresholds.wordCountTolerance * 100}%
   - Acceptable range: ${Math.floor(targetWordCount * (1 - this.qualityThresholds.wordCountTolerance))} - ${Math.ceil(targetWordCount * (1 + this.qualityThresholds.wordCountTolerance))} words

**4. Content Quality**:
   - Natural flow and transitions
   - Conversational tone
   - Reader engagement
   - Structural variety

**Output Format**:
Provide a JSON-formatted response with:
- passed: boolean (true only if ALL criteria met)
- paragraphDistribution: { short: %, medium: %, long: % }
- elements: { bulletLists: number, boldInstances: number, tables: number }
- wordCount: { actual: number, target: number, variance: "±X%" }
- issues: array of specific problems found
- recommendations: array of specific fixes needed

**Pass Criteria**: ALL metrics must be within acceptable ranges
`;

    this.log(`Launching content-quality-validator agent...`);
    this.log(`Target: ${filePath}`);
    this.log(`Word Count Target: ${targetWordCount} (±${this.qualityThresholds.wordCountTolerance * 100}%)`);

    return {
      agentType: 'content-quality-validator',
      prompt: agentPrompt,
      targetFile: filePath,
      targetWordCount: targetWordCount,
      thresholds: this.qualityThresholds,
      launchInstruction: 'USE_TASK_TOOL',
      timestamp: Date.now()
    };
  }

  /**
   * Execute complete pipeline for a single article
   *
   * This is the main orchestration method that coordinates all gates
   */
  async executePipeline(articleSpec) {
    this.log('\n' + '█'.repeat(80));
    this.log(`   PIPELINE EXECUTION: ${articleSpec.title}`);
    this.log('█'.repeat(80));

    const pipelineLog = {
      article: articleSpec.title,
      startTime: Date.now(),
      gates: [],
      revisions: []
    };

    // GATE 0: Outline Verification & Approval (MANDATORY BLOCKING GATE)
    // This runs ONCE before any content creation begins
    const outlineCheck = await this.gate0_verifyAndApproveOutline(articleSpec);
    pipelineLog.gates.push({
      gate: 'outline_verification',
      passed: outlineCheck.exists,
      requiresApproval: outlineCheck.requiresApproval || false,
      requiresCreation: outlineCheck.requiresCreation || false,
      details: outlineCheck
    });

    // If outline doesn't exist, stop immediately
    if (!outlineCheck.exists) {
      this.log('\n❌ PIPELINE STOPPED: Outline does not exist');
      this.log('   Create outline first, then restart pipeline');
      return {
        success: false,
        reason: 'Outline does not exist',
        details: outlineCheck,
        pipelineLog
      };
    }

    // If outline exists but requires approval, wait for user confirmation
    if (outlineCheck.requiresApproval) {
      this.log('\n⚠️  MANDATORY CHECKPOINT: Outline Approval Required');
      this.log('='.repeat(60));
      this.log('Per CLAUDE.md: "DO NOT proceed to writing without explicit approval"');
      this.log('\nOutline Details:');
      this.log(`   Path: ${outlineCheck.path}`);
      this.log(`   Size: ${outlineCheck.sizeKB} KB`);
      this.log('\n📋 ACTION REQUIRED:');
      this.log('   1. Review the outline at the path above');
      this.log('   2. Verify all requirements are met:');
      this.log('      - Psychographic integration specified');
      this.log('      - Keyword mapping defined');
      this.log('      - Word count planning for each section');
      this.log('      - Internal linking architecture planned');
      this.log('      - CTA strategy defined per psychographic segment');
      this.log('\n   3. Confirm approval to proceed to writing');
      this.log('='.repeat(60));
      this.log('\n⏸️  PIPELINE PAUSED - Awaiting user approval...');

      // Return status indicating user approval is needed
      return {
        pipelineStatus: 'AWAITING_OUTLINE_APPROVAL',
        outlineCheck: outlineCheck,
        nextAction: 'User must approve outline before pipeline continues',
        pipelineLog
      };
    }

    let revisionCycle = 0;

    while (revisionCycle <= this.maxRevisionCycles) {
      this.log(`\n${'▓'.repeat(80)}`);
      this.log(`   ${revisionCycle === 0 ? 'INITIAL CREATION' : `REVISION CYCLE ${revisionCycle}`}`);
      this.log('▓'.repeat(80));

      // GATE 1: Content Creation
      const writerLaunch = await this.gate1_launchContentWriter(articleSpec, revisionCycle > 0);
      pipelineLog.gates.push({
        gate: 'content_creation',
        cycle: revisionCycle,
        timestamp: writerLaunch.timestamp,
        agentType: writerLaunch.agentType
      });

      // ⚠️ MANUAL STEP: User must launch this agent via Task tool
      this.log(`\n⚠️  ACTION REQUIRED: Launch agent via Task tool`);
      this.log(`    Agent: ${writerLaunch.agentType}`);
      this.log(`    Prompt prepared and ready`);
      this.log(`\n    After agent completes, press ENTER to continue with validation...`);

      // GATE 2: File Verification
      const fileCheck = await this.gate2_verifyFile(articleSpec.outputPath);
      pipelineLog.gates.push({
        gate: 'file_verification',
        cycle: revisionCycle,
        passed: fileCheck.passed,
        details: fileCheck
      });

      if (!fileCheck.passed) {
        this.log('\n❌ PIPELINE FAILED: File verification failed');
        return {
          success: false,
          reason: 'File verification failed',
          details: fileCheck,
          pipelineLog
        };
      }

      // GATE 3: AI Detection
      const aiDetectorLaunch = await this.gate3_launchAIDetector(articleSpec.outputPath);
      pipelineLog.gates.push({
        gate: 'ai_detection',
        cycle: revisionCycle,
        timestamp: aiDetectorLaunch.timestamp,
        agentType: aiDetectorLaunch.agentType
      });

      this.log(`\n⚠️  ACTION REQUIRED: Launch agent via Task tool`);
      this.log(`    Agent: ${aiDetectorLaunch.agentType}`);
      this.log(`    Prompt prepared and ready`);
      this.log(`\n    After agent completes, press ENTER to continue...`);

      // GATE 4: Quality Validation
      const qualityValidatorLaunch = await this.gate4_launchQualityValidator(
        articleSpec.outputPath,
        articleSpec.targetWordCount
      );
      pipelineLog.gates.push({
        gate: 'quality_validation',
        cycle: revisionCycle,
        timestamp: qualityValidatorLaunch.timestamp,
        agentType: qualityValidatorLaunch.agentType
      });

      this.log(`\n⚠️  ACTION REQUIRED: Launch agent via Task tool`);
      this.log(`    Agent: ${qualityValidatorLaunch.agentType}`);
      this.log(`    Prompt prepared and ready`);
      this.log(`\n    After agent completes, provide validation results...`);

      // ⚠️ In production, this would parse actual agent responses
      // For now, return the launch instructions for manual execution
      return {
        pipelineStatus: 'AWAITING_VALIDATION',
        currentCycle: revisionCycle,
        completedGates: ['content_creation', 'file_verification'],
        pendingGates: ['ai_detection', 'quality_validation'],
        agentLaunchInstructions: {
          aiDetector: aiDetectorLaunch,
          qualityValidator: qualityValidatorLaunch
        },
        pipelineLog
      };
    }
  }

  /**
   * Compile revision instructions based on validation failures
   */
  compileRevisionInstructions(aiValidationResult, qualityValidationResult) {
    const instructions = {
      aiIssues: [],
      qualityIssues: [],
      specificFixes: []
    };

    // AI Detection issues
    if (!aiValidationResult.passed) {
      instructions.aiIssues.push(
        `AI detection score: ${aiValidationResult.score}% (threshold: <${this.aiDetectionThreshold}%)`
      );

      if (aiValidationResult.detectedPhrases && aiValidationResult.detectedPhrases.length > 0) {
        instructions.specificFixes.push({
          category: 'AI Detection',
          action: 'Remove or rewrite forbidden phrases',
          details: `Found: ${aiValidationResult.detectedPhrases.join(', ')}`
        });
      }

      if (aiValidationResult.patternIssues && aiValidationResult.patternIssues.length > 0) {
        instructions.specificFixes.push({
          category: 'AI Detection',
          action: 'Break repetitive patterns',
          details: aiValidationResult.patternIssues.join('; ')
        });
      }
    }

    // Quality Architecture issues
    if (!qualityValidationResult.passed) {
      qualityValidationResult.issues.forEach(issue => {
        instructions.qualityIssues.push(issue);
      });

      // Specific fixes based on metrics
      const pd = qualityValidationResult.paragraphDistribution;
      if (pd.short < 35 || pd.short > 45 || pd.medium < 35 || pd.medium > 45 || pd.long < 15 || pd.long > 25) {
        instructions.specificFixes.push({
          category: 'Paragraph Distribution',
          action: 'Adjust paragraph lengths to meet 40/40/20 distribution',
          details: `Current: ${pd.short}% short, ${pd.medium}% medium, ${pd.long}% long. ` +
                  `Target: 40% short (1-2 sentences), 40% medium (3-5 sentences), 20% long (6+ sentences)`
        });
      }

      if (qualityValidationResult.elements.bulletLists > this.qualityThresholds.maxBulletLists) {
        instructions.specificFixes.push({
          category: 'Content Architecture',
          action: `Reduce bullet lists from ${qualityValidationResult.elements.bulletLists} to maximum ${this.qualityThresholds.maxBulletLists}`,
          details: 'Convert some lists to flowing paragraph text'
        });
      }

      if (qualityValidationResult.elements.boldInstances > this.qualityThresholds.maxBoldInstances) {
        instructions.specificFixes.push({
          category: 'Content Architecture',
          action: `Reduce bold text from ${qualityValidationResult.elements.boldInstances} to maximum ${this.qualityThresholds.maxBoldInstances}`,
          details: 'Use bold only for true emphasis, not structural headings'
        });
      }
    }

    return instructions;
  }

  log(message) {
    if (this.verbose) {
      console.log(message);
    }
  }
}

/**
 * Usage Example: How to use this orchestrator with Claude Code Task tool
 */
async function demonstrateUsage() {
  console.log('\n' + '█'.repeat(80));
  console.log('   CONTENT PIPELINE TASK ORCHESTRATOR - USAGE DEMONSTRATION');
  console.log('█'.repeat(80));

  const orchestrator = new ContentPipelineTaskOrchestrator({
    maxRevisionCycles: 2,
    aiDetectionThreshold: 25,
    strictMode: true,
    verbose: true
  });

  const articleSpec = {
    title: 'Example Article',
    outlinePath: '/path/to/outline.md',
    outputPath: '/path/to/output.md',
    targetWordCount: 1800
  };

  console.log('\nPipeline Flow:');
  console.log('-'.repeat(60));
  console.log('1. Orchestrator prepares agent prompts');
  console.log('2. User launches agents via Task tool with provided prompts');
  console.log('3. Orchestrator validates outputs at each gate');
  console.log('4. If validation fails, revision instructions are compiled');
  console.log('5. Process repeats until all gates pass or max cycles reached');
  console.log('\n' + '█'.repeat(80) + '\n');
}

if (require.main === module) {
  demonstrateUsage().catch(console.error);
}

module.exports = {
  ContentPipelineTaskOrchestrator
};
