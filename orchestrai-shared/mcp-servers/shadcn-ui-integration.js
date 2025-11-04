/**
 * ORCHESTRAI ShadCN UI MCP Integration
 * Provides intelligent component access and context for AI agents
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class ShadCnUIIntegration {
    constructor() {
        this.mcpProcess = null;
        this.componentCache = new Map();
        this.componentHistory = [];
        this.isConnected = false;
    }

    /**
     * Initialize ShadCN MCP server connection
     */
    async initialize() {
        try {
            console.log('🎨 Initializing ShadCN UI MCP Integration...');
            
            // Start MCP server process
            this.mcpProcess = spawn('npx', ['@jpisnice/shadcn-ui-mcp-server'], {
                env: {
                    ...process.env,
                    GITHUB_API_KEY: process.env.GITHUB_API_KEY || ''
                },
                stdio: ['pipe', 'pipe', 'pipe']
            });

            this.mcpProcess.stdout.on('data', (data) => {
                console.log(`📦 ShadCN MCP: ${data}`);
            });

            this.mcpProcess.stderr.on('data', (data) => {
                console.error(`⚠️  ShadCN MCP Error: ${data}`);
            });

            this.isConnected = true;
            console.log('✅ ShadCN UI MCP Integration initialized successfully');
            
            return { success: true, message: 'ShadCN MCP initialized' };
        } catch (error) {
            console.error('❌ Failed to initialize ShadCN MCP:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Query components using natural language
     */
    async queryComponents(query, framework = 'react') {
        if (!this.isConnected) {
            await this.initialize();
        }

        try {
            console.log(`🔍 Querying ShadCN components: ${query} (${framework})`);
            
            // Cache key for performance
            const cacheKey = `${query}-${framework}`;
            if (this.componentCache.has(cacheKey)) {
                console.log('📋 Returning cached results');
                return this.componentCache.get(cacheKey);
            }

            // Simulate component query (in real implementation, this would communicate with MCP server)
            const mockResponse = await this.mockComponentQuery(query, framework);
            
            // Cache the result
            this.componentCache.set(cacheKey, mockResponse);
            
            // Track usage for crystalline memory
            this.componentHistory.push({
                query,
                framework,
                timestamp: new Date(),
                components: mockResponse.components
            });

            return mockResponse;
        } catch (error) {
            console.error('❌ Component query failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get component details and usage examples
     */
    async getComponentDetails(componentName, framework = 'react') {
        try {
            console.log(`📋 Getting details for component: ${componentName}`);
            
            // Simulate component details query
            const details = await this.mockComponentDetails(componentName, framework);
            return details;
        } catch (error) {
            console.error('❌ Failed to get component details:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Install components to specific project
     */
    async installComponent(componentName, projectPath, framework = 'react') {
        try {
            console.log(`📦 Installing component ${componentName} to ${projectPath}`);
            
            // Verify project structure
            const componentsJsonPath = path.join(projectPath, 'components.json');
            
            try {
                await fs.access(componentsJsonPath);
            } catch {
                // Create components.json if it doesn't exist
                await this.createComponentsJson(projectPath, framework);
            }

            // Simulate component installation
            const installation = await this.mockInstallComponent(componentName, projectPath);
            
            return installation;
        } catch (error) {
            console.error('❌ Component installation failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get component recommendations based on context
     */
    async getComponentRecommendations(context) {
        try {
            console.log('💡 Generating component recommendations...');
            
            const recommendations = await this.analyzeContextForComponents(context);
            return recommendations;
        } catch (error) {
            console.error('❌ Failed to get recommendations:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mock implementation - replace with actual MCP communication
     */
    async mockComponentQuery(query, framework) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const queryLower = query.toLowerCase();
        let components = [];
        
        if (queryLower.includes('button')) {
            components.push({
                name: 'button',
                description: 'A clickable button component with multiple variants',
                variants: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
                sizes: ['default', 'sm', 'lg', 'icon']
            });
        }
        
        if (queryLower.includes('form') || queryLower.includes('input')) {
            components.push(
                {
                    name: 'input',
                    description: 'Form input component with validation support',
                    types: ['text', 'email', 'password', 'number']
                },
                {
                    name: 'label',
                    description: 'Label component for form fields'
                },
                {
                    name: 'form',
                    description: 'Form wrapper with validation context'
                }
            );
        }
        
        if (queryLower.includes('table') || queryLower.includes('data')) {
            components.push({
                name: 'table',
                description: 'Data table component with sorting and filtering',
                features: ['sorting', 'filtering', 'pagination', 'selection']
            });
        }

        return {
            success: true,
            query,
            framework,
            components,
            count: components.length,
            cached: false
        };
    }

    async mockComponentDetails(componentName, framework) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const componentDetails = {
            button: {
                name: 'Button',
                description: 'Displays a button or a component that looks like a button.',
                props: {
                    variant: {
                        type: 'enum',
                        options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
                        default: 'default'
                    },
                    size: {
                        type: 'enum',
                        options: ['default', 'sm', 'lg', 'icon'],
                        default: 'default'
                    },
                    asChild: {
                        type: 'boolean',
                        default: false,
                        description: 'Change the default rendered element'
                    }
                },
                example: `<Button variant="outline" size="sm">Click me</Button>`,
                dependencies: ['@radix-ui/react-slot', 'class-variance-authority'],
                registry: '@shadcn'
            }
        };

        return {
            success: true,
            component: componentDetails[componentName] || { name: componentName, description: 'Component not found in cache' },
            framework
        };
    }

    async mockInstallComponent(componentName, projectPath) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true,
            component: componentName,
            projectPath,
            installed: true,
            files: [
                `components/ui/${componentName}.tsx`,
                `components/ui/index.ts`
            ],
            dependencies: ['@radix-ui/react-slot', 'class-variance-authority']
        };
    }

    async analyzeContextForComponents(context) {
        const { content, purpose, target } = context;
        const recommendations = [];

        // Analyze content for UI patterns
        if (content.includes('dashboard') || purpose === 'analytics') {
            recommendations.push(
                { component: 'card', reason: 'Dashboard layouts need container components' },
                { component: 'tabs', reason: 'Organize dashboard sections' },
                { component: 'progress', reason: 'Show metrics and progress' }
            );
        }

        if (content.includes('form') || purpose === 'data-collection') {
            recommendations.push(
                { component: 'input', reason: 'Form data collection' },
                { component: 'button', reason: 'Form submission' },
                { component: 'label', reason: 'Form field labels' },
                { component: 'select', reason: 'Option selection' }
            );
        }

        if (purpose === 'navigation' || content.includes('menu')) {
            recommendations.push(
                { component: 'navigation-menu', reason: 'Site navigation' },
                { component: 'dropdown-menu', reason: 'Hierarchical navigation' }
            );
        }

        return {
            success: true,
            context,
            recommendations,
            count: recommendations.length
        };
    }

    async createComponentsJson(projectPath, framework) {
        const config = {
            "$schema": "https://ui.shadcn.com/schema.json",
            "style": "new-york",
            "rsc": true,
            "tsx": true,
            "tailwind": {
                "config": "./tailwind.config.js",
                "css": "./src/app/globals.css",
                "baseColor": "neutral",
                "cssVariables": true,
                "prefix": ""
            },
            "iconLibrary": "lucide",
            "aliases": {
                "components": "@/components",
                "utils": "@/lib/utils",
                "ui": "@/components/ui",
                "lib": "@/lib",
                "hooks": "@/hooks"
            }
        };

        await fs.writeFile(
            path.join(projectPath, 'components.json'),
            JSON.stringify(config, null, 2)
        );
    }

    /**
     * Get usage statistics for crystalline memory integration
     */
    getUsageStats() {
        return {
            totalQueries: this.componentHistory.length,
            uniqueComponents: new Set(
                this.componentHistory.flatMap(h => h.components.map(c => c.name))
            ).size,
            cacheHitRatio: this.componentCache.size / Math.max(this.componentHistory.length, 1),
            recentActivity: this.componentHistory.slice(-10)
        };
    }

    /**
     * Clean up resources
     */
    async cleanup() {
        if (this.mcpProcess) {
            this.mcpProcess.kill();
            this.mcpProcess = null;
        }
        this.isConnected = false;
        console.log('🧹 ShadCN MCP Integration cleaned up');
    }
}

module.exports = ShadCnUIIntegration;