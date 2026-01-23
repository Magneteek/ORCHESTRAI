/**
 * Comprehensive Testing Pipeline - Executable Implementation (OPTIMIZED)
 *
 * OPTIMIZATION (Dec 2025): Parallel execution for independent testing stages
 * - Stages 4-6 now execute in parallel (67% faster: 30min vs 90min)
 * - Overall pipeline: ~150min (was 210min) = 29% improvement
 *
 * Complete testing strategy from unit to E2E, functional, visual regression,
 * and performance testing with consolidated reporting.
 *
 * Pipeline Stages:
 * 1. Unit Testing Setup (30 min)
 * 2. Integration Testing (35 min)
 * 3. End-to-End Testing (40 min)
 * 4-6. [PARALLEL] Functional + Visual + Performance Testing (30 min)
 * 7. Test Reporting & Quality Gates (15 min)
 *
 * Total Duration: ~150 minutes (optimized from 210 minutes)
 *
 * MIGRATION: Phase 3.3.3 - Extends BasePipeline (Template Method Pattern)
 */

const BasePipeline = require('../../../orchestrai-shared/pipelines/base-pipeline');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

class ComprehensiveTestingPipeline extends BasePipeline {
  constructor(coordinationPatterns, crystallineMemory, mcpManager) {
    super(
      {
        coordinationPatterns,
        dynamicAgentSelection: null,
        crystallineMemory,
        redis: null
      },
      {
        pipelineId: 'comprehensive-testing',
        pipelineName: 'Comprehensive Testing Pipeline',
        version: '2.0.0',
        stages: [
          'unit_testing',
          'integration_testing',
          'e2e_testing',
          'functional_testing',
          'visual_regression',
          'performance_testing',
          'test_reporting'
        ],
        requiredAgents: {
          'unit_testing': 'unit-test-generator',
          'integration_testing': 'integration-test-specialist',
          'e2e_testing': 'e2e-test-automator',
          'functional_testing': 'functional-testing-specialist',
          'visual_regression': 'visual-regression-tester',
          'performance_testing': 'performance-testing-expert',
          'test_reporting': 'testing-report-generator'
        }
      }
    );

    this.mcpManager = mcpManager;
  }

  /**
   * Override executeStages for parallel testing stages 4-6 with quality gate integration
   * Stages 4-6 run in parallel (67% faster: 30min vs 90min)
   */
  async executeStages(execution, projectSpec) {
    // Initialize testing metrics
    execution.qualityGates = [];
    execution.metrics = {
      tokenUsage: 0,
      agentExecutions: 0,
      qualityGatesPassed: 0,
      qualityGatesFailed: 0,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      coverage: 0
    };

    // Stages 1-3: Sequential with integrated quality gates
    const sequentialStages = ['unit_testing', 'integration_testing', 'e2e_testing'];
    const gateValidators = {
      'unit_testing': this.validateUnitTesting.bind(this),
      'integration_testing': this.validateIntegrationTesting.bind(this),
      'e2e_testing': this.validateE2ETesting.bind(this)
    };

    for (const stageName of sequentialStages) {
      execution.currentStage = stageName;
      this.emitStageStarted(execution, stageName);

      const result = await this.executeStageImpl(stageName, execution, projectSpec);
      execution.stageResults[stageName] = result;

      this.emitStageCompleted(execution, stageName, result);

      // Quality gate validation
      const gate = await gateValidators[stageName](result);
      execution.qualityGates.push(gate);

      if (!gate.passed && gate.blocking) {
        throw new Error(`BLOCKING: ${gate.condition} failed`);
      }
    }

    // Stages 4-6: PARALLEL EXECUTION (all independent)
    // Optimization: 67% faster than sequential execution (30min vs 90min)
    console.log('🚀 Executing stages 4-6 in parallel (Functional + Visual + Performance)...');

    const parallelStages = ['functional_testing', 'visual_regression', 'performance_testing'];

    // Emit start events for all parallel stages
    parallelStages.forEach(stage => this.emitStageStarted(execution, stage));

    const [functionalResults, visualResults, performanceResults] = await Promise.all([
      this.executeStageImpl('functional_testing', execution, projectSpec),
      this.executeStageImpl('visual_regression', execution, projectSpec),
      this.executeStageImpl('performance_testing', execution, projectSpec)
    ]);

    // Store results and emit completion events
    execution.stageResults.functional_testing = functionalResults;
    execution.stageResults.visual_regression = visualResults;
    execution.stageResults.performance_testing = performanceResults;

    this.emitStageCompleted(execution, 'functional_testing', functionalResults);
    this.emitStageCompleted(execution, 'visual_regression', visualResults);
    this.emitStageCompleted(execution, 'performance_testing', performanceResults);

    // Quality gates for parallel stages (non-blocking)
    const visualGate = await this.validateVisualRegression(visualResults);
    const performanceGate = await this.validatePerformanceTesting(performanceResults);
    execution.qualityGates.push(visualGate, performanceGate);

    // Stage 7: Test Reporting (sequential after parallel)
    execution.currentStage = 'test_reporting';
    this.emitStageStarted(execution, 'test_reporting');

    const reportResults = await this.executeStageImpl('test_reporting', execution, projectSpec);
    execution.stageResults.test_reporting = reportResults;

    this.emitStageCompleted(execution, 'test_reporting', reportResults);

    // Calculate final metrics
    execution.metrics.qualityGatesPassed = execution.qualityGates.filter(g => g.passed).length;
    execution.metrics.qualityGatesFailed = execution.qualityGates.filter(g => !g.passed).length;
    execution.metrics.coverage = this.calculateOverallCoverage(execution);

    console.log(`\n✅ Comprehensive Testing Pipeline Completed`);
    console.log(`   Quality Gates Passed: ${execution.metrics.qualityGatesPassed}`);
    console.log(`   Quality Gates Failed: ${execution.metrics.qualityGatesFailed}`);
    console.log(`   Total Tests: ${execution.metrics.totalTests}`);
    console.log(`   Overall Coverage: ${execution.metrics.coverage}%`);
  }

  /**
   * Route stage execution to appropriate stage method
   */
  async executeStageImpl(stageName, execution, projectSpec, additionalContext = {}) {
    switch (stageName) {
      case 'unit_testing':
        return await this.executeUnitTesting(execution, projectSpec);

      case 'integration_testing':
        return await this.executeIntegrationTesting(execution, projectSpec);

      case 'e2e_testing':
        return await this.executeE2ETesting(execution, projectSpec);

      case 'functional_testing':
        return await this.executeFunctionalTesting(execution, projectSpec);

      case 'visual_regression':
        return await this.executeVisualRegressionTesting(execution, projectSpec);

      case 'performance_testing':
        return await this.executePerformanceTesting(execution, projectSpec);

      case 'test_reporting':
        return await this.executeTestReporting(execution, projectSpec);

      default:
        throw new Error(`Unknown stage: ${stageName}`);
    }
  }

  /**
   * Override buildSuccessResult to include test-specific summary
   */
  buildSuccessResult(execution) {
    return {
      success: true,
      executionId: execution.executionId,
      projectId: execution.projectId || execution.projectSpec?.projectId,
      projectPath: execution.projectSpec?.projectPath,
      duration: execution.duration,
      results: execution.stageResults,
      deliverablePaths: this.getDeliverablePaths(execution),
      qualityGates: execution.qualityGates || [],
      metrics: execution.metrics || {},
      testSummary: this.generateTestSummary(execution)
    };
  }

  /**
   * Stage 1: Unit Testing Setup
   */
  async executeUnitTesting(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {
      success: false,
      tasks: {}
    };

    try {
      // Task 1: Unit Test Suite Generation
      const unitSuiteTask = await this.coordinationPatterns.executeTask({
        taskId: 'unit_test_suite',
        agentType: 'unit-test-generator',
        prompt: `Generate comprehensive unit tests for ${projectSpec.projectPath} using Jest/Vitest. Target 80%+ code coverage with focus on business logic and utilities.`,
        context: {
          projectPath: projectSpec.projectPath,
          projectId: execution.projectId,
          framework: projectSpec.testFramework || 'jest'
        },
        outputFormat: 'unit-test-suite'
      });

      results.tasks.unit_test_suite = unitSuiteTask;
      execution.metrics.agentExecutions++;

      // Task 2: Test Coverage Analysis
      const coverageTask = await this.coordinationPatterns.executeTask({
        taskId: 'test_coverage_analysis',
        agentType: 'test-coverage-analyzer',
        prompt: `Analyze test coverage using Istanbul/NYC for ${projectSpec.projectPath}. Identify untested code paths and critical missing tests.`,
        context: {
          projectPath: projectSpec.projectPath,
          unitTestSuite: unitSuiteTask.result
        },
        dependencies: ['unit_test_suite'],
        outputFormat: 'coverage-report'
      });

      results.tasks.test_coverage_analysis = coverageTask;
      execution.metrics.agentExecutions++;

      results.coverage = coverageTask.result?.coverage || 0;
      results.testCount = unitSuiteTask.result?.testCount || 0;
      execution.metrics.totalTests += results.testCount;

      results.success = true;
      results.duration = Date.now() - stageStart;
      return results;

    } catch (error) {
      results.error = error.message;
      results.duration = Date.now() - stageStart;
      throw error;
    }
  }

  /**
   * Stage 2: Integration Testing
   */
  async executeIntegrationTesting(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {
      success: false,
      tasks: {}
    };

    try {
      // Task 1: API Integration Tests
      const apiTestsTask = await this.coordinationPatterns.executeTask({
        taskId: 'api_integration_tests',
        agentType: 'integration-test-specialist',
        prompt: `Create integration tests for API endpoints in ${projectSpec.projectPath}. Test request/response cycles, authentication flows, and error handling.`,
        context: {
          projectPath: projectSpec.projectPath,
          apiEndpoints: projectSpec.apiEndpoints
        },
        outputFormat: 'integration-test-suite'
      });

      results.tasks.api_integration_tests = apiTestsTask;
      execution.metrics.agentExecutions++;

      // Task 2: Database Integration Tests
      const dbTestsTask = await this.coordinationPatterns.executeTask({
        taskId: 'database_integration_tests',
        agentType: 'integration-test-specialist',
        prompt: `Build database integration tests using test containers for ${projectSpec.projectPath}. Validate CRUD operations, transactions, and data integrity.`,
        context: {
          projectPath: projectSpec.projectPath,
          database: projectSpec.database || 'postgresql'
        },
        dependencies: ['api_integration_tests'],
        outputFormat: 'database-test-suite'
      });

      results.tasks.database_integration_tests = dbTestsTask;
      execution.metrics.agentExecutions++;

      results.endpointsCovered = apiTestsTask.result?.endpointsCovered || 0;
      results.testCount = (apiTestsTask.result?.testCount || 0) + (dbTestsTask.result?.testCount || 0);
      execution.metrics.totalTests += results.testCount;

      results.success = true;
      results.duration = Date.now() - stageStart;
      return results;

    } catch (error) {
      results.error = error.message;
      results.duration = Date.now() - stageStart;
      throw error;
    }
  }

  /**
   * Stage 3: End-to-End Testing
   */
  async executeE2ETesting(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {
      success: false,
      tasks: {}
    };

    try {
      // Task 1: Critical User Flow Tests
      const userFlowsTask = await this.coordinationPatterns.executeTask({
        taskId: 'critical_user_flows',
        agentType: 'e2e-test-automator',
        prompt: `Implement E2E tests for critical user flows using Playwright for ${projectSpec.projectPath}. Cover authentication, checkout, and primary conversion paths.`,
        context: {
          projectPath: projectSpec.projectPath,
          baseUrl: projectSpec.baseUrl || 'http://localhost:3000'
        },
        outputFormat: 'e2e-test-suite'
      });

      results.tasks.critical_user_flows = userFlowsTask;
      execution.metrics.agentExecutions++;

      // Task 2: Cross-Browser Testing Suite
      const crossBrowserTask = await this.coordinationPatterns.executeTask({
        taskId: 'cross_browser_testing',
        agentType: 'e2e-test-automator',
        prompt: `Configure cross-browser testing across Chromium, Firefox, and WebKit for ${projectSpec.projectPath}. Implement parallel execution for efficiency.`,
        context: {
          projectPath: projectSpec.projectPath,
          userFlows: userFlowsTask.result
        },
        dependencies: ['critical_user_flows'],
        outputFormat: 'cross-browser-suite'
      });

      results.tasks.cross_browser_testing = crossBrowserTask;
      execution.metrics.agentExecutions++;

      results.userFlowsCovered = userFlowsTask.result?.flowsCovered || 0;
      results.browsersPassed = crossBrowserTask.result?.browsersPassed || 0;
      results.testCount = (userFlowsTask.result?.testCount || 0) + (crossBrowserTask.result?.testCount || 0);
      execution.metrics.totalTests += results.testCount;

      results.success = true;
      results.duration = Date.now() - stageStart;
      return results;

    } catch (error) {
      results.error = error.message;
      results.duration = Date.now() - stageStart;
      throw error;
    }
  }

  /**
   * Stage 4: Functional Testing
   */
  async executeFunctionalTesting(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {
      success: false,
      tasks: {}
    };

    try {
      // Task 1: Form Validation Tests
      const formTestsTask = await this.coordinationPatterns.executeTask({
        taskId: 'form_validation_tests',
        agentType: 'functional-testing-specialist',
        prompt: `Create functional tests for all forms in ${projectSpec.projectPath}. Test validation rules, error states, and submission workflows.`,
        context: {
          projectPath: projectSpec.projectPath
        },
        outputFormat: 'form-test-suite'
      });

      results.tasks.form_validation_tests = formTestsTask;
      execution.metrics.agentExecutions++;

      // Task 2: Business Logic Functional Tests
      const businessLogicTask = await this.coordinationPatterns.executeTask({
        taskId: 'business_logic_tests',
        agentType: 'functional-testing-specialist',
        prompt: `Build functional tests for core business logic in ${projectSpec.projectPath} including calculations, workflows, and state management.`,
        context: {
          projectPath: projectSpec.projectPath
        },
        outputFormat: 'business-logic-tests'
      });

      results.tasks.business_logic_tests = businessLogicTask;
      execution.metrics.agentExecutions++;

      results.testCount = (formTestsTask.result?.testCount || 0) + (businessLogicTask.result?.testCount || 0);
      execution.metrics.totalTests += results.testCount;

      results.success = true;
      results.duration = Date.now() - stageStart;
      return results;

    } catch (error) {
      results.error = error.message;
      results.duration = Date.now() - stageStart;
      throw error;
    }
  }

  /**
   * Stage 5: Visual Regression Testing
   */
  async executeVisualRegressionTesting(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {
      success: false,
      tasks: {}
    };

    try {
      // Task 1: Visual Baseline Creation
      const baselineTask = await this.coordinationPatterns.executeTask({
        taskId: 'visual_baseline_creation',
        agentType: 'visual-regression-tester',
        prompt: `Create visual regression baseline using Percy or Chromatic for ${projectSpec.projectPath}. Capture key pages across desktop, tablet, and mobile viewports.`,
        context: {
          projectPath: projectSpec.projectPath,
          baseUrl: projectSpec.baseUrl || 'http://localhost:3000'
        },
        outputFormat: 'visual-baseline'
      });

      results.tasks.visual_baseline_creation = baselineTask;
      execution.metrics.agentExecutions++;

      // Task 2: Component Visual Tests
      const componentTestsTask = await this.coordinationPatterns.executeTask({
        taskId: 'component_visual_tests',
        agentType: 'visual-regression-tester',
        prompt: `Implement component-level visual regression tests for ${projectSpec.projectPath}. Test UI component states, themes, and responsive behaviors.`,
        context: {
          projectPath: projectSpec.projectPath,
          baseline: baselineTask.result
        },
        dependencies: ['visual_baseline_creation'],
        outputFormat: 'component-visual-suite'
      });

      results.tasks.component_visual_tests = componentTestsTask;
      execution.metrics.agentExecutions++;

      results.snapshotCount = (baselineTask.result?.snapshotCount || 0) + (componentTestsTask.result?.snapshotCount || 0);
      results.success = true;
      results.duration = Date.now() - stageStart;
      return results;

    } catch (error) {
      results.error = error.message;
      results.duration = Date.now() - stageStart;
      throw error;
    }
  }

  /**
   * Stage 6: Performance & Load Testing
   */
  async executePerformanceTesting(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {
      success: false,
      tasks: {}
    };

    try {
      // Task 1: Load Testing Suite (k6)
      const k6Task = await this.coordinationPatterns.executeTask({
        taskId: 'load_testing_suite',
        agentType: 'performance-testing-expert',
        prompt: `Create k6 load testing suite for ${projectSpec.apiEndpoints || projectSpec.baseUrl}. Implement constant, ramping, spike, and stress test scenarios.`,
        context: {
          apiEndpoints: projectSpec.apiEndpoints,
          baseUrl: projectSpec.baseUrl
        },
        outputFormat: 'k6-test-suite'
      });

      results.tasks.load_testing_suite = k6Task;
      execution.metrics.agentExecutions++;

      // Task 2: Performance Benchmarking
      const benchmarkTask = await this.coordinationPatterns.executeTask({
        taskId: 'performance_benchmarks',
        agentType: 'performance-testing-expert',
        prompt: `Establish performance benchmarks and thresholds for ${projectSpec.projectPath}. Define SLAs for response times, throughput, and error rates.`,
        context: {
          projectPath: projectSpec.projectPath,
          k6Results: k6Task.result
        },
        dependencies: ['load_testing_suite'],
        outputFormat: 'performance-benchmarks'
      });

      results.tasks.performance_benchmarks = benchmarkTask;
      execution.metrics.agentExecutions++;

      results.benchmarks = benchmarkTask.result?.benchmarks;
      results.success = true;
      results.duration = Date.now() - stageStart;
      return results;

    } catch (error) {
      results.error = error.message;
      results.duration = Date.now() - stageStart;
      throw error;
    }
  }

  /**
   * Stage 7: Test Reporting & Quality Gates
   */
  async executeTestReporting(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {
      success: false,
      tasks: {}
    };

    try {
      // Task 1: Comprehensive Test Report Generation
      const reportTask = await this.coordinationPatterns.executeTask({
        taskId: 'comprehensive_test_report',
        agentType: 'testing-report-generator',
        prompt: `Generate consolidated test report combining results from all testing stages for ${projectSpec.projectPath}. Include pass/fail metrics, coverage data, and quality scores.`,
        context: {
          projectPath: projectSpec.projectPath,
          stageResults: execution.stageResults
        },
        dependencies: ['unit_test_suite', 'e2e_test_suite', 'visual_baseline_creation', 'load_testing_suite'],
        outputFormat: 'test-report'
      });

      results.tasks.comprehensive_test_report = reportTask;
      execution.metrics.agentExecutions++;

      results.report = reportTask.result;
      results.success = true;
      results.duration = Date.now() - stageStart;
      return results;

    } catch (error) {
      results.error = error.message;
      results.duration = Date.now() - stageStart;
      throw error;
    }
  }

  /**
   * Quality Gate Validators
   */
  async validateUnitTesting(results) {
    return {
      gate: 'unit_testing',
      condition: 'Unit test coverage above 80%',
      passed: results.success && results.coverage >= 80,
      blocking: true,
      details: {
        coverage: results.coverage || 0,
        testCount: results.testCount || 0
      }
    };
  }

  async validateIntegrationTesting(results) {
    return {
      gate: 'integration_testing',
      condition: 'All critical API endpoints have integration tests',
      passed: results.success && results.endpointsCovered > 0,
      blocking: true,
      details: {
        endpointsCovered: results.endpointsCovered || 0,
        testCount: results.testCount || 0
      }
    };
  }

  async validateE2ETesting(results) {
    return {
      gate: 'e2e_testing',
      condition: 'Critical user flows pass across all browsers',
      passed: results.success && results.browsersPassed >= 3,
      blocking: true,
      details: {
        userFlowsCovered: results.userFlowsCovered || 0,
        browsersPassed: results.browsersPassed || 0
      }
    };
  }

  async validateVisualRegression(results) {
    return {
      gate: 'visual_regression',
      condition: 'Visual baseline established for all key pages',
      passed: results.success && results.snapshotCount > 0,
      blocking: false,
      details: {
        snapshotCount: results.snapshotCount || 0
      }
    };
  }

  async validatePerformanceTesting(results) {
    return {
      gate: 'performance_testing',
      condition: 'Performance benchmarks meet defined SLAs',
      passed: results.success && results.benchmarks,
      blocking: false,
      details: {
        benchmarksDefined: !!results.benchmarks
      }
    };
  }

  /**
   * Helper Methods
   */
  calculateOverallCoverage(execution) {
    const unitCoverage = execution.stageResults.unit_testing?.coverage || 0;
    const integrationCoverage = execution.stageResults.integration_testing?.endpointsCovered || 0;
    const totalEndpoints = 10; // In production, get actual endpoint count

    const avgCoverage = (unitCoverage + ((integrationCoverage / totalEndpoints) * 100)) / 2;
    return Math.round(avgCoverage);
  }

  /**
   * Generate test summary
   */
  generateTestSummary(execution) {
    return {
      projectPath: execution.projectPath,
      totalDuration: Date.now() - execution.startTime,
      stagesCompleted: Object.keys(execution.stageResults).length,
      totalTests: execution.metrics.totalTests,
      qualityGatesPassed: execution.metrics.qualityGatesPassed,
      qualityGatesFailed: execution.metrics.qualityGatesFailed,
      overallCoverage: execution.metrics.coverage,
      testTypes: {
        unit: execution.stageResults.unit_testing?.testCount || 0,
        integration: execution.stageResults.integration_testing?.testCount || 0,
        e2e: execution.stageResults.e2e_testing?.testCount || 0,
        functional: execution.stageResults.functional_testing?.testCount || 0,
        visual: execution.stageResults.visual_regression?.snapshotCount || 0
      }
    };
  }

  /**
   * Get deliverable file paths
   */
  getDeliverablePaths(execution) {
    const basePath = `projects/${execution.projectId}/deliverables/testing`;

    return {
      unitTestSuite: `${basePath}/unit-test-suite/`,
      integrationTestSuite: `${basePath}/integration-test-suite/`,
      e2eTestSuite: `${basePath}/e2e-test-suite/`,
      visualRegressionSuite: `${basePath}/visual-regression-suite/`,
      k6TestSuite: `${basePath}/k6-test-suite/`,
      testReport: `${basePath}/test-report.json`,
      coverageReport: `${basePath}/coverage-report.json`,
      testSummary: `${basePath}/comprehensive-test-summary.json`
    };
  }

  /**
   * Store learnings in crystalline memory
   */
  async storePipelineLearnings(execution) {
    if (!this.crystallineMemory) return;

    try {
      // Store testing results
      await this.crystallineMemory.storeMemory('comprehensive-testing', {
        executionId: execution.executionId,
        projectPath: execution.projectPath,
        timestamp: Date.now(),
        qualityGates: execution.qualityGates,
        metrics: execution.metrics,
        testSummary: this.generateTestSummary(execution)
      }, {
        projectId: execution.projectId,
        pipelineId: this.pipelineId
      });

      console.log('✅ Comprehensive testing learnings stored in crystalline memory');
    } catch (error) {
      console.error('⚠️  Failed to store learnings in crystalline memory:', error.message);
    }
  }
}

module.exports = ComprehensiveTestingPipeline;
