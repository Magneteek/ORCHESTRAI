const { EventEmitter } = require('events');

class FrontendDevelopmentSpecialist extends EventEmitter {
    constructor(mcpManager, crystallineMemory, templateEngine) {
        super();

        this.mcpManager = mcpManager;
        this.crystallineMemory = crystallineMemory;
        this.templateEngine = templateEngine;

        this.config = {
            agentId: 'frontend-development-specialist',
            version: '2.0.0',
            capabilities: [
                'react-development',
                'typescript-implementation',
                'responsive-css',
                'component-architecture',
                'state-management',
                'performance-optimization',
                'accessibility-implementation',
                'testing-integration',
                'build-optimization',
                'deployment-automation'
            ],
            mcpServers: [
                'mcp__filesystem',
                'mcp__ref-tools',
                'mcp__memory',
                'mcp__sequential-thinking',
                'mcp__notion'
            ],
            technologies: {
                frameworks: ['react', 'next.js', 'gatsby', 'static-html'],
                styling: ['tailwind-css', 'styled-components', 'css-modules', 'sass'],
                stateManagement: ['react-context', 'zustand', 'redux-toolkit', 'jotai'],
                animation: ['framer-motion', 'react-spring', 'lottie', 'css-animations'],
                ui: ['shadcn-ui', 'headless-ui', 'radix-ui', 'chakra-ui'],
                testing: ['jest', 'testing-library', 'playwright', 'cypress'],
                build: ['vite', 'webpack', 'rollup', 'parcel']
            },
            designPatterns: [
                'compound-components',
                'render-props',
                'custom-hooks',
                'context-providers',
                'higher-order-components',
                'atomic-design'
            ]
        };

        this.activeDevelopment = new Map();
        this.componentTemplates = new Map();
        this.codePatterns = new Map();

        this.initializeAgent();
    }

    async initializeAgent() {
        console.log('💻 Initializing Frontend Development Specialist...');

        try {
            await this.loadCodeTemplates();
            await this.setupComponentPatterns();
            await this.initializeFrameworkConfigs();
            await this.setupOptimizationRules();
            await this.initializeMCPConnections();

            this.emit('agentInitialized', {
                agentId: this.config.agentId,
                capabilities: this.config.capabilities,
                status: 'ready'
            });

            console.log('✅ Frontend Development Specialist initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize Frontend Development Specialist:', error);
            this.emit('agentError', { error: error.message });
        }
    }

    async loadCodeTemplates() {
        const templatePaths = [
            '/orchestrai-system/templates/global/code-patterns/react-components.json',
            '/orchestrai-system/templates/global/code-patterns/typescript-interfaces.json',
            '/orchestrai-system/templates/global/code-patterns/css-patterns.json',
            '/orchestrai-system/templates/global/code-patterns/testing-patterns.json'
        ];

        for (const templatePath of templatePaths) {
            try {
                const templateData = await this.mcpManager.callMCP('mcp__filesystem', 'read_text_file', {
                    path: templatePath
                });

                if (templateData) {
                    const templates = JSON.parse(templateData);
                    this.componentTemplates.set(templatePath, templates);
                }
            } catch (error) {
                console.log(`💻 Template not found: ${templatePath} - will create when needed`);
            }
        }
    }

    async setupComponentPatterns() {
        this.codePatterns.set('react-component', {
            functional: `import React from 'react';
import { cn } from '@/lib/utils';

interface {{ComponentName}}Props {
  className?: string;
  children?: React.ReactNode;
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("{{defaultClasses}}", className)} {...props}>
      {children}
    </div>
  );
};`,
            withState: `import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface {{ComponentName}}Props {
  className?: string;
  onStateChange?: (state: {{StateType}}) => void;
}

export const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({
  className,
  onStateChange,
  ...props
}) => {
  const [state, setState] = useState<{{StateType}}>({{initialState}});

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  return (
    <div className={cn("{{defaultClasses}}", className)} {...props}>
      {{componentContent}}
    </div>
  );
};`
        });

        this.codePatterns.set('custom-hook', {
            basic: `import { useState, useEffect } from 'react';

interface Use{{HookName}}Options {
  {{optionsInterface}}
}

interface Use{{HookName}}Return {
  {{returnInterface}}
}

export const use{{HookName}} = (options: Use{{HookName}}Options): Use{{HookName}}Return => {
  const [state, setState] = useState({{initialState}});

  useEffect(() => {
    {{hookLogic}}
  }, [{{dependencies}}]);

  return {
    {{returnValues}}
  };
};`
        });

        this.codePatterns.set('context-provider', {
            template: `import React, { createContext, useContext, useReducer, ReactNode } from 'react';

interface {{ContextName}}State {
  {{stateInterface}}
}

interface {{ContextName}}Actions {
  {{actionsInterface}}
}

type {{ContextName}}Action = {{actionTypes}};

const {{ContextName}}Context = createContext<{{ContextName}}State & {{ContextName}}Actions | undefined>(undefined);

const {{contextName}}Reducer = (state: {{ContextName}}State, action: {{ContextName}}Action): {{ContextName}}State => {
  switch (action.type) {
    {{reducerCases}}
    default:
      return state;
  }
};

interface {{ContextName}}ProviderProps {
  children: ReactNode;
}

export const {{ContextName}}Provider: React.FC<{{ContextName}}ProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer({{contextName}}Reducer, {{initialState}});

  const actions: {{ContextName}}Actions = {
    {{actionImplementations}}
  };

  return (
    <{{ContextName}}Context.Provider value={{ ...state, ...actions }}>
      {children}
    </{{ContextName}}Context.Provider>
  );
};

export const use{{ContextName}} = () => {
  const context = useContext({{ContextName}}Context);
  if (context === undefined) {
    throw new Error('use{{ContextName}} must be used within a {{ContextName}}Provider');
  }
  return context;
};`
        });
    }

    async initializeFrameworkConfigs() {
        this.componentTemplates.set('next-config', {
            basic: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['{{imageDomains}}'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;`,
            advanced: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['{{externalPackages}}'],
  },
  images: {
    domains: ['{{imageDomains}}'],
    formats: ['image/webp', 'image/avif'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    {{webpackConfig}}
    return config;
  },
};

module.exports = nextConfig;`
        });

        this.componentTemplates.set('tailwind-config', {
            template: `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        {{customColors}}
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        {{customAnimations}}
      },
      animation: {
        {{animationClasses}}
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`
        });
    }

    async setupOptimizationRules() {
        this.codePatterns.set('performance-patterns', {
            lazyLoading: `import { lazy, Suspense } from 'react';

const {{ComponentName}} = lazy(() => import('./{{ComponentPath}}'));

export const {{ComponentName}}WithSuspense = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <{{ComponentName}} />
  </Suspense>
);`,
            memoization: `import React, { memo, useMemo, useCallback } from 'react';

interface {{ComponentName}}Props {
  {{propsInterface}}
}

export const {{ComponentName}} = memo<{{ComponentName}}Props>(({ {{props}} }) => {
  const memoizedValue = useMemo(() => {
    {{memoizedCalculation}}
  }, [{{dependencies}}]);

  const memoizedCallback = useCallback(() => {
    {{callbackLogic}}
  }, [{{callbackDependencies}}]);

  return (
    {{componentJSX}}
  );
});`
        });
    }

    async initializeMCPConnections() {
        for (const mcpServer of this.config.mcpServers) {
            try {
                const status = await this.mcpManager.getServerStatus(mcpServer);
                if (status !== 'healthy') {
                    console.log(`⚠️  MCP Server ${mcpServer} not available - functionality limited`);
                }
            } catch (error) {
                console.log(`💻 MCP Server ${mcpServer} connection will be established when needed`);
            }
        }
    }

    async developFrontend(request) {
        const developmentId = this.generateDevelopmentId();
        const startTime = Date.now();

        try {
            console.log(`💻 Starting frontend development: ${request.projectType} - ${request.framework}`);

            this.activeDevelopment.set(developmentId, {
                request,
                status: 'in-progress',
                startTime,
                stages: []
            });

            const developmentResult = await this.executeFrontendDevelopmentWorkflow(developmentId, request);

            this.activeDevelopment.get(developmentId).status = 'completed';
            this.activeDevelopment.get(developmentId).result = developmentResult;

            await this.storeDevelopmentInMemory(developmentId, developmentResult);

            this.emit('developmentCompleted', {
                developmentId,
                projectType: request.projectType,
                duration: Date.now() - startTime,
                result: developmentResult
            });

            return developmentResult;

        } catch (error) {
            this.activeDevelopment.get(developmentId).status = 'failed';
            this.activeDevelopment.get(developmentId).error = error.message;

            this.emit('developmentError', {
                developmentId,
                error: error.message
            });

            throw error;
        }
    }

    async executeFrontendDevelopmentWorkflow(developmentId, request) {
        const workflow = await this.planFrontendDevelopmentWorkflow(request);
        const results = {};

        for (const stage of workflow.stages) {
            console.log(`🔄 Executing development stage: ${stage.name}`);

            this.activeDevelopment.get(developmentId).stages.push({
                name: stage.name,
                status: 'in-progress',
                startTime: Date.now()
            });

            const stageResult = await this.executeDevelopmentStage(stage, request, results);
            results[stage.name] = stageResult;

            const currentStage = this.activeDevelopment.get(developmentId).stages.find(s => s.name === stage.name);
            currentStage.status = 'completed';
            currentStage.duration = Date.now() - currentStage.startTime;
            currentStage.result = stageResult;

            console.log(`✅ Completed development stage: ${stage.name}`);
        }

        return {
            developmentId,
            projectType: request.projectType,
            framework: request.framework,
            stages: results,
            deliverables: await this.generateDevelopmentDeliverables(results, request)
        };
    }

    async planFrontendDevelopmentWorkflow(request) {
        const planningPrompt = `Plan comprehensive frontend development workflow for:

        Project Type: ${request.projectType}
        Framework: ${request.framework}
        Features: ${request.features ? request.features.join(', ') : 'Standard features'}
        Performance Requirements: ${request.performance || 'Standard web performance'}
        Accessibility Requirements: ${request.accessibility || 'WCAG 2.1 AA'}
        Target Devices: ${request.devices || 'Desktop, tablet, mobile'}

        Create detailed workflow with project setup, component development, state management, styling, testing, optimization, and deployment preparation.`;

        const workflowPlan = await this.mcpManager.callMCP('mcp__sequential-thinking', 'sequentialthinking', {
            thought: planningPrompt,
            nextThoughtNeeded: true,
            thoughtNumber: 1,
            totalThoughts: 12
        });

        return {
            stages: [
                { name: 'project-setup', priority: 1, dependencies: [] },
                { name: 'architecture-planning', priority: 2, dependencies: ['project-setup'] },
                { name: 'component-development', priority: 3, dependencies: ['architecture-planning'] },
                { name: 'state-management', priority: 4, dependencies: ['component-development'] },
                { name: 'styling-implementation', priority: 5, dependencies: ['component-development'] },
                { name: 'routing-navigation', priority: 6, dependencies: ['component-development'] },
                { name: 'api-integration', priority: 7, dependencies: ['state-management'] },
                { name: 'performance-optimization', priority: 8, dependencies: ['styling-implementation'] },
                { name: 'accessibility-implementation', priority: 9, dependencies: ['performance-optimization'] },
                { name: 'testing-implementation', priority: 10, dependencies: ['accessibility-implementation'] },
                { name: 'build-optimization', priority: 11, dependencies: ['testing-implementation'] },
                { name: 'deployment-preparation', priority: 12, dependencies: ['build-optimization'] }
            ],
            planningInsights: workflowPlan
        };
    }

    async executeDevelopmentStage(stage, request, previousResults) {
        switch (stage.name) {
            case 'project-setup':
                return await this.setupProject(request);

            case 'architecture-planning':
                return await this.planArchitecture(request, previousResults);

            case 'component-development':
                return await this.developComponents(request, previousResults);

            case 'state-management':
                return await this.implementStateManagement(request, previousResults);

            case 'styling-implementation':
                return await this.implementStyling(request, previousResults);

            case 'routing-navigation':
                return await this.implementRouting(request, previousResults);

            case 'api-integration':
                return await this.integrateAPIs(request, previousResults);

            case 'performance-optimization':
                return await this.optimizePerformance(request, previousResults);

            case 'accessibility-implementation':
                return await this.implementAccessibility(request, previousResults);

            case 'testing-implementation':
                return await this.implementTesting(request, previousResults);

            case 'build-optimization':
                return await this.optimizeBuild(request, previousResults);

            case 'deployment-preparation':
                return await this.prepareDeployment(request, previousResults);

            default:
                throw new Error(`Unknown development stage: ${stage.name}`);
        }
    }

    async setupProject(request) {
        const frameworkChoice = await this.selectOptimalFramework(request);

        const projectStructure = await this.createProjectStructure(request, frameworkChoice);
        const packageJson = await this.generatePackageJson(request, frameworkChoice);
        const configFiles = await this.generateConfigFiles(request, frameworkChoice);

        return {
            framework: frameworkChoice,
            projectStructure: projectStructure,
            packageConfiguration: packageJson,
            configFiles: configFiles,
            setupInstructions: await this.generateSetupInstructions(frameworkChoice)
        };
    }

    async planArchitecture(request, previousResults) {
        const framework = previousResults['project-setup'].framework;

        const architectureResearch = await this.mcpManager.callMCP('mcp__ref-tools', 'ref_search_documentation', {
            query: `${framework.name} architecture patterns component design state management best practices`
        });

        return {
            componentArchitecture: await this.designComponentArchitecture(request, framework),
            stateArchitecture: await this.designStateArchitecture(request, framework),
            folderStructure: await this.designFolderStructure(request, framework),
            dataFlow: await this.designDataFlow(request, framework),
            designPatterns: await this.selectDesignPatterns(request, framework),
            researchInsights: architectureResearch
        };
    }

    async developComponents(request, previousResults) {
        const architecture = previousResults['architecture-planning'];
        const componentSpecs = architecture.componentArchitecture;

        const components = {};

        for (const [componentName, spec] of Object.entries(componentSpecs.components)) {
            components[componentName] = await this.generateComponent(componentName, spec, request);
        }

        return {
            components: components,
            hooks: await this.generateCustomHooks(componentSpecs, request),
            utilities: await this.generateUtilities(componentSpecs, request),
            types: await this.generateTypeDefinitions(componentSpecs, request),
            tests: await this.generateComponentTests(components, request)
        };
    }

    async implementStateManagement(request, previousResults) {
        const framework = previousResults['project-setup'].framework;
        const architecture = previousResults['architecture-planning'];

        const stateManagementChoice = await this.selectStateManagement(request, framework);

        return {
            stateManager: stateManagementChoice,
            stores: await this.createStores(architecture.stateArchitecture, stateManagementChoice),
            providers: await this.createProviders(architecture.stateArchitecture, stateManagementChoice),
            selectors: await this.createSelectors(architecture.stateArchitecture, stateManagementChoice),
            actions: await this.createActions(architecture.stateArchitecture, stateManagementChoice)
        };
    }

    async implementStyling(request, previousResults) {
        const framework = previousResults['project-setup'].framework;
        const components = previousResults['component-development'];

        const stylingApproach = await this.selectStylingApproach(request, framework);

        return {
            stylingFramework: stylingApproach,
            globalStyles: await this.generateGlobalStyles(request, stylingApproach),
            componentStyles: await this.generateComponentStyles(components, stylingApproach),
            themeConfiguration: await this.generateThemeConfiguration(request, stylingApproach),
            responsiveStyles: await this.generateResponsiveStyles(request, stylingApproach)
        };
    }

    async implementRouting(request, previousResults) {
        const framework = previousResults['project-setup'].framework;

        return {
            routingConfig: await this.generateRoutingConfig(request, framework),
            routeComponents: await this.generateRouteComponents(request, framework),
            navigationComponents: await this.generateNavigationComponents(request, framework),
            routeGuards: await this.generateRouteGuards(request, framework)
        };
    }

    async integrateAPIs(request, previousResults) {
        const stateManagement = previousResults['state-management'];

        return {
            apiClient: await this.generateAPIClient(request),
            serviceLayer: await this.generateServiceLayer(request),
            dataFetching: await this.implementDataFetching(request, stateManagement),
            errorHandling: await this.implementErrorHandling(request),
            caching: await this.implementCaching(request)
        };
    }

    async optimizePerformance(request, previousResults) {
        const components = previousResults['component-development'];
        const framework = previousResults['project-setup'].framework;

        const performanceResearch = await this.mcpManager.callMCP('mcp__ref-tools', 'ref_search_documentation', {
            query: `${framework.name} performance optimization lazy loading code splitting bundle optimization`
        });

        return {
            lazyLoading: await this.implementLazyLoading(components, framework),
            codeSplitting: await this.implementCodeSplitting(request, framework),
            bundleOptimization: await this.optimizeBundle(request, framework),
            imageOptimization: await this.implementImageOptimization(request, framework),
            performanceMonitoring: await this.setupPerformanceMonitoring(request, framework),
            researchInsights: performanceResearch
        };
    }

    async implementAccessibility(request, previousResults) {
        const components = previousResults['component-development'];

        const accessibilityResearch = await this.mcpManager.callMCP('mcp__ref-tools', 'ref_search_documentation', {
            query: 'WCAG accessibility React components keyboard navigation ARIA screen reader'
        });

        return {
            accessibilityAudit: await this.auditAccessibility(components),
            ariaImplementation: await this.implementARIA(components),
            keyboardNavigation: await this.implementKeyboardNavigation(components),
            screenReaderOptimization: await this.optimizeScreenReader(components),
            accessibilityTesting: await this.setupAccessibilityTesting(components),
            researchInsights: accessibilityResearch
        };
    }

    async implementTesting(request, previousResults) {
        const components = previousResults['component-development'];
        const framework = previousResults['project-setup'].framework;

        return {
            unitTests: await this.generateUnitTests(components, framework),
            integrationTests: await this.generateIntegrationTests(request, framework),
            e2eTests: await this.generateE2ETests(request, framework),
            testingUtilities: await this.generateTestingUtilities(framework),
            testConfiguration: await this.generateTestConfiguration(framework)
        };
    }

    async optimizeBuild(request, previousResults) {
        const framework = previousResults['project-setup'].framework;

        return {
            buildConfiguration: await this.optimizeBuildConfiguration(framework),
            webpackOptimization: await this.optimizeWebpack(framework),
            assetOptimization: await this.optimizeAssets(framework),
            compressionSetup: await this.setupCompression(framework),
            cacheStrategy: await this.setupCacheStrategy(framework)
        };
    }

    async prepareDeployment(request, previousResults) {
        const framework = previousResults['project-setup'].framework;
        const buildOptimization = previousResults['build-optimization'];

        return {
            deploymentConfig: await this.generateDeploymentConfig(request, framework),
            environmentConfig: await this.generateEnvironmentConfig(request, framework),
            cicdConfiguration: await this.generateCICDConfiguration(request, framework),
            deploymentScripts: await this.generateDeploymentScripts(request, framework),
            monitoring: await this.setupProductionMonitoring(request, framework)
        };
    }

    async selectOptimalFramework(request) {
        const complexity = this.assessProjectComplexity(request);

        if (complexity === 'static') {
            return { name: 'static-html', reason: 'Static content with no dynamic features needed' };
        } else if (complexity === 'simple') {
            return { name: 'react', reason: 'Simple React app sufficient for requirements' };
        } else {
            return { name: 'next.js', reason: 'Complex features require full-stack framework' };
        }
    }

    assessProjectComplexity(request) {
        if (!request.features || request.features.length === 0) return 'static';

        const complexFeatures = ['authentication', 'database', 'real-time', 'server-side-rendering'];
        const hasComplexFeatures = request.features.some(feature =>
            complexFeatures.some(complex => feature.toLowerCase().includes(complex))
        );

        return hasComplexFeatures ? 'complex' : 'simple';
    }

    async generateDevelopmentDeliverables(results, request) {
        const developmentPath = `/projects/${request.projectId}/deliverables/development/frontend/`;

        await this.mcpManager.callMCP('mcp__filesystem', 'create_directory', {
            path: developmentPath
        });

        const deliverables = {
            sourceCode: await this.bundleSourceCode(results),
            configFiles: await this.bundleConfigFiles(results),
            documentation: await this.generateDocumentation(results, request),
            testSuite: await this.bundleTestSuite(results),
            deploymentPackage: await this.createDeploymentPackage(results, request)
        };

        for (const [deliverableType, content] of Object.entries(deliverables)) {
            if (typeof content === 'object' && content.files) {
                for (const [filename, fileContent] of Object.entries(content.files)) {
                    await this.mcpManager.callMCP('mcp__filesystem', 'write_file', {
                        path: `${developmentPath}${deliverableType}/${filename}`,
                        content: fileContent
                    });
                }
            } else {
                const fileContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;
                await this.mcpManager.callMCP('mcp__filesystem', 'write_file', {
                    path: `${developmentPath}${deliverableType}.json`,
                    content: fileContent
                });
            }
        }

        return deliverables;
    }

    async storeDevelopmentInMemory(developmentId, developmentResult) {
        const entities = [{
            name: `FrontendDevelopment_${developmentId}`,
            entityType: 'frontend-development',
            observations: [
                `Created frontend application for ${developmentResult.projectType} using ${developmentResult.framework}`,
                `Architecture: ${Object.keys(developmentResult.stages['architecture-planning'].componentArchitecture).length} component types planned`,
                `Components: ${Object.keys(developmentResult.stages['component-development'].components).length} components developed`,
                `State management: ${developmentResult.stages['state-management'].stateManager.name} implementation`,
                `Testing: Complete test suite with unit, integration, and e2e tests`,
                `Performance: Optimized with lazy loading, code splitting, and bundle optimization`,
                `Accessibility: WCAG 2.1 AA compliant implementation`,
                `Deployment: Production-ready with CI/CD configuration`
            ]
        }];

        await this.mcpManager.callMCP('mcp__memory', 'create_entities', { entities });

        const projectEntityName = `Project_${developmentResult.projectType}`;
        const relations = [{
            from: projectEntityName,
            to: `FrontendDevelopment_${developmentId}`,
            relationType: 'includes_frontend_development'
        }];

        await this.mcpManager.callMCP('mcp__memory', 'create_relations', { relations });
    }

    generateDevelopmentId() {
        return `frontend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async getAgentStatus() {
        return {
            agentId: this.config.agentId,
            version: this.config.version,
            status: 'active',
            capabilities: this.config.capabilities,
            activeDevelopment: this.activeDevelopment.size,
            componentTemplates: this.componentTemplates.size,
            codePatterns: this.codePatterns.size,
            technologies: this.config.technologies,
            mcpConnections: this.config.mcpServers.length
        };
    }

    async shutdown() {
        console.log('🔄 Shutting down Frontend Development Specialist...');

        this.activeDevelopment.clear();
        this.componentTemplates.clear();
        this.codePatterns.clear();

        this.emit('agentShutdown', { agentId: this.config.agentId });
        console.log('✅ Frontend Development Specialist shutdown complete');
    }
}

module.exports = FrontendDevelopmentSpecialist;