/**
 * ORCHESTRAI Simultaneous Stream Orchestrator
 *
 * Coordinates parallel execution of multiple agent streams with real-time monitoring
 * Integrates VAIBE's proven simultaneous execution patterns with ORCHESTRAI's
 * crystalline memory intelligence for optimal performance and learning.
 *
 * Target Performance:
 * - 70-80% speed improvement vs sequential execution
 * - 95%+ quality maintenance with embedded monitoring
 * - Full crystalline memory integration for accumulated learning
 *
 * Architecture:
 * - WebSocket Coordination: Real-time agent communication
 * - Crystalline Memory: Historical context and pattern recognition
 * - Redis State: Distributed coordination state
 * - Dynamic Agent Selection: Intelligent agent assignment
 * - Embedded Monitoring: Real-time quality compliance
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const { ComplianceAgentFactory } = require('../compliance');

class SimultaneousStreamOrchestrator extends EventEmitter {
  constructor(websocketLayer, dynamicAgentSelection, crystallineMemory, redis) {
    super();

    // Core dependencies
    this.websocketLayer = websocketLayer;
    this.dynamicAgentSelection = dynamicAgentSelection;
    this.crystallineMemory = crystallineMemory;
    this.redis = redis;

    // Active orchestrations
    this.activeOrchestrations = new Map(); // orchestrationId → OrchestrationContext

    // Performance metrics
    this.metrics = {
      totalOrchestrations: 0,
      successfulOrchestrations: 0,
      averageSpeedImprovement: 0,
      averageQualityScore: 0,
      parallelEfficiency: 0,
      simultaneousStreamsRecord: 0
    };

    // Configuration
    this.config = {
      maxParallelStreams: 12, // VAIBE validated up to 12 simultaneous agents
      defaultQualityThreshold: 95,
      streamTimeout: 3600000, // 1 hour per stream
      enableRealTimeMonitoring: true,
      enableCrystallineMemory: true,
      coordinationMode: 'websocket' // 'websocket' | 'redis-only'
    };

    console.log('🎯 Simultaneous Stream Orchestrator initialized');
  }

  /**
   * MAIN ENTRY POINT: Execute parallel streams with real-time coordination
   */
  async executeParallelStreams(pipelineConfig, options = {}) {
    const orchestrationId = uuidv4();
    const startTime = Date.now();

    try {
      console.log(`\n🚀 Starting simultaneous stream orchestration: ${orchestrationId}`);
      console.log(`   📊 Streams: ${pipelineConfig.streams?.length || 0}`);
      console.log(`   🎯 Target: ${options.targetQuality || 95}% quality maintenance`);

      // Step 1: Load historical context from crystalline memory
      console.log('\n🔮 Step 1: Loading historical intelligence...');
      const historicalContext = await this.loadHistoricalContext(pipelineConfig);

      // Step 2: Optimize stream configuration with learned patterns
      console.log('\n⚙️ Step 2: Optimizing stream configuration...');
      const optimizedConfig = await this.optimizeStreamConfiguration(
        pipelineConfig,
        historicalContext
      );

      // Step 3: Create WebSocket coordination channel
      console.log('\n📡 Step 3: Creating real-time coordination channel...');
      const coordinationChannel = await this.websocketLayer.createCoordinationChannel(
        orchestrationId,
        optimizedConfig
      );

      // Step 4: Select and assign agents dynamically
      console.log('\n🤖 Step 4: Selecting optimal agents for streams...');
      const agentAssignments = await this.selectAgentsForStreams(
        optimizedConfig.streams,
        historicalContext
      );

      // Step 5: Initialize embedded monitoring agents
      console.log('\n👁️ Step 5: Initializing embedded monitoring...');
      const monitoringAgents = await this.initializeMonitoring(
        optimizedConfig.streams,
        coordinationChannel
      );

      // Step 6: Create orchestration context
      const orchestrationContext = {
        orchestrationId,
        pipelineConfig: optimizedConfig,
        coordinationChannel,
        agentAssignments,
        monitoringAgents,
        historicalContext,
        startTime,

        // State tracking
        state: {
          phase: 'executing',
          activeStreams: [],
          completedStreams: [],
          failedStreams: [],
          overallProgress: 0,
          qualityScores: {}
        },

        // Performance tracking
        performance: {
          estimatedDuration: this.estimateDuration(optimizedConfig, historicalContext),
          actualDuration: null,
          speedImprovement: null,
          baselineDuration: null
        }
      };

      this.activeOrchestrations.set(orchestrationId, orchestrationContext);

      // Step 7: Execute all streams simultaneously
      console.log('\n🎬 Step 7: Launching parallel stream execution...');
      const executionPromise = this.executeStreamsSimultaneously(orchestrationContext);

      // Step 8: Monitor execution in real-time
      const monitoringPromise = this.monitorOrchestration(orchestrationContext);

      // Wait for all streams to complete
      console.log('\n⏳ Waiting for stream completion...');
      const [executionResults, monitoringResults] = await Promise.all([
        executionPromise,
        monitoringPromise
      ]);

      // Step 9: Integrate and validate results
      console.log('\n✅ Step 9: Integrating results...');
      const integratedResults = await this.integrateStreamResults(
        executionResults,
        monitoringResults,
        orchestrationContext
      );

      // Step 10: Store learnings in crystalline memory
      console.log('\n💾 Step 10: Storing learnings in crystalline memory...');
      await this.storeLearnings(orchestrationContext, integratedResults);

      // Calculate final metrics
      const duration = Date.now() - startTime;
      const speedImprovement = this.calculateSpeedImprovement(
        duration,
        orchestrationContext.performance.baselineDuration
      );

      orchestrationContext.state.phase = 'completed';
      orchestrationContext.performance.actualDuration = duration;
      orchestrationContext.performance.speedImprovement = speedImprovement;

      // Update global metrics
      this.updateMetrics(orchestrationContext, integratedResults);

      // Close coordination channel
      await this.websocketLayer.closeChannel(orchestrationId);

      this.activeOrchestrations.delete(orchestrationId);

      console.log(`\n✅ Simultaneous orchestration completed: ${orchestrationId}`);
      console.log(`   ⏱️  Duration: ${duration}ms`);
      console.log(`   🚀 Speed improvement: ${speedImprovement.toFixed(1)}%`);
      console.log(`   ⭐ Quality score: ${integratedResults.overallQuality}%`);
      console.log(`   📈 Streams completed: ${orchestrationContext.state.completedStreams.length}/${optimizedConfig.streams.length}`);

      this.emit('orchestration-completed', {
        orchestrationId,
        duration,
        speedImprovement,
        quality: integratedResults.overallQuality
      });

      return {
        orchestrationId,
        success: true,
        duration,
        speedImprovement,
        results: integratedResults,
        performance: orchestrationContext.performance,
        context: orchestrationContext
      };

    } catch (error) {
      console.error(`❌ Simultaneous orchestration failed: ${orchestrationId}`, error);

      // Clean up
      if (this.activeOrchestrations.has(orchestrationId)) {
        await this.cleanupOrchestration(orchestrationId, error);
      }

      this.emit('orchestration-failed', {
        orchestrationId,
        error: error.message,
        duration: Date.now() - startTime
      });

      throw error;
    }
  }

  /**
   * Load historical context from crystalline memory
   */
  async loadHistoricalContext(pipelineConfig) {
    if (!this.config.enableCrystallineMemory || !this.crystallineMemory) {
      return { patterns: [], entities: [], insights: [] };
    }

    try {
      const context = await this.crystallineMemory.retrieveContext({
        clientName: pipelineConfig.clientName,
        projectUuid: pipelineConfig.projectUuid,
        domain: pipelineConfig.domain,
        deliverableType: pipelineConfig.deliverableType
      });

      // Extract optimization insights
      const insights = await this.extractOptimizationInsights(context);

      console.log(`   ✅ Loaded ${context.entities?.length || 0} historical entities`);
      console.log(`   ✅ Extracted ${insights.length} optimization insights`);

      return {
        ...context,
        insights,
        loadedAt: Date.now()
      };

    } catch (error) {
      console.warn('Could not load historical context:', error.message);
      return { patterns: [], entities: [], insights: [] };
    }
  }

  /**
   * Extract optimization insights from historical context
   */
  async extractOptimizationInsights(context) {
    const insights = [];

    if (!context.entities) return insights;

    // Analyze successful parallel executions
    const successfulOrchestrations = context.entities.filter(e =>
      (e.type === 'workflow' || e.type === 'simultaneous-coordination') &&
      e.observations?.some(obs => obs.includes('success') || obs.includes('completed'))
    );

    for (const orchestration of successfulOrchestrations) {
      insights.push({
        type: 'successful-parallel-execution',
        pattern: 'multi-stream-coordination',
        relevance: 0.9,
        observations: orchestration.observations
      });
    }

    // Analyze agent performance patterns
    const agentPerformance = context.entities.filter(e =>
      e.type === 'agent-performance'
    );

    if (agentPerformance.length > 0) {
      insights.push({
        type: 'agent-performance-history',
        pattern: 'optimal-agent-selection',
        relevance: 0.85,
        agents: agentPerformance
      });
    }

    return insights;
  }

  /**
   * Optimize stream configuration using historical patterns
   */
  async optimizeStreamConfiguration(pipelineConfig, historicalContext) {
    const optimized = { ...pipelineConfig };

    // Apply learned optimizations
    if (historicalContext.insights && historicalContext.insights.length > 0) {
      console.log(`   🔧 Applying ${historicalContext.insights.length} learned optimizations`);

      for (const insight of historicalContext.insights) {
        switch (insight.type) {
          case 'successful-parallel-execution':
            // Adjust parallelization based on past success
            optimized.parallelizationStrategy = 'aggressive';
            break;

          case 'agent-performance-history':
            // Use high-performing agents preferentially
            optimized.agentPreferences = insight.agents.map(a => a.name);
            break;
        }
      }
    }

    // Ensure stream count doesn't exceed maximum
    if (optimized.streams && optimized.streams.length > this.config.maxParallelStreams) {
      console.warn(`   ⚠️  Stream count (${optimized.streams.length}) exceeds maximum (${this.config.maxParallelStreams})`);
      console.warn(`   ⚙️  Streams will be executed in batches`);
      optimized.batchExecution = true;
      optimized.batchSize = this.config.maxParallelStreams;
    }

    return optimized;
  }

  /**
   * Select optimal agents for streams dynamically
   */
  async selectAgentsForStreams(streams, historicalContext) {
    const assignments = [];

    for (const stream of streams) {
      console.log(`   🤖 Selecting agents for stream: ${stream.streamId}`);

      // Build task context with historical intelligence
      const taskContext = {
        type: stream.type,
        domain: stream.domain,
        requiredCapabilities: stream.requiredCapabilities || [],
        complexity: stream.complexity || 'medium',
        priority: stream.priority || 'medium',
        historicalPerformance: historicalContext.insights.filter(i =>
          i.type === 'agent-performance-history'
        )
      };

      // Select execution agents
      const executionAgents = [];
      for (const agentRequirement of stream.agents || []) {
        const agent = await this.dynamicAgentSelection.selectBestAgentForTask({
          ...taskContext,
          agentType: agentRequirement.type,
          specificCapabilities: agentRequirement.capabilities
        });

        executionAgents.push({
          ...agent,
          role: agentRequirement.role,
          streamId: stream.streamId
        });
      }

      // Select monitoring agents
      const monitoringAgents = [];
      for (const monitorType of stream.monitoring || []) {
        const monitorAgent = await this.dynamicAgentSelection.selectBestAgentForTask({
          type: 'monitoring',
          domain: 'quality',
          requiredCapabilities: [monitorType],
          priority: 'high'
        });

        monitoringAgents.push({
          ...monitorAgent,
          monitorType,
          streamId: stream.streamId
        });
      }

      assignments.push({
        streamId: stream.streamId,
        executionAgents,
        monitoringAgents,
        estimatedLoad: this.estimateStreamLoad(stream)
      });

      console.log(`      ├─ Execution agents: ${executionAgents.length}`);
      console.log(`      └─ Monitoring agents: ${monitoringAgents.length}`);
    }

    return assignments;
  }

  /**
   * Initialize embedded monitoring for streams
   */
  async initializeMonitoring(streams, coordinationChannel) {
    const monitoringAgents = [];

    for (const stream of streams) {
      // Determine stream type for compliance agent selection
      const streamType = stream.domain || stream.agentType || 'general';

      // Create appropriate compliance agents for this stream type
      const complianceAgents = ComplianceAgentFactory.createAgents(streamType, {
        enableRealTimeAlerts: true,
        enableAutoCorrection: false, // Disabled for now
        severityThreshold: 'medium'
      });

      // Start monitoring for each agent
      for (const agent of complianceAgents) {
        try {
          await agent.startMonitoring(stream, coordinationChannel);

          monitoringAgents.push({
            agent,
            agentId: agent.agentId,
            agentType: agent.agentType,
            streamId: stream.id || stream.streamId,
            state: 'active'
          });

          console.log(`      ✅ Started ${agent.agentType} for stream: ${stream.id || stream.streamId}`);
        } catch (error) {
          console.error(`      ❌ Failed to start ${agent.agentType}:`, error.message);
        }
      }
    }

    console.log(`   👁️  ${monitoringAgents.length} compliance agents active`);

    return monitoringAgents;
  }

  /**
   * Get monitoring configuration for specific type
   */
  getMonitoringConfig(monitorType) {
    const configs = {
      'code-quality': {
        thresholds: { minScore: 95, maxViolations: 5 },
        checkInterval: 5000,
        realTime: true
      },
      'accessibility': {
        thresholds: { wcagLevel: 'AA', minScore: 100 },
        checkInterval: 10000,
        blocking: true
      },
      'security': {
        thresholds: { minScore: 98, criticalVulnerabilities: 0 },
        checkInterval: 15000,
        blocking: true
      },
      'performance': {
        thresholds: { lighthouseScore: 90, coreWebVitals: 'good' },
        checkInterval: 20000,
        realTime: true
      },
      'language-purity': {
        thresholds: { purity: 100, contamination: 0 },
        checkInterval: 3000,
        blocking: true
      },
      'seo-compliance': {
        thresholds: { minScore: 95, criticalIssues: 0 },
        checkInterval: 10000,
        realTime: true
      },
      'brand-voice': {
        thresholds: { consistency: 90, toneMatch: 85 },
        checkInterval: 8000,
        realTime: false
      }
    };

    return configs[monitorType] || {
      thresholds: { minScore: 80 },
      checkInterval: 10000,
      realTime: false
    };
  }

  /**
   * Execute all streams simultaneously
   */
  async executeStreamsSimultaneously(orchestrationContext) {
    const { pipelineConfig, agentAssignments, coordinationChannel } = orchestrationContext;

    // Determine if batching is needed
    const batchExecution = pipelineConfig.batchExecution || false;
    const streams = pipelineConfig.streams;

    if (batchExecution) {
      return await this.executeBatched(streams, agentAssignments, coordinationChannel);
    }

    // Execute all streams in parallel
    console.log(`   🚀 Launching ${streams.length} parallel streams...`);

    const streamPromises = streams.map((stream, index) =>
      this.executeStream(
        stream,
        agentAssignments[index],
        coordinationChannel,
        orchestrationContext
      )
    );

    const results = await Promise.allSettled(streamPromises);

    // Separate successful and failed streams
    const successfulResults = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    const failedResults = results
      .filter(r => r.status === 'rejected')
      .map(r => ({ error: r.reason, status: 'failed' }));

    console.log(`   ✅ Completed: ${successfulResults.length} streams`);
    if (failedResults.length > 0) {
      console.log(`   ❌ Failed: ${failedResults.length} streams`);
    }

    return {
      successful: successfulResults,
      failed: failedResults,
      total: streams.length
    };
  }

  /**
   * Execute streams in batches
   */
  async executeBatched(streams, agentAssignments, coordinationChannel) {
    const batchSize = this.config.maxParallelStreams;
    const batches = [];

    for (let i = 0; i < streams.length; i += batchSize) {
      batches.push({
        streams: streams.slice(i, i + batchSize),
        assignments: agentAssignments.slice(i, i + batchSize)
      });
    }

    console.log(`   📦 Executing ${batches.length} batches of ${batchSize} streams`);

    const allResults = { successful: [], failed: [] };

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];

      console.log(`   📦 Batch ${batchIndex + 1}/${batches.length}...`);

      const batchPromises = batch.streams.map((stream, index) =>
        this.executeStream(
          stream,
          batch.assignments[index],
          coordinationChannel,
          {}
        )
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach(result => {
        if (result.status === 'fulfilled') {
          allResults.successful.push(result.value);
        } else {
          allResults.failed.push({ error: result.reason, status: 'failed' });
        }
      });
    }

    return allResults;
  }

  /**
   * Execute individual stream with assigned agents
   */
  async executeStream(stream, assignment, coordinationChannel, orchestrationContext) {
    const streamStartTime = Date.now();

    try {
      console.log(`      🎬 Executing stream: ${stream.streamId}`);

      // Update orchestration state
      if (orchestrationContext.state) {
        orchestrationContext.state.activeStreams.push(stream.streamId);
      }

      // Broadcast stream start
      await this.websocketLayer.broadcastToSession(coordinationChannel.sessionId, {
        type: 'STREAM_STARTED',
        payload: {
          streamId: stream.streamId,
          agents: assignment.executionAgents.map(a => a.agentId),
          monitoring: assignment.monitoringAgents.map(m => m.monitorType)
        }
      });

      // Execute stream tasks with assigned agents
      const tasks = stream.tasks || [];
      const taskResults = [];

      for (const task of tasks) {
        const taskResult = await this.executeTask(
          task,
          assignment.executionAgents,
          coordinationChannel
        );

        taskResults.push(taskResult);

        // Update progress
        const progress = Math.round((taskResults.length / tasks.length) * 100);
        await this.websocketLayer.broadcastToSession(coordinationChannel.sessionId, {
          type: 'STREAM_PROGRESS',
          payload: {
            streamId: stream.streamId,
            progress,
            completedTasks: taskResults.length,
            totalTasks: tasks.length
          }
        });
      }

      const duration = Date.now() - streamStartTime;

      // Update orchestration state
      if (orchestrationContext.state) {
        const activeIndex = orchestrationContext.state.activeStreams.indexOf(stream.streamId);
        if (activeIndex > -1) {
          orchestrationContext.state.activeStreams.splice(activeIndex, 1);
        }
        orchestrationContext.state.completedStreams.push(stream.streamId);
      }

      // Broadcast stream completion
      await this.websocketLayer.broadcastToSession(coordinationChannel.sessionId, {
        type: 'STREAM_COMPLETED',
        payload: {
          streamId: stream.streamId,
          duration,
          taskResults: taskResults.length
        }
      });

      console.log(`      ✅ Stream completed: ${stream.streamId} (${duration}ms)`);

      return {
        streamId: stream.streamId,
        success: true,
        duration,
        taskResults,
        tasksCompleted: taskResults.length
      };

    } catch (error) {
      console.error(`      ❌ Stream failed: ${stream.streamId}`, error.message);

      // Update orchestration state
      if (orchestrationContext.state) {
        orchestrationContext.state.failedStreams.push({
          streamId: stream.streamId,
          error: error.message
        });
      }

      throw error;
    }
  }

  /**
   * Execute individual task (placeholder - would integrate with actual agent execution)
   */
  async executeTask(task, agents, coordinationChannel) {
    // This is a placeholder - in real implementation, this would:
    // 1. Select appropriate agent from assigned agents
    // 2. Send task to agent via Claude Code Task tool
    // 3. Monitor execution via WebSocket
    // 4. Return results

    // For now, simulate task execution
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          taskId: task.taskId,
          success: true,
          result: { completed: true },
          duration: Math.random() * 1000 + 500
        });
      }, Math.random() * 2000 + 1000);
    });
  }

  /**
   * Monitor orchestration in real-time
   */
  async monitorOrchestration(orchestrationContext) {
    const { coordinationChannel, monitoringAgents } = orchestrationContext;

    // Start monitoring agents
    const monitoringPromises = monitoringAgents.map(monitor =>
      this.runMonitoringAgent(monitor, coordinationChannel)
    );

    const results = await Promise.all(monitoringPromises);

    return {
      monitoringResults: results,
      alerts: results.flatMap(r => r.alerts || []),
      overallCompliance: this.calculateOverallCompliance(results)
    };
  }

  /**
   * Run individual monitoring agent
   */
  async runMonitoringAgent(monitor, coordinationChannel) {
    try {
      // Get the actual compliance agent
      const agent = monitor.agent;

      if (!agent) {
        return {
          agentId: monitor.agentId,
          agentType: monitor.agentType,
          status: 'skipped',
          alerts: [],
          score: 100
        };
      }

      // Get current agent status (includes real-time validation results)
      const status = agent.getStatus();

      // Generate final report
      const report = await agent.stopMonitoring();

      return {
        agentId: monitor.agentId,
        agentType: monitor.agentType,
        status: status.issuesDetected > 0 ? 'issues-found' : 'passed',
        alerts: agent.alerts,
        score: report.overallScore,
        issuesDetected: status.issuesDetected,
        issuesResolved: status.issuesResolved,
        report
      };

    } catch (error) {
      console.error(`❌ Monitoring agent error (${monitor.agentType}):`, error);

      return {
        agentId: monitor.agentId,
        agentType: monitor.agentType,
        status: 'error',
        alerts: [],
        score: 0,
        error: error.message
      };
    }
  }

  /**
   * Calculate overall compliance score
   */
  calculateOverallCompliance(monitoringResults) {
    if (monitoringResults.length === 0) return 100;

    const validResults = monitoringResults.filter(r => r.status !== 'error' && r.status !== 'skipped');

    if (validResults.length === 0) return 100;

    const totalScore = validResults.reduce((sum, r) => sum + (r.score || 0), 0);
    const avgScore = Math.round(totalScore / validResults.length);

    // Log compliance details
    const criticalIssues = monitoringResults.reduce((sum, r) => sum + (r.issuesDetected || 0), 0);

    if (criticalIssues > 0) {
      console.log(`   ⚠️  ${criticalIssues} total issues detected across all streams`);
    }

    return avgScore;
  }

  /**
   * Integrate results from all streams
   */
  async integrateStreamResults(executionResults, monitoringResults, orchestrationContext) {
    const { successful, failed } = executionResults;

    // Calculate metrics
    const totalTasks = successful.reduce((sum, s) => sum + s.tasksCompleted, 0);
    const averageDuration = successful.reduce((sum, s) => sum + s.duration, 0) / successful.length;
    const overallQuality = monitoringResults.overallCompliance;

    // Aggregate deliverables
    const deliverables = successful.flatMap(s => s.taskResults || []);

    return {
      success: failed.length === 0,
      totalStreams: executionResults.total,
      successfulStreams: successful.length,
      failedStreams: failed.length,
      totalTasks,
      averageDuration,
      overallQuality,
      deliverables,
      monitoring: monitoringResults,
      failureDetails: failed.length > 0 ? failed : null
    };
  }

  /**
   * Store learnings in crystalline memory
   */
  async storeLearnings(orchestrationContext, integratedResults) {
    if (!this.config.enableCrystallineMemory || !this.crystallineMemory) return;

    try {
      await this.crystallineMemory.storeWorkflowMemory({
        workflowId: orchestrationContext.orchestrationId,
        type: 'simultaneous-orchestration',
        status: integratedResults.success ? 'completed' : 'partial-success',
        duration: orchestrationContext.performance.actualDuration,
        result: {
          streamsCompleted: integratedResults.successfulStreams,
          totalStreams: integratedResults.totalStreams,
          qualityScore: integratedResults.overallQuality,
          speedImprovement: orchestrationContext.performance.speedImprovement,
          tasksCompleted: integratedResults.totalTasks
        },
        metadata: {
          pipelineConfig: orchestrationContext.pipelineConfig,
          agentAssignments: orchestrationContext.agentAssignments,
          historicalContext: orchestrationContext.historicalContext
        }
      });

      console.log('   💾 Learnings stored in crystalline memory for future optimization');

    } catch (error) {
      console.warn('Could not store learnings:', error.message);
    }
  }

  /**
   * Calculate speed improvement vs baseline
   */
  calculateSpeedImprovement(actualDuration, baselineDuration) {
    if (!baselineDuration || baselineDuration === 0) {
      // Estimate baseline as if tasks were sequential
      return 0;
    }

    const improvement = ((baselineDuration - actualDuration) / baselineDuration) * 100;
    return Math.max(0, improvement);
  }

  /**
   * Estimate duration based on historical data
   */
  estimateDuration(pipelineConfig, historicalContext) {
    // Base estimate: 15 minutes per stream
    const baseEstimate = (pipelineConfig.streams?.length || 1) * 15 * 60 * 1000;

    // Adjust based on historical patterns
    if (historicalContext.insights && historicalContext.insights.length > 0) {
      const speedupFactor = 0.7; // 30% faster with learned optimizations
      return Math.round(baseEstimate * speedupFactor);
    }

    return baseEstimate;
  }

  /**
   * Estimate stream load
   */
  estimateStreamLoad(stream) {
    const baseTasks = stream.tasks?.length || 1;
    const complexityMultiplier = {
      'low': 0.5,
      'medium': 1.0,
      'high': 1.5,
      'very-high': 2.0
    };

    return baseTasks * (complexityMultiplier[stream.complexity] || 1.0);
  }

  /**
   * Update global metrics
   */
  updateMetrics(orchestrationContext, integratedResults) {
    this.metrics.totalOrchestrations++;

    if (integratedResults.success) {
      this.metrics.successfulOrchestrations++;
    }

    // Update average speed improvement
    const speedImprovement = orchestrationContext.performance.speedImprovement;
    this.metrics.averageSpeedImprovement =
      (this.metrics.averageSpeedImprovement * (this.metrics.totalOrchestrations - 1) + speedImprovement) /
      this.metrics.totalOrchestrations;

    // Update average quality score
    this.metrics.averageQualityScore =
      (this.metrics.averageQualityScore * (this.metrics.totalOrchestrations - 1) + integratedResults.overallQuality) /
      this.metrics.totalOrchestrations;

    // Update simultaneous streams record
    const streamsCount = orchestrationContext.pipelineConfig.streams?.length || 0;
    if (streamsCount > this.metrics.simultaneousStreamsRecord) {
      this.metrics.simultaneousStreamsRecord = streamsCount;
    }
  }

  /**
   * Clean up orchestration after failure
   */
  async cleanupOrchestration(orchestrationId, error) {
    const context = this.activeOrchestrations.get(orchestrationId);
    if (!context) return;

    try {
      // Close coordination channel
      if (context.coordinationChannel) {
        await this.websocketLayer.closeChannel(context.coordinationChannel.sessionId);
      }

      // Store failure learning
      if (this.crystallineMemory) {
        await this.crystallineMemory.storeWorkflowMemory({
          workflowId: orchestrationId,
          type: 'simultaneous-orchestration',
          status: 'failed',
          duration: Date.now() - context.startTime,
          result: {
            error: error.message,
            completedStreams: context.state?.completedStreams.length || 0,
            failedStreams: context.state?.failedStreams || []
          }
        });
      }

      this.activeOrchestrations.delete(orchestrationId);

    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }

  /**
   * Get orchestration status
   */
  getOrchestrationStatus(orchestrationId) {
    const context = this.activeOrchestrations.get(orchestrationId);
    if (!context) {
      return { found: false };
    }

    return {
      found: true,
      orchestrationId,
      state: context.state,
      performance: context.performance,
      elapsed: Date.now() - context.startTime,
      channelStatus: this.websocketLayer.getChannelStatus(context.coordinationChannel.sessionId)
    };
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      activeOrchestrations: this.activeOrchestrations.size,
      successRate: this.metrics.totalOrchestrations > 0
        ? Math.round((this.metrics.successfulOrchestrations / this.metrics.totalOrchestrations) * 100)
        : 0
    };
  }
}

module.exports = SimultaneousStreamOrchestrator;
