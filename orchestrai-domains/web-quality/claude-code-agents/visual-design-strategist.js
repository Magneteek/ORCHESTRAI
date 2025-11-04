const { Task } = require('../../../orchestrai-shared/utils/task-delegation');
const PatternLibraryRegistry = require('../design-patterns/pattern-library-registry');

class VisualDesignStrategist {
  constructor(orchestrator, crystallineMemory) {
    this.orchestrator = orchestrator;
    this.crystallineMemory = crystallineMemory;
    this.agentId = 'visual-design-strategist';
    this.specialization = 'strategic-visual-design-analysis-and-enhancement';
    
    // Initialize Pattern Library Registry
    this.patternLibraryRegistry = new PatternLibraryRegistry(crystallineMemory);
    
    // 2024 Design Technology Stack
    this.designTechnologies = {
      animations: {
        'MagicUI': {
          components: 150,
          focus: 'React components with built-in animations',
          use_cases: ['landing_pages', 'saas_platforms', 'marketing_sites'],
          performance: 'gpu_accelerated',
          accessibility: 'reduced_motion_support'
        },
        'Framer Motion': {
          components: 'unlimited',
          focus: 'Advanced gestures and physics-based animations',
          use_cases: ['interactive_elements', 'page_transitions', 'micro_interactions'],
          performance: 'optimized_for_60fps',
          accessibility: 'full_a11y_compliance'
        },
        'GSAP': {
          components: 'timeline_based',
          focus: 'High-performance complex animations',
          use_cases: ['scroll_triggers', 'svg_animations', 'timeline_sequences'],
          performance: 'industry_leading',
          accessibility: 'manual_implementation_required'
        },
        'Three.js': {
          components: '3d_graphics',
          focus: 'WebGL 3D visualizations',
          use_cases: ['data_visualization', '3d_models', 'immersive_experiences'],
          performance: 'hardware_dependent',
          accessibility: 'fallback_required'
        },
        'Paper.js': {
          components: 'canvas_based',
          focus: 'Vector graphics and interactive canvas',
          use_cases: ['data_visualizations', 'custom_graphics', 'interactive_art'],
          performance: 'canvas_optimized',
          accessibility: 'alt_text_implementation'
        }
      },
      
      patterns: {
        'glassmorphism': {
          description: 'Semi-transparent cards with backdrop blur',
          trend_status: 'mainstream_2024',
          industries: ['fintech', 'saas', 'healthcare', 'enterprise'],
          implementation: 'backdrop-blur + transparency',
          performance_impact: 'moderate'
        },
        'neumorphism': {
          description: 'Soft shadows creating raised/pressed effects',
          trend_status: 'selective_use_2024',
          industries: ['mobile_apps', 'dashboard_interfaces', 'control_panels'],
          implementation: 'multiple_box_shadows',
          performance_impact: 'low'
        },
        'particle_systems': {
          description: 'Floating animated particles as background elements',
          trend_status: 'growing_2024',
          industries: ['tech', 'ai_platforms', 'data_companies', 'startups'],
          implementation: 'canvas_or_webgl',
          performance_impact: 'high_if_not_optimized'
        },
        'animated_beams': {
          description: 'Connecting lines showing data flow or relationships',
          trend_status: 'emerging_2024',
          industries: ['business_intelligence', 'crm_platforms', 'analytics'],
          implementation: 'svg_path_animations',
          performance_impact: 'low_to_moderate'
        },
        'morphing_gradients': {
          description: 'Dynamic color transitions and moving gradients',
          trend_status: 'mainstream_2024',
          industries: ['creative_agencies', 'entertainment', 'lifestyle_brands'],
          implementation: 'css_animations_keyframes',
          performance_impact: 'low'
        }
      },
      
      industryContexts: {
        'business_intelligence': {
          visual_metaphors: ['data_flow', 'network_connections', 'analytical_patterns'],
          color_palettes: ['blue_professional', 'data_visualization_spectrum', 'neutral_enterprise'],
          animation_preferences: ['subtle_professional', 'data_themed', 'performance_focused'],
          key_components: ['charts', 'dashboards', 'data_cards', 'metrics_display']
        },
        'saas_platforms': {
          visual_metaphors: ['connectivity', 'efficiency', 'scalability', 'integration'],
          color_palettes: ['modern_blues', 'success_greens', 'premium_grays'],
          animation_preferences: ['smooth_transitions', 'hover_feedbacks', 'loading_states'],
          key_components: ['feature_cards', 'pricing_tables', 'testimonials', 'integration_displays']
        },
        'fintech': {
          visual_metaphors: ['security', 'growth', 'precision', 'trust'],
          color_palettes: ['trust_blues', 'growth_greens', 'security_grays'],
          animation_preferences: ['secure_feeling', 'precise_movements', 'trust_building'],
          key_components: ['security_badges', 'growth_charts', 'trust_indicators', 'compliance_displays']
        },
        'healthcare': {
          visual_metaphors: ['care', 'precision', 'safety', 'innovation'],
          color_palettes: ['medical_blues', 'health_greens', 'clean_whites'],
          animation_preferences: ['calm_soothing', 'professional_subtle', 'accessible_clear'],
          key_components: ['care_icons', 'safety_indicators', 'process_flows', 'outcome_displays']
        }
      }
    };
    
    // Design Maturity Assessment Framework
    this.maturityLevels = {
      'basic': {
        characteristics: ['static_layouts', 'basic_hover_states', 'standard_components'],
        enhancement_potential: 'high',
        investment_level: 'moderate',
        timeline: '1-2_weeks'
      },
      'intermediate': {
        characteristics: ['some_animations', 'custom_styling', 'responsive_design'],
        enhancement_potential: 'moderate',
        investment_level: 'selective',
        timeline: '3-5_days'
      },
      'advanced': {
        characteristics: ['sophisticated_animations', 'custom_components', 'performance_optimized'],
        enhancement_potential: 'refinement',
        investment_level: 'minimal',
        timeline: '1-2_days'
      },
      'premium': {
        characteristics: ['cutting_edge_effects', 'custom_graphics', 'industry_leading'],
        enhancement_potential: 'maintenance',
        investment_level: 'ongoing',
        timeline: 'continuous'
      }
    };
  }

  async generateVisualEnhancementStrategy(websiteContext, industry, targetAudience, businessGoals) {
    try {
      console.log(`🎨 Generating visual enhancement strategy for ${industry} industry`);
      
      // Generate pattern-based recommendations first
      const patternRecommendations = await this.generatePatternBasedRecommendations(
        websiteContext, industry, targetAudience, businessGoals
      );

      const task = new Task({
        prompt: `As an expert Visual Design Strategist, create a comprehensive visual enhancement plan using industry-specific design patterns.

WEBSITE CONTEXT:
${JSON.stringify(websiteContext, null, 2)}

INDUSTRY: ${industry}
TARGET AUDIENCE: ${JSON.stringify(targetAudience, null, 2)}
BUSINESS GOALS: ${JSON.stringify(businessGoals, null, 2)}

PATTERN-BASED RECOMMENDATIONS:
${patternRecommendations.success ? JSON.stringify(patternRecommendations.implementationRecommendations, null, 2) : 'Pattern recommendations unavailable'}

AVAILABLE INDUSTRY PATTERNS:
${patternRecommendations.success ? JSON.stringify(patternRecommendations.patternLibraryStatus, null, 2) : 'Pattern library unavailable'}

STRATEGIC ANALYSIS FRAMEWORK:

1. CURRENT STATE ASSESSMENT
   - Visual sophistication level analysis
   - Competitive positioning evaluation
   - Brand alignment assessment
   - Technical implementation review

2. INDUSTRY-SPECIFIC RECOMMENDATIONS
   - Visual metaphors appropriate for ${industry}
   - Color psychology for target demographic
   - Animation patterns that build trust/engagement
   - Interactive elements that support conversion goals

3. TECHNOLOGY STACK RECOMMENDATIONS
   Based on my 2024 design technology database:
   ${JSON.stringify(this.designTechnologies, null, 2)}

4. PHASED IMPLEMENTATION PLAN
   Phase 1 (Quick Wins): Immediate visual impact improvements
   Phase 2 (Foundation): Core design system enhancements
   Phase 3 (Advanced): Sophisticated interactive elements
   Phase 4 (Premium): Cutting-edge differentiation features

5. PERFORMANCE & ACCESSIBILITY CONSIDERATIONS
   - Mobile optimization requirements
   - Reduced motion compliance
   - Loading performance impact
   - Progressive enhancement strategy

6. ROI PROJECTION
   - Expected engagement improvement metrics
   - Conversion rate optimization projections
   - Brand perception enhancement value
   - Competitive advantage assessment

7. IMPLEMENTATION TIMELINE
   - Resource requirements per phase
   - Technical complexity assessment
   - Priority matrix for maximum impact
   - Risk mitigation strategies

DELIVERABLE: Comprehensive strategic plan with specific recommendations, implementation steps, and expected outcomes.`,
        
        subagent_type: 'general-purpose',
        description: 'Generate visual enhancement strategy'
      });

      const strategy = await this.orchestrator.delegateTask(task);
      
      // Store strategy in crystalline memory for future reference
      await this.crystallineMemory.storeDesignStrategy({
        industry,
        targetAudience,
        strategy: strategy.result,
        timestamp: new Date().toISOString(),
        success_patterns: []
      });

      return {
        success: true,
        strategy: strategy.result,
        industryContext: this.industryContexts[industry] || {},
        recommendedTechnologies: this.getRecommendedTechnologies(industry, businessGoals),
        implementationPriority: this.calculateImplementationPriority(websiteContext, businessGoals)
      };

    } catch (error) {
      console.error('❌ Error generating visual enhancement strategy:', error);
      return { success: false, error: error.message };
    }
  }

  async assessDesignMaturity(websiteUrl, brandGuidelines, industryBenchmarks) {
    try {
      console.log(`🔍 Assessing design maturity for: ${websiteUrl}`);
      
      const task = new Task({
        prompt: `As a Visual Design Strategist, analyze the design maturity of this website.

WEBSITE URL: ${websiteUrl}
BRAND GUIDELINES: ${JSON.stringify(brandGuidelines, null, 2)}
INDUSTRY BENCHMARKS: ${JSON.stringify(industryBenchmarks, null, 2)}

ASSESSMENT FRAMEWORK:

1. VISUAL SOPHISTICATION ANALYSIS
   Evaluate against my maturity levels:
   ${JSON.stringify(this.maturityLevels, null, 2)}

2. COMPETITIVE POSITIONING
   - How does visual quality compare to industry leaders?
   - What visual elements create competitive disadvantage?
   - Which enhancements would provide maximum differentiation?

3. BRAND ALIGNMENT EVALUATION
   - Does visual design reinforce brand values?
   - Are visual metaphors appropriate for brand positioning?
   - Does color psychology support brand personality?

4. USER EXPERIENCE ASSESSMENT
   - Do visual elements enhance or distract from user goals?
   - Are interactive elements intuitive and purposeful?
   - Does visual hierarchy guide users effectively?

5. TECHNICAL IMPLEMENTATION REVIEW
   - Performance impact of current visual elements
   - Mobile optimization quality
   - Accessibility compliance level
   - Cross-browser consistency

6. ENHANCEMENT OPPORTUNITIES
   - Specific areas needing immediate attention
   - High-impact, low-effort improvements
   - Long-term strategic visual investments
   - Industry-specific enhancement recommendations

DELIVERABLE: Detailed maturity assessment with specific improvement recommendations and impact projections.`,
        
        subagent_type: 'general-purpose',
        description: 'Assess website design maturity'
      });

      const assessment = await this.orchestrator.delegateTask(task);

      // Determine maturity level based on assessment
      const maturityLevel = this.determineMaturityLevel(assessment.result);
      
      return {
        success: true,
        maturityLevel,
        assessment: assessment.result,
        enhancementPotential: this.maturityLevels[maturityLevel]?.enhancement_potential || 'unknown',
        recommendedInvestment: this.maturityLevels[maturityLevel]?.investment_level || 'evaluate',
        timeline: this.maturityLevels[maturityLevel]?.timeline || 'assess'
      };

    } catch (error) {
      console.error('❌ Error assessing design maturity:', error);
      return { success: false, error: error.message };
    }
  }

  async generateIndustrySpecificRecommendations(industry, projectType, budget) {
    try {
      console.log(`🏭 Generating ${industry} specific design recommendations`);
      
      const industryContext = this.industryContexts[industry];
      if (!industryContext) {
        throw new Error(`Industry context not found for: ${industry}`);
      }

      const recommendations = {
        visualMetaphors: industryContext.visual_metaphors,
        colorPalettes: industryContext.color_palettes,
        animationPreferences: industryContext.animation_preferences,
        keyComponents: industryContext.key_components,
        
        technologyRecommendations: this.getIndustryTechnologies(industry, budget),
        implementationGuide: this.generateImplementationGuide(industry, projectType),
        competitiveAdvantages: this.identifyCompetitiveAdvantages(industry),
        performanceConsiderations: this.getPerformanceGuidelines(industry)
      };

      return {
        success: true,
        industry,
        recommendations,
        implementationPriority: this.prioritizeByIndustry(industry, projectType)
      };

    } catch (error) {
      console.error('❌ Error generating industry recommendations:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper Methods
  async generatePatternBasedRecommendations(websiteContext, industry, targetAudience, businessGoals) {
    try {
      console.log(`🎨 Generating pattern-based recommendations for ${industry}`);
      
      // Get industry-specific patterns
      const industryPatterns = this.patternLibraryRegistry.getPatternsByIndustry(industry);
      
      if (!industryPatterns) {
        console.warn(`⚠️ No patterns available for industry: ${industry}`);
        return { success: false, error: `No patterns available for industry: ${industry}` };
      }
      
      // Get use case recommendations
      const projectContext = {
        industry,
        projectType: this.inferProjectType(websiteContext, businessGoals),
        requirements: businessGoals,
        targetAudience
      };
      
      const patternRecommendations = this.patternLibraryRegistry.recommendPatternsForProject(projectContext);
      
      // Generate specific implementation recommendations
      const implementationRecommendations = await this.generateImplementationRecommendations(
        patternRecommendations,
        websiteContext
      );
      
      return {
        success: true,
        industryPatterns,
        patternRecommendations,
        implementationRecommendations,
        patternLibraryStatus: this.patternLibraryRegistry.getRegistryStatus()
      };
      
    } catch (error) {
      console.error('❌ Error generating pattern-based recommendations:', error);
      return { success: false, error: error.message };
    }
  }

  async generateImplementationRecommendations(patternRecommendations, websiteContext) {
    try {
      const recommendations = {
        immediate: [],      // Quick wins (1-2 days)
        foundation: [],     // Core improvements (1-2 weeks)  
        advanced: [],       // Sophisticated features (2-4 weeks)
        premium: []         // Industry-leading elements (1-2 months)
      };
      
      // Process direct industry recommendations
      for (const pattern of patternRecommendations.recommendations.direct) {
        const patternData = this.patternLibraryRegistry.getPattern(
          patternRecommendations.projectContext.industry,
          pattern.category,
          pattern.pattern
        );
        
        if (patternData) {
          const recommendation = {
            category: pattern.category,
            patternName: pattern.pattern,
            implementation: patternData.implementationGuide,
            complexity: patternData.complexity,
            dependencies: patternData.dependencies,
            estimatedTime: this.estimateImplementationTime(patternData.complexity),
            priority: this.calculatePriority(pattern, websiteContext)
          };
          
          // Categorize by complexity and priority
          if (recommendation.complexity === 'low' && recommendation.priority === 'high') {
            recommendations.immediate.push(recommendation);
          } else if (recommendation.complexity === 'medium') {
            recommendations.foundation.push(recommendation);
          } else if (recommendation.complexity === 'high') {
            recommendations.advanced.push(recommendation);
          }
        }
      }
      
      // Process use case recommendations
      for (const useCase of patternRecommendations.recommendations.useCases) {
        const useCaseRecommendation = {
          useCaseId: useCase.useCaseId,
          description: useCase.description,
          complexity: useCase.complexity,
          estimatedTime: useCase.estimatedImplementationTime,
          patterns: useCase.patterns.filter(p => p.patternData).map(p => ({
            industry: p.industry,
            category: p.category,
            pattern: p.pattern,
            implementation: p.patternData.implementationGuide,
            dependencies: p.patternData.dependencies
          }))
        };
        
        if (useCase.complexity === 'medium' && useCase.applicabilityScore > 0.7) {
          recommendations.foundation.push(useCaseRecommendation);
        } else if (useCase.complexity === 'high') {
          recommendations.advanced.push(useCaseRecommendation);
        }
      }
      
      return recommendations;
      
    } catch (error) {
      console.error('❌ Error generating implementation recommendations:', error);
      return { immediate: [], foundation: [], advanced: [], premium: [] };
    }
  }

  inferProjectType(websiteContext, businessGoals) {
    // Infer project type from context and goals
    if (businessGoals.includes('dashboard') || businessGoals.includes('analytics')) {
      return 'dashboard-design';
    } else if (businessGoals.includes('onboarding') || businessGoals.includes('user-experience')) {
      return 'user-onboarding';
    } else if (businessGoals.includes('conversion') || businessGoals.includes('sales')) {
      return 'landing-page-hero';
    } else if (businessGoals.includes('pricing')) {
      return 'pricing-page';
    }
    
    return 'general-enhancement';
  }

  estimateImplementationTime(complexity) {
    const timeEstimates = {
      'low': '4-8 hours',
      'medium': '1-3 days',
      'high': '3-7 days'
    };
    
    return timeEstimates[complexity] || '1-2 days';
  }

  calculatePriority(pattern, websiteContext) {
    // Simple priority calculation based on pattern category and website context
    const highPriorityCategories = ['colorPalettes', 'componentPatterns'];
    const mediumPriorityCategories = ['animationPatterns', 'layoutPatterns'];
    
    if (highPriorityCategories.includes(pattern.category)) {
      return 'high';
    } else if (mediumPriorityCategories.includes(pattern.category)) {
      return 'medium';
    }
    
    return 'low';
  }

  getRecommendedTechnologies(industry, businessGoals) {
    const recommendations = [];
    
    // Get technology recommendations from pattern library
    try {
      const industryPatterns = this.patternLibraryRegistry.getPatternsByIndustry(industry);
      
      if (industryPatterns) {
        // Extract technology recommendations from patterns
        const patterns = industryPatterns.patterns;
        const technologies = new Set();
        
        // Analyze patterns for technology requirements
        for (const [categoryName, categoryPatterns] of Object.entries(patterns)) {
          for (const [patternName, pattern] of Object.entries(categoryPatterns)) {
            if (pattern.implementation?.includes('MagicUI')) technologies.add('MagicUI');
            if (pattern.implementation?.includes('Framer Motion')) technologies.add('Framer Motion');
            if (pattern.implementation?.includes('Canvas')) technologies.add('Canvas API');
            if (pattern.implementation?.includes('SVG')) technologies.add('SVG Animations');
          }
        }
        
        // Convert to recommendation format
        for (const tech of technologies) {
          recommendations.push({
            technology: tech,
            reason: `Required by industry-specific ${industry} patterns`,
            priority: 'high',
            impact: 'pattern_implementation'
          });
        }
      }
    } catch (error) {
      console.error('Error getting pattern-based technology recommendations:', error);
    }
    
    // Fallback to original recommendations if pattern analysis fails
    if (recommendations.length === 0) {
      recommendations.push({
        technology: 'MagicUI',
        reason: 'Quick implementation of professional animations',
        priority: 'high',
        impact: 'immediate_visual_improvement'
      });

      recommendations.push({
        technology: 'Framer Motion',
        reason: 'Smooth interactions and micro-animations',
        priority: 'high',
        impact: 'user_engagement'
      });

      // Industry-specific additions
      if (industry === 'business_intelligence' || industry === 'saas_platforms') {
        recommendations.push({
          technology: 'Paper.js',
          reason: 'Custom data visualization graphics',
          priority: 'moderate',
          impact: 'differentiation'
        });
      }

      if (businessGoals.includes('premium_positioning')) {
        recommendations.push({
          technology: 'Three.js',
          reason: '3D elements for premium feel',
          priority: 'moderate',
          impact: 'brand_perception'
        });
      }
    }

    return recommendations;
  }

  calculateImplementationPriority(websiteContext, businessGoals) {
    const priorities = [];

    // Quick wins always first
    priorities.push({
      phase: 'Phase 1 - Quick Wins',
      items: ['glassmorphism_effects', 'hover_animations', 'button_improvements'],
      timeline: '1-3 days',
      impact: 'immediate'
    });

    // Foundation improvements
    priorities.push({
      phase: 'Phase 2 - Foundation',
      items: ['background_systems', 'color_enhancements', 'typography_animation'],
      timeline: '1-2 weeks',
      impact: 'significant'
    });

    // Advanced features based on goals
    if (businessGoals.includes('engagement_optimization')) {
      priorities.push({
        phase: 'Phase 3 - Interactive Elements',
        items: ['particle_systems', 'animated_beams', 'micro_interactions'],
        timeline: '2-3 weeks',
        impact: 'engagement_boost'
      });
    }

    return priorities;
  }

  determineMaturityLevel(assessmentText) {
    const text = assessmentText.toLowerCase();
    
    if (text.includes('cutting-edge') || text.includes('industry-leading') || text.includes('sophisticated')) {
      return 'premium';
    } else if (text.includes('advanced') || text.includes('custom') || text.includes('optimized')) {
      return 'advanced';
    } else if (text.includes('some animations') || text.includes('responsive') || text.includes('custom styling')) {
      return 'intermediate';
    } else {
      return 'basic';
    }
  }

  getIndustryTechnologies(industry, budget) {
    const technologies = [];
    
    switch (industry) {
      case 'business_intelligence':
        technologies.push('animated_beams', 'particle_systems', 'data_visualizations');
        break;
      case 'saas_platforms':
        technologies.push('glassmorphism', 'micro_interactions', 'smooth_transitions');
        break;
      case 'fintech':
        technologies.push('security_animations', 'trust_indicators', 'precise_movements');
        break;
      case 'healthcare':
        technologies.push('calm_animations', 'accessible_interactions', 'safety_indicators');
        break;
      default:
        technologies.push('general_enhancements', 'brand_appropriate_animations');
    }

    return technologies;
  }

  generateImplementationGuide(industry, projectType) {
    return {
      phase1: {
        focus: 'immediate_impact',
        techniques: ['hover_states', 'transitions', 'micro_animations'],
        timeline: '1-3 days'
      },
      phase2: {
        focus: 'foundation_building',
        techniques: ['background_systems', 'component_styling', 'layout_enhancements'],
        timeline: '1-2 weeks'
      },
      phase3: {
        focus: 'differentiation',
        techniques: ['advanced_animations', 'custom_components', 'interactive_elements'],
        timeline: '2-4 weeks'
      }
    };
  }

  identifyCompetitiveAdvantages(industry) {
    return {
      immediate: ['professional_animations', 'modern_aesthetic', 'smooth_interactions'],
      strategic: ['custom_visual_metaphors', 'brand_differentiation', 'user_engagement'],
      longterm: ['industry_leadership', 'conversion_optimization', 'brand_authority']
    };
  }

  getPerformanceGuidelines(industry) {
    return {
      mobile_optimization: 'essential',
      loading_performance: 'critical',
      accessibility_compliance: 'required',
      progressive_enhancement: 'recommended',
      gpu_acceleration: industry === 'gaming' ? 'essential' : 'beneficial'
    };
  }

  prioritizeByIndustry(industry, projectType) {
    const basePriority = ['quick_wins', 'foundation', 'advanced'];
    
    if (industry === 'fintech') {
      return ['trust_building', 'security_emphasis', 'professional_polish'];
    } else if (industry === 'healthcare') {
      return ['accessibility_first', 'calm_professional', 'trust_indicators'];
    } else if (industry === 'business_intelligence') {
      return ['data_metaphors', 'professional_advanced', 'differentiation'];
    }
    
    return basePriority;
  }
}

module.exports = VisualDesignStrategist;