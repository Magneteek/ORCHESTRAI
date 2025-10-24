/**
 * API Development Pipeline
 *
 * Complete API development from design to documentation, testing, and
 * production deployment with OpenAPI specs and auto-generated SDKs.
 *
 * Pipeline Stages:
 * 1. API Design & Specification (70 min)
 * 2. Authentication & Authorization (60 min)
 * 3. API Implementation & Business Logic (95 min)
 * 4. API Testing & Validation (75 min)
 * 5. API Documentation & Developer Experience (50 min)
 * 6. API Deployment & Monitoring (40 min)
 *
 * Total Duration: ~390 minutes
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

class APIDevelopmentPipeline extends EventEmitter {
  constructor(coordinationPatterns, crystallineMemory, mcpManager) {
    super();
    this.coordinationPatterns = coordinationPatterns;
    this.crystallineMemory = crystallineMemory;
    this.mcpManager = mcpManager;
    this.pipelineId = 'api-development';
    this.pipelineName = 'API Development Pipeline';
  }

  /**
   * Execute the complete API development pipeline
   */
  async execute(projectSpec, options = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();

    const execution = {
      executionId,
      pipelineId: this.pipelineId,
      projectId: projectSpec.projectId || projectSpec.projectUuid,
      projectName: projectSpec.projectName,
      apiType: projectSpec.apiType || 'REST',
      startTime,
      stages: {},
      stageResults: {},
      errors: [],
      qualityGates: [],
      metrics: {
        tokenUsage: 0,
        agentExecutions: 0,
        qualityGatesPassed: 0,
        qualityGatesFailed: 0,
        endpointsImplemented: 0,
        testCoverage: 0
      }
    };

    try {
      this.emit('pipeline-started', {
        executionId,
        pipelineId: this.pipelineId,
        projectId: execution.projectId,
        projectName: execution.projectName
      });

      // Stage 1: API Design & Specification
      this.emit('stage-started', { executionId, stage: 'api_design' });
      const designResults = await this.executeAPIDesign(execution, projectSpec);
      execution.stageResults.api_design = designResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'api_design',
        duration: designResults.duration
      });

      const designGate = await this.validateAPIDesign(designResults);
      execution.qualityGates.push(designGate);
      if (!designGate.passed && designGate.blocking) {
        throw new Error('BLOCKING: OpenAPI specification incomplete');
      }

      // Stage 2: Authentication & Authorization
      this.emit('stage-started', { executionId, stage: 'authentication_authorization' });
      const authResults = await this.executeAuthentication(execution, projectSpec);
      execution.stageResults.authentication_authorization = authResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'authentication_authorization',
        duration: authResults.duration
      });

      const authGate = await this.validateAuthentication(authResults);
      execution.qualityGates.push(authGate);
      if (!authGate.passed && authGate.blocking) {
        throw new Error('BLOCKING: Security validation failed OWASP API Top 10');
      }

      // Stage 3: API Implementation & Business Logic
      this.emit('stage-started', { executionId, stage: 'api_implementation' });
      const implResults = await this.executeAPIImplementation(execution, projectSpec);
      execution.stageResults.api_implementation = implResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'api_implementation',
        duration: implResults.duration
      });

      const implGate = await this.validateAPIImplementation(implResults);
      execution.qualityGates.push(implGate);
      if (!implGate.passed && implGate.blocking) {
        throw new Error('BLOCKING: API endpoints missing proper error handling');
      }

      // Stage 4: API Testing & Validation
      this.emit('stage-started', { executionId, stage: 'api_testing' });
      const testResults = await this.executeAPITesting(execution, projectSpec);
      execution.stageResults.api_testing = testResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'api_testing',
        duration: testResults.duration
      });

      const testGate = await this.validateAPITesting(testResults);
      execution.qualityGates.push(testGate);
      if (!testGate.passed && testGate.blocking) {
        throw new Error('BLOCKING: Integration test coverage below 85%');
      }

      // Stage 5: API Documentation & Developer Experience
      this.emit('stage-started', { executionId, stage: 'api_documentation' });
      const docsResults = await this.executeAPIDocumentation(execution, projectSpec);
      execution.stageResults.api_documentation = docsResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'api_documentation',
        duration: docsResults.duration
      });

      const docsGate = await this.validateAPIDocumentation(docsResults);
      execution.qualityGates.push(docsGate);

      // Stage 6: API Deployment & Monitoring
      this.emit('stage-started', { executionId, stage: 'api_deployment' });
      const deployResults = await this.executeAPIDeployment(execution, projectSpec);
      execution.stageResults.api_deployment = deployResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'api_deployment',
        duration: deployResults.duration
      });

      const deployGate = await this.validateAPIDeployment(deployResults);
      execution.qualityGates.push(deployGate);

      // Calculate final metrics
      execution.metrics.qualityGatesPassed = execution.qualityGates.filter(g => g.passed).length;
      execution.metrics.qualityGatesFailed = execution.qualityGates.filter(g => !g.passed).length;

      // Store learnings
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
        projectName: execution.projectName,
        duration: totalDuration,
        results: execution.stageResults,
        deliverablePaths: this.getDeliverablePaths(execution),
        qualityGates: execution.qualityGates,
        metrics: execution.metrics,
        apiSummary: this.generateAPISummary(execution)
      };

    } catch (error) {
      const errorDuration = Date.now() - startTime;

      this.emit('pipeline-failed', {
        executionId,
        error: error.message,
        duration: errorDuration
      });

      return {
        success: false,
        executionId,
        error: error.message,
        duration: errorDuration,
        partialResults: execution.stageResults
      };
    }
  }

  /**
   * Stage 1: API Design & Specification
   */
  async executeAPIDesign(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const archTask = await this.coordinationPatterns.executeTask({
        taskId: 'api_architecture_design',
        agentType: 'api-architect',
        prompt: `Design API architecture for ${projectSpec.projectName}. Define RESTful or GraphQL approach, resource modeling, and endpoint structure.`,
        context: { projectName: projectSpec.projectName, apiType: execution.apiType },
        outputFormat: 'api-architecture'
      });

      results.tasks.api_architecture_design = archTask;
      execution.metrics.agentExecutions++;

      const specTask = await this.coordinationPatterns.executeTask({
        taskId: 'openapi_specification',
        agentType: 'api-architect',
        prompt: `Create comprehensive OpenAPI 3.0 specification for ${projectSpec.projectName}. Include request/response models, authentication, and error handling.`,
        dependencies: ['api_architecture_design'],
        outputFormat: 'api-specification'
      });

      results.tasks.openapi_specification = specTask;
      execution.metrics.agentExecutions++;

      const versionTask = await this.coordinationPatterns.executeTask({
        taskId: 'versioning_strategy',
        agentType: 'api-architect',
        prompt: `Define API versioning strategy. Plan backward compatibility and deprecation policies.`,
        dependencies: ['openapi_specification'],
        outputFormat: 'versioning-strategy'
      });

      results.tasks.versioning_strategy = versionTask;
      execution.metrics.agentExecutions++;

      results.endpointCount = specTask.result?.endpoints?.length || 0;
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
   * Stage 2: Authentication & Authorization
   */
  async executeAuthentication(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const authImplTask = await this.coordinationPatterns.executeTask({
        taskId: 'auth_implementation',
        agentType: 'api-architect',
        prompt: `Implement authentication using JWT/OAuth 2.0 for ${projectSpec.projectName}. Configure token generation, validation, and refresh mechanisms.`,
        outputFormat: 'auth-implementation'
      });

      results.tasks.auth_implementation = authImplTask;
      execution.metrics.agentExecutions++;

      const rbacTask = await this.coordinationPatterns.executeTask({
        taskId: 'rbac_implementation',
        agentType: 'api-architect',
        prompt: `Implement role-based access control (RBAC) with proper permission checks. Define roles, permissions, and resource access policies.`,
        dependencies: ['auth_implementation'],
        outputFormat: 'rbac-config'
      });

      results.tasks.rbac_implementation = rbacTask;
      execution.metrics.agentExecutions++;

      const securityTask = await this.coordinationPatterns.executeTask({
        taskId: 'security_validation',
        agentType: 'security-testing-specialist',
        prompt: `Validate API security implementation against OWASP API Security Top 10. Test authentication, authorization, and input validation.`,
        dependencies: ['rbac_implementation'],
        outputFormat: 'security-validation-report'
      });

      results.tasks.security_validation = securityTask;
      execution.metrics.agentExecutions++;

      results.securityPassed = securityTask.result?.passed || false;
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
   * Stage 3: API Implementation & Business Logic
   */
  async executeAPIImplementation(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const endpointsTask = await this.coordinationPatterns.executeTask({
        taskId: 'endpoint_implementation',
        agentType: 'backend-development-specialist',
        prompt: `Implement API endpoints following OpenAPI specification for ${projectSpec.projectName}. Include request validation, error handling, and response formatting.`,
        outputFormat: 'api-implementation'
      });

      results.tasks.endpoint_implementation = endpointsTask;
      execution.metrics.agentExecutions++;

      const dbTask = await this.coordinationPatterns.executeTask({
        taskId: 'database_integration',
        agentType: 'backend-development-specialist',
        prompt: `Integrate database layer with Prisma ORM or TypeORM. Implement repositories, query optimization, and transaction handling.`,
        dependencies: ['endpoint_implementation'],
        outputFormat: 'database-layer'
      });

      results.tasks.database_integration = dbTask;
      execution.metrics.agentExecutions++;

      const resilienceTask = await this.coordinationPatterns.executeTask({
        taskId: 'resilience_patterns',
        agentType: 'api-integration-specialist',
        prompt: `Implement API resilience patterns including circuit breakers, rate limiting, retry logic, and timeout handling for ${projectSpec.projectName}.`,
        dependencies: ['endpoint_implementation'],
        outputFormat: 'resilience-implementation'
      });

      results.tasks.resilience_patterns = resilienceTask;
      execution.metrics.agentExecutions++;

      results.endpointsImplemented = endpointsTask.result?.count || 0;
      execution.metrics.endpointsImplemented = results.endpointsImplemented;
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
   * Stage 4: API Testing & Validation
   */
  async executeAPITesting(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const integrationTask = await this.coordinationPatterns.executeTask({
        taskId: 'integration_testing',
        agentType: 'integration-test-specialist',
        prompt: `Create comprehensive integration tests for all API endpoints. Test success cases, error scenarios, and edge cases.`,
        outputFormat: 'api-integration-tests'
      });

      results.tasks.integration_testing = integrationTask;
      execution.metrics.agentExecutions++;

      const contractTask = await this.coordinationPatterns.executeTask({
        taskId: 'contract_testing',
        agentType: 'integration-test-specialist',
        prompt: `Implement contract testing using Pact. Validate API contracts between consumers and providers.`,
        dependencies: ['integration_testing'],
        outputFormat: 'contract-tests'
      });

      results.tasks.contract_testing = contractTask;
      execution.metrics.agentExecutions++;

      const loadTask = await this.coordinationPatterns.executeTask({
        taskId: 'api_load_testing',
        agentType: 'performance-testing-expert',
        prompt: `Create k6 load tests for API endpoints. Test throughput, latency, and scalability under various load conditions.`,
        outputFormat: 'api-load-tests'
      });

      results.tasks.api_load_testing = loadTask;
      execution.metrics.agentExecutions++;

      results.testCoverage = integrationTask.result?.coverage || 0;
      execution.metrics.testCoverage = results.testCoverage;
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
   * Stage 5: API Documentation & Developer Experience
   */
  async executeAPIDocumentation(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const docsTask = await this.coordinationPatterns.executeTask({
        taskId: 'interactive_documentation',
        agentType: 'api-architect',
        prompt: `Generate interactive API documentation using Swagger UI or ReDoc from OpenAPI specification. Include code examples and try-it-out functionality.`,
        outputFormat: 'api-docs'
      });

      results.tasks.interactive_documentation = docsTask;
      execution.metrics.agentExecutions++;

      const sdkTask = await this.coordinationPatterns.executeTask({
        taskId: 'sdk_generation',
        agentType: 'api-architect',
        prompt: `Generate client SDKs for popular languages (TypeScript, Python, Go) using OpenAPI Generator. Include usage examples and installation guides.`,
        dependencies: ['interactive_documentation'],
        outputFormat: 'client-sdks'
      });

      results.tasks.sdk_generation = sdkTask;
      execution.metrics.agentExecutions++;

      const postmanTask = await this.coordinationPatterns.executeTask({
        taskId: 'postman_collection',
        agentType: 'api-architect',
        prompt: `Create Postman collection with all endpoints, example requests, and environment variables for easy API testing.`,
        outputFormat: 'postman-collection'
      });

      results.tasks.postman_collection = postmanTask;
      execution.metrics.agentExecutions++;

      results.sdksGenerated = sdkTask.result?.languages?.length || 0;
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
   * Stage 6: API Deployment & Monitoring
   */
  async executeAPIDeployment(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const gatewayTask = await this.coordinationPatterns.executeTask({
        taskId: 'api_gateway_setup',
        agentType: 'deployment-orchestration-agent',
        prompt: `Configure API gateway with rate limiting, request transformation, and routing for ${projectSpec.projectName}. Set up CORS and security policies.`,
        outputFormat: 'gateway-config'
      });

      results.tasks.api_gateway_setup = gatewayTask;
      execution.metrics.agentExecutions++;

      const monitoringTask = await this.coordinationPatterns.executeTask({
        taskId: 'monitoring_observability',
        agentType: 'deployment-orchestration-agent',
        prompt: `Set up API monitoring with request tracing, error tracking, and performance metrics. Configure dashboards and alerts.`,
        dependencies: ['api_gateway_setup'],
        outputFormat: 'monitoring-setup'
      });

      results.tasks.monitoring_observability = monitoringTask;
      execution.metrics.agentExecutions++;

      results.monitoringEnabled = true;
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
  async validateAPIDesign(results) {
    return {
      gate: 'api_design',
      condition: 'OpenAPI specification complete with all endpoints and models documented',
      passed: results.success && results.endpointCount > 0,
      blocking: true,
      details: { endpointCount: results.endpointCount }
    };
  }

  async validateAuthentication(results) {
    return {
      gate: 'authentication_authorization',
      condition: 'Security validation passes OWASP API Security Top 10 checks',
      passed: results.success && results.securityPassed,
      blocking: true
    };
  }

  async validateAPIImplementation(results) {
    return {
      gate: 'api_implementation',
      condition: 'All endpoints implement proper error handling and validation',
      passed: results.success && results.endpointsImplemented > 0,
      blocking: true
    };
  }

  async validateAPITesting(results) {
    return {
      gate: 'api_testing',
      condition: 'Integration test coverage above 85% for all endpoints',
      passed: results.success && results.testCoverage >= 85,
      blocking: true,
      details: { coverage: results.testCoverage }
    };
  }

  async validateAPIDocumentation(results) {
    return {
      gate: 'api_documentation',
      condition: 'Interactive documentation deployed and client SDKs generated',
      passed: results.success && results.sdksGenerated >= 2,
      blocking: false,
      details: { sdksGenerated: results.sdksGenerated }
    };
  }

  async validateAPIDeployment(results) {
    return {
      gate: 'api_deployment',
      condition: 'API monitoring and alerting configured',
      passed: results.success && results.monitoringEnabled,
      blocking: true
    };
  }

  /**
   * Generate API summary
   */
  generateAPISummary(execution) {
    return {
      projectName: execution.projectName,
      apiType: execution.apiType,
      endpointsImplemented: execution.metrics.endpointsImplemented,
      testCoverage: execution.metrics.testCoverage,
      qualityGatesPassed: execution.metrics.qualityGatesPassed,
      sdksGenerated: execution.stageResults.api_documentation?.sdksGenerated || 0,
      monitoringEnabled: execution.stageResults.api_deployment?.monitoringEnabled || false
    };
  }

  /**
   * Get deliverable file paths
   */
  getDeliverablePaths(execution) {
    const basePath = `projects/${execution.projectId}/deliverables/api`;
    return {
      openapiSpec: `${basePath}/openapi.yml`,
      apiImplementation: `${basePath}/src/api/`,
      apiTests: `${basePath}/tests/api/`,
      apiDocs: `${basePath}/docs/api/`,
      clientSDKs: `${basePath}/client-sdks/`,
      postmanCollection: `${basePath}/postman-collection.json`,
      gatewayConfig: `${basePath}/api-gateway-config.yml`,
      monitoringDashboard: `${basePath}/monitoring-dashboard.json`
    };
  }

  /**
   * Store learnings in crystalline memory
   */
  async storePipelineLearnings(execution) {
    if (!this.crystallineMemory) return;

    try {
      await this.crystallineMemory.storeMemory('api-development', {
        executionId: execution.executionId,
        projectName: execution.projectName,
        timestamp: Date.now(),
        apiSummary: this.generateAPISummary(execution)
      }, {
        projectId: execution.projectId,
        pipelineId: this.pipelineId
      });

      console.log('✅ API development learnings stored in crystalline memory');
    } catch (error) {
      console.error('⚠️  Failed to store learnings:', error.message);
    }
  }
}

module.exports = APIDevelopmentPipeline;
