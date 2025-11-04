/**
 * ORCHESTRAI Pipeline Template Library
 *
 * Comprehensive library of proven pipeline templates for all domain operations.
 * Each template defines stages, agents, tasks, dependencies, and quality gates.
 *
 * Templates:
 * 1. SEO Research Pipeline
 * 2. Content Creation Pipeline (Multi-Language)
 * 3. Advertising Campaign Pipeline
 * 4. Web Development Pipeline
 * 5. Reputation Intelligence Pipeline
 * 6. Competitive Analysis Pipeline
 * 7. Psychographic Research Pipeline
 */

class PipelineTemplateLibrary {
  constructor() {
    this.templates = this.initializeTemplates();
    console.log(`📚 Pipeline Template Library initialized with ${this.templates.size} templates`);
  }

  /**
   * Initialize all pipeline templates
   */
  initializeTemplates() {
    const templates = new Map();

    // Register all templates
    [
      this.seoResearchPipeline(),
      this.contentCreationMultiLanguagePipeline(),
      this.advertisingCampaignPipeline(),
      this.webDevelopmentPipeline(),
      this.reputationIntelligencePipeline(),
      this.competitiveAnalysisPipeline(),
      this.psychographicResearchPipeline(),
      this.contentCreationPipeline(),
      this.localSeoPipeline(),
      this.emailMarketingPipeline(),
      this.landingPageOptimizationPipeline(),
      // Phase 2: Infrastructure Pipelines
      this.technicalSeoAuditPipeline(),
      this.comprehensiveTestingPipeline(),
      this.cicdPipeline(),
      this.apiDevelopmentPipeline()
    ].forEach(template => {
      templates.set(template.id, template);
    });

    return templates;
  }

  /**
   * SEO Research Pipeline Template
   */
  seoResearchPipeline() {
    return {
      id: 'seo-research',
      name: 'SEO Research Pipeline',
      description: 'Comprehensive SEO research from keyword discovery to content strategy',
      version: '2.0',

      stages: [
        {
          stage: 'keyword_discovery',
          stageName: 'Keyword Discovery & Analysis',
          agents: ['seo-keyword-research'],
          tasks: [
            {
              taskId: 'primary_keyword_research',
              name: 'Primary Keyword Research',
              agentType: 'seo-keyword-research',
              prompt: 'Conduct comprehensive primary keyword research for {targetMarket} in {language}. Focus on search volume, difficulty, and commercial intent.',
              outputFormat: 'keyword-dataset',
              estimatedDuration: 15
            },
            {
              taskId: 'long_tail_analysis',
              name: 'Long-Tail Keyword Analysis',
              agentType: 'seo-keyword-research',
              prompt: 'Identify long-tail keyword opportunities with lower competition and high conversion potential for {targetMarket}.',
              outputFormat: 'keyword-dataset',
              estimatedDuration: 15
            }
          ],
          parallelizable: true,
          estimatedDuration: 20
        },
        {
          stage: 'search_intent_analysis',
          stageName: 'Search Intent & User Journey Mapping',
          agents: ['seo-intent-mapping'],
          tasks: [
            {
              taskId: 'intent_classification',
              name: 'Search Intent Classification',
              agentType: 'seo-intent-mapping',
              prompt: 'Classify search intent for discovered keywords (informational, navigational, commercial, transactional). Map to user journey stages.',
              dependencies: ['primary_keyword_research', 'long_tail_analysis'],
              outputFormat: 'intent-mapping',
              estimatedDuration: 15
            },
            {
              taskId: 'user_journey_mapping',
              name: 'User Journey & Funnel Mapping',
              agentType: 'seo-intent-mapping',
              prompt: 'Map keywords to user journey stages (awareness, consideration, decision). Create funnel-optimized keyword strategy.',
              dependencies: ['intent_classification'],
              outputFormat: 'journey-map',
              estimatedDuration: 15
            }
          ],
          dependencies: ['keyword_discovery'],
          estimatedDuration: 25
        },
        {
          stage: 'competitor_analysis',
          stageName: 'SERP & Competitive Analysis',
          agents: ['seo-serp-analysis', 'seo-competitor-analysis'],
          tasks: [
            {
              taskId: 'serp_gap_analysis',
              name: 'SERP Gap Analysis',
              agentType: 'seo-serp-analysis',
              prompt: 'Analyze SERP features and identify content gaps for target keywords in {targetMarket}. Find ranking opportunities.',
              dependencies: ['keyword_discovery'],
              outputFormat: 'gap-analysis',
              estimatedDuration: 20
            },
            {
              taskId: 'content_opportunity_identification',
              name: 'Content Opportunity Identification',
              agentType: 'seo-competitor-analysis',
              prompt: 'Identify high-value content opportunities based on competitor weaknesses and SERP gaps.',
              dependencies: ['serp_gap_analysis'],
              outputFormat: 'opportunity-matrix',
              estimatedDuration: 15
            }
          ],
          parallelizable: true,
          dependencies: ['keyword_discovery'],
          estimatedDuration: 30
        },
        {
          stage: 'semantic_clustering',
          stageName: 'Semantic Clustering & Topic Architecture',
          agents: ['seo-semantic-clustering'],
          tasks: [
            {
              taskId: 'topic_clustering',
              name: 'Semantic Topic Clustering',
              agentType: 'seo-semantic-clustering',
              prompt: 'Create semantic keyword clusters and topic groups. Build topical authority architecture for {targetMarket}.',
              dependencies: ['keyword_discovery', 'intent_classification'],
              outputFormat: 'cluster-map',
              estimatedDuration: 20
            },
            {
              taskId: 'content_architecture_planning',
              name: 'Content Architecture Planning',
              agentType: 'seo-semantic-clustering',
              prompt: 'Design hub-spoke content architecture based on semantic clusters. Plan internal linking structure.',
              dependencies: ['topic_clustering'],
              outputFormat: 'architecture-blueprint',
              estimatedDuration: 20
            }
          ],
          dependencies: ['search_intent_analysis', 'competitor_analysis'],
          estimatedDuration: 35
        },
        {
          stage: 'strategy_generation',
          stageName: 'SEO Strategy & Content Calendar',
          agents: ['content-strategy'],
          tasks: [
            {
              taskId: 'content_calendar_creation',
              name: 'Content Calendar Creation',
              agentType: 'content-strategy',
              prompt: 'Create prioritized content calendar based on semantic clusters, search intent, and business goals for {clientName}.',
              dependencies: ['content_architecture_planning', 'user_journey_mapping'],
              outputFormat: 'content-calendar',
              estimatedDuration: 20
            },
            {
              taskId: 'priority_ranking',
              name: 'Priority Ranking & ROI Estimation',
              agentType: 'content-strategy',
              prompt: 'Rank content opportunities by expected ROI, difficulty, and strategic importance. Create implementation roadmap.',
              dependencies: ['content_calendar_creation', 'content_opportunity_identification'],
              outputFormat: 'priority-matrix',
              estimatedDuration: 15
            }
          ],
          dependencies: ['semantic_clustering', 'search_intent_analysis'],
          estimatedDuration: 30
        },
        {
          stage: 'memory_integration',
          stageName: 'Crystalline Memory Integration',
          agents: ['memory-coordinator'],
          tasks: [
            {
              taskId: 'crystalline_memory_storage',
              name: 'Store Research in Crystalline Memory',
              agentType: 'memory-coordinator',
              prompt: 'Integrate all SEO research findings into crystalline memory system for {projectUuid}. Create semantic connections.',
              dependencies: ['strategy_generation'],
              outputFormat: 'memory-integration-report',
              estimatedDuration: 10
            },
            {
              taskId: 'cross_domain_linking',
              name: 'Cross-Domain Knowledge Linking',
              agentType: 'memory-coordinator',
              prompt: 'Create knowledge graph connections between SEO research and existing client intelligence, psychographic data, and content strategy.',
              dependencies: ['crystalline_memory_storage'],
              outputFormat: 'knowledge-graph',
              estimatedDuration: 10
            }
          ],
          dependencies: ['strategy_generation'],
          estimatedDuration: 15
        }
      ],

      estimatedDuration: 120, // Total minutes
      qualityGates: ['keyword_validation', 'strategy_coherence', 'semantic_completeness'],
      coordinationPattern: 'pipeline',

      supportingTemplates: [],
      requiredDomains: ['seo', 'content'],
      complexity: 'medium'
    };
  }

  /**
   * Content Creation Multi-Language Pipeline Template
   */
  contentCreationMultiLanguagePipeline() {
    return {
      id: 'content-creation-multi-language',
      name: 'Multi-Language Content Creation Pipeline',
      description: 'Quality-enforced content creation with language isolation and psychographic targeting',
      version: '3.0',

      stages: [
        {
          stage: 'psychographic_analysis',
          stageName: 'Psychographic Analysis & Cultural Context',
          agents: ['psychographic-research'],
          tasks: [
            {
              taskId: 'audience_segmentation',
              name: 'Psychographic Audience Segmentation',
              agentType: 'psychographic-research',
              prompt: 'Analyze psychographic segments for {targetMarket}. Identify values, pain points, motivations, and search behaviors.',
              outputFormat: 'psychographic-segments',
              estimatedDuration: 20
            },
            {
              taskId: 'cultural_context_analysis',
              name: 'Cultural Context & Market Specificity',
              agentType: 'multi-language-content-adapter',
              prompt: 'Analyze cultural context and market-specific nuances for {language} content in {targetMarket}. Identify localization requirements.',
              dependencies: ['audience_segmentation'],
              outputFormat: 'cultural-context',
              estimatedDuration: 15
            }
          ],
          estimatedDuration: 30
        },
        {
          stage: 'outline_creation',
          stageName: 'Comprehensive Outline Creation',
          agents: ['content-outline-architect'],
          tasks: [
            {
              taskId: 'comprehensive_outline',
              name: 'Create Comprehensive Article Outline',
              agentType: 'content-outline-architect',
              prompt: `Create comprehensive article outline following ORCHESTRAI content architecture standards.

MANDATORY REQUIREMENTS:
- Psychographic targeting with percentage distribution
- Primary and secondary keyword strategy
- Content Requirements in paragraph form (NOT lists)
- Engagement Elements (tables, boxes, occasional lists)
- Word count distribution per section
- Internal linking architecture planning
- Conversion path optimization strategy

TARGET LANGUAGE: {language}
MARKET FOCUS: {targetMarket}
PSYCHOGRAPHIC SEGMENTS: {psychographicSegments}`,
              dependencies: ['cultural_context_analysis'],
              outputFormat: 'comprehensive-outline',
              estimatedDuration: 25
            },
            {
              taskId: 'psychographic_targeting_map',
              name: 'Psychographic Targeting Map',
              agentType: 'content-outline-architect',
              prompt: 'Map each content section to specific psychographic segments. Define emotional tones and engagement strategies per segment.',
              dependencies: ['comprehensive_outline'],
              outputFormat: 'targeting-map',
              estimatedDuration: 15
            }
          ],
          dependencies: ['psychographic_analysis'],
          qualityGate: 'outline_validation_blocking',
          estimatedDuration: 35
        },
        {
          stage: 'content_writing',
          stageName: 'Content Writing with Language Isolation',
          agents: ['content-writer-specialist', 'multi-language-content-adapter'],
          tasks: [
            {
              taskId: 'article_writing',
              name: 'Write Complete Article',
              agentType: 'content-writer-specialist',
              prompt: `Write complete article following the approved outline with STRICT language isolation.

CRITICAL REQUIREMENTS:
- 100% {language} language purity - ZERO English contamination
- Content architecture compliance (40% short, 40% medium, 20% long paragraphs)
- Conversational expert tone throughout
- Psychographic targeting execution per approved map
- Natural keyword integration
- Cultural authenticity for {targetMarket}

LANGUAGE ISOLATION ENFORCEMENT:
- NO English business terms, jargon, or phrases
- Use authentic {language} equivalents for ALL concepts
- Maintain cultural context and business practices
- Natural transitions between sections`,
              dependencies: ['psychographic_targeting_map'],
              languageIsolation: true,
              outputFormat: 'complete-article',
              estimatedDuration: 45
            },
            {
              taskId: 'language_isolation_enforcement',
              name: 'Language Isolation Validation',
              agentType: 'multi-language-content-adapter',
              prompt: 'Validate 100% {language} purity. Identify and flag ANY English contamination. Provide authentic {language} replacements.',
              dependencies: ['article_writing'],
              outputFormat: 'language-validation-report',
              estimatedDuration: 15
            }
          ],
          dependencies: ['outline_creation'],
          languageIsolation: true,
          estimatedDuration: 55
        },
        {
          stage: 'quality_validation',
          stageName: 'Comprehensive Quality Validation',
          agents: ['content-quality-validator', 'content-ai-phrase-detector'],
          tasks: [
            {
              taskId: 'quality_assessment',
              name: 'Content Quality Assessment',
              agentType: 'content-quality-validator',
              prompt: `Perform comprehensive quality validation with language contamination detection.

VALIDATION AREAS:
1. Language Purity (CRITICAL): Scan for ANY English contamination
2. Content Architecture: Paragraph distribution and element compliance
3. Strategic Quality: Psychographic targeting and market authenticity
4. SEO Integration: Keyword placement and search intent alignment
5. Conversion Optimization: Reader journey and CTA effectiveness

CRITICAL THRESHOLDS:
- Language Purity: Must be 100% (ANY contamination = FAIL)
- Content Architecture: 90%+ compliance required
- Overall Quality: 90%+ for approval`,
              dependencies: ['language_isolation_enforcement'],
              outputFormat: 'quality-report',
              estimatedDuration: 20
            },
            {
              taskId: 'ai_phrase_detection',
              name: 'AI Phrase Detection & Humanization',
              agentType: 'content-ai-phrase-detector',
              prompt: 'Detect AI-generated phrases and provide humanization recommendations. Ensure natural, conversational voice throughout.',
              dependencies: ['quality_assessment'],
              outputFormat: 'humanization-report',
              estimatedDuration: 15
            }
          ],
          dependencies: ['content_writing'],
          criticalValidation: true,
          qualityGate: 'language_purity_100',
          estimatedDuration: 30
        },
        {
          stage: 'internal_linking',
          stageName: 'Internal Linking Strategy',
          agents: ['seo-content-optimization'],
          tasks: [
            {
              taskId: 'linking_strategy',
              name: 'Create Internal Linking Strategy',
              agentType: 'seo-content-optimization',
              prompt: `Create comprehensive internal linking strategy.

REQUIREMENTS:
- Bidirectional linking architecture
- SEO authority flow optimization
- Conversion path enhancement
- Reader journey mapping
- Keyword synergy strengthening

INTEGRATION TARGETS:
- Existing hub content
- Strategic anchor text optimization
- Natural link placement within content flow`,
              dependencies: ['quality_assessment'],
              outputFormat: 'linking-strategy',
              estimatedDuration: 20
            },
            {
              taskId: 'conversion_path_optimization',
              name: 'Conversion Path Optimization',
              agentType: 'seo-content-optimization',
              prompt: 'Optimize conversion paths through strategic link placement. Create natural CTAs integrated with psychographic targeting.',
              dependencies: ['linking_strategy'],
              outputFormat: 'conversion-optimization',
              estimatedDuration: 15
            }
          ],
          dependencies: ['quality_validation'],
          estimatedDuration: 30
        }
      ],

      estimatedDuration: 180, // Total minutes
      qualityGates: ['outline_validation_blocking', 'language_purity_100', 'overall_quality_90', 'content_architecture_compliance'],
      coordinationPattern: 'sequential', // Strict enforcement required

      supportingTemplates: [],
      requiredDomains: ['content', 'seo', 'multilingual'],
      complexity: 'high'
    };
  }

  /**
   * Advertising Campaign Pipeline Template
   */
  advertisingCampaignPipeline() {
    return {
      id: 'advertising-campaign',
      name: 'Advertising Campaign Pipeline',
      description: 'Complete advertising campaign creation from offer development to launch',
      version: '2.0',

      stages: [
        {
          stage: 'offer_creation',
          stageName: 'Grand Slam Offer Creation',
          agents: ['offer-creation-specialist'],
          tasks: [
            {
              taskId: 'grand_slam_offer_development',
              name: 'Grand Slam Offer Development',
              agentType: 'offer-creation-specialist',
              prompt: 'Create Grand Slam Offer using Alex Hormozi $100M Offers methodology for {clientName}. Focus on value equation, risk reversal, and urgency.',
              outputFormat: 'grand-slam-offer',
              estimatedDuration: 30
            },
            {
              taskId: 'value_stacking',
              name: 'Value Stack & Guarantee Structure',
              agentType: 'offer-creation-specialist',
              prompt: 'Build comprehensive value stack and guarantee structure. Implement risk reversal strategies.',
              dependencies: ['grand_slam_offer_development'],
              outputFormat: 'value-stack',
              estimatedDuration: 20
            }
          ],
          estimatedDuration: 45
        },
        {
          stage: 'platform_strategy',
          stageName: 'Platform Strategy & Targeting',
          agents: ['google-ads-specialist', 'meta-ads-specialist', 'linkedin-ads-specialist'],
          tasks: [
            {
              taskId: 'platform_selection',
              name: 'Optimal Platform Selection',
              agentType: 'google-ads-specialist',
              prompt: 'Determine optimal advertising platforms for {targetMarket} and offer type. Analyze Google Ads, Meta, LinkedIn suitability.',
              dependencies: ['value_stacking'],
              outputFormat: 'platform-strategy',
              estimatedDuration: 15
            },
            {
              taskId: 'audience_targeting',
              name: 'Advanced Audience Targeting',
              agentType: 'meta-ads-specialist',
              prompt: 'Create detailed audience targeting strategy across selected platforms. Include lookalike audiences and custom segments.',
              dependencies: ['platform_selection'],
              outputFormat: 'audience-targeting',
              estimatedDuration: 20
            },
            {
              taskId: 'budget_allocation',
              name: 'Budget Allocation & Bidding Strategy',
              agentType: 'google-ads-specialist',
              prompt: 'Create optimal budget allocation and bidding strategy across platforms. Include scaling roadmap.',
              dependencies: ['platform_selection'],
              outputFormat: 'budget-strategy',
              estimatedDuration: 15
            }
          ],
          dependencies: ['offer_creation'],
          parallelizable: true,
          estimatedDuration: 35
        },
        {
          stage: 'creative_development',
          stageName: 'Creative Development & Copy Variations',
          agents: ['direct-response-copywriter', 'ad-copy-variation-generator'],
          tasks: [
            {
              taskId: 'hook_development',
              name: 'Hook Development (Pattern Interrupt)',
              agentType: 'direct-response-copywriter',
              prompt: 'Create compelling hooks using pattern interrupt, curiosity gap, and social proof frameworks for {targetMarket}.',
              dependencies: ['audience_targeting'],
              outputFormat: 'hooks',
              estimatedDuration: 20
            },
            {
              taskId: 'copy_variations',
              name: 'A/B Testing Copy Variations',
              agentType: 'ad-copy-variation-generator',
              prompt: 'Generate 15-20 copy variations across emotional triggers, frameworks (AIDA, PAS, PASTOR), and psychological principles.',
              dependencies: ['hook_development'],
              outputFormat: 'copy-variations',
              estimatedDuration: 25
            },
            {
              taskId: 'cta_optimization',
              name: 'CTA Optimization & Testing',
              agentType: 'direct-response-copywriter',
              prompt: 'Create optimized CTAs aligned with offer strength and platform best practices. Include urgency and scarcity elements.',
              dependencies: ['copy_variations'],
              outputFormat: 'cta-strategy',
              estimatedDuration: 15
            }
          ],
          dependencies: ['platform_strategy'],
          estimatedDuration: 50
        },
        {
          stage: 'performance_setup',
          stageName: 'Campaign Setup & Performance Tracking',
          agents: ['google-ads-specialist', 'meta-ads-specialist', 'linkedin-ads-specialist'],
          tasks: [
            {
              taskId: 'campaign_configuration',
              name: 'Campaign Configuration & Structure',
              agentType: 'google-ads-specialist',
              prompt: 'Configure campaign structure across platforms. Implement conversion tracking and attribution models.',
              dependencies: ['cta_optimization'],
              outputFormat: 'campaign-config',
              estimatedDuration: 20
            },
            {
              taskId: 'tracking_setup',
              name: 'Advanced Tracking & Analytics Setup',
              agentType: 'meta-ads-specialist',
              prompt: 'Set up comprehensive tracking: pixels, conversion API, UTM parameters, and analytics dashboards.',
              dependencies: ['campaign_configuration'],
              outputFormat: 'tracking-setup',
              estimatedDuration: 15
            }
          ],
          dependencies: ['creative_development'],
          estimatedDuration: 30
        }
      ],

      estimatedDuration: 90, // Total minutes
      qualityGates: ['offer_validation', 'creative_approval', 'tracking_verification'],
      coordinationPattern: 'mesh', // Dynamic agent coordination

      supportingTemplates: [],
      requiredDomains: ['advertising', 'copywriting'],
      complexity: 'high'
    };
  }

  /**
   * Web Development Pipeline Template
   */
  webDevelopmentPipeline() {
    return {
      id: 'web-development',
      name: 'Web Development Pipeline',
      description: 'Complete web development from wireframes to deployment',
      version: '2.0',

      stages: [
        {
          stage: 'wireframe_design',
          stageName: 'Wireframe & Information Architecture',
          agents: ['wireframe-creation-specialist'],
          tasks: [
            {
              taskId: 'layout_planning',
              name: 'Layout Planning & Structure',
              agentType: 'wireframe-creation-specialist',
              prompt: 'Create comprehensive wireframes for {projectType}. Include responsive layouts for desktop, tablet, mobile.',
              outputFormat: 'wireframes',
              estimatedDuration: 30
            },
            {
              taskId: 'user_flow_mapping',
              name: 'User Flow & Journey Mapping',
              agentType: 'wireframe-creation-specialist',
              prompt: 'Design user flows and interaction patterns. Map conversion paths and CTAs.',
              dependencies: ['layout_planning'],
              outputFormat: 'user-flows',
              estimatedDuration: 20
            }
          ],
          estimatedDuration: 45
        },
        {
          stage: 'design_system',
          stageName: 'Design System & Component Library',
          agents: ['design-system-specialist'],
          tasks: [
            {
              taskId: 'component_library',
              name: 'Component Library Creation',
              agentType: 'design-system-specialist',
              prompt: 'Build reusable component library with brand consistency. Include ShadCN UI and MagicUI components.',
              dependencies: ['user_flow_mapping'],
              outputFormat: 'component-library',
              estimatedDuration: 35
            },
            {
              taskId: 'brand_application',
              name: 'Brand System Application',
              agentType: 'design-system-specialist',
              prompt: 'Apply brand colors, typography, spacing system. Create design tokens and style guide.',
              dependencies: ['component_library'],
              outputFormat: 'design-system',
              estimatedDuration: 25
            }
          ],
          dependencies: ['wireframe_design'],
          estimatedDuration: 55
        },
        {
          stage: 'development',
          stageName: 'Frontend & Backend Development',
          agents: ['frontend-developer', 'backend-developer'],
          tasks: [
            {
              taskId: 'frontend_build',
              name: 'Frontend Component Build',
              agentType: 'frontend-developer',
              prompt: 'Build frontend using {framework}. Implement responsive design, animations, and interactions.',
              dependencies: ['brand_application'],
              outputFormat: 'frontend-code',
              estimatedDuration: 60
            },
            {
              taskId: 'api_integration',
              name: 'API & Backend Integration',
              agentType: 'backend-developer',
              prompt: 'Implement API endpoints, database integration, and server-side logic. Handle authentication and data validation.',
              dependencies: ['frontend_build'],
              outputFormat: 'backend-code',
              estimatedDuration: 50
            }
          ],
          dependencies: ['design_system'],
          parallelizable: true,
          estimatedDuration: 80
        },
        {
          stage: 'quality_assurance',
          stageName: 'Testing & Quality Assurance',
          agents: ['web-quality-coordinator'],
          tasks: [
            {
              taskId: 'testing',
              name: 'Comprehensive Testing Suite',
              agentType: 'web-quality-coordinator',
              prompt: 'Execute unit tests, integration tests, and E2E tests. Validate cross-browser compatibility.',
              dependencies: ['api_integration'],
              outputFormat: 'test-results',
              estimatedDuration: 30
            },
            {
              taskId: 'performance_validation',
              name: 'Performance & Accessibility Validation',
              agentType: 'web-quality-coordinator',
              prompt: 'Run Lighthouse audits. Validate Core Web Vitals, accessibility (WCAG), and SEO fundamentals.',
              dependencies: ['testing'],
              outputFormat: 'performance-report',
              estimatedDuration: 20
            }
          ],
          dependencies: ['development'],
          qualityGate: 'qa_validation',
          estimatedDuration: 45
        },
        {
          stage: 'deployment',
          stageName: 'Production Deployment',
          agents: ['deployment-specialist'],
          tasks: [
            {
              taskId: 'production_deployment',
              name: 'Production Deployment',
              agentType: 'deployment-specialist',
              prompt: 'Deploy to production environment. Configure CDN, SSL, DNS, and caching strategies.',
              dependencies: ['performance_validation'],
              outputFormat: 'deployment-config',
              estimatedDuration: 25
            },
            {
              taskId: 'monitoring_setup',
              name: 'Monitoring & Analytics Setup',
              agentType: 'deployment-specialist',
              prompt: 'Set up error tracking, performance monitoring, and analytics. Configure alerts and dashboards.',
              dependencies: ['production_deployment'],
              outputFormat: 'monitoring-config',
              estimatedDuration: 15
            }
          ],
          dependencies: ['quality_assurance'],
          estimatedDuration: 35
        }
      ],

      estimatedDuration: 240, // Total minutes
      qualityGates: ['design_approval', 'qa_validation', 'performance_threshold'],
      coordinationPattern: 'pipeline',

      supportingTemplates: [],
      requiredDomains: ['webdev', 'design', 'quality'],
      complexity: 'very-high'
    };
  }

  /**
   * Reputation Intelligence Pipeline Template
   */
  reputationIntelligencePipeline() {
    return {
      id: 'reputation-intelligence',
      name: 'Reputation Intelligence Pipeline',
      description: 'Automated reputation monitoring and response strategy',
      version: '1.0',

      stages: [
        {
          stage: 'review_monitoring',
          stageName: 'Review Collection & Sentiment Analysis',
          agents: ['reviews-intelligence-specialist'],
          tasks: [
            {
              taskId: 'review_collection',
              name: 'Review Collection & Aggregation',
              agentType: 'reviews-intelligence-specialist',
              prompt: 'Collect and aggregate reviews from Google Business Profile for {targetMarket}. Filter last {daysBack} days.',
              outputFormat: 'review-dataset',
              estimatedDuration: 10
            },
            {
              taskId: 'sentiment_analysis',
              name: 'Sentiment Analysis & Classification',
              agentType: 'reviews-intelligence-specialist',
              prompt: 'Perform sentiment analysis on collected reviews. Classify by rating, sentiment, and urgency.',
              dependencies: ['review_collection'],
              outputFormat: 'sentiment-report',
              estimatedDuration: 15
            }
          ],
          estimatedDuration: 20
        },
        {
          stage: 'negative_review_detection',
          stageName: 'Negative Review Detection & Prioritization',
          agents: ['reviews-intelligence-specialist'],
          tasks: [
            {
              taskId: 'negative_review_identification',
              name: 'Negative Review Identification',
              agentType: 'reviews-intelligence-specialist',
              prompt: 'Identify negative reviews (1-3 stars) and categorize by issue type. Detect patterns and recurring complaints.',
              dependencies: ['sentiment_analysis'],
              outputFormat: 'negative-reviews',
              estimatedDuration: 10
            },
            {
              taskId: 'urgency_assessment',
              name: 'Urgency & Impact Assessment',
              agentType: 'reviews-intelligence-specialist',
              prompt: 'Assess urgency and potential reputation impact of negative reviews. Prioritize response strategy.',
              dependencies: ['negative_review_identification'],
              outputFormat: 'urgency-matrix',
              estimatedDuration: 10
            }
          ],
          dependencies: ['review_monitoring'],
          estimatedDuration: 15
        },
        {
          stage: 'response_strategy',
          stageName: 'Response Strategy & Reputation Management',
          agents: ['direct-response-copywriter'],
          tasks: [
            {
              taskId: 'response_generation',
              name: 'Professional Response Generation',
              agentType: 'direct-response-copywriter',
              prompt: 'Generate professional, empathetic responses to negative reviews. Address concerns and offer solutions for {targetMarket}.',
              dependencies: ['urgency_assessment'],
              outputFormat: 'response-templates',
              estimatedDuration: 20
            },
            {
              taskId: 'reputation_management',
              name: 'Proactive Reputation Management',
              agentType: 'direct-response-copywriter',
              prompt: 'Create proactive reputation management strategy. Include positive review solicitation and issue prevention.',
              dependencies: ['response_generation'],
              outputFormat: 'reputation-strategy',
              estimatedDuration: 15
            }
          ],
          dependencies: ['negative_review_detection'],
          estimatedDuration: 30
        },
        {
          stage: 'competitive_reputation',
          stageName: 'Competitive Reputation Analysis',
          agents: ['seo-competitor-analysis'],
          tasks: [
            {
              taskId: 'competitive_reputation_analysis',
              name: 'Competitive Reputation Benchmarking',
              agentType: 'seo-competitor-analysis',
              prompt: 'Analyze competitor reputation metrics. Compare review ratings, volume, and sentiment trends.',
              dependencies: ['review_monitoring'],
              outputFormat: 'competitive-reputation',
              estimatedDuration: 20
            },
            {
              taskId: 'brand_health_reporting',
              name: 'Brand Health Reporting',
              agentType: 'seo-competitor-analysis',
              prompt: 'Generate comprehensive brand health report with reputation metrics, trends, and recommendations.',
              dependencies: ['competitive_reputation_analysis', 'reputation_management'],
              outputFormat: 'brand-health-report',
              estimatedDuration: 15
            }
          ],
          parallelizable: true,
          estimatedDuration: 30
        }
      ],

      estimatedDuration: 60, // Total minutes
      qualityGates: ['response_quality', 'sentiment_accuracy'],
      coordinationPattern: 'event-driven', // Reactive to review events

      supportingTemplates: [],
      requiredDomains: ['reputation', 'content'],
      complexity: 'low'
    };
  }

  /**
   * Competitive Analysis Pipeline Template
   */
  competitiveAnalysisPipeline() {
    return {
      id: 'competitive-analysis',
      name: 'Competitive Analysis Pipeline',
      description: 'Comprehensive competitive intelligence and gap analysis',
      version: '1.0',

      stages: [
        {
          stage: 'competitor_identification',
          stageName: 'Competitor Identification & Profiling',
          agents: ['seo-competitor-analysis'],
          tasks: [
            {
              taskId: 'competitor_discovery',
              name: 'Competitor Discovery',
              agentType: 'seo-competitor-analysis',
              prompt: 'Identify top competitors for {targetMarket} across search, social, and market presence.',
              outputFormat: 'competitor-list',
              estimatedDuration: 15
            },
            {
              taskId: 'competitor_profiling',
              name: 'Detailed Competitor Profiling',
              agentType: 'seo-competitor-analysis',
              prompt: 'Create detailed profiles for each competitor including positioning, strengths, weaknesses.',
              dependencies: ['competitor_discovery'],
              outputFormat: 'competitor-profiles',
              estimatedDuration: 25
            }
          ],
          estimatedDuration: 35
        },
        {
          stage: 'domain_analysis',
          stageName: 'Domain & Content Analysis',
          agents: ['seo-competitor-analysis', 'seo-serp-analysis'],
          tasks: [
            {
              taskId: 'domain_keyword_analysis',
              name: 'Competitor Keyword Analysis',
              agentType: 'seo-competitor-analysis',
              prompt: 'Analyze competitor keyword rankings. Identify keyword gaps and opportunities.',
              dependencies: ['competitor_profiling'],
              outputFormat: 'keyword-gaps',
              estimatedDuration: 25
            },
            {
              taskId: 'content_gap_analysis',
              name: 'Content Gap Analysis',
              agentType: 'seo-serp-analysis',
              prompt: 'Identify content gaps where competitors rank but {clientName} does not. Prioritize by traffic potential.',
              dependencies: ['domain_keyword_analysis'],
              outputFormat: 'content-gaps',
              estimatedDuration: 20
            }
          ],
          dependencies: ['competitor_identification'],
          estimatedDuration: 40
        },
        {
          stage: 'strategic_positioning',
          stageName: 'Strategic Positioning & Recommendations',
          agents: ['content-strategy'],
          tasks: [
            {
              taskId: 'positioning_strategy',
              name: 'Competitive Positioning Strategy',
              agentType: 'content-strategy',
              prompt: 'Develop competitive positioning strategy based on identified gaps and strengths for {clientName}.',
              dependencies: ['content_gap_analysis'],
              outputFormat: 'positioning-strategy',
              estimatedDuration: 25
            },
            {
              taskId: 'action_roadmap',
              name: 'Action Plan & Roadmap',
              agentType: 'content-strategy',
              prompt: 'Create actionable roadmap to capitalize on competitive opportunities. Prioritize by impact and effort.',
              dependencies: ['positioning_strategy'],
              outputFormat: 'action-roadmap',
              estimatedDuration: 20
            }
          ],
          dependencies: ['domain_analysis'],
          estimatedDuration: 40
        }
      ],

      estimatedDuration: 90, // Total minutes
      qualityGates: ['data_accuracy', 'strategic_coherence'],
      coordinationPattern: 'sequential',

      supportingTemplates: [],
      requiredDomains: ['seo', 'research'],
      complexity: 'medium'
    };
  }

  /**
   * Psychographic Research Pipeline Template
   */
  psychographicResearchPipeline() {
    return {
      id: 'psychographic-research',
      name: 'Psychographic Research Pipeline',
      description: 'Deep audience psychographic analysis and segmentation',
      version: '1.0',

      stages: [
        {
          stage: 'audience_research',
          stageName: 'Audience Research & Data Collection',
          agents: ['psychographic-research'],
          tasks: [
            {
              taskId: 'data_collection',
              name: 'Psychographic Data Collection',
              agentType: 'psychographic-research',
              prompt: 'Collect psychographic data for {targetMarket}. Analyze search behavior, forum discussions, social media insights.',
              outputFormat: 'psychographic-data',
              estimatedDuration: 30
            },
            {
              taskId: 'segment_identification',
              name: 'Segment Identification',
              agentType: 'psychographic-research',
              prompt: 'Identify distinct psychographic segments. Classify by values, motivations, pain points, and behaviors.',
              dependencies: ['data_collection'],
              outputFormat: 'segments',
              estimatedDuration: 25
            }
          ],
          estimatedDuration: 50
        },
        {
          stage: 'cultural_analysis',
          stageName: 'Cultural Values & Context Analysis',
          agents: ['multi-language-content-adapter'],
          tasks: [
            {
              taskId: 'cultural_values_mapping',
              name: 'Cultural Values Mapping',
              agentType: 'multi-language-content-adapter',
              prompt: 'Map cultural values and regional differences for {targetMarket}. Identify market-specific nuances.',
              dependencies: ['segment_identification'],
              outputFormat: 'cultural-map',
              estimatedDuration: 20
            },
            {
              taskId: 'emotional_triggers',
              name: 'Emotional Triggers & Messaging',
              agentType: 'multi-language-content-adapter',
              prompt: 'Identify emotional triggers and messaging frameworks per psychographic segment for {targetMarket}.',
              dependencies: ['cultural_values_mapping'],
              outputFormat: 'emotional-triggers',
              estimatedDuration: 20
            }
          ],
          dependencies: ['audience_research'],
          estimatedDuration: 35
        },
        {
          stage: 'persona_creation',
          stageName: 'Persona Development & Application',
          agents: ['content-strategy'],
          tasks: [
            {
              taskId: 'persona_development',
              name: 'Detailed Persona Development',
              agentType: 'content-strategy',
              prompt: 'Create detailed personas for each psychographic segment. Include demographics, psychographics, journey stages.',
              dependencies: ['emotional_triggers'],
              outputFormat: 'personas',
              estimatedDuration: 25
            },
            {
              taskId: 'content_application',
              name: 'Content Strategy Application',
              agentType: 'content-strategy',
              prompt: 'Develop content strategy tailored to each persona. Map content types, topics, and emotional approaches.',
              dependencies: ['persona_development'],
              outputFormat: 'persona-content-strategy',
              estimatedDuration: 20
            }
          ],
          dependencies: ['cultural_analysis'],
          estimatedDuration: 40
        }
      ],

      estimatedDuration: 105, // Total minutes
      qualityGates: ['segment_validation', 'cultural_accuracy'],
      coordinationPattern: 'sequential',

      supportingTemplates: [],
      requiredDomains: ['research', 'content'],
      complexity: 'medium'
    };
  }

  /**
   * Simple Content Creation Pipeline (English only)
   */
  contentCreationPipeline() {
    return {
      id: 'content-creation',
      name: 'Content Creation Pipeline',
      description: 'Standard content creation workflow for English content',
      version: '2.0',

      stages: [
        {
          stage: 'outline_creation',
          stageName: 'Content Outline & Planning',
          agents: ['content-outline-architect'],
          tasks: [
            {
              taskId: 'outline_development',
              name: 'Create Content Outline',
              agentType: 'content-outline-architect',
              prompt: 'Create comprehensive content outline with SEO optimization and content architecture planning.',
              outputFormat: 'outline',
              estimatedDuration: 20
            }
          ],
          estimatedDuration: 20
        },
        {
          stage: 'content_writing',
          stageName: 'Content Writing',
          agents: ['content-writer-specialist'],
          tasks: [
            {
              taskId: 'article_creation',
              name: 'Write Complete Article',
              agentType: 'content-writer-specialist',
              prompt: 'Write complete article following approved outline. Ensure natural flow, SEO optimization, and reader engagement.',
              dependencies: ['outline_development'],
              outputFormat: 'article',
              estimatedDuration: 40
            }
          ],
          dependencies: ['outline_creation'],
          estimatedDuration: 40
        },
        {
          stage: 'quality_validation',
          stageName: 'Quality Assurance',
          agents: ['content-quality-validator'],
          tasks: [
            {
              taskId: 'quality_check',
              name: 'Content Quality Validation',
              agentType: 'content-quality-validator',
              prompt: 'Validate content quality, readability, SEO compliance, and overall effectiveness.',
              dependencies: ['article_creation'],
              outputFormat: 'quality-report',
              estimatedDuration: 15
            }
          ],
          dependencies: ['content_writing'],
          qualityGate: 'overall_quality_85',
          estimatedDuration: 15
        },
        {
          stage: 'seo_optimization',
          stageName: 'SEO Optimization',
          agents: ['seo-content-optimization'],
          tasks: [
            {
              taskId: 'seo_enhancement',
              name: 'SEO Enhancement & Internal Linking',
              agentType: 'seo-content-optimization',
              prompt: 'Optimize SEO elements and create internal linking strategy for content ecosystem integration.',
              dependencies: ['quality_check'],
              outputFormat: 'seo-optimized-content',
              estimatedDuration: 20
            }
          ],
          dependencies: ['quality_validation'],
          estimatedDuration: 20
        }
      ],

      estimatedDuration: 75, // Total minutes
      qualityGates: ['outline_approval', 'overall_quality_85'],
      coordinationPattern: 'sequential',

      supportingTemplates: [],
      requiredDomains: ['content', 'seo'],
      complexity: 'medium'
    };
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId) {
    return this.templates.get(templateId) || null;
  }

  /**
   * Get supporting templates for primary template
   */
  getSupportingTemplates(primaryTemplate, analysis) {
    const supporting = [];

    // If multi-language content, add psychographic research if not already there
    if (primaryTemplate.id === 'content-creation-multi-language' &&
        !analysis.existingContext?.psychographicData?.length) {
      supporting.push(this.templates.get('psychographic-research'));
    }

    // If advertising campaign, ensure psychographic research exists
    if (primaryTemplate.id === 'advertising-campaign' &&
        !analysis.existingContext?.psychographicData?.length) {
      supporting.push(this.templates.get('psychographic-research'));
    }

    return supporting.filter(Boolean);
  }

  /**
   * Find similar templates based on analysis
   */
  findSimilarTemplates(analysis) {
    const similar = [];
    const targetCapabilities = new Set(analysis.requiredCapabilities);

    for (const template of this.templates.values()) {
      let matchScore = 0;

      // Check capability overlap
      const templateCapabilities = this.extractTemplateCapabilities(template);
      for (const cap of templateCapabilities) {
        if (targetCapabilities.has(cap)) {
          matchScore += 1;
        }
      }

      // Check domain overlap
      for (const domain of template.requiredDomains) {
        if (analysis.domainRequirements.includes(domain)) {
          matchScore += 2;
        }
      }

      if (matchScore > 0) {
        similar.push({ template, matchScore });
      }
    }

    // Sort by match score
    similar.sort((a, b) => b.matchScore - a.matchScore);

    return similar.map(s => s.template);
  }

  /**
   * Local SEO Pipeline Template
   */
  localSeoPipeline() {
    return {
      id: 'local-seo',
      name: 'Local SEO Pipeline',
      description: 'Comprehensive local SEO optimization from GBP to local citations and review management',
      version: '1.0',

      stages: [
        {
          stage: 'gbp_audit_optimization',
          stageName: 'Google Business Profile Audit & Optimization',
          agents: ['seo-local-seo'],
          tasks: [
            {
              taskId: 'gbp_audit',
              name: 'GBP Profile Audit',
              agentType: 'seo-local-seo',
              prompt: 'Conduct comprehensive audit of Google Business Profile for {businessName}. Analyze categories, business description, attributes, photos, posts, and Q&A optimization opportunities.',
              outputFormat: 'gbp-audit-report',
              estimatedDuration: 10
            },
            {
              taskId: 'gbp_optimization',
              name: 'GBP Optimization Recommendations',
              agentType: 'seo-local-seo',
              prompt: 'Create detailed GBP optimization plan including category selection, attribute optimization, photo strategy, post calendar, and Q&A management for {businessName}.',
              dependencies: ['gbp_audit'],
              outputFormat: 'gbp-optimization-plan',
              estimatedDuration: 10
            }
          ],
          parallelizable: false,
          estimatedDuration: 20
        },
        {
          stage: 'local_citation_building',
          stageName: 'Local Citation Building & NAP Consistency',
          agents: ['seo-local-seo'],
          tasks: [
            {
              taskId: 'nap_audit',
              name: 'NAP Consistency Audit',
              agentType: 'seo-local-seo',
              prompt: 'Audit NAP (Name, Address, Phone) consistency across all major directories and citations for {businessName}. Identify inconsistencies and opportunities.',
              outputFormat: 'nap-audit-report',
              estimatedDuration: 10
            },
            {
              taskId: 'citation_building_strategy',
              name: 'Citation Building Strategy',
              agentType: 'seo-local-seo',
              prompt: 'Develop comprehensive local citation building strategy for {businessName} targeting {location}. Prioritize industry-specific and location-specific directories.',
              dependencies: ['nap_audit'],
              outputFormat: 'citation-building-plan',
              estimatedDuration: 15
            }
          ],
          parallelizable: false,
          estimatedDuration: 25
        },
        {
          stage: 'review_management',
          stageName: 'Review Management Strategy',
          agents: ['reviews-intelligence-specialist', 'seo-local-seo'],
          tasks: [
            {
              taskId: 'review_analysis',
              name: 'Current Review Analysis',
              agentType: 'reviews-intelligence-specialist',
              prompt: 'Analyze current Google reviews for {businessName}, identify patterns in negative reviews, competitor review intelligence, and sentiment trends.',
              outputFormat: 'review-analysis-report',
              estimatedDuration: 8
            },
            {
              taskId: 'review_generation_strategy',
              name: 'Review Generation Strategy',
              agentType: 'seo-local-seo',
              prompt: 'Create review generation and management strategy including review request templates, response guidelines, and reputation monitoring for {businessName}.',
              dependencies: ['review_analysis'],
              outputFormat: 'review-strategy',
              estimatedDuration: 7
            }
          ],
          parallelizable: false,
          estimatedDuration: 15
        },
        {
          stage: 'local_content_creation',
          stageName: 'Local Content Strategy',
          agents: ['seo-local-seo'],
          tasks: [
            {
              taskId: 'local_keyword_research',
              name: 'Local Keyword Research',
              agentType: 'seo-local-seo',
              prompt: 'Conduct local keyword research for {businessName} in {location}. Focus on "near me" searches, location modifiers, and local intent keywords.',
              outputFormat: 'local-keyword-dataset',
              estimatedDuration: 10
            },
            {
              taskId: 'local_content_plan',
              name: 'Local Content Plan',
              agentType: 'seo-local-seo',
              prompt: 'Develop local content strategy including location pages, local blog topics, and community engagement content for {businessName}.',
              dependencies: ['local_keyword_research'],
              outputFormat: 'local-content-plan',
              estimatedDuration: 10
            }
          ],
          parallelizable: false,
          estimatedDuration: 20
        },
        {
          stage: 'local_link_building',
          stageName: 'Local Link Building Strategy',
          agents: ['seo-local-seo'],
          tasks: [
            {
              taskId: 'local_link_opportunities',
              name: 'Local Link Opportunity Identification',
              agentType: 'seo-local-seo',
              prompt: 'Identify local link building opportunities including chamber of commerce, local business associations, community sponsorships, and local media for {businessName} in {location}.',
              outputFormat: 'local-link-opportunities',
              estimatedDuration: 10
            }
          ],
          parallelizable: true,
          estimatedDuration: 10
        }
      ],

      // Overall pipeline metrics
      estimatedDuration: 90, // Total pipeline duration
      complexity: 'moderate',
      requiredDomains: ['local-seo'],
      primaryAgent: 'seo-local-seo',
      supportingAgents: ['reviews-intelligence-specialist'],

      // Quality gates
      qualityGates: [
        {
          stage: 'gbp_audit_optimization',
          condition: 'GBP optimization plan includes all critical elements',
          blocking: true
        },
        {
          stage: 'local_citation_building',
          condition: 'NAP consistency verified across top 20 citations',
          blocking: true
        },
        {
          stage: 'review_management',
          condition: 'Review strategy includes response templates for 1-5 star reviews',
          blocking: false
        },
        {
          stage: 'local_content_creation',
          condition: 'Local keyword dataset includes minimum 20 keywords',
          blocking: false
        }
      ],

      // Output configuration
      deliverables: {
        path: 'projects/{projectId}/deliverables/local-seo',
        files: [
          'gbp-optimization-plan.json',
          'citation-building-strategy.json',
          'review-management-strategy.json',
          'local-content-plan.json',
          'local-link-opportunities.json'
        ]
      }
    };
  }

  /**
   * Email Marketing Pipeline Template
   */
  emailMarketingPipeline() {
    return {
      id: 'email-marketing',
      name: 'Email Marketing Pipeline',
      description: 'Complete email marketing automation from audience research to nurture sequences and campaign setup',
      version: '1.0',

      stages: [
        {
          stage: 'audience_research',
          stageName: 'Audience Research & Segmentation',
          agents: ['client-icp-analyst'],
          tasks: [
            {
              taskId: 'icp_analysis',
              name: 'Ideal Customer Profile Analysis',
              agentType: 'client-icp-analyst',
              prompt: 'Analyze target audience for {clientName} email campaigns. Identify psychographic segments, pain points, and messaging preferences.',
              outputFormat: 'icp-analysis',
              estimatedDuration: 12
            },
            {
              taskId: 'segmentation_strategy',
              name: 'Email List Segmentation Strategy',
              agentType: 'email-marketing-automator',
              prompt: 'Create email list segmentation strategy based on demographics, behavior, engagement level, and lifecycle stage for {clientName}.',
              dependencies: ['icp_analysis'],
              outputFormat: 'segmentation-strategy',
              estimatedDuration: 8
            }
          ],
          parallelizable: false,
          estimatedDuration: 20
        },
        {
          stage: 'cold_email_campaign',
          stageName: 'Cold Email Campaign Creation',
          agents: ['cold-email-copywriter'],
          tasks: [
            {
              taskId: 'cold_email_sequence',
              name: 'Cold Email Sequence (5 emails)',
              agentType: 'cold-email-copywriter',
              prompt: 'Create personalized cold email sequence (5 emails) for {targetAudience}. Include subject lines, preview text, and follow-up cadence using PREP framework.',
              dependencies: ['icp_analysis'],
              outputFormat: 'cold-email-sequence',
              estimatedDuration: 20
            },
            {
              taskId: 'personalization_strategy',
              name: 'Personalization & Targeting Strategy',
              agentType: 'cold-email-copywriter',
              prompt: 'Develop personalization strategy including dynamic variables, account-based messaging, and trigger-based customization for cold outreach.',
              dependencies: ['cold_email_sequence'],
              outputFormat: 'personalization-strategy',
              estimatedDuration: 10
            }
          ],
          parallelizable: false,
          estimatedDuration: 30
        },
        {
          stage: 'nurture_sequence_development',
          stageName: 'Nurture Sequence Development',
          agents: ['nurture-email-copywriter'],
          tasks: [
            {
              taskId: 'welcome_series',
              name: 'Welcome Series (5 emails)',
              agentType: 'nurture-email-copywriter',
              prompt: 'Create welcome email series (5 emails) for new subscribers. Focus on value delivery, expectation setting, and relationship building for {clientName}.',
              dependencies: ['segmentation_strategy'],
              outputFormat: 'welcome-series',
              estimatedDuration: 15
            },
            {
              taskId: 'engagement_nurture',
              name: 'Engagement Nurture Sequence (7 emails)',
              agentType: 'nurture-email-copywriter',
              prompt: 'Develop ongoing engagement nurture sequence (7 emails) with educational content, case studies, and soft conversion opportunities.',
              dependencies: ['welcome_series'],
              outputFormat: 'engagement-nurture',
              estimatedDuration: 20
            },
            {
              taskId: 'reengagement_flow',
              name: 'Re-engagement Win-back Flow',
              agentType: 'nurture-email-copywriter',
              prompt: 'Create re-engagement sequence for inactive subscribers (4 emails) with value reminders, special offers, and sunset policy.',
              outputFormat: 're-engagement-flow',
              estimatedDuration: 12
            }
          ],
          parallelizable: true,
          estimatedDuration: 30
        },
        {
          stage: 'automation_setup',
          stageName: 'Email Automation Setup',
          agents: ['email-marketing-automator'],
          tasks: [
            {
              taskId: 'automation_workflows',
              name: 'Automation Workflow Configuration',
              agentType: 'email-marketing-automator',
              prompt: 'Design email automation workflows including behavioral triggers, lifecycle campaigns, and drip sequences for {clientName} using ActiveCampaign/HubSpot.',
              dependencies: ['welcome_series', 'engagement_nurture'],
              outputFormat: 'automation-workflows',
              estimatedDuration: 15
            },
            {
              taskId: 'lead_scoring',
              name: 'Lead Scoring & Tagging System',
              agentType: 'email-marketing-automator',
              prompt: 'Create lead scoring system with engagement-based scoring rules, tagging logic, and automated segmentation triggers.',
              dependencies: ['automation_workflows'],
              outputFormat: 'lead-scoring-system',
              estimatedDuration: 10
            }
          ],
          parallelizable: false,
          estimatedDuration: 25
        },
        {
          stage: 'ab_testing_strategy',
          stageName: 'A/B Testing & Optimization',
          agents: ['email-marketing-automator'],
          tasks: [
            {
              taskId: 'testing_plan',
              name: 'A/B Testing Plan',
              agentType: 'email-marketing-automator',
              prompt: 'Develop comprehensive A/B testing plan for subject lines, preview text, CTA buttons, and send times. Include success metrics and testing schedule.',
              outputFormat: 'testing-plan',
              estimatedDuration: 8
            }
          ],
          parallelizable: true,
          estimatedDuration: 8
        },
        {
          stage: 'performance_optimization',
          stageName: 'Performance Tracking & Optimization',
          agents: ['email-marketing-automator'],
          tasks: [
            {
              taskId: 'analytics_setup',
              name: 'Analytics & Tracking Setup',
              agentType: 'email-marketing-automator',
              prompt: 'Configure email analytics tracking including open rates, click-through rates, conversion tracking, and attribution setup for {clientName}.',
              outputFormat: 'analytics-configuration',
              estimatedDuration: 7
            }
          ],
          parallelizable: true,
          estimatedDuration: 7
        }
      ],

      // Overall pipeline metrics
      estimatedDuration: 120,
      complexity: 'advanced',
      requiredDomains: ['email-marketing'],
      primaryAgent: 'email-marketing-automator',
      supportingAgents: ['cold-email-copywriter', 'nurture-email-copywriter', 'client-icp-analyst'],

      // Quality gates
      qualityGates: [
        {
          stage: 'audience_research',
          condition: 'ICP analysis includes minimum 3 distinct segments',
          blocking: true
        },
        {
          stage: 'cold_email_campaign',
          condition: 'Cold email sequence includes personalization tokens and tested subject lines',
          blocking: true
        },
        {
          stage: 'nurture_sequence_development',
          condition: 'All nurture sequences include value-first content and clear CTAs',
          blocking: true
        },
        {
          stage: 'automation_setup',
          condition: 'Automation workflows include proper triggers and conditional logic',
          blocking: true
        },
        {
          stage: 'ab_testing_strategy',
          condition: 'Testing plan includes minimum 5 test hypotheses',
          blocking: false
        }
      ],

      // Output configuration
      deliverables: {
        path: 'projects/{projectId}/deliverables/email-marketing',
        files: [
          'cold-email-sequence.json',
          'welcome-series.json',
          'engagement-nurture-sequence.json',
          're-engagement-flow.json',
          'automation-workflows.json',
          'lead-scoring-system.json',
          'testing-plan.json'
        ]
      }
    };
  }

  /**
   * Landing Page Optimization Pipeline Template
   */
  landingPageOptimizationPipeline() {
    return {
      id: 'landing-page-optimization',
      name: 'Landing Page Optimization Pipeline',
      description: 'Comprehensive landing page CRO from audit to A/B testing and conversion optimization',
      version: '1.0',

      stages: [
        {
          stage: 'page_audit',
          stageName: 'Current Page Analysis & Audit',
          agents: ['landing-page-optimizer', 'conversion-optimization-specialist'],
          tasks: [
            {
              taskId: 'heuristic_analysis',
              name: 'Heuristic Analysis (LIFT Model)',
              agentType: 'landing-page-optimizer',
              prompt: 'Conduct heuristic analysis of {pageUrl} using LIFT Model. Evaluate Value, Relevance, Clarity, Anxiety, and Distraction factors.',
              outputFormat: 'heuristic-analysis',
              estimatedDuration: 12
            },
            {
              taskId: 'friction_audit',
              name: 'Friction Point Analysis',
              agentType: 'conversion-optimization-specialist',
              prompt: 'Identify all friction points on {pageUrl} including form friction, cognitive load, technical issues, and emotional barriers.',
              outputFormat: 'friction-audit',
              estimatedDuration: 8
            }
          ],
          parallelizable: true,
          estimatedDuration: 15
        },
        {
          stage: 'cro_strategy',
          stageName: 'CRO Strategy Development',
          agents: ['conversion-optimization-specialist'],
          tasks: [
            {
              taskId: 'funnel_analysis',
              name: 'Conversion Funnel Analysis',
              agentType: 'conversion-optimization-specialist',
              prompt: 'Analyze full conversion funnel for {pageUrl}. Identify drop-off points, bottlenecks, and optimization opportunities using MECLABS framework.',
              dependencies: ['friction_audit'],
              outputFormat: 'funnel-analysis',
              estimatedDuration: 15
            },
            {
              taskId: 'optimization_roadmap',
              name: 'CRO Optimization Roadmap',
              agentType: 'conversion-optimization-specialist',
              prompt: 'Create prioritized CRO roadmap using PIE framework. Include quick wins, high-impact changes, and long-term optimizations.',
              dependencies: ['funnel_analysis'],
              outputFormat: 'cro-roadmap',
              estimatedDuration: 10
            }
          ],
          parallelizable: false,
          estimatedDuration: 25
        },
        {
          stage: 'ab_test_design',
          stageName: 'A/B Test Design & Implementation',
          agents: ['landing-page-optimizer'],
          tasks: [
            {
              taskId: 'headline_testing',
              name: 'Headline Variation Testing',
              agentType: 'landing-page-optimizer',
              prompt: 'Create 3 headline variations for {pageUrl} using proven headline formulas. Include benefit-focused and outcome-oriented options.',
              dependencies: ['heuristic_analysis'],
              outputFormat: 'headline-variations',
              estimatedDuration: 10
            },
            {
              taskId: 'cta_optimization',
              name: 'CTA Button Optimization',
              agentType: 'landing-page-optimizer',
              prompt: 'Design CTA button variations testing copy, color, placement, and size. Create 3 variations based on conversion psychology.',
              dependencies: ['friction_audit'],
              outputFormat: 'cta-variations',
              estimatedDuration: 8
            },
            {
              taskId: 'test_implementation_plan',
              name: 'A/B Test Implementation Plan',
              agentType: 'landing-page-optimizer',
              prompt: 'Create comprehensive A/B test implementation plan including test setup, traffic allocation, success metrics, and statistical significance requirements.',
              dependencies: ['headline_testing', 'cta_optimization'],
              outputFormat: 'test-plan',
              estimatedDuration: 7
            }
          ],
          parallelizable: true,
          estimatedDuration: 20
        },
        {
          stage: 'element_optimization',
          stageName: 'Conversion Element Optimization',
          agents: ['landing-page-optimizer', 'conversion-optimization-specialist'],
          tasks: [
            {
              taskId: 'social_proof_strategy',
              name: 'Social Proof Integration Strategy',
              agentType: 'landing-page-optimizer',
              prompt: 'Design social proof strategy for {pageUrl} including testimonials, case studies, client logos, and trust badges placement.',
              outputFormat: 'social-proof-strategy',
              estimatedDuration: 8
            },
            {
              taskId: 'form_optimization',
              name: 'Form Optimization',
              agentType: 'conversion-optimization-specialist',
              prompt: 'Optimize forms on {pageUrl} by reducing fields, adding inline validation, implementing multi-step flow, and improving mobile experience.',
              dependencies: ['friction_audit'],
              outputFormat: 'form-optimization-plan',
              estimatedDuration: 10
            },
            {
              taskId: 'mobile_optimization',
              name: 'Mobile Conversion Optimization',
              agentType: 'landing-page-optimizer',
              prompt: 'Create mobile-specific optimization recommendations including tap targets, scroll depth, form simplification, and sticky CTAs for {pageUrl}.',
              outputFormat: 'mobile-optimization',
              estimatedDuration: 10
            }
          ],
          parallelizable: true,
          estimatedDuration: 15
        },
        {
          stage: 'monitoring_iteration',
          stageName: 'Performance Monitoring & Iteration',
          agents: ['conversion-optimization-specialist'],
          tasks: [
            {
              taskId: 'analytics_configuration',
              name: 'Conversion Analytics Setup',
              agentType: 'conversion-optimization-specialist',
              prompt: 'Configure comprehensive conversion tracking including goal setup, event tracking, heatmaps, and session recording for {pageUrl}.',
              outputFormat: 'analytics-setup',
              estimatedDuration: 10
            },
            {
              taskId: 'iteration_framework',
              name: 'Continuous Optimization Framework',
              agentType: 'conversion-optimization-specialist',
              prompt: 'Create ongoing optimization framework with monthly testing cadence, performance review schedule, and iteration priorities.',
              dependencies: ['analytics_configuration'],
              outputFormat: 'optimization-framework',
              estimatedDuration: 8
            }
          ],
          parallelizable: false,
          estimatedDuration: 15
        }
      ],

      // Overall pipeline metrics
      estimatedDuration: 105,
      complexity: 'advanced',
      requiredDomains: ['webdev', 'cro'],
      primaryAgent: 'landing-page-optimizer',
      supportingAgents: ['conversion-optimization-specialist'],

      // Quality gates
      qualityGates: [
        {
          stage: 'page_audit',
          condition: 'LIFT Model analysis covers all 5 factors with scores',
          blocking: true
        },
        {
          stage: 'cro_strategy',
          condition: 'CRO roadmap includes minimum 10 prioritized optimizations',
          blocking: true
        },
        {
          stage: 'ab_test_design',
          condition: 'A/B test plan includes proper sample size calculations and statistical significance requirements',
          blocking: true
        },
        {
          stage: 'element_optimization',
          condition: 'Form optimization reduces fields by minimum 30%',
          blocking: false
        },
        {
          stage: 'monitoring_iteration',
          condition: 'Analytics setup includes conversion goals and micro-conversions',
          blocking: true
        }
      ],

      // Output configuration
      deliverables: {
        path: 'projects/{projectId}/deliverables/landing-page-optimization',
        files: [
          'heuristic-analysis.json',
          'friction-audit.json',
          'cro-roadmap.json',
          'headline-variations.json',
          'cta-variations.json',
          'test-implementation-plan.json',
          'social-proof-strategy.json',
          'form-optimization.json',
          'mobile-optimization.json',
          'analytics-setup.json'
        ]
      }
    };
  }

  /**
   * Extract capabilities from template
   */
  extractTemplateCapabilities(template) {
    const capabilities = new Set();

    for (const stage of template.stages) {
      for (const task of stage.tasks) {
        const taskCaps = this.inferCapabilitiesFromAgent(task.agentType);
        taskCaps.forEach(cap => capabilities.add(cap));
      }
    }

    return Array.from(capabilities);
  }

  /**
   * Infer capabilities from agent type
   */
  inferCapabilitiesFromAgent(agentType) {
    const agentCapabilityMap = {
      'seo-keyword-research': ['keyword-research', 'search-volume-analysis'],
      'seo-intent-mapping': ['search-intent', 'user-journey'],
      'content-writer-specialist': ['content-writing', 'copywriting'],
      'content-quality-validator': ['quality-validation', 'qa'],
      'psychographic-research': ['psychographic-analysis', 'audience-research'],
      'offer-creation-specialist': ['offer-creation', 'value-proposition'],
      'wireframe-creation-specialist': ['wireframe-design', 'ux-design']
    };

    return agentCapabilityMap[agentType] || [];
  }

  /**
   * Technical SEO Audit Pipeline Template
   */
  technicalSeoAuditPipeline() {
    return {
      id: 'technical-seo-audit',
      name: 'Technical SEO Audit Pipeline',
      description: 'Comprehensive technical SEO audit from Core Web Vitals to crawl analysis and schema markup validation',
      version: '1.0',

      stages: [
        {
          stage: 'crawl_analysis',
          stageName: 'Crawl Analysis & Site Architecture',
          agents: ['seo-technical-analysis'],
          tasks: [
            {
              taskId: 'site_crawl',
              name: 'Comprehensive Site Crawl',
              agentType: 'seo-technical-analysis',
              prompt: 'Perform comprehensive crawl of {siteUrl} using Screaming Frog or Sitebulb. Analyze URL structure, status codes, redirects, and crawl depth.',
              outputFormat: 'crawl-report',
              estimatedDuration: 20
            },
            {
              taskId: 'indexability_audit',
              name: 'Indexability & Robots Analysis',
              agentType: 'seo-technical-analysis',
              prompt: 'Audit indexability issues including robots.txt, noindex tags, canonical issues, and XML sitemap validation for {siteUrl}.',
              dependencies: ['site_crawl'],
              outputFormat: 'indexability-report',
              estimatedDuration: 15
            },
            {
              taskId: 'internal_linking_audit',
              name: 'Internal Linking Architecture Audit',
              agentType: 'seo-technical-analysis',
              prompt: 'Analyze internal linking structure, PageRank flow, orphan pages, and link depth issues.',
              dependencies: ['site_crawl'],
              outputFormat: 'linking-audit',
              estimatedDuration: 15
            }
          ],
          parallelizable: false,
          estimatedDuration: 50
        },
        {
          stage: 'core_web_vitals',
          stageName: 'Core Web Vitals & Performance Audit',
          agents: ['seo-technical-analysis', 'performance-testing-expert'],
          tasks: [
            {
              taskId: 'lighthouse_audit',
              name: 'Lighthouse Performance Audit',
              agentType: 'seo-technical-analysis',
              prompt: 'Run Lighthouse CI audit for {siteUrl} analyzing INP, LCP, CLS, FCP, and TTFB. Test on mobile and desktop viewports.',
              outputFormat: 'lighthouse-report',
              estimatedDuration: 15
            },
            {
              taskId: 'cwv_analysis',
              name: 'Core Web Vitals Analysis',
              agentType: 'performance-testing-expert',
              prompt: 'Analyze field data from CrUX and lab data from Lighthouse. Identify performance bottlenecks affecting SEO rankings.',
              dependencies: ['lighthouse_audit'],
              outputFormat: 'cwv-analysis',
              estimatedDuration: 15
            },
            {
              taskId: 'speed_optimization_plan',
              name: 'Speed Optimization Recommendations',
              agentType: 'seo-technical-analysis',
              prompt: 'Create prioritized speed optimization plan including image optimization, code splitting, lazy loading, and server optimization for {siteUrl}.',
              dependencies: ['cwv_analysis'],
              outputFormat: 'speed-optimization-plan',
              estimatedDuration: 15
            }
          ],
          parallelizable: true,
          estimatedDuration: 45
        },
        {
          stage: 'security_validation',
          stageName: 'Security & Technical Validation',
          agents: ['security-testing-specialist', 'seo-technical-analysis'],
          tasks: [
            {
              taskId: 'https_ssl_audit',
              name: 'HTTPS & SSL Certificate Audit',
              agentType: 'security-testing-specialist',
              prompt: 'Audit SSL certificate validity, mixed content issues, HSTS implementation, and secure protocol enforcement for {siteUrl}.',
              outputFormat: 'ssl-audit',
              estimatedDuration: 10
            },
            {
              taskId: 'security_headers_audit',
              name: 'Security Headers Validation',
              agentType: 'security-testing-specialist',
              prompt: 'Validate security headers including CSP, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy.',
              dependencies: ['https_ssl_audit'],
              outputFormat: 'security-headers-report',
              estimatedDuration: 10
            },
            {
              taskId: 'vulnerability_scan',
              name: 'Basic Vulnerability Scan',
              agentType: 'security-testing-specialist',
              prompt: 'Perform basic security scan using OWASP ZAP passive mode. Identify common vulnerabilities affecting SEO (clickjacking, insecure forms).',
              outputFormat: 'vulnerability-report',
              estimatedDuration: 10
            }
          ],
          parallelizable: true,
          estimatedDuration: 30
        },
        {
          stage: 'schema_markup',
          stageName: 'Schema Markup & Structured Data Audit',
          agents: ['seo-technical-analysis'],
          tasks: [
            {
              taskId: 'schema_validation',
              name: 'Schema Markup Validation',
              agentType: 'seo-technical-analysis',
              prompt: 'Validate existing schema markup using Google Rich Results Test and Schema.org validator. Identify missing or broken structured data.',
              outputFormat: 'schema-validation',
              estimatedDuration: 15
            },
            {
              taskId: 'schema_opportunities',
              name: 'Schema Implementation Opportunities',
              agentType: 'seo-technical-analysis',
              prompt: 'Identify schema markup opportunities including Organization, Product, Breadcrumb, FAQ, HowTo, and Review schema for {siteUrl}.',
              dependencies: ['schema_validation'],
              outputFormat: 'schema-opportunities',
              estimatedDuration: 15
            }
          ],
          parallelizable: false,
          estimatedDuration: 30
        },
        {
          stage: 'mobile_optimization',
          stageName: 'Mobile-First & Responsive Optimization',
          agents: ['seo-technical-analysis'],
          tasks: [
            {
              taskId: 'mobile_usability',
              name: 'Mobile Usability Audit',
              agentType: 'seo-technical-analysis',
              prompt: 'Audit mobile usability using Google Mobile-Friendly Test. Analyze tap targets, viewport configuration, and mobile readability for {siteUrl}.',
              outputFormat: 'mobile-usability-report',
              estimatedDuration: 10
            },
            {
              taskId: 'responsive_design_validation',
              name: 'Responsive Design Validation',
              agentType: 'seo-technical-analysis',
              prompt: 'Validate responsive design implementation across breakpoints. Test mobile navigation, forms, and conversion elements.',
              dependencies: ['mobile_usability'],
              outputFormat: 'responsive-validation',
              estimatedDuration: 15
            }
          ],
          parallelizable: true,
          estimatedDuration: 25
        }
      ],

      // Overall pipeline metrics
      estimatedDuration: 180,
      complexity: 'advanced',
      requiredDomains: ['seo', 'performance', 'security'],
      primaryAgent: 'seo-technical-analysis',
      supportingAgents: ['performance-testing-expert', 'security-testing-specialist'],

      // Quality gates
      qualityGates: [
        {
          stage: 'crawl_analysis',
          condition: 'Crawl report identifies all indexability issues and URL structure problems',
          blocking: true
        },
        {
          stage: 'core_web_vitals',
          condition: 'Core Web Vitals analysis includes field and lab data with actionable recommendations',
          blocking: true
        },
        {
          stage: 'security_validation',
          condition: 'All critical security issues identified and prioritized',
          blocking: true
        },
        {
          stage: 'schema_markup',
          condition: 'Schema validation complete with minimum 5 implementation opportunities identified',
          blocking: false
        },
        {
          stage: 'mobile_optimization',
          condition: 'Mobile usability score above 90/100',
          blocking: false
        }
      ],

      coordinationPattern: 'pipeline',

      // Output configuration
      deliverables: {
        path: 'projects/{projectId}/deliverables/technical-seo',
        files: [
          'crawl-report.json',
          'indexability-report.json',
          'linking-audit.json',
          'lighthouse-report.json',
          'cwv-analysis.json',
          'speed-optimization-plan.json',
          'ssl-audit.json',
          'security-headers-report.json',
          'schema-validation.json',
          'mobile-usability-report.json'
        ]
      }
    };
  }

  /**
   * Comprehensive Testing Pipeline Template
   */
  comprehensiveTestingPipeline() {
    return {
      id: 'comprehensive-testing',
      name: 'Comprehensive Testing Pipeline',
      description: 'Complete testing strategy from unit to E2E, functional, visual regression, and performance testing',
      version: '1.0',

      stages: [
        {
          stage: 'unit_testing',
          stageName: 'Unit Testing Setup',
          agents: ['unit-test-generator'],
          tasks: [
            {
              taskId: 'unit_test_suite',
              name: 'Unit Test Suite Generation',
              agentType: 'unit-test-generator',
              prompt: 'Generate comprehensive unit tests for {projectPath} using Jest/Vitest. Target 80%+ code coverage with focus on business logic and utilities.',
              outputFormat: 'unit-test-suite',
              estimatedDuration: 20
            },
            {
              taskId: 'test_coverage_analysis',
              name: 'Test Coverage Analysis',
              agentType: 'test-coverage-analyzer',
              prompt: 'Analyze test coverage using Istanbul/NYC. Identify untested code paths and critical missing tests.',
              dependencies: ['unit_test_suite'],
              outputFormat: 'coverage-report',
              estimatedDuration: 10
            }
          ],
          parallelizable: false,
          estimatedDuration: 30
        },
        {
          stage: 'integration_testing',
          stageName: 'Integration Testing',
          agents: ['integration-test-specialist'],
          tasks: [
            {
              taskId: 'api_integration_tests',
              name: 'API Integration Tests',
              agentType: 'integration-test-specialist',
              prompt: 'Create integration tests for API endpoints in {projectPath}. Test request/response cycles, authentication flows, and error handling.',
              outputFormat: 'integration-test-suite',
              estimatedDuration: 20
            },
            {
              taskId: 'database_integration_tests',
              name: 'Database Integration Tests',
              agentType: 'integration-test-specialist',
              prompt: 'Build database integration tests using test containers. Validate CRUD operations, transactions, and data integrity.',
              dependencies: ['api_integration_tests'],
              outputFormat: 'database-test-suite',
              estimatedDuration: 15
            }
          ],
          parallelizable: false,
          estimatedDuration: 35
        },
        {
          stage: 'e2e_testing',
          stageName: 'End-to-End Testing',
          agents: ['e2e-test-automator'],
          tasks: [
            {
              taskId: 'critical_user_flows',
              name: 'Critical User Flow Tests',
              agentType: 'e2e-test-automator',
              prompt: 'Implement E2E tests for critical user flows using Playwright. Cover authentication, checkout, and primary conversion paths for {projectPath}.',
              outputFormat: 'e2e-test-suite',
              estimatedDuration: 25
            },
            {
              taskId: 'cross_browser_testing',
              name: 'Cross-Browser Testing Suite',
              agentType: 'e2e-test-automator',
              prompt: 'Configure cross-browser testing across Chromium, Firefox, and WebKit. Implement parallel execution for efficiency.',
              dependencies: ['critical_user_flows'],
              outputFormat: 'cross-browser-suite',
              estimatedDuration: 15
            }
          ],
          parallelizable: false,
          estimatedDuration: 40
        },
        {
          stage: 'functional_testing',
          stageName: 'Functional Testing',
          agents: ['functional-testing-specialist'],
          tasks: [
            {
              taskId: 'form_validation_tests',
              name: 'Form Validation Tests',
              agentType: 'functional-testing-specialist',
              prompt: 'Create functional tests for all forms in {projectPath}. Test validation rules, error states, and submission workflows.',
              outputFormat: 'form-test-suite',
              estimatedDuration: 15
            },
            {
              taskId: 'business_logic_tests',
              name: 'Business Logic Functional Tests',
              agentType: 'functional-testing-specialist',
              prompt: 'Build functional tests for core business logic including calculations, workflows, and state management.',
              outputFormat: 'business-logic-tests',
              estimatedDuration: 15
            }
          ],
          parallelizable: true,
          estimatedDuration: 30
        },
        {
          stage: 'visual_regression',
          stageName: 'Visual Regression Testing',
          agents: ['visual-regression-tester'],
          tasks: [
            {
              taskId: 'visual_baseline_creation',
              name: 'Visual Baseline Creation',
              agentType: 'visual-regression-tester',
              prompt: 'Create visual regression baseline using Percy or Chromatic for {projectPath}. Capture key pages across desktop, tablet, and mobile viewports.',
              outputFormat: 'visual-baseline',
              estimatedDuration: 15
            },
            {
              taskId: 'component_visual_tests',
              name: 'Component Visual Tests',
              agentType: 'visual-regression-tester',
              prompt: 'Implement component-level visual regression tests. Test UI component states, themes, and responsive behaviors.',
              dependencies: ['visual_baseline_creation'],
              outputFormat: 'component-visual-suite',
              estimatedDuration: 15
            }
          ],
          parallelizable: true,
          estimatedDuration: 30
        },
        {
          stage: 'performance_testing',
          stageName: 'Performance & Load Testing',
          agents: ['performance-testing-expert'],
          tasks: [
            {
              taskId: 'load_testing_suite',
              name: 'Load Testing Suite (k6)',
              agentType: 'performance-testing-expert',
              prompt: 'Create k6 load testing suite for {apiEndpoints}. Implement constant, ramping, spike, and stress test scenarios.',
              outputFormat: 'k6-test-suite',
              estimatedDuration: 20
            },
            {
              taskId: 'performance_benchmarks',
              name: 'Performance Benchmarking',
              agentType: 'performance-testing-expert',
              prompt: 'Establish performance benchmarks and thresholds. Define SLAs for response times, throughput, and error rates.',
              dependencies: ['load_testing_suite'],
              outputFormat: 'performance-benchmarks',
              estimatedDuration: 10
            }
          ],
          parallelizable: true,
          estimatedDuration: 30
        },
        {
          stage: 'test_reporting',
          stageName: 'Test Reporting & Quality Gates',
          agents: ['testing-report-generator'],
          tasks: [
            {
              taskId: 'comprehensive_test_report',
              name: 'Comprehensive Test Report Generation',
              agentType: 'testing-report-generator',
              prompt: 'Generate consolidated test report combining results from all testing stages. Include pass/fail metrics, coverage data, and quality scores.',
              dependencies: ['unit_test_suite', 'e2e_test_suite', 'visual_baseline_creation', 'load_testing_suite'],
              outputFormat: 'test-report',
              estimatedDuration: 15
            }
          ],
          parallelizable: false,
          estimatedDuration: 15
        }
      ],

      // Overall pipeline metrics
      estimatedDuration: 210,
      complexity: 'very-high',
      requiredDomains: ['testing', 'quality'],
      primaryAgent: 'quality-assurance-coordinator',
      supportingAgents: [
        'unit-test-generator',
        'integration-test-specialist',
        'e2e-test-automator',
        'functional-testing-specialist',
        'visual-regression-tester',
        'performance-testing-expert',
        'testing-report-generator'
      ],

      // Quality gates
      qualityGates: [
        {
          stage: 'unit_testing',
          condition: 'Unit test coverage above 80%',
          blocking: true
        },
        {
          stage: 'integration_testing',
          condition: 'All critical API endpoints have integration tests',
          blocking: true
        },
        {
          stage: 'e2e_testing',
          condition: 'Critical user flows pass across all browsers',
          blocking: true
        },
        {
          stage: 'visual_regression',
          condition: 'Visual baseline established for all key pages',
          blocking: false
        },
        {
          stage: 'performance_testing',
          condition: 'Performance benchmarks meet defined SLAs',
          blocking: false
        }
      ],

      coordinationPattern: 'mesh',

      // Output configuration
      deliverables: {
        path: 'projects/{projectId}/deliverables/testing',
        files: [
          'unit-test-suite/',
          'integration-test-suite/',
          'e2e-test-suite/',
          'visual-regression-suite/',
          'k6-test-suite/',
          'test-report.json',
          'coverage-report.json'
        ]
      }
    };
  }

  /**
   * CI/CD Pipeline Template
   */
  cicdPipeline() {
    return {
      id: 'cicd-pipeline',
      name: 'CI/CD Pipeline',
      description: 'Enterprise CI/CD pipeline from build automation to production deployment with quality gates',
      version: '1.0',

      stages: [
        {
          stage: 'pipeline_architecture',
          stageName: 'CI/CD Pipeline Architecture Design',
          agents: ['cicd-pipeline-architect'],
          tasks: [
            {
              taskId: 'pipeline_design',
              name: 'Pipeline Architecture Design',
              agentType: 'cicd-pipeline-architect',
              prompt: 'Design comprehensive CI/CD pipeline architecture for {projectPath}. Define stages, jobs, and workflow orchestration using {cicdPlatform}.',
              outputFormat: 'pipeline-architecture',
              estimatedDuration: 20
            },
            {
              taskId: 'branching_strategy',
              name: 'Git Branching & Deployment Strategy',
              agentType: 'cicd-pipeline-architect',
              prompt: 'Define Git branching strategy (GitFlow/trunk-based) and deployment workflows for dev, staging, and production environments.',
              dependencies: ['pipeline_design'],
              outputFormat: 'branching-strategy',
              estimatedDuration: 15
            }
          ],
          parallelizable: false,
          estimatedDuration: 35
        },
        {
          stage: 'build_automation',
          stageName: 'Build Automation & Optimization',
          agents: ['cicd-pipeline-architect', 'docker-container-specialist'],
          tasks: [
            {
              taskId: 'build_configuration',
              name: 'Build Configuration',
              agentType: 'cicd-pipeline-architect',
              prompt: 'Configure build automation with dependency caching, parallel builds, and matrix builds for {projectPath}. Optimize build times.',
              dependencies: ['branching_strategy'],
              outputFormat: 'build-config',
              estimatedDuration: 15
            },
            {
              taskId: 'docker_build_optimization',
              name: 'Docker Multi-Stage Build',
              agentType: 'docker-container-specialist',
              prompt: 'Create optimized multi-stage Docker builds with BuildKit caching, security hardening, and minimal image size for {projectPath}.',
              dependencies: ['build_configuration'],
              outputFormat: 'dockerfile',
              estimatedDuration: 20
            }
          ],
          parallelizable: false,
          estimatedDuration: 35
        },
        {
          stage: 'quality_gates',
          stageName: 'Quality Gates & Testing Integration',
          agents: ['cicd-pipeline-architect', 'security-testing-specialist'],
          tasks: [
            {
              taskId: 'automated_testing_integration',
              name: 'Automated Testing Integration',
              agentType: 'cicd-pipeline-architect',
              prompt: 'Integrate unit, integration, and E2E tests into CI pipeline. Configure parallel test execution and failure handling.',
              dependencies: ['build_configuration'],
              outputFormat: 'test-integration-config',
              estimatedDuration: 15
            },
            {
              taskId: 'security_scanning',
              name: 'Security Scanning Integration',
              agentType: 'security-testing-specialist',
              prompt: 'Integrate security scanning (SAST, dependency scanning, container scanning) using Snyk, Trivy, and SonarQube in CI pipeline.',
              dependencies: ['docker_build_optimization'],
              outputFormat: 'security-scan-config',
              estimatedDuration: 15
            },
            {
              taskId: 'code_quality_gates',
              name: 'Code Quality Gates',
              agentType: 'cicd-pipeline-architect',
              prompt: 'Configure code quality gates with SonarQube/CodeClimate. Define quality thresholds for coverage, complexity, and duplication.',
              outputFormat: 'quality-gates-config',
              estimatedDuration: 10
            }
          ],
          parallelizable: true,
          estimatedDuration: 40
        },
        {
          stage: 'deployment_automation',
          stageName: 'Deployment Automation',
          agents: ['deployment-orchestration-agent', 'kubernetes-deployment-expert'],
          tasks: [
            {
              taskId: 'deployment_strategy',
              name: 'Deployment Strategy Configuration',
              agentType: 'deployment-orchestration-agent',
              prompt: 'Configure deployment strategies including blue-green, canary, and rolling deployments for {projectPath}. Define rollback procedures.',
              dependencies: ['branching_strategy'],
              outputFormat: 'deployment-strategy',
              estimatedDuration: 20
            },
            {
              taskId: 'kubernetes_deployment',
              name: 'Kubernetes Deployment Configuration',
              agentType: 'kubernetes-deployment-expert',
              prompt: 'Create production Kubernetes manifests with proper resource limits, health probes, HPA, and monitoring integration for {projectPath}.',
              dependencies: ['deployment_strategy', 'docker_build_optimization'],
              outputFormat: 'k8s-manifests',
              estimatedDuration: 25
            }
          ],
          parallelizable: false,
          estimatedDuration: 45
        },
        {
          stage: 'monitoring_observability',
          stageName: 'Monitoring & Observability Integration',
          agents: ['cicd-pipeline-architect'],
          tasks: [
            {
              taskId: 'monitoring_setup',
              name: 'Monitoring & Alerting Setup',
              agentType: 'cicd-pipeline-architect',
              prompt: 'Integrate monitoring and alerting for deployment pipeline. Configure Slack/email notifications, deployment tracking, and failure alerts.',
              outputFormat: 'monitoring-config',
              estimatedDuration: 15
            },
            {
              taskId: 'deployment_metrics',
              name: 'Deployment Metrics Dashboard',
              agentType: 'cicd-pipeline-architect',
              prompt: 'Create deployment metrics dashboard tracking deployment frequency, lead time, MTTR, and change failure rate (DORA metrics).',
              dependencies: ['monitoring_setup'],
              outputFormat: 'metrics-dashboard',
              estimatedDuration: 15
            }
          ],
          parallelizable: true,
          estimatedDuration: 30
        }
      ],

      // Overall pipeline metrics
      estimatedDuration: 185,
      complexity: 'very-high',
      requiredDomains: ['devops', 'cicd', 'kubernetes', 'security'],
      primaryAgent: 'cicd-pipeline-architect',
      supportingAgents: [
        'docker-container-specialist',
        'kubernetes-deployment-expert',
        'deployment-orchestration-agent',
        'security-testing-specialist'
      ],

      // Quality gates
      qualityGates: [
        {
          stage: 'pipeline_architecture',
          condition: 'Pipeline architecture includes all stages with proper dependencies',
          blocking: true
        },
        {
          stage: 'build_automation',
          condition: 'Build times optimized with caching and parallelization',
          blocking: true
        },
        {
          stage: 'quality_gates',
          condition: 'All quality gates configured with proper thresholds',
          blocking: true
        },
        {
          stage: 'deployment_automation',
          condition: 'Deployment strategy includes rollback procedures',
          blocking: true
        },
        {
          stage: 'monitoring_observability',
          condition: 'DORA metrics tracking configured',
          blocking: false
        }
      ],

      coordinationPattern: 'pipeline',

      // Output configuration
      deliverables: {
        path: 'projects/{projectId}/deliverables/cicd',
        files: [
          '.github/workflows/ci-cd.yml',
          'Dockerfile',
          'docker-compose.yml',
          'kubernetes/deployment.yml',
          'kubernetes/service.yml',
          'kubernetes/ingress.yml',
          'kubernetes/hpa.yml',
          'sonar-project.properties',
          'deployment-strategy.md'
        ]
      }
    };
  }

  /**
   * API Development Pipeline Template
   */
  apiDevelopmentPipeline() {
    return {
      id: 'api-development',
      name: 'API Development Pipeline',
      description: 'Complete API development from design to documentation, testing, and production deployment',
      version: '1.0',

      stages: [
        {
          stage: 'api_design',
          stageName: 'API Design & Specification',
          agents: ['api-architect'],
          tasks: [
            {
              taskId: 'api_architecture_design',
              name: 'API Architecture Design',
              agentType: 'api-architect',
              prompt: 'Design API architecture for {projectName}. Define RESTful or GraphQL approach, resource modeling, and endpoint structure.',
              outputFormat: 'api-architecture',
              estimatedDuration: 25
            },
            {
              taskId: 'openapi_specification',
              name: 'OpenAPI/GraphQL Schema Definition',
              agentType: 'api-architect',
              prompt: 'Create comprehensive OpenAPI 3.0 specification or GraphQL schema for {projectName}. Include request/response models, authentication, and error handling.',
              dependencies: ['api_architecture_design'],
              outputFormat: 'api-specification',
              estimatedDuration: 30
            },
            {
              taskId: 'versioning_strategy',
              name: 'API Versioning Strategy',
              agentType: 'api-architect',
              prompt: 'Define API versioning strategy (URL path, header, or query parameter). Plan backward compatibility and deprecation policies.',
              dependencies: ['openapi_specification'],
              outputFormat: 'versioning-strategy',
              estimatedDuration: 15
            }
          ],
          parallelizable: false,
          estimatedDuration: 70
        },
        {
          stage: 'authentication_authorization',
          stageName: 'Authentication & Authorization',
          agents: ['api-architect', 'security-testing-specialist'],
          tasks: [
            {
              taskId: 'auth_implementation',
              name: 'Authentication Implementation',
              agentType: 'api-architect',
              prompt: 'Implement authentication using JWT/OAuth 2.0 for {projectName}. Configure token generation, validation, and refresh mechanisms.',
              dependencies: ['openapi_specification'],
              outputFormat: 'auth-implementation',
              estimatedDuration: 25
            },
            {
              taskId: 'rbac_implementation',
              name: 'RBAC & Authorization',
              agentType: 'api-architect',
              prompt: 'Implement role-based access control (RBAC) with proper permission checks. Define roles, permissions, and resource access policies.',
              dependencies: ['auth_implementation'],
              outputFormat: 'rbac-config',
              estimatedDuration: 20
            },
            {
              taskId: 'security_validation',
              name: 'API Security Validation',
              agentType: 'security-testing-specialist',
              prompt: 'Validate API security implementation against OWASP API Security Top 10. Test authentication, authorization, and input validation.',
              dependencies: ['rbac_implementation'],
              outputFormat: 'security-validation-report',
              estimatedDuration: 15
            }
          ],
          parallelizable: false,
          estimatedDuration: 60
        },
        {
          stage: 'api_implementation',
          stageName: 'API Implementation & Business Logic',
          agents: ['backend-development-specialist', 'api-integration-specialist'],
          tasks: [
            {
              taskId: 'endpoint_implementation',
              name: 'Endpoint Implementation',
              agentType: 'backend-development-specialist',
              prompt: 'Implement API endpoints following OpenAPI specification for {projectName}. Include request validation, error handling, and response formatting.',
              dependencies: ['openapi_specification', 'rbac_implementation'],
              outputFormat: 'api-implementation',
              estimatedDuration: 40
            },
            {
              taskId: 'database_integration',
              name: 'Database Integration',
              agentType: 'backend-development-specialist',
              prompt: 'Integrate database layer with Prisma ORM or TypeORM. Implement repositories, query optimization, and transaction handling.',
              dependencies: ['endpoint_implementation'],
              outputFormat: 'database-layer',
              estimatedDuration: 30
            },
            {
              taskId: 'resilience_patterns',
              name: 'Resilience Patterns Implementation',
              agentType: 'api-integration-specialist',
              prompt: 'Implement API resilience patterns including circuit breakers, rate limiting, retry logic, and timeout handling for {projectName}.',
              dependencies: ['endpoint_implementation'],
              outputFormat: 'resilience-implementation',
              estimatedDuration: 25
            }
          ],
          parallelizable: false,
          estimatedDuration: 95
        },
        {
          stage: 'api_testing',
          stageName: 'API Testing & Validation',
          agents: ['integration-test-specialist', 'performance-testing-expert'],
          tasks: [
            {
              taskId: 'integration_testing',
              name: 'API Integration Testing',
              agentType: 'integration-test-specialist',
              prompt: 'Create comprehensive integration tests for all API endpoints. Test success cases, error scenarios, and edge cases.',
              dependencies: ['database_integration'],
              outputFormat: 'api-integration-tests',
              estimatedDuration: 30
            },
            {
              taskId: 'contract_testing',
              name: 'API Contract Testing',
              agentType: 'integration-test-specialist',
              prompt: 'Implement contract testing using Pact or similar. Validate API contracts between consumers and providers.',
              dependencies: ['integration_testing'],
              outputFormat: 'contract-tests',
              estimatedDuration: 20
            },
            {
              taskId: 'api_load_testing',
              name: 'API Load & Performance Testing',
              agentType: 'performance-testing-expert',
              prompt: 'Create k6 load tests for API endpoints. Test throughput, latency, and scalability under various load conditions.',
              dependencies: ['resilience_patterns'],
              outputFormat: 'api-load-tests',
              estimatedDuration: 25
            }
          ],
          parallelizable: true,
          estimatedDuration: 75
        },
        {
          stage: 'api_documentation',
          stageName: 'API Documentation & Developer Experience',
          agents: ['api-architect'],
          tasks: [
            {
              taskId: 'interactive_documentation',
              name: 'Interactive API Documentation',
              agentType: 'api-architect',
              prompt: 'Generate interactive API documentation using Swagger UI or ReDoc from OpenAPI specification. Include code examples and try-it-out functionality.',
              dependencies: ['openapi_specification'],
              outputFormat: 'api-docs',
              estimatedDuration: 15
            },
            {
              taskId: 'sdk_generation',
              name: 'Client SDK Generation',
              agentType: 'api-architect',
              prompt: 'Generate client SDKs for popular languages (TypeScript, Python, Go) using OpenAPI Generator. Include usage examples and installation guides.',
              dependencies: ['interactive_documentation'],
              outputFormat: 'client-sdks',
              estimatedDuration: 20
            },
            {
              taskId: 'postman_collection',
              name: 'Postman Collection Creation',
              agentType: 'api-architect',
              prompt: 'Create Postman collection with all endpoints, example requests, and environment variables for easy API testing.',
              dependencies: ['openapi_specification'],
              outputFormat: 'postman-collection',
              estimatedDuration: 15
            }
          ],
          parallelizable: true,
          estimatedDuration: 50
        },
        {
          stage: 'api_deployment',
          stageName: 'API Deployment & Monitoring',
          agents: ['deployment-orchestration-agent'],
          tasks: [
            {
              taskId: 'api_gateway_setup',
              name: 'API Gateway Configuration',
              agentType: 'deployment-orchestration-agent',
              prompt: 'Configure API gateway with rate limiting, request transformation, and routing for {projectName}. Set up CORS and security policies.',
              outputFormat: 'gateway-config',
              estimatedDuration: 20
            },
            {
              taskId: 'monitoring_observability',
              name: 'API Monitoring & Observability',
              agentType: 'deployment-orchestration-agent',
              prompt: 'Set up API monitoring with request tracing, error tracking, and performance metrics. Configure dashboards and alerts.',
              dependencies: ['api_gateway_setup'],
              outputFormat: 'monitoring-setup',
              estimatedDuration: 20
            }
          ],
          parallelizable: false,
          estimatedDuration: 40
        }
      ],

      // Overall pipeline metrics
      estimatedDuration: 390,
      complexity: 'very-high',
      requiredDomains: ['api', 'backend', 'security', 'testing'],
      primaryAgent: 'api-architect',
      supportingAgents: [
        'backend-development-specialist',
        'api-integration-specialist',
        'security-testing-specialist',
        'integration-test-specialist',
        'performance-testing-expert',
        'deployment-orchestration-agent'
      ],

      // Quality gates
      qualityGates: [
        {
          stage: 'api_design',
          condition: 'OpenAPI specification complete with all endpoints and models documented',
          blocking: true
        },
        {
          stage: 'authentication_authorization',
          condition: 'Security validation passes OWASP API Security Top 10 checks',
          blocking: true
        },
        {
          stage: 'api_implementation',
          condition: 'All endpoints implement proper error handling and validation',
          blocking: true
        },
        {
          stage: 'api_testing',
          condition: 'Integration test coverage above 85% for all endpoints',
          blocking: true
        },
        {
          stage: 'api_documentation',
          condition: 'Interactive documentation deployed and client SDKs generated',
          blocking: false
        },
        {
          stage: 'api_deployment',
          condition: 'API monitoring and alerting configured',
          blocking: true
        }
      ],

      coordinationPattern: 'pipeline',

      // Output configuration
      deliverables: {
        path: 'projects/{projectId}/deliverables/api',
        files: [
          'openapi.yml',
          'src/api/',
          'tests/api/',
          'docs/api/',
          'client-sdks/',
          'postman-collection.json',
          'api-gateway-config.yml',
          'monitoring-dashboard.json'
        ]
      }
    };
  }

  /**
   * Get all templates
   */
  getAllTemplates() {
    return Array.from(this.templates.values());
  }

  /**
   * Get templates by complexity
   */
  getTemplatesByComplexity(complexity) {
    return Array.from(this.templates.values())
      .filter(t => t.complexity === complexity);
  }

  /**
   * Get templates by domain
   */
  getTemplatesByDomain(domain) {
    return Array.from(this.templates.values())
      .filter(t => t.requiredDomains.includes(domain));
  }
}

module.exports = PipelineTemplateLibrary;
