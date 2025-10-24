const EmailMarketingPipeline = require('../orchestrai-domains/email-marketing/pipelines/email-marketing-pipeline.js');
const CoordinationPatterns = require('../orchestrai-shared/coordination/coordination-patterns.js');
const CrystallineMemory = require('../orchestrai-shared/memory/crystalline-memory.js');
const MCPManager = require('../orchestrai-shared/mcp-servers/mcp-manager.js');
const redis = require('redis');

describe('Email Marketing Pipeline Integration Tests', () => {
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
      memoryPoolName: 'test-email-marketing-pool',
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
    pipeline = new EmailMarketingPipeline(coordinationPatterns, crystallineMemory, mcpManager);

    // Set up test project specification
    testProjectSpec = {
      projectId: 'test-email-marketing-project-001',
      clientId: 'test-client-001',
      clientName: 'SaaS Analytics Inc.',
      industry: 'B2B SaaS',
      targetAudience: {
        primarySegment: 'Marketing Directors',
        companySize: '50-500 employees',
        geography: 'North America',
        painPoints: ['data silos', 'reporting complexity', 'roi attribution']
      },
      campaignType: 'full-lifecycle',
      includesColdOutreach: true,
      includesNurture: true,
      includesAutomation: true,
      emailProvider: 'SendGrid',
      currentListSize: 5000,
      targetListSize: 10000,
      deliverableFormat: 'comprehensive',
      brandVoice: 'professional-friendly',
      complianceRequirements: ['GDPR', 'CAN-SPAM']
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
      expect(pipeline.pipelineId).toBe('email-marketing');
      expect(pipeline.pipelineName).toBe('Email Marketing Pipeline');
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
      expect(crystallineMemory.memoryPoolName).toBe('test-email-marketing-pool');
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
      expect(events.filter(e => e.type === 'stage-started').length).toBeGreaterThanOrEqual(6);
      expect(events.filter(e => e.type === 'task-completed').length).toBeGreaterThanOrEqual(11);
    }, 150000); // 2.5 minute timeout for full execution

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
      expect(paths.audienceResearch).toBeDefined();
      expect(paths.coldEmailSequence).toBeDefined();
      expect(paths.nurtureSequences).toBeDefined();
      expect(paths.automationWorkflows).toBeDefined();
      expect(paths.abTestingPlan).toBeDefined();
      expect(paths.performanceFramework).toBeDefined();
    });
  });

  describe('Stage 1: Audience Research & Segmentation', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-audience-stage-001',
        projectId: testProjectSpec.projectId,
        clientName: testProjectSpec.clientName,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeAudienceResearch(execution, testProjectSpec);
    }, 60000);

    test('Should complete ICP analysis', () => {
      expect(stageResults.icpAnalysis).toBeDefined();
      expect(stageResults.icpAnalysis.primarySegment).toBeDefined();
      expect(stageResults.icpAnalysis.painPoints).toBeDefined();
      expect(Array.isArray(stageResults.icpAnalysis.painPoints)).toBe(true);
      expect(stageResults.icpAnalysis.painPoints.length).toBeGreaterThan(0);
    });

    test('Should create comprehensive segmentation strategy', () => {
      expect(stageResults.segmentationStrategy).toBeDefined();
      expect(stageResults.segmentationStrategy.segments).toBeDefined();
      expect(Array.isArray(stageResults.segmentationStrategy.segments)).toBe(true);
      expect(stageResults.segmentationStrategy.segments.length).toBeGreaterThanOrEqual(3);
    });

    test('Audience research quality gate should validate segment definitions', () => {
      const isValid = pipeline.validateAudienceResearch(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 2: Cold Email Campaign Development', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-cold-email-stage-001',
        projectId: testProjectSpec.projectId,
        clientName: testProjectSpec.clientName,
        stages: {},
        stageResults: {
          audienceResearch: {
            icpAnalysis: {
              primarySegment: 'Marketing Directors',
              painPoints: ['data silos', 'reporting complexity']
            }
          }
        },
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeColdEmailCampaign(execution, testProjectSpec);
    }, 60000);

    test('Should create 5-email PREP framework sequence', () => {
      expect(stageResults.emailSequence).toBeDefined();
      expect(Array.isArray(stageResults.emailSequence)).toBe(true);
      expect(stageResults.emailSequence.length).toBe(5);

      // Verify PREP framework structure
      expect(stageResults.emailSequence[0].purpose).toBeDefined();
      expect(stageResults.emailSequence[0].subjectLine).toBeDefined();
      expect(stageResults.emailSequence[0].emailBody).toBeDefined();
    });

    test('Should include personalization tokens', () => {
      const firstEmail = stageResults.emailSequence[0];
      expect(firstEmail.personalizationTokens).toBeDefined();
      expect(Array.isArray(firstEmail.personalizationTokens)).toBe(true);
      expect(firstEmail.personalizationTokens.length).toBeGreaterThan(0);
    });

    test('Cold email quality gate should validate sequence completeness', () => {
      const isValid = pipeline.validateColdEmailSequence(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 3: Nurture Sequence Development', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-nurture-stage-001',
        projectId: testProjectSpec.projectId,
        clientName: testProjectSpec.clientName,
        stages: {},
        stageResults: {
          audienceResearch: {
            icpAnalysis: {
              primarySegment: 'Marketing Directors'
            }
          }
        },
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeNurtureSequenceDevelopment(execution, testProjectSpec);
    }, 90000);

    test('Should create welcome series (5 emails)', () => {
      expect(stageResults.welcomeSeries).toBeDefined();
      expect(Array.isArray(stageResults.welcomeSeries)).toBe(true);
      expect(stageResults.welcomeSeries.length).toBe(5);

      // Verify welcome series structure (Days 1, 3, 5, 7, 14)
      expect(stageResults.welcomeSeries[0].sendDelay).toBe(0); // Day 1
      expect(stageResults.welcomeSeries[1].sendDelay).toBeGreaterThan(0); // Day 3
    });

    test('Should create engagement nurture sequence (7 emails)', () => {
      expect(stageResults.engagementNurture).toBeDefined();
      expect(Array.isArray(stageResults.engagementNurture)).toBe(true);
      expect(stageResults.engagementNurture.length).toBe(7);

      // Verify nurture cadence
      expect(stageResults.engagementNurture[0].cadence).toBeDefined();
    });

    test('Should create re-engagement sequence (4 emails)', () => {
      expect(stageResults.reEngagementFlow).toBeDefined();
      expect(Array.isArray(stageResults.reEngagementFlow)).toBe(true);
      expect(stageResults.reEngagementFlow.length).toBe(4);

      // Verify re-engagement trigger conditions
      expect(stageResults.reEngagementFlow[0].triggerCondition).toBeDefined();
    });

    test('Nurture sequence quality gate should validate total email count', () => {
      const isValid = pipeline.validateNurtureSequences(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 4: Automation Workflow Setup', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-automation-stage-001',
        projectId: testProjectSpec.projectId,
        clientName: testProjectSpec.clientName,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeAutomationSetup(execution, testProjectSpec);
    }, 60000);

    test('Should create behavioral trigger workflows', () => {
      expect(stageResults.workflowDesign).toBeDefined();
      expect(stageResults.workflowDesign.triggers).toBeDefined();
      expect(Array.isArray(stageResults.workflowDesign.triggers)).toBe(true);

      // Verify trigger types
      const triggerTypes = stageResults.workflowDesign.triggers.map(t => t.type);
      expect(triggerTypes).toContain('email_open');
      expect(triggerTypes).toContain('link_click');
    });

    test('Should define lead scoring system', () => {
      expect(stageResults.leadScoring).toBeDefined();
      expect(stageResults.leadScoring.rules).toBeDefined();
      expect(stageResults.leadScoring.thresholds).toBeDefined();

      // Verify scoring rules
      expect(stageResults.leadScoring.rules.email_open).toBeDefined();
      expect(stageResults.leadScoring.rules.demo_request).toBeDefined();
    });

    test('Automation workflow quality gate should validate trigger coverage', () => {
      const isValid = pipeline.validateAutomationWorkflows(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 5: A/B Testing Strategy', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-abtesting-stage-001',
        projectId: testProjectSpec.projectId,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executeABTestingStrategy(execution, testProjectSpec);
    }, 60000);

    test('Should create comprehensive testing plan', () => {
      expect(stageResults.testingPlan).toBeDefined();
      expect(stageResults.testingPlan.hypotheses).toBeDefined();
      expect(Array.isArray(stageResults.testingPlan.hypotheses)).toBe(true);
      expect(stageResults.testingPlan.hypotheses.length).toBeGreaterThanOrEqual(5);
    });

    test('Should define test variations for each hypothesis', () => {
      const firstHypothesis = stageResults.testingPlan.hypotheses[0];
      expect(firstHypothesis.variations).toBeDefined();
      expect(Array.isArray(firstHypothesis.variations)).toBe(true);
      expect(firstHypothesis.variations.length).toBeGreaterThanOrEqual(2);
    });

    test('Should include statistical significance requirements', () => {
      expect(stageResults.testingPlan.statisticalRequirements).toBeDefined();
      expect(stageResults.testingPlan.statisticalRequirements.confidenceLevel).toBeGreaterThanOrEqual(95);
      expect(stageResults.testingPlan.statisticalRequirements.minimumSampleSize).toBeGreaterThan(0);
    });

    test('A/B testing quality gate should validate hypothesis count', () => {
      const isValid = pipeline.validateABTestingPlan(stageResults);
      expect(isValid).toBe(true);
    });
  });

  describe('Stage 6: Performance Optimization Framework', () => {
    let stageResults;

    beforeAll(async () => {
      const execution = {
        executionId: 'test-performance-stage-001',
        projectId: testProjectSpec.projectId,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      stageResults = await pipeline.executePerformanceOptimization(execution, testProjectSpec);
    }, 60000);

    test('Should set up analytics tracking configuration', () => {
      expect(stageResults.analyticsSetup).toBeDefined();
      expect(stageResults.analyticsSetup.trackingEvents).toBeDefined();
      expect(Array.isArray(stageResults.analyticsSetup.trackingEvents)).toBe(true);

      // Verify key tracking events
      const events = stageResults.analyticsSetup.trackingEvents.map(e => e.name);
      expect(events).toContain('email_sent');
      expect(events).toContain('email_opened');
      expect(events).toContain('link_clicked');
      expect(events).toContain('conversion');
    });

    test('Should create optimization framework', () => {
      expect(stageResults.optimizationFramework).toBeDefined();
      expect(stageResults.optimizationFramework.benchmarks).toBeDefined();
      expect(stageResults.optimizationFramework.improvementAreas).toBeDefined();

      // Verify benchmarks
      expect(stageResults.optimizationFramework.benchmarks.openRate).toBeDefined();
      expect(stageResults.optimizationFramework.benchmarks.clickThroughRate).toBeDefined();
    });
  });

  describe('Quality Gate Validation', () => {
    test('Audience research quality gate should block on insufficient segments', () => {
      const invalidResults = {
        segmentationStrategy: {
          segments: [{ name: 'Segment 1' }] // Only 1 segment (need 3+)
        }
      };

      const isValid = pipeline.validateAudienceResearch(invalidResults);
      expect(isValid).toBe(false);
    });

    test('Cold email quality gate should block on incomplete sequence', () => {
      const invalidResults = {
        emailSequence: [
          { subjectLine: 'Email 1' },
          { subjectLine: 'Email 2' }
          // Only 2 emails (need 5)
        ]
      };

      const isValid = pipeline.validateColdEmailSequence(invalidResults);
      expect(isValid).toBe(false);
    });

    test('Nurture sequence quality gate should block on insufficient emails', () => {
      const invalidResults = {
        welcomeSeries: [{ email: '1' }, { email: '2' }], // Only 2 emails
        engagementNurture: [{ email: '1' }], // Only 1 email
        reEngagementFlow: [] // Empty
      };

      const isValid = pipeline.validateNurtureSequences(invalidResults);
      expect(isValid).toBe(false);
    });

    test('Automation workflow quality gate should block on missing triggers', () => {
      const invalidResults = {
        workflowDesign: {
          triggers: [{ type: 'email_open' }] // Only 1 trigger (need 3+)
        }
      };

      const isValid = pipeline.validateAutomationWorkflows(invalidResults);
      expect(isValid).toBe(false);
    });

    test('A/B testing quality gate should block on insufficient hypotheses', () => {
      const invalidResults = {
        testingPlan: {
          hypotheses: [
            { name: 'Test 1' },
            { name: 'Test 2' }
            // Only 2 hypotheses (need 5+)
          ]
        }
      };

      const isValid = pipeline.validateABTestingPlan(invalidResults);
      expect(isValid).toBe(false);
    });
  });

  describe('Error Handling and Recovery', () => {
    test('Pipeline should handle missing required fields gracefully', async () => {
      const invalidSpec = {
        projectId: 'test-invalid-001'
        // Missing clientName and industry
      };

      await expect(pipeline.execute(invalidSpec)).rejects.toThrow();
    });

    test('Pipeline should handle email provider integration errors', async () => {
      const specWithInvalidProvider = {
        ...testProjectSpec,
        emailProvider: 'UnsupportedProvider'
      };

      // Should warn but not fail
      const result = await pipeline.execute(specWithInvalidProvider);
      expect(result.success).toBe(true);
    }, 150000);
  });

  describe('Crystalline Memory Integration', () => {
    test('Pipeline should store campaign learnings in crystalline memory', async () => {
      const execution = {
        executionId: 'test-memory-001',
        projectId: testProjectSpec.projectId,
        clientName: testProjectSpec.clientName,
        stageResults: {
          coldEmailCampaign: {
            emailSequence: [
              { subjectLine: 'Test Subject', openRate: 0.35 }
            ]
          },
          abTestingStrategy: {
            testingPlan: {
              hypotheses: [
                { test: 'Subject line test', winner: 'Variation B', lift: 0.15 }
              ]
            }
          }
        },
        metrics: {
          tokenUsage: 25000,
          agentExecutions: 11
        }
      };

      await pipeline.storePipelineLearnings(execution);

      // Verify memory storage
      const memories = await crystallineMemory.queryMemories({
        context: 'email-marketing-pipeline',
        projectId: testProjectSpec.projectId
      });

      expect(memories).toBeDefined();
      expect(memories.length).toBeGreaterThan(0);
    });
  });

  describe('MCP Tool Integration', () => {
    test('Pipeline should use sequential-thinking MCP for complex workflows', async () => {
      const isAvailable = await mcpManager.isServerAvailable('sequential-thinking');
      expect(isAvailable).toBe(true);
    });

    test('Pipeline should use memory MCP for campaign storage', async () => {
      const isAvailable = await mcpManager.isServerAvailable('memory');
      expect(isAvailable).toBe(true);
    });

    test('Pipeline should use ref-tools MCP for best practices', async () => {
      const isAvailable = await mcpManager.isServerAvailable('ref-tools');
      expect(isAvailable).toBe(true);
    });
  });

  describe('Email Marketing Specific Features', () => {
    test('Should enforce GDPR compliance in email templates', async () => {
      const execution = {
        executionId: 'test-compliance-001',
        projectId: testProjectSpec.projectId,
        clientName: testProjectSpec.clientName,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      const coldEmailResults = await pipeline.executeColdEmailCampaign(execution, testProjectSpec);

      // Verify GDPR compliance elements
      const firstEmail = coldEmailResults.emailSequence[0];
      expect(firstEmail.complianceElements).toBeDefined();
      expect(firstEmail.complianceElements.unsubscribeLink).toBe(true);
      expect(firstEmail.complianceElements.privacyPolicy).toBe(true);
    }, 60000);

    test('Should calculate optimal send times for segments', async () => {
      const execution = {
        executionId: 'test-sendtime-001',
        projectId: testProjectSpec.projectId,
        stages: {},
        stageResults: {},
        errors: [],
        metrics: { tokenUsage: 0, agentExecutions: 0, qualityGatesPassed: 0, qualityGatesFailed: 0 }
      };

      const automationResults = await pipeline.executeAutomationSetup(execution, testProjectSpec);

      expect(automationResults.sendTimeOptimization).toBeDefined();
      expect(automationResults.sendTimeOptimization.optimalTimes).toBeDefined();
    }, 60000);
  });
});
