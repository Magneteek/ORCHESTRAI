const ConcurrentRequestHandler = require('../../orchestrai-shared/execution/concurrent-request-handler');
const RequestLoadBalancer = require('../../orchestrai-shared/orchestration/request-load-balancer');
const AgentAvailabilityTracker = require('../../orchestrai-shared/monitoring/agent-availability-tracker');
const DynamicAgentRegistry = require('../../orchestrai-shared/coordination/dynamic-agent-registry');
const { EventEmitter } = require('events');

class ConcurrentOrchestratorManager extends EventEmitter {
    constructor(config = {}) {
        super();

        this.config = {
            maxConcurrentOrchestrators: config.maxConcurrentOrchestrators || 8,
            healthCheckInterval: config.healthCheckInterval || 30000,
            performanceMetricsInterval: config.performanceMetricsInterval || 10000,
            emergencyScalingThreshold: config.emergencyScalingThreshold || 0.95,
            autoOptimizationEnabled: config.autoOptimizationEnabled || true,
            ...config
        };

        // Mock MCP manager for testing
        const mockMcpManager = {
            getHealthStatus: () => ({ status: 'healthy' })
        };

        // Mock crystalline memory for testing
        const mockCrystallineMemory = {
            store: () => {},
            retrieve: () => null
        };

        // Enhanced mock orchestrator for realistic testing
        const mockOrchestrator = {
            processRequest: async (request) => {
                const startTime = Date.now();

                // Simulate realistic processing time based on task complexity
                const baseTime = request.metadata?.estimatedTime || 5000;
                const variationFactor = 0.3; // ±30% variation
                const variation = (Math.random() - 0.5) * 2 * variationFactor;
                const processingTime = Math.max(1000, baseTime * (1 + variation));

                console.log(`🔄 Agent ${request.agent || 'general'} starting: ${request.task?.substring(0, 60)}...`);

                // Simulate actual processing with progress updates
                await new Promise(resolve => {
                    const progressInterval = setInterval(() => {
                        const elapsed = Date.now() - startTime;
                        const progress = Math.min(100, (elapsed / processingTime) * 100);

                        if (elapsed >= processingTime) {
                            clearInterval(progressInterval);
                            resolve();
                        }
                    }, 1000);
                });

                const duration = Date.now() - startTime;

                // Simulate 95% success rate (more realistic)
                const success = Math.random() > 0.05;

                if (success) {
                    console.log(`✅ Agent ${request.agent || 'general'} completed in ${(duration/1000).toFixed(1)}s`);
                    return {
                        result: 'success',
                        requestId: request.id,
                        duration,
                        agent: request.agent,
                        task: request.task,
                        metadata: request.metadata
                    };
                } else {
                    console.log(`❌ Agent ${request.agent || 'general'} failed after ${(duration/1000).toFixed(1)}s`);
                    throw new Error(`Task failed: ${request.task?.substring(0, 40)}...`);
                }
            }
        };

        this.availabilityTracker = new AgentAvailabilityTracker(
            mockMcpManager,
            mockCrystallineMemory,
            null // dynamicAgentSelection
        );

        this.requestHandler = new ConcurrentRequestHandler(
            mockOrchestrator,
            mockCrystallineMemory,
            mockMcpManager
        );

        this.loadBalancer = new RequestLoadBalancer();

        this.agentRegistry = new DynamicAgentRegistry(
            this.availabilityTracker,
            mockCrystallineMemory,
            mockMcpManager
        );

        this.orchestrators = new Map();
        this.activeRequests = new Map();
        this.performanceMetrics = {
            totalRequestsProcessed: 0,
            averageResponseTime: 0,
            concurrentExecutions: 0,
            errorRate: 0,
            throughput: 0
        };

        this.isInitialized = false;
        this.isShuttingDown = false;

        this.setupEventHandlers();
    }

    async initialize() {
        if (this.isInitialized) {
            return;
        }

        console.log('🚀 Initializing ConcurrentOrchestratorManager...');

        try {
            await this.requestHandler.initialize();
            await this.loadBalancer.initialize();
            await this.availabilityTracker.initialize();
            await this.agentRegistry.initialize();

            this.startPerformanceMonitoring();
            this.startHealthMonitoring();

            this.isInitialized = true;
            this.emit('initialized');

            console.log('✅ ConcurrentOrchestratorManager initialized successfully');
            console.log(`📊 Concurrent Capabilities: ${this.requestHandler.config.maxConcurrentPipelines * this.requestHandler.config.maxPipelineCapacity} total operations`);

        } catch (error) {
            console.error('❌ Failed to initialize ConcurrentOrchestratorManager:', error);
            throw error;
        }
    }

    async processRequest(request, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        const requestId = this.generateRequestId();
        const startTime = Date.now();

        try {
            request.id = requestId;
            request.timestamp = startTime;
            request.priority = options.priority || 'normal';

            this.activeRequests.set(requestId, {
                request,
                startTime,
                status: 'processing'
            });

            const availableAgents = await this.availabilityTracker.getAvailableAgents();
            const selectedAgent = await this.loadBalancer.selectAgent(availableAgents, request);

            if (!selectedAgent) {
                await this.handleNoAgentAvailable(request);
                selectedAgent = await this.loadBalancer.selectAgent(
                    await this.availabilityTracker.getAvailableAgents(),
                    request
                );
            }

            const result = await this.requestHandler.processRequest(request, selectedAgent);

            await this.updatePerformanceMetrics(requestId, startTime, true);
            this.activeRequests.delete(requestId);

            this.emit('requestCompleted', {
                requestId,
                duration: Date.now() - startTime,
                agent: selectedAgent.id,
                success: true
            });

            return result;

        } catch (error) {
            await this.updatePerformanceMetrics(requestId, startTime, false);
            this.activeRequests.delete(requestId);

            this.emit('requestFailed', {
                requestId,
                duration: Date.now() - startTime,
                error: error.message
            });

            throw error;
        }
    }

    async processConcurrentRequests(requests, options = {}) {
        if (!Array.isArray(requests) || requests.length === 0) {
            throw new Error('Requests must be a non-empty array');
        }

        console.log(`🔄 Processing ${requests.length} concurrent requests...`);

        const concurrentPromises = requests.map((request, index) =>
            this.processRequest(request, {
                ...options,
                requestIndex: index
            }).catch(error => ({
                error,
                requestIndex: index,
                request
            }))
        );

        const results = await Promise.allSettled(concurrentPromises);

        const successfulResults = [];
        const failedResults = [];

        results.forEach((result, index) => {
            if (result.status === 'fulfilled' && !result.value.error) {
                successfulResults.push({
                    index,
                    result: result.value
                });
            } else {
                failedResults.push({
                    index,
                    error: result.value?.error || result.reason,
                    request: requests[index]
                });
            }
        });

        this.emit('batchProcessingCompleted', {
            total: requests.length,
            successful: successfulResults.length,
            failed: failedResults.length,
            results: { successfulResults, failedResults }
        });

        return {
            successful: successfulResults,
            failed: failedResults,
            metrics: {
                totalRequests: requests.length,
                successRate: (successfulResults.length / requests.length) * 100,
                concurrentExecutions: this.performanceMetrics.concurrentExecutions
            }
        };
    }

    async handleNoAgentAvailable(request) {
        console.log('⚠️ No agents available, triggering emergency scaling...');

        await this.agentRegistry.emergencyScale(request);

        await new Promise(resolve => setTimeout(resolve, 5000));

        const retryCount = 3;
        let attempt = 0;

        while (attempt < retryCount) {
            const agents = await this.availabilityTracker.getAvailableAgents();
            if (agents.length > 0) {
                return;
            }
            attempt++;
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        throw new Error('Unable to acquire agent after emergency scaling and retries');
    }

    setupEventHandlers() {
        this.requestHandler.on('pipelineCapacityChanged', (data) => {
            this.emit('capacityChanged', data);
            if (data.utilizationRate > this.config.emergencyScalingThreshold) {
                this.agentRegistry.emergencyScale();
            }
        });

        this.availabilityTracker.on('agentStatusChanged', (agentData) => {
            this.loadBalancer.updateAgentMetrics(agentData);
            this.emit('agentStatusChanged', agentData);
        });

        this.agentRegistry.on('agentScaled', (scalingData) => {
            console.log(`📈 Agent scaling event: ${scalingData.action} - ${scalingData.count} agents`);
            this.emit('agentScaled', scalingData);
        });

        this.loadBalancer.on('strategyOptimized', (optimizationData) => {
            console.log(`🎯 Load balancing strategy optimized: ${optimizationData.newStrategy}`);
            this.emit('strategyOptimized', optimizationData);
        });
    }

    startPerformanceMonitoring() {
        this.performanceInterval = setInterval(() => {
            this.updatePerformanceMetrics();
            this.emit('performanceUpdate', this.performanceMetrics);

            if (this.config.autoOptimizationEnabled) {
                this.optimizePerformance();
            }
        }, this.config.performanceMetricsInterval);
    }

    startHealthMonitoring() {
        this.healthInterval = setInterval(async () => {
            const healthStatus = await this.getSystemHealth();
            this.emit('healthUpdate', healthStatus);

            if (healthStatus.overall === 'critical') {
                await this.handleCriticalHealth(healthStatus);
            }
        }, this.config.healthCheckInterval);
    }

    async updatePerformanceMetrics(requestId = null, startTime = null, success = true) {
        if (requestId && startTime) {
            const duration = Date.now() - startTime;
            this.performanceMetrics.totalRequestsProcessed++;

            const newAverage = (
                (this.performanceMetrics.averageResponseTime * (this.performanceMetrics.totalRequestsProcessed - 1)) +
                duration
            ) / this.performanceMetrics.totalRequestsProcessed;

            this.performanceMetrics.averageResponseTime = newAverage;

            if (!success) {
                this.performanceMetrics.errorRate =
                    (this.performanceMetrics.errorRate * 0.9) + (0.1 * 100);
            } else {
                this.performanceMetrics.errorRate *= 0.95;
            }
        }

        this.performanceMetrics.concurrentExecutions = this.activeRequests.size;
        this.performanceMetrics.throughput = this.calculateThroughput();
    }

    calculateThroughput() {
        const currentTime = Date.now();
        const timeWindow = 60000; // 1 minute

        let recentRequests = 0;
        for (const [, requestData] of this.activeRequests) {
            if (currentTime - requestData.startTime < timeWindow) {
                recentRequests++;
            }
        }

        return (recentRequests / (timeWindow / 1000)) * 60; // requests per minute
    }

    async optimizePerformance() {
        const metrics = this.performanceMetrics;

        if (metrics.averageResponseTime > 5000) { // 5 seconds
            await this.agentRegistry.optimizeForSpeed();
        }

        if (metrics.errorRate > 5) { // 5%
            await this.loadBalancer.switchToFaultTolerantStrategy();
        }

        if (metrics.concurrentExecutions > 50) {
            await this.requestHandler.optimizePipelineDistribution();
        }
    }

    async getSystemHealth() {
        const requestHandlerHealth = await this.requestHandler.getHealthStatus();
        const loadBalancerHealth = await this.loadBalancer.getHealthStatus();
        const availabilityTrackerHealth = await this.availabilityTracker.getHealthStatus();
        const agentRegistryHealth = await this.agentRegistry.getHealthStatus();

        const componentHealths = [
            requestHandlerHealth,
            loadBalancerHealth,
            availabilityTrackerHealth,
            agentRegistryHealth
        ];

        const criticalCount = componentHealths.filter(h => h.status === 'critical').length;
        const warningCount = componentHealths.filter(h => h.status === 'warning').length;

        let overall = 'healthy';
        if (criticalCount > 0) {
            overall = 'critical';
        } else if (warningCount > 1) {
            overall = 'warning';
        }

        return {
            overall,
            components: {
                requestHandler: requestHandlerHealth,
                loadBalancer: loadBalancerHealth,
                availabilityTracker: availabilityTrackerHealth,
                agentRegistry: agentRegistryHealth
            },
            metrics: this.performanceMetrics,
            activeRequests: this.activeRequests.size
        };
    }

    async handleCriticalHealth(healthStatus) {
        console.log('🚨 Critical system health detected, initiating recovery procedures...');

        try {
            if (healthStatus.components.requestHandler.status === 'critical') {
                await this.requestHandler.emergencyRestart();
            }

            if (healthStatus.components.loadBalancer.status === 'critical') {
                await this.loadBalancer.fallbackToRoundRobin();
            }

            if (healthStatus.components.agentRegistry.status === 'critical') {
                await this.agentRegistry.emergencyScale();
            }

            this.emit('criticalRecoveryAttempted', {
                timestamp: new Date().toISOString(),
                healthStatus
            });

        } catch (error) {
            console.error('❌ Critical recovery failed:', error);
            this.emit('criticalRecoveryFailed', { error: error.message, healthStatus });
        }
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async getExecutionStatus() {
        return {
            isInitialized: this.isInitialized,
            activeRequests: this.activeRequests.size,
            availableAgents: (await this.availabilityTracker.getAvailableAgents()).length,
            totalAgents: await this.agentRegistry.getAgentCount(),
            performanceMetrics: this.performanceMetrics,
            systemHealth: await this.getSystemHealth()
        };
    }

    async shutdown() {
        if (this.isShuttingDown) {
            return;
        }

        this.isShuttingDown = true;
        console.log('🔄 Shutting down ConcurrentOrchestratorManager...');

        if (this.performanceInterval) {
            clearInterval(this.performanceInterval);
        }

        if (this.healthInterval) {
            clearInterval(this.healthInterval);
        }

        while (this.activeRequests.size > 0) {
            console.log(`⏳ Waiting for ${this.activeRequests.size} active requests to complete...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await this.requestHandler.shutdown();
        await this.loadBalancer.shutdown();
        await this.availabilityTracker.shutdown();
        await this.agentRegistry.shutdown();

        this.emit('shutdown');
        console.log('✅ ConcurrentOrchestratorManager shutdown complete');
    }
}

module.exports = ConcurrentOrchestratorManager;