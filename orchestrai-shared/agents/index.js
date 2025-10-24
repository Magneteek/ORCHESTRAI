/**
 * Specialized Agent Registry
 *
 * Central export point for all 64 priority specialized agents across
 * all domains. These agents work alongside the simultaneous execution
 * orchestrator to provide expert-level capabilities in their respective domains.
 *
 * Phase 1.3 Implementation - COMPLETE (64/64 agents)
 *
 * Domain Distribution:
 * - Content: 5 agents
 * - SEO: 5 agents
 * - Development: 5 agents
 * - Testing & QA: 8 agents
 * - AI/ML Intelligence: 7 agents
 * - DevOps: 6 agents
 * - Business Intelligence: 5 agents
 * - Conversion & Marketing: 6 agents
 * - Handoff & Coordination: 4 agents
 * - Design Evolution: 5 agents
 * - Memory Optimization: 4 agents
 * - Cross-System Integration: 4 agents
 */

const BaseSpecializedAgent = require('./base-specialized-agent');

// Content Domain Agents (5)
const {
  SemanticDiscoverySpecialist,
  CompetitiveSemanticAnalyst,
  PsychographicResearcher,
  ContentStructureOptimizer,
  ReadabilityEnhancer
} = require('./content-domain-agents');

// SEO Domain Agents (5)
const {
  KeywordClusteringSpecialist,
  SerpAnalysisExpert,
  IntentMappingSpecialist,
  CompetitorGapAnalyzer,
  SemanticRelationshipMapper
} = require('./seo-domain-agents');

// Development Domain Agents (5)
const {
  FrontendArchitect,
  BackendArchitect,
  ApiDesignSpecialist,
  DatabaseSchemaDesigner,
  DeploymentAutomationSpecialist
} = require('./development-domain-agents');

// Testing & QA Domain Agents (8)
const {
  UnitTestGenerator,
  IntegrationTestSpecialist,
  E2ETestAutomator,
  PerformanceTestingExpert,
  AccessibilityValidator,
  SecurityTestingSpecialist,
  VisualRegressionTester,
  TestCoverageAnalyzer
} = require('./testing-qa-agents');

// AI/ML Intelligence Layer Agents (7)
const {
  SemanticAnalysisEngine,
  SentimentAnalysisSpecialist,
  EntityExtractionAgent,
  TopicModelingExpert,
  IntentClassificationAgent,
  TextSummarizationSpecialist,
  LanguageDetectionAgent
} = require('./ai-ml-agents');

// DevOps Domain Agents (6)
const {
  CICDPipelineArchitect,
  DockerContainerSpecialist,
  KubernetesDeploymentExpert,
  CloudInfrastructureManager,
  MonitoringAlertingSpecialist,
  DeploymentStrategyCoordinator
} = require('./devops-agents');

// Remaining Domains (28 agents total)
const {
  // Business Intelligence (5)
  DataAnalyticsSpecialist,
  ROICalculatorAgent,
  MarketResearchAnalyst,
  CustomerInsightsAnalyzer,
  PerformanceDashboardBuilder,

  // Conversion & Marketing (6)
  ConversionOptimizationSpecialist,
  LandingPageOptimizer,
  EmailMarketingAutomator,
  SocialMediaStrategyAgent,
  PaidAdvertisingOptimizer,
  MarketingAutomationOrchestrator,

  // Handoff & Coordination (4)
  ProjectHandoffCoordinator,
  InterAgentCommunicationHub,
  WorkflowStateManager,
  QualityGatekeeper,

  // Design Evolution (5)
  DesignSystemArchitect,
  UIComponentGenerator,
  ResponsiveLayoutOptimizer,
  AnimationInteractionDesigner,
  BrandConsistencyEnforcer,

  // Memory Optimization (4)
  CrystallineMemoryOptimizer,
  ContextPruningAgent,
  MemoryCompressionSpecialist,
  LearningConsolidationAgent,

  // Cross-System Integration (4)
  APIIntegrationSpecialist,
  DataSyncCoordinator,
  WebhookManagerAgent,
  ThirdPartyServiceConnector
} = require('./remaining-specialized-agents');

/**
 * Agent Registry
 *
 * Comprehensive registry of all specialized agents with their metadata.
 * Used by the dynamic agent selection system to match tasks to agents.
 */
const AGENT_REGISTRY = {
  // Content Domain
  'semantic-discovery-specialist': {
    class: SemanticDiscoverySpecialist,
    domain: 'content',
    capabilities: ['keyword-research', 'semantic-analysis', 'topic-clustering'],
    description: 'Discovers semantic keyword clusters and related terms',
    estimatedDuration: 45000,
    priority: 0.9
  },
  'competitive-semantic-analyst': {
    class: CompetitiveSemanticAnalyst,
    domain: 'content',
    capabilities: ['competitor-analysis', 'gap-identification', 'content-opportunities'],
    description: 'Analyzes competitors for content gaps and opportunities',
    estimatedDuration: 50000,
    priority: 0.85
  },
  'psychographic-researcher': {
    class: PsychographicResearcher,
    domain: 'content',
    capabilities: ['audience-profiling', 'persona-creation', 'messaging-strategy'],
    description: 'Creates detailed psychographic profiles and messaging strategies',
    estimatedDuration: 60000,
    priority: 0.8
  },
  'content-structure-optimizer': {
    class: ContentStructureOptimizer,
    domain: 'content',
    capabilities: ['content-architecture', 'outline-optimization', 'internal-linking'],
    description: 'Designs optimal content structure and internal linking',
    estimatedDuration: 40000,
    priority: 0.85
  },
  'readability-enhancer': {
    class: ReadabilityEnhancer,
    domain: 'content',
    capabilities: ['readability-analysis', 'flow-optimization', 'accessibility-enhancement'],
    description: 'Analyzes and enhances content readability and flow',
    estimatedDuration: 35000,
    priority: 0.75
  },

  // SEO Domain
  'keyword-clustering-specialist': {
    class: KeywordClusteringSpecialist,
    domain: 'seo',
    capabilities: ['keyword-clustering', 'semantic-grouping', 'pillar-identification'],
    description: 'Groups keywords into semantic clusters for content planning',
    estimatedDuration: 45000,
    priority: 0.9
  },
  'serp-analysis-expert': {
    class: SerpAnalysisExpert,
    domain: 'seo',
    capabilities: ['serp-analysis', 'ranking-factors', 'feature-targeting'],
    description: 'Analyzes SERP features and ranking opportunities',
    estimatedDuration: 50000,
    priority: 0.85
  },
  'intent-mapping-specialist': {
    class: IntentMappingSpecialist,
    domain: 'seo',
    capabilities: ['intent-classification', 'funnel-mapping', 'conversion-optimization'],
    description: 'Maps search intent to conversion funnel stages',
    estimatedDuration: 40000,
    priority: 0.8
  },
  'competitor-gap-analyzer': {
    class: CompetitorGapAnalyzer,
    domain: 'seo',
    capabilities: ['gap-analysis', 'opportunity-scoring', 'competitive-intelligence'],
    description: 'Identifies keyword gaps and ranking opportunities vs competitors',
    estimatedDuration: 55000,
    priority: 0.85
  },
  'semantic-relationship-mapper': {
    class: SemanticRelationshipMapper,
    domain: 'seo',
    capabilities: ['entity-mapping', 'relationship-analysis', 'semantic-networks'],
    description: 'Maps entity relationships and semantic networks',
    estimatedDuration: 50000,
    priority: 0.8
  },

  // Development Domain
  'frontend-architect': {
    class: FrontendArchitect,
    domain: 'development',
    capabilities: ['component-architecture', 'state-management', 'performance-optimization'],
    description: 'Designs frontend architecture and component hierarchies',
    estimatedDuration: 60000,
    priority: 0.9
  },
  'backend-architect': {
    class: BackendArchitect,
    domain: 'development',
    capabilities: ['api-architecture', 'service-design', 'scalability-planning'],
    description: 'Designs backend architecture and service layers',
    estimatedDuration: 60000,
    priority: 0.9
  },
  'api-design-specialist': {
    class: ApiDesignSpecialist,
    domain: 'development',
    capabilities: ['rest-api-design', 'graphql-schema-design', 'api-documentation'],
    description: 'Designs RESTful and GraphQL APIs with proper documentation',
    estimatedDuration: 45000,
    priority: 0.85
  },
  'database-schema-designer': {
    class: DatabaseSchemaDesigner,
    domain: 'development',
    capabilities: ['schema-design', 'relationship-modeling', 'index-optimization'],
    description: 'Designs database schemas with optimal relationships and indexes',
    estimatedDuration: 50000,
    priority: 0.85
  },
  'deployment-automation-specialist': {
    class: DeploymentAutomationSpecialist,
    domain: 'development',
    capabilities: ['ci-cd-design', 'containerization', 'infrastructure-as-code'],
    description: 'Designs CI/CD pipelines and infrastructure automation',
    estimatedDuration: 60000,
    priority: 0.8
  },

  // Testing & QA Domain (8 agents)
  'unit-test-generator': {
    class: UnitTestGenerator,
    domain: 'testing-qa',
    capabilities: ['unit-testing', 'test-generation', 'jest-testing', 'vitest-testing'],
    description: 'Generates comprehensive unit test suites with edge cases',
    estimatedDuration: 45000,
    priority: 0.95
  },
  'integration-test-specialist': {
    class: IntegrationTestSpecialist,
    domain: 'testing-qa',
    capabilities: ['integration-testing', 'api-testing', 'contract-testing'],
    description: 'Designs integration testing strategies for multi-component systems',
    estimatedDuration: 55000,
    priority: 0.90
  },
  'e2e-test-automator': {
    class: E2ETestAutomator,
    domain: 'testing-qa',
    capabilities: ['e2e-testing', 'playwright-automation', 'cypress-automation'],
    description: 'Implements end-to-end testing with Playwright/Cypress',
    estimatedDuration: 60000,
    priority: 0.92
  },
  'performance-testing-expert': {
    class: PerformanceTestingExpert,
    domain: 'testing-qa',
    capabilities: ['load-testing', 'stress-testing', 'performance-benchmarking'],
    description: 'Implements load testing and performance benchmarking',
    estimatedDuration: 70000,
    priority: 0.88
  },
  'accessibility-validator': {
    class: AccessibilityValidator,
    domain: 'testing-qa',
    capabilities: ['wcag-compliance', 'aria-validation', 'a11y-auditing'],
    description: 'Validates WCAG compliance and accessibility standards',
    estimatedDuration: 50000,
    priority: 0.87
  },
  'security-testing-specialist': {
    class: SecurityTestingSpecialist,
    domain: 'testing-qa',
    capabilities: ['security-auditing', 'vulnerability-scanning', 'owasp-top10'],
    description: 'Performs security auditing and vulnerability scanning',
    estimatedDuration: 65000,
    priority: 0.93
  },
  'visual-regression-tester': {
    class: VisualRegressionTester,
    domain: 'testing-qa',
    capabilities: ['visual-regression', 'screenshot-comparison', 'pixel-diff-analysis'],
    description: 'Implements visual regression testing',
    estimatedDuration: 45000,
    priority: 0.85
  },
  'test-coverage-analyzer': {
    class: TestCoverageAnalyzer,
    domain: 'testing-qa',
    capabilities: ['coverage-analysis', 'istanbul-integration', 'coverage-metrics'],
    description: 'Analyzes test coverage and identifies gaps',
    estimatedDuration: 40000,
    priority: 0.86
  },

  // AI/ML Intelligence Layer (7 agents)
  'semantic-analysis-engine': {
    class: SemanticAnalysisEngine,
    domain: 'ai-ml',
    capabilities: ['semantic-analysis', 'nlp-processing', 'embeddings'],
    description: 'Advanced semantic analysis and NLP processing',
    estimatedDuration: 50000,
    priority: 0.95
  },
  'sentiment-analysis-specialist': {
    class: SentimentAnalysisSpecialist,
    domain: 'ai-ml',
    capabilities: ['sentiment-analysis', 'emotion-detection', 'multi-language-sentiment'],
    description: 'Multi-language sentiment analysis with emotion detection',
    estimatedDuration: 45000,
    priority: 0.90
  },
  'entity-extraction-agent': {
    class: EntityExtractionAgent,
    domain: 'ai-ml',
    capabilities: ['named-entity-recognition', 'entity-extraction', 'knowledge-graph-building'],
    description: 'Extracts named entities and builds knowledge graphs',
    estimatedDuration: 50000,
    priority: 0.88
  },
  'topic-modeling-expert': {
    class: TopicModelingExpert,
    domain: 'ai-ml',
    capabilities: ['topic-modeling', 'lda-analysis', 'topic-clustering'],
    description: 'Performs topic modeling using LDA/LSA',
    estimatedDuration: 60000,
    priority: 0.87
  },
  'intent-classification-agent': {
    class: IntentClassificationAgent,
    domain: 'ai-ml',
    capabilities: ['intent-detection', 'intent-classification', 'query-understanding'],
    description: 'Detects and classifies user intent from queries',
    estimatedDuration: 35000,
    priority: 0.89
  },
  'text-summarization-specialist': {
    class: TextSummarizationSpecialist,
    domain: 'ai-ml',
    capabilities: ['text-summarization', 'extractive-summarization', 'abstractive-summarization'],
    description: 'Generates extractive and abstractive text summaries',
    estimatedDuration: 40000,
    priority: 0.86
  },
  'language-detection-agent': {
    class: LanguageDetectionAgent,
    domain: 'ai-ml',
    capabilities: ['language-detection', 'multi-language-support'],
    description: 'Detects language of text input',
    estimatedDuration: 30000,
    priority: 0.84
  },

  // DevOps Domain (6 agents)
  'cicd-pipeline-architect': {
    class: CICDPipelineArchitect,
    domain: 'devops',
    capabilities: ['cicd-design', 'github-actions', 'gitlab-ci', 'pipeline-optimization'],
    description: 'Designs and implements CI/CD pipelines',
    estimatedDuration: 65000,
    priority: 0.94
  },
  'docker-container-specialist': {
    class: DockerContainerSpecialist,
    domain: 'devops',
    capabilities: ['dockerfile-creation', 'docker-compose', 'container-optimization'],
    description: 'Creates optimized Docker configurations',
    estimatedDuration: 50000,
    priority: 0.91
  },
  'kubernetes-deployment-expert': {
    class: KubernetesDeploymentExpert,
    domain: 'devops',
    capabilities: ['kubernetes-deployment', 'k8s-scaling', 'helm-charts'],
    description: 'Manages Kubernetes deployments and scaling',
    estimatedDuration: 70000,
    priority: 0.90
  },
  'cloud-infrastructure-manager': {
    class: CloudInfrastructureManager,
    domain: 'devops',
    capabilities: ['aws-infrastructure', 'gcp-infrastructure', 'terraform'],
    description: 'Manages cloud infrastructure with Terraform',
    estimatedDuration: 75000,
    priority: 0.89
  },
  'monitoring-alerting-specialist': {
    class: MonitoringAlertingSpecialist,
    domain: 'devops',
    capabilities: ['prometheus-monitoring', 'grafana-dashboards', 'alerting'],
    description: 'Sets up monitoring, logging, and alerting',
    estimatedDuration: 60000,
    priority: 0.88
  },
  'deployment-strategy-coordinator': {
    class: DeploymentStrategyCoordinator,
    domain: 'devops',
    capabilities: ['blue-green-deployment', 'canary-deployment', 'rolling-update'],
    description: 'Coordinates deployment strategies with zero-downtime',
    estimatedDuration: 55000,
    priority: 0.87
  },

  // Business Intelligence Domain (5 agents)
  'data-analytics-specialist': {
    class: DataAnalyticsSpecialist,
    domain: 'business-intelligence',
    capabilities: ['data-analysis', 'metrics-calculation', 'kpi-tracking'],
    description: 'Analyzes business data and calculates KPIs',
    estimatedDuration: 50000,
    priority: 0.88
  },
  'roi-calculator-agent': {
    class: ROICalculatorAgent,
    domain: 'business-intelligence',
    capabilities: ['roi-calculation', 'cost-analysis', 'revenue-projection'],
    description: 'Calculates ROI and financial metrics',
    estimatedDuration: 35000,
    priority: 0.85
  },
  'market-research-analyst': {
    class: MarketResearchAnalyst,
    domain: 'business-intelligence',
    capabilities: ['market-research', 'competitor-analysis', 'trend-identification'],
    description: 'Conducts market research and competitive analysis',
    estimatedDuration: 60000,
    priority: 0.87
  },
  'customer-insights-analyzer': {
    class: CustomerInsightsAnalyzer,
    domain: 'business-intelligence',
    capabilities: ['customer-analysis', 'behavior-tracking', 'segmentation'],
    description: 'Analyzes customer behavior and generates insights',
    estimatedDuration: 55000,
    priority: 0.86
  },
  'performance-dashboard-builder': {
    class: PerformanceDashboardBuilder,
    domain: 'business-intelligence',
    capabilities: ['dashboard-creation', 'data-visualization', 'reporting'],
    description: 'Creates performance dashboards and reports',
    estimatedDuration: 50000,
    priority: 0.84
  },

  // Conversion & Marketing Domain (6 agents)
  'conversion-optimization-specialist': {
    class: ConversionOptimizationSpecialist,
    domain: 'conversion-marketing',
    capabilities: ['cro', 'ab-testing', 'funnel-optimization'],
    description: 'Optimizes conversion rates and user journeys',
    estimatedDuration: 55000,
    priority: 0.90
  },
  'landing-page-optimizer': {
    class: LandingPageOptimizer,
    domain: 'conversion-marketing',
    capabilities: ['landing-page', 'copywriting', 'cta-optimization'],
    description: 'Optimizes landing pages for maximum conversion',
    estimatedDuration: 45000,
    priority: 0.89
  },
  'email-marketing-automator': {
    class: EmailMarketingAutomator,
    domain: 'conversion-marketing',
    capabilities: ['email-automation', 'drip-campaigns', 'segmentation'],
    description: 'Creates automated email marketing campaigns',
    estimatedDuration: 50000,
    priority: 0.87
  },
  'social-media-strategy-agent': {
    class: SocialMediaStrategyAgent,
    domain: 'conversion-marketing',
    capabilities: ['social-media', 'content-calendar', 'engagement-optimization'],
    description: 'Develops social media strategies',
    estimatedDuration: 45000,
    priority: 0.85
  },
  'paid-advertising-optimizer': {
    class: PaidAdvertisingOptimizer,
    domain: 'conversion-marketing',
    capabilities: ['ppc', 'ad-optimization', 'roas-optimization'],
    description: 'Optimizes paid advertising campaigns for maximum ROAS',
    estimatedDuration: 60000,
    priority: 0.88
  },
  'marketing-automation-orchestrator': {
    class: MarketingAutomationOrchestrator,
    domain: 'conversion-marketing',
    capabilities: ['marketing-automation', 'workflow-design', 'lead-nurturing'],
    description: 'Orchestrates marketing automation workflows',
    estimatedDuration: 65000,
    priority: 0.86
  },

  // Handoff & Coordination Domain (4 agents)
  'project-handoff-coordinator': {
    class: ProjectHandoffCoordinator,
    domain: 'handoff-coordination',
    capabilities: ['project-handoff', 'documentation', 'knowledge-transfer'],
    description: 'Coordinates project handoffs with comprehensive documentation',
    estimatedDuration: 50000,
    priority: 0.89
  },
  'inter-agent-communication-hub': {
    class: InterAgentCommunicationHub,
    domain: 'handoff-coordination',
    capabilities: ['agent-coordination', 'message-routing', 'workflow-orchestration'],
    description: 'Manages communication between agents',
    estimatedDuration: 30000,
    priority: 0.91
  },
  'workflow-state-manager': {
    class: WorkflowStateManager,
    domain: 'handoff-coordination',
    capabilities: ['state-management', 'workflow-tracking', 'progress-monitoring'],
    description: 'Manages workflow state and progress tracking',
    estimatedDuration: 35000,
    priority: 0.87
  },
  'quality-gatekeeper': {
    class: QualityGatekeeper,
    domain: 'handoff-coordination',
    capabilities: ['quality-assurance', 'approval-management', 'standards-enforcement'],
    description: 'Enforces quality gates and approval workflows',
    estimatedDuration: 40000,
    priority: 0.88
  },

  // Design Evolution Domain (5 agents)
  'design-system-architect': {
    class: DesignSystemArchitect,
    domain: 'design-evolution',
    capabilities: ['design-system', 'component-library', 'style-guide'],
    description: 'Creates and maintains design systems',
    estimatedDuration: 60000,
    priority: 0.88
  },
  'ui-component-generator': {
    class: UIComponentGenerator,
    domain: 'design-evolution',
    capabilities: ['component-generation', 'react-components', 'vue-components'],
    description: 'Generates reusable UI components',
    estimatedDuration: 45000,
    priority: 0.86
  },
  'responsive-layout-optimizer': {
    class: ResponsiveLayoutOptimizer,
    domain: 'design-evolution',
    capabilities: ['responsive-design', 'mobile-optimization', 'breakpoint-management'],
    description: 'Optimizes layouts for all screen sizes',
    estimatedDuration: 50000,
    priority: 0.87
  },
  'animation-interaction-designer': {
    class: AnimationInteractionDesigner,
    domain: 'design-evolution',
    capabilities: ['animations', 'micro-interactions', 'transitions'],
    description: 'Designs animations and micro-interactions',
    estimatedDuration: 40000,
    priority: 0.84
  },
  'brand-consistency-enforcer': {
    class: BrandConsistencyEnforcer,
    domain: 'design-evolution',
    capabilities: ['brand-guidelines', 'consistency-checking', 'style-enforcement'],
    description: 'Enforces brand consistency across designs',
    estimatedDuration: 45000,
    priority: 0.85
  },

  // Memory Optimization Domain (4 agents)
  'crystalline-memory-optimizer': {
    class: CrystallineMemoryOptimizer,
    domain: 'memory-optimization',
    capabilities: ['memory-optimization', 'cache-management', 'retrieval-efficiency'],
    description: 'Optimizes crystalline memory performance',
    estimatedDuration: 50000,
    priority: 0.89
  },
  'context-pruning-agent': {
    class: ContextPruningAgent,
    domain: 'memory-optimization',
    capabilities: ['context-pruning', 'relevance-scoring', 'memory-cleanup'],
    description: 'Prunes irrelevant context to optimize memory',
    estimatedDuration: 40000,
    priority: 0.87
  },
  'memory-compression-specialist': {
    class: MemoryCompressionSpecialist,
    domain: 'memory-optimization',
    capabilities: ['data-compression', 'encoding-optimization', 'storage-efficiency'],
    description: 'Compresses memory data for efficient storage',
    estimatedDuration: 35000,
    priority: 0.85
  },
  'learning-consolidation-agent': {
    class: LearningConsolidationAgent,
    domain: 'memory-optimization',
    capabilities: ['learning-consolidation', 'pattern-merging', 'knowledge-synthesis'],
    description: 'Consolidates learnings and merges patterns',
    estimatedDuration: 45000,
    priority: 0.86
  },

  // Cross-System Integration Domain (4 agents)
  'api-integration-specialist': {
    class: APIIntegrationSpecialist,
    domain: 'cross-system-integration',
    capabilities: ['api-integration', 'rest-api', 'graphql', 'webhooks'],
    description: 'Integrates external APIs and services',
    estimatedDuration: 55000,
    priority: 0.88
  },
  'data-sync-coordinator': {
    class: DataSyncCoordinator,
    domain: 'cross-system-integration',
    capabilities: ['data-sync', 'real-time-sync', 'conflict-resolution'],
    description: 'Coordinates data synchronization across systems',
    estimatedDuration: 50000,
    priority: 0.87
  },
  'webhook-manager-agent': {
    class: WebhookManagerAgent,
    domain: 'cross-system-integration',
    capabilities: ['webhook-management', 'event-handling', 'retry-logic'],
    description: 'Manages webhooks and event-driven integrations',
    estimatedDuration: 40000,
    priority: 0.85
  },
  'third-party-service-connector': {
    class: ThirdPartyServiceConnector,
    domain: 'cross-system-integration',
    capabilities: ['service-integration', 'sdk-integration', 'vendor-apis'],
    description: 'Connects third-party services and SDKs',
    estimatedDuration: 45000,
    priority: 0.86
  }
};

/**
 * Agent Selection Helper
 *
 * Provides utility functions for selecting the best agent for a task
 */
class AgentSelector {
  /**
   * Select best agent for a task based on capabilities and priority
   * @param {Object} task - Task with requirements
   * @param {string} domain - Optional domain filter
   * @returns {Object} Selected agent class and metadata
   */
  static selectAgent(task, domain = null) {
    const taskCapabilities = task.capabilities || [];
    const taskDomain = domain || task.domain;

    // Filter agents by domain if specified
    let candidates = Object.entries(AGENT_REGISTRY);
    if (taskDomain) {
      candidates = candidates.filter(([_, agent]) => agent.domain === taskDomain);
    }

    // Score each agent based on capability match
    const scoredAgents = candidates.map(([agentType, agentData]) => {
      let score = 0;

      // Match capabilities
      taskCapabilities.forEach(cap => {
        if (agentData.capabilities.includes(cap)) {
          score += 10;
        }
      });

      // Add priority bonus
      score += agentData.priority * 5;

      return {
        agentType,
        agentData,
        score
      };
    });

    // Sort by score descending
    scoredAgents.sort((a, b) => b.score - a.score);

    // Return best match
    if (scoredAgents.length > 0) {
      const best = scoredAgents[0];
      return {
        agentType: best.agentType,
        class: best.agentData.class,
        metadata: best.agentData,
        matchScore: best.score
      };
    }

    return null;
  }

  /**
   * Get all agents in a domain
   * @param {string} domain - Domain name
   * @returns {Array} Array of agents in domain
   */
  static getAgentsByDomain(domain) {
    return Object.entries(AGENT_REGISTRY)
      .filter(([_, agent]) => agent.domain === domain)
      .map(([agentType, agentData]) => ({
        agentType,
        ...agentData
      }));
  }

  /**
   * Get agent by type
   * @param {string} agentType - Agent type identifier
   * @returns {Object} Agent class and metadata
   */
  static getAgent(agentType) {
    const agentData = AGENT_REGISTRY[agentType];
    if (!agentData) return null;

    return {
      agentType,
      class: agentData.class,
      metadata: agentData
    };
  }

  /**
   * Create agent instance
   * @param {string} agentType - Agent type identifier
   * @param {Object} config - Agent configuration
   * @returns {BaseSpecializedAgent} Agent instance
   */
  static createAgent(agentType, config = {}) {
    const agentInfo = this.getAgent(agentType);
    if (!agentInfo) {
      throw new Error(`Unknown agent type: ${agentType}`);
    }

    return new agentInfo.class(config);
  }

  /**
   * Get all available agent types
   * @returns {Array<string>} Array of agent type identifiers
   */
  static getAvailableAgents() {
    return Object.keys(AGENT_REGISTRY);
  }

  /**
   * Get registry statistics
   * @returns {Object} Registry statistics
   */
  static getStats() {
    const domains = {};
    Object.values(AGENT_REGISTRY).forEach(agent => {
      domains[agent.domain] = (domains[agent.domain] || 0) + 1;
    });

    return {
      totalAgents: Object.keys(AGENT_REGISTRY).length,
      domainDistribution: domains,
      averageDuration: Object.values(AGENT_REGISTRY)
        .reduce((sum, agent) => sum + agent.estimatedDuration, 0) / Object.keys(AGENT_REGISTRY).length
    };
  }
}

/**
 * Initialize all agents for parallel execution
 * @param {Object} config - Global configuration
 * @returns {Object} Initialized agent instances by type
 */
function initializeAllAgents(config = {}) {
  const agents = {};

  Object.keys(AGENT_REGISTRY).forEach(agentType => {
    agents[agentType] = AgentSelector.createAgent(agentType, config);
  });

  console.log(`✅ Initialized ${Object.keys(agents).length} specialized agents`);
  return agents;
}

/**
 * Validate agent registry integrity
 * @returns {Object} Validation results
 */
function validateRegistry() {
  const errors = [];
  const warnings = [];

  Object.entries(AGENT_REGISTRY).forEach(([agentType, agentData]) => {
    // Check required fields
    if (!agentData.class) {
      errors.push(`${agentType}: Missing class reference`);
    }
    if (!agentData.domain) {
      errors.push(`${agentType}: Missing domain`);
    }
    if (!agentData.capabilities || agentData.capabilities.length === 0) {
      warnings.push(`${agentType}: No capabilities defined`);
    }
    if (!agentData.description) {
      warnings.push(`${agentType}: No description`);
    }

    // Check class is valid
    if (agentData.class && typeof agentData.class !== 'function') {
      errors.push(`${agentType}: Class is not a constructor`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    agentCount: Object.keys(AGENT_REGISTRY).length
  };
}

// Export everything
module.exports = {
  // Base class
  BaseSpecializedAgent,

  // Content Domain (5)
  SemanticDiscoverySpecialist,
  CompetitiveSemanticAnalyst,
  PsychographicResearcher,
  ContentStructureOptimizer,
  ReadabilityEnhancer,

  // SEO Domain (5)
  KeywordClusteringSpecialist,
  SerpAnalysisExpert,
  IntentMappingSpecialist,
  CompetitorGapAnalyzer,
  SemanticRelationshipMapper,

  // Development Domain (5)
  FrontendArchitect,
  BackendArchitect,
  ApiDesignSpecialist,
  DatabaseSchemaDesigner,
  DeploymentAutomationSpecialist,

  // Testing & QA Domain (8)
  UnitTestGenerator,
  IntegrationTestSpecialist,
  E2ETestAutomator,
  PerformanceTestingExpert,
  AccessibilityValidator,
  SecurityTestingSpecialist,
  VisualRegressionTester,
  TestCoverageAnalyzer,

  // AI/ML Intelligence Layer (7)
  SemanticAnalysisEngine,
  SentimentAnalysisSpecialist,
  EntityExtractionAgent,
  TopicModelingExpert,
  IntentClassificationAgent,
  TextSummarizationSpecialist,
  LanguageDetectionAgent,

  // DevOps Domain (6)
  CICDPipelineArchitect,
  DockerContainerSpecialist,
  KubernetesDeploymentExpert,
  CloudInfrastructureManager,
  MonitoringAlertingSpecialist,
  DeploymentStrategyCoordinator,

  // Business Intelligence (5)
  DataAnalyticsSpecialist,
  ROICalculatorAgent,
  MarketResearchAnalyst,
  CustomerInsightsAnalyzer,
  PerformanceDashboardBuilder,

  // Conversion & Marketing (6)
  ConversionOptimizationSpecialist,
  LandingPageOptimizer,
  EmailMarketingAutomator,
  SocialMediaStrategyAgent,
  PaidAdvertisingOptimizer,
  MarketingAutomationOrchestrator,

  // Handoff & Coordination (4)
  ProjectHandoffCoordinator,
  InterAgentCommunicationHub,
  WorkflowStateManager,
  QualityGatekeeper,

  // Design Evolution (5)
  DesignSystemArchitect,
  UIComponentGenerator,
  ResponsiveLayoutOptimizer,
  AnimationInteractionDesigner,
  BrandConsistencyEnforcer,

  // Memory Optimization (4)
  CrystallineMemoryOptimizer,
  ContextPruningAgent,
  MemoryCompressionSpecialist,
  LearningConsolidationAgent,

  // Cross-System Integration (4)
  APIIntegrationSpecialist,
  DataSyncCoordinator,
  WebhookManagerAgent,
  ThirdPartyServiceConnector,

  // Registry and utilities
  AGENT_REGISTRY,
  AgentSelector,
  initializeAllAgents,
  validateRegistry
};
