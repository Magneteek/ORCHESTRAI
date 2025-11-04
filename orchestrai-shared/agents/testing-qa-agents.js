/**
 * Testing & QA Domain Specialized Agents
 *
 * This module implements 8 specialized Claude Code subagents for comprehensive
 * testing, quality assurance, and validation workflows.
 *
 * Agents:
 * 1. UnitTestGenerator - Creates comprehensive unit test suites
 * 2. IntegrationTestSpecialist - Designs integration testing strategies
 * 3. E2ETestAutomator - Implements end-to-end testing with Playwright/Cypress
 * 4. PerformanceTestingExpert - Load testing and performance benchmarking
 * 5. AccessibilityValidator - WCAG compliance and a11y testing
 * 6. SecurityTestingSpecialist - Security auditing and vulnerability scanning
 * 7. VisualRegressionTester - Visual diff testing and screenshot comparison
 * 8. TestCoverageAnalyzer - Coverage analysis and quality metrics
 */

const BaseSpecializedAgent = require('./base-specialized-agent');

// ============================================================================
// 1. UNIT TEST GENERATOR
// ============================================================================

class UnitTestGenerator extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'unit-test-generator',
      domain: 'testing-qa',
      capabilities: [
        'unit-testing',
        'test-generation',
        'jest-testing',
        'vitest-testing',
        'mocha-testing',
        'assertion-design',
        'mock-creation',
        'test-organization'
      ],
      description: 'Generates comprehensive unit test suites with edge cases and mocking',
      priority: 0.95
    });

    this.testingFrameworks = {
      jest: { extension: '.test.js', mocking: 'jest.mock', assertions: 'expect' },
      vitest: { extension: '.test.ts', mocking: 'vi.mock', assertions: 'expect' },
      mocha: { extension: '.spec.js', mocking: 'sinon', assertions: 'chai' }
    };
  }

  async executeTask(task, context) {
    const { sourceCode, framework = 'jest', coverageTarget = 80 } = task.parameters;

    this.log(`Generating unit tests for ${framework} framework (target: ${coverageTarget}% coverage)`);

    // Step 1: Analyze source code structure
    const codeAnalysis = await this.analyzeSourceCode(sourceCode, context);

    // Step 2: Identify test cases (happy path, edge cases, error scenarios)
    const testCases = await this.identifyTestCases(codeAnalysis, context);

    // Step 3: Generate test suite
    const testSuite = await this.generateTestSuite(testCases, framework, context);

    // Step 4: Create mocks and fixtures
    const mocks = await this.generateMocks(codeAnalysis.dependencies, framework, context);

    // Step 5: Calculate estimated coverage
    const estimatedCoverage = this.estimateCoverage(testCases, codeAnalysis);

    return {
      testSuite,
      mocks,
      testCases: testCases.length,
      estimatedCoverage,
      framework,
      recommendations: this.generateRecommendations(estimatedCoverage, coverageTarget)
    };
  }

  async analyzeSourceCode(sourceCode, context) {
    return {
      functions: this.extractFunctions(sourceCode),
      classes: this.extractClasses(sourceCode),
      dependencies: this.extractDependencies(sourceCode),
      complexity: this.calculateComplexity(sourceCode),
      edgeCases: this.identifyEdgeCases(sourceCode)
    };
  }

  extractFunctions(sourceCode) {
    // Simple regex-based extraction (in production, use AST parsing)
    const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g;
    const functions = [];
    let match;

    while ((match = functionRegex.exec(sourceCode)) !== null) {
      functions.push({
        name: match[1] || match[2],
        async: sourceCode.includes('async'),
        parameters: this.extractParameters(match[0])
      });
    }

    return functions;
  }

  extractClasses(sourceCode) {
    const classRegex = /class\s+(\w+)(?:\s+extends\s+(\w+))?\s*{/g;
    const classes = [];
    let match;

    while ((match = classRegex.exec(sourceCode)) !== null) {
      classes.push({
        name: match[1],
        extends: match[2] || null,
        methods: this.extractClassMethods(sourceCode, match[1])
      });
    }

    return classes;
  }

  extractClassMethods(sourceCode, className) {
    // Simplified method extraction
    return ['constructor', 'execute', 'validate'];
  }

  extractDependencies(sourceCode) {
    const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
    const dependencies = [];
    let match;

    while ((match = importRegex.exec(sourceCode)) !== null) {
      dependencies.push(match[1]);
    }

    return dependencies;
  }

  calculateComplexity(sourceCode) {
    // Simplified cyclomatic complexity calculation
    const conditionals = (sourceCode.match(/\b(if|else|switch|case|for|while|catch)\b/g) || []).length;
    const logicalOps = (sourceCode.match(/&&|\|\|/g) || []).length;
    return conditionals + logicalOps + 1;
  }

  identifyEdgeCases(sourceCode) {
    return [
      { type: 'null-check', priority: 'high' },
      { type: 'empty-array', priority: 'medium' },
      { type: 'boundary-values', priority: 'high' },
      { type: 'async-errors', priority: 'high' }
    ];
  }

  extractParameters(functionSignature) {
    const paramMatch = functionSignature.match(/\(([^)]*)\)/);
    if (!paramMatch) return [];
    return paramMatch[1].split(',').map(p => p.trim()).filter(Boolean);
  }

  async identifyTestCases(codeAnalysis, context) {
    const testCases = [];

    // Generate tests for each function
    for (const func of codeAnalysis.functions) {
      testCases.push({
        type: 'happy-path',
        target: func.name,
        description: `should execute ${func.name} successfully with valid inputs`
      });

      testCases.push({
        type: 'edge-case',
        target: func.name,
        description: `should handle edge cases for ${func.name}`
      });

      if (func.async) {
        testCases.push({
          type: 'error-handling',
          target: func.name,
          description: `should handle async errors in ${func.name}`
        });
      }
    }

    // Generate tests for each class
    for (const cls of codeAnalysis.classes) {
      testCases.push({
        type: 'instantiation',
        target: cls.name,
        description: `should create ${cls.name} instance correctly`
      });

      for (const method of cls.methods) {
        testCases.push({
          type: 'method-test',
          target: `${cls.name}.${method}`,
          description: `should test ${cls.name}.${method}() behavior`
        });
      }
    }

    return testCases;
  }

  async generateTestSuite(testCases, framework, context) {
    const frameworkConfig = this.testingFrameworks[framework];

    let testCode = `// Generated Unit Tests\n`;
    testCode += `// Framework: ${framework}\n`;
    testCode += `// Total Test Cases: ${testCases.length}\n\n`;

    if (framework === 'jest' || framework === 'vitest') {
      testCode += `import { describe, it, expect, ${framework === 'vitest' ? 'vi' : 'jest'} } from '${framework}';\n\n`;
    }

    // Group test cases by target
    const groupedTests = this.groupTestsByTarget(testCases);

    for (const [target, cases] of Object.entries(groupedTests)) {
      testCode += `describe('${target}', () => {\n`;

      for (const testCase of cases) {
        testCode += `  it('${testCase.description}', async () => {\n`;
        testCode += `    // TODO: Implement test\n`;
        testCode += `    ${frameworkConfig.assertions}(true).toBe(true);\n`;
        testCode += `  });\n\n`;
      }

      testCode += `});\n\n`;
    }

    return testCode;
  }

  groupTestsByTarget(testCases) {
    const grouped = {};
    for (const testCase of testCases) {
      if (!grouped[testCase.target]) {
        grouped[testCase.target] = [];
      }
      grouped[testCase.target].push(testCase);
    }
    return grouped;
  }

  async generateMocks(dependencies, framework, context) {
    const mocks = {};

    for (const dep of dependencies) {
      if (this.shouldMock(dep)) {
        mocks[dep] = {
          framework,
          mockCode: this.createMockCode(dep, framework)
        };
      }
    }

    return mocks;
  }

  shouldMock(dependency) {
    // Mock external dependencies, not internal modules
    return !dependency.startsWith('.') && !dependency.startsWith('/');
  }

  createMockCode(dependency, framework) {
    if (framework === 'jest') {
      return `jest.mock('${dependency}', () => ({\n  default: jest.fn()\n}));`;
    } else if (framework === 'vitest') {
      return `vi.mock('${dependency}', () => ({\n  default: vi.fn()\n}));`;
    }
    return `// Manual mock for ${dependency}`;
  }

  estimateCoverage(testCases, codeAnalysis) {
    const totalFunctions = codeAnalysis.functions.length +
                          codeAnalysis.classes.reduce((sum, cls) => sum + cls.methods.length, 0);

    const coveredFunctions = new Set(testCases.map(tc => tc.target)).size;

    return totalFunctions > 0 ? Math.round((coveredFunctions / totalFunctions) * 100) : 0;
  }

  generateRecommendations(estimatedCoverage, coverageTarget) {
    const recommendations = [];

    if (estimatedCoverage < coverageTarget) {
      recommendations.push(`Increase test coverage from ${estimatedCoverage}% to ${coverageTarget}%`);
      recommendations.push('Add more edge case tests');
      recommendations.push('Test error handling paths');
    }

    recommendations.push('Add integration tests for complex workflows');
    recommendations.push('Consider snapshot testing for component outputs');

    return recommendations;
  }

  canHandle(task) {
    const keywords = ['unit test', 'test generation', 'jest', 'vitest', 'mocha', 'test coverage'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword) ||
      task.type?.toLowerCase().includes('test')
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.framework === 'jest') priority += 0.1;
    if (task.parameters?.coverageTarget >= 90) priority += 0.05;
    if (context?.criticalPath) priority += 0.15;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 2. INTEGRATION TEST SPECIALIST
// ============================================================================

class IntegrationTestSpecialist extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'integration-test-specialist',
      domain: 'testing-qa',
      capabilities: [
        'integration-testing',
        'api-testing',
        'database-testing',
        'microservices-testing',
        'contract-testing',
        'service-mocking',
        'test-orchestration'
      ],
      description: 'Designs and implements integration testing strategies for multi-component systems',
      priority: 0.90
    });
  }

  async executeTask(task, context) {
    const { services, integrationPoints, testEnvironment = 'staging' } = task.parameters;

    this.log(`Designing integration tests for ${services?.length || 0} services`);

    // Step 1: Map integration points
    const integrationMap = await this.mapIntegrationPoints(services, integrationPoints, context);

    // Step 2: Design test scenarios
    const testScenarios = await this.designTestScenarios(integrationMap, context);

    // Step 3: Generate test code
    const testCode = await this.generateIntegrationTests(testScenarios, testEnvironment, context);

    // Step 4: Create test data fixtures
    const fixtures = await this.createTestFixtures(testScenarios, context);

    // Step 5: Design mocking strategy
    const mockingStrategy = await this.designMockingStrategy(integrationMap, context);

    return {
      integrationMap,
      testScenarios: testScenarios.length,
      testCode,
      fixtures,
      mockingStrategy,
      estimatedExecutionTime: this.estimateExecutionTime(testScenarios)
    };
  }

  async mapIntegrationPoints(services, integrationPoints, context) {
    const map = {
      services: services || [],
      integrations: [],
      dependencies: new Map()
    };

    // Identify service-to-service communications
    for (const service of map.services) {
      const deps = this.identifyServiceDependencies(service, integrationPoints);
      map.dependencies.set(service.name, deps);

      for (const dep of deps) {
        map.integrations.push({
          from: service.name,
          to: dep.service,
          type: dep.type, // 'api', 'database', 'message-queue', 'grpc'
          protocol: dep.protocol
        });
      }
    }

    return map;
  }

  identifyServiceDependencies(service, integrationPoints) {
    // In production, analyze actual service code and configuration
    return integrationPoints?.filter(ip => ip.source === service.name) || [];
  }

  async designTestScenarios(integrationMap, context) {
    const scenarios = [];

    // Create scenarios for each integration
    for (const integration of integrationMap.integrations) {
      scenarios.push({
        name: `${integration.from} → ${integration.to} integration`,
        type: integration.type,
        steps: this.generateIntegrationSteps(integration),
        assertions: this.generateAssertions(integration),
        priority: this.calculateScenarioPriority(integration)
      });

      // Add failure scenario
      scenarios.push({
        name: `${integration.from} → ${integration.to} failure handling`,
        type: `${integration.type}-failure`,
        steps: this.generateFailureSteps(integration),
        assertions: this.generateFailureAssertions(integration),
        priority: 0.8
      });
    }

    // Add end-to-end scenarios
    scenarios.push({
      name: 'Complete workflow integration',
      type: 'end-to-end',
      steps: this.generateE2ESteps(integrationMap),
      assertions: this.generateE2EAssertions(integrationMap),
      priority: 0.95
    });

    return scenarios;
  }

  generateIntegrationSteps(integration) {
    return [
      `Initialize ${integration.from} service`,
      `Send request to ${integration.to} via ${integration.protocol}`,
      `Verify response from ${integration.to}`,
      `Validate data consistency`
    ];
  }

  generateAssertions(integration) {
    return [
      `Response status should be 200`,
      `Response data should match expected schema`,
      `Integration should complete within SLA`
    ];
  }

  calculateScenarioPriority(integration) {
    // Prioritize critical paths
    const criticalTypes = ['api', 'database'];
    return criticalTypes.includes(integration.type) ? 0.9 : 0.7;
  }

  generateFailureSteps(integration) {
    return [
      `Initialize ${integration.from} service`,
      `Simulate ${integration.to} unavailability`,
      `Verify error handling`,
      `Check retry mechanism`,
      `Validate circuit breaker activation`
    ];
  }

  generateFailureAssertions(integration) {
    return [
      `Should return appropriate error code`,
      `Should not crash the service`,
      `Should log error details`,
      `Should activate fallback mechanism`
    ];
  }

  generateE2ESteps(integrationMap) {
    const steps = ['Start complete workflow'];
    for (const integration of integrationMap.integrations) {
      steps.push(`Execute ${integration.from} → ${integration.to}`);
    }
    steps.push('Verify final state');
    return steps;
  }

  generateE2EAssertions(integrationMap) {
    return [
      'All services should respond successfully',
      'Data should flow correctly through all integrations',
      'Final state should match expected outcome',
      'No data loss or corruption'
    ];
  }

  async generateIntegrationTests(testScenarios, testEnvironment, context) {
    let testCode = `// Integration Test Suite\n`;
    testCode += `// Environment: ${testEnvironment}\n`;
    testCode += `// Scenarios: ${testScenarios.length}\n\n`;

    testCode += `import { describe, it, expect, beforeAll, afterAll } from 'jest';\n\n`;

    testCode += `describe('Integration Tests', () => {\n`;
    testCode += `  beforeAll(async () => {\n`;
    testCode += `    // Setup test environment\n`;
    testCode += `    await setupTestEnvironment();\n`;
    testCode += `  });\n\n`;

    for (const scenario of testScenarios) {
      testCode += `  describe('${scenario.name}', () => {\n`;
      testCode += `    it('should execute integration successfully', async () => {\n`;

      for (const step of scenario.steps) {
        testCode += `      // ${step}\n`;
      }

      testCode += `\n`;
      for (const assertion of scenario.assertions) {
        testCode += `      // ${assertion}\n`;
      }

      testCode += `      expect(true).toBe(true); // TODO: Implement assertions\n`;
      testCode += `    });\n`;
      testCode += `  });\n\n`;
    }

    testCode += `  afterAll(async () => {\n`;
    testCode += `    // Cleanup test environment\n`;
    testCode += `    await cleanupTestEnvironment();\n`;
    testCode += `  });\n`;
    testCode += `});\n`;

    return testCode;
  }

  async createTestFixtures(testScenarios, context) {
    return {
      database: this.createDatabaseFixtures(),
      api: this.createApiFixtures(),
      messageQueue: this.createMessageQueueFixtures()
    };
  }

  createDatabaseFixtures() {
    return {
      users: [{ id: 1, name: 'Test User', email: 'test@example.com' }],
      products: [{ id: 1, name: 'Test Product', price: 99.99 }]
    };
  }

  createApiFixtures() {
    return {
      validRequest: { method: 'POST', body: { data: 'test' } },
      invalidRequest: { method: 'POST', body: {} }
    };
  }

  createMessageQueueFixtures() {
    return {
      validMessage: { type: 'order.created', payload: { orderId: 1 } }
    };
  }

  async designMockingStrategy(integrationMap, context) {
    return {
      approach: 'selective-mocking',
      mockExternal: true,
      mockDatabase: false, // Use test database
      mockServices: integrationMap.integrations.map(int => ({
        service: int.to,
        mock: int.type === 'external-api'
      }))
    };
  }

  estimateExecutionTime(testScenarios) {
    // Estimate 2 seconds per scenario
    return `${testScenarios.length * 2} seconds`;
  }

  canHandle(task) {
    const keywords = ['integration test', 'api test', 'service test', 'microservice', 'contract test'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.services?.length > 3) priority += 0.1;
    if (context?.microservicesArchitecture) priority += 0.15;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 3. E2E TEST AUTOMATOR
// ============================================================================

class E2ETestAutomator extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'e2e-test-automator',
      domain: 'testing-qa',
      capabilities: [
        'e2e-testing',
        'playwright-automation',
        'cypress-automation',
        'user-flow-testing',
        'browser-automation',
        'screenshot-testing',
        'video-recording'
      ],
      description: 'Implements end-to-end testing with Playwright/Cypress for user workflows',
      priority: 0.92
    });

    this.frameworks = ['playwright', 'cypress'];
  }

  async executeTask(task, context) {
    const {
      userFlows,
      framework = 'playwright',
      browsers = ['chromium'],
      viewport = { width: 1280, height: 720 }
    } = task.parameters;

    this.log(`Creating E2E tests with ${framework} for ${userFlows?.length || 0} user flows`);

    // Step 1: Analyze user flows
    const flowAnalysis = await this.analyzeUserFlows(userFlows, context);

    // Step 2: Generate test code
    const testCode = await this.generateE2ETests(flowAnalysis, framework, context);

    // Step 3: Create page object models
    const pageObjects = await this.createPageObjects(flowAnalysis, framework, context);

    // Step 4: Generate test configuration
    const config = await this.generateTestConfig(framework, browsers, viewport, context);

    return {
      testCode,
      pageObjects,
      config,
      totalFlows: userFlows?.length || 0,
      estimatedDuration: this.estimateTestDuration(userFlows)
    };
  }

  async analyzeUserFlows(userFlows, context) {
    return (userFlows || []).map(flow => ({
      name: flow.name,
      steps: flow.steps || [],
      selectors: this.extractSelectors(flow.steps),
      assertions: this.extractAssertions(flow.steps),
      pages: this.identifyPages(flow.steps)
    }));
  }

  extractSelectors(steps) {
    // Extract CSS selectors from steps
    return steps.map((step, idx) => ({
      step: idx + 1,
      selector: step.selector || `[data-testid="${step.target}"]`,
      action: step.action
    }));
  }

  extractAssertions(steps) {
    return steps.filter(step => step.assert).map(step => ({
      type: step.assert.type,
      expected: step.assert.expected
    }));
  }

  identifyPages(steps) {
    const pages = new Set();
    steps.forEach(step => {
      if (step.page) pages.add(step.page);
    });
    return Array.from(pages);
  }

  async generateE2ETests(flowAnalysis, framework, context) {
    if (framework === 'playwright') {
      return this.generatePlaywrightTests(flowAnalysis);
    } else if (framework === 'cypress') {
      return this.generateCypressTests(flowAnalysis);
    }
    return '';
  }

  generatePlaywrightTests(flowAnalysis) {
    let testCode = `// Playwright E2E Tests\n`;
    testCode += `import { test, expect } from '@playwright/test';\n\n`;

    for (const flow of flowAnalysis) {
      testCode += `test('${flow.name}', async ({ page }) => {\n`;

      for (const selector of flow.selectors) {
        if (selector.action === 'click') {
          testCode += `  await page.click('${selector.selector}');\n`;
        } else if (selector.action === 'type') {
          testCode += `  await page.fill('${selector.selector}', 'test input');\n`;
        } else if (selector.action === 'navigate') {
          testCode += `  await page.goto('${selector.selector}');\n`;
        }
      }

      testCode += `\n`;

      for (const assertion of flow.assertions) {
        if (assertion.type === 'visible') {
          testCode += `  await expect(page.locator('${assertion.expected}')).toBeVisible();\n`;
        } else if (assertion.type === 'text') {
          testCode += `  await expect(page.locator('body')).toContainText('${assertion.expected}');\n`;
        }
      }

      testCode += `});\n\n`;
    }

    return testCode;
  }

  generateCypressTests(flowAnalysis) {
    let testCode = `// Cypress E2E Tests\n`;
    testCode += `describe('E2E Tests', () => {\n`;

    for (const flow of flowAnalysis) {
      testCode += `  it('${flow.name}', () => {\n`;

      for (const selector of flow.selectors) {
        if (selector.action === 'click') {
          testCode += `    cy.get('${selector.selector}').click();\n`;
        } else if (selector.action === 'type') {
          testCode += `    cy.get('${selector.selector}').type('test input');\n`;
        } else if (selector.action === 'navigate') {
          testCode += `    cy.visit('${selector.selector}');\n`;
        }
      }

      testCode += `\n`;

      for (const assertion of flow.assertions) {
        if (assertion.type === 'visible') {
          testCode += `    cy.get('${assertion.expected}').should('be.visible');\n`;
        } else if (assertion.type === 'text') {
          testCode += `    cy.contains('${assertion.expected}');\n`;
        }
      }

      testCode += `  });\n\n`;
    }

    testCode += `});\n`;

    return testCode;
  }

  async createPageObjects(flowAnalysis, framework, context) {
    const pageObjects = {};

    const allPages = new Set();
    flowAnalysis.forEach(flow => {
      flow.pages.forEach(page => allPages.add(page));
    });

    for (const page of allPages) {
      pageObjects[page] = this.generatePageObject(page, framework);
    }

    return pageObjects;
  }

  generatePageObject(pageName, framework) {
    if (framework === 'playwright') {
      return `export class ${pageName}Page {
  constructor(page) {
    this.page = page;
  }

  async navigate() {
    await this.page.goto('/${pageName.toLowerCase()}');
  }

  async clickButton(buttonId) {
    await this.page.click(\`[data-testid="\${buttonId}"]\`);
  }
}`;
    }

    return `// Page object for ${pageName}`;
  }

  async generateTestConfig(framework, browsers, viewport, context) {
    if (framework === 'playwright') {
      return {
        testDir: './e2e',
        use: {
          viewport,
          screenshot: 'only-on-failure',
          video: 'retain-on-failure'
        },
        projects: browsers.map(browser => ({
          name: browser,
          use: { browserName: browser }
        }))
      };
    }

    return { framework, browsers, viewport };
  }

  estimateTestDuration(userFlows) {
    return `${(userFlows?.length || 0) * 30} seconds`;
  }

  canHandle(task) {
    const keywords = ['e2e', 'end-to-end', 'playwright', 'cypress', 'user flow', 'browser test'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.framework === 'playwright') priority += 0.08;
    if (task.parameters?.userFlows?.length > 5) priority += 0.1;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 4. PERFORMANCE TESTING EXPERT
// ============================================================================

class PerformanceTestingExpert extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'performance-testing-expert',
      domain: 'testing-qa',
      capabilities: [
        'load-testing',
        'stress-testing',
        'performance-benchmarking',
        'k6-testing',
        'artillery-testing',
        'lighthouse-auditing',
        'web-vitals-monitoring'
      ],
      description: 'Implements load testing, performance benchmarking, and Core Web Vitals monitoring',
      priority: 0.88
    });
  }

  async executeTask(task, context) {
    const {
      targetUrl,
      testType = 'load',
      virtualUsers = 100,
      duration = '5m',
      tool = 'k6'
    } = task.parameters;

    this.log(`Creating ${testType} test with ${virtualUsers} virtual users for ${duration}`);

    // Step 1: Design test scenarios
    const scenarios = await this.designPerformanceScenarios(testType, virtualUsers, duration, context);

    // Step 2: Generate test script
    const testScript = await this.generatePerformanceTest(scenarios, tool, context);

    // Step 3: Define performance thresholds
    const thresholds = await this.definePerformanceThresholds(testType, context);

    // Step 4: Create monitoring configuration
    const monitoring = await this.setupPerformanceMonitoring(targetUrl, context);

    return {
      testScript,
      scenarios,
      thresholds,
      monitoring,
      estimatedLoad: this.estimateServerLoad(virtualUsers)
    };
  }

  async designPerformanceScenarios(testType, virtualUsers, duration, context) {
    const scenarios = [];

    if (testType === 'load') {
      scenarios.push({
        name: 'Constant Load',
        executor: 'constant-vus',
        vus: virtualUsers,
        duration,
        description: `Maintain ${virtualUsers} concurrent users for ${duration}`
      });
    } else if (testType === 'stress') {
      scenarios.push({
        name: 'Ramping Load',
        executor: 'ramping-vus',
        stages: [
          { duration: '2m', target: virtualUsers / 4 },
          { duration: '5m', target: virtualUsers },
          { duration: '2m', target: virtualUsers * 2 },
          { duration: '5m', target: virtualUsers * 2 },
          { duration: '2m', target: 0 }
        ],
        description: 'Gradually increase load to find breaking point'
      });
    } else if (testType === 'spike') {
      scenarios.push({
        name: 'Spike Test',
        executor: 'ramping-vus',
        stages: [
          { duration: '10s', target: virtualUsers },
          { duration: '1m', target: virtualUsers * 5 },
          { duration: '10s', target: virtualUsers },
          { duration: '3m', target: virtualUsers }
        ],
        description: 'Test system behavior under sudden traffic spikes'
      });
    }

    return scenarios;
  }

  async generatePerformanceTest(scenarios, tool, context) {
    if (tool === 'k6') {
      return this.generateK6Script(scenarios);
    } else if (tool === 'artillery') {
      return this.generateArtilleryScript(scenarios);
    }
    return '';
  }

  generateK6Script(scenarios) {
    let script = `import http from 'k6/http';\n`;
    script += `import { check, sleep } from 'k6';\n`;
    script += `import { Rate } from 'k6/metrics';\n\n`;

    script += `const errorRate = new Rate('errors');\n\n`;

    script += `export const options = {\n`;
    script += `  scenarios: {\n`;

    for (const scenario of scenarios) {
      script += `    ${scenario.name.replace(/\s+/g, '_')}: {\n`;
      script += `      executor: '${scenario.executor}',\n`;

      if (scenario.vus) {
        script += `      vus: ${scenario.vus},\n`;
        script += `      duration: '${scenario.duration}',\n`;
      }

      if (scenario.stages) {
        script += `      stages: [\n`;
        for (const stage of scenario.stages) {
          script += `        { duration: '${stage.duration}', target: ${stage.target} },\n`;
        }
        script += `      ],\n`;
      }

      script += `    },\n`;
    }

    script += `  },\n`;
    script += `  thresholds: {\n`;
    script += `    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms\n`;
    script += `    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%\n`;
    script += `  },\n`;
    script += `};\n\n`;

    script += `export default function() {\n`;
    script += `  const res = http.get('https://test.example.com');\n`;
    script += `  \n`;
    script += `  check(res, {\n`;
    script += `    'status is 200': (r) => r.status === 200,\n`;
    script += `    'response time < 500ms': (r) => r.timings.duration < 500,\n`;
    script += `  });\n`;
    script += `  \n`;
    script += `  errorRate.add(res.status !== 200);\n`;
    script += `  \n`;
    script += `  sleep(1);\n`;
    script += `}\n`;

    return script;
  }

  generateArtilleryScript(scenarios) {
    let script = `config:\n`;
    script += `  target: 'https://test.example.com'\n`;
    script += `  phases:\n`;

    for (const scenario of scenarios) {
      if (scenario.stages) {
        for (const stage of scenario.stages) {
          script += `    - duration: ${this.convertDuration(stage.duration)}\n`;
          script += `      arrivalRate: ${Math.floor(stage.target / 60)}\n`;
        }
      }
    }

    script += `scenarios:\n`;
    script += `  - flow:\n`;
    script += `    - get:\n`;
    script += `        url: '/'\n`;

    return script;
  }

  convertDuration(duration) {
    // Convert '2m' to seconds
    if (duration.endsWith('m')) {
      return parseInt(duration) * 60;
    } else if (duration.endsWith('s')) {
      return parseInt(duration);
    }
    return 60;
  }

  async definePerformanceThresholds(testType, context) {
    return {
      responseTime: {
        p50: 200,  // 50th percentile
        p95: 500,  // 95th percentile
        p99: 1000  // 99th percentile
      },
      errorRate: 0.01,     // 1% maximum error rate
      throughput: 1000,    // requests per second
      availability: 99.9   // 99.9% uptime
    };
  }

  async setupPerformanceMonitoring(targetUrl, context) {
    return {
      lighthouse: {
        enabled: true,
        metrics: ['FCP', 'LCP', 'CLS', 'TBT', 'SI'],
        thresholds: {
          FCP: 1.8,   // First Contentful Paint < 1.8s
          LCP: 2.5,   // Largest Contentful Paint < 2.5s
          CLS: 0.1,   // Cumulative Layout Shift < 0.1
          TBT: 300,   // Total Blocking Time < 300ms
          SI: 3.4     // Speed Index < 3.4s
        }
      },
      webVitals: {
        enabled: true,
        realUserMonitoring: true
      }
    };
  }

  estimateServerLoad(virtualUsers) {
    return {
      cpu: `${Math.min(virtualUsers / 10, 80)}%`,
      memory: `${Math.min(virtualUsers * 5, 4000)}MB`,
      network: `${Math.min(virtualUsers * 0.1, 100)}Mbps`
    };
  }

  canHandle(task) {
    const keywords = ['performance', 'load test', 'stress test', 'benchmark', 'k6', 'artillery', 'web vitals'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.testType === 'stress') priority += 0.1;
    if (task.parameters?.virtualUsers > 500) priority += 0.12;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 5. ACCESSIBILITY VALIDATOR
// ============================================================================

class AccessibilityValidator extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'accessibility-validator',
      domain: 'testing-qa',
      capabilities: [
        'wcag-compliance',
        'aria-validation',
        'keyboard-navigation',
        'screen-reader-testing',
        'color-contrast',
        'axe-core-testing',
        'a11y-auditing'
      ],
      description: 'Validates WCAG compliance and implements comprehensive accessibility testing',
      priority: 0.87
    });

    this.wcagLevels = ['A', 'AA', 'AAA'];
  }

  async executeTask(task, context) {
    const {
      targetUrl,
      wcagLevel = 'AA',
      includeScreenReader = true,
      includeKeyboardNav = true
    } = task.parameters;

    this.log(`Running WCAG ${wcagLevel} accessibility audit`);

    // Step 1: Run automated accessibility checks
    const automatedChecks = await this.runAutomatedChecks(targetUrl, wcagLevel, context);

    // Step 2: Generate keyboard navigation tests
    const keyboardTests = includeKeyboardNav ?
      await this.generateKeyboardTests(targetUrl, context) : null;

    // Step 3: Create screen reader test scenarios
    const screenReaderTests = includeScreenReader ?
      await this.generateScreenReaderTests(targetUrl, context) : null;

    // Step 4: Check color contrast
    const contrastAnalysis = await this.analyzeColorContrast(targetUrl, context);

    // Step 5: Generate remediation recommendations
    const recommendations = await this.generateRemediationPlan(
      automatedChecks,
      contrastAnalysis,
      context
    );

    return {
      automatedChecks,
      keyboardTests,
      screenReaderTests,
      contrastAnalysis,
      recommendations,
      wcagLevel,
      complianceScore: this.calculateComplianceScore(automatedChecks)
    };
  }

  async runAutomatedChecks(targetUrl, wcagLevel, context) {
    // Simulated axe-core results
    return {
      violations: [
        {
          id: 'color-contrast',
          impact: 'serious',
          description: 'Elements must have sufficient color contrast',
          nodes: 3
        },
        {
          id: 'image-alt',
          impact: 'critical',
          description: 'Images must have alternate text',
          nodes: 5
        }
      ],
      passes: [
        {
          id: 'aria-roles',
          description: 'ARIA roles are used correctly',
          nodes: 20
        }
      ],
      incomplete: [
        {
          id: 'color-contrast-enhanced',
          description: 'Color contrast (AAA) could not be determined',
          nodes: 2
        }
      ]
    };
  }

  async generateKeyboardTests(targetUrl, context) {
    return {
      testCode: `// Keyboard Navigation Tests
describe('Keyboard Accessibility', () => {
  it('should navigate entire page with Tab key', async () => {
    // Press Tab through all focusable elements
    // Verify focus order is logical
    // Ensure no keyboard traps
  });

  it('should activate interactive elements with Enter/Space', async () => {
    // Test buttons, links, form controls
  });

  it('should support escape key for modals/dropdowns', async () => {
    // Verify Escape closes overlays
  });
});`,
      focusableElements: ['button', 'a', 'input', 'select', 'textarea'],
      keyboardShortcuts: this.identifyKeyboardShortcuts()
    };
  }

  identifyKeyboardShortcuts() {
    return [
      { key: 'Tab', action: 'Move focus forward' },
      { key: 'Shift+Tab', action: 'Move focus backward' },
      { key: 'Enter', action: 'Activate element' },
      { key: 'Space', action: 'Activate button/checkbox' },
      { key: 'Escape', action: 'Close modal/dropdown' }
    ];
  }

  async generateScreenReaderTests(targetUrl, context) {
    return {
      testScenarios: [
        {
          name: 'Navigation landmarks',
          steps: [
            'Verify presence of header, main, nav, footer landmarks',
            'Check skip navigation link',
            'Validate heading hierarchy (h1 → h6)'
          ]
        },
        {
          name: 'Form accessibility',
          steps: [
            'Verify all inputs have associated labels',
            'Check error message associations',
            'Validate ARIA live regions for dynamic content'
          ]
        },
        {
          name: 'Interactive widgets',
          steps: [
            'Test ARIA roles for custom widgets',
            'Verify state changes announced',
            'Check focus management for modals'
          ]
        }
      ],
      ariaAttributes: this.listRequiredAriaAttributes()
    };
  }

  listRequiredAriaAttributes() {
    return [
      'aria-label',
      'aria-labelledby',
      'aria-describedby',
      'aria-hidden',
      'aria-live',
      'aria-expanded',
      'aria-selected',
      'aria-checked'
    ];
  }

  async analyzeColorContrast(targetUrl, context) {
    return {
      issues: [
        {
          element: 'button.primary',
          foreground: '#777777',
          background: '#FFFFFF',
          ratio: 3.5,
          required: 4.5,
          level: 'AA',
          status: 'fail'
        },
        {
          element: 'p.description',
          foreground: '#595959',
          background: '#FFFFFF',
          ratio: 7.2,
          required: 4.5,
          level: 'AA',
          status: 'pass'
        }
      ],
      summary: {
        total: 2,
        pass: 1,
        fail: 1
      }
    };
  }

  async generateRemediationPlan(automatedChecks, contrastAnalysis, context) {
    const recommendations = [];

    // From automated checks
    for (const violation of automatedChecks.violations) {
      if (violation.id === 'image-alt') {
        recommendations.push({
          priority: 'critical',
          issue: 'Missing alt text on images',
          solution: 'Add descriptive alt attributes to all images',
          code: '<img src="..." alt="Descriptive text here" />'
        });
      } else if (violation.id === 'color-contrast') {
        recommendations.push({
          priority: 'serious',
          issue: 'Insufficient color contrast',
          solution: 'Increase contrast ratio to at least 4.5:1',
          code: 'color: #333333; /* Instead of #777777 */'
        });
      }
    }

    // From contrast analysis
    for (const issue of contrastAnalysis.issues) {
      if (issue.status === 'fail') {
        recommendations.push({
          priority: 'high',
          issue: `Low contrast on ${issue.element}`,
          solution: `Change foreground to darker color to achieve ${issue.required}:1 ratio`,
          currentRatio: issue.ratio,
          requiredRatio: issue.required
        });
      }
    }

    return recommendations;
  }

  calculateComplianceScore(automatedChecks) {
    const total = automatedChecks.violations.length + automatedChecks.passes.length;
    const passes = automatedChecks.passes.length;
    return total > 0 ? Math.round((passes / total) * 100) : 0;
  }

  canHandle(task) {
    const keywords = ['accessibility', 'a11y', 'wcag', 'aria', 'screen reader', 'keyboard', 'contrast'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.wcagLevel === 'AAA') priority += 0.13;
    if (context?.publicFacing) priority += 0.1;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 6. SECURITY TESTING SPECIALIST
// ============================================================================

class SecurityTestingSpecialist extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'security-testing-specialist',
      domain: 'testing-qa',
      capabilities: [
        'security-auditing',
        'vulnerability-scanning',
        'penetration-testing',
        'owasp-top10',
        'dependency-scanning',
        'secret-detection',
        'security-headers'
      ],
      description: 'Performs security auditing, vulnerability scanning, and OWASP compliance testing',
      priority: 0.93
    });

    this.owaspTop10 = [
      'Broken Access Control',
      'Cryptographic Failures',
      'Injection',
      'Insecure Design',
      'Security Misconfiguration',
      'Vulnerable Components',
      'Authentication Failures',
      'Software Data Integrity Failures',
      'Security Logging Failures',
      'Server-Side Request Forgery'
    ];
  }

  async executeTask(task, context) {
    const {
      targetUrl,
      codebase,
      checkDependencies = true,
      checkSecrets = true,
      checkHeaders = true
    } = task.parameters;

    this.log('Running comprehensive security audit');

    // Step 1: OWASP Top 10 vulnerability scan
    const owaspScan = await this.scanOwaspVulnerabilities(targetUrl, context);

    // Step 2: Dependency vulnerability check
    const dependencyScan = checkDependencies ?
      await this.scanDependencies(codebase, context) : null;

    // Step 3: Secret detection
    const secretScan = checkSecrets ?
      await this.detectSecrets(codebase, context) : null;

    // Step 4: Security headers analysis
    const headersScan = checkHeaders ?
      await this.analyzeSecurityHeaders(targetUrl, context) : null;

    // Step 5: Generate security recommendations
    const recommendations = await this.generateSecurityRecommendations(
      owaspScan,
      dependencyScan,
      secretScan,
      headersScan,
      context
    );

    return {
      owaspScan,
      dependencyScan,
      secretScan,
      headersScan,
      recommendations,
      securityScore: this.calculateSecurityScore(owaspScan, dependencyScan, headersScan),
      criticalIssues: this.countCriticalIssues(owaspScan, dependencyScan)
    };
  }

  async scanOwaspVulnerabilities(targetUrl, context) {
    // Simulated OWASP scan results
    return {
      'Broken Access Control': {
        status: 'pass',
        findings: []
      },
      'Injection': {
        status: 'warning',
        findings: [
          {
            severity: 'medium',
            description: 'Potential SQL injection in search endpoint',
            location: '/api/search',
            recommendation: 'Use parameterized queries'
          }
        ]
      },
      'Security Misconfiguration': {
        status: 'fail',
        findings: [
          {
            severity: 'high',
            description: 'Debug mode enabled in production',
            location: 'config.js',
            recommendation: 'Disable debug mode in production'
          },
          {
            severity: 'medium',
            description: 'Directory listing enabled',
            location: '/assets/',
            recommendation: 'Disable directory listing'
          }
        ]
      },
      'Vulnerable Components': {
        status: 'fail',
        findings: [
          {
            severity: 'critical',
            description: 'Outdated React version with known vulnerabilities',
            location: 'package.json',
            recommendation: 'Update React to latest stable version'
          }
        ]
      }
    };
  }

  async scanDependencies(codebase, context) {
    // Simulated npm audit results
    return {
      vulnerabilities: {
        critical: 2,
        high: 5,
        moderate: 12,
        low: 8
      },
      details: [
        {
          package: 'lodash',
          severity: 'high',
          version: '4.17.15',
          fixedIn: '4.17.21',
          vulnerability: 'Prototype Pollution',
          cve: 'CVE-2020-8203'
        },
        {
          package: 'axios',
          severity: 'critical',
          version: '0.18.0',
          fixedIn: '0.21.1',
          vulnerability: 'Server-Side Request Forgery',
          cve: 'CVE-2020-28168'
        }
      ]
    };
  }

  async detectSecrets(codebase, context) {
    // Simulated secret detection
    return {
      secrets: [
        {
          type: 'AWS Access Key',
          location: 'src/config/aws.js:12',
          severity: 'critical',
          recommendation: 'Move to environment variables'
        },
        {
          type: 'API Key',
          location: 'src/services/payment.js:45',
          severity: 'high',
          recommendation: 'Use secure secret management'
        }
      ],
      totalSecrets: 2
    };
  }

  async analyzeSecurityHeaders(targetUrl, context) {
    return {
      headers: {
        'Strict-Transport-Security': {
          present: false,
          severity: 'high',
          recommendation: 'Add HSTS header: max-age=31536000; includeSubDomains'
        },
        'Content-Security-Policy': {
          present: true,
          value: "default-src 'self'",
          severity: 'info',
          recommendation: 'Consider stricter CSP policy'
        },
        'X-Content-Type-Options': {
          present: true,
          value: 'nosniff',
          severity: 'pass'
        },
        'X-Frame-Options': {
          present: false,
          severity: 'medium',
          recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN'
        },
        'X-XSS-Protection': {
          present: false,
          severity: 'low',
          recommendation: 'Add X-XSS-Protection: 1; mode=block'
        }
      }
    };
  }

  async generateSecurityRecommendations(owaspScan, dependencyScan, secretScan, headersScan, context) {
    const recommendations = [];

    // OWASP recommendations
    for (const [category, result] of Object.entries(owaspScan)) {
      if (result.status === 'fail') {
        for (const finding of result.findings) {
          recommendations.push({
            category: 'OWASP',
            severity: finding.severity,
            issue: finding.description,
            solution: finding.recommendation,
            location: finding.location
          });
        }
      }
    }

    // Dependency recommendations
    if (dependencyScan?.details) {
      for (const vuln of dependencyScan.details) {
        recommendations.push({
          category: 'Dependencies',
          severity: vuln.severity,
          issue: `${vuln.package}: ${vuln.vulnerability}`,
          solution: `Update to version ${vuln.fixedIn}`,
          cve: vuln.cve
        });
      }
    }

    // Secret recommendations
    if (secretScan?.secrets) {
      for (const secret of secretScan.secrets) {
        recommendations.push({
          category: 'Secrets',
          severity: secret.severity,
          issue: `Exposed ${secret.type}`,
          solution: secret.recommendation,
          location: secret.location
        });
      }
    }

    // Header recommendations
    if (headersScan?.headers) {
      for (const [header, info] of Object.entries(headersScan.headers)) {
        if (!info.present || info.severity !== 'pass') {
          recommendations.push({
            category: 'Security Headers',
            severity: info.severity,
            issue: `Missing or incorrect ${header}`,
            solution: info.recommendation
          });
        }
      }
    }

    return recommendations.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  calculateSecurityScore(owaspScan, dependencyScan, headersScan) {
    let score = 100;

    // Deduct for OWASP issues
    for (const result of Object.values(owaspScan)) {
      if (result.status === 'fail') {
        score -= result.findings.length * 10;
      } else if (result.status === 'warning') {
        score -= result.findings.length * 5;
      }
    }

    // Deduct for dependency vulnerabilities
    if (dependencyScan) {
      score -= dependencyScan.vulnerabilities.critical * 15;
      score -= dependencyScan.vulnerabilities.high * 10;
      score -= dependencyScan.vulnerabilities.moderate * 5;
    }

    // Deduct for missing headers
    if (headersScan) {
      for (const info of Object.values(headersScan.headers)) {
        if (!info.present) score -= 5;
      }
    }

    return Math.max(score, 0);
  }

  countCriticalIssues(owaspScan, dependencyScan) {
    let count = 0;

    for (const result of Object.values(owaspScan)) {
      count += result.findings.filter(f => f.severity === 'critical').length;
    }

    if (dependencyScan) {
      count += dependencyScan.vulnerabilities.critical;
    }

    return count;
  }

  canHandle(task) {
    const keywords = ['security', 'vulnerability', 'penetration', 'owasp', 'audit', 'secret'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (context?.productionEnvironment) priority += 0.15;
    if (task.parameters?.checkSecrets) priority += 0.07;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 7. VISUAL REGRESSION TESTER
// ============================================================================

class VisualRegressionTester extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'visual-regression-tester',
      domain: 'testing-qa',
      capabilities: [
        'visual-regression',
        'screenshot-comparison',
        'percy-integration',
        'chromatic-testing',
        'pixel-diff-analysis',
        'responsive-testing'
      ],
      description: 'Implements visual regression testing with screenshot comparison and pixel diff analysis',
      priority: 0.85
    });

    this.tools = ['percy', 'chromatic', 'backstopjs'];
  }

  async executeTask(task, context) {
    const {
      baselineUrl,
      targetUrl,
      viewports = [{ width: 1920, height: 1080 }, { width: 375, height: 667 }],
      tool = 'percy',
      threshold = 0.1 // 0.1% pixel difference threshold
    } = task.parameters;

    this.log(`Running visual regression tests with ${viewports.length} viewports`);

    // Step 1: Capture baseline screenshots
    const baselineScreenshots = await this.captureScreenshots(baselineUrl, viewports, context);

    // Step 2: Capture current screenshots
    const currentScreenshots = await this.captureScreenshots(targetUrl, viewports, context);

    // Step 3: Compare screenshots
    const comparisons = await this.compareScreenshots(
      baselineScreenshots,
      currentScreenshots,
      threshold,
      context
    );

    // Step 4: Analyze differences
    const analysis = await this.analyzeDifferences(comparisons, context);

    // Step 5: Generate test code
    const testCode = await this.generateVisualTests(tool, viewports, context);

    return {
      comparisons,
      analysis,
      testCode,
      totalTests: viewports.length,
      failedTests: comparisons.filter(c => c.status === 'fail').length,
      passedTests: comparisons.filter(c => c.status === 'pass').length
    };
  }

  async captureScreenshots(url, viewports, context) {
    const screenshots = [];

    for (const viewport of viewports) {
      screenshots.push({
        viewport,
        url,
        timestamp: Date.now(),
        imagePath: `/screenshots/${viewport.width}x${viewport.height}.png`
      });
    }

    return screenshots;
  }

  async compareScreenshots(baseline, current, threshold, context) {
    const comparisons = [];

    for (let i = 0; i < baseline.length; i++) {
      const diff = Math.random() * 5; // Simulated pixel difference percentage

      comparisons.push({
        viewport: baseline[i].viewport,
        baselineImage: baseline[i].imagePath,
        currentImage: current[i].imagePath,
        diffPercentage: diff,
        threshold,
        status: diff <= threshold ? 'pass' : 'fail',
        diffImage: `/diffs/${baseline[i].viewport.width}x${baseline[i].viewport.height}.png`
      });
    }

    return comparisons;
  }

  async analyzeDifferences(comparisons, context) {
    const failed = comparisons.filter(c => c.status === 'fail');

    return {
      totalComparisons: comparisons.length,
      passed: comparisons.length - failed.length,
      failed: failed.length,
      maxDifference: Math.max(...comparisons.map(c => c.diffPercentage)),
      avgDifference: comparisons.reduce((sum, c) => sum + c.diffPercentage, 0) / comparisons.length,
      failedViewports: failed.map(f => f.viewport),
      recommendations: this.generateVisualRecommendations(failed)
    };
  }

  generateVisualRecommendations(failedComparisons) {
    const recommendations = [];

    if (failedComparisons.length > 0) {
      recommendations.push('Review failed visual comparisons manually');
      recommendations.push('Check for unintended CSS changes');
      recommendations.push('Verify responsive breakpoint behavior');

      if (failedComparisons.some(f => f.diffPercentage > 5)) {
        recommendations.push('Major visual changes detected - review carefully');
      }
    }

    return recommendations;
  }

  async generateVisualTests(tool, viewports, context) {
    if (tool === 'percy') {
      return this.generatePercyTests(viewports);
    } else if (tool === 'chromatic') {
      return this.generateChromaticTests(viewports);
    } else if (tool === 'backstopjs') {
      return this.generateBackstopTests(viewports);
    }
    return '';
  }

  generatePercyTests(viewports) {
    let testCode = `// Percy Visual Regression Tests\n`;
    testCode += `import percySnapshot from '@percy/playwright';\n`;
    testCode += `import { test } from '@playwright/test';\n\n`;

    testCode += `test('Visual regression test', async ({ page }) => {\n`;
    testCode += `  await page.goto('https://example.com');\n\n`;

    for (const viewport of viewports) {
      testCode += `  await page.setViewportSize({ width: ${viewport.width}, height: ${viewport.height} });\n`;
      testCode += `  await percySnapshot(page, 'Homepage ${viewport.width}x${viewport.height}');\n\n`;
    }

    testCode += `});\n`;

    return testCode;
  }

  generateChromaticTests(viewports) {
    let testCode = `// Chromatic Visual Tests\n`;
    testCode += `// Configure in .storybook/main.js\n\n`;
    testCode += `export const parameters = {\n`;
    testCode += `  chromatic: {\n`;
    testCode += `    viewports: [${viewports.map(v => v.width).join(', ')}],\n`;
    testCode += `    delay: 300,\n`;
    testCode += `    diffThreshold: 0.1\n`;
    testCode += `  }\n`;
    testCode += `};\n`;

    return testCode;
  }

  generateBackstopTests(viewports) {
    let config = `// BackstopJS Configuration\n`;
    config += `module.exports = {\n`;
    config += `  id: 'visual_regression',\n`;
    config += `  viewports: [\n`;

    for (const viewport of viewports) {
      config += `    {\n`;
      config += `      name: '${viewport.width}x${viewport.height}',\n`;
      config += `      width: ${viewport.width},\n`;
      config += `      height: ${viewport.height}\n`;
      config += `    },\n`;
    }

    config += `  ],\n`;
    config += `  scenarios: [\n`;
    config += `    {\n`;
    config += `      label: 'Homepage',\n`;
    config += `      url: 'https://example.com',\n`;
    config += `      misMatchThreshold: 0.1\n`;
    config += `    }\n`;
    config += `  ]\n`;
    config += `};\n`;

    return config;
  }

  canHandle(task) {
    const keywords = ['visual regression', 'screenshot', 'pixel diff', 'percy', 'chromatic', 'visual test'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.viewports?.length > 5) priority += 0.1;
    if (context?.uiCritical) priority += 0.15;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// 8. TEST COVERAGE ANALYZER
// ============================================================================

class TestCoverageAnalyzer extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      ...config,
      agentId: 'test-coverage-analyzer',
      domain: 'testing-qa',
      capabilities: [
        'coverage-analysis',
        'istanbul-integration',
        'nyc-reporting',
        'coverage-metrics',
        'untested-code-detection',
        'coverage-visualization'
      ],
      description: 'Analyzes test coverage, identifies gaps, and generates comprehensive coverage reports',
      priority: 0.86
    });

    this.coverageThresholds = {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    };
  }

  async executeTask(task, context) {
    const {
      codebase,
      testSuite,
      targetCoverage = 80,
      includeVisualization = true
    } = task.parameters;

    this.log(`Analyzing test coverage (target: ${targetCoverage}%)`);

    // Step 1: Analyze current coverage
    const coverageReport = await this.analyzeCoverage(codebase, testSuite, context);

    // Step 2: Identify uncovered code
    const uncoveredCode = await this.identifyUncoveredCode(coverageReport, context);

    // Step 3: Calculate coverage metrics
    const metrics = await this.calculateCoverageMetrics(coverageReport, context);

    // Step 4: Generate recommendations
    const recommendations = await this.generateCoverageRecommendations(
      metrics,
      uncoveredCode,
      targetCoverage,
      context
    );

    // Step 5: Create visualization
    const visualization = includeVisualization ?
      await this.createCoverageVisualization(coverageReport, context) : null;

    return {
      coverageReport,
      uncoveredCode,
      metrics,
      recommendations,
      visualization,
      meetsTarget: metrics.overall >= targetCoverage
    };
  }

  async analyzeCoverage(codebase, testSuite, context) {
    // Simulated coverage report (in production, use Istanbul/NYC)
    return {
      statements: {
        total: 500,
        covered: 425,
        skipped: 0,
        pct: 85
      },
      branches: {
        total: 200,
        covered: 140,
        skipped: 0,
        pct: 70
      },
      functions: {
        total: 100,
        covered: 82,
        skipped: 0,
        pct: 82
      },
      lines: {
        total: 480,
        covered: 408,
        skipped: 0,
        pct: 85
      },
      files: {
        'src/utils/helpers.js': {
          statements: { pct: 95 },
          branches: { pct: 85 },
          functions: { pct: 100 },
          lines: { pct: 95 }
        },
        'src/services/api.js': {
          statements: { pct: 60 },
          branches: { pct: 45 },
          functions: { pct: 55 },
          lines: { pct: 60 }
        },
        'src/components/Button.jsx': {
          statements: { pct: 90 },
          branches: { pct: 80 },
          functions: { pct: 85 },
          lines: { pct: 90 }
        }
      }
    };
  }

  async identifyUncoveredCode(coverageReport, context) {
    const uncovered = [];

    for (const [file, coverage] of Object.entries(coverageReport.files)) {
      if (coverage.statements.pct < 80) {
        uncovered.push({
          file,
          type: 'low-coverage',
          currentCoverage: coverage.statements.pct,
          targetCoverage: 80,
          gap: 80 - coverage.statements.pct,
          priority: this.calculatePriority(coverage)
        });
      }

      if (coverage.branches.pct < 75) {
        uncovered.push({
          file,
          type: 'low-branch-coverage',
          currentCoverage: coverage.branches.pct,
          targetCoverage: 75,
          gap: 75 - coverage.branches.pct,
          priority: this.calculatePriority(coverage)
        });
      }
    }

    return uncovered.sort((a, b) => b.priority - a.priority);
  }

  calculatePriority(coverage) {
    // Higher priority for files with lower coverage
    const avgCoverage = (
      coverage.statements.pct +
      coverage.branches.pct +
      coverage.functions.pct +
      coverage.lines.pct
    ) / 4;

    return 100 - avgCoverage;
  }

  async calculateCoverageMetrics(coverageReport, context) {
    return {
      overall: Math.round(
        (coverageReport.statements.pct +
         coverageReport.branches.pct +
         coverageReport.functions.pct +
         coverageReport.lines.pct) / 4
      ),
      statements: coverageReport.statements.pct,
      branches: coverageReport.branches.pct,
      functions: coverageReport.functions.pct,
      lines: coverageReport.lines.pct,
      totalFiles: Object.keys(coverageReport.files).length,
      wellCoveredFiles: Object.values(coverageReport.files).filter(
        f => f.statements.pct >= 80
      ).length,
      poorlyCoveredFiles: Object.values(coverageReport.files).filter(
        f => f.statements.pct < 60
      ).length
    };
  }

  async generateCoverageRecommendations(metrics, uncoveredCode, targetCoverage, context) {
    const recommendations = [];

    if (metrics.overall < targetCoverage) {
      recommendations.push({
        priority: 'high',
        category: 'Overall Coverage',
        issue: `Current coverage ${metrics.overall}% is below target ${targetCoverage}%`,
        solution: `Increase coverage by ${targetCoverage - metrics.overall}%`,
        actionItems: [
          'Focus on files with lowest coverage first',
          'Add edge case tests',
          'Test error handling paths'
        ]
      });
    }

    if (metrics.branches < 75) {
      recommendations.push({
        priority: 'high',
        category: 'Branch Coverage',
        issue: `Branch coverage ${metrics.branches}% is below 75%`,
        solution: 'Add tests for conditional logic branches',
        actionItems: [
          'Test both true and false conditions',
          'Cover all switch/case statements',
          'Test ternary operators'
        ]
      });
    }

    // File-specific recommendations
    for (const item of uncoveredCode.slice(0, 5)) {
      recommendations.push({
        priority: 'medium',
        category: 'File Coverage',
        issue: `${item.file} has ${item.currentCoverage}% coverage`,
        solution: `Add tests to reach ${item.targetCoverage}% coverage`,
        actionItems: [
          'Identify untested functions',
          'Add unit tests for core logic',
          'Test error scenarios'
        ]
      });
    }

    return recommendations;
  }

  async createCoverageVisualization(coverageReport, context) {
    // ASCII bar chart for coverage
    let viz = '\n📊 Coverage Overview:\n\n';

    viz += this.createBar('Statements', coverageReport.statements.pct);
    viz += this.createBar('Branches  ', coverageReport.branches.pct);
    viz += this.createBar('Functions ', coverageReport.functions.pct);
    viz += this.createBar('Lines     ', coverageReport.lines.pct);

    viz += '\n📁 File Coverage:\n\n';

    for (const [file, coverage] of Object.entries(coverageReport.files)) {
      viz += `${file.padEnd(30)} ${this.createMiniBar(coverage.statements.pct)}\n`;
    }

    return viz;
  }

  createBar(label, percentage) {
    const barLength = 50;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const color = percentage >= 80 ? '✅' : percentage >= 60 ? '⚠️ ' : '❌';

    return `${label}: [${bar}] ${percentage}% ${color}\n`;
  }

  createMiniBar(percentage) {
    const barLength = 20;
    const filled = Math.round((percentage / 100) * barLength);
    const empty = barLength - filled;

    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${percentage}%`;
  }

  canHandle(task) {
    const keywords = ['coverage', 'test coverage', 'istanbul', 'nyc', 'coverage report', 'uncovered'];
    return keywords.some(keyword =>
      task.description?.toLowerCase().includes(keyword)
    );
  }

  getPriority(task, context) {
    let priority = this.basePriority;

    if (task.parameters?.targetCoverage >= 90) priority += 0.14;
    if (context?.ciCd) priority += 0.1;

    return Math.min(priority, 1.0);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  UnitTestGenerator,
  IntegrationTestSpecialist,
  E2ETestAutomator,
  PerformanceTestingExpert,
  AccessibilityValidator,
  SecurityTestingSpecialist,
  VisualRegressionTester,
  TestCoverageAnalyzer
};
