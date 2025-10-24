const LocalSEOPipeline = require('../orchestrai-domains/local-seo/pipelines/local-seo-pipeline.js');
const CoordinationPatterns = require('../orchestrai-shared/coordination/coordination-patterns.js');
const CrystallineMemory = require('../orchestrai-shared/memory/crystalline-memory.js');
const MCPManager = require('../orchestrai-shared/mcp-servers/mcp-manager.js');
const redis = require('redis');

describe('Local SEO Pipeline Integration Tests', () => {
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
      memoryPoolName: 'test-local-seo-pool',
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
      enabledServers: ['dataforseo', 'sequential-thinking', 'memory', 'filesystem']
    });

    await mcpManager.initialize();

    // Initialize pipeline
    pipeline = new LocalSEOPipeline(coordinationPatterns, crystallineMemory, mcpManager);

    // Set up test project specification
    testProjectSpec = {
      projectId: 'test-local-seo-project-001',
      clientId: 'test-client-001',
      businessName: 'Test Dental Clinic',
      location: 'Amsterdam, Netherlands',
      industry: 'dental',
      targetKeywords: ['tandarts amsterdam', 'tandartspraktijk amsterdam', 'dental clinic amsterdam'],
      competitorUrls: ['https://example-dentist-1.nl', 'https://example-dentist-2.nl'],
      gbpUrl: 'https://www.google.com/maps/place/test-dental-clinic',
      currentCitations: 15,
      averageRating: 4.3,
      reviewCount: 47,
      deliverableFormat: 'comprehensive',
      includeContentStrategy: true,
      includeLinkBuilding: true
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
      expect(pipeline.pipelineId).toBe('local-seo');
      expect(pipeline.pipelineName).toBe('Local SEO Pipeline');
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
      expect(crystallineMemory.memoryPoolName).toBe('test-local-seo-pool');
    });

    test('MCP manager should be initialized with required servers', async () => {
      expect(mcpManager.isInitialized).toBe(true);
      const availableServers = await mcpManager.getAvailableServers();
      expect(availableServers).toContain('dataforseo');
      expect(availableServers).toContain('memory');
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
      expect(events.filter(e => e.type === 'task-completed').length).toBeGreaterThanOrEqual(8);
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
      expect(paths.gbpOptimizationPlan).toBeDefined();
      expect(paths.citationStrategy).toBeDefined();
      expect(paths.reviewManagementPlan).toBeDefined();
      expect(paths.localContentStrategy).toBeDefined();
      expect(paths.linkBuildingPlan).toBeDefined();
    });
  });

  describe('Stage 1: GBP Audit & Optimization', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-gbp-stage-001',
        projectId: testProjectSpec.projectId,
        businessName: testProjectSpec.businessName,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeGBPAuditOptimization(execution, testProjectSpec);
    }, 60000);

    test('Should complete GBP profile audit', () => {
      expect(stageResults.gbpProfileAudit).toBeDefined();
      expect(stageResults.gbpProfileAudit.currentStatus).toBeDefined();
      expect(stageResults.gbpProfileAudit.completenessScore).toBeGreaterThan(0);
      expect(stageResults.gbpProfileAudit.optimizationOpportunities).toBeDefined();
    });

    test('Should generate comprehensive optimization plan', () => {
      expect(stageResults.optimizationPlan).toBeDefined();
      expect(stageResults.optimizationPlan.prioritizedActions).toBeDefined();
      expect(Array.isArray(stageResults.optimizationPlan.prioritizedActions)).toBe(true);
      expect(stageResults.optimizationPlan.prioritizedActions.length).toBeGreaterThan(0);
    });

    test('GBP audit quality gate should validate required fields', () => {
      const isValid = pipeline.validateGBPAudit(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 2: Local Citation Building', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-citation-stage-001',
        projectId: testProjectSpec.projectId,
        businessName: testProjectSpec.businessName,
        location: testProjectSpec.location,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeLocalCitationBuilding(execution, testProjectSpec);
    }, 60000);

    test('Should complete NAP consistency audit', () => {
      expect(stageResults.napAudit).toBeDefined();
      expect(stageResults.napAudit.currentCitations).toBeDefined();
      expect(stageResults.napAudit.inconsistencies).toBeDefined();
      expect(stageResults.napAudit.napConsistencyScore).toBeGreaterThan(0);
    });

    test('Should identify citation opportunities', () => {
      expect(stageResults.citationStrategy).toBeDefined();
      expect(stageResults.citationStrategy.priorityDirectories).toBeDefined();
      expect(Array.isArray(stageResults.citationStrategy.priorityDirectories)).toBe(true);
      expect(stageResults.citationStrategy.localDirectories).toBeDefined();
    });

    test('Citation audit quality gate should validate completeness', () => {
      const isValid = pipeline.validateCitationAudit(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 3: Review Management Strategy', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-review-stage-001',
        projectId: testProjectSpec.projectId,
        businessName: testProjectSpec.businessName,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeReviewManagement(execution, testProjectSpec);
    }, 60000);

    test('Should analyze current review profile', () => {
      expect(stageResults.reviewAnalysis).toBeDefined();
      expect(stageResults.reviewAnalysis.averageRating).toBeDefined();
      expect(stageResults.reviewAnalysis.totalReviews).toBeDefined();
      expect(stageResults.reviewAnalysis.sentimentBreakdown).toBeDefined();
    });

    test('Should generate review response templates', () => {
      expect(stageResults.reviewStrategy).toBeDefined();
      expect(stageResults.reviewStrategy.responseTemplates).toBeDefined();
      expect(stageResults.reviewStrategy.responseTemplates.positive).toBeDefined();
      expect(stageResults.reviewStrategy.responseTemplates.negative).toBeDefined();
      expect(stageResults.reviewStrategy.responseTemplates.neutral).toBeDefined();
    });

    test('Should create review generation campaign', () => {
      expect(stageResults.reviewStrategy.generationCampaign).toBeDefined();
      expect(stageResults.reviewStrategy.generationCampaign.tactics).toBeDefined();
      expect(Array.isArray(stageResults.reviewStrategy.generationCampaign.tactics)).toBe(true);
    });
  });

  describe('Stage 4: Local Content Creation', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-content-stage-001',
        projectId: testProjectSpec.projectId,
        businessName: testProjectSpec.businessName,
        location: testProjectSpec.location,
        industry: testProjectSpec.industry,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeLocalContentCreation(execution, testProjectSpec);
    }, 60000);

    test('Should complete local keyword research', () => {
      expect(stageResults.keywordResearch).toBeDefined();
      expect(stageResults.keywordResearch.localKeywords).toBeDefined();
      expect(Array.isArray(stageResults.keywordResearch.localKeywords)).toBe(true);
      expect(stageResults.keywordResearch.localKeywords.length).toBeGreaterThan(0);
    });

    test('Should create location-specific content plan', () => {
      expect(stageResults.contentPlan).toBeDefined();
      expect(stageResults.contentPlan.locationPages).toBeDefined();
      expect(stageResults.contentPlan.servicePages).toBeDefined();
      expect(stageResults.contentPlan.blogTopics).toBeDefined();
    });

    test('Content strategy quality gate should validate keyword coverage', () => {
      const isValid = pipeline.validateContentStrategy(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 5: Local Link Building', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-linkbuilding-stage-001',
        projectId: testProjectSpec.projectId,
        businessName: testProjectSpec.businessName,
        location: testProjectSpec.location,
        industry: testProjectSpec.industry,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeLocalLinkBuilding(execution, testProjectSpec);
    }, 60000);

    test('Should identify local link opportunities', () => {
      expect(stageResults.linkOpportunities).toBeDefined();
      expect(stageResults.linkOpportunities.localBusinesses).toBeDefined();
      expect(stageResults.linkOpportunities.communityOrganizations).toBeDefined();
      expect(stageResults.linkOpportunities.localMedia).toBeDefined();
    });

    test('Should create outreach strategy', () => {
      expect(stageResults.outreachStrategy).toBeDefined();
      expect(stageResults.outreachStrategy.prioritizedTargets).toBeDefined();
      expect(Array.isArray(stageResults.outreachStrategy.prioritizedTargets)).toBe(true);
      expect(stageResults.outreachStrategy.emailTemplates).toBeDefined();
    });
  });

  describe('Quality Gate Validation', () => {
    test('GBP audit quality gate should block on missing fields', () => {
      const invalidResults = {
        gbpProfileAudit: {
          currentStatus: { incomplete: true }
          // Missing completenessScore
        }
      };

      const isValid = pipeline.validateGBPAudit(invalidResults);
      expect(isValid).toBe(false);
    });

    test('Citation audit quality gate should block on low consistency', () => {
      const invalidResults = {
        napAudit: {
          napConsistencyScore: 40 // Below 60% threshold
        }
      };

      const isValid = pipeline.validateCitationAudit(invalidResults);
      expect(isValid).toBe(false);
    });

    test('Content strategy quality gate should block on insufficient keywords', () => {
      const invalidResults = {
        keywordResearch: {
          localKeywords: ['keyword1', 'keyword2'] // Only 2 keywords (need 5+)
        }
      };

      const isValid = pipeline.validateContentStrategy(invalidResults);
      expect(isValid).toBe(false);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('Pipeline should handle missing required fields gracefully', async () => {
      const invalidSpec = {
        projectId: 'test-invalid-001'
        // Missing businessName and location
      };

      await expect(pipeline.execute(invalidSpec)).rejects.toThrow();
    });

    test('Pipeline should continue on non-blocking quality gate failures', async () => {
      const specWithWarnings = {
        ...testProjectSpec,
        currentCitations: 5 // Low citation count (warning, not error)
      };

      const result = await pipeline.execute(specWithWarnings);
      expect(result.success).toBe(true);
      // Should complete despite warning
    }, 120000);
  });

  describe('Crystalline Memory Integration', () => {
    test('Pipeline should store learnings in crystalline memory', async () => {
      const execution = {
        executionId: 'test-memory-001',
        projectId: testProjectSpec.projectId,
        businessName: testProjectSpec.businessName,
        location: testProjectSpec.location,
        stageResults: {
          gbpAudit: { completenessScore: 85 },
          citationAudit: { napConsistencyScore: 92 }
        },
        metrics: {
          tokenUsage: 15000,
          agentExecutions: 8
        }
      };

      await pipeline.storePipelineLearnings(execution);

      // Verify memory storage
      const memories = await crystallineMemory.queryMemories({
        context: 'local-seo-pipeline',
        projectId: testProjectSpec.projectId
      });

      expect(memories).toBeDefined();
      expect(memories.length).toBeGreaterThan(0);
    });
  });

  describe('MCP Tool Integration', () => {
    test('Pipeline should integrate with DataForSEO MCP server', async () => {
      const isAvailable = await mcpManager.isServerAvailable('dataforseo');
      expect(isAvailable).toBe(true);
    });

    test('Pipeline should use sequential-thinking MCP for complex analysis', async () => {
      const isAvailable = await mcpManager.isServerAvailable('sequential-thinking');
      expect(isAvailable).toBe(true);
    });

    test('Pipeline should use memory MCP for entity storage', async () => {
      const isAvailable = await mcpManager.isServerAvailable('memory');
      expect(isAvailable).toBe(true);
    });
  });
});
