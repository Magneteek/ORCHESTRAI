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
      this.contentCreationPipeline()
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
