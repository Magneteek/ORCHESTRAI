const { EventEmitter } = require('events');

class WireframeCreationSpecialist extends EventEmitter {
    constructor(mcpManager, crystallineMemory, templateEngine) {
        super();

        this.mcpManager = mcpManager;
        this.crystallineMemory = crystallineMemory;
        this.templateEngine = templateEngine;

        this.config = {
            agentId: 'wireframe-creation-specialist',
            version: '2.0.0',
            capabilities: [
                'information-architecture',
                'user-flow-mapping',
                'component-hierarchy',
                'responsive-layouts',
                'interactive-prototypes',
                'accessibility-compliance',
                'design-system-integration'
            ],
            mcpServers: [
                'mcp__filesystem',
                'mcp__ref-tools',
                'mcp__memory',
                'mcp__sequential-thinking',
                'mcp__notion'
            ],
            wireframeTypes: [
                'low-fidelity-sketches',
                'high-fidelity-wireframes',
                'interactive-prototypes',
                'responsive-breakpoints',
                'component-libraries',
                'user-journey-maps'
            ]
        };

        this.activeWireframes = new Map();
        this.templateLibrary = new Map();
        this.designPatterns = new Map();

        this.initializeAgent();
    }

    async initializeAgent() {
        console.log('🎨 Initializing Wireframe Creation Specialist...');

        try {
            await this.loadWireframeTemplates();
            await this.setupDesignPatterns();
            await this.initializeMCPConnections();

            this.emit('agentInitialized', {
                agentId: this.config.agentId,
                capabilities: this.config.capabilities,
                status: 'ready'
            });

            console.log('✅ Wireframe Creation Specialist initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize Wireframe Creation Specialist:', error);
            this.emit('agentError', { error: error.message });
        }
    }

    async loadWireframeTemplates() {
        const templatePaths = [
            '/orchestrai-system/templates/global/wireframes/landing-page-templates.json',
            '/orchestrai-system/templates/global/wireframes/dashboard-templates.json',
            '/orchestrai-system/templates/global/wireframes/mobile-app-templates.json',
            '/orchestrai-system/templates/global/wireframes/e-commerce-templates.json'
        ];

        for (const templatePath of templatePaths) {
            try {
                const templateData = await this.mcpManager.callMCP('mcp__filesystem', 'read_text_file', {
                    path: templatePath
                });

                if (templateData) {
                    const templates = JSON.parse(templateData);
                    this.templateLibrary.set(templatePath, templates);
                }
            } catch (error) {
                console.log(`📋 Template not found: ${templatePath} - will create when needed`);
            }
        }
    }

    async setupDesignPatterns() {
        this.designPatterns.set('landing-page', {
            structure: ['hero', 'features', 'testimonials', 'cta', 'footer'],
            components: ['navigation', 'hero-banner', 'feature-cards', 'testimonial-slider', 'contact-form'],
            breakpoints: ['mobile', 'tablet', 'desktop', 'wide-screen']
        });

        this.designPatterns.set('dashboard', {
            structure: ['sidebar', 'header', 'main-content', 'widgets', 'footer'],
            components: ['navigation-menu', 'data-widgets', 'charts', 'tables', 'action-buttons'],
            breakpoints: ['mobile', 'tablet', 'desktop']
        });

        this.designPatterns.set('e-commerce', {
            structure: ['header', 'product-grid', 'filters', 'pagination', 'footer'],
            components: ['product-cards', 'search-bar', 'filter-sidebar', 'shopping-cart', 'checkout-flow'],
            breakpoints: ['mobile', 'tablet', 'desktop']
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
                console.log(`📡 MCP Server ${mcpServer} connection will be established when needed`);
            }
        }
    }

    async createWireframe(request) {
        const wireframeId = this.generateWireframeId();
        const startTime = Date.now();

        try {
            console.log(`🎨 Starting wireframe creation: ${request.projectType} - ${request.pageType}`);

            this.activeWireframes.set(wireframeId, {
                request,
                status: 'in-progress',
                startTime,
                stages: []
            });

            const wireframeResult = await this.executeWireframeWorkflow(wireframeId, request);

            this.activeWireframes.get(wireframeId).status = 'completed';
            this.activeWireframes.get(wireframeId).result = wireframeResult;

            await this.storeWireframeInMemory(wireframeId, wireframeResult);

            this.emit('wireframeCompleted', {
                wireframeId,
                projectType: request.projectType,
                duration: Date.now() - startTime,
                result: wireframeResult
            });

            return wireframeResult;

        } catch (error) {
            this.activeWireframes.get(wireframeId).status = 'failed';
            this.activeWireframes.get(wireframeId).error = error.message;

            this.emit('wireframeError', {
                wireframeId,
                error: error.message
            });

            throw error;
        }
    }

    async executeWireframeWorkflow(wireframeId, request) {
        const workflow = await this.planWireframeWorkflow(request);
        const results = {};

        for (const stage of workflow.stages) {
            console.log(`🔄 Executing wireframe stage: ${stage.name}`);

            this.activeWireframes.get(wireframeId).stages.push({
                name: stage.name,
                status: 'in-progress',
                startTime: Date.now()
            });

            const stageResult = await this.executeWireframeStage(stage, request, results);
            results[stage.name] = stageResult;

            const currentStage = this.activeWireframes.get(wireframeId).stages.find(s => s.name === stage.name);
            currentStage.status = 'completed';
            currentStage.duration = Date.now() - currentStage.startTime;
            currentStage.result = stageResult;

            console.log(`✅ Completed wireframe stage: ${stage.name}`);
        }

        return {
            wireframeId,
            projectType: request.projectType,
            pageType: request.pageType,
            stages: results,
            deliverables: await this.generateWireframeDeliverables(results, request)
        };
    }

    async planWireframeWorkflow(request) {
        const planningPrompt = `Plan comprehensive wireframe creation workflow for:

        Project Type: ${request.projectType}
        Page Type: ${request.pageType}
        Target Audience: ${request.targetAudience || 'General users'}
        Key Features: ${request.features ? request.features.join(', ') : 'Standard features'}
        Brand Requirements: ${request.branding || 'Modern, professional'}

        Create detailed workflow with information architecture, user flows, component mapping, responsive design, and accessibility considerations.`;

        const workflowPlan = await this.mcpManager.callMCP('mcp__sequential-thinking', 'sequentialthinking', {
            thought: planningPrompt,
            nextThoughtNeeded: true,
            thoughtNumber: 1,
            totalThoughts: 8
        });

        return {
            stages: [
                { name: 'information-architecture', priority: 1, dependencies: [] },
                { name: 'user-flow-mapping', priority: 2, dependencies: ['information-architecture'] },
                { name: 'component-hierarchy', priority: 3, dependencies: ['information-architecture', 'user-flow-mapping'] },
                { name: 'layout-structure', priority: 4, dependencies: ['component-hierarchy'] },
                { name: 'responsive-breakpoints', priority: 5, dependencies: ['layout-structure'] },
                { name: 'interaction-design', priority: 6, dependencies: ['layout-structure'] },
                { name: 'accessibility-review', priority: 7, dependencies: ['interaction-design'] },
                { name: 'prototype-creation', priority: 8, dependencies: ['responsive-breakpoints', 'accessibility-review'] }
            ],
            planningInsights: workflowPlan
        };
    }

    async executeWireframeStage(stage, request, previousResults) {
        switch (stage.name) {
            case 'information-architecture':
                return await this.createInformationArchitecture(request);

            case 'user-flow-mapping':
                return await this.mapUserFlows(request, previousResults);

            case 'component-hierarchy':
                return await this.defineComponentHierarchy(request, previousResults);

            case 'layout-structure':
                return await this.createLayoutStructure(request, previousResults);

            case 'responsive-breakpoints':
                return await this.designResponsiveBreakpoints(request, previousResults);

            case 'interaction-design':
                return await this.designInteractions(request, previousResults);

            case 'accessibility-review':
                return await this.reviewAccessibility(request, previousResults);

            case 'prototype-creation':
                return await this.createInteractivePrototype(request, previousResults);

            default:
                throw new Error(`Unknown wireframe stage: ${stage.name}`);
        }
    }

    async createInformationArchitecture(request) {
        const researchPrompt = `Research and analyze information architecture for ${request.projectType} ${request.pageType}:

        1. Content hierarchy and organization
        2. Navigation structure and taxonomy
        3. User mental models and expectations
        4. Information grouping and categorization
        5. Search and findability considerations

        Provide comprehensive IA recommendations with rationale.`;

        const iaResearch = await this.mcpManager.callMCP('mcp__ref-tools', 'ref_search_documentation', {
            query: `information architecture best practices ${request.projectType} user experience navigation structure`
        });

        return {
            contentHierarchy: this.generateContentHierarchy(request),
            navigationStructure: this.designNavigationStructure(request),
            taxonomyStrategy: this.createTaxonomyStrategy(request),
            researchInsights: iaResearch,
            recommendations: await this.generateIARecommendations(request)
        };
    }

    async mapUserFlows(request, previousResults) {
        const userFlows = [];
        const primaryActions = this.identifyPrimaryUserActions(request);

        for (const action of primaryActions) {
            const flowMap = {
                actionName: action,
                steps: await this.mapActionSteps(action, request),
                decisionPoints: await this.identifyDecisionPoints(action, request),
                alternativePaths: await this.mapAlternativePaths(action, request),
                exitPoints: await this.identifyExitPoints(action, request)
            };

            userFlows.push(flowMap);
        }

        return {
            primaryFlows: userFlows,
            flowDiagrams: await this.generateFlowDiagrams(userFlows),
            interactionPatterns: await this.identifyInteractionPatterns(userFlows),
            optimizationOpportunities: await this.identifyFlowOptimizations(userFlows)
        };
    }

    async defineComponentHierarchy(request, previousResults) {
        const pattern = this.designPatterns.get(request.projectType) || this.designPatterns.get('landing-page');

        return {
            componentTree: await this.buildComponentTree(request, pattern),
            componentSpecs: await this.defineComponentSpecifications(request),
            stateManagement: await this.planStateManagement(request),
            dataFlow: await this.mapDataFlow(request),
            reusableComponents: await this.identifyReusableComponents(request)
        };
    }

    async createLayoutStructure(request, previousResults) {
        const layouts = {};
        const breakpoints = ['mobile', 'tablet', 'desktop'];

        for (const breakpoint of breakpoints) {
            layouts[breakpoint] = {
                gridSystem: await this.designGridSystem(breakpoint, request),
                spacing: await this.defineSpacingSystem(breakpoint),
                typography: await this.mapTypographyHierarchy(breakpoint),
                componentLayout: await this.layoutComponents(breakpoint, previousResults.componentHierarchy)
            };
        }

        return {
            responsiveLayouts: layouts,
            designSystem: await this.createDesignSystemSpecs(request),
            layoutPrinciples: await this.defineLayoutPrinciples(request),
            wireframeAssets: await this.generateWireframeAssets(layouts)
        };
    }

    async designResponsiveBreakpoints(request, previousResults) {
        return {
            breakpointStrategy: await this.defineBreakpointStrategy(request),
            adaptiveComponents: await this.identifyAdaptiveComponents(previousResults),
            mobileOptimizations: await this.designMobileOptimizations(request),
            tabletAdaptations: await this.designTabletAdaptations(request),
            desktopEnhancements: await this.designDesktopEnhancements(request)
        };
    }

    async designInteractions(request, previousResults) {
        return {
            interactionStates: await this.defineInteractionStates(request),
            microInteractions: await this.designMicroInteractions(request),
            transitionsAnimations: await this.planTransitionsAnimations(request),
            feedbackMechanisms: await this.designFeedbackMechanisms(request),
            gestureSupport: await this.planGestureSupport(request)
        };
    }

    async reviewAccessibility(request, previousResults) {
        const accessibilityPrompt = `Review wireframe accessibility for ${request.projectType}:

        1. WCAG 2.1 AA compliance
        2. Keyboard navigation patterns
        3. Screen reader compatibility
        4. Color contrast and visual hierarchy
        5. Focus management and indicators
        6. Alternative text strategies
        7. Semantic structure recommendations

        Provide comprehensive accessibility audit and recommendations.`;

        const accessibilityGuidelines = await this.mcpManager.callMCP('mcp__ref-tools', 'ref_search_documentation', {
            query: 'WCAG accessibility guidelines wireframe design keyboard navigation screen reader'
        });

        return {
            wcagCompliance: await this.auditWCAGCompliance(previousResults),
            keyboardNavigation: await this.designKeyboardNavigation(previousResults),
            screenReaderOptimization: await this.optimizeScreenReaderExperience(previousResults),
            visualAccessibility: await this.auditVisualAccessibility(previousResults),
            accessibilityGuidelines: accessibilityGuidelines,
            remediationPlan: await this.createAccessibilityRemediationPlan(previousResults)
        };
    }

    async createInteractivePrototype(request, previousResults) {
        const prototypePath = `/projects/${request.projectId}/deliverables/design/wireframes/`;

        await this.mcpManager.callMCP('mcp__filesystem', 'create_directory', {
            path: prototypePath
        });

        const prototypeFiles = {
            htmlPrototype: await this.generateHTMLPrototype(previousResults, request),
            cssStyles: await this.generatePrototypeCSS(previousResults, request),
            jsInteractions: await this.generatePrototypeJS(previousResults, request),
            designSpecs: await this.generateDesignSpecifications(previousResults, request)
        };

        for (const [filename, content] of Object.entries(prototypeFiles)) {
            await this.mcpManager.callMCP('mcp__filesystem', 'write_file', {
                path: `${prototypePath}${filename}.${this.getFileExtension(filename)}`,
                content: typeof content === 'object' ? JSON.stringify(content, null, 2) : content
            });
        }

        return {
            prototypeFiles: prototypeFiles,
            interactiveDemo: `${prototypePath}htmlPrototype.html`,
            designSystem: prototypeFiles.designSpecs,
            usabilityNotes: await this.generateUsabilityNotes(previousResults),
            nextSteps: await this.generateNextSteps(request, previousResults)
        };
    }

    async generateWireframeDeliverables(results, request) {
        const deliverables = {
            informationArchitecture: {
                file: 'information-architecture.json',
                content: results['information-architecture']
            },
            userFlows: {
                file: 'user-flows.json',
                content: results['user-flow-mapping']
            },
            componentSpecs: {
                file: 'component-specifications.json',
                content: results['component-hierarchy']
            },
            responsiveLayouts: {
                file: 'responsive-layouts.json',
                content: results['layout-structure']
            },
            interactivePrototype: {
                file: 'interactive-prototype.html',
                content: results['prototype-creation'].prototypeFiles.htmlPrototype
            },
            designSystem: {
                file: 'design-system-specs.json',
                content: results['layout-structure'].designSystem
            },
            accessibilityGuide: {
                file: 'accessibility-guide.json',
                content: results['accessibility-review']
            }
        };

        const deliverablePath = `/projects/${request.projectId}/deliverables/design/wireframes/`;

        for (const [key, deliverable] of Object.entries(deliverables)) {
            const content = typeof deliverable.content === 'object'
                ? JSON.stringify(deliverable.content, null, 2)
                : deliverable.content;

            await this.mcpManager.callMCP('mcp__filesystem', 'write_file', {
                path: `${deliverablePath}${deliverable.file}`,
                content: content
            });
        }

        return deliverables;
    }

    async storeWireframeInMemory(wireframeId, wireframeResult) {
        const entities = [{
            name: `Wireframe_${wireframeId}`,
            entityType: 'wireframe-design',
            observations: [
                `Created wireframe for ${wireframeResult.projectType} ${wireframeResult.pageType}`,
                `Information architecture: ${JSON.stringify(wireframeResult.stages['information-architecture'].contentHierarchy)}`,
                `Component hierarchy: ${JSON.stringify(wireframeResult.stages['component-hierarchy'].componentTree)}`,
                `Responsive design: ${Object.keys(wireframeResult.stages['layout-structure'].responsiveLayouts).join(', ')} breakpoints`,
                `Accessibility features: WCAG 2.1 AA compliant with keyboard navigation support`,
                `Interactive prototype: ${wireframeResult.deliverables.interactivePrototype.file}`
            ]
        }];

        await this.mcpManager.callMCP('mcp__memory', 'create_entities', { entities });

        const projectEntityName = `Project_${wireframeResult.projectType}`;
        const relations = [{
            from: projectEntityName,
            to: `Wireframe_${wireframeId}`,
            relationType: 'includes_wireframe'
        }];

        await this.mcpManager.callMCP('mcp__memory', 'create_relations', { relations });
    }

    generateContentHierarchy(request) {
        const pattern = this.designPatterns.get(request.projectType);
        if (!pattern) return { sections: ['header', 'main', 'footer'], priority: 'medium' };

        return {
            sections: pattern.structure,
            components: pattern.components,
            hierarchy: pattern.structure.map((section, index) => ({
                section,
                level: index + 1,
                priority: index < 3 ? 'high' : 'medium'
            }))
        };
    }

    designNavigationStructure(request) {
        return {
            primary: ['Home', 'About', 'Services', 'Contact'],
            secondary: ['Privacy', 'Terms', 'Support'],
            utility: ['Search', 'Account', 'Cart'],
            mobile: 'hamburger-menu',
            desktop: 'horizontal-navigation'
        };
    }

    createTaxonomyStrategy(request) {
        return {
            categorization: 'functional-grouping',
            labeling: 'user-friendly-terms',
            navigation: 'breadcrumb-trail',
            search: 'faceted-search'
        };
    }

    async generateIARecommendations(request) {
        return [
            'Use card sorting methodology for content organization',
            'Implement progressive disclosure for complex features',
            'Design clear entry points for primary user tasks',
            'Create consistent navigation patterns across all pages',
            'Use familiar conventions for user interface elements'
        ];
    }

    identifyPrimaryUserActions(request) {
        const actionMap = {
            'landing-page': ['learn-more', 'sign-up', 'contact-us', 'browse-features'],
            'dashboard': ['view-data', 'create-item', 'edit-profile', 'generate-report'],
            'e-commerce': ['browse-products', 'add-to-cart', 'checkout', 'track-order'],
            'portfolio': ['view-projects', 'contact-client', 'download-resume', 'read-about']
        };

        return actionMap[request.projectType] || actionMap['landing-page'];
    }

    generateWireframeId() {
        return `wireframe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getFileExtension(filename) {
        const extensions = {
            htmlPrototype: 'html',
            cssStyles: 'css',
            jsInteractions: 'js',
            designSpecs: 'json'
        };
        return extensions[filename] || 'txt';
    }

    async getAgentStatus() {
        return {
            agentId: this.config.agentId,
            version: this.config.version,
            status: 'active',
            capabilities: this.config.capabilities,
            activeWireframes: this.activeWireframes.size,
            templatesLoaded: this.templateLibrary.size,
            designPatterns: this.designPatterns.size,
            mcpConnections: this.config.mcpServers.length
        };
    }

    async shutdown() {
        console.log('🔄 Shutting down Wireframe Creation Specialist...');

        this.activeWireframes.clear();
        this.templateLibrary.clear();
        this.designPatterns.clear();

        this.emit('agentShutdown', { agentId: this.config.agentId });
        console.log('✅ Wireframe Creation Specialist shutdown complete');
    }
}

module.exports = WireframeCreationSpecialist;