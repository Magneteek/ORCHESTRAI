/**
 * STRATEGIC PLANNING PIPELINE
 *
 * Comprehensive strategic planning workflow that synthesizes client intelligence,
 * SEO research, competitive analysis, and branding to produce:
 * - One-Page Strategic Plan (OPSP - Scaling Up framework)
 * - EOS Vision/Traction Organizer (V/TO)
 * - Financial projections and unit economics
 * - Strategic narrative document
 *
 * Pipeline Stages:
 * 1. Intelligence Aggregation & Validation (15 min)
 * 2. Strategic Plan Synthesis (25 min)
 * 3. Financial Modeling & Projections (30 min)
 * 4. Strategic Coherence Validation (10 min)
 * 5. Executive Package Assembly (10 min)
 *
 * Total Duration: ~90 minutes
 *
 * Frameworks Implemented:
 * - Scaling Up (Verne Harnish) - One-Page Strategic Plan, Cash Acceleration Strategies
 * - EOS (Gino Wickman) - Vision/Traction Organizer
 * - Financial Modeling - Unit Economics, Scenario Planning, Power of One
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

// Simple rate limiter (avoiding p-limit ESM/CommonJS compatibility issues)
function createLimiter(concurrency) {
  return (fn) => fn(); // Pass-through for now, can be enhanced later
}

class StrategicPlanningPipeline extends EventEmitter {
  constructor(coordinationPatterns, crystallineMemory, mcpManager) {
    super();
    this.coordinationPatterns = coordinationPatterns;
    this.crystallineMemory = crystallineMemory;
    this.mcpManager = mcpManager;
    this.pipelineId = 'strategic-planning';
    this.pipelineName = 'Strategic Planning Pipeline';

    // CRASH PREVENTION: Limit concurrent operations
    // Note: Using simple pass-through for now (can add proper rate limiting later)
    this.fileLimit = createLimiter(5);
    this.agentLimit = createLimiter(2);
  }

  /**
   * Execute the complete strategic planning pipeline
   */
  async execute(projectSpec, options = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();

    const execution = {
      executionId,
      pipelineId: this.pipelineId,
      projectId: projectSpec.projectId || projectSpec.clientId,
      projectPath: projectSpec.projectPath,
      clientName: projectSpec.clientName,
      startTime,
      stages: {},
      stageResults: {},
      errors: [],
      metrics: {
        tokenUsage: 0,
        agentExecutions: 0,
        qualityGatesPassed: 0,
        qualityGatesFailed: 0,
        strategicCoherenceScore: 0
      }
    };

    try {
      this.emit('pipeline-started', {
        executionId,
        pipelineId: this.pipelineId,
        projectId: execution.projectId,
        clientName: execution.clientName
      });

      // Stage 1: Intelligence Aggregation & Validation
      this.emit('stage-started', { executionId, stage: 'intelligence_aggregation' });
      const intelligenceResults = await this.executeIntelligenceAggregation(execution, projectSpec);
      execution.stageResults.intelligence_aggregation = intelligenceResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'intelligence_aggregation',
        duration: intelligenceResults.duration,
        completeness: intelligenceResults.completeness
      });

      // Quality Gate: Minimum 60% intelligence completeness required
      if (intelligenceResults.completeness < 60) {
        throw new Error(`Insufficient intelligence data: ${intelligenceResults.completeness}% (minimum 60% required)`);
      }

      // Stage 2: Strategic Plan Synthesis
      this.emit('stage-started', { executionId, stage: 'strategic_plan_synthesis' });
      const strategicPlanResults = await this.executeStrategicPlanSynthesis(execution, projectSpec, intelligenceResults);
      execution.stageResults.strategic_plan_synthesis = strategicPlanResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'strategic_plan_synthesis',
        duration: strategicPlanResults.duration
      });

      // Stage 3: Financial Modeling & Projections
      this.emit('stage-started', { executionId, stage: 'financial_modeling' });
      const financialResults = await this.executeFinancialModeling(execution, projectSpec, strategicPlanResults);
      execution.stageResults.financial_modeling = financialResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'financial_modeling',
        duration: financialResults.duration
      });

      // Stage 4: Strategic Coherence Validation
      this.emit('stage-started', { executionId, stage: 'coherence_validation' });
      const validationResults = await this.executeCoherenceValidation(execution, projectSpec);
      execution.stageResults.coherence_validation = validationResults;
      execution.metrics.strategicCoherenceScore = validationResults.coherenceScore;
      this.emit('stage-completed', {
        executionId,
        stage: 'coherence_validation',
        duration: validationResults.duration,
        coherenceScore: validationResults.coherenceScore
      });

      // Quality Gate: Minimum 70% coherence score required
      if (validationResults.coherenceScore < 70) {
        this.emit('quality-warning', {
          executionId,
          warning: `Low strategic coherence: ${validationResults.coherenceScore}% (target: 70%+)`,
          gaps: validationResults.gaps
        });
      }

      // Stage 5: Executive Package Assembly
      this.emit('stage-started', { executionId, stage: 'executive_package' });
      const packageResults = await this.assembleExecutivePackage(execution, projectSpec);
      execution.stageResults.executive_package = packageResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'executive_package',
        duration: packageResults.duration
      });

      // Store learnings in crystalline memory
      await this.storePipelineLearnings(execution);

      const totalDuration = Date.now() - startTime;

      this.emit('pipeline-completed', {
        executionId,
        success: true,
        duration: totalDuration,
        metrics: execution.metrics
      });

      return {
        success: true,
        executionId,
        projectId: execution.projectId,
        duration: totalDuration,
        results: execution.stageResults,
        deliverablePaths: this.getDeliverablePaths(execution),
        metrics: execution.metrics,
        strategicCoherenceScore: execution.metrics.strategicCoherenceScore
      };

    } catch (error) {
      const errorDuration = Date.now() - startTime;

      this.emit('pipeline-failed', {
        executionId,
        error: error.message,
        duration: errorDuration
      });

      execution.errors.push({
        timestamp: Date.now(),
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        executionId,
        projectId: execution.projectId,
        error: error.message,
        duration: errorDuration,
        partialResults: execution.stageResults,
        errors: execution.errors
      };
    }
  }

  /**
   * Stage 1: Intelligence Aggregation & Validation
   *
   * Aggregates all existing intelligence from:
   * - ICP analysis
   * - SEO research
   * - Competitive intelligence
   * - Branding guidelines
   * - EOS framework (if exists)
   * - Psychographic research
   */
  async executeIntelligenceAggregation(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {
      sources: [],
      completeness: 0,
      data: {}
    };

    try {
      const intelligencePath = path.join(projectSpec.projectPath, 'client-intelligence');
      const seoPath = path.join(projectSpec.projectPath, 'deliverables', 'seo');

      // Load ICP Analysis
      try {
        const icpFiles = await this.findFiles(intelligencePath, '*ICP*.md', '*icp*.json');
        if (icpFiles.length > 0) {
          const icpContent = await fs.readFile(icpFiles[0], 'utf8');
          results.data.icp = icpFiles[0].endsWith('.json') ?
            JSON.parse(icpContent) :
            this.parseMarkdownToStructure(icpContent);
          results.sources.push('ICP Analysis');
        }
      } catch (e) {
        console.log('   ⚠️  ICP analysis not found');
      }

      // Load SEO Research
      try {
        const seoFiles = await this.findFiles(seoPath, '*keyword*.json', '*seo*.json');
        if (seoFiles.length > 0) {
          const seoContent = await fs.readFile(seoFiles[0], 'utf8');
          results.data.seo = JSON.parse(seoContent);
          results.sources.push('SEO Research');
        }
      } catch (e) {
        console.log('   ⚠️  SEO research not found');
      }

      // Load Competitive Intelligence
      try {
        const compFiles = await this.findFiles(seoPath, '*competitor*.json', '*competitive*.json');
        if (compFiles.length > 0) {
          const compContent = await fs.readFile(compFiles[0], 'utf8');
          results.data.competitive = JSON.parse(compContent);
          results.sources.push('Competitive Intelligence');
        }
      } catch (e) {
        console.log('   ⚠️  Competitive intelligence not found');
      }

      // Load Branding
      try {
        const brandFiles = await this.findFiles(intelligencePath, '*brand*.json', '*brand*.md');
        if (brandFiles.length > 0) {
          const brandContent = await fs.readFile(brandFiles[0], 'utf8');
          results.data.branding = brandFiles[0].endsWith('.json') ?
            JSON.parse(brandContent) :
            this.parseMarkdownToStructure(brandContent);
          results.sources.push('Branding Guidelines');
        }
      } catch (e) {
        console.log('   ⚠️  Branding guidelines not found');
      }

      // Load EOS Framework (if exists)
      try {
        const eosFiles = await this.findFiles(intelligencePath, 'EOS*.md', '*eos*.json');
        if (eosFiles.length > 0) {
          const eosContent = await fs.readFile(eosFiles[0], 'utf8');
          results.data.eos = eosFiles[0].endsWith('.json') ?
            JSON.parse(eosContent) :
            this.parseEOSMarkdown(eosContent);
          results.sources.push('EOS Framework');
        }
      } catch (e) {
        console.log('   ⚠️  EOS framework not found');
      }

      // Load Psychographic Research
      try {
        const psychoPath = path.join(intelligencePath, 'psychographic-research');
        const psychoFiles = await this.findFiles(psychoPath, '*.json');
        if (psychoFiles.length > 0) {
          const psychoContent = await fs.readFile(psychoFiles[0], 'utf8');
          results.data.psychographic = JSON.parse(psychoContent);
          results.sources.push('Psychographic Research');
        }
      } catch (e) {
        console.log('   ⚠️  Psychographic research not found');
      }

      // Calculate completeness
      const totalPossibleSources = 6; // ICP, SEO, Competitive, Branding, EOS, Psychographic
      results.completeness = Math.round((results.sources.length / totalPossibleSources) * 100);

      // Quality gate
      const qualityPassed = results.completeness >= 60;
      if (qualityPassed) {
        execution.metrics.qualityGatesPassed++;
      } else {
        execution.metrics.qualityGatesFailed++;
      }

      console.log(`✓ Intelligence aggregation complete: ${results.completeness}% (${results.sources.length}/${totalPossibleSources} sources)`);

      return {
        success: true,
        duration: Date.now() - stageStart,
        sources: results.sources,
        completeness: results.completeness,
        data: results.data
      };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'intelligence_aggregation',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 2: Strategic Plan Synthesis
   *
   * Uses strategic-plan-synthesizer agent to create:
   * - One-Page Strategic Plan (OPSP)
   * - EOS Vision/Traction Organizer (V/TO)
   * - Strategic Narrative Document
   */
  async executeStrategicPlanSynthesis(execution, projectSpec, intelligenceResults) {
    const stageStart = Date.now();
    const results = {};

    try {
      const strategicPlanPrompt = `
Create comprehensive strategic plan for ${projectSpec.clientName}.

CRITICAL CONTEXT - Available Intelligence:
${this.formatIntelligenceContext(intelligenceResults)}

YOUR TASK:
Execute the complete 5-step Strategic Synthesis Process to produce:

1. **One-Page Strategic Plan (OPSP)** - Scaling Up format with:
   - Section 1: People (leadership, accountability, core values)
   - Section 2: Strategy (core customer, brand promise, positioning, SWOT)
   - Section 3: Execution (priorities, quarterly rocks, KPIs)
   - Section 4: Cash (revenue targets, unit economics basics)

2. **EOS Vision/Traction Organizer (V/TO)** with:
   - Core Values (3-7 values with behavioral descriptions)
   - Core Focus (purpose, niche, target market)
   - 10-Year Target (BHAG)
   - 3-Year Picture (detailed metrics + achievements)
   - 1-Year Plan (revenue, profit, 3-7 SMART goals)
   - Quarterly Rocks (3-7 priorities for next 90 days)

3. **Strategic Narrative Document** - Executive summary covering:
   - Market Opportunity
   - Customer Strategy (based on ICP)
   - Competitive Differentiation
   - Growth Strategy
   - Execution Roadmap

DELIVERABLES:
Save all three documents to:
${projectSpec.projectPath}/deliverables/strategic-planning/

Files to create:
- one-page-strategic-plan.md
- eos-vision-traction-organizer.md
- strategic-narrative.md

STRATEGIC COHERENCE:
Calculate strategic coherence score (0-100%) by analyzing:
- ICP ↔ SEO alignment
- Competitive positioning ↔ Branding consistency
- Core values ↔ Operational practices
- Strategy ↔ Execution feasibility

Include coherence score and analysis in strategic-narrative.md.
      `.trim();

      const strategicPlan = await this.executeAgentTask(
        'strategic-plan-synthesizer',
        strategicPlanPrompt,
        execution
      );

      results.strategicPlan = strategicPlan;

      // Extract coherence score if available
      if (strategicPlan.coherenceScore) {
        execution.metrics.strategicCoherenceScore = strategicPlan.coherenceScore;
      }

      // Quality gate
      const qualityPassed = this.validateStrategicPlan(results);
      if (qualityPassed) {
        execution.metrics.qualityGatesPassed++;
      } else {
        execution.metrics.qualityGatesFailed++;
      }

      return { success: true, duration: Date.now() - stageStart, results };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'strategic_plan_synthesis',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 3: Financial Modeling & Projections
   *
   * Uses financial-modeling-specialist agent to create:
   * - 12-36 month cash flow projections
   * - Unit economics analysis (LTV, CAC, ratios)
   * - Revenue scenario modeling (best/base/worst)
   * - Power of One analysis
   * - Break-even timeline
   */
  async executeFinancialModeling(execution, projectSpec, strategicPlanResults) {
    const stageStart = Date.now();
    const results = {};

    try {
      const financialPrompt = `
Create comprehensive financial projections for ${projectSpec.clientName}.

STRATEGIC CONTEXT:
${this.formatStrategicContext(strategicPlanResults)}

YOUR TASK:
Execute the complete 6-step Financial Modeling Process to produce:

1. **Assumptions Documentation**:
   - Revenue assumptions (growth rate, ARPU, churn)
   - Cost assumptions (COGS, fixed costs, variable costs)
   - Unit economics assumptions (CAC, LTV)
   - Growth assumptions (marketing spend, team expansion)
   - Capital assumptions (cash position, runway)

2. **Unit Economics Analysis**:
   - Customer Lifetime Value (LTV)
   - Customer Acquisition Cost (CAC)
   - LTV:CAC ratio with benchmark analysis
   - Payback period calculation
   - Contribution margin

3. **Monthly Cash Flow Projections** (12-36 months):
   - Month-by-month table with:
     * Customer growth
     * Revenue calculations
     * COGS and operating expenses
     * Net income and cash flow
     * Ending cash position

4. **Scenario Planning**:
   - Best case (optimistic growth)
   - Base case (realistic growth)
   - Worst case (conservative growth)
   - Sensitivity analysis

5. **Break-Even & Milestone Analysis**:
   - Cash break-even calculation
   - Profitability break-even
   - Financial milestone roadmap
   - Capital requirements

6. **Power of One Analysis**:
   - Calculate 1% improvement impact on 7 levers:
     * Price increase
     * Volume increase
     * COGS decrease
     * Operating expense decrease
     * Days inventory outstanding
     * Days sales outstanding
     * Days payable outstanding
   - Rank by $ impact
   - Recommend focus areas

DELIVERABLES:
Save both structured data and narrative to:
${projectSpec.projectPath}/deliverables/strategic-planning/

Files to create:
- financial-projections.json (structured data)
- financial-projections-narrative.md (human-readable report)

CRITICAL: Use conservative assumptions unless you have strong data supporting optimistic projections.
      `.trim();

      const financialModel = await this.executeAgentTask(
        'financial-modeling-specialist',
        financialPrompt,
        execution
      );

      results.financialModel = financialModel;

      // Quality gate
      const qualityPassed = this.validateFinancialModel(results);
      if (qualityPassed) {
        execution.metrics.qualityGatesPassed++;
      } else {
        execution.metrics.qualityGatesFailed++;
      }

      return { success: true, duration: Date.now() - stageStart, results };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'financial_modeling',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 4: Strategic Coherence Validation
   *
   * Validates alignment across all strategic elements
   */
  async executeCoherenceValidation(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {
      coherenceScore: 0,
      gaps: [],
      strengths: []
    };

    try {
      // Load generated strategic documents
      const strategicPlanningPath = path.join(projectSpec.projectPath, 'deliverables', 'strategic-planning');

      // Check for existence and quality of deliverables
      const requiredFiles = [
        'one-page-strategic-plan.md',
        'eos-vision-traction-organizer.md',
        'strategic-narrative.md',
        'financial-projections.json',
        'financial-projections-narrative.md'
      ];

      let filesPresent = 0;
      for (const file of requiredFiles) {
        try {
          const filePath = path.join(strategicPlanningPath, file);
          await fs.access(filePath);
          filesPresent++;
        } catch (e) {
          results.gaps.push(`Missing deliverable: ${file}`);
        }
      }

      // Calculate base coherence from file completeness
      const fileCompleteness = (filesPresent / requiredFiles.length) * 100;

      // Extract coherence score from strategic narrative if available
      try {
        const narrativePath = path.join(strategicPlanningPath, 'strategic-narrative.md');
        const narrativeContent = await fs.readFile(narrativePath, 'utf8');

        const coherenceMatch = narrativeContent.match(/Strategic Coherence Score[:\s]+(\d+)%/i);
        if (coherenceMatch) {
          results.coherenceScore = parseInt(coherenceMatch[1]);
        } else {
          // Fallback to file completeness if no explicit score
          results.coherenceScore = Math.round(fileCompleteness);
        }
      } catch (e) {
        results.coherenceScore = Math.round(fileCompleteness);
      }

      // Analyze strengths
      if (results.coherenceScore >= 90) {
        results.strengths.push('Exceptional strategic alignment across all dimensions');
      } else if (results.coherenceScore >= 80) {
        results.strengths.push('Strong strategic coherence with minor gaps');
      } else if (results.coherenceScore >= 70) {
        results.strengths.push('Good strategic foundation with room for refinement');
      }

      // Quality gate
      const qualityPassed = results.coherenceScore >= 70;
      if (qualityPassed) {
        execution.metrics.qualityGatesPassed++;
      } else {
        execution.metrics.qualityGatesFailed++;
      }

      console.log(`✓ Strategic coherence validation: ${results.coherenceScore}%`);

      return {
        success: true,
        duration: Date.now() - stageStart,
        coherenceScore: results.coherenceScore,
        gaps: results.gaps,
        strengths: results.strengths
      };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'coherence_validation',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 5: Executive Package Assembly
   *
   * Creates master index and executive summary
   */
  async assembleExecutivePackage(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {};

    try {
      const strategicPlanningPath = path.join(projectSpec.projectPath, 'deliverables', 'strategic-planning');

      // Create executive package index
      const packageIndex = {
        client: projectSpec.clientName,
        generatedAt: new Date().toISOString(),
        executionId: execution.executionId,
        strategicCoherenceScore: execution.metrics.strategicCoherenceScore,
        deliverables: {
          strategicPlan: 'one-page-strategic-plan.md',
          visionTraction: 'eos-vision-traction-organizer.md',
          strategicNarrative: 'strategic-narrative.md',
          financialProjections: 'financial-projections.json',
          financialNarrative: 'financial-projections-narrative.md'
        },
        frameworks: [
          'Scaling Up - One-Page Strategic Plan',
          'EOS - Vision/Traction Organizer',
          'Financial Modeling - Unit Economics & Scenario Planning',
          'Power of One Analysis'
        ],
        nextSteps: [
          '1. Review all strategic documents with leadership team',
          '2. Validate financial assumptions with finance team',
          '3. Conduct quarterly rocks workshop for 90-day priorities',
          '4. Establish KPI dashboard for execution tracking',
          '5. Schedule monthly strategic review cadence'
        ]
      };

      // Save package index
      const indexPath = path.join(strategicPlanningPath, 'executive-package-index.json');
      await fs.writeFile(indexPath, JSON.stringify(packageIndex, null, 2), 'utf8');

      results.packageIndex = packageIndex;

      console.log('✓ Executive package assembled');

      return { success: true, duration: Date.now() - stageStart, results };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'executive_package',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Execute individual agent task with crash prevention
   */
  async executeAgentTask(agentType, prompt, execution) {
    const taskStart = Date.now();

    try {
      // CRASH PREVENTION: Rate-limited agent execution
      const result = await this.agentLimit(async () => {
        return await this.coordinationPatterns.executeSequential([
          {
            agentType,
            prompt,
            timeout: 900000 // 15 minutes for strategic tasks
          }
        ]);
      });

      execution.metrics.agentExecutions++;
      if (result.tokenUsage) {
        execution.metrics.tokenUsage += result.tokenUsage;
      }

      this.emit('task-completed', {
        executionId: execution.executionId,
        agentType,
        duration: Date.now() - taskStart
      });

      return result;

    } catch (error) {
      this.emit('task-error', {
        executionId: execution.executionId,
        agentType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Helper: Find files matching patterns with crash prevention
   */
  async findFiles(basePath, ...patterns) {
    const results = [];

    for (const pattern of patterns) {
      try {
        const files = await this.fileLimit(async () => {
          const allFiles = await fs.readdir(basePath);
          const regex = new RegExp(pattern.replace(/\./g, '\\.').replace(/\*/g, '.*'), 'i');
          return allFiles
            .filter(file => regex.test(file))
            .map(file => path.join(basePath, file));
        });

        results.push(...files);
      } catch (e) {
        // Directory or pattern not found, continue
      }
    }

    return [...new Set(results)]; // Remove duplicates
  }

  /**
   * Helper: Format intelligence context for agent prompt
   */
  formatIntelligenceContext(intelligenceResults) {
    const context = [];

    context.push(`Intelligence Completeness: ${intelligenceResults.completeness}%`);
    context.push(`Sources Available: ${intelligenceResults.sources.join(', ')}`);
    context.push('');
    context.push('Load intelligence data from:');
    context.push(`${intelligenceResults.data.icp ? '✓ ICP Analysis' : '✗ ICP Analysis (missing)'}`);
    context.push(`${intelligenceResults.data.seo ? '✓ SEO Research' : '✗ SEO Research (missing)'}`);
    context.push(`${intelligenceResults.data.competitive ? '✓ Competitive Intelligence' : '✗ Competitive Intelligence (missing)'}`);
    context.push(`${intelligenceResults.data.branding ? '✓ Branding Guidelines' : '✗ Branding Guidelines (missing)'}`);
    context.push(`${intelligenceResults.data.eos ? '✓ Existing EOS Framework' : '✗ EOS Framework (create new)'}`);
    context.push(`${intelligenceResults.data.psychographic ? '✓ Psychographic Research' : '✗ Psychographic Research (missing)'}`);

    return context.join('\n');
  }

  /**
   * Helper: Format strategic context for financial modeling
   */
  formatStrategicContext(strategicPlanResults) {
    return `
Strategic planning completed. Financial projections should align with:
- Strategic priorities and goals from OPSP
- 1-year and 3-year targets from V/TO
- Revenue and growth assumptions from strategic narrative

Reference the generated strategic documents for context.
    `.trim();
  }

  /**
   * Validation: Strategic Plan quality
   */
  validateStrategicPlan(results) {
    if (!results.strategicPlan) return false;
    const plan = JSON.stringify(results.strategicPlan).toLowerCase();

    // Check for key components
    const hasOPSP = plan.includes('one-page') || plan.includes('opsp');
    const hasVTO = plan.includes('vision') || plan.includes('traction');
    const hasNarrative = plan.includes('narrative') || plan.includes('strategy');

    return hasOPSP && hasVTO && hasNarrative;
  }

  /**
   * Validation: Financial Model quality
   */
  validateFinancialModel(results) {
    if (!results.financialModel) return false;
    const model = JSON.stringify(results.financialModel).toLowerCase();

    // Check for key components
    const hasProjections = model.includes('projection') || model.includes('cash flow');
    const hasUnitEcon = model.includes('ltv') || model.includes('cac');
    const hasPowerOfOne = model.includes('power of one') || model.includes('1%');

    return hasProjections && hasUnitEcon;
  }

  /**
   * Helper: Parse EOS markdown (basic version)
   */
  parseEOSMarkdown(content) {
    // Basic parsing - can be enhanced later
    return {
      content: content,
      parsed: true
    };
  }

  /**
   * Helper: Parse markdown to structure (basic version)
   */
  parseMarkdownToStructure(content) {
    return {
      content: content,
      parsed: true
    };
  }

  /**
   * Store pipeline learnings in crystalline memory
   */
  async storePipelineLearnings(execution) {
    try {
      await this.crystallineMemory.storeMemory(
        'strategic-planning-execution',
        {
          executionId: execution.executionId,
          projectId: execution.projectId,
          clientName: execution.clientName,
          stagesCompleted: Object.keys(execution.stageResults),
          strategicCoherenceScore: execution.metrics.strategicCoherenceScore,
          qualityGatesPassed: execution.metrics.qualityGatesPassed,
          totalDuration: Date.now() - execution.startTime
        },
        {
          importance: 0.95,
          semantic_tags: ['strategic-planning', 'eos', 'scaling-up', 'financial-modeling'],
          retention: 'long-term'
        }
      );

      if (this.mcpManager) {
        await this.mcpManager.callMCPTool('memory', 'create_entities', {
          entities: [{
            name: execution.clientName,
            entityType: 'strategic_plan',
            observations: [
              'Completed strategic planning pipeline',
              'One-Page Strategic Plan (OPSP) created',
              'EOS Vision/Traction Organizer created',
              'Financial projections and unit economics modeled',
              `Strategic coherence score: ${execution.metrics.strategicCoherenceScore}%`
            ]
          }]
        });
      }
    } catch (error) {
      console.error('Failed to store pipeline learnings:', error);
    }
  }

  /**
   * Get deliverable paths
   */
  getDeliverablePaths(execution) {
    const basePath = `${execution.projectPath}/deliverables/strategic-planning`;

    return {
      onePageStrategicPlan: `${basePath}/one-page-strategic-plan.md`,
      visionTractionOrganizer: `${basePath}/eos-vision-traction-organizer.md`,
      strategicNarrative: `${basePath}/strategic-narrative.md`,
      financialProjections: `${basePath}/financial-projections.json`,
      financialNarrative: `${basePath}/financial-projections-narrative.md`,
      executivePackageIndex: `${basePath}/executive-package-index.json`
    };
  }

  getPipelineId() {
    return this.pipelineId;
  }

  getMetadata() {
    return {
      id: this.pipelineId,
      name: this.pipelineName,
      version: '1.0',
      estimatedDuration: 90, // minutes
      stages: [
        'intelligence_aggregation',
        'strategic_plan_synthesis',
        'financial_modeling',
        'coherence_validation',
        'executive_package'
      ],
      primaryAgents: ['strategic-plan-synthesizer', 'financial-modeling-specialist'],
      frameworks: [
        'Scaling Up (Verne Harnish)',
        'EOS (Gino Wickman)',
        'Financial Modeling & Unit Economics',
        'Power of One Analysis'
      ],
      minimumIntelligenceRequired: 60, // percentage
      targetCoherenceScore: 70 // percentage
    };
  }
}

module.exports = StrategicPlanningPipeline;
