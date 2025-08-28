const { Task } = require('../../../../orchestrai-shared/utils/task-delegation');

class WebResponsiveDesignAgent {
  constructor(orchestrator, crystallineMemory) {
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.agentId = 'web-responsive-design-agent';
    this.specialization = 'responsive-design-optimization';
    
    this.responsiveDesignPrinciples = [
      'mobile-first-approach',
      'flexible-grid-systems',
      'fluid-typography',
      'scalable-media',
      'touch-friendly-interfaces',
      'progressive-enhancement'
    ];
    
    this.deviceCategories = {
      mobile: { minWidth: 320, maxWidth: 767, touchInterface: true },
      tablet: { minWidth: 768, maxWidth: 1023, touchInterface: true },
      desktop: { minWidth: 1024, maxWidth: 1920, touchInterface: false },
      largeDesktop: { minWidth: 1921, maxWidth: 4000, touchInterface: false }
    };

    this.touchTargetGuidelines = {
      minimum: 44, // iOS/Android minimum
      recommended: 48, // Material Design
      spacing: 8 // Minimum spacing between targets
    };
  }

  async analyzeMobileOptimization(breakpoint, testResult, analysisPoints) {
    try {
      console.log(`📱 Analyzing mobile optimization for ${breakpoint}px breakpoint`);
      
      const task = new Task({
        prompt: `As a responsive design expert, analyze mobile optimization for a ${breakpoint}px breakpoint.

TEST RESULT DATA:
${JSON.stringify(testResult, null, 2)}

ANALYSIS POINTS: ${analysisPoints.join(', ')}

MOBILE OPTIMIZATION EVALUATION:
- Touch target sizes and spacing adequacy
- Font readability at mobile sizes
- Content prioritization and hierarchy
- Navigation usability on touch devices
- Loading performance on mobile networks
- Viewport configuration optimization

TOUCH INTERFACE ANALYSIS:
- Touch target minimum size compliance (44px minimum)
- Touch target spacing adequacy (8px minimum)
- Gesture support implementation
- Touch feedback and visual states
- Accidental tap prevention
- One-handed usage considerations

CONTENT OPTIMIZATION:
- Content hierarchy effectiveness on small screens
- Information architecture adaptation
- Progressive disclosure implementation
- Thumb-friendly navigation placement
- Form input optimization for mobile

Apply mobile-first design principles and provide specific optimization recommendations.`,
        subagent_type: 'general-purpose'
      });

      const mobileAnalysis = await this.orchestrator.delegateTask(task);
      
      await this.crystallineMemory.store('browser-compatibility-matrix', {
        type: 'mobile-optimization-analysis',
        agentId: this.agentId,
        breakpoint,
        analysis: mobileAnalysis,
        timestamp: Date.now()
      });

      return {
        optimizationScore: mobileAnalysis.optimizationScore || 0,
        touchTargets: mobileAnalysis.touchTargets || {},
        fonts: mobileAnalysis.fonts || {},
        contentPriority: mobileAnalysis.contentPriority || {},
        navigation: mobileAnalysis.navigation || {},
        performance: mobileAnalysis.performance || {},
        issues: mobileAnalysis.issues || [],
        recommendations: mobileAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Mobile optimization analysis failed:', error);
      throw error;
    }
  }

  async validateTouchInterface(url, testCriteria) {
    try {
      const task = new Task({
        prompt: `Validate touch interface design for ${url}.

TOUCH INTERFACE CRITERIA:
${JSON.stringify(testCriteria, null, 2)}

TOUCH TARGET GUIDELINES:
${JSON.stringify(this.touchTargetGuidelines, null, 2)}

TOUCH INTERFACE VALIDATION:
- Touch target size compliance (minimum 44px x 44px)
- Touch target spacing adequacy (minimum 8px between targets)
- Gesture recognition and support
- Touch feedback mechanisms
- Hover state alternatives for touch devices
- Accidental activation prevention

INTERACTION VALIDATION:
- Primary touch targets prominence and accessibility
- Secondary action placement and discoverability
- Form input touch optimization
- Navigation gesture support
- Scroll and swipe behavior validation
- Touch-friendly dropdown and modal interactions

ACCESSIBILITY CONSIDERATIONS:
- Touch target contrast ratios
- Voice control compatibility
- Switch control support
- AssistiveTouch compatibility

Generate comprehensive touch interface assessment with specific improvement recommendations.`,
        subagent_type: 'general-purpose'
      });

      const touchValidation = await this.orchestrator.delegateTask(task);
      
      return {
        touchTargetCompliance: touchValidation.touchTargetCompliance || 0,
        gestures: touchValidation.gestures || {},
        feedback: touchValidation.feedback || {},
        hoverStates: touchValidation.hoverStates || {},
        recommendations: touchValidation.recommendations || []
      };
    } catch (error) {
      console.error('Touch interface validation failed:', error);
      throw error;
    }
  }

  async analyzeResponsiveContentFlow(url, breakpoints, analysisPoints) {
    try {
      const task = new Task({
        prompt: `Analyze responsive content flow across breakpoints for ${url}.

BREAKPOINTS: ${breakpoints.join(', ')}px
ANALYSIS POINTS: ${analysisPoints.join(', ')}

RESPONSIVE CONTENT FLOW ANALYSIS:
- Content hierarchy consistency across breakpoints
- Reading flow optimization for different screen sizes
- Information architecture adaptation strategies
- CTA prominence maintenance across devices
- Media content scaling and optimization

CONTENT ADAPTATION EVALUATION:
- Progressive disclosure implementation
- Content reordering for mobile contexts
- Navigation pattern transitions
- Form layout optimization across breakpoints
- Typography scaling and readability maintenance

INFORMATION ARCHITECTURE:
- Content prioritization for limited screen real estate
- Navigation hierarchy adaptation
- Search functionality responsive behavior
- Breadcrumb implementation across devices
- Footer content organization and accessibility

Apply responsive design best practices:
- Mobile-first content strategy
- Progressive enhancement principles
- Performance-conscious media handling
- Accessibility maintenance across breakpoints

Provide detailed content flow assessment with breakpoint-specific recommendations.`,
        subagent_type: 'general-purpose'
      });

      const contentFlowAnalysis = await this.orchestrator.delegateTask(task);
      
      await this.crystallineMemory.store('browser-compatibility-matrix', {
        type: 'responsive-content-flow-analysis',
        agentId: this.agentId,
        url,
        analysis: contentFlowAnalysis,
        timestamp: Date.now()
      });

      return {
        hierarchy: contentFlowAnalysis.hierarchy || 0,
        readingFlow: contentFlowAnalysis.readingFlow || 0,
        infoArchitecture: contentFlowAnalysis.infoArchitecture || 0,
        ctaProminence: contentFlowAnalysis.ctaProminence || 0,
        mediaScaling: contentFlowAnalysis.mediaScaling || 0,
        overallScore: contentFlowAnalysis.overallScore || 0,
        recommendations: contentFlowAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Responsive content flow analysis failed:', error);
      throw error;
    }
  }

  async analyzeCrossDeviceConsistency(breakpointResults, mobileResults, contentFlowResults) {
    try {
      const task = new Task({
        prompt: `Analyze cross-device consistency for responsive design implementation.

BREAKPOINT RESULTS:
${JSON.stringify(breakpointResults, null, 2)}

MOBILE RESULTS:
${JSON.stringify(mobileResults, null, 2)}

CONTENT FLOW RESULTS:
${JSON.stringify(contentFlowResults, null, 2)}

CROSS-DEVICE CONSISTENCY ANALYSIS:
- Visual consistency across different screen sizes
- Functional consistency of interactive elements
- Content consistency and information parity
- Navigation consistency and discoverability
- Performance consistency across device types

CONSISTENCY EVALUATION METRICS:
- Brand consistency maintenance across breakpoints
- User experience continuity between devices
- Feature availability and accessibility
- Loading performance variance analysis
- Interaction pattern consistency

DEVIATION IDENTIFICATION:
- Visual inconsistencies and layout breaks
- Functional differences between devices
- Content gaps or information loss
- Navigation pattern disruptions
- Performance bottlenecks on specific devices

Calculate consistency variance and provide recommendations for improved cross-device harmony.`,
        subagent_type: 'general-purpose'
      });

      const consistencyAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        visualConsistency: consistencyAnalysis.visualConsistency || 0,
        functionalConsistency: consistencyAnalysis.functionalConsistency || 0,
        contentConsistency: consistencyAnalysis.contentConsistency || 0,
        overallConsistency: consistencyAnalysis.overallConsistency || 0,
        issues: consistencyAnalysis.issues || [],
        recommendations: consistencyAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Cross-device consistency analysis failed:', error);
      throw error;
    }
  }

  async optimizeBreakpointStrategy(url, currentBreakpoints, usageAnalytics) {
    try {
      const task = new Task({
        prompt: `Optimize breakpoint strategy based on usage analytics for ${url}.

CURRENT BREAKPOINTS: ${currentBreakpoints.join(', ')}px
USAGE ANALYTICS: ${JSON.stringify(usageAnalytics, null, 2)}

BREAKPOINT STRATEGY OPTIMIZATION:
- Analyze current breakpoint effectiveness
- Identify optimal breakpoint positioning based on traffic data
- Evaluate major breakpoint gaps and opportunities
- Assess device-specific optimization needs
- Review popular device resolution coverage

DATA-DRIVEN BREAKPOINT ANALYSIS:
- Traffic distribution across screen sizes
- Conversion rate variance by device category
- Performance impact of current breakpoint strategy
- User behavior patterns across breakpoints
- Device fragmentation considerations

OPTIMIZATION RECOMMENDATIONS:
- Suggest optimal breakpoint positioning
- Recommend custom breakpoints for high-traffic devices
- Propose breakpoint consolidation opportunities
- Identify device-specific optimization priorities
- Provide implementation strategy for breakpoint changes

Generate actionable breakpoint optimization strategy with implementation timeline and expected impact.`,
        subagent_type: 'general-purpose'
      });

      const breakpointOptimization = await this.orchestrator.delegateTask(task);
      
      return {
        currentEffectiveness: breakpointOptimization.currentEffectiveness || 0,
        optimizedBreakpoints: breakpointOptimization.optimizedBreakpoints || [],
        implementationPriority: breakpointOptimization.implementationPriority || [],
        expectedImpact: breakpointOptimization.expectedImpact || {},
        migrationStrategy: breakpointOptimization.migrationStrategy || [],
        performanceImplications: breakpointOptimization.performanceImplications || {}
      };
    } catch (error) {
      console.error('Breakpoint strategy optimization failed:', error);
      throw error;
    }
  }

  async evaluateFlexboxGridImplementation(url, layoutSystem) {
    try {
      const task = new Task({
        prompt: `Evaluate Flexbox/Grid implementation for responsive layout system at ${url}.

LAYOUT SYSTEM: ${JSON.stringify(layoutSystem, null, 2)}

MODERN CSS LAYOUT EVALUATION:
- CSS Grid implementation effectiveness
- Flexbox usage patterns and optimization
- Layout method appropriateness for different components
- Browser compatibility and fallback strategies
- Performance implications of layout choices

GRID SYSTEM ANALYSIS:
- Grid container structure and alignment
- Grid item placement and spanning
- Responsive grid behavior and breakpoint adaptation
- Grid gap implementation and consistency
- Subgrid usage and nested grid patterns

FLEXBOX ANALYSIS:
- Flex container and item relationships
- Flex-grow, flex-shrink, and flex-basis optimization
- Alignment and justification effectiveness
- Flex-wrap behavior and responsive adaptation
- Performance considerations for complex flex layouts

LAYOUT BEST PRACTICES:
- Appropriate layout method selection (Grid vs Flexbox)
- Progressive enhancement implementation
- Accessibility considerations in layout design
- Performance optimization strategies

Provide comprehensive layout system assessment with modernization recommendations.`,
        subagent_type: 'general-purpose'
      });

      const layoutAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        gridImplementationScore: layoutAnalysis.gridImplementation || 0,
        flexboxUsageScore: layoutAnalysis.flexboxUsage || 0,
        layoutAppropriatenessScore: layoutAnalysis.layoutAppropriateness || 0,
        browserCompatibilityScore: layoutAnalysis.browserCompatibility || 0,
        performanceScore: layoutAnalysis.performance || 0,
        modernizationRecommendations: layoutAnalysis.modernizationRecommendations || [],
        implementationImprovements: layoutAnalysis.implementationImprovements || []
      };
    } catch (error) {
      console.error('Flexbox/Grid implementation evaluation failed:', error);
      throw error;
    }
  }

  getCapabilities() {
    return {
      agentId: this.agentId,
      specialization: this.specialization,
      responsiveDesignPrinciples: this.responsiveDesignPrinciples,
      deviceCategories: this.deviceCategories,
      touchTargetGuidelines: this.touchTargetGuidelines,
      capabilities: [
        'mobile-optimization-analysis',
        'touch-interface-validation',
        'responsive-content-flow-analysis',
        'cross-device-consistency-evaluation',
        'breakpoint-strategy-optimization',
        'modern-css-layout-evaluation'
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

module.exports = WebResponsiveDesignAgent;