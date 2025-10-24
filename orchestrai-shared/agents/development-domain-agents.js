/**
 * Development Domain Specialized Agents
 *
 * This file contains 5 specialized agents for software development tasks:
 * 1. FrontendArchitect - Component architecture and state management
 * 2. BackendArchitect - API design and service architecture
 * 3. ApiDesignSpecialist - RESTful/GraphQL API design
 * 4. DatabaseSchemaDesigner - Database schema and relationships
 * 5. DeploymentAutomationSpecialist - CI/CD and infrastructure as code
 *
 * These agents work alongside content and SEO agents to provide complete
 * development capabilities within the ORCHESTRAI system.
 */

const BaseSpecializedAgent = require('./base-specialized-agent');

/**
 * Frontend Architect
 *
 * Specializes in:
 * - Component architecture design
 * - State management patterns (Redux, Context, Zustand)
 * - Frontend routing and navigation
 * - UI/UX implementation strategies
 * - Performance optimization (code splitting, lazy loading)
 * - Accessibility compliance (WCAG 2.1 AA)
 */
class FrontendArchitect extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      agentType: 'frontend-architect',
      domain: 'development',
      version: '1.0.0',
      capabilities: [
        'component-architecture',
        'state-management',
        'routing-design',
        'performance-optimization',
        'accessibility-implementation',
        'ui-framework-selection'
      ],
      requiredTools: ['react', 'typescript', 'next.js', 'tailwind'],
      estimatedDuration: 60000, // 60 seconds for architecture design
      qualityTarget: 0.95,
      ...config
    });

    this.supportedFrameworks = ['react', 'next.js', 'vue', 'svelte'];
    this.stateManagementPatterns = ['context-api', 'redux', 'zustand', 'jotai', 'recoil'];
  }

  async executeTask(task, context) {
    const { projectType, requirements, existingArchitecture } = task;

    console.log(`🏗️  [FrontendArchitect] Designing architecture for ${projectType}`);

    // 1. Analyze requirements
    const architectureNeeds = await this.analyzeArchitectureNeeds(requirements);

    // 2. Select appropriate framework and patterns
    const frameworkChoice = await this.selectFramework(projectType, requirements);
    const stateManagement = await this.designStateManagement(requirements);

    // 3. Design component hierarchy
    const componentArchitecture = await this.designComponentHierarchy(requirements);

    // 4. Plan routing structure
    const routingDesign = await this.designRouting(requirements);

    // 5. Define performance optimization strategy
    const performanceStrategy = await this.planPerformanceOptimizations(requirements);

    // 6. Accessibility implementation plan
    const accessibilityPlan = await this.planAccessibility(requirements);

    return {
      output: {
        architectureNeeds,
        frameworkChoice,
        stateManagement,
        componentArchitecture,
        routingDesign,
        performanceStrategy,
        accessibilityPlan,
        implementationPriority: this.prioritizeImplementation(requirements)
      },
      metadata: {
        frameworksConsidered: this.supportedFrameworks,
        complexity: this.assessComplexity(requirements),
        estimatedImplementationTime: this.estimateImplementationTime(requirements),
        dependencies: this.identifyDependencies(frameworkChoice, stateManagement)
      }
    };
  }

  async analyzeArchitectureNeeds(requirements) {
    return {
      scale: this.determineScale(requirements),
      complexity: this.assessRequirementComplexity(requirements),
      stateComplexity: this.assessStateComplexity(requirements),
      performanceRequirements: this.extractPerformanceNeeds(requirements),
      accessibilityRequirements: this.extractAccessibilityNeeds(requirements)
    };
  }

  async selectFramework(projectType, requirements) {
    // Simple landing page = static HTML
    // Dynamic site with SEO = Next.js
    // Complex SPA = React
    // Marketing site = Static HTML or Gatsby

    if (requirements.isStatic || projectType === 'landing-page') {
      return {
        framework: 'static-html',
        reasoning: 'Static content - no need for React/Next.js complexity',
        libraries: ['tailwind-css', 'magicui', 'd3.js', 'paper.js']
      };
    }

    if (requirements.needsSSR || requirements.needsSEO) {
      return {
        framework: 'next.js',
        reasoning: 'Server-side rendering required for SEO and dynamic content',
        version: '15',
        appRouter: true
      };
    }

    return {
      framework: 'react',
      reasoning: 'Dynamic application without SSR requirements',
      stateManagement: 'recommended'
    };
  }

  async designStateManagement(requirements) {
    const stateComplexity = this.assessStateComplexity(requirements);

    if (stateComplexity === 'low') {
      return {
        pattern: 'context-api',
        reasoning: 'Simple state - React Context sufficient',
        implementation: 'Multiple contexts for different domains'
      };
    }

    if (stateComplexity === 'medium') {
      return {
        pattern: 'zustand',
        reasoning: 'Moderate complexity - Zustand provides simplicity with power',
        stores: this.identifyStoreStructure(requirements)
      };
    }

    return {
      pattern: 'redux-toolkit',
      reasoning: 'Complex state with time-travel debugging needs',
      slices: this.identifyReduxSlices(requirements),
      middleware: ['thunk', 'logger']
    };
  }

  async designComponentHierarchy(requirements) {
    return {
      layout: {
        rootLayout: 'Main application wrapper',
        pageLayouts: this.identifyPageLayouts(requirements),
        sharedComponents: ['Header', 'Footer', 'Navigation', 'Sidebar']
      },
      pages: this.identifyPages(requirements),
      components: {
        ui: 'ShadCN UI components for consistency',
        custom: this.identifyCustomComponents(requirements),
        shared: this.identifySharedComponents(requirements)
      },
      designSystem: {
        colorScheme: 'Tailwind custom theme',
        typography: 'Custom font scale',
        spacing: 'Tailwind spacing system',
        components: 'ShadCN UI base components'
      }
    };
  }

  async designRouting(requirements) {
    const pages = this.identifyPages(requirements);

    return {
      structure: pages.map(page => ({
        path: page.path,
        component: page.component,
        protected: page.requiresAuth || false,
        layout: page.layout || 'default'
      })),
      guards: this.identifyRouteGuards(requirements),
      redirects: this.identifyRedirects(requirements),
      loadingStrategy: 'Lazy loading for non-critical routes'
    };
  }

  async planPerformanceOptimizations(requirements) {
    return {
      codeSplitting: {
        enabled: true,
        strategy: 'Route-based splitting',
        dynamicImports: this.identifyDynamicImports(requirements)
      },
      lazyLoading: {
        images: 'Next.js Image component with blur placeholders',
        components: 'React.lazy for heavy components'
      },
      caching: {
        staticAssets: 'Aggressive caching with versioning',
        apiResponses: 'React Query with stale-while-revalidate'
      },
      bundleOptimization: {
        treeShaking: true,
        minification: true,
        compression: 'gzip + brotli'
      }
    };
  }

  async planAccessibility(requirements) {
    return {
      wcagLevel: 'AA',
      keyFeatures: [
        'Semantic HTML structure',
        'ARIA labels for interactive elements',
        'Keyboard navigation support',
        'Screen reader optimization',
        'Color contrast compliance',
        'Focus management'
      ],
      testing: {
        automated: 'Lighthouse accessibility audits',
        manual: 'Screen reader testing',
        tools: ['axe-core', 'WAVE']
      }
    };
  }

  determineScale(requirements) {
    const pageCount = requirements.pages?.length || 5;
    if (pageCount < 5) return 'small';
    if (pageCount < 20) return 'medium';
    return 'large';
  }

  assessRequirementComplexity(requirements) {
    let complexity = 0;
    if (requirements.authentication) complexity += 2;
    if (requirements.realTimeFeatures) complexity += 3;
    if (requirements.multiLanguage) complexity += 2;
    if (requirements.paymentIntegration) complexity += 3;

    if (complexity < 3) return 'low';
    if (complexity < 7) return 'medium';
    return 'high';
  }

  assessStateComplexity(requirements) {
    let complexity = 0;
    if (requirements.authentication) complexity += 2;
    if (requirements.shoppingCart) complexity += 3;
    if (requirements.realTimeUpdates) complexity += 3;
    if (requirements.formManagement) complexity += 1;

    if (complexity < 3) return 'low';
    if (complexity < 7) return 'medium';
    return 'high';
  }

  extractPerformanceNeeds(requirements) {
    return {
      targetLoadTime: requirements.performance?.targetLoadTime || '< 3s',
      targetFCP: '< 1.8s',
      targetLCP: '< 2.5s',
      targetCLS: '< 0.1'
    };
  }

  extractAccessibilityNeeds(requirements) {
    return {
      required: requirements.accessibility?.required || true,
      level: requirements.accessibility?.level || 'AA',
      specificNeeds: requirements.accessibility?.specificNeeds || []
    };
  }

  identifyStoreStructure(requirements) {
    const stores = ['authStore', 'uiStore'];
    if (requirements.shoppingCart) stores.push('cartStore');
    if (requirements.notifications) stores.push('notificationStore');
    return stores;
  }

  identifyReduxSlices(requirements) {
    const slices = ['auth', 'ui'];
    if (requirements.shoppingCart) slices.push('cart');
    if (requirements.products) slices.push('products');
    if (requirements.orders) slices.push('orders');
    return slices;
  }

  identifyPageLayouts(requirements) {
    return ['MainLayout', 'AuthLayout', 'DashboardLayout'];
  }

  identifyPages(requirements) {
    return requirements.pages || [
      { path: '/', component: 'HomePage', layout: 'MainLayout' },
      { path: '/about', component: 'AboutPage', layout: 'MainLayout' }
    ];
  }

  identifyCustomComponents(requirements) {
    return requirements.customComponents || ['Hero', 'FeatureGrid', 'Testimonials'];
  }

  identifySharedComponents(requirements) {
    return ['Button', 'Input', 'Card', 'Modal', 'Toast'];
  }

  identifyRouteGuards(requirements) {
    if (!requirements.authentication) return [];
    return ['AuthGuard', 'RoleGuard'];
  }

  identifyRedirects(requirements) {
    return requirements.redirects || [];
  }

  identifyDynamicImports(requirements) {
    return ['Dashboard', 'AdminPanel', 'UserSettings'];
  }

  prioritizeImplementation(requirements) {
    return [
      '1. Core layout and routing structure',
      '2. State management setup',
      '3. Shared components and design system',
      '4. Page components',
      '5. Performance optimizations',
      '6. Accessibility enhancements'
    ];
  }

  assessComplexity(requirements) {
    const score = this.assessRequirementComplexity(requirements);
    return score;
  }

  estimateImplementationTime(requirements) {
    const complexity = this.assessRequirementComplexity(requirements);
    const pageCount = requirements.pages?.length || 5;

    let baseHours = 40;
    if (complexity === 'medium') baseHours = 80;
    if (complexity === 'high') baseHours = 160;

    baseHours += pageCount * 4;

    return `${baseHours}-${baseHours * 1.5} hours`;
  }

  identifyDependencies(frameworkChoice, stateManagement) {
    const deps = ['react', 'react-dom', 'typescript'];

    if (frameworkChoice.framework === 'next.js') {
      deps.push('next');
    }

    deps.push('tailwindcss', 'postcss', 'autoprefixer');

    if (stateManagement.pattern === 'redux-toolkit') {
      deps.push('@reduxjs/toolkit', 'react-redux');
    } else if (stateManagement.pattern === 'zustand') {
      deps.push('zustand');
    }

    return deps;
  }

  async calculateQualityScore(result) {
    let score = 1.0;

    // Check if framework choice follows simplicity principle
    if (result.output.frameworkChoice.framework === 'static-html' &&
        result.output.architectureNeeds.scale === 'small') {
      score += 0.0; // Perfect choice
    } else if (result.output.frameworkChoice.framework === 'next.js' &&
               !result.output.architectureNeeds.performanceRequirements) {
      score -= 0.1; // Over-engineering
    }

    // Check state management appropriateness
    if (result.output.stateManagement.pattern === 'context-api' &&
        result.output.architectureNeeds.stateComplexity === 'low') {
      score += 0.0; // Good choice
    }

    // Check accessibility planning
    if (result.output.accessibilityPlan.wcagLevel === 'AA') {
      score += 0.0; // Standard compliance
    }

    return Math.min(1.0, Math.max(0, score));
  }
}

/**
 * Backend Architect
 *
 * Specializes in:
 * - API architecture design
 * - Service layer organization
 * - Authentication and authorization
 * - Database integration patterns
 * - Microservices vs monolith decisions
 * - Caching strategies
 */
class BackendArchitect extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      agentType: 'backend-architect',
      domain: 'development',
      version: '1.0.0',
      capabilities: [
        'api-architecture',
        'service-design',
        'authentication-design',
        'database-integration',
        'caching-strategy',
        'scalability-planning'
      ],
      requiredTools: ['node.js', 'typescript', 'express', 'postgresql'],
      estimatedDuration: 60000,
      qualityTarget: 0.95,
      ...config
    });

    this.architecturePatterns = ['monolith', 'microservices', 'modular-monolith'];
    this.authStrategies = ['jwt', 'session', 'oauth2', 'saml'];
  }

  async executeTask(task, context) {
    const { projectType, requirements, existingServices } = task;

    console.log(`🏗️  [BackendArchitect] Designing backend for ${projectType}`);

    // 1. Choose architecture pattern
    const architecturePattern = await this.selectArchitecturePattern(requirements);

    // 2. Design API structure
    const apiStructure = await this.designApiStructure(requirements);

    // 3. Plan authentication/authorization
    const authDesign = await this.designAuthentication(requirements);

    // 4. Service layer organization
    const serviceArchitecture = await this.designServiceLayer(requirements);

    // 5. Database integration pattern
    const databaseIntegration = await this.designDatabaseIntegration(requirements);

    // 6. Caching strategy
    const cachingStrategy = await this.designCaching(requirements);

    // 7. Scalability planning
    const scalabilityPlan = await this.planScalability(requirements);

    return {
      output: {
        architecturePattern,
        apiStructure,
        authDesign,
        serviceArchitecture,
        databaseIntegration,
        cachingStrategy,
        scalabilityPlan,
        implementationRoadmap: this.createImplementationRoadmap(requirements)
      },
      metadata: {
        complexity: this.assessBackendComplexity(requirements),
        estimatedDevelopmentTime: this.estimateDevelopmentTime(requirements),
        recommendedTeamSize: this.recommendTeamSize(requirements),
        criticalDependencies: this.identifyCriticalDependencies(requirements)
      }
    };
  }

  async selectArchitecturePattern(requirements) {
    const teamSize = requirements.teamSize || 1;
    const expectedScale = requirements.expectedScale || 'small';
    const serviceCount = requirements.services?.length || 1;

    if (teamSize <= 3 && expectedScale === 'small') {
      return {
        pattern: 'monolith',
        reasoning: 'Small team and scale - monolith provides simplicity and speed',
        structure: 'Modular monolith with clear domain boundaries',
        benefits: ['Faster development', 'Simpler deployment', 'Easier debugging']
      };
    }

    if (teamSize > 3 && serviceCount > 5) {
      return {
        pattern: 'microservices',
        reasoning: 'Large team and multiple services - microservices enable parallel development',
        serviceDesign: 'Domain-driven design with clear service boundaries',
        communication: 'Event-driven with message queue',
        benefits: ['Independent scaling', 'Team autonomy', 'Technology flexibility']
      };
    }

    return {
      pattern: 'modular-monolith',
      reasoning: 'Medium scale - modular monolith provides monolith benefits with microservices preparedness',
      structure: 'Clear module boundaries that can be extracted later',
      benefits: ['Development simplicity', 'Easy migration path', 'Clear boundaries']
    };
  }

  async designApiStructure(requirements) {
    const apiType = requirements.apiType || 'rest';

    if (apiType === 'graphql') {
      return {
        type: 'graphql',
        structure: {
          schema: 'Type-first schema design',
          resolvers: 'Resolver per type',
          dataLoaders: 'N+1 query prevention'
        },
        tools: ['apollo-server', 'graphql', 'dataloader']
      };
    }

    return {
      type: 'rest',
      structure: {
        versioning: 'URL versioning (/api/v1/)',
        resourceNaming: 'Plural nouns (/users, /products)',
        httpMethods: 'Proper HTTP verb usage',
        statusCodes: 'Semantic status codes'
      },
      endpoints: this.designEndpoints(requirements),
      documentation: 'OpenAPI 3.0 specification',
      tools: ['express', 'swagger']
    };
  }

  async designAuthentication(requirements) {
    const authNeeded = requirements.authentication || false;

    if (!authNeeded) {
      return {
        required: false,
        reasoning: 'No authentication required for public API'
      };
    }

    const userTypes = requirements.userTypes || ['user'];
    const needsOAuth = requirements.oauthProviders?.length > 0;

    if (needsOAuth) {
      return {
        strategy: 'jwt-with-oauth',
        flow: 'OAuth2 authorization code flow with JWT',
        providers: requirements.oauthProviders,
        sessionManagement: 'JWT with refresh tokens',
        authorization: 'RBAC with role hierarchy',
        implementation: {
          library: 'passport.js',
          storage: 'Redis for refresh tokens',
          encryption: 'bcrypt for passwords'
        }
      };
    }

    return {
      strategy: 'jwt',
      flow: 'JWT with refresh tokens',
      sessionManagement: {
        accessToken: '15 minute expiry',
        refreshToken: '7 day expiry',
        storage: 'Redis for revocation list'
      },
      authorization: userTypes.length > 1 ? 'RBAC' : 'Simple authentication',
      implementation: {
        library: 'jsonwebtoken',
        middleware: 'Custom auth middleware',
        encryption: 'bcrypt for passwords'
      }
    };
  }

  async designServiceLayer(requirements) {
    return {
      structure: 'Service-Repository pattern',
      layers: {
        controllers: 'HTTP request handling and validation',
        services: 'Business logic and orchestration',
        repositories: 'Data access abstraction',
        models: 'Data models and validation'
      },
      services: this.identifyServices(requirements),
      dependencyInjection: 'Constructor injection for testability',
      errorHandling: 'Centralized error handling middleware'
    };
  }

  async designDatabaseIntegration(requirements) {
    const databaseType = requirements.database || 'postgresql';

    return {
      database: databaseType,
      orm: databaseType === 'mongodb' ? 'mongoose' : 'prisma',
      connectionPooling: {
        enabled: true,
        minConnections: 2,
        maxConnections: 10
      },
      migrations: {
        tool: 'prisma migrate',
        strategy: 'Version-controlled migrations'
      },
      transactions: 'Support for ACID transactions',
      optimization: {
        indexing: 'Strategic index design',
        queryOptimization: 'Query performance monitoring',
        caching: 'Query result caching'
      }
    };
  }

  async designCaching(requirements) {
    const needsCaching = requirements.expectedTraffic === 'high' || requirements.caching === true;

    if (!needsCaching) {
      return {
        required: false,
        reasoning: 'Low traffic - caching not critical'
      };
    }

    return {
      strategy: 'Multi-layer caching',
      layers: {
        application: {
          tool: 'Redis',
          pattern: 'Cache-aside',
          ttl: 'Configurable per resource'
        },
        database: {
          queryCache: 'Enabled',
          preparedStatements: 'Enabled'
        },
        cdn: {
          staticAssets: 'CloudFlare or similar',
          apiResponses: 'Optional for public endpoints'
        }
      },
      invalidation: 'Event-driven cache invalidation',
      monitoring: 'Cache hit rate tracking'
    };
  }

  async planScalability(requirements) {
    return {
      horizontal: {
        loadBalancing: 'Nginx or AWS ALB',
        stateless: 'Stateless API for easy scaling',
        sessionManagement: 'Redis for distributed sessions'
      },
      vertical: {
        resourceMonitoring: 'CPU and memory tracking',
        optimization: 'Profile and optimize bottlenecks'
      },
      database: {
        readReplicas: 'For read-heavy workloads',
        sharding: 'Consider if data grows beyond single instance',
        connectionPooling: 'Efficient connection usage'
      },
      monitoring: {
        apm: 'Application performance monitoring',
        logging: 'Centralized logging with ELK stack',
        metrics: 'Prometheus + Grafana'
      }
    };
  }

  designEndpoints(requirements) {
    const resources = requirements.resources || ['users'];
    return resources.map(resource => ({
      resource: `/${resource}`,
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      authentication: 'Required for mutations',
      rateLimit: '100 requests per minute'
    }));
  }

  identifyServices(requirements) {
    const services = ['AuthService', 'UserService'];
    if (requirements.email) services.push('EmailService');
    if (requirements.payments) services.push('PaymentService');
    if (requirements.notifications) services.push('NotificationService');
    return services;
  }

  createImplementationRoadmap(requirements) {
    return [
      '1. Project setup and dependency installation',
      '2. Database schema and migrations',
      '3. Authentication and authorization',
      '4. Core service layer',
      '5. API endpoints',
      '6. Caching implementation',
      '7. Testing and documentation',
      '8. Deployment and monitoring'
    ];
  }

  assessBackendComplexity(requirements) {
    let complexity = 0;
    if (requirements.authentication) complexity += 2;
    if (requirements.realTimeFeatures) complexity += 3;
    if (requirements.paymentIntegration) complexity += 3;
    if (requirements.microservices) complexity += 4;

    if (complexity < 3) return 'low';
    if (complexity < 7) return 'medium';
    return 'high';
  }

  estimateDevelopmentTime(requirements) {
    const complexity = this.assessBackendComplexity(requirements);
    const endpointCount = requirements.resources?.length || 5;

    let baseHours = 60;
    if (complexity === 'medium') baseHours = 120;
    if (complexity === 'high') baseHours = 240;

    baseHours += endpointCount * 4;

    return `${baseHours}-${baseHours * 1.3} hours`;
  }

  recommendTeamSize(requirements) {
    const complexity = this.assessBackendComplexity(requirements);
    if (complexity === 'low') return '1-2 developers';
    if (complexity === 'medium') return '2-3 developers';
    return '3-5 developers';
  }

  identifyCriticalDependencies(requirements) {
    const deps = ['express', 'typescript', 'prisma'];
    if (requirements.authentication) deps.push('jsonwebtoken', 'bcrypt');
    if (requirements.caching) deps.push('redis');
    if (requirements.validation) deps.push('zod');
    return deps;
  }

  async calculateQualityScore(result) {
    let score = 1.0;

    // Check architecture appropriateness
    if (result.output.architecturePattern.pattern === 'monolith' &&
        result.metadata.complexity === 'low') {
      score += 0.0; // Good choice
    } else if (result.output.architecturePattern.pattern === 'microservices' &&
               result.metadata.complexity === 'low') {
      score -= 0.15; // Over-engineering
    }

    // Check authentication design
    if (result.output.authDesign.strategy === 'jwt') {
      score += 0.0; // Standard modern approach
    }

    return Math.min(1.0, Math.max(0, score));
  }
}

/**
 * API Design Specialist
 *
 * Specializes in:
 * - RESTful API design best practices
 * - GraphQL schema design
 * - API versioning strategies
 * - Request/response validation
 * - Error handling patterns
 * - API documentation
 */
class ApiDesignSpecialist extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      agentType: 'api-design-specialist',
      domain: 'development',
      version: '1.0.0',
      capabilities: [
        'rest-api-design',
        'graphql-schema-design',
        'api-versioning',
        'validation-design',
        'error-handling',
        'api-documentation'
      ],
      requiredTools: ['openapi', 'swagger', 'zod'],
      estimatedDuration: 45000,
      qualityTarget: 0.95,
      ...config
    });

    this.restPrinciples = [
      'Resource-based URLs',
      'HTTP verbs for operations',
      'Stateless communication',
      'Consistent response formats',
      'Proper status codes'
    ];
  }

  async executeTask(task, context) {
    const { apiType, resources, requirements } = task;

    console.log(`🔌 [ApiDesignSpecialist] Designing ${apiType} API`);

    if (apiType === 'graphql') {
      return await this.designGraphQLApi(resources, requirements);
    }

    return await this.designRestApi(resources, requirements);
  }

  async designRestApi(resources, requirements) {
    // 1. Design resource endpoints
    const endpoints = await this.designEndpoints(resources);

    // 2. Define request/response schemas
    const schemas = await this.designSchemas(resources);

    // 3. Error handling strategy
    const errorHandling = await this.designErrorHandling();

    // 4. Validation rules
    const validation = await this.designValidation(resources);

    // 5. API documentation
    const documentation = await this.generateOpenApiSpec(endpoints, schemas);

    return {
      output: {
        apiType: 'REST',
        endpoints,
        schemas,
        errorHandling,
        validation,
        documentation,
        bestPractices: this.restPrinciples
      },
      metadata: {
        endpointCount: endpoints.length,
        complexity: this.assessApiComplexity(resources),
        estimatedImplementationTime: `${endpoints.length * 2}-${endpoints.length * 3} hours`
      }
    };
  }

  async designGraphQLApi(resources, requirements) {
    const schema = await this.designGraphQLSchema(resources);
    const resolvers = await this.designResolvers(resources);
    const mutations = await this.designMutations(resources);
    const subscriptions = requirements.realTime ? await this.designSubscriptions(resources) : null;

    return {
      output: {
        apiType: 'GraphQL',
        schema,
        resolvers,
        mutations,
        subscriptions,
        errorHandling: this.designGraphQLErrorHandling(),
        optimization: {
          dataLoader: 'N+1 query prevention',
          queryComplexity: 'Complexity limiting',
          depth: 'Max depth 10'
        }
      },
      metadata: {
        typeCount: schema.types.length,
        complexity: this.assessGraphQLComplexity(resources),
        estimatedImplementationTime: `${resources.length * 4}-${resources.length * 6} hours`
      }
    };
  }

  async designEndpoints(resources) {
    return resources.map(resource => ({
      resource: `/${resource.toLowerCase()}`,
      endpoints: [
        {
          method: 'GET',
          path: `/${resource.toLowerCase()}`,
          description: `List all ${resource}`,
          authentication: false,
          rateLimit: '100/min',
          queryParams: ['page', 'limit', 'sort', 'filter']
        },
        {
          method: 'GET',
          path: `/${resource.toLowerCase()}/:id`,
          description: `Get ${resource} by ID`,
          authentication: false,
          rateLimit: '100/min'
        },
        {
          method: 'POST',
          path: `/${resource.toLowerCase()}`,
          description: `Create new ${resource}`,
          authentication: true,
          rateLimit: '30/min',
          validation: 'Required'
        },
        {
          method: 'PUT',
          path: `/${resource.toLowerCase()}/:id`,
          description: `Update ${resource}`,
          authentication: true,
          rateLimit: '30/min',
          validation: 'Required'
        },
        {
          method: 'DELETE',
          path: `/${resource.toLowerCase()}/:id`,
          description: `Delete ${resource}`,
          authentication: true,
          rateLimit: '30/min'
        }
      ]
    }));
  }

  async designSchemas(resources) {
    return resources.map(resource => ({
      resource,
      requestSchema: this.generateRequestSchema(resource),
      responseSchema: this.generateResponseSchema(resource),
      validationRules: this.generateValidationRules(resource)
    }));
  }

  async designErrorHandling() {
    return {
      format: {
        error: true,
        message: 'Human-readable error message',
        code: 'Machine-readable error code',
        details: 'Additional error context',
        timestamp: 'ISO 8601 timestamp',
        requestId: 'Unique request identifier'
      },
      statusCodes: {
        400: 'Bad Request - Invalid input',
        401: 'Unauthorized - Authentication required',
        403: 'Forbidden - Insufficient permissions',
        404: 'Not Found - Resource does not exist',
        409: 'Conflict - Resource already exists',
        422: 'Unprocessable Entity - Validation failed',
        429: 'Too Many Requests - Rate limit exceeded',
        500: 'Internal Server Error - Server malfunction'
      },
      logging: 'All errors logged with stack traces in development'
    };
  }

  async designValidation(resources) {
    return {
      library: 'zod',
      strategy: 'Schema-first validation',
      errorMessages: 'User-friendly validation messages',
      sanitization: 'Input sanitization for security',
      examples: resources.map(resource => ({
        resource,
        validationSchema: `${resource}Schema`,
        usage: `validate(req.body, ${resource}Schema)`
      }))
    };
  }

  async generateOpenApiSpec(endpoints, schemas) {
    return {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        description: 'Auto-generated API documentation'
      },
      servers: [
        { url: 'http://localhost:3000/api/v1', description: 'Development' },
        { url: 'https://api.example.com/v1', description: 'Production' }
      ],
      paths: this.convertEndpointsToOpenApi(endpoints),
      components: {
        schemas: this.convertSchemasToOpenApi(schemas),
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      }
    };
  }

  async designGraphQLSchema(resources) {
    return {
      types: resources.map(resource => ({
        name: resource,
        fields: this.generateGraphQLFields(resource)
      })),
      queries: resources.map(resource => ({
        name: `${resource.toLowerCase()}`,
        returnType: `[${resource}]`,
        args: ['filter: FilterInput', 'pagination: PaginationInput']
      }))
    };
  }

  async designResolvers(resources) {
    return resources.map(resource => ({
      type: resource,
      resolver: `${resource}Resolver`,
      methods: ['findAll', 'findById', 'create', 'update', 'delete']
    }));
  }

  async designMutations(resources) {
    return resources.map(resource => ({
      create: `create${resource}`,
      update: `update${resource}`,
      delete: `delete${resource}`
    }));
  }

  async designSubscriptions(resources) {
    return resources.map(resource => ({
      created: `${resource.toLowerCase()}Created`,
      updated: `${resource.toLowerCase()}Updated`,
      deleted: `${resource.toLowerCase()}Deleted`
    }));
  }

  designGraphQLErrorHandling() {
    return {
      format: 'GraphQL error format with extensions',
      codes: ['UNAUTHENTICATED', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION_ERROR'],
      stackTrace: 'Included in development only'
    };
  }

  generateRequestSchema(resource) {
    return {
      type: 'object',
      properties: {
        name: { type: 'string', required: true },
        description: { type: 'string' }
      }
    };
  }

  generateResponseSchema(resource) {
    return {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' }
      }
    };
  }

  generateValidationRules(resource) {
    return {
      name: ['required', 'string', 'min:3', 'max:100'],
      description: ['optional', 'string', 'max:500']
    };
  }

  generateGraphQLFields(resource) {
    return [
      { name: 'id', type: 'ID!' },
      { name: 'name', type: 'String!' },
      { name: 'description', type: 'String' },
      { name: 'createdAt', type: 'DateTime!' },
      { name: 'updatedAt', type: 'DateTime!' }
    ];
  }

  convertEndpointsToOpenApi(endpoints) {
    // Simplified - real implementation would be more detailed
    return endpoints.reduce((acc, resource) => {
      resource.endpoints.forEach(endpoint => {
        const path = endpoint.path.replace(':id', '{id}');
        if (!acc[path]) acc[path] = {};
        acc[path][endpoint.method.toLowerCase()] = {
          summary: endpoint.description,
          security: endpoint.authentication ? [{ bearerAuth: [] }] : []
        };
      });
      return acc;
    }, {});
  }

  convertSchemasToOpenApi(schemas) {
    return schemas.reduce((acc, schema) => {
      acc[schema.resource] = schema.responseSchema;
      acc[`${schema.resource}Input`] = schema.requestSchema;
      return acc;
    }, {});
  }

  assessApiComplexity(resources) {
    const resourceCount = resources.length;
    if (resourceCount < 5) return 'low';
    if (resourceCount < 15) return 'medium';
    return 'high';
  }

  assessGraphQLComplexity(resources) {
    const typeCount = resources.length;
    if (typeCount < 5) return 'low';
    if (typeCount < 10) return 'medium';
    return 'high';
  }

  async calculateQualityScore(result) {
    let score = 1.0;

    // Check endpoint design
    if (result.output.endpoints) {
      const hasProperVerbs = result.output.endpoints.every(r =>
        r.endpoints.every(e => ['GET', 'POST', 'PUT', 'DELETE'].includes(e.method))
      );
      if (!hasProperVerbs) score -= 0.1;
    }

    // Check error handling
    if (!result.output.errorHandling) score -= 0.15;

    // Check validation
    if (!result.output.validation) score -= 0.1;

    return Math.min(1.0, Math.max(0, score));
  }
}

/**
 * Database Schema Designer
 *
 * Specializes in:
 * - Database schema design
 * - Relationship modeling (one-to-many, many-to-many)
 * - Index optimization
 * - Data integrity constraints
 * - Migration planning
 * - Query optimization
 */
class DatabaseSchemaDesigner extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      agentType: 'database-schema-designer',
      domain: 'development',
      version: '1.0.0',
      capabilities: [
        'schema-design',
        'relationship-modeling',
        'index-optimization',
        'constraint-design',
        'migration-planning',
        'query-optimization'
      ],
      requiredTools: ['prisma', 'postgresql'],
      estimatedDuration: 50000,
      qualityTarget: 0.95,
      ...config
    });

    this.databaseTypes = ['postgresql', 'mysql', 'mongodb', 'sqlite'];
    this.relationshipTypes = ['one-to-one', 'one-to-many', 'many-to-many'];
  }

  async executeTask(task, context) {
    const { databaseType, entities, requirements } = task;

    console.log(`🗄️  [DatabaseSchemaDesigner] Designing schema for ${databaseType}`);

    // 1. Design table schemas
    const tableSchemas = await this.designTableSchemas(entities);

    // 2. Model relationships
    const relationships = await this.modelRelationships(entities);

    // 3. Define constraints
    const constraints = await this.defineConstraints(entities);

    // 4. Plan indexes
    const indexes = await this.planIndexes(entities, requirements);

    // 5. Create migration plan
    const migrationPlan = await this.createMigrationPlan(tableSchemas, relationships);

    // 6. Query optimization recommendations
    const queryOptimizations = await this.recommendQueryOptimizations(entities, requirements);

    return {
      output: {
        databaseType,
        tableSchemas,
        relationships,
        constraints,
        indexes,
        migrationPlan,
        queryOptimizations,
        prismaSchema: this.generatePrismaSchema(tableSchemas, relationships)
      },
      metadata: {
        tableCount: tableSchemas.length,
        relationshipCount: relationships.length,
        indexCount: indexes.reduce((sum, table) => sum + table.indexes.length, 0),
        complexity: this.assessSchemaComplexity(tableSchemas, relationships),
        estimatedMigrationTime: `${tableSchemas.length * 5}-${tableSchemas.length * 10} minutes`
      }
    };
  }

  async designTableSchemas(entities) {
    return entities.map(entity => ({
      tableName: this.toSnakeCase(entity.name),
      columns: [
        {
          name: 'id',
          type: 'uuid',
          primaryKey: true,
          default: 'gen_random_uuid()'
        },
        ...entity.fields.map(field => this.designColumn(field)),
        {
          name: 'created_at',
          type: 'timestamp',
          nullable: false,
          default: 'now()'
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          nullable: false,
          default: 'now()'
        }
      ],
      constraints: this.identifyTableConstraints(entity)
    }));
  }

  async modelRelationships(entities) {
    const relationships = [];

    entities.forEach(entity => {
      if (entity.relationships) {
        entity.relationships.forEach(rel => {
          relationships.push({
            type: rel.type,
            from: entity.name,
            to: rel.target,
            foreignKey: `${this.toSnakeCase(rel.target)}_id`,
            onDelete: rel.onDelete || 'CASCADE',
            onUpdate: 'CASCADE',
            junctionTable: rel.type === 'many-to-many' ?
              `${this.toSnakeCase(entity.name)}_${this.toSnakeCase(rel.target)}` :
              null
          });
        });
      }
    });

    return relationships;
  }

  async defineConstraints(entities) {
    const constraints = [];

    entities.forEach(entity => {
      // Primary key
      constraints.push({
        type: 'PRIMARY KEY',
        table: this.toSnakeCase(entity.name),
        columns: ['id']
      });

      // Unique constraints
      if (entity.uniqueFields) {
        entity.uniqueFields.forEach(field => {
          constraints.push({
            type: 'UNIQUE',
            table: this.toSnakeCase(entity.name),
            columns: [this.toSnakeCase(field)]
          });
        });
      }

      // Check constraints
      if (entity.checkConstraints) {
        entity.checkConstraints.forEach(check => {
          constraints.push({
            type: 'CHECK',
            table: this.toSnakeCase(entity.name),
            condition: check.condition,
            name: check.name
          });
        });
      }
    });

    return constraints;
  }

  async planIndexes(entities, requirements) {
    return entities.map(entity => {
      const indexes = [];

      // Primary key index (automatic)
      indexes.push({
        name: `${this.toSnakeCase(entity.name)}_pkey`,
        columns: ['id'],
        type: 'PRIMARY'
      });

      // Foreign key indexes
      if (entity.relationships) {
        entity.relationships.forEach(rel => {
          indexes.push({
            name: `idx_${this.toSnakeCase(entity.name)}_${this.toSnakeCase(rel.target)}_id`,
            columns: [`${this.toSnakeCase(rel.target)}_id`],
            type: 'BTREE'
          });
        });
      }

      // Frequently queried fields
      if (entity.frequentlyQueried) {
        entity.frequentlyQueried.forEach(field => {
          indexes.push({
            name: `idx_${this.toSnakeCase(entity.name)}_${this.toSnakeCase(field)}`,
            columns: [this.toSnakeCase(field)],
            type: 'BTREE'
          });
        });
      }

      // Composite indexes for common queries
      if (entity.compositeIndexes) {
        entity.compositeIndexes.forEach(composite => {
          indexes.push({
            name: `idx_${this.toSnakeCase(entity.name)}_${composite.fields.join('_')}`,
            columns: composite.fields.map(f => this.toSnakeCase(f)),
            type: 'BTREE'
          });
        });
      }

      // Full-text search indexes
      if (entity.fullTextSearch) {
        indexes.push({
          name: `idx_${this.toSnakeCase(entity.name)}_fulltext`,
          columns: entity.fullTextSearch.map(f => this.toSnakeCase(f)),
          type: 'GIN',
          using: 'to_tsvector'
        });
      }

      return {
        table: this.toSnakeCase(entity.name),
        indexes
      };
    });
  }

  async createMigrationPlan(tableSchemas, relationships) {
    return {
      migrations: [
        {
          step: 1,
          name: 'create_tables',
          operations: tableSchemas.map(schema => ({
            type: 'CREATE TABLE',
            table: schema.tableName,
            columns: schema.columns
          }))
        },
        {
          step: 2,
          name: 'add_foreign_keys',
          operations: relationships
            .filter(rel => rel.type !== 'many-to-many')
            .map(rel => ({
              type: 'ADD FOREIGN KEY',
              table: this.toSnakeCase(rel.from),
              column: rel.foreignKey,
              references: {
                table: this.toSnakeCase(rel.to),
                column: 'id'
              },
              onDelete: rel.onDelete,
              onUpdate: rel.onUpdate
            }))
        },
        {
          step: 3,
          name: 'create_junction_tables',
          operations: relationships
            .filter(rel => rel.type === 'many-to-many')
            .map(rel => ({
              type: 'CREATE TABLE',
              table: rel.junctionTable,
              columns: [
                {
                  name: `${this.toSnakeCase(rel.from)}_id`,
                  type: 'uuid',
                  nullable: false
                },
                {
                  name: `${this.toSnakeCase(rel.to)}_id`,
                  type: 'uuid',
                  nullable: false
                }
              ],
              primaryKey: [`${this.toSnakeCase(rel.from)}_id`, `${this.toSnakeCase(rel.to)}_id`]
            }))
        },
        {
          step: 4,
          name: 'create_indexes',
          operations: 'See index plan above'
        }
      ],
      rollbackStrategy: 'Each migration includes a down() method for rollback',
      tools: {
        migrationTool: 'Prisma Migrate',
        versionControl: 'Git-tracked migration files',
        testing: 'Test migrations on staging before production'
      }
    };
  }

  async recommendQueryOptimizations(entities, requirements) {
    return {
      indexing: [
        'Index all foreign keys for join performance',
        'Composite indexes for common multi-column queries',
        'Partial indexes for filtered queries',
        'Full-text indexes for search functionality'
      ],
      queryPatterns: [
        'Use SELECT specific columns instead of SELECT *',
        'Implement pagination with cursor-based pagination for large datasets',
        'Use EXPLAIN ANALYZE to profile slow queries',
        'Consider materialized views for complex aggregations'
      ],
      caching: [
        'Cache frequently accessed read-only data',
        'Use query result caching for expensive queries',
        'Implement cache invalidation strategy'
      ],
      connectionPooling: {
        enabled: true,
        minConnections: 2,
        maxConnections: 10,
        idleTimeout: 10000
      },
      monitoring: [
        'Log slow queries (> 1000ms)',
        'Monitor index usage',
        'Track connection pool metrics',
        'Alert on high query times'
      ]
    };
  }

  designColumn(field) {
    const typeMapping = {
      string: 'varchar(255)',
      text: 'text',
      integer: 'integer',
      float: 'decimal(10,2)',
      boolean: 'boolean',
      date: 'date',
      datetime: 'timestamp',
      json: 'jsonb'
    };

    return {
      name: this.toSnakeCase(field.name),
      type: typeMapping[field.type] || 'varchar(255)',
      nullable: field.required ? false : true,
      unique: field.unique || false,
      default: field.default || null
    };
  }

  identifyTableConstraints(entity) {
    const constraints = [];

    if (entity.uniqueConstraints) {
      entity.uniqueConstraints.forEach(uc => {
        constraints.push({
          type: 'UNIQUE',
          columns: uc.columns
        });
      });
    }

    return constraints;
  }

  generatePrismaSchema(tableSchemas, relationships) {
    let schema = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

`;

    tableSchemas.forEach(table => {
      schema += `model ${this.toPascalCase(table.tableName)} {\n`;

      table.columns.forEach(col => {
        const prismaType = this.toPrismaType(col.type);
        const nullable = col.nullable ? '?' : '';
        const decorator = col.primaryKey ? ' @id @default(uuid())' :
                         col.unique ? ' @unique' :
                         col.default ? ` @default(${col.default})` : '';

        schema += `  ${this.toCamelCase(col.name)} ${prismaType}${nullable}${decorator}\n`;
      });

      // Add relationships
      const entityRelationships = relationships.filter(r =>
        this.toSnakeCase(r.from) === table.tableName
      );

      entityRelationships.forEach(rel => {
        if (rel.type === 'one-to-many' || rel.type === 'many-to-one') {
          schema += `  ${this.toCamelCase(rel.to)} ${this.toPascalCase(rel.to)}${rel.type === 'one-to-many' ? '[]' : ''}\n`;
        }
      });

      schema += `  @@map("${table.tableName}")\n`;
      schema += `}\n\n`;
    });

    return schema;
  }

  toSnakeCase(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }

  toCamelCase(str) {
    return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  }

  toPascalCase(str) {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  toPrismaType(sqlType) {
    const mapping = {
      'uuid': 'String',
      'varchar': 'String',
      'text': 'String',
      'integer': 'Int',
      'decimal': 'Decimal',
      'boolean': 'Boolean',
      'date': 'DateTime',
      'timestamp': 'DateTime',
      'jsonb': 'Json'
    };

    const baseType = sqlType.split('(')[0];
    return mapping[baseType] || 'String';
  }

  assessSchemaComplexity(tableSchemas, relationships) {
    const tableCount = tableSchemas.length;
    const relationshipCount = relationships.length;

    const complexity = tableCount + (relationshipCount * 0.5);

    if (complexity < 5) return 'low';
    if (complexity < 15) return 'medium';
    return 'high';
  }

  async calculateQualityScore(result) {
    let score = 1.0;

    // Check if all tables have primary keys
    const allHavePK = result.output.tableSchemas.every(table =>
      table.columns.some(col => col.primaryKey)
    );
    if (!allHavePK) score -= 0.2;

    // Check if foreign keys have indexes
    const fkIndexed = result.output.indexes.every(table =>
      table.indexes.length > 0
    );
    if (!fkIndexed) score -= 0.1;

    // Check if timestamps are included
    const allHaveTimestamps = result.output.tableSchemas.every(table =>
      table.columns.some(col => col.name === 'created_at')
    );
    if (!allHaveTimestamps) score -= 0.05;

    return Math.min(1.0, Math.max(0, score));
  }
}

/**
 * Deployment Automation Specialist
 *
 * Specializes in:
 * - CI/CD pipeline design
 * - Container orchestration (Docker, Kubernetes)
 * - Infrastructure as Code (Terraform, CloudFormation)
 * - Environment management (dev, staging, prod)
 * - Monitoring and alerting setup
 * - Rollback strategies
 */
class DeploymentAutomationSpecialist extends BaseSpecializedAgent {
  constructor(config = {}) {
    super({
      agentType: 'deployment-automation-specialist',
      domain: 'development',
      version: '1.0.0',
      capabilities: [
        'ci-cd-design',
        'containerization',
        'infrastructure-as-code',
        'environment-management',
        'monitoring-setup',
        'rollback-planning'
      ],
      requiredTools: ['docker', 'github-actions', 'terraform'],
      estimatedDuration: 60000,
      qualityTarget: 0.95,
      ...config
    });

    this.platforms = ['aws', 'gcp', 'azure', 'vercel', 'heroku', 'digitalocean'];
    this.cicdTools = ['github-actions', 'gitlab-ci', 'jenkins', 'circleci'];
  }

  async executeTask(task, context) {
    const { platform, projectType, requirements } = task;

    console.log(`🚀 [DeploymentAutomationSpecialist] Designing deployment for ${platform}`);

    // 1. Select deployment platform
    const deploymentPlatform = await this.selectPlatform(platform, projectType, requirements);

    // 2. Design CI/CD pipeline
    const cicdPipeline = await this.designCiCdPipeline(projectType, requirements);

    // 3. Create Dockerfile
    const containerization = await this.designContainerization(projectType);

    // 4. Infrastructure as Code
    const infrastructure = await this.designInfrastructure(platform, requirements);

    // 5. Environment configuration
    const environmentConfig = await this.designEnvironments(requirements);

    // 6. Monitoring and logging
    const monitoring = await this.designMonitoring(platform, requirements);

    // 7. Rollback strategy
    const rollbackStrategy = await this.designRollbackStrategy();

    return {
      output: {
        deploymentPlatform,
        cicdPipeline,
        containerization,
        infrastructure,
        environmentConfig,
        monitoring,
        rollbackStrategy,
        deploymentChecklist: this.createDeploymentChecklist()
      },
      metadata: {
        platform,
        complexity: this.assessDeploymentComplexity(requirements),
        estimatedSetupTime: this.estimateSetupTime(requirements),
        costEstimate: this.estimateMonthlyCost(platform, requirements)
      }
    };
  }

  async selectPlatform(platform, projectType, requirements) {
    if (projectType === 'static-site' || projectType === 'next.js') {
      return {
        recommended: 'vercel',
        reasoning: 'Optimized for static sites and Next.js with automatic deployments',
        alternatives: ['netlify', 'cloudflare-pages'],
        costEstimate: 'Free tier available, $20+/month for production'
      };
    }

    if (projectType === 'full-stack' && requirements.scale === 'small') {
      return {
        recommended: 'heroku',
        reasoning: 'Simple deployment for small full-stack apps',
        alternatives: ['digitalocean-app-platform', 'render'],
        costEstimate: '$7-25/month for basic tier'
      };
    }

    return {
      recommended: 'aws',
      reasoning: 'Maximum flexibility and scalability for complex applications',
      services: ['ECS', 'RDS', 'S3', 'CloudFront', 'Route53'],
      alternatives: ['gcp', 'azure'],
      costEstimate: '$50-500+/month depending on usage'
    };
  }

  async designCiCdPipeline(projectType, requirements) {
    return {
      tool: 'github-actions',
      workflows: {
        ci: {
          name: 'Continuous Integration',
          triggers: ['push', 'pull_request'],
          steps: [
            'Checkout code',
            'Setup Node.js',
            'Install dependencies',
            'Run linting',
            'Run type checking',
            'Run tests',
            'Build application',
            'Upload artifacts'
          ],
          caching: ['node_modules', 'build cache']
        },
        cd: {
          name: 'Continuous Deployment',
          triggers: ['push to main', 'release created'],
          environments: {
            staging: 'Auto-deploy on push to develop',
            production: 'Manual approval required'
          },
          steps: [
            'Run CI pipeline',
            'Build Docker image',
            'Push to container registry',
            'Deploy to environment',
            'Run smoke tests',
            'Send deployment notification'
          ]
        }
      },
      secrets: [
        'DEPLOY_TOKEN',
        'DATABASE_URL',
        'API_KEYS',
        'CONTAINER_REGISTRY_CREDENTIALS'
      ],
      configuration: this.generateGithubActionsConfig(projectType)
    };
  }

  async designContainerization(projectType) {
    return {
      dockerfile: this.generateDockerfile(projectType),
      dockerCompose: this.generateDockerCompose(projectType),
      multiStage: true,
      baseImage: projectType === 'next.js' ? 'node:20-alpine' : 'node:20-alpine',
      optimization: {
        layerCaching: 'Separate dependency installation from code',
        imageSize: 'Multi-stage builds to reduce final image size',
        securityScanning: 'Scan images for vulnerabilities'
      },
      registries: {
        development: 'GitHub Container Registry',
        production: 'AWS ECR or Docker Hub'
      }
    };
  }

  async designInfrastructure(platform, requirements) {
    if (platform === 'vercel') {
      return {
        type: 'managed-platform',
        configuration: 'vercel.json for routing and headers',
        iac: 'Not required - managed by Vercel'
      };
    }

    return {
      tool: 'terraform',
      modules: [
        {
          name: 'networking',
          resources: ['VPC', 'Subnets', 'Security Groups', 'Load Balancer']
        },
        {
          name: 'compute',
          resources: ['ECS Cluster', 'ECS Service', 'Task Definitions']
        },
        {
          name: 'database',
          resources: ['RDS Instance', 'Backup Configuration']
        },
        {
          name: 'storage',
          resources: ['S3 Buckets', 'CloudFront Distribution']
        },
        {
          name: 'monitoring',
          resources: ['CloudWatch', 'SNS Topics', 'Alarms']
        }
      ],
      stateManagement: {
        backend: 'S3 with DynamoDB locking',
        encryption: 'Enabled',
        versioning: 'Enabled'
      },
      bestPractices: [
        'Separate state files per environment',
        'Use remote state for team collaboration',
        'Tag all resources for cost tracking',
        'Implement least privilege IAM policies'
      ]
    };
  }

  async designEnvironments(requirements) {
    return {
      environments: [
        {
          name: 'development',
          purpose: 'Local development',
          configuration: {
            database: 'Local PostgreSQL',
            redis: 'Local Redis',
            externalServices: 'Mock or development endpoints'
          }
        },
        {
          name: 'staging',
          purpose: 'Pre-production testing',
          configuration: {
            database: 'Staging RDS instance',
            redis: 'Staging ElastiCache',
            externalServices: 'Sandbox environments',
            dataSyncing: 'Periodic production data snapshots (anonymized)'
          }
        },
        {
          name: 'production',
          purpose: 'Live application',
          configuration: {
            database: 'Production RDS with read replicas',
            redis: 'Production ElastiCache cluster',
            externalServices: 'Production endpoints',
            backups: 'Daily automated backups with 30-day retention'
          }
        }
      ],
      secretsManagement: {
        tool: 'AWS Secrets Manager or HashiCorp Vault',
        rotation: 'Automatic secret rotation every 90 days',
        access: 'Role-based access control'
      },
      environmentVariables: this.identifyEnvironmentVariables(requirements)
    };
  }

  async designMonitoring(platform, requirements) {
    return {
      apm: {
        tool: 'New Relic or Datadog',
        metrics: [
          'Response times',
          'Error rates',
          'Throughput',
          'Database query performance',
          'External API latency'
        ]
      },
      logging: {
        tool: 'CloudWatch Logs or ELK Stack',
        retention: '30 days for application logs',
        structured: 'JSON formatted logs',
        correlation: 'Request ID tracking across services'
      },
      alerts: [
        {
          name: 'High Error Rate',
          condition: 'Error rate > 5% for 5 minutes',
          severity: 'critical',
          notification: 'PagerDuty + Slack'
        },
        {
          name: 'Slow Response Time',
          condition: 'P95 latency > 2s for 10 minutes',
          severity: 'warning',
          notification: 'Slack'
        },
        {
          name: 'Database Connection Issues',
          condition: 'Failed database connections > 10',
          severity: 'critical',
          notification: 'PagerDuty'
        },
        {
          name: 'High Memory Usage',
          condition: 'Memory usage > 85% for 15 minutes',
          severity: 'warning',
          notification: 'Slack'
        }
      ],
      dashboards: [
        'Application health overview',
        'Infrastructure metrics',
        'Business metrics (users, conversions)',
        'Error tracking and debugging'
      ],
      uptime: {
        tool: 'Pingdom or UptimeRobot',
        frequency: 'Check every 1 minute',
        locations: 'Multiple geographic locations'
      }
    };
  }

  async designRollbackStrategy() {
    return {
      deployment: {
        strategy: 'Blue-Green Deployment',
        process: [
          'Deploy new version to green environment',
          'Run smoke tests on green',
          'Switch traffic from blue to green',
          'Monitor for errors',
          'Keep blue running for quick rollback'
        ],
        rollbackTrigger: 'Automatic rollback if error rate > 10%',
        rollbackTime: '< 5 minutes'
      },
      database: {
        migrations: 'Backwards compatible migrations',
        rollback: 'Each migration includes down() method',
        backups: 'Automatic backup before each migration',
        testing: 'Test migrations on staging first'
      },
      artifacts: {
        retention: 'Keep last 10 deployment artifacts',
        storage: 'S3 with versioning enabled',
        quickRollback: 'One-click rollback to previous version'
      },
      communication: {
        preDeployment: 'Notify team in Slack',
        postDeployment: 'Deployment summary with health checks',
        incident: 'Immediate notification on rollback trigger'
      }
    };
  }

  generateGithubActionsConfig(projectType) {
    return `
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build

  deploy:
    needs: ci
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Deployment commands here
`;
  }

  generateDockerfile(projectType) {
    return `
# Multi-stage build for optimized image size
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]
`;
  }

  generateDockerCompose(projectType) {
    return `
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/myapp
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - db-data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  db-data:
  redis-data:
`;
  }

  identifyEnvironmentVariables(requirements) {
    const baseVars = [
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'REDIS_URL',
      'JWT_SECRET',
      'API_URL'
    ];

    if (requirements.email) baseVars.push('SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD');
    if (requirements.payments) baseVars.push('STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET');
    if (requirements.storage) baseVars.push('S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY');

    return baseVars;
  }

  createDeploymentChecklist() {
    return [
      '☐ Environment variables configured in all environments',
      '☐ Database migrations tested on staging',
      '☐ CI/CD pipeline configured and tested',
      '☐ Monitoring and alerting set up',
      '☐ SSL certificates configured',
      '☐ DNS records updated',
      '☐ Backup and restore procedures tested',
      '☐ Rollback procedure documented and tested',
      '☐ Security headers configured',
      '☐ Rate limiting enabled',
      '☐ CORS configuration verified',
      '☐ Health check endpoints working',
      '☐ Log aggregation configured',
      '☐ Performance baseline established',
      '☐ Team trained on deployment process'
    ];
  }

  assessDeploymentComplexity(requirements) {
    let complexity = 0;
    if (requirements.database) complexity += 2;
    if (requirements.redis) complexity += 1;
    if (requirements.microservices) complexity += 4;
    if (requirements.customInfrastructure) complexity += 3;

    if (complexity < 3) return 'low';
    if (complexity < 7) return 'medium';
    return 'high';
  }

  estimateSetupTime(requirements) {
    const complexity = this.assessDeploymentComplexity(requirements);

    if (complexity === 'low') return '4-8 hours';
    if (complexity === 'medium') return '1-2 days';
    return '3-5 days';
  }

  estimateMonthlyCost(platform, requirements) {
    if (platform === 'vercel' || platform === 'netlify') {
      return '$0-20 (free tier available)';
    }

    if (platform === 'heroku') {
      return '$25-100';
    }

    // AWS estimate
    let cost = 50; // Base ECS + Load Balancer
    if (requirements.database) cost += 30; // RDS
    if (requirements.redis) cost += 20; // ElastiCache
    if (requirements.highTraffic) cost += 100; // Additional compute

    return `$${cost}-${cost * 2}`;
  }

  async calculateQualityScore(result) {
    let score = 1.0;

    // Check if platform choice is appropriate
    if (result.output.deploymentPlatform.recommended) {
      score += 0.0; // Has a recommendation
    }

    // Check if monitoring is configured
    if (!result.output.monitoring) score -= 0.15;

    // Check if rollback strategy exists
    if (!result.output.rollbackStrategy) score -= 0.15;

    // Check if CI/CD pipeline is defined
    if (!result.output.cicdPipeline) score -= 0.1;

    return Math.min(1.0, Math.max(0, score));
  }
}

module.exports = {
  FrontendArchitect,
  BackendArchitect,
  ApiDesignSpecialist,
  DatabaseSchemaDesigner,
  DeploymentAutomationSpecialist
};
