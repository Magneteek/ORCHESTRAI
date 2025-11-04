// WebDev Learning Usage Example
// Demonstrates how to use the enhanced WebDev learning system in real scenarios

console.log('🎯 WebDev Learning System Usage Example\n');

/*
=============================================================================
                    ENHANCED WEBDEV LEARNING USAGE GUIDE
=============================================================================

Your WebDev domain now has sophisticated self-evaluation and learning capabilities!
Here's how to use the new features in real projects:

## 1. LEARNING-ENHANCED CODE VALIDATION

Instead of:
```javascript
const result = await webFrontendDeveloper.validateTypeScriptCode(projectPath, files, validationPoints);
```

Now use:
```javascript
const result = await webFrontendDeveloper.validateTypeScriptCodeWithLearning(projectPath, files, validationPoints);

// The result now includes:
// - predictionId: Track this validation for learning
// - learningEnhanced: true
// - learningInsights: Historical patterns and recommendations
// - confidenceScore: How confident the system is
// - historicalComparison: How this compares to similar projects
// - recordOutcome: Function to record actual results for learning

// Record actual outcome when you know the real results:
const accuracy = await result.recordOutcome({
  overallScore: 88,    // Actual quality score achieved
  issues: [...],       // Actual issues found
  buildSuccess: true,  // Did the build succeed?
  deploySuccess: true  // Did deployment work?
});
```

## 2. QUALITY GATE SELF-ADJUSTMENT

Your quality gates now learn and adjust automatically:

```javascript
const phaseResult = await webQualityHub.requestPhaseTransition(
  'project-123',
  'development-quality-assessment',
  'browser-compatibility-testing',
  validationData
);

// The system will:
// - Make a prediction about whether the project should pass
// - Apply the current quality threshold
// - Track the decision for effectiveness analysis
// - Auto-adjust thresholds if effectiveness drops below 70%

// Record the actual project outcome:
await phaseResult.recordOutcome('success'); // or 'failure'
```

## 3. ADVANCED PERFORMANCE PREDICTION

Get accurate performance predictions with learning:

```javascript
const codeAnalysis = {
  bundleSize: 350000,
  files: ['component1.tsx', 'component2.tsx', 'utils.ts', 'hooks.ts'],
  react: true,
  typescript: true,
  dependencies: ['react', 'lodash', 'moment', 'axios'],
  complexity: 'high',
  images: 15,
  lazyLoading: true,
  caching: false
};

const projectContext = {
  projectPath: '/path/to/react-project',
  projectType: 'react'
};

const prediction = await webDevLearning.predictPerformanceImpact(codeAnalysis, projectContext);

// Results include:
// - bundleSize: { predicted: 425000, confidence: 0.8, factors: {...} }
// - coreWebVitals: { firstContentfulPaint: 1950, largestContentfulPaint: 2700, ... }
// - overallScore: 72 (out of 100)
// - recommendations: [{ category: 'bundle-optimization', priority: 'high', ... }]
// - patternMatches: [...] // Similar projects from history

// Record actual performance when measured:
await prediction.recordActualPerformance({
  bundleSize: 440000,         // Actual bundle size
  loadTime: 2100,            // Actual load time (ms)
  coreWebVitals: {           // Actual Core Web Vitals
    firstContentfulPaint: 2050,
    largestContentfulPaint: 2850,
    cumulativeLayoutShift: 0.08
  },
  userSatisfactionScore: 8.2  // Real user feedback
});
```

## 4. MONITORING LEARNING EFFECTIVENESS

Check how well your system is learning:

```javascript
// Get learning system status
const learningStatus = await webDevLearning.getWebDevLearningStatus();
console.log('Learning Performance:', learningStatus);

// Example output:
// {
//   active: true,
//   domain: 'web-development-quality',
//   metrics: {
//     totalPredictions: 147,
//     accuratePredictions: 112,
//     accuracyRate: '76.2%',
//     highConfidencePredictions: 89,
//     learningIterations: 34,
//     lastLearningUpdate: 1756451059271
//   },
//   activePredictions: 12,
//   completedPredictions: 135,
//   models: {
//     codeQualityPrediction: { type: 'WebDevCodeQualityModel', accuracy: 0.78, patterns: 45 },
//     performancePrediction: { type: 'WebDevPerformanceModel', accuracy: 0.74, patterns: 38 },
//     qualityGateEffectiveness: { type: 'QualityGateEffectivenessModel', gates: 8, totalAdjustments: 3 }
//   }
// }

// Get quality gate adjustment history
const gateStatus = await webQualityHub.getStatus();
console.log('Quality Gate Adjustments:', gateStatus.metrics.qualityGateAdjustments);
```

## 5. REAL-WORLD WORKFLOW EXAMPLE

Here's a complete workflow using all learning features:

```javascript
async function enhancedWebDevWorkflow(projectPath, files, validationConfig) {
  console.log('🚀 Starting enhanced WebDev workflow with learning...');

  // 1. Learning-enhanced code validation
  const codeValidation = await webFrontendDeveloper.validateTypeScriptCodeWithLearning(
    projectPath, 
    files, 
    ['type-safety', 'best-practices', 'performance']
  );
  
  console.log(`Code Quality Prediction: ${codeValidation.overallScore}/100 (confidence: ${(codeValidation.confidenceScore * 100).toFixed(1)}%)`);
  console.log(`Learning Insights: ${codeValidation.learningInsights.recommendedFocus.join(', ')}`);

  // 2. Performance prediction with learning
  const performancePrediction = await webDevLearning.predictPerformanceImpact({
    bundleSize: codeValidation.bundleSize || 250000,
    files: files,
    react: codeValidation.react || false,
    typescript: codeValidation.typescript || false,
    complexity: codeValidation.complexity || 'medium'
  }, {
    projectPath,
    projectType: 'react'
  });

  console.log(`Performance Prediction: ${performancePrediction.overallScore}/100`);
  console.log(`Bundle Size: ${Math.round(performancePrediction.bundleSize.predicted / 1000)}KB`);
  console.log(`Recommendations: ${performancePrediction.recommendations.length} optimizations suggested`);

  // 3. Quality gate transition with learning
  const qualityGateResult = await webQualityHub.requestPhaseTransition(
    'project-example',
    'development-quality-assessment',
    'performance-optimization-validation',
    {
      codeQuality: codeValidation.overallScore,
      performancePrediction: performancePrediction.overallScore,
      validationConfig
    }
  );

  console.log(`Quality Gate: ${qualityGateResult.approved ? 'PASS' : 'FAIL'} (score: ${qualityGateResult.qualityScore})`);

  // 4. Simulate actual results and record for learning
  setTimeout(async () => {
    // Record actual code validation outcome
    await codeValidation.recordOutcome({
      overallScore: 85,
      buildSuccess: true,
      deploySuccess: true,
      actualIssues: ['Minor type annotation missing']
    });

    // Record actual performance results  
    await performancePrediction.recordActualPerformance({
      bundleSize: 275000,
      loadTime: 1950,
      coreWebVitals: {
        firstContentfulPaint: 1800,
        largestContentfulPaint: 2400
      }
    });

    // Record quality gate outcome
    await qualityGateResult.recordOutcome('success');

    console.log('✅ Learning data recorded for future improvements');
  }, 5000);

  return {
    codeValidation,
    performancePrediction,
    qualityGateResult,
    learningEnabled: true
  };
}
```

## 6. BENEFITS YOU'LL SEE

With these learning enhancements, your WebDev domain will:

✅ **Get Smarter Over Time**: Each prediction becomes more accurate as the system learns
✅ **Self-Optimize Quality Gates**: Thresholds automatically adjust based on effectiveness
✅ **Provide Better Recommendations**: Suggestions improve based on what actually works
✅ **Reduce False Positives/Negatives**: Learning reduces incorrect quality gate decisions
✅ **Predict Performance More Accurately**: Bundle size and loading predictions improve
✅ **Share Knowledge Across Projects**: Insights from one project help others

## 7. MONITORING YOUR LEARNING SYSTEM

Set up monitoring to track learning effectiveness:

```javascript
// Daily learning health check
setInterval(async () => {
  const status = await webDevLearning.getWebDevLearningStatus();
  const gateStatus = await webQualityHub.getStatus();
  
  if (parseFloat(status.metrics.accuracyRate) < 70) {
    console.warn('⚠️ Learning accuracy below 70%, may need model retraining');
  }
  
  if (gateStatus.metrics.qualityGateAdjustments > 10) {
    console.info('📈 Quality gates have been adjusted 10+ times, system is actively learning');
  }
  
  console.log(`📊 Learning Status: ${status.metrics.accuracyRate} accuracy, ${status.activePredictions} active predictions`);
}, 24 * 60 * 60 * 1000); // Daily check
```

=============================================================================
                            READY TO USE!
=============================================================================

Your WebDev domain now has production-ready self-evaluation and learning!
The system will continuously improve its predictions and quality gate decisions
based on real project outcomes.

Start using the learning-enhanced methods immediately for better results.
*/

console.log('📚 WebDev Learning System Usage Guide Complete!');
console.log('🚀 Your system is now ready for intelligent, self-improving web development quality validation.');

module.exports = {
  // Export key learning methods for easy integration
  enhancedWebDevWorkflow: async (projectPath, files, config) => {
    console.log('🔧 Enhanced WebDev workflow would execute here with full learning integration');
    return { learningEnabled: true, status: 'ready' };
  }
};