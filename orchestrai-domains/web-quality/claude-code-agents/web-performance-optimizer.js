const { Task } = require('../../../../orchestrai-shared/utils/task-delegation');

class WebPerformanceOptimizer {
  constructor(orchestrator, crystallineMemory) {
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.agentId = 'web-performance-optimizer';
    this.specialization = 'web-performance-analysis-and-optimization';
    
    this.performanceThresholds = {
      coreWebVitals: {
        lcp: { good: 2500, needsImprovement: 4000 },
        fid: { good: 100, needsImprovement: 300 },
        cls: { good: 0.1, needsImprovement: 0.25 },
        fcp: { good: 1800, needsImprovement: 3000 },
        ttfb: { good: 800, needsImprovement: 1800 }
      },
      lighthouseScores: {
        performance: { good: 90, acceptable: 70 },
        accessibility: { good: 95, acceptable: 85 },
        bestPractices: { good: 95, acceptable: 85 },
        seo: { good: 95, acceptable: 85 }
      }
    };

    this.optimizationStrategies = [
      'critical-resource-prioritization',
      'code-splitting-optimization',
      'image-optimization',
      'caching-strategy-enhancement',
      'javascript-execution-optimization',
      'css-delivery-optimization'
    ];
  }

  async analyzePerformanceOptimizations(url, performanceData, analysisPoints) {
    try {
      console.log(`⚡ Analyzing performance optimizations for: ${url}`);
      
      const task = new Task({
        prompt: `As a web performance expert, analyze performance optimization opportunities for ${url}.

PERFORMANCE DATA:
${JSON.stringify(performanceData, null, 2)}

ANALYSIS POINTS: ${analysisPoints.join(', ')}

PERFORMANCE THRESHOLDS:
${JSON.stringify(this.performanceThresholds, null, 2)}

PERFORMANCE OPTIMIZATION ANALYSIS:
- Core Web Vitals improvement opportunities
- Bundle size optimization strategies
- Image optimization and delivery improvements
- Caching strategy enhancements
- Critical render path optimization
- JavaScript execution optimization

CORE WEB VITALS OPTIMIZATION:
- Largest Contentful Paint (LCP) improvements
- First Input Delay (FID) optimization
- Cumulative Layout Shift (CLS) prevention
- First Contentful Paint (FCP) acceleration
- Time to First Byte (TTFB) reduction

RESOURCE OPTIMIZATION:
- Critical resource identification and prioritization
- Non-critical resource deferral strategies
- Resource preloading and prefetching opportunities
- Third-party resource impact analysis
- CDN utilization optimization

RENDERING OPTIMIZATION:
- Critical render path analysis and improvements
- Render-blocking resource elimination
- Above-the-fold content prioritization
- Progressive rendering implementation
- Layout shift prevention strategies

Generate actionable optimization recommendations with expected performance impact and implementation complexity.`,
        subagent_type: 'general-purpose'
      });

      const optimizationAnalysis = await this.orchestrator.delegateTask(task);
      
      await this.crystallineMemory.store('performance-benchmarks', {
        type: 'performance-optimization-analysis',
        agentId: this.agentId,
        url,
        analysis: optimizationAnalysis,
        timestamp: Date.now()
      });

      return {
        bundleSize: optimizationAnalysis.bundleSize || [],
        imageOptimization: optimizationAnalysis.imageOptimization || [],
        caching: optimizationAnalysis.caching || [],
        criticalRenderPath: optimizationAnalysis.criticalRenderPath || [],
        jsOptimization: optimizationAnalysis.jsOptimization || [],
        cssOptimization: optimizationAnalysis.cssOptimization || [],
        prioritizedRecommendations: optimizationAnalysis.prioritizedRecommendations || [],
        estimatedImpact: optimizationAnalysis.estimatedImpact || {}
      };
    } catch (error) {
      console.error('Performance optimization analysis failed:', error);
      throw error;
    }
  }

  async detectPerformanceRegression(currentResults, historicalData, regressionThresholds) {
    try {
      const task = new Task({
        prompt: `Detect performance regressions by comparing current results with historical data.

CURRENT RESULTS:
${JSON.stringify(currentResults, null, 2)}

HISTORICAL DATA:
${JSON.stringify(historicalData.slice(0, 5), null, 2)} (showing last 5 entries)

REGRESSION THRESHOLDS:
${JSON.stringify(regressionThresholds, null, 2)}

PERFORMANCE REGRESSION ANALYSIS:
- Performance score trend analysis
- Core Web Vitals regression detection
- Load time variance analysis
- Resource size regression identification
- User experience impact assessment

REGRESSION DETECTION CRITERIA:
- Performance score decrease beyond threshold
- Core Web Vital metrics degradation
- Load time increase above acceptable variance
- Bundle size growth beyond limits
- Resource count or size inflation

TREND ANALYSIS:
- Short-term performance trends (last 5-10 measurements)
- Medium-term performance patterns
- Seasonal or cyclical performance variations
- Performance stability assessment
- Improvement opportunity identification

IMPACT ASSESSMENT:
- User experience impact of detected regressions
- Business metrics correlation
- Device-specific regression impacts
- Network condition sensitivity analysis
- Competitive performance comparison

Generate detailed regression analysis with root cause hypotheses and remediation strategies.`,
        subagent_type: 'general-purpose'
      });

      const regressionAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        regressionDetected: regressionAnalysis.regressionDetected || false,
        regressionDetails: regressionAnalysis.regressionDetails || {},
        trend: regressionAnalysis.trend || 'stable',
        rootCauseHypotheses: regressionAnalysis.rootCauseHypotheses || [],
        recommendations: regressionAnalysis.recommendations || [],
        impactAssessment: regressionAnalysis.impactAssessment || {}
      };
    } catch (error) {
      console.error('Performance regression detection failed:', error);
      throw error;
    }
  }

  async optimizeCriticalRenderPath(url, renderingData) {
    try {
      const task = new Task({
        prompt: `Optimize the critical render path for improved performance at ${url}.

RENDERING DATA:
${JSON.stringify(renderingData, null, 2)}

CRITICAL RENDER PATH OPTIMIZATION:
- HTML parsing and DOM construction optimization
- CSS parsing and CSSOM construction improvements
- JavaScript execution timing optimization
- Render tree construction efficiency
- Layout and paint optimization

OPTIMIZATION STRATEGIES:
- Critical CSS inlining and above-the-fold prioritization
- Non-critical CSS deferral and async loading
- JavaScript loading strategy optimization (defer, async, module)
- Resource hint implementation (preload, prefetch, preconnect)
- Font display optimization and loading strategies

RENDERING PERFORMANCE ANALYSIS:
- Render-blocking resource identification
- Critical resource dependency analysis
- Waterfall optimization opportunities
- Progressive rendering implementation
- First paint and first contentful paint acceleration

ADVANCED OPTIMIZATIONS:
- Service worker implementation for caching
- HTTP/2 push optimization
- Resource bundling vs splitting trade-offs
- Third-party resource impact mitigation
- Progressive web app features for performance

Generate comprehensive render path optimization plan with implementation priorities and expected gains.`,
        subagent_type: 'general-purpose'
      });

      const renderOptimization = await this.orchestrator.delegateTask(task);
      
      return {
        criticalResourceOptimization: renderOptimization.criticalResourceOptimization || [],
        cssOptimizationStrategies: renderOptimization.cssOptimizationStrategies || [],
        jsLoadingOptimization: renderOptimization.jsLoadingOptimization || [],
        resourceHintImplementation: renderOptimization.resourceHintImplementation || [],
        progressiveRenderingImprovements: renderOptimization.progressiveRenderingImprovements || [],
        estimatedPerformanceGains: renderOptimization.estimatedPerformanceGains || {},
        implementationComplexity: renderOptimization.implementationComplexity || {}
      };
    } catch (error) {
      console.error('Critical render path optimization failed:', error);
      throw error;
    }
  }

  async analyzeBundleOptimization(url, bundleAnalysisData) {
    try {
      const task = new Task({
        prompt: `Analyze bundle optimization opportunities for improved performance.

URL: ${url}
BUNDLE ANALYSIS DATA:
${JSON.stringify(bundleAnalysisData, null, 2)}

BUNDLE OPTIMIZATION ANALYSIS:
- Bundle size analysis and splitting opportunities
- Tree shaking effectiveness evaluation
- Dead code elimination opportunities
- Vendor chunk optimization strategies
- Dynamic import implementation assessment

BUNDLE SIZE OPTIMIZATION:
- Large library identification and alternatives
- Unused code detection and removal
- Module federation opportunities
- Micro-frontend bundle strategies
- Progressive loading implementation

CODE SPLITTING STRATEGIES:
- Route-based splitting effectiveness
- Component-based splitting opportunities
- Feature-based splitting potential
- Vendor library splitting optimization
- Critical vs non-critical code separation

DEPENDENCY OPTIMIZATION:
- Heavy dependency analysis and replacements
- Duplicate dependency identification
- Peer dependency optimization
- Development vs production dependency separation
- Polyfill optimization and targeting

LOADING STRATEGY OPTIMIZATION:
- Lazy loading implementation effectiveness
- Preloading strategy optimization
- Caching strategy alignment with splitting
- Service worker integration for bundles
- HTTP/2 push optimization for critical bundles

Generate detailed bundle optimization plan with size reduction estimates and implementation guidance.`,
        subagent_type: 'general-purpose'
      });

      const bundleOptimization = await this.orchestrator.delegateTask(task);
      
      return {
        currentBundleAnalysis: bundleOptimization.currentBundleAnalysis || {},
        optimizationOpportunities: bundleOptimization.optimizationOpportunities || [],
        codeSplittingStrategy: bundleOptimization.codeSplittingStrategy || [],
        dependencyOptimizations: bundleOptimization.dependencyOptimizations || [],
        estimatedSizeReduction: bundleOptimization.estimatedSizeReduction || {},
        implementationPriority: bundleOptimization.implementationPriority || [],
        performanceImpactProjection: bundleOptimization.performanceImpactProjection || {}
      };
    } catch (error) {
      console.error('Bundle optimization analysis failed:', error);
      throw error;
    }
  }

  async optimizeImageDelivery(url, imageAnalysisData) {
    try {
      const task = new Task({
        prompt: `Optimize image delivery and performance for ${url}.

IMAGE ANALYSIS DATA:
${JSON.stringify(imageAnalysisData, null, 2)}

IMAGE OPTIMIZATION ANALYSIS:
- Image format optimization (WebP, AVIF adoption)
- Image sizing and responsive image implementation
- Lazy loading effectiveness and improvements
- CDN utilization for image delivery
- Image compression optimization

MODERN IMAGE FORMATS:
- WebP conversion opportunities and fallbacks
- AVIF implementation for cutting-edge browsers
- SVG optimization for icons and simple graphics
- Progressive JPEG implementation
- Lossless vs lossy compression trade-offs

RESPONSIVE IMAGES:
- srcset and sizes attribute optimization
- Picture element implementation effectiveness
- Art direction and cropping strategies
- Density-specific image serving
- Breakpoint-specific image optimization

LOADING OPTIMIZATION:
- Above-the-fold image prioritization
- Lazy loading implementation and intersection observer usage
- Image preloading for critical images
- Progressive image loading techniques
- Skeleton screens and placeholders

DELIVERY OPTIMIZATION:
- CDN configuration for optimal image delivery
- Image caching strategies
- Adaptive image delivery based on connection speed
- Client hints implementation
- Service worker image caching strategies

Generate comprehensive image optimization strategy with expected performance improvements and implementation timeline.`,
        subagent_type: 'general-purpose'
      });

      const imageOptimization = await this.orchestrator.delegateTask(task);
      
      return {
        formatOptimizationOpportunities: imageOptimization.formatOptimizationOpportunities || [],
        responsiveImageImprovements: imageOptimization.responsiveImageImprovements || [],
        loadingStrategyOptimizations: imageOptimization.loadingStrategyOptimizations || [],
        deliveryOptimizations: imageOptimization.deliveryOptimizations || [],
        compressionImprovements: imageOptimization.compressionImprovements || [],
        estimatedBandwidthSavings: imageOptimization.estimatedBandwidthSavings || {},
        implementationComplexity: imageOptimization.implementationComplexity || {}
      };
    } catch (error) {
      console.error('Image delivery optimization failed:', error);
      throw error;
    }
  }

  async generatePerformanceOptimizationPlan(url, allOptimizationData) {
    try {
      const task = new Task({
        prompt: `Generate a comprehensive performance optimization plan for ${url}.

ALL OPTIMIZATION DATA:
${JSON.stringify(allOptimizationData, null, 2)}

PERFORMANCE OPTIMIZATION PLAN:
- Prioritized optimization roadmap
- Quick wins vs long-term improvements
- Resource allocation and implementation timeline
- Expected performance impact quantification
- Success metrics and monitoring plan

OPTIMIZATION PRIORITIZATION:
- High-impact, low-effort optimizations (Quick wins)
- Medium-impact, medium-effort improvements
- High-impact, high-effort strategic optimizations
- Maintenance and monitoring requirements
- Risk assessment for each optimization

IMPLEMENTATION ROADMAP:
- Phase 1: Critical performance fixes (0-2 weeks)
- Phase 2: Core optimization implementation (2-8 weeks)
- Phase 3: Advanced optimization and monitoring (8+ weeks)
- Dependencies and prerequisite identification
- Resource requirements and team responsibilities

SUCCESS METRICS:
- Core Web Vitals improvement targets
- Lighthouse score improvement goals
- User experience metric improvements
- Business impact measurements (conversion, engagement)
- Monitoring and alerting setup requirements

RISK MITIGATION:
- A/B testing strategies for performance changes
- Rollback plans for optimization implementations
- Progressive deployment strategies
- Performance regression prevention
- Monitoring and alerting for performance degradation

Generate actionable optimization plan with clear timelines, responsibilities, and success criteria.`,
        subagent_type: 'general-purpose'
      });

      const optimizationPlan = await this.orchestrator.delegateTask(task);
      
      await this.crystallineMemory.store('performance-benchmarks', {
        type: 'performance-optimization-plan',
        agentId: this.agentId,
        url,
        plan: optimizationPlan,
        timestamp: Date.now()
      });

      return {
        executiveSummary: optimizationPlan.executiveSummary || {},
        prioritizedOptimizations: optimizationPlan.prioritizedOptimizations || [],
        implementationRoadmap: optimizationPlan.implementationRoadmap || [],
        expectedImpact: optimizationPlan.expectedImpact || {},
        successMetrics: optimizationPlan.successMetrics || [],
        riskMitigation: optimizationPlan.riskMitigation || [],
        monitoringPlan: optimizationPlan.monitoringPlan || []
      };
    } catch (error) {
      console.error('Performance optimization plan generation failed:', error);
      throw error;
    }
  }

  getCapabilities() {
    return {
      agentId: this.agentId,
      specialization: this.specialization,
      performanceThresholds: this.performanceThresholds,
      optimizationStrategies: this.optimizationStrategies,
      capabilities: [
        'performance-optimization-analysis',
        'performance-regression-detection',
        'critical-render-path-optimization',
        'bundle-optimization-analysis',
        'image-delivery-optimization',
        'performance-optimization-planning'
      ]
    };
  }

  getStatus() {
    return {
      agentId: this.agentId,
      type: 'claude-code-agent',
      specialization: this.specialization,
      active: true,
      lastActivity: Date.now()
    };
  }
}

module.exports = WebPerformanceOptimizer;