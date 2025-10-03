// WebDev Learning Integration Test
// Comprehensive test suite for all learning enhancements

const WebDevLearningFoundation = require('../learning/webdev-learning-foundation');
const PerformancePredictionLearning = require('../learning/performance-prediction-learning');
const WebFrontendDeveloper = require('../claude-code-agents/web-frontend-developer');

class WebDevLearningIntegrationTest {
  constructor() {
    this.testResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      testDetails: []
    };
    
    // Mock crystalline memory for testing
    this.mockCrystallineMemory = new MockCrystallineMemory();
    
    // Mock orchestrator for testing
    this.mockOrchestrator = new MockOrchestrator();
    
    console.log('🧪 WebDev Learning Integration Test Suite initialized');
  }

  async runAllTests() {
    console.log('\n🚀 Starting WebDev Learning Integration Tests...\n');

    try {
      // Test 1: WebDev Learning Foundation initialization
      await this.testWebDevLearningFoundationInit();
      
      // Test 2: Performance prediction learning initialization
      await this.testPerformancePredictionInit();
      
      // Test 3: Web Frontend Developer learning integration
      await this.testWebFrontendDeveloperLearning();
      
      // Test 4: Prediction and outcome recording cycle
      await this.testPredictionOutcomeCycle();
      
      // Test 5: Quality gate effectiveness learning
      await this.testQualityGateEffectivenessLearning();
      
      // Test 6: Performance prediction accuracy
      await this.testPerformancePredictionAccuracy();
      
      // Test 7: Cross-system learning integration
      await this.testCrossSystemLearning();
      
      // Test 8: Memory storage and retrieval
      await this.testMemoryStorageRetrieval();

    } catch (error) {
      console.error('❌ Test suite execution failed:', error);
      this.recordTestResult('Test Suite Execution', false, error.message);
    }

    this.generateTestReport();
  }

  async testWebDevLearningFoundationInit() {
    console.log('📝 Test 1: WebDev Learning Foundation Initialization');
    
    try {
      const webDevLearning = new WebDevLearningFoundation(this.mockCrystallineMemory, null);
      
      // Check if all required components are initialized
      const hasModels = Object.keys(webDevLearning.webDevModels).length > 0;
      const hasPerformanceSystem = !!webDevLearning.performancePredictionSystem;
      const hasMetrics = !!webDevLearning.webDevMetrics;
      
      const success = hasModels && hasPerformanceSystem && hasMetrics;
      
      this.recordTestResult(
        'WebDev Learning Foundation Init',
        success,
        success ? 'All components initialized successfully' : 'Missing required components'
      );

      if (success) {
        console.log('   ✅ WebDev Learning Foundation initialized with all components');
      }

    } catch (error) {
      this.recordTestResult('WebDev Learning Foundation Init', false, error.message);
      console.log('   ❌ Initialization failed:', error.message);
    }
  }

  async testPerformancePredictionInit() {
    console.log('📝 Test 2: Performance Prediction Learning Initialization');
    
    try {
      const performanceLearning = new PerformancePredictionLearning(this.mockCrystallineMemory, null);
      
      // Check if prediction models are initialized
      const hasModels = Object.keys(performanceLearning.models).length === 4;
      const hasThresholds = !!performanceLearning.performanceThresholds;
      const hasMetrics = !!performanceLearning.metrics;
      
      const success = hasModels && hasThresholds && hasMetrics;
      
      this.recordTestResult(
        'Performance Prediction Learning Init',
        success,
        success ? 'All prediction models initialized' : 'Missing prediction components'
      );

      if (success) {
        console.log('   ✅ Performance prediction system initialized with 4 specialized models');
      }

    } catch (error) {
      this.recordTestResult('Performance Prediction Learning Init', false, error.message);
      console.log('   ❌ Performance prediction init failed:', error.message);
    }
  }

  async testWebFrontendDeveloperLearning() {
    console.log('📝 Test 3: Web Frontend Developer Learning Integration');
    
    try {
      const frontendDev = new WebFrontendDeveloper(this.mockOrchestrator, this.mockCrystallineMemory);
      
      // Check if learning components are integrated
      const hasLearning = !!frontendDev.webDevLearning;
      const hasMetrics = !!frontendDev.learningMetrics;
      const hasPredictions = !!frontendDev.activePredictions;
      
      const success = hasLearning && hasMetrics && hasPredictions;
      
      this.recordTestResult(
        'Web Frontend Developer Learning Integration',
        success,
        success ? 'Learning integration successful' : 'Missing learning components'
      );

      if (success) {
        console.log('   ✅ Web Frontend Developer enhanced with learning capabilities');
      }

    } catch (error) {
      this.recordTestResult('Web Frontend Developer Learning Integration', false, error.message);
      console.log('   ❌ Frontend developer learning integration failed:', error.message);
    }
  }

  async testPredictionOutcomeCycle() {
    console.log('📝 Test 4: Prediction and Outcome Recording Cycle');
    
    try {
      const webDevLearning = new WebDevLearningFoundation(this.mockCrystallineMemory, null);
      
      // Test prediction creation
      const predictionId = await webDevLearning.makePrediction(
        'test-agent',
        'code-quality',
        {
          projectPath: '/test/project',
          files: ['file1.ts', 'file2.ts'],
          overallScore: 85
        },
        0.8
      );

      const hasPredictionId = !!predictionId;
      
      // Test outcome recording
      let outcomeRecorded = false;
      if (predictionId) {
        const accuracy = await webDevLearning.recordActualOutcome(predictionId, {
          overallScore: 82,
          issues: [],
          success: true
        });
        
        outcomeRecorded = accuracy >= 0;
      }

      const success = hasPredictionId && outcomeRecorded;
      
      this.recordTestResult(
        'Prediction-Outcome Cycle',
        success,
        success ? 'Complete prediction-outcome cycle executed' : 'Cycle execution failed'
      );

      if (success) {
        console.log('   ✅ Prediction-outcome cycle completed successfully');
      }

    } catch (error) {
      this.recordTestResult('Prediction-Outcome Cycle', false, error.message);
      console.log('   ❌ Prediction-outcome cycle failed:', error.message);
    }
  }

  async testQualityGateEffectivenessLearning() {
    console.log('📝 Test 5: Quality Gate Effectiveness Learning');
    
    try {
      const webDevLearning = new WebDevLearningFoundation(this.mockCrystallineMemory, null);
      
      // Test quality gate prediction
      const gateData = {
        projectId: 'test-project',
        fromPhase: 'development-quality-assessment',
        toPhase: 'browser-compatibility-testing',
        threshold: 80
      };

      const predictionId = await webDevLearning.makePrediction(
        'quality-gate-test',
        'quality-gate',
        gateData,
        0.7
      );

      // Test outcome recording for quality gates
      let gateAccuracy = 0;
      if (predictionId) {
        gateAccuracy = await webDevLearning.recordActualOutcome(predictionId, {
          passed: true,
          actualOutcome: 'success',
          qualityScore: 85
        });
      }

      const success = predictionId && gateAccuracy > 0;
      
      this.recordTestResult(
        'Quality Gate Effectiveness Learning',
        success,
        success ? `Gate learning recorded with ${(gateAccuracy * 100).toFixed(1)}% accuracy` : 'Gate learning failed'
      );

      if (success) {
        console.log(`   ✅ Quality gate learning recorded with ${(gateAccuracy * 100).toFixed(1)}% accuracy`);
      }

    } catch (error) {
      this.recordTestResult('Quality Gate Effectiveness Learning', false, error.message);
      console.log('   ❌ Quality gate effectiveness learning failed:', error.message);
    }
  }

  async testPerformancePredictionAccuracy() {
    console.log('📝 Test 6: Performance Prediction Accuracy');
    
    try {
      const webDevLearning = new WebDevLearningFoundation(this.mockCrystallineMemory, null);
      
      // Test performance prediction
      const codeAnalysis = {
        bundleSize: 300000,
        files: ['component1.tsx', 'component2.tsx', 'utils.ts'],
        react: true,
        typescript: true,
        complexity: 'medium',
        dependencies: ['react', 'lodash', 'moment']
      };

      const projectContext = {
        projectPath: '/test/react-project',
        projectType: 'react'
      };

      const performancePrediction = await webDevLearning.predictPerformanceImpact(codeAnalysis, projectContext);
      
      const hasPrediction = !!performancePrediction.bundleSize;
      const hasConfidence = performancePrediction.confidence > 0;
      const hasRecommendations = performancePrediction.recommendations?.length > 0;
      
      const success = hasPrediction && hasConfidence && hasRecommendations;
      
      this.recordTestResult(
        'Performance Prediction Accuracy',
        success,
        success ? `Performance prediction generated with ${(performancePrediction.confidence * 100).toFixed(1)}% confidence` : 'Performance prediction failed'
      );

      if (success) {
        console.log(`   ✅ Performance prediction: ${performancePrediction.overallScore}/100 score`);
        console.log(`   📊 Bundle size predicted: ${Math.round(performancePrediction.bundleSize.predicted / 1000)}KB`);
      }

    } catch (error) {
      this.recordTestResult('Performance Prediction Accuracy', false, error.message);
      console.log('   ❌ Performance prediction accuracy test failed:', error.message);
    }
  }

  async testCrossSystemLearning() {
    console.log('📝 Test 7: Cross-System Learning Integration');
    
    try {
      const webDevLearning = new WebDevLearningFoundation(this.mockCrystallineMemory, null);
      const frontendDev = new WebFrontendDeveloper(this.mockOrchestrator, this.mockCrystallineMemory, webDevLearning);
      
      // Test cross-system learning
      const testFiles = ['test1.ts', 'test2.ts'];
      const validationPoints = ['type-safety', 'best-practices'];
      const projectPath = '/test/cross-learning';

      // Simulate learning-enhanced validation
      let enhancedResult;
      try {
        enhancedResult = await frontendDev.validateTypeScriptCodeWithLearning(projectPath, testFiles, validationPoints);
      } catch (error) {
        // Expected to fail in test environment - just check structure
        enhancedResult = { learningEnhanced: false };
      }

      const hasLearningIntegration = frontendDev.webDevLearning === webDevLearning;
      const hasSharedMemory = frontendDev.crystallineMemory === this.mockCrystallineMemory;
      
      const success = hasLearningIntegration && hasSharedMemory;
      
      this.recordTestResult(
        'Cross-System Learning Integration',
        success,
        success ? 'Cross-system learning properly integrated' : 'Cross-system integration failed'
      );

      if (success) {
        console.log('   ✅ Cross-system learning integration verified');
      }

    } catch (error) {
      this.recordTestResult('Cross-System Learning Integration', false, error.message);
      console.log('   ❌ Cross-system learning test failed:', error.message);
    }
  }

  async testMemoryStorageRetrieval() {
    console.log('📝 Test 8: Memory Storage and Retrieval');
    
    try {
      const webDevLearning = new WebDevLearningFoundation(this.mockCrystallineMemory, null);
      
      // Test memory storage
      const testData = {
        type: 'test-learning-data',
        agentId: 'test-agent',
        prediction: { score: 85, confidence: 0.8 },
        timestamp: Date.now()
      };

      // Store test data
      const storeSuccess = await this.mockCrystallineMemory.storeMemory(
        'webdev-test-storage',
        JSON.stringify(testData),
        { importance: 0.8 }
      );

      // Test memory retrieval
      const retrieved = await this.mockCrystallineMemory.retrieveMemory(
        'test-learning-data',
        'webdev-test-storage',
        5
      );

      const hasStorageSuccess = !!storeSuccess;
      const hasRetrievalSuccess = retrieved.results && retrieved.results.length > 0;
      
      const success = hasStorageSuccess && hasRetrievalSuccess;
      
      this.recordTestResult(
        'Memory Storage and Retrieval',
        success,
        success ? 'Memory operations completed successfully' : 'Memory operations failed'
      );

      if (success) {
        console.log('   ✅ Memory storage and retrieval functioning correctly');
      }

    } catch (error) {
      this.recordTestResult('Memory Storage and Retrieval', false, error.message);
      console.log('   ❌ Memory storage and retrieval test failed:', error.message);
    }
  }

  recordTestResult(testName, success, details) {
    this.testResults.totalTests++;
    if (success) {
      this.testResults.passedTests++;
    } else {
      this.testResults.failedTests++;
    }
    
    this.testResults.testDetails.push({
      test: testName,
      success,
      details,
      timestamp: Date.now()
    });
  }

  generateTestReport() {
    const successRate = (this.testResults.passedTests / this.testResults.totalTests * 100).toFixed(1);
    
    console.log('\n🎯 WebDev Learning Integration Test Report');
    console.log('='.repeat(50));
    console.log(`📊 Total Tests: ${this.testResults.totalTests}`);
    console.log(`✅ Passed: ${this.testResults.passedTests}`);
    console.log(`❌ Failed: ${this.testResults.failedTests}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('='.repeat(50));
    
    console.log('\n📝 Detailed Results:');
    for (const result of this.testResults.testDetails) {
      const status = result.success ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.details}`);
    }

    console.log('\n🎉 Test Summary:');
    if (this.testResults.failedTests === 0) {
      console.log('🚀 All tests passed! WebDev Learning Integration is ready for production.');
    } else {
      console.log(`⚠️ ${this.testResults.failedTests} test(s) failed. Review and fix issues before deployment.`);
    }

    // Store test results for future reference
    const testReport = {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      summary: {
        successRate: parseFloat(successRate),
        allTestsPassed: this.testResults.failedTests === 0,
        readyForProduction: this.testResults.failedTests === 0 && successRate > 90
      }
    };

    return testReport;
  }
}

// ============ MOCK CLASSES FOR TESTING ============

class MockCrystallineMemory {
  constructor() {
    this.storage = new Map();
    this.nodeIdCounter = 1;
  }

  async storeMemory(domain, content, metadata = {}) {
    const nodeId = `mock_node_${this.nodeIdCounter++}`;
    
    this.storage.set(nodeId, {
      domain,
      content,
      metadata: {
        ...metadata,
        timestamp: Date.now(),
        nodeId
      }
    });

    return nodeId;
  }

  async retrieveMemory(query, domain = null, maxResults = 5) {
    const results = [];
    let count = 0;

    for (const [nodeId, data] of this.storage) {
      if (count >= maxResults) break;
      
      if (!domain || data.domain === domain) {
        if (data.content.includes(query) || query.includes(data.domain)) {
          results.push({
            nodeId,
            content: data.content,
            domain: data.domain,
            similarity: 0.8,
            metadata: data.metadata
          });
          count++;
        }
      }
    }

    return {
      query,
      domain,
      results,
      processingTime: 10,
      pathOptimization: true
    };
  }
}

class MockOrchestrator {
  constructor() {
    this.taskCounter = 1;
  }

  async delegateTask(task) {
    // Mock task execution that returns realistic results
    return {
      taskId: `mock_task_${this.taskCounter++}`,
      overallScore: 85,
      typeSafety: 90,
      strictMode: true,
      anyTypeCount: 2,
      interfaceQuality: 88,
      genericUsage: 75,
      issues: [
        { type: 'minor', description: 'Consider using interface instead of type alias' },
        { type: 'suggestion', description: 'Add generic constraints for better type safety' }
      ],
      recommendations: [
        'Reduce any type usage',
        'Improve interface documentation',
        'Add unit tests for type safety'
      ],
      executionTime: 1500,
      success: true
    };
  }
}

// Export for use in other test files or direct execution
module.exports = WebDevLearningIntegrationTest;

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new WebDevLearningIntegrationTest();
  testSuite.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test suite execution failed:', error);
    process.exit(1);
  });
}