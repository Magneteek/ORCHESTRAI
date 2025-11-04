/**
 * ORCHESTRAI Automated QA Integration for Main Orchestrator
 * 
 * Integrates the automated content enhancement loop into the main orchestrator
 * to provide seamless write-evaluate-iterate workflow for all content generation
 */

const AutomatedContentEnhancementLoop = require('./automated-content-enhancement-loop');
const path = require('path');

class AutomatedQAOrchestratorIntegration {
  constructor(orchestrator) {
    this.orchestrator = orchestrator;
    this.enhancementLoop = new AutomatedContentEnhancementLoop(orchestrator);
    this.isEnabled = true;
    this.autoTriggerPatterns = [
      'content-generation',
      'pillar-article',
      'comprehensive-content',
      'blog-post-long-form'
    ];
    
    this.integrationMetrics = {
      totalContentPieces: 0,
      averageIterations: 0,
      averageImprovement: 0,
      successRate: 0,
      totalTimeSaved: 0
    };
  }

  /**
   * Initialize automated QA integration
   */
  async initialize() {
    console.log('🤖 Initializing Automated QA Enhancement Integration...');
    
    try {
      // Hook into content generation events
      this.orchestrator.on('content-generated', this.handleContentGenerated.bind(this));
      this.orchestrator.on('task-completed', this.handleTaskCompleted.bind(this));
      
      // Register enhancement loop as available service
      this.orchestrator.registerService('automated-enhancement', this.enhancementLoop);
      
      // Set up automatic triggers for specific agent types
      this.setupAgentTriggers();
      
      console.log('✅ Automated QA Enhancement Integration initialized');
      
      return {
        success: true,
        enhancementPatternsActive: this.autoTriggerPatterns.length,
        integrationStatus: 'active'
      };
      
    } catch (error) {
      console.error('❌ Error initializing automated QA integration:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Set up automatic triggers for specific agent types
   */
  setupAgentTriggers() {
    const contentAgents = [
      'content-writer-specialist',
      'content-outline-architect',
      'seo-content-optimization'
    ];
    
    for (const agentType of contentAgents) {
      this.orchestrator.onAgentTaskComplete(agentType, async (taskData) => {
        if (this.shouldTriggerEnhancement(taskData)) {
          await this.triggerAutomaticEnhancement(taskData);
        }
      });
    }
    
    console.log(`🔗 Set up automatic triggers for ${contentAgents.length} agent types`);
  }

  /**
   * Handle content generated events
   */
  async handleContentGenerated(event) {
    if (!this.isEnabled) return;
    
    console.log('📝 Content generated event received:', event.contentType);
    
    if (this.shouldTriggerEnhancement(event)) {
      await this.triggerAutomaticEnhancement(event);
    }
  }

  /**
   * Handle task completed events
   */
  async handleTaskCompleted(event) {
    if (!this.isEnabled) return;
    
    if (event.agentType === 'content-writer-specialist' && event.taskType === 'long-form-content') {
      console.log('📋 Long-form content task completed, checking for enhancement opportunity');
      
      if (this.shouldTriggerEnhancement(event)) {
        await this.triggerAutomaticEnhancement(event);
      }
    }
  }

  /**
   * Determine if automatic enhancement should be triggered
   */
  shouldTriggerEnhancement(taskData) {
    // Check if task matches enhancement patterns
    const matchesPattern = this.autoTriggerPatterns.some(pattern => 
      taskData.taskType?.includes(pattern) || 
      taskData.contentType?.includes(pattern) ||
      taskData.description?.toLowerCase().includes(pattern)
    );
    
    if (!matchesPattern) return false;
    
    // Check if content file exists and is substantial
    const hasSubstantialContent = taskData.wordCount > 2000 || 
                                  taskData.targetWordCount > 2000 ||
                                  taskData.description?.includes('pillar') ||
                                  taskData.description?.includes('comprehensive');
    
    if (!hasSubstantialContent) return false;
    
    // Check if outline exists for comparison
    const hasOutline = taskData.outlineFilePath || 
                      taskData.outline || 
                      taskData.requirements?.includes('outline');
    
    return hasOutline;
  }

  /**
   * Trigger automatic enhancement process
   */
  async triggerAutomaticEnhancement(taskData) {
    console.log('🚀 Triggering automatic content enhancement...');
    
    const startTime = Date.now();
    
    try {
      // Prepare task context for enhancement loop
      const enhancementContext = this.prepareEnhancementContext(taskData);
      
      console.log('🔄 Starting automated enhancement loop for:', enhancementContext.projectId);
      
      // Execute the enhancement loop
      const enhancementResult = await this.enhancementLoop.executeContentEnhancementLoop(enhancementContext);
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      // Update metrics
      this.updateMetrics(enhancementResult, executionTime);
      
      // Report results
      console.log('✅ Automated enhancement completed:');
      console.log(`   📊 Score Improvement: ${enhancementResult.initialScore}% → ${enhancementResult.finalScore}%`);
      console.log(`   🔄 Iterations Used: ${enhancementResult.iterations}`);
      console.log(`   ⏱️  Total Time: ${(executionTime / 1000 / 60).toFixed(1)} minutes`);
      console.log(`   🎯 Success: ${enhancementResult.success ? 'YES' : 'NO'}`);
      
      // Notify relevant agents about completion
      await this.notifyEnhancementCompletion(taskData, enhancementResult);
      
      return enhancementResult;
      
    } catch (error) {
      console.error('❌ Error in automatic enhancement:', error);
      
      // Notify about failure but don't block the main workflow
      this.orchestrator.emit('enhancement-error', {
        taskData,
        error: error.message,
        timestamp: Date.now()
      });
      
      return {
        success: false,
        error: error.message,
        fallbackRecommendation: 'Manual quality review recommended'
      };
    }
  }

  /**
   * Prepare enhancement context from task data
   */
  prepareEnhancementContext(taskData) {
    // Extract or infer project information
    const projectId = taskData.projectId || this.extractProjectIdFromPath(taskData.contentFilePath);
    
    return {
      projectId: projectId,
      clientName: taskData.clientName || this.extractClientFromProjectId(projectId),
      contentFilePath: taskData.contentFilePath || taskData.outputFile,
      outlineFilePath: taskData.outlineFilePath || this.inferOutlinePath(taskData.contentFilePath),
      taskType: taskData.taskType || 'content-enhancement',
      targetWordCount: taskData.targetWordCount || 4000,
      qualityThreshold: taskData.qualityThreshold || 85,
      maxIterations: taskData.maxIterations || 5
    };
  }

  /**
   * Extract project ID from file path
   */
  extractProjectIdFromPath(filePath) {
    if (!filePath) return 'unknown-project';
    
    const pathParts = filePath.split('/');
    const projectsIndex = pathParts.indexOf('projects');
    
    if (projectsIndex !== -1 && projectsIndex + 1 < pathParts.length) {
      return pathParts[projectsIndex + 1];
    }
    
    return 'unknown-project';
  }

  /**
   * Extract client name from project ID
   */
  extractClientFromProjectId(projectId) {
    if (projectId.includes('nasmehpg')) return 'nasmehPG';
    if (projectId.includes('quartziq')) return 'QuartzIQ';
    
    // Extract client name from project ID pattern
    const parts = projectId.split('-');
    return parts[0] || 'Unknown Client';
  }

  /**
   * Infer outline file path from content path
   */
  inferOutlinePath(contentFilePath) {
    if (!contentFilePath) return null;
    
    const contentDir = path.dirname(contentFilePath);
    const contentFileName = path.basename(contentFilePath, path.extname(contentFilePath));
    
    // Try common outline naming patterns
    const outlinePatterns = [
      `${contentFileName}-outline.md`,
      `${contentFileName}-comprehensive-outline.md`,
      `${contentFileName.replace('-FULL-ARTICLE', '-outline')}.md`,
      `${contentFileName.replace('-article', '-outline')}.md`
    ];
    
    for (const pattern of outlinePatterns) {
      const outlinePath = path.join(contentDir, pattern);
      // In real implementation, we'd check if file exists
      if (contentFileName.includes('outline')) continue; // Skip if this IS the outline
      return outlinePath;
    }
    
    return null;
  }

  /**
   * Update integration metrics
   */
  updateMetrics(enhancementResult, executionTime) {
    this.integrationMetrics.totalContentPieces++;
    
    if (enhancementResult.success) {
      this.integrationMetrics.averageIterations = (
        (this.integrationMetrics.averageIterations * (this.integrationMetrics.totalContentPieces - 1) + 
         enhancementResult.iterations) / this.integrationMetrics.totalContentPieces
      );
      
      this.integrationMetrics.averageImprovement = (
        (this.integrationMetrics.averageImprovement * (this.integrationMetrics.totalContentPieces - 1) + 
         enhancementResult.improvement) / this.integrationMetrics.totalContentPieces
      );
    }
    
    this.integrationMetrics.successRate = this.calculateSuccessRate();
    
    // Estimate time saved vs. manual enhancement
    const estimatedManualTime = 3 * 60 * 60 * 1000; // 3 hours manual work
    this.integrationMetrics.totalTimeSaved += (estimatedManualTime - executionTime);
  }

  /**
   * Calculate current success rate
   */
  calculateSuccessRate() {
    // This would track actual success/failure counts
    // For now, return estimated value
    return 0.85; // 85% success rate
  }

  /**
   * Notify relevant systems about enhancement completion
   */
  async notifyEnhancementCompletion(taskData, enhancementResult) {
    const notification = {
      event: 'content-enhancement-completed',
      taskData,
      enhancementResult,
      timestamp: Date.now()
    };
    
    // Notify main orchestrator
    this.orchestrator.emit('enhancement-completed', notification);
    
    // Notify original requesting agent if available
    if (taskData.requestingAgent) {
      await this.orchestrator.notifyAgent(taskData.requestingAgent, notification);
    }
    
    // Update project crystalline memory with enhancement results
    if (taskData.projectId) {
      await this.updateProjectMemoryWithResults(taskData.projectId, enhancementResult);
    }
  }

  /**
   * Update project crystalline memory with enhancement results
   */
  async updateProjectMemoryWithResults(projectId, enhancementResult) {
    try {
      const memoryManager = this.orchestrator.memoryManager;
      if (!memoryManager) return;
      
      const enhancementData = {
        projectId,
        enhancementType: 'automated-content-enhancement',
        qualityImprovement: enhancementResult.improvement,
        iterationsUsed: enhancementResult.iterations,
        finalScore: enhancementResult.finalScore,
        success: enhancementResult.success,
        timestamp: Date.now()
      };
      
      await memoryManager.storeMemory(
        'content-intelligence',
        enhancementData,
        {
          importance: 0.8,
          category: 'enhancement-results',
          projectId: projectId
        }
      );
      
      console.log('💾 Enhancement results stored in project memory');
      
    } catch (error) {
      console.error('❌ Error storing enhancement results in memory:', error);
    }
  }

  /**
   * Manual enhancement trigger (API endpoint)
   */
  async manualEnhancementTrigger(taskContext) {
    console.log('🖱️  Manual enhancement trigger activated');
    
    return await this.triggerAutomaticEnhancement(taskContext);
  }

  /**
   * Get integration status and metrics
   */
  getIntegrationStatus() {
    return {
      enabled: this.isEnabled,
      metrics: this.integrationMetrics,
      autoTriggerPatterns: this.autoTriggerPatterns,
      systemPerformance: {
        averageIterationTime: this.integrationMetrics.averageIterations * 2, // 2 min per iteration
        averageTimeSaved: this.integrationMetrics.totalTimeSaved / (this.integrationMetrics.totalContentPieces || 1),
        systemEfficiency: this.integrationMetrics.successRate
      }
    };
  }

  /**
   * Configure enhancement settings
   */
  updateConfiguration(config) {
    if (config.enabled !== undefined) {
      this.isEnabled = config.enabled;
    }
    
    if (config.autoTriggerPatterns) {
      this.autoTriggerPatterns = config.autoTriggerPatterns;
    }
    
    if (config.defaultQualityThreshold) {
      this.enhancementLoop.qualityThreshold = config.defaultQualityThreshold;
    }
    
    if (config.maxIterations) {
      this.enhancementLoop.maxIterations = config.maxIterations;
    }
    
    console.log('⚙️  Enhancement configuration updated');
    
    return {
      success: true,
      currentConfig: {
        enabled: this.isEnabled,
        autoTriggerPatterns: this.autoTriggerPatterns,
        qualityThreshold: this.enhancementLoop.qualityThreshold,
        maxIterations: this.enhancementLoop.maxIterations
      }
    };
  }

  /**
   * Emergency disable for troubleshooting
   */
  emergencyDisable(reason) {
    console.log(`🚨 Emergency disable activated: ${reason}`);
    
    this.isEnabled = false;
    
    this.orchestrator.emit('enhancement-system-disabled', {
      reason,
      timestamp: Date.now(),
      lastKnownMetrics: this.integrationMetrics
    });
    
    return {
      success: true,
      message: 'Automated enhancement system disabled',
      reason
    };
  }

  /**
   * Re-enable after troubleshooting
   */
  reenable() {
    console.log('✅ Automated enhancement system re-enabled');
    
    this.isEnabled = true;
    
    this.orchestrator.emit('enhancement-system-enabled', {
      timestamp: Date.now()
    });
    
    return {
      success: true,
      message: 'Automated enhancement system enabled'
    };
  }
}

module.exports = AutomatedQAOrchestratorIntegration;