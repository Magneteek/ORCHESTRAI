const { Task } = require('../../../../orchestrai-shared/utils/task-delegation');

class WebVisualDesignAgent {
  constructor(orchestrator, crystallineMemory) {
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.agentId = 'web-visual-design-agent';
    this.specialization = 'visual-design-analysis-and-optimization';
    
    this.designPrinciples = [
      'visual-hierarchy',
      'color-theory-application',
      'typography-effectiveness',
      'white-space-utilization',
      'grid-system-consistency',
      'brand-alignment'
    ];
    
    this.designSystemComponents = {
      colors: ['primary', 'secondary', 'accent', 'neutral', 'semantic'],
      typography: ['headings', 'body-text', 'captions', 'labels', 'display'],
      spacing: ['margins', 'padding', 'gaps', 'line-height'],
      components: ['buttons', 'forms', 'cards', 'navigation', 'modals'],
      layout: ['grid-systems', 'breakpoints', 'containers', 'alignment']
    };
  }

  async analyzeBrandCompliance(url, brandGuidelines, checkElements) {
    try {
      console.log(`🎨 Analyzing brand compliance for: ${url}`);
      
      const task = new Task({
        prompt: `As a visual design expert, analyze brand compliance for the website at ${url}.

BRAND GUIDELINES:
${JSON.stringify(brandGuidelines, null, 2)}

CHECK ELEMENTS: ${checkElements.join(', ')}

BRAND COMPLIANCE ANALYSIS:
- Color palette adherence and consistency
- Typography usage and hierarchy compliance
- Logo placement and sizing standards
- Imagery style and treatment alignment
- Iconography consistency with brand system
- Overall brand personality expression

EVALUATION CRITERIA:
- Primary brand color usage accuracy
- Secondary color palette implementation
- Typography hierarchy and font usage
- Brand voice and tone reflection
- Visual consistency across elements
- Brand differentiation maintenance

Provide detailed compliance scoring (0-100) for each element and actionable recommendations for alignment improvement.`,
        subagent_type: 'general-purpose'
      });

      const brandAnalysis = await this.orchestrator.delegateTask(task);
      
      await this.crystallineMemory.store('visual-regression-history', {
        type: 'brand-compliance-analysis',
        agentId: this.agentId,
        url,
        analysis: brandAnalysis,
        timestamp: Date.now()
      });

      return {
        complianceScore: brandAnalysis.complianceScore || 0,
        colors: brandAnalysis.colors || {},
        typography: brandAnalysis.typography || {},
        spacing: brandAnalysis.spacing || {},
        imagery: brandAnalysis.imagery || {},
        iconography: brandAnalysis.iconography || {},
        violations: brandAnalysis.violations || [],
        recommendations: brandAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Brand compliance analysis failed:', error);
      throw error;
    }
  }

  async analyzeLayoutConsistency(screenshot, breakpoint, analysisPoints) {
    try {
      const task = new Task({
        prompt: `Analyze layout consistency for a ${breakpoint}px breakpoint screenshot.

SCREENSHOT DATA: [Screenshot provided for analysis]

ANALYSIS POINTS: ${analysisPoints.join(', ')}

LAYOUT CONSISTENCY EVALUATION:
- Grid alignment and column consistency
- Spacing patterns and rhythm maintenance
- Element proportions and scaling behavior
- Content hierarchy preservation
- Visual balance and composition
- Responsive design principle adherence

SPECIFIC CHECKS:
- Grid system implementation accuracy
- Consistent margins and padding application
- Proportional scaling of elements
- Hierarchy maintenance across breakpoints
- Visual weight distribution balance
- Alignment precision and consistency

Provide detailed consistency scoring and identify specific layout issues with remediation suggestions.`,
        subagent_type: 'general-purpose'
      });

      const layoutAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        consistencyScore: layoutAnalysis.consistencyScore || 0,
        gridAlignment: layoutAnalysis.gridAlignment || {},
        spacing: layoutAnalysis.spacing || {},
        balance: layoutAnalysis.balance || {},
        issues: layoutAnalysis.issues || [],
        recommendations: layoutAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Layout consistency analysis failed:', error);
      throw error;
    }
  }

  async validateDesignSystemCompliance(url, designSystemRules) {
    try {
      const task = new Task({
        prompt: `Validate design system compliance for ${url}.

DESIGN SYSTEM RULES:
${JSON.stringify(designSystemRules, null, 2)}

DESIGN SYSTEM COMPONENTS:
${JSON.stringify(this.designSystemComponents, null, 2)}

COMPLIANCE VALIDATION:
- Component usage consistency and standardization
- Design token implementation accuracy
- Pattern library adherence
- Style guide compliance
- Component variant usage appropriateness
- System scalability and maintainability

VALIDATION AREAS:
- Color token usage vs. hard-coded values
- Typography scale implementation
- Spacing token consistency
- Component pattern adherence
- Interactive state consistency
- Design system evolution compliance

Generate comprehensive compliance report with specific violations and improvement recommendations.`,
        subagent_type: 'general-purpose'
      });

      const designSystemAnalysis = await this.orchestrator.delegateTask(task);
      
      await this.crystallineMemory.store('visual-regression-history', {
        type: 'design-system-compliance',
        agentId: this.agentId,
        url,
        analysis: designSystemAnalysis,
        timestamp: Date.now()
      });

      return {
        overallCompliance: designSystemAnalysis.complianceScore || 0,
        components: designSystemAnalysis.components || {},
        tokens: designSystemAnalysis.tokens || {},
        violations: designSystemAnalysis.violations || [],
        recommendations: designSystemAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Design system compliance validation failed:', error);
      throw error;
    }
  }

  async analyzeVisualHierarchy(url, contentStructure) {
    try {
      const task = new Task({
        prompt: `Analyze visual hierarchy effectiveness for ${url}.

CONTENT STRUCTURE:
${JSON.stringify(contentStructure, null, 2)}

VISUAL HIERARCHY ANALYSIS:
- Typographic hierarchy clarity and effectiveness
- Color contrast and emphasis usage
- Size and scale relationships
- Visual weight distribution
- Information prioritization accuracy
- Scanning pattern optimization (F-pattern, Z-pattern)

HIERARCHY EVALUATION CRITERIA:
- Primary, secondary, tertiary content distinction
- Call-to-action prominence and visibility
- Content grouping and relationship clarity
- Visual flow guidance effectiveness
- Information density management
- Accessibility compliance in hierarchy

Apply design principles:
- Gestalt principles (proximity, similarity, closure)
- Visual weight theory
- Color psychology and contrast theory
- Typography hierarchy best practices

Provide detailed hierarchy assessment with optimization recommendations.`,
        subagent_type: 'general-purpose'
      });

      const hierarchyAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        hierarchyClarity: hierarchyAnalysis.hierarchyClarity || 0,
        typographicHierarchy: hierarchyAnalysis.typographicHierarchy || 0,
        colorEmphasis: hierarchyAnalysis.colorEmphasis || 0,
        visualWeight: hierarchyAnalysis.visualWeight || 0,
        informationPriority: hierarchyAnalysis.informationPriority || 0,
        scanningOptimization: hierarchyAnalysis.scanningOptimization || 0,
        overallHierarchyScore: hierarchyAnalysis.overallScore || 0,
        recommendations: hierarchyAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Visual hierarchy analysis failed:', error);
      throw error;
    }
  }

  async evaluateColorAccessibility(colorPalette, contrastRequirements) {
    try {
      const task = new Task({
        prompt: `Evaluate color accessibility and contrast compliance.

COLOR PALETTE:
${JSON.stringify(colorPalette, null, 2)}

CONTRAST REQUIREMENTS:
${JSON.stringify(contrastRequirements, null, 2)}

ACCESSIBILITY EVALUATION:
- WCAG 2.1 AA compliance (4.5:1 normal text, 3:1 large text)
- WCAG 2.1 AAA compliance (7:1 normal text, 4.5:1 large text)
- Color blindness considerations (protanopia, deuteranopia, tritanopia)
- Color-only information dependencies
- Interactive element color contrast
- Brand color accessibility optimization

SPECIFIC CHECKS:
- Text-to-background contrast ratios
- Interactive element contrast ratios
- Focus indicator visibility
- Error message color accessibility
- Success/warning state color clarity
- Color blindness simulation results

Generate detailed accessibility report with specific contrast improvements and alternative color suggestions.`,
        subagent_type: 'general-purpose'
      });

      const colorAccessibilityAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        overallAccessibilityScore: colorAccessibilityAnalysis.accessibilityScore || 0,
        wcagAACompliance: colorAccessibilityAnalysis.wcagAA || false,
        wcagAAACompliance: colorAccessibilityAnalysis.wcagAAA || false,
        colorBlindnessCompliance: colorAccessibilityAnalysis.colorBlindness || {},
        contrastIssues: colorAccessibilityAnalysis.contrastIssues || [],
        recommendations: colorAccessibilityAnalysis.recommendations || [],
        alternativeColors: colorAccessibilityAnalysis.alternativeColors || {}
      };
    } catch (error) {
      console.error('Color accessibility evaluation failed:', error);
      throw error;
    }
  }

  async analyzeTypographyEffectiveness(url, typographyUsage) {
    try {
      const task = new Task({
        prompt: `Analyze typography effectiveness and readability for ${url}.

TYPOGRAPHY USAGE:
${JSON.stringify(typographyUsage, null, 2)}

TYPOGRAPHY ANALYSIS:
- Font choice appropriateness for brand and purpose
- Readability across different screen sizes and devices
- Line length and line height optimization
- Font size hierarchy and scaling
- Font weight and style usage effectiveness
- Web font performance impact

READABILITY EVALUATION:
- Flesch-Kincaid readability scores
- Line length optimization (45-75 characters)
- Line height ratios (1.2-1.6 for body text)
- Font size accessibility (minimum 16px base)
- Color contrast with background
- Font rendering quality across browsers

PERFORMANCE CONSIDERATIONS:
- Web font loading strategies
- Font subset optimization
- Fallback font effectiveness
- Loading performance impact

Provide comprehensive typography assessment with specific optimization recommendations.`,
        subagent_type: 'general-purpose'
      });

      const typographyAnalysis = await this.orchestrator.delegateTask(task);
      
      return {
        overallTypographyScore: typographyAnalysis.overallScore || 0,
        readabilityScore: typographyAnalysis.readabilityScore || 0,
        fontChoiceEffectiveness: typographyAnalysis.fontChoice || 0,
        hierarchyClarity: typographyAnalysis.hierarchyClarity || 0,
        responsiveTypography: typographyAnalysis.responsiveTypography || 0,
        performanceImpact: typographyAnalysis.performanceImpact || {},
        recommendations: typographyAnalysis.recommendations || []
      };
    } catch (error) {
      console.error('Typography effectiveness analysis failed:', error);
      throw error;
    }
  }

  async generateVisualQualityReport(url, validationResults) {
    try {
      const task = new Task({
        prompt: `Generate a comprehensive visual quality report for ${url}.

VALIDATION RESULTS:
${JSON.stringify(validationResults, null, 2)}

VISUAL QUALITY REPORT REQUIREMENTS:
- Executive summary of visual quality status
- Detailed findings for each validation area
- Prioritized improvement recommendations
- Implementation complexity assessment
- Expected impact analysis
- Before/after improvement projections

REPORT SECTIONS:
1. Visual Quality Overview
2. Brand Compliance Assessment
3. Layout Consistency Analysis
4. Design System Adherence
5. Accessibility Compliance
6. Typography Effectiveness
7. Prioritized Action Plan
8. Success Metrics and KPIs

Generate a professional, actionable report with specific recommendations and implementation guidance.`,
        subagent_type: 'general-purpose'
      });

      const qualityReport = await this.orchestrator.delegateTask(task);
      
      await this.crystallineMemory.store('visual-regression-history', {
        type: 'visual-quality-report',
        agentId: this.agentId,
        url,
        report: qualityReport,
        timestamp: Date.now()
      });

      return {
        executiveSummary: qualityReport.executiveSummary || {},
        detailedFindings: qualityReport.detailedFindings || {},
        prioritizedRecommendations: qualityReport.prioritizedRecommendations || [],
        implementationComplexity: qualityReport.implementationComplexity || {},
        expectedImpact: qualityReport.expectedImpact || {},
        successMetrics: qualityReport.successMetrics || [],
        actionPlan: qualityReport.actionPlan || []
      };
    } catch (error) {
      console.error('Visual quality report generation failed:', error);
      throw error;
    }
  }

  getCapabilities() {
    return {
      agentId: this.agentId,
      specialization: this.specialization,
      designPrinciples: this.designPrinciples,
      designSystemComponents: this.designSystemComponents,
      capabilities: [
        'brand-compliance-analysis',
        'layout-consistency-evaluation',
        'design-system-validation',
        'visual-hierarchy-analysis',
        'color-accessibility-evaluation',
        'typography-effectiveness-assessment',
        'visual-quality-reporting'
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

module.exports = WebVisualDesignAgent;