const { EventEmitter } = require('events');

class VisualDesignSpecialist extends EventEmitter {
    constructor(mcpManager, crystallineMemory, templateEngine) {
        super();

        this.mcpManager = mcpManager;
        this.crystallineMemory = crystallineMemory;
        this.templateEngine = templateEngine;

        this.config = {
            agentId: 'visual-design-specialist',
            version: '2.0.0',
            capabilities: [
                'brand-identity-design',
                'ui-component-design',
                'color-palette-creation',
                'typography-systems',
                'icon-design',
                'image-composition',
                'design-system-creation',
                'visual-hierarchy-optimization',
                'accessibility-compliance',
                'multi-device-optimization'
            ],
            mcpServers: [
                'mcp__filesystem',
                'mcp__ref-tools',
                'mcp__memory',
                'mcp__sequential-thinking',
                'mcp__notion'
            ],
            designFrameworks: [
                'material-design',
                'human-interface-guidelines',
                'fluent-design',
                'carbon-design-system',
                'tailwind-design-system',
                'custom-design-system'
            ],
            visualTechnologies: [
                'css-grid',
                'flexbox',
                'css-custom-properties',
                'css-animations',
                'svg-graphics',
                'web-fonts',
                'responsive-images'
            ]
        };

        this.activeDesigns = new Map();
        this.brandLibrary = new Map();
        this.componentLibrary = new Map();
        this.colorPalettes = new Map();

        this.initializeAgent();
    }

    async initializeAgent() {
        console.log('🎨 Initializing Visual Design Specialist...');

        try {
            await this.loadDesignTemplates();
            await this.setupBrandLibrary();
            await this.initializeComponentLibrary();
            await this.setupColorSystems();
            await this.initializeMCPConnections();

            this.emit('agentInitialized', {
                agentId: this.config.agentId,
                capabilities: this.config.capabilities,
                status: 'ready'
            });

            console.log('✅ Visual Design Specialist initialized successfully');

        } catch (error) {
            console.error('❌ Failed to initialize Visual Design Specialist:', error);
            this.emit('agentError', { error: error.message });
        }
    }

    async loadDesignTemplates() {
        const templatePaths = [
            '/orchestrai-system/templates/global/design-systems/component-libraries.json',
            '/orchestrai-system/templates/global/design-systems/color-palettes.json',
            '/orchestrai-system/templates/global/design-systems/typography-systems.json',
            '/orchestrai-system/templates/global/design-systems/brand-templates.json'
        ];

        for (const templatePath of templatePaths) {
            try {
                const templateData = await this.mcpManager.callMCP('mcp__filesystem', 'read_text_file', {
                    path: templatePath
                });

                if (templateData) {
                    const templates = JSON.parse(templateData);
                    this.brandLibrary.set(templatePath, templates);
                }
            } catch (error) {
                console.log(`🎨 Template not found: ${templatePath} - will create when needed`);
            }
        }
    }

    async setupBrandLibrary() {
        this.brandLibrary.set('modern-tech', {
            colors: {
                primary: '#2563eb',
                secondary: '#64748b',
                accent: '#f59e0b',
                neutral: '#f8fafc',
                dark: '#0f172a'
            },
            typography: {
                heading: 'Inter, system-ui, sans-serif',
                body: 'Inter, system-ui, sans-serif',
                mono: 'JetBrains Mono, monospace'
            },
            spacing: {
                scale: 'tailwind-default',
                baseUnit: '0.25rem'
            }
        });

        this.brandLibrary.set('healthcare', {
            colors: {
                primary: '#059669',
                secondary: '#0891b2',
                accent: '#dc2626',
                neutral: '#f9fafb',
                dark: '#111827'
            },
            typography: {
                heading: 'Source Sans Pro, sans-serif',
                body: 'Source Sans Pro, sans-serif',
                mono: 'Source Code Pro, monospace'
            },
            accessibility: {
                contrastRatio: 'AAA',
                focusIndicators: 'enhanced'
            }
        });

        this.brandLibrary.set('finance', {
            colors: {
                primary: '#1e40af',
                secondary: '#374151',
                accent: '#059669',
                neutral: '#f3f4f6',
                dark: '#1f2937'
            },
            typography: {
                heading: 'Roboto, sans-serif',
                body: 'Roboto, sans-serif',
                mono: 'Roboto Mono, monospace'
            },
            trust: {
                security: 'high-priority',
                certification: 'visible'
            }
        });
    }

    async initializeComponentLibrary() {
        this.componentLibrary.set('navigation', {
            types: ['horizontal-nav', 'vertical-sidebar', 'mobile-hamburger', 'breadcrumb'],
            variants: ['primary', 'secondary', 'minimal', 'branded'],
            states: ['default', 'hover', 'active', 'disabled']
        });

        this.componentLibrary.set('buttons', {
            types: ['primary', 'secondary', 'outline', 'ghost', 'link'],
            sizes: ['sm', 'md', 'lg', 'xl'],
            states: ['default', 'hover', 'active', 'disabled', 'loading']
        });

        this.componentLibrary.set('forms', {
            types: ['input', 'textarea', 'select', 'checkbox', 'radio', 'toggle'],
            validation: ['valid', 'invalid', 'warning', 'loading'],
            layouts: ['stacked', 'horizontal', 'inline', 'grid']
        });

        this.componentLibrary.set('cards', {
            types: ['content', 'media', 'product', 'profile', 'dashboard'],
            variants: ['elevated', 'outlined', 'filled', 'transparent'],
            layouts: ['vertical', 'horizontal', 'grid', 'masonry']
        });
    }

    async setupColorSystems() {
        this.colorPalettes.set('modern-neutral', {
            gray: ['#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'],
            blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a'],
            green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d']
        });

        this.colorPalettes.set('warm-earth', {
            brown: ['#fefcf9', '#fef7ee', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#dc2626', '#b91c1c', '#991b1b'],
            orange: ['#fff7ed', '#ffedd5', '#fed7aa', '#fdba74', '#fb923c', '#f97316', '#ea580c', '#dc2626', '#b91c1c', '#991b1b'],
            yellow: ['#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']
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
                console.log(`🎨 MCP Server ${mcpServer} connection will be established when needed`);
            }
        }
    }

    async createVisualDesign(request) {
        const designId = this.generateDesignId();
        const startTime = Date.now();

        try {
            console.log(`🎨 Starting visual design creation: ${request.projectType} - ${request.designStyle}`);

            this.activeDesigns.set(designId, {
                request,
                status: 'in-progress',
                startTime,
                stages: []
            });

            const designResult = await this.executeVisualDesignWorkflow(designId, request);

            this.activeDesigns.get(designId).status = 'completed';
            this.activeDesigns.get(designId).result = designResult;

            await this.storeDesignInMemory(designId, designResult);

            this.emit('designCompleted', {
                designId,
                projectType: request.projectType,
                duration: Date.now() - startTime,
                result: designResult
            });

            return designResult;

        } catch (error) {
            this.activeDesigns.get(designId).status = 'failed';
            this.activeDesigns.get(designId).error = error.message;

            this.emit('designError', {
                designId,
                error: error.message
            });

            throw error;
        }
    }

    async executeVisualDesignWorkflow(designId, request) {
        const workflow = await this.planVisualDesignWorkflow(request);
        const results = {};

        for (const stage of workflow.stages) {
            console.log(`🔄 Executing design stage: ${stage.name}`);

            this.activeDesigns.get(designId).stages.push({
                name: stage.name,
                status: 'in-progress',
                startTime: Date.now()
            });

            const stageResult = await this.executeDesignStage(stage, request, results);
            results[stage.name] = stageResult;

            const currentStage = this.activeDesigns.get(designId).stages.find(s => s.name === stage.name);
            currentStage.status = 'completed';
            currentStage.duration = Date.now() - currentStage.startTime;
            currentStage.result = stageResult;

            console.log(`✅ Completed design stage: ${stage.name}`);
        }

        return {
            designId,
            projectType: request.projectType,
            designStyle: request.designStyle,
            stages: results,
            deliverables: await this.generateDesignDeliverables(results, request)
        };
    }

    async planVisualDesignWorkflow(request) {
        const planningPrompt = `Plan comprehensive visual design workflow for:

        Project Type: ${request.projectType}
        Design Style: ${request.designStyle}
        Brand Requirements: ${request.branding || 'Modern, professional'}
        Target Audience: ${request.targetAudience || 'General users'}
        Industry: ${request.industry || 'Technology'}
        Accessibility Requirements: ${request.accessibility || 'WCAG 2.1 AA'}

        Create detailed workflow with brand analysis, color system design, typography selection, component design, visual hierarchy, and accessibility compliance.`;

        const workflowPlan = await this.mcpManager.callMCP('mcp__sequential-thinking', 'sequentialthinking', {
            thought: planningPrompt,
            nextThoughtNeeded: true,
            thoughtNumber: 1,
            totalThoughts: 10
        });

        return {
            stages: [
                { name: 'brand-analysis', priority: 1, dependencies: [] },
                { name: 'color-system-design', priority: 2, dependencies: ['brand-analysis'] },
                { name: 'typography-selection', priority: 3, dependencies: ['brand-analysis'] },
                { name: 'component-design', priority: 4, dependencies: ['color-system-design', 'typography-selection'] },
                { name: 'visual-hierarchy', priority: 5, dependencies: ['component-design'] },
                { name: 'responsive-design', priority: 6, dependencies: ['visual-hierarchy'] },
                { name: 'accessibility-compliance', priority: 7, dependencies: ['responsive-design'] },
                { name: 'design-system-creation', priority: 8, dependencies: ['accessibility-compliance'] },
                { name: 'asset-generation', priority: 9, dependencies: ['design-system-creation'] },
                { name: 'implementation-guide', priority: 10, dependencies: ['asset-generation'] }
            ],
            planningInsights: workflowPlan
        };
    }

    async executeDesignStage(stage, request, previousResults) {
        switch (stage.name) {
            case 'brand-analysis':
                return await this.analyzeBrandRequirements(request);

            case 'color-system-design':
                return await this.designColorSystem(request, previousResults);

            case 'typography-selection':
                return await this.selectTypographySystem(request, previousResults);

            case 'component-design':
                return await this.designUIComponents(request, previousResults);

            case 'visual-hierarchy':
                return await this.establishVisualHierarchy(request, previousResults);

            case 'responsive-design':
                return await this.createResponsiveDesign(request, previousResults);

            case 'accessibility-compliance':
                return await this.ensureAccessibilityCompliance(request, previousResults);

            case 'design-system-creation':
                return await this.createDesignSystem(request, previousResults);

            case 'asset-generation':
                return await this.generateDesignAssets(request, previousResults);

            case 'implementation-guide':
                return await this.createImplementationGuide(request, previousResults);

            default:
                throw new Error(`Unknown design stage: ${stage.name}`);
        }
    }

    async analyzeBrandRequirements(request) {
        const brandResearch = await this.mcpManager.callMCP('mcp__ref-tools', 'ref_search_documentation', {
            query: `brand design guidelines ${request.industry} visual identity color psychology typography`
        });

        const brandPersonality = await this.determineBrandPersonality(request);
        const competitorAnalysis = await this.analyzeCompetitorDesigns(request);

        return {
            brandPersonality: brandPersonality,
            visualAttributes: await this.extractVisualAttributes(request),
            competitorInsights: competitorAnalysis,
            brandGuidelines: await this.createBrandGuidelines(request),
            designPrinciples: await this.defineBrandDesignPrinciples(request),
            researchInsights: brandResearch
        };
    }

    async designColorSystem(request, previousResults) {
        const brandPersonality = previousResults['brand-analysis'].brandPersonality;

        const colorResearch = await this.mcpManager.callMCP('mcp__ref-tools', 'ref_search_documentation', {
            query: `color theory ${request.industry} brand colors accessibility contrast ratios`
        });

        const colorSystem = {
            primary: await this.selectPrimaryColors(brandPersonality, request),
            secondary: await this.selectSecondaryColors(brandPersonality, request),
            neutral: await this.createNeutralPalette(request),
            semantic: await this.createSemanticColors(request),
            accessibility: await this.validateColorAccessibility(request),
            variations: await this.generateColorVariations(request)
        };

        return {
            colorSystem: colorSystem,
            colorPalettes: await this.generateColorPalettes(colorSystem),
            usageGuidelines: await this.createColorUsageGuidelines(colorSystem),
            accessibilityReport: await this.generateColorAccessibilityReport(colorSystem),
            researchBasis: colorResearch
        };
    }

    async selectTypographySystem(request, previousResults) {
        const brandPersonality = previousResults['brand-analysis'].brandPersonality;

        const typographyResearch = await this.mcpManager.callMCP('mcp__ref-tools', 'ref_search_documentation', {
            query: `typography web fonts ${request.industry} readability accessibility font pairing`
        });

        return {
            headingFonts: await this.selectHeadingFonts(brandPersonality, request),
            bodyFonts: await this.selectBodyFonts(brandPersonality, request),
            monospaceFonts: await this.selectMonospaceFonts(request),
            typescale: await this.createTypeScale(request),
            fontLoadingStrategy: await this.optimizeFontLoading(request),
            accessibilityFeatures: await this.ensureTypographyAccessibility(request),
            researchBasis: typographyResearch
        };
    }

    async designUIComponents(request, previousResults) {
        const colorSystem = previousResults['color-system-design'].colorSystem;
        const typography = previousResults['typography-selection'];

        const components = {};
        const componentTypes = Object.keys(this.componentLibrary);

        for (const componentType of componentTypes) {
            components[componentType] = await this.designComponentType(
                componentType,
                colorSystem,
                typography,
                request
            );
        }

        return {
            componentLibrary: components,
            interactionStates: await this.designInteractionStates(components),
            componentVariations: await this.createComponentVariations(components),
            responsiveBehavior: await this.defineResponsiveComponentBehavior(components),
            animationSpecs: await this.defineComponentAnimations(components)
        };
    }

    async establishVisualHierarchy(request, previousResults) {
        const components = previousResults['component-design'].componentLibrary;
        const typography = previousResults['typography-selection'];

        return {
            informationHierarchy: await this.createInformationHierarchy(request),
            visualWeight: await this.assignVisualWeights(components, typography),
            spacingSystem: await this.createSpacingSystem(request),
            layoutPrinciples: await this.defineLayoutPrinciples(request),
            focusManagement: await this.designFocusManagement(request),
            scanPatterns: await this.optimizeScanPatterns(request)
        };
    }

    async createResponsiveDesign(request, previousResults) {
        const components = previousResults['component-design'].componentLibrary;
        const hierarchy = previousResults['visual-hierarchy'];

        return {
            breakpointStrategy: await this.defineResponsiveBreakpoints(request),
            componentAdaptations: await this.adaptComponentsForBreakpoints(components),
            layoutStrategies: await this.createResponsiveLayoutStrategies(hierarchy),
            imageOptimization: await this.optimizeImagesForDevices(request),
            performanceConsiderations: await this.addressPerformanceForDevices(request)
        };
    }

    async ensureAccessibilityCompliance(request, previousResults) {
        const colorSystem = previousResults['color-system-design'].colorSystem;
        const typography = previousResults['typography-selection'];
        const components = previousResults['component-design'].componentLibrary;

        const accessibilityAudit = await this.mcpManager.callMCP('mcp__ref-tools', 'ref_search_documentation', {
            query: 'WCAG 2.1 accessibility guidelines color contrast keyboard navigation screen reader'
        });

        return {
            colorAccessibility: await this.auditColorAccessibility(colorSystem),
            typographyAccessibility: await this.auditTypographyAccessibility(typography),
            componentAccessibility: await this.auditComponentAccessibility(components),
            keyboardNavigation: await this.designKeyboardNavigation(components),
            screenReaderOptimization: await this.optimizeForScreenReaders(components),
            complianceReport: await this.generateComplianceReport(previousResults),
            accessibilityGuidelines: accessibilityAudit
        };
    }

    async createDesignSystem(request, previousResults) {
        const designSystem = {
            overview: await this.createDesignSystemOverview(request, previousResults),
            foundations: await this.compileDesignFoundations(previousResults),
            components: await this.compileComponentLibrary(previousResults),
            patterns: await this.createDesignPatterns(previousResults),
            guidelines: await this.createUsageGuidelines(previousResults),
            tokens: await this.generateDesignTokens(previousResults)
        };

        return designSystem;
    }

    async generateDesignAssets(request, previousResults) {
        const designPath = `/projects/${request.projectId}/deliverables/design/visual-assets/`;

        await this.mcpManager.callMCP('mcp__filesystem', 'create_directory', {
            path: designPath
        });

        const assets = {
            cssVariables: await this.generateCSSVariables(previousResults),
            tailwindConfig: await this.generateTailwindConfig(previousResults),
            componentCSS: await this.generateComponentCSS(previousResults),
            iconLibrary: await this.generateIconLibrary(request),
            imageAssets: await this.generateImageAssets(request),
            fontFiles: await this.prepareFontFiles(previousResults)
        };

        for (const [assetType, content] of Object.entries(assets)) {
            const extension = this.getAssetExtension(assetType);
            const assetContent = typeof content === 'object' ? JSON.stringify(content, null, 2) : content;

            await this.mcpManager.callMCP('mcp__filesystem', 'write_file', {
                path: `${designPath}${assetType}.${extension}`,
                content: assetContent
            });
        }

        return assets;
    }

    async createImplementationGuide(request, previousResults) {
        const guide = {
            setupInstructions: await this.createSetupInstructions(previousResults),
            componentUsage: await this.createComponentUsageGuide(previousResults),
            styleGuidelines: await this.createStyleGuidelines(previousResults),
            responsiveImplementation: await this.createResponsiveGuide(previousResults),
            accessibilityImplementation: await this.createAccessibilityGuide(previousResults),
            performanceOptimization: await this.createPerformanceGuide(previousResults),
            maintenanceGuidelines: await this.createMaintenanceGuide(previousResults)
        };

        return guide;
    }

    async generateDesignDeliverables(results, request) {
        const deliverables = {
            brandGuidelines: {
                file: 'brand-guidelines.json',
                content: results['brand-analysis']
            },
            colorSystem: {
                file: 'color-system.json',
                content: results['color-system-design']
            },
            typographySystem: {
                file: 'typography-system.json',
                content: results['typography-selection']
            },
            componentLibrary: {
                file: 'component-library.json',
                content: results['component-design']
            },
            designSystem: {
                file: 'design-system.json',
                content: results['design-system-creation']
            },
            implementationGuide: {
                file: 'implementation-guide.json',
                content: results['implementation-guide']
            },
            accessibilityReport: {
                file: 'accessibility-report.json',
                content: results['accessibility-compliance']
            },
            designAssets: {
                file: 'design-assets-manifest.json',
                content: results['asset-generation']
            }
        };

        const deliverablePath = `/projects/${request.projectId}/deliverables/design/visual-design/`;

        await this.mcpManager.callMCP('mcp__filesystem', 'create_directory', {
            path: deliverablePath
        });

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

    async storeDesignInMemory(designId, designResult) {
        const entities = [{
            name: `VisualDesign_${designId}`,
            entityType: 'visual-design',
            observations: [
                `Created visual design for ${designResult.projectType} with ${designResult.designStyle} style`,
                `Color system: ${Object.keys(designResult.stages['color-system-design'].colorSystem).length} color categories`,
                `Typography: ${Object.keys(designResult.stages['typography-selection']).length} font selections`,
                `Components: ${Object.keys(designResult.stages['component-design'].componentLibrary).length} component types`,
                `Accessibility: WCAG 2.1 AA compliant design system`,
                `Responsive: Multi-device optimized design system`,
                `Assets: Complete design asset library generated`
            ]
        }];

        await this.mcpManager.callMCP('mcp__memory', 'create_entities', { entities });

        const projectEntityName = `Project_${designResult.projectType}`;
        const relations = [{
            from: projectEntityName,
            to: `VisualDesign_${designId}`,
            relationType: 'includes_visual_design'
        }];

        await this.mcpManager.callMCP('mcp__memory', 'create_relations', { relations });
    }

    async determineBrandPersonality(request) {
        const personalityMap = {
            'healthcare': { primary: 'trustworthy', secondary: 'caring', tertiary: 'professional' },
            'finance': { primary: 'secure', secondary: 'reliable', tertiary: 'sophisticated' },
            'technology': { primary: 'innovative', secondary: 'efficient', tertiary: 'modern' },
            'education': { primary: 'approachable', secondary: 'inspiring', tertiary: 'clear' },
            'retail': { primary: 'friendly', secondary: 'accessible', tertiary: 'trendy' }
        };

        return personalityMap[request.industry] || personalityMap['technology'];
    }

    generateDesignId() {
        return `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getAssetExtension(assetType) {
        const extensions = {
            cssVariables: 'css',
            tailwindConfig: 'js',
            componentCSS: 'css',
            iconLibrary: 'json',
            imageAssets: 'json',
            fontFiles: 'json'
        };
        return extensions[assetType] || 'json';
    }

    async getAgentStatus() {
        return {
            agentId: this.config.agentId,
            version: this.config.version,
            status: 'active',
            capabilities: this.config.capabilities,
            activeDesigns: this.activeDesigns.size,
            brandTemplates: this.brandLibrary.size,
            componentTypes: this.componentLibrary.size,
            colorPalettes: this.colorPalettes.size,
            mcpConnections: this.config.mcpServers.length
        };
    }

    async shutdown() {
        console.log('🔄 Shutting down Visual Design Specialist...');

        this.activeDesigns.clear();
        this.brandLibrary.clear();
        this.componentLibrary.clear();
        this.colorPalettes.clear();

        this.emit('agentShutdown', { agentId: this.config.agentId });
        console.log('✅ Visual Design Specialist shutdown complete');
    }
}

module.exports = VisualDesignSpecialist;