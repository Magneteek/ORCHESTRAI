const LandingPageOptimizationPipeline = require('../orchestrai-domains/webdev/pipelines/landing-page-optimization-pipeline.js');
const CoordinationPatterns = require('../orchestrai-shared/coordination/coordination-patterns.js');
const CrystallineMemory = require('../orchestrai-shared/memory/crystalline-memory.js');
const MCPManager = require('../orchestrai-shared/mcp-servers/mcp-manager.js');
const redis = require('redis');

describe('Landing Page Optimization Pipeline Integration Tests', () => {
  let redisClient;
  let crystallineMemory;
  let coordinationPatterns;
  let mcpManager;
  let pipeline;
  let testProjectSpec;

  // Initialize system before all tests
  beforeAll(async () => {
    // Initialize Redis client
    redisClient = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      retry_strategy: (options) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          return new Error('Redis connection refused');
        }
        if (options.total_retry_time > 1000 * 60) {
          return new Error('Redis retry time exhausted');
        }
        if (options.attempt > 10) {
          return undefined;
        }
        return Math.min(options.attempt * 100, 3000);
      }
    });

    await new Promise((resolve, reject) => {
      redisClient.on('connect', resolve);
      redisClient.on('error', reject);
    });

    // Initialize crystalline memory system
    crystallineMemory = new CrystallineMemory({
      redisClient,
      memoryPoolName: 'test-landing-page-optimization-pool',
      config: {
        maxNodes: 1000,
        retentionPolicy: 'geometric',
        compressionEnabled: true
      }
    });

    await crystallineMemory.initialize();

    // Initialize coordination patterns
    coordinationPatterns = new CoordinationPatterns({
      redisClient,
      crystallineMemory,
      config: {
        orchestrationType: 'hybrid-mesh',
        routingAlgorithm: 'geometric-spatial'
      }
    });

    await coordinationPatterns.initialize();

    // Initialize MCP manager
    mcpManager = new MCPManager({
      mcpConfigPath: '/Users/kris/CLAUDEtools/ORCHESTRAI/.mcp.json',
      enabledServers: ['sequential-thinking', 'memory', 'filesystem', 'ref-tools']
    });

    await mcpManager.initialize();

    // Initialize pipeline
    pipeline = new LandingPageOptimizationPipeline(coordinationPatterns, crystallineMemory, mcpManager);

    // Set up test project specification
    testProjectSpec = {
      projectId: 'test-landing-page-optimization-001',
      clientId: 'test-client-001',
      clientName: 'SaaS Product Inc.',
      pageUrl: 'https://example.com/landing/product-trial',
      pageType: 'saas-trial',
      currentConversionRate: 2.3,
      targetConversionRate: 5.0,
      monthlyTraffic: 10000,
      primaryGoal: 'trial-signup',
      secondaryGoals: ['demo-request', 'whitepaper-download'],
      currentAnalytics: {
        bounceRate: 45,
        avgTimeOnPage: 85,
        mobileTraffic: 60
      },
      existingTests: [],
      deliverableFormat: 'comprehensive',
      includesABTesting: true,
      includesMobileOptimization: true
    };
  }, 30000); // 30 second timeout for initialization

  // Cleanup after all tests
  afterAll(async () => {
    if (crystallineMemory) {
      await crystallineMemory.shutdown();
    }
    if (coordinationPatterns) {
      await coordinationPatterns.shutdown();
    }
    if (mcpManager) {
      await mcpManager.shutdown();
    }
    if (redisClient) {
      await new Promise((resolve) => redisClient.quit(resolve));
    }
  }, 10000);

  describe('System Initialization', () => {
    test('Pipeline should initialize with correct configuration', () => {
      expect(pipeline).toBeDefined();
      expect(pipeline.pipelineId).toBe('landing-page-optimization');
      expect(pipeline.pipelineName).toBe('Landing Page Optimization Pipeline');
      expect(pipeline.coordinationPatterns).toBeDefined();
      expect(pipeline.crystallineMemory).toBeDefined();
      expect(pipeline.mcpManager).toBeDefined();
    });

    test('Coordination patterns should be initialized', () => {
      expect(coordinationPatterns.isInitialized).toBe(true);
      expect(coordinationPatterns.redisClient).toBeDefined();
      expect(coordinationPatterns.crystallineMemory).toBeDefined();
    });

    test('Crystalline memory should be initialized', () => {
      expect(crystallineMemory.isInitialized).toBe(true);
      expect(crystallineMemory.memoryPoolName).toBe('test-landing-page-optimization-pool');
    });

    test('MCP manager should be initialized with required servers', async () => {
      expect(mcpManager.isInitialized).toBe(true);
      const availableServers = await mcpManager.getAvailableServers();
      expect(availableServers).toContain('memory');
      expect(availableServers).toContain('sequential-thinking');
    });
  });

  describe('Pipeline Execution Lifecycle', () => {
    let executionResult;

    test('Pipeline should execute successfully with valid project spec', async () => {
      const events = [];

      // Listen to pipeline events
      pipeline.on('pipeline-started', (data) => events.push({ type: 'pipeline-started', data }));
      pipeline.on('stage-started', (data) => events.push({ type: 'stage-started', data }));
      pipeline.on('task-started', (data) => events.push({ type: 'task-started', data }));
      pipeline.on('task-completed', (data) => events.push({ type: 'task-completed', data }));
      pipeline.on('stage-completed', (data) => events.push({ type: 'stage-completed', data }));
      pipeline.on('quality-gate-passed', (data) => events.push({ type: 'quality-gate-passed', data }));
      pipeline.on('pipeline-completed', (data) => events.push({ type: 'pipeline-completed', data }));

      executionResult = await pipeline.execute(testProjectSpec);

      expect(executionResult).toBeDefined();
      expect(executionResult.success).toBe(true);
      expect(executionResult.executionId).toBeDefined();
      expect(executionResult.projectId).toBe(testProjectSpec.projectId);
      expect(executionResult.duration).toBeGreaterThan(0);

      // Verify events were emitted
      expect(events.find(e => e.type === 'pipeline-started')).toBeDefined();
      expect(events.find(e => e.type === 'pipeline-completed')).toBeDefined();
      expect(events.filter(e => e.type === 'stage-started').length).toBeGreaterThanOrEqual(5);
      expect(events.filter(e => e.type === 'task-completed').length).toBeGreaterThanOrEqual(11);
    }, 120000); // 2 minute timeout for full execution

    test('Execution result should contain all expected properties', () => {
      expect(executionResult.results).toBeDefined();
      expect(executionResult.deliverablePaths).toBeDefined();
      expect(executionResult.metrics).toBeDefined();
      expect(executionResult.metrics.tokenUsage).toBeGreaterThan(0);
      expect(executionResult.metrics.agentExecutions).toBeGreaterThan(0);
    });

    test('Pipeline should generate expected deliverables', () => {
      const paths = executionResult.deliverablePaths;
      expect(paths).toBeDefined();
      expect(paths.pageAuditReport).toBeDefined();
      expect(paths.croStrategyDocument).toBeDefined();
      expect(paths.abTestPlan).toBeDefined();
      expect(paths.optimizationRoadmap).toBeDefined();
      expect(paths.monitoringFramework).toBeDefined();
    });
  });

  describe('Stage 1: Page Audit Analysis', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-page-audit-001',
        projectId: testProjectSpec.projectId,
        pageUrl: testProjectSpec.pageUrl,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executePageAudit(execution, testProjectSpec);
    }, 60000);

    test('Should complete LIFT Model heuristic analysis', () => {
      expect(stageResults.liftAnalysis).toBeDefined();
      expect(stageResults.liftAnalysis.valueScore).toBeDefined();
      expect(stageResults.liftAnalysis.relevanceScore).toBeDefined();
      expect(stageResults.liftAnalysis.clarityScore).toBeDefined();
      expect(stageResults.liftAnalysis.anxietyScore).toBeDefined();
      expect(stageResults.liftAnalysis.distractionScore).toBeDefined();

      // Verify LIFT formula calculation
      expect(stageResults.liftAnalysis.conversionPotential).toBeDefined();
    });

    test('Should identify comprehensive friction points', () => {
      expect(stageResults.frictionAudit).toBeDefined();
      expect(stageResults.frictionAudit.cognitiveLoad).toBeDefined();
      expect(stageResults.frictionAudit.formFriction).toBeDefined();
      expect(stageResults.frictionAudit.trustDeficit).toBeDefined();

      // Verify friction scoring
      expect(stageResults.frictionAudit.totalFrictionScore).toBeGreaterThan(0);
    });

    test('Page audit quality gate should validate LIFT analysis completeness', () => {
      const isValid = pipeline.validatePageAudit(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 2: CRO Strategy Development', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-cro-strategy-001',
        projectId: testProjectSpec.projectId,
        pageUrl: testProjectSpec.pageUrl,
        stages: {},
        stageResults: {
          pageAudit: {
            liftAnalysis: {
              valueScore: 7,
              relevanceScore: 8,
              clarityScore: 6,
              anxietyScore: 5,
              distractionScore: 4
            }
          }
        },
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeCROStrategy(execution, testProjectSpec);
    }, 60000);

    test('Should apply MECLABS Conversion Sequence framework', () => {
      expect(stageResults.meclabsAnalysis).toBeDefined();
      expect(stageResults.meclabsAnalysis.motivationScore).toBeDefined();
      expect(stageResults.meclabsAnalysis.valuePropositionClarity).toBeDefined();
      expect(stageResults.meclabsAnalysis.incentiveLevel).toBeDefined();

      // Verify MECLABS formula: C = 4m + 3v + 2(i-f) - 2a
      expect(stageResults.meclabsAnalysis.conversionProbability).toBeDefined();
    });

    test('Should create PIE-prioritized testing roadmap', () => {
      expect(stageResults.testingRoadmap).toBeDefined();
      expect(Array.isArray(stageResults.testingRoadmap.prioritizedTests)).toBe(true);

      // Verify PIE scoring (Potential + Importance + Ease) / 3
      const firstTest = stageResults.testingRoadmap.prioritizedTests[0];
      expect(firstTest.pieScore).toBeDefined();
      expect(firstTest.pieScore.potential).toBeDefined();
      expect(firstTest.pieScore.importance).toBeDefined();
      expect(firstTest.pieScore.ease).toBeDefined();
    });

    test('CRO strategy quality gate should validate roadmap completeness', () => {
      const isValid = pipeline.validateCROStrategy(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 3: A/B Test Design', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-abtest-design-001',
        projectId: testProjectSpec.projectId,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeABTestDesign(execution, testProjectSpec);
    }, 60000);

    test('Should create headline test variations', () => {
      expect(stageResults.headlineVariations).toBeDefined();
      expect(Array.isArray(stageResults.headlineVariations)).toBe(true);
      expect(stageResults.headlineVariations.length).toBeGreaterThanOrEqual(3);

      // Verify headline formulas applied
      const firstVariation = stageResults.headlineVariations[0];
      expect(firstVariation.headline).toBeDefined();
      expect(firstVariation.framework).toBeDefined();
    });

    test('Should design CTA optimization tests', () => {
      expect(stageResults.ctaOptimization).toBeDefined();
      expect(stageResults.ctaOptimization.copyVariations).toBeDefined();
      expect(stageResults.ctaOptimization.colorTests).toBeDefined();
      expect(stageResults.ctaOptimization.placementTests).toBeDefined();
    });

    test('Should create comprehensive test implementation plan', () => {
      expect(stageResults.implementationPlan).toBeDefined();
      expect(stageResults.implementationPlan.testSequence).toBeDefined();
      expect(stageResults.implementationPlan.statisticalRequirements).toBeDefined();

      // Verify statistical requirements
      expect(stageResults.implementationPlan.statisticalRequirements.confidenceLevel).toBeGreaterThanOrEqual(95);
      expect(stageResults.implementationPlan.statisticalRequirements.minimumSampleSize).toBeGreaterThan(0);
    });

    test('A/B test design quality gate should validate variation count', () => {
      const isValid = pipeline.validateABTestDesign(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 4: Element Optimization', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-element-optimization-001',
        projectId: testProjectSpec.projectId,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeElementOptimization(execution, testProjectSpec);
    }, 60000);

    test('Should create social proof integration strategy', () => {
      expect(stageResults.socialProofStrategy).toBeDefined();
      expect(stageResults.socialProofStrategy.testimonials).toBeDefined();
      expect(stageResults.socialProofStrategy.trustBadges).toBeDefined();
      expect(stageResults.socialProofStrategy.caseStudies).toBeDefined();

      // Verify social proof types
      expect(stageResults.socialProofStrategy.testimonials.placement).toBeDefined();
    });

    test('Should optimize form design and reduce friction', () => {
      expect(stageResults.formOptimization).toBeDefined();
      expect(stageResults.formOptimization.fieldReduction).toBeDefined();
      expect(stageResults.formOptimization.progressIndicators).toBeDefined();
      expect(stageResults.formOptimization.inlineValidation).toBeDefined();

      // Verify field count optimization
      expect(stageResults.formOptimization.recommendedFieldCount).toBeLessThanOrEqual(5);
    });

    test('Should create mobile-specific optimizations', () => {
      expect(stageResults.mobileOptimization).toBeDefined();
      expect(stageResults.mobileOptimization.touchTargets).toBeDefined();
      expect(stageResults.mobileOptimization.pageSpeed).toBeDefined();
      expect(stageResults.mobileOptimization.viewportOptimization).toBeDefined();

      // Verify mobile-first requirements
      expect(stageResults.mobileOptimization.touchTargets.minimumSize).toBeGreaterThanOrEqual(44);
    });
  });

  describe('Stage 5: Monitoring & Continuous Iteration', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-monitoring-001',
        projectId: testProjectSpec.projectId,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeMonitoringIteration(execution, testProjectSpec);
    }, 60000);

    test('Should configure comprehensive analytics tracking', () => {
      expect(stageResults.analyticsConfiguration).toBeDefined();
      expect(stageResults.analyticsConfiguration.conversionTracking).toBeDefined();
      expect(stageResults.analyticsConfiguration.microConversions).toBeDefined();
      expect(stageResults.analyticsConfiguration.heatmapSetup).toBeDefined();

      // Verify tracking events
      expect(stageResults.analyticsConfiguration.conversionTracking.primaryGoal).toBeDefined();
      expect(stageResults.analyticsConfiguration.microConversions.length).toBeGreaterThan(0);
    });

    test('Should create continuous optimization framework', () => {
      expect(stageResults.optimizationFramework).toBeDefined();
      expect(stageResults.optimizationFramework.monthlyReviewSchedule).toBeDefined();
      expect(stageResults.optimizationFramework.quarterlyAudits).toBeDefined();
      expect(stageResults.optimizationFramework.testingCadence).toBeDefined();

      // Verify testing velocity
      expect(stageResults.optimizationFramework.testingCadence.testsPerMonth).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Quality Gate Validation', () => {
    test('Page audit quality gate should block on incomplete LIFT analysis', () => {
      const invalidResults = {
        liftAnalysis: {
          valueScore: 7,
          relevanceScore: 8
          // Missing clarity, anxiety, distraction scores
        }
      };

      const isValid = pipeline.validatePageAudit(invalidResults);
      expect(isValid).toBe(false);
    });

    test('CRO strategy quality gate should block on insufficient roadmap', () => {
      const invalidResults = {
        testingRoadmap: {
          prioritizedTests: [{ name: 'Test 1' }] // Only 1 test (need 3+)
        }
      };

      const isValid = pipeline.validateCROStrategy(invalidResults);
      expect(isValid).toBe(false);
    });

    test('A/B test design quality gate should block on missing variations', () => {
      const invalidResults = {
        headlineVariations: [{ headline: 'Variation 1' }] // Only 1 variation (need 3+)
      };

      const isValid = pipeline.validateABTestDesign(invalidResults);
      expect(isValid).toBe(false);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('Pipeline should handle missing required fields gracefully', async () => {
      const invalidSpec = {
        projectId: 'test-invalid-001'
        // Missing pageUrl and currentConversionRate
      };

      await expect(pipeline.execute(invalidSpec)).rejects.toThrow();
    });

    test('Pipeline should continue on low traffic warnings', async () => {
      const specWithLowTraffic = {
        ...testProjectSpec,
        monthlyTraffic: 500 // Low traffic (warning, not error)
      };

      const result = await pipeline.execute(specWithLowTraffic);
      expect(result.success).toBe(true);
    }, 120000);
  });

  describe('Crystalline Memory Integration', () => {
    test('Pipeline should store CRO learnings in crystalline memory', async () => {
      const execution = {
        executionId: 'test-memory-001',
        projectId: testProjectSpec.projectId,
        pageUrl: testProjectSpec.pageUrl,
        stageResults: {
          pageAudit: {
            liftAnalysis: {
              conversionPotential: 8.5
            }
          },
          abTestDesign: {
            headlineVariations: [
              { headline: 'Test A', expectedLift: 0.15 }
            ]
          }
        },
        metrics: {
          tokenUsage: 18000,
          agentExecutions: 11
        }
      };

      await pipeline.storePipelineLearnings(execution);

      // Verify memory storage
      const memories = await crystallineMemory.queryMemories({
        context: 'landing-page-optimization-pipeline',
        projectId: testProjectSpec.projectId
      });

      expect(memories).toBeDefined();
      expect(memories.length).toBeGreaterThan(0);
    });
  });

  describe('MCP Tool Integration', () => {
    test('Pipeline should use sequential-thinking MCP for complex CRO analysis', async () => {
      const isAvailable = await mcpManager.isServerAvailable('sequential-thinking');
      expect(isAvailable).toBe(true);
    });

    test('Pipeline should use memory MCP for test result storage', async () => {
      const isAvailable = await mcpManager.isServerAvailable('memory');
      expect(isAvailable).toBe(true);
    });

    test('Pipeline should use ref-tools MCP for CRO best practices', async () => {
      const isAvailable = await mcpManager.isServerAvailable('ref-tools');
      expect(isAvailable).toBe(true);
    });
  });

  describe('CRO Methodology Verification', () => {
    test('Should correctly apply LIFT Model formula', () => {
      const liftScore = pipeline.calculateLIFTScore({
        value: 8,
        relevance: 7,
        clarity: 6,
        anxiety: 4,
        distraction: 3
      });

      // LIFT = (Value + Relevance + Clarity) - (Anxiety + Distraction)
      expect(liftScore).toBe((8 + 7 + 6) - (4 + 3));
    });

    test('Should correctly apply PIE Framework scoring', () => {
      const pieScore = pipeline.calculatePIEScore({
        potential: 9,
        importance: 8,
        ease: 7
      });

      // PIE = (Potential + Importance + Ease) / 3
      expect(pieScore).toBeCloseTo((9 + 8 + 7) / 3, 1);
    });

    test('Should enforce statistical significance requirements', () => {
      const requirements = pipeline.getStatisticalRequirements({
        monthlyTraffic: 10000,
        currentConversionRate: 2.3,
        targetLift: 0.2
      });

      expect(requirements.confidenceLevel).toBeGreaterThanOrEqual(95);
      expect(requirements.minimumSampleSize).toBeGreaterThan(0);
      expect(requirements.minimumTestDuration).toBeGreaterThanOrEqual(7); // At least 1 week
    });
  });
});
