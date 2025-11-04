// WebDev Learning Foundation - Integrates with ORCHESTRAI's Crystalline Memory System
// Extends existing learning architecture specifically for web development quality validation

const EventEmitter = require('events');
const PerformancePredictionLearning = require('./performance-prediction-learning');

class WebDevLearningFoundation extends EventEmitter {
  constructor(crystallineMemory, learningAlgorithmFoundation) {
    super();
    this.crystallineMemory = crystallineMemory;
    this.learningFoundation = learningAlgorithmFoundation; // Connect to existing learning system
    this.domain = 'web-development-quality';
    
    // WebDev-specific learning models
    this.webDevModels = {
      codeQualityPrediction: new WebDevCodeQualityModel(crystallineMemory),
      performancePrediction: new WebDevPerformanceModel(crystallineMemory),
      qualityGateEffectiveness: new QualityGateEffectivenessModel(crystallineMemory),
      crossAgentLearning: new CrossAgentLearningModel(crystallineMemory)
    };
    
    // Advanced performance prediction system
    this.performancePredictionSystem = new PerformancePredictionLearning(crystallineMemory, this);
    
    // Learning metrics specific to WebDev domain
    this.webDevMetrics = {
      totalPredictions: 0,
      accuratePredictions: 0,
      qualityGateAdjustments: 0,
      crossAgentInsights: 0,
      performancePredictionAccuracy: 0,
      lastLearningUpdate: Date.now()
    };
    
    // Prediction tracking for outcome validation
    this.activePredictions = new Map(); // predictionId -> prediction data
    this.predictionOutcomes = new Map(); // predictionId -> actual outcome
    
    this.initialize();
    console.log('🧠 WebDev Learning Foundation initialized');
  }

  async initialize() {
    // Initialize WebDev-specific memory pools in crystalline lattice
    await this.initializeWebDevMemoryPools();
    
    // Connect to existing learning foundation for cross-domain insights
    await this.connectToMainLearningSystem();
    
    // Start continuous learning cycle
    this.startWebDevLearningCycle();
  }

  async initializeWebDevMemoryPools() {
    const webDevPools = [
      'webdev-prediction-tracking',
      'webdev-performance-learning',
      'webdev-quality-gate-effectiveness',
      'webdev-cross-agent-insights',
      'webdev-pattern-recognition'
    ];

    for (const poolName of webDevPools) {
      await this.crystallineMemory.storeMemory(
        poolName,
        JSON.stringify({
          poolType: 'webdev-learning',
          domain: this.domain,
          initialized: Date.now(),
          learningData: {},
          patterns: {},
          insights: {}
        }),
        {
          importance: 0.9,
          semantic_tags: ['webdev', 'learning', poolName.split('-').pop()]
        }
      );
    }
    
    console.log(`🧠 ${webDevPools.length} WebDev learning pools initialized`);
  }

  async connectToMainLearningSystem() {
    // Register WebDev domain with main learning foundation
    if (this.learningFoundation && this.learningFoundation.registerDomainExtension) {
      await this.learningFoundation.registerDomainExtension(this.domain, this);
      console.log('🔗 WebDev Learning connected to main learning system');
    }
  }

  startWebDevLearningCycle() {
    // Run WebDev-specific learning updates every 3 minutes
    setInterval(async () => {
      await this.updateWebDevLearningModels();
    }, 180000); // 3 minutes

    console.log('🔄 WebDev learning cycle started');
  }

  // ============ PREDICTION & LEARNING METHODS ============

  async makePrediction(agentId, predictionType, inputData, confidence = 0.5) {
    const predictionId = `webdev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const prediction = {
      id: predictionId,
      agentId,
      type: predictionType,
      input: inputData,
      confidence,
      timestamp: Date.now(),
      status: 'pending'
    };

    // Store prediction for later validation
    this.activePredictions.set(predictionId, prediction);
    
    // Store in crystalline memory
    await this.crystallineMemory.storeMemory(
      'webdev-prediction-tracking',
      JSON.stringify(prediction),
      {
        importance: confidence,
        semantic_tags: ['prediction', predictionType, agentId, 'webdev'],
        predictionId
      }
    );

    this.webDevMetrics.totalPredictions++;
    console.log(`🎯 WebDev prediction made: ${predictionId} (${predictionType})`);
    
    return predictionId;
  }

  async recordActualOutcome(predictionId, actualResult) {
    const prediction = this.activePredictions.get(predictionId);
    if (!prediction) {
      console.warn(`⚠️ Prediction not found: ${predictionId}`);
      return;
    }

    // Calculate prediction accuracy
    const accuracy = this.calculatePredictionAccuracy(prediction, actualResult);
    
    const outcome = {
      predictionId,
      actualResult,
      accuracy,
      timestamp: Date.now()
    };

    // Store outcome
    this.predictionOutcomes.set(predictionId, outcome);
    
    // Update crystalline memory with outcome
    await this.crystallineMemory.storeMemory(
      'webdev-prediction-tracking',
      JSON.stringify({
        ...prediction,
        outcome,
        accuracy,
        status: 'completed'
      }),
      {
        importance: accuracy > 0.8 ? 1.0 : 0.7, // Higher importance for accurate predictions
        semantic_tags: ['outcome', prediction.type, prediction.agentId, 'webdev']
      }
    );

    // Update learning models
    await this.updateLearningFromOutcome(prediction, outcome);
    
    // Update metrics
    if (accuracy > 0.7) {
      this.webDevMetrics.accuratePredictions++;
    }

    console.log(`✅ WebDev outcome recorded: ${predictionId} (accuracy: ${(accuracy * 100).toFixed(1)}%)`);
    
    // Emit learning event for other agents
    this.emit('webDevLearning', {
      predictionId,
      agentId: prediction.agentId,
      accuracy,
      insight: this.extractLearningInsight(prediction, outcome)
    });

    return accuracy;
  }

  // ============ ADVANCED PERFORMANCE PREDICTION ============

  async predictPerformanceImpact(codeAnalysis, projectContext) {
    try {
      console.log(`🚀 Predicting performance impact for: ${projectContext.projectPath}`);
      
      // Use advanced performance prediction system
      const performancePrediction = await this.performancePredictionSystem.predictPerformanceImpact(
        codeAnalysis,
        projectContext
      );
      
      // Also make a standard prediction for comparison
      const standardPredictionId = await this.makePrediction(
        'webdev-learning-foundation',
        'performance-impact',
        {
          codeAnalysis,
          projectContext,
          advancedPrediction: performancePrediction
        },
        performancePrediction.confidence || 0.7
      );

      return {
        ...performancePrediction,
        standardPredictionId,
        dualPredictionMode: true,
        recordBothOutcomes: (actualResults) => this.recordDualPerformanceOutcome(
          performancePrediction.predictionId,
          standardPredictionId,
          actualResults
        )
      };
    } catch (error) {
      console.error('Error in advanced performance prediction:', error);
      throw error;
    }
  }

  async recordDualPerformanceOutcome(advancedPredictionId, standardPredictionId, actualResults) {
    try {
      // Record outcome for both prediction systems
      const advancedAccuracy = await this.performancePredictionSystem.recordActualPerformance(
        advancedPredictionId,
        actualResults
      );
      
      const standardAccuracy = await this.recordActualOutcome(
        standardPredictionId,
        actualResults
      );

      console.log(`📊 Dual performance learning recorded:`);
      console.log(`   Advanced System: ${(advancedAccuracy * 100).toFixed(1)}% accuracy`);
      console.log(`   Standard System: ${(standardAccuracy * 100).toFixed(1)}% accuracy`);

      return {
        advancedAccuracy,
        standardAccuracy,
        improvement: advancedAccuracy - standardAccuracy
      };
    } catch (error) {
      console.error('Error recording dual performance outcome:', error);
      return { advancedAccuracy: 0, standardAccuracy: 0, improvement: 0 };
    }
  }

  calculatePredictionAccuracy(prediction, actualResult) {
    switch (prediction.type) {
      case 'code-quality':
        return this.calculateCodeQualityAccuracy(prediction.input, actualResult);
      case 'performance-impact':
        return this.calculatePerformanceAccuracy(prediction.input, actualResult);
      case 'quality-gate':
        return this.calculateQualityGateAccuracy(prediction.input, actualResult);
      default:
        return this.calculateGenericAccuracy(prediction.input, actualResult);
    }
  }

  calculateCodeQualityAccuracy(predicted, actual) {
    if (!predicted.overallScore || !actual.overallScore) return 0.5;
    
    const scoreDiff = Math.abs(predicted.overallScore - actual.overallScore);
    const accuracy = Math.max(0, 1 - (scoreDiff / 100));
    
    // Bonus for predicting major issues correctly
    const predictedIssues = predicted.issues?.length || 0;
    const actualIssues = actual.issues?.length || 0;
    const issueAccuracy = Math.max(0, 1 - Math.abs(predictedIssues - actualIssues) / Math.max(predictedIssues, actualIssues, 1));
    
    return (accuracy * 0.7) + (issueAccuracy * 0.3);
  }

  calculatePerformanceAccuracy(predicted, actual) {
    if (!predicted.bundleSize || !actual.bundleSize) return 0.5;
    
    const bundleSizeDiff = Math.abs(predicted.bundleSize - actual.bundleSize) / actual.bundleSize;
    const bundleAccuracy = Math.max(0, 1 - bundleSizeDiff);
    
    const scoreDiff = Math.abs((predicted.overallScore || 0) - (actual.overallScore || 0));
    const scoreAccuracy = Math.max(0, 1 - (scoreDiff / 100));
    
    return (bundleAccuracy * 0.6) + (scoreAccuracy * 0.4);
  }

  calculateQualityGateAccuracy(predicted, actual) {
    const predictedPass = predicted.shouldPass || false;
    const actualPass = actual.passed || false;
    
    return predictedPass === actualPass ? 1.0 : 0.0;
  }

  calculateGenericAccuracy(predicted, actual) {
    // Generic accuracy calculation for unknown prediction types
    if (typeof predicted === 'number' && typeof actual === 'number') {
      const diff = Math.abs(predicted - actual);
      return Math.max(0, 1 - (diff / Math.max(predicted, actual, 1)));
    }
    
    // For object comparisons, use similarity scoring
    if (typeof predicted === 'object' && typeof actual === 'object') {
      const predictedKeys = Object.keys(predicted);
      const actualKeys = Object.keys(actual);
      const commonKeys = predictedKeys.filter(key => actualKeys.includes(key));
      
      return commonKeys.length / Math.max(predictedKeys.length, actualKeys.length);
    }
    
    return predicted === actual ? 1.0 : 0.0;
  }

  async updateLearningFromOutcome(prediction, outcome) {
    const modelType = prediction.type;
    const model = this.webDevModels[`${modelType}Prediction`] || this.webDevModels.codeQualityPrediction;
    
    await model.updateFromOutcome(prediction, outcome);
    
    // Also update main learning foundation with WebDev insights
    if (this.learningFoundation && outcome.accuracy > 0.8) {
      await this.learningFoundation.integrateExternalInsight({
        domain: this.domain,
        agentId: prediction.agentId,
        insight: this.extractLearningInsight(prediction, outcome),
        confidence: outcome.accuracy
      });
    }
  }

  extractLearningInsight(prediction, outcome) {
    return {
      patternType: prediction.type,
      inputPattern: this.extractInputPattern(prediction.input),
      accuracyPattern: outcome.accuracy > 0.8 ? 'high-accuracy' : 'needs-improvement',
      recommendedAdjustments: this.generateRecommendations(prediction, outcome),
      applicableAgents: this.getApplicableAgents(prediction.type),
      confidence: outcome.accuracy
    };
  }

  extractInputPattern(input) {
    if (input.projectPath) {
      return {
        projectType: this.inferProjectType(input.projectPath),
        fileCount: input.files?.length || 0,
        complexity: input.complexity || 'medium'
      };
    }
    return { type: 'generic', complexity: 'medium' };
  }

  inferProjectType(projectPath) {
    if (projectPath.includes('react')) return 'react';
    if (projectPath.includes('next')) return 'nextjs';
    if (projectPath.includes('vue')) return 'vue';
    if (projectPath.includes('angular')) return 'angular';
    return 'generic';
  }

  generateRecommendations(prediction, outcome) {
    const recommendations = [];
    
    if (outcome.accuracy < 0.5) {
      recommendations.push({
        type: 'prediction-model-adjustment',
        suggestion: 'Retrain prediction model with more diverse examples',
        priority: 'high'
      });
    }
    
    if (outcome.accuracy > 0.9) {
      recommendations.push({
        type: 'pattern-reinforcement',
        suggestion: 'Reinforce this prediction pattern for similar contexts',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }

  getApplicableAgents(predictionType) {
    const agentMap = {
      'code-quality': ['web-frontend-developer', 'web-quality-code-validator'],
      'performance-impact': ['web-performance-optimizer', 'web-quality-performance-tester'],
      'quality-gate': ['web-quality-ux-validator', 'web-quality-responsive-validator']
    };
    
    return agentMap[predictionType] || ['web-frontend-developer'];
  }

  // ============ MODEL UPDATE METHODS ============

  async updateWebDevLearningModels() {
    console.log('🔄 Updating WebDev learning models...');
    
    // Get recent outcomes for model updates
    const recentOutcomes = await this.getRecentOutcomes(50);
    
    // Update each WebDev model
    const updatePromises = Object.values(this.webDevModels).map(model => 
      model.updateWithRecentData(recentOutcomes)
    );
    
    await Promise.all(updatePromises);
    
    // Update metrics
    this.webDevMetrics.lastLearningUpdate = Date.now();
    
    console.log('✅ WebDev learning models updated');
  }

  async getRecentOutcomes(limit = 50) {
    const outcomes = [];
    let count = 0;
    
    for (const [predictionId, outcome] of this.predictionOutcomes) {
      if (count >= limit) break;
      outcomes.push(outcome);
      count++;
    }
    
    return outcomes;
  }

  // ============ API METHODS ============

  async getWebDevLearningStatus() {
    const accuracyRate = this.webDevMetrics.totalPredictions > 0 
      ? (this.webDevMetrics.accuratePredictions / this.webDevMetrics.totalPredictions)
      : 0;

    return {
      active: true,
      domain: this.domain,
      metrics: {
        ...this.webDevMetrics,
        accuracyRate: (accuracyRate * 100).toFixed(1) + '%'
      },
      activePredictions: this.activePredictions.size,
      completedPredictions: this.predictionOutcomes.size,
      models: await this.getModelStatuses()
    };
  }

  async getModelStatuses() {
    const statuses = {};
    
    for (const [name, model] of Object.entries(this.webDevModels)) {
      statuses[name] = await model.getStatus();
    }
    
    return statuses;
  }
}

// ============ WEBDEV-SPECIFIC LEARNING MODELS ============

class WebDevCodeQualityModel {
  constructor(crystallineMemory) {
    this.crystallineMemory = crystallineMemory;
    this.modelData = {
      patterns: new Map(),
      accuracy: 0.5,
      totalUpdates: 0
    };
  }

  async updateFromOutcome(prediction, outcome) {
    // Extract patterns from successful predictions
    if (outcome.accuracy > 0.8) {
      const pattern = this.extractPattern(prediction.input);
      this.modelData.patterns.set(pattern.id, {
        ...pattern,
        accuracy: outcome.accuracy,
        lastSeen: Date.now()
      });
    }
    
    // Update overall accuracy
    this.modelData.accuracy = (this.modelData.accuracy * this.modelData.totalUpdates + outcome.accuracy) / 
                              (this.modelData.totalUpdates + 1);
    this.modelData.totalUpdates++;
  }

  extractPattern(input) {
    return {
      id: `pattern_${Date.now()}`,
      projectType: input.projectType || 'unknown',
      fileCount: input.files?.length || 0,
      complexity: input.complexity || 'medium',
      validationPoints: input.validationPoints || []
    };
  }

  async updateWithRecentData(outcomes) {
    for (const outcome of outcomes) {
      // Update model with recent learning data
      if (outcome.prediction?.type === 'code-quality') {
        await this.updateFromOutcome(outcome.prediction, outcome);
      }
    }
  }

  async getStatus() {
    return {
      type: 'WebDevCodeQualityModel',
      accuracy: this.modelData.accuracy,
      patterns: this.modelData.patterns.size,
      totalUpdates: this.modelData.totalUpdates
    };
  }
}

class WebDevPerformanceModel {
  constructor(crystallineMemory) {
    this.crystallineMemory = crystallineMemory;
    this.modelData = {
      performancePatterns: new Map(),
      accuracy: 0.5,
      totalUpdates: 0
    };
  }

  async updateFromOutcome(prediction, outcome) {
    if (outcome.accuracy > 0.7) {
      const pattern = {
        bundleSizeRange: this.categorizeBundleSize(prediction.input.bundleSize),
        performanceImpact: outcome.actualResult.performanceImpact || 'medium',
        accuracy: outcome.accuracy
      };
      
      this.modelData.performancePatterns.set(
        `perf_${Date.now()}`, 
        pattern
      );
    }
    
    this.modelData.accuracy = (this.modelData.accuracy * this.modelData.totalUpdates + outcome.accuracy) / 
                              (this.modelData.totalUpdates + 1);
    this.modelData.totalUpdates++;
  }

  categorizeBundleSize(size) {
    if (size < 250000) return 'small';
    if (size < 500000) return 'medium';
    if (size < 1000000) return 'large';
    return 'very-large';
  }

  async updateWithRecentData(outcomes) {
    for (const outcome of outcomes) {
      if (outcome.prediction?.type === 'performance-impact') {
        await this.updateFromOutcome(outcome.prediction, outcome);
      }
    }
  }

  async getStatus() {
    return {
      type: 'WebDevPerformanceModel',
      accuracy: this.modelData.accuracy,
      patterns: this.modelData.performancePatterns.size,
      totalUpdates: this.modelData.totalUpdates
    };
  }
}

class QualityGateEffectivenessModel {
  constructor(crystallineMemory) {
    this.crystallineMemory = crystallineMemory;
    this.modelData = {
      gateEffectiveness: new Map(),
      adjustmentHistory: [],
      totalAdjustments: 0
    };
  }

  async updateFromOutcome(prediction, outcome) {
    const gateName = prediction.input.gateName || 'unknown';
    
    if (!this.modelData.gateEffectiveness.has(gateName)) {
      this.modelData.gateEffectiveness.set(gateName, {
        totalChecks: 0,
        correctDecisions: 0,
        adjustments: 0
      });
    }
    
    const gate = this.modelData.gateEffectiveness.get(gateName);
    gate.totalChecks++;
    
    if (outcome.accuracy > 0.8) {
      gate.correctDecisions++;
    }
  }

  async updateWithRecentData(outcomes) {
    for (const outcome of outcomes) {
      if (outcome.prediction?.type === 'quality-gate') {
        await this.updateFromOutcome(outcome.prediction, outcome);
      }
    }
  }

  async getStatus() {
    return {
      type: 'QualityGateEffectivenessModel',
      gates: this.modelData.gateEffectiveness.size,
      totalAdjustments: this.modelData.totalAdjustments
    };
  }
}

class CrossAgentLearningModel {
  constructor(crystallineMemory) {
    this.crystallineMemory = crystallineMemory;
    this.modelData = {
      sharedInsights: new Map(),
      crossAgentPatterns: new Map()
    };
  }

  async updateFromOutcome(prediction, outcome) {
    // Track insights that could be shared across agents
    if (outcome.accuracy > 0.8) {
      const insight = {
        sourceAgent: prediction.agentId,
        pattern: prediction.input,
        outcome: outcome.actualResult,
        applicableAgents: this.determineApplicableAgents(prediction),
        confidence: outcome.accuracy
      };
      
      this.modelData.sharedInsights.set(`insight_${Date.now()}`, insight);
    }
  }

  determineApplicableAgents(prediction) {
    // Logic to determine which other agents could benefit from this insight
    return ['web-frontend-developer', 'web-quality-code-validator'];
  }

  async updateWithRecentData(outcomes) {
    for (const outcome of outcomes) {
      await this.updateFromOutcome(outcome.prediction, outcome);
    }
  }

  async getStatus() {
    return {
      type: 'CrossAgentLearningModel',
      sharedInsights: this.modelData.sharedInsights.size,
      crossAgentPatterns: this.modelData.crossAgentPatterns.size
    };
  }
}

module.exports = WebDevLearningFoundation;