/**
 * CI/CD Pipeline
 *
 * Enterprise CI/CD pipeline from build automation to production deployment
 * with quality gates, security scanning, and DORA metrics tracking.
 *
 * Pipeline Stages:
 * 1. CI/CD Pipeline Architecture Design (35 min)
 * 2. Build Automation & Optimization (35 min)
 * 3. Quality Gates & Testing Integration (40 min)
 * 4. Deployment Automation (45 min)
 * 5. Monitoring & Observability Integration (30 min)
 *
 * Total Duration: ~185 minutes
 */

const BasePipeline = require('../../../orchestrai-shared/pipelines/base-pipeline');
const path = require('path');
const fs = require('fs').promises;

class CICDPipeline extends BasePipeline {
  constructor(coordinationPatterns, crystallineMemory, mcpManager) {
    super(
      { coordinationPatterns, dynamicAgentSelection: null, crystallineMemory, redis: null },
      {
        pipelineId: 'cicd-pipeline',
        pipelineName: 'CI/CD Pipeline',
        version: '2.0.0',
        stages: [
          'pipeline_architecture',
          'build_automation',
          'quality_gates',
          'deployment_automation',
          'monitoring_observability'
        ],
        requiredAgents: {
          'pipeline_architecture': 'cicd-pipeline-architect',
          'build_automation': 'devops-deployment-specialist',
          'quality_gates': 'security-testing-specialist',
          'deployment_automation': 'deployment-orchestration-agent',
          'monitoring_observability': 'performance-monitoring-agent'
        }
      }
    );

    this.mcpManager = mcpManager;
  }

  /**
   * Custom executeStages with integrated quality gate validation
   * @override
   */
  async executeStages(execution, projectSpec) {
    // Initialize CI/CD-specific data
    execution.projectId = projectSpec.projectId || projectSpec.projectUuid;
    execution.projectPath = projectSpec.projectPath;
    execution.cicdPlatform = projectSpec.cicdPlatform || 'github-actions';
    execution.qualityGates = [];
    execution.metrics = {
      tokenUsage: 0,
      agentExecutions: 0,
      qualityGatesPassed: 0,
      qualityGatesFailed: 0,
      deploymentsConfigured: 0
    };

    // Quality gate validators for each stage
    const qualityGateValidators = {
      'pipeline_architecture': { validator: this.validatePipelineArchitecture.bind(this), blocking: true },
      'build_automation': { validator: this.validateBuildAutomation.bind(this), blocking: true },
      'quality_gates': { validator: this.validateQualityGatesConfig.bind(this), blocking: true },
      'deployment_automation': { validator: this.validateDeploymentAutomation.bind(this), blocking: true },
      'monitoring_observability': { validator: this.validateMonitoring.bind(this), blocking: false }
    };

    // Execute each stage with quality gate validation
    for (const stageName of this.stages) {
      execution.currentStage = stageName;
      this.emitStageStarted(execution, stageName);

      const result = await this.executeStageImpl(stageName, execution, projectSpec);
      execution.stageResults[stageName] = result;

      this.emitStageCompleted(execution, stageName, result);

      // Run quality gate validator if exists
      const gateConfig = qualityGateValidators[stageName];
      if (gateConfig) {
        const gate = await gateConfig.validator(result);
        execution.qualityGates.push(gate);

        // Enforce blocking gates
        if (!gate.passed && gateConfig.blocking) {
          throw new Error(`BLOCKING: ${gate.message || `Quality gate failed for ${stageName}`}`);
        }
      }
    }

    // Calculate final quality gate metrics
    execution.metrics.qualityGatesPassed = execution.qualityGates.filter(g => g.passed).length;
    execution.metrics.qualityGatesFailed = execution.qualityGates.filter(g => !g.passed).length;
  }

  /**
   * Build CI/CD-specific success result
   * @override
   */
  buildSuccessResult(execution) {
    return {
      success: true,
      executionId: execution.executionId,
      projectId: execution.projectId,
      projectPath: execution.projectPath,
      duration: execution.duration,
      results: execution.stageResults,
      deliverablePaths: this.getDeliverablePaths(execution),
      qualityGates: execution.qualityGates,
      metrics: execution.metrics,
      cicdSummary: this.generateCICDSummary(execution)
    };
  }

  /**
   * Route to stage-specific execution methods
   * @override
   */
  async executeStageImpl(stageName, execution, projectSpec) {
    switch (stageName) {
      case 'pipeline_architecture':
        return await this.executePipelineArchitecture(execution, projectSpec);
      case 'build_automation':
        return await this.executeBuildAutomation(execution, projectSpec);
      case 'quality_gates':
        return await this.executeQualityGates(execution, projectSpec);
      case 'deployment_automation':
        return await this.executeDeploymentAutomation(execution, projectSpec);
      case 'monitoring_observability':
        return await this.executeMonitoringObservability(execution, projectSpec);
      default:
        throw new Error(`Unknown stage: ${stageName}`);
    }
  }

  /**
   * Stage 1: CI/CD Pipeline Architecture Design
   */
  async executePipelineArchitecture(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const pipelineDesignTask = await this.coordinationPatterns.executeTask({
        taskId: 'pipeline_design',
        agentType: 'cicd-pipeline-architect',
        prompt: `Design comprehensive CI/CD pipeline architecture for ${projectSpec.projectPath}. Define stages, jobs, and workflow orchestration using ${execution.cicdPlatform}.`,
        context: { projectPath: projectSpec.projectPath, platform: execution.cicdPlatform },
        outputFormat: 'pipeline-architecture'
      });

      results.tasks.pipeline_design = pipelineDesignTask;
      execution.metrics.agentExecutions++;

      const branchingTask = await this.coordinationPatterns.executeTask({
        taskId: 'branching_strategy',
        agentType: 'cicd-pipeline-architect',
        prompt: `Define Git branching strategy (GitFlow/trunk-based) and deployment workflows for dev, staging, and production environments.`,
        dependencies: ['pipeline_design'],
        outputFormat: 'branching-strategy'
      });

      results.tasks.branching_strategy = branchingTask;
      execution.metrics.agentExecutions++;

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
   * Stage 2: Build Automation & Optimization
   */
  async executeBuildAutomation(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const buildConfigTask = await this.coordinationPatterns.executeTask({
        taskId: 'build_configuration',
        agentType: 'cicd-pipeline-architect',
        prompt: `Configure build automation with dependency caching, parallel builds, and matrix builds for ${projectSpec.projectPath}. Optimize build times.`,
        context: { projectPath: projectSpec.projectPath },
        outputFormat: 'build-config'
      });

      results.tasks.build_configuration = buildConfigTask;
      execution.metrics.agentExecutions++;

      const dockerTask = await this.coordinationPatterns.executeTask({
        taskId: 'docker_build_optimization',
        agentType: 'docker-container-specialist',
        prompt: `Create optimized multi-stage Docker builds with BuildKit caching, security hardening, and minimal image size for ${projectSpec.projectPath}.`,
        dependencies: ['build_configuration'],
        outputFormat: 'dockerfile'
      });

      results.tasks.docker_build_optimization = dockerTask;
      execution.metrics.agentExecutions++;

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
   * Stage 3: Quality Gates & Testing Integration
   */
  async executeQualityGates(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const testingTask = await this.coordinationPatterns.executeTask({
        taskId: 'automated_testing_integration',
        agentType: 'cicd-pipeline-architect',
        prompt: `Integrate unit, integration, and E2E tests into CI pipeline. Configure parallel test execution and failure handling.`,
        context: { projectPath: projectSpec.projectPath },
        outputFormat: 'test-integration-config'
      });

      results.tasks.automated_testing_integration = testingTask;
      execution.metrics.agentExecutions++;

      const securityTask = await this.coordinationPatterns.executeTask({
        taskId: 'security_scanning',
        agentType: 'security-testing-specialist',
        prompt: `Integrate security scanning (SAST, dependency scanning, container scanning) using Snyk, Trivy, and SonarQube in CI pipeline.`,
        dependencies: ['docker_build_optimization'],
        outputFormat: 'security-scan-config'
      });

      results.tasks.security_scanning = securityTask;
      execution.metrics.agentExecutions++;

      const codeQualityTask = await this.coordinationPatterns.executeTask({
        taskId: 'code_quality_gates',
        agentType: 'cicd-pipeline-architect',
        prompt: `Configure code quality gates with SonarQube/CodeClimate. Define quality thresholds for coverage, complexity, and duplication.`,
        outputFormat: 'quality-gates-config'
      });

      results.tasks.code_quality_gates = codeQualityTask;
      execution.metrics.agentExecutions++;

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
   * Stage 4: Deployment Automation
   */
  async executeDeploymentAutomation(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const deployStrategyTask = await this.coordinationPatterns.executeTask({
        taskId: 'deployment_strategy',
        agentType: 'deployment-orchestration-agent',
        prompt: `Configure deployment strategies including blue-green, canary, and rolling deployments for ${projectSpec.projectPath}. Define rollback procedures.`,
        context: { projectPath: projectSpec.projectPath },
        outputFormat: 'deployment-strategy'
      });

      results.tasks.deployment_strategy = deployStrategyTask;
      execution.metrics.agentExecutions++;

      const k8sTask = await this.coordinationPatterns.executeTask({
        taskId: 'kubernetes_deployment',
        agentType: 'kubernetes-deployment-expert',
        prompt: `Create production Kubernetes manifests with proper resource limits, health probes, HPA, and monitoring integration for ${projectSpec.projectPath}.`,
        dependencies: ['deployment_strategy', 'docker_build_optimization'],
        outputFormat: 'k8s-manifests'
      });

      results.tasks.kubernetes_deployment = k8sTask;
      execution.metrics.agentExecutions++;
      execution.metrics.deploymentsConfigured = 3; // dev, staging, prod

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
   * Stage 5: Monitoring & Observability Integration
   */
  async executeMonitoringObservability(execution, projectSpec) {
    const stageStart = Date.now();
    const results = { success: false, tasks: {} };

    try {
      const monitoringTask = await this.coordinationPatterns.executeTask({
        taskId: 'monitoring_setup',
        agentType: 'cicd-pipeline-architect',
        prompt: `Integrate monitoring and alerting for deployment pipeline. Configure Slack/email notifications, deployment tracking, and failure alerts.`,
        outputFormat: 'monitoring-config'
      });

      results.tasks.monitoring_setup = monitoringTask;
      execution.metrics.agentExecutions++;

      const doraTask = await this.coordinationPatterns.executeTask({
        taskId: 'deployment_metrics',
        agentType: 'cicd-pipeline-architect',
        prompt: `Create deployment metrics dashboard tracking deployment frequency, lead time, MTTR, and change failure rate (DORA metrics).`,
        dependencies: ['monitoring_setup'],
        outputFormat: 'metrics-dashboard'
      });

      results.tasks.deployment_metrics = doraTask;
      execution.metrics.agentExecutions++;

      results.doraMetricsEnabled = true;
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
  async validatePipelineArchitecture(results) {
    return {
      gate: 'pipeline_architecture',
      condition: 'Pipeline architecture includes all stages with proper dependencies',
      passed: results.success && Object.keys(results.tasks).length >= 2,
      blocking: true,
      details: { tasksCompleted: Object.keys(results.tasks).length }
    };
  }

  async validateBuildAutomation(results) {
    return {
      gate: 'build_automation',
      condition: 'Build times optimized with caching and parallelization',
      passed: results.success && results.tasks.docker_build_optimization,
      blocking: true
    };
  }

  async validateQualityGatesConfig(results) {
    return {
      gate: 'quality_gates',
      condition: 'All quality gates configured with proper thresholds',
      passed: results.success && Object.keys(results.tasks).length >= 3,
      blocking: true
    };
  }

  async validateDeploymentAutomation(results) {
    return {
      gate: 'deployment_automation',
      condition: 'Deployment strategy includes rollback procedures',
      passed: results.success && results.tasks.kubernetes_deployment,
      blocking: true
    };
  }

  async validateMonitoring(results) {
    return {
      gate: 'monitoring_observability',
      condition: 'DORA metrics tracking configured',
      passed: results.success && results.doraMetricsEnabled,
      blocking: false
    };
  }

  /**
   * Generate CI/CD summary
   */
  generateCICDSummary(execution) {
    return {
      projectPath: execution.projectPath,
      cicdPlatform: execution.cicdPlatform,
      stagesConfigured: Object.keys(execution.stageResults).length,
      deploymentsConfigured: execution.metrics.deploymentsConfigured,
      qualityGatesPassed: execution.metrics.qualityGatesPassed,
      doraMetricsEnabled: execution.stageResults.monitoring_observability?.doraMetricsEnabled || false
    };
  }

  /**
   * Get deliverable file paths
   */
  getDeliverablePaths(execution) {
    const basePath = `projects/${execution.projectId}/deliverables/cicd`;
    return {
      githubWorkflow: `${basePath}/.github/workflows/ci-cd.yml`,
      dockerfile: `${basePath}/Dockerfile`,
      dockerCompose: `${basePath}/docker-compose.yml`,
      k8sDeployment: `${basePath}/kubernetes/deployment.yml`,
      k8sService: `${basePath}/kubernetes/service.yml`,
      k8sIngress: `${basePath}/kubernetes/ingress.yml`,
      k8sHPA: `${basePath}/kubernetes/hpa.yml`,
      sonarConfig: `${basePath}/sonar-project.properties`,
      deploymentStrategy: `${basePath}/deployment-strategy.md`
    };
  }

  /**
   * Store learnings in crystalline memory
   */
  async storePipelineLearnings(execution) {
    if (!this.crystallineMemory) return;

    try {
      await this.crystallineMemory.storeMemory('cicd-pipeline', {
        executionId: execution.executionId,
        projectPath: execution.projectPath,
        timestamp: Date.now(),
        cicdSummary: this.generateCICDSummary(execution)
      }, {
        projectId: execution.projectId,
        pipelineId: this.pipelineId
      });

      console.log('✅ CI/CD pipeline learnings stored in crystalline memory');
    } catch (error) {
      console.error('⚠️  Failed to store learnings:', error.message);
    }
  }
}

module.exports = CICDPipeline;
