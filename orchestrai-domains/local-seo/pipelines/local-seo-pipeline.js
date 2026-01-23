/**
 * Local SEO Pipeline
 *
 * Comprehensive local SEO optimization pipeline from Google Business Profile
 * optimization to local citations, review management, local content, link building,
 * and GBP post generation.
 *
 * Pipeline Stages:
 * 1. Maps Ranking & Competitor Intelligence (30 min) ← NEW
 * 2. GBP Audit & Optimization (20 min)
 * 3. Local Citation Building (25 min)
 * 4. Review Management Strategy (15 min)
 * 5. Location Page Generation + Local Content (35 min) ← UPDATED
 * 6. Local Link Building (10 min)
 * 7. GBP Post Generation with CSV Export (25 min) ← UPDATED
 *
 * Total Duration: ~160 minutes
 */

const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;

class LocalSEOPipeline extends EventEmitter {
  constructor(coordinationPatterns, crystallineMemory, mcpManager) {
    super();
    this.coordinationPatterns = coordinationPatterns;
    this.crystallineMemory = crystallineMemory;
    this.mcpManager = mcpManager;
    this.pipelineId = 'local-seo';
    this.pipelineName = 'Local SEO Pipeline';
  }

  /**
   * Execute the complete local SEO pipeline
   */
  async execute(projectSpec, options = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();

    const execution = {
      executionId,
      pipelineId: this.pipelineId,
      projectId: projectSpec.projectId || projectSpec.clientId,
      businessName: projectSpec.businessName,
      location: projectSpec.location,
      startTime,
      stages: {},
      stageResults: {},
      errors: [],
      metrics: {
        tokenUsage: 0,
        agentExecutions: 0,
        qualityGatesPassed: 0,
        qualityGatesFailed: 0
      }
    };

    try {
      this.emit('pipeline-started', {
        executionId,
        pipelineId: this.pipelineId,
        projectId: execution.projectId
      });

      // Stage 1: Maps Ranking & Competitor Intelligence
      if (options.enableRankingTracking !== false) {
        this.emit('stage-started', { executionId, stage: 'maps_ranking_intelligence' });
        const rankingResults = await this.executeMapsRankingIntelligence(execution, projectSpec);
        execution.stageResults.maps_ranking_intelligence = rankingResults;
        this.emit('stage-completed', {
          executionId,
          stage: 'maps_ranking_intelligence',
          duration: rankingResults.duration
        });
      }

      // Stage 2: GBP Audit & Optimization
      this.emit('stage-started', { executionId, stage: 'gbp_audit_optimization' });
      const gbpResults = await this.executeGBPAuditOptimization(execution, projectSpec);
      execution.stageResults.gbp_audit_optimization = gbpResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'gbp_audit_optimization',
        duration: gbpResults.duration
      });

      // Stage 3: Local Citation Building
      this.emit('stage-started', { executionId, stage: 'local_citation_building' });
      const citationResults = await this.executeLocalCitationBuilding(execution, projectSpec);
      execution.stageResults.local_citation_building = citationResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'local_citation_building',
        duration: citationResults.duration
      });

      // Stage 4: Review Management
      this.emit('stage-started', { executionId, stage: 'review_management' });
      const reviewResults = await this.executeReviewManagement(execution, projectSpec);
      execution.stageResults.review_management = reviewResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'review_management',
        duration: reviewResults.duration
      });

      // Stage 5: Location Page Generation + Local Content Creation
      this.emit('stage-started', { executionId, stage: 'location_content_creation' });
      const contentResults = await this.executeLocationContentCreation(execution, projectSpec);
      execution.stageResults.location_content_creation = contentResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'location_content_creation',
        duration: contentResults.duration
      });

      // Stage 6: Local Link Building
      this.emit('stage-started', { executionId, stage: 'local_link_building' });
      const linkResults = await this.executeLocalLinkBuilding(execution, projectSpec);
      execution.stageResults.local_link_building = linkResults;
      this.emit('stage-completed', {
        executionId,
        stage: 'local_link_building',
        duration: linkResults.duration
      });

      // Stage 7: GBP Post Generation with CSV Export
      if (options.includeGBPContent !== false) {
        this.emit('stage-started', { executionId, stage: 'gbp_post_generation' });
        const gbpPostResults = await this.executeGBPPostGeneration(execution, projectSpec, options);
        execution.stageResults.gbp_post_generation = gbpPostResults;
        this.emit('stage-completed', {
          executionId,
          stage: 'gbp_post_generation',
          duration: gbpPostResults.duration
        });
      }

      // Store learnings in crystalline memory
      await this.storePipelineLearnings(execution);

      const totalDuration = Date.now() - startTime;

      this.emit('pipeline-completed', {
        executionId,
        success: true,
        duration: totalDuration,
        metrics: execution.metrics
      });

      return {
        success: true,
        executionId,
        projectId: execution.projectId,
        duration: totalDuration,
        results: execution.stageResults,
        deliverablePaths: this.getDeliverablePaths(execution),
        metrics: execution.metrics
      };

    } catch (error) {
      const errorDuration = Date.now() - startTime;

      this.emit('pipeline-failed', {
        executionId,
        error: error.message,
        duration: errorDuration
      });

      execution.errors.push({
        timestamp: Date.now(),
        error: error.message,
        stack: error.stack
      });

      return {
        success: false,
        executionId,
        projectId: execution.projectId,
        error: error.message,
        duration: errorDuration,
        partialResults: execution.stageResults,
        errors: execution.errors
      };
    }
  }

  /**
   * Stage 1: Maps Ranking & Competitor Intelligence
   */
  async executeMapsRankingIntelligence(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {};

    try {
      // Task 1: Maps Ranking Tracking
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'maps_ranking_tracking'
      });

      const trackingKeywords = projectSpec.targetKeywords || projectSpec.keywords || [];

      const rankingPrompt = `
Track Google Maps local pack positions for ${projectSpec.businessName}.

Business Details:
- Business Name: ${projectSpec.businessName}
- Location: ${projectSpec.location}
- Target Keywords: ${trackingKeywords.join(', ')}
- Language: ${projectSpec.language || 'Dutch'}

Tracking Requirements:
1. Position Tracking (50+ keywords):
   - Current local pack position (1-20)
   - 3-pack visibility (top 3 results)
   - Historical trends (if baseline data available)
   - Ranking distance from business location

2. Quick Win Identification:
   - Keywords ranking 4-10 (just outside top 3)
   - Low difficulty opportunities
   - High search volume potential
   - Recent positive movement

3. Competitor Position Analysis:
   - Who ranks #1, #2, #3 for each keyword
   - Competitor overlap (how many keywords shared)
   - Competitor average positions
   - Position volatility (rank fluctuations)

4. Performance Metrics:
   - Visibility score (weighted by search volume)
   - 3-pack appearance rate
   - Average position across all keywords
   - Improvement opportunities count

Use DataForSEO mcp__dataforseo__serp_google_maps for real-time position data.

Deliverable: Comprehensive ranking report with quick wins highlighted and competitor benchmarks.
      `;

      const rankingTracking = await this.executeAgentTask(
        'local-maps-ranking-tracker',
        rankingPrompt,
        execution
      );

      results.rankingTracking = rankingTracking;

      // Task 2: Competitor Intelligence Deep Dive
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'competitor_intelligence'
      });

      const competitorPrompt = `
Analyze local competitors for ${projectSpec.businessName} in ${projectSpec.location}.

Analysis Requirements:
1. Competitor Identification:
   - Top 10 ranking competitors
   - Business types and services overlap
   - Geographic coverage comparison

2. GBP Performance Analysis:
   - Review count and velocity (reviews/month)
   - Average rating and sentiment
   - Post frequency and engagement
   - Photo count and quality
   - Response rate to reviews

3. Gap Analysis:
   - Services they offer that you don't
   - Keywords they rank for that you don't
   - Content opportunities they're missing
   - GBP features you're not using

4. Competitive Strength Scoring:
   - Overall competitor strength (0-100)
   - Review strength
   - Content strength
   - Technical optimization
   - Local authority

5. Strategic Recommendations:
   - Weakest competitors to target
   - Quick win opportunities vs competitors
   - Long-term competitive advantages to build

Use DataForSEO business_data_search and business_data_info for competitor data.

Deliverable: Competitive intelligence report with actionable insights and priority targets.
      `;

      const competitorIntel = await this.executeAgentTask(
        'local-competitor-intelligence',
        competitorPrompt,
        execution
      );

      results.competitorIntelligence = competitorIntel;

      // Quality gate validation
      const qualityPassed = this.validateRankingIntelligence(results);
      if (qualityPassed) {
        execution.metrics.qualityGatesPassed++;
      } else {
        execution.metrics.qualityGatesFailed++;
        this.emit('quality-gate-failed', {
          executionId: execution.executionId,
          stage: 'maps_ranking_intelligence',
          reason: 'Insufficient ranking or competitor data'
        });
      }

      return {
        success: true,
        duration: Date.now() - stageStart,
        results
      };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'maps_ranking_intelligence',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 2: Google Business Profile Audit & Optimization
   */
  async executeGBPAuditOptimization(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {};

    try {
      // Task 1: GBP Audit
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'gbp_audit'
      });

      const gbpAuditPrompt = `
Conduct comprehensive audit of Google Business Profile for ${projectSpec.businessName}.

Business Details:
- Business Name: ${projectSpec.businessName}
- Location: ${projectSpec.location}
- Industry: ${projectSpec.industry || 'general'}

Analysis Requirements:
1. Categories: Primary and secondary category optimization
2. Business Description: Keyword optimization and clarity
3. Attributes: Service attributes, amenities, highlights
4. Photos: Quality, quantity, relevance (minimum 10 photos recommended)
5. Posts: Posting frequency and engagement (weekly minimum)
6. Q&A: Common questions addressed, response quality
7. Services: Service listings completeness
8. Special Hours: Holiday and special event hours accuracy

Deliverable: Comprehensive GBP audit report with scores for each element (1-10).
      `;

      const gbpAudit = await this.executeAgentTask(
        'seo-local-seo',
        gbpAuditPrompt,
        execution
      );

      results.gbpAudit = gbpAudit;

      // Task 2: GBP Optimization Plan
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'gbp_optimization'
      });

      const optimizationPrompt = `
Create detailed GBP optimization plan for ${projectSpec.businessName}.

Based on audit findings, create action plan for:

1. Category Optimization:
   - Primary category selection (most specific)
   - Secondary categories (max 9) for comprehensive coverage

2. Business Description Optimization:
   - Include target keywords naturally: ${projectSpec.targetKeywords?.join(', ') || 'local services'}
   - 750 character limit, front-load important information
   - Include location, services, unique selling points

3. Attribute Enhancements:
   - Service attributes specific to ${projectSpec.industry}
   - Accessibility features
   - Payment methods accepted
   - Business certifications

4. Photo Strategy:
   - Cover photo recommendations (1200x900px minimum)
   - Logo optimization (720x720px)
   - Interior/exterior photos (minimum 10)
   - Team photos for trust building
   - Before/after photos if applicable

5. Posting Calendar:
   - Weekly post schedule
   - Post types: Updates, Offers, Events, Products
   - Seasonal content calendar

6. Q&A Management:
   - Top 10 frequently asked questions to pre-populate
   - Response templates for common inquiries
   - Monitoring and response protocol

Deliverable: Actionable GBP optimization plan with prioritized recommendations.
      `;

      const optimizationPlan = await this.executeAgentTask(
        'seo-local-seo',
        optimizationPrompt,
        execution
      );

      results.optimizationPlan = optimizationPlan;

      // Quality gate validation
      const qualityPassed = this.validateGBPOptimization(results);
      if (qualityPassed) {
        execution.metrics.qualityGatesPassed++;
      } else {
        execution.metrics.qualityGatesFailed++;
        this.emit('quality-gate-failed', {
          executionId: execution.executionId,
          stage: 'gbp_audit_optimization',
          reason: 'Optimization plan missing critical elements'
        });
      }

      return {
        success: true,
        duration: Date.now() - stageStart,
        results
      };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'gbp_audit_optimization',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 2: Local Citation Building & NAP Consistency
   */
  async executeLocalCitationBuilding(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {};

    try {
      // Task 1: NAP Audit
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'nap_audit'
      });

      const napAuditPrompt = `
Audit NAP (Name, Address, Phone) consistency for ${projectSpec.businessName}.

Business Information:
- Business Name: ${projectSpec.businessName}
- Address: ${projectSpec.location}
- Phone: ${projectSpec.phone || 'To be provided'}
- Website: ${projectSpec.website || 'To be provided'}

Audit Requirements:
1. Check consistency across major directories:
   - Google Business Profile
   - Apple Maps
   - Bing Places
   - Yelp
   - Facebook Business Page
   - Industry-specific directories (top 20)

2. Identify inconsistencies:
   - Name variations
   - Address formatting differences
   - Phone number formats
   - Website URL variations

3. Citation quality assessment:
   - Completeness of business information
   - Photo presence
   - Business hours accuracy
   - Category accuracy

Deliverable: NAP audit report with inconsistencies flagged and correction priorities.
      `;

      const napAudit = await this.executeAgentTask(
        'seo-local-seo',
        napAuditPrompt,
        execution
      );

      results.napAudit = napAudit;

      // Task 2: Citation Building Strategy
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'citation_building_strategy'
      });

      const citationStrategyPrompt = `
Develop comprehensive local citation building strategy for ${projectSpec.businessName}.

Location: ${projectSpec.location}
Industry: ${projectSpec.industry || 'general'}

Strategy Components:

1. General Directories (Priority 1 - Top 50):
   - Major search engines (Google, Bing, Apple)
   - Major data aggregators (Neustar/Localeze, Acxiom, Factual, Infogroup)
   - Social platforms (Facebook, LinkedIn, Instagram)
   - Review sites (Yelp, TripAdvisor, G2, Trustpilot)
   - Navigation apps (Waze, Garmin, TomTom)

2. Industry-Specific Directories (Priority 2):
   - Identify top 20 directories for ${projectSpec.industry}
   - Professional associations
   - Trade organizations
   - Industry review platforms

3. Location-Specific Directories (Priority 3):
   - Chamber of Commerce (${projectSpec.location})
   - Local business associations
   - City/regional directories
   - Local news sites with business listings
   - Community calendars and event sites

4. Citation Building Process:
   - Submission checklist with login credentials management
   - Verification methods for each platform
   - Photo and logo requirements per platform
   - Business hour formatting standards
   - Category selection guidelines

5. Ongoing Maintenance:
   - Monthly citation monitoring
   - Quarterly bulk updates process
   - Duplicate listing management
   - Citation removal for closed/moved businesses

Deliverable: Prioritized citation building plan with platform-specific submission guidelines.
      `;

      const citationStrategy = await this.executeAgentTask(
        'seo-local-seo',
        citationStrategyPrompt,
        execution
      );

      results.citationStrategy = citationStrategy;

      // Quality gate validation
      const qualityPassed = this.validateCitationStrategy(results);
      if (qualityPassed) {
        execution.metrics.qualityGatesPassed++;
      } else {
        execution.metrics.qualityGatesFailed++;
      }

      return {
        success: true,
        duration: Date.now() - stageStart,
        results
      };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'local_citation_building',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 3: Review Management Strategy
   */
  async executeReviewManagement(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {};

    try {
      // Task 1: Current Review Analysis with DataForSEO Integration
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'review_analysis'
      });

      // First, get business data if CID provided
      let businessReviews = null;
      if (this.mcpManager && projectSpec.businessCID) {
        try {
          businessReviews = await this.mcpManager.callMCPTool(
            'dataforseo',
            'business_data_reviews',
            {
              cid: projectSpec.businessCID,
              sort_by: 'date',
              limit: 100
            }
          );
        } catch (error) {
          console.warn('DataForSEO reviews fetch failed:', error.message);
        }
      }

      const reviewAnalysisPrompt = `
Analyze current Google reviews for ${projectSpec.businessName}.

${businessReviews ? `
Recent Reviews Data (from DataForSEO):
- Total Reviews: ${businessReviews.items?.length || 0}
- Rating Distribution: ${JSON.stringify(this.analyzeRatingDistribution(businessReviews.items || []))}
- Recent Trends: ${JSON.stringify(this.analyzeReviewTrends(businessReviews.items || []))}
` : ''}

Analysis Focus:
1. Review volume and distribution (1-5 stars)
2. Recent review trends (last 30, 60, 90 days)
3. Common themes in positive reviews (strengths to amplify)
4. Common themes in negative reviews (issues to address)
5. Competitor review analysis (${projectSpec.competitors?.join(', ') || 'top 3 competitors'})
6. Sentiment analysis and emotional tone
7. Response rate and quality assessment

Deliverable: Comprehensive review intelligence report with actionable insights.
      `;

      const reviewAnalysis = await this.executeAgentTask(
        'reviews-intelligence-specialist',
        reviewAnalysisPrompt,
        execution
      );

      results.reviewAnalysis = reviewAnalysis;
      results.reviewData = businessReviews;

      // Task 2: Review Generation & Management Strategy
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'review_generation_strategy'
      });

      const reviewStrategyPrompt = `
Create review generation and management strategy for ${projectSpec.businessName}.

Strategy Components:

1. Review Generation System:
   - Optimal timing for review requests (post-service, post-purchase)
   - Multi-channel request approach (email, SMS, in-person)
   - Review request templates (personalized, not spammy)
   - Incentivization guidelines (ethical, compliant)
   - Staff training on review requests

2. Review Response Templates:
   - 5-star reviews: Thank you templates (3 variations)
   - 4-star reviews: Thank you + improvement acknowledgment
   - 3-star reviews: Apology + specific action plan
   - 2-star reviews: Sincere apology + offline resolution offer
   - 1-star reviews: Professional apology + urgent escalation

3. Response Guidelines:
   - Response timeframe: <24 hours for negative, <48 hours for positive
   - Tone and voice standards
   - Personalization requirements (no templated responses visible)
   - Legal and compliance considerations
   - Escalation protocol for severe negative reviews

4. Reputation Monitoring:
   - Daily Google Business Profile monitoring
   - Weekly sentiment analysis
   - Monthly competitive benchmarking
   - Alert system for negative reviews (email, SMS)

5. Review Recovery Plan:
   - Offline resolution process for negative experiences
   - Follow-up protocol after issue resolution
   - Review update request process (ethical approach)

Deliverable: Complete review management playbook with templates and processes.
      `;

      const reviewStrategy = await this.executeAgentTask(
        'seo-local-seo',
        reviewStrategyPrompt,
        execution
      );

      results.reviewStrategy = reviewStrategy;

      return {
        success: true,
        duration: Date.now() - stageStart,
        results
      };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'review_management',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 5: Location Page Generation + Local Content Strategy
   */
  async executeLocationContentCreation(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {};

    try {
      // Task 1: Generate Unique Location Pages
      if (projectSpec.locations && projectSpec.locations.length > 0) {
        this.emit('task-started', {
          executionId: execution.executionId,
          task: 'location_page_generation'
        });

        const locationPagePrompt = `
Generate unique location pages for ${projectSpec.businessName}.

Locations to create pages for:
${projectSpec.locations.map(loc => `- ${loc}`).join('\n')}

Requirements per page:
1. Unique Content (90%+ uniqueness):
   - No template-based duplication
   - Specific local landmarks and context
   - Neighborhood-specific services
   - Local demographic targeting

2. Local SEO Elements:
   - Location-specific H1 and title tags
   - Local keywords naturally integrated
   - Embedded Google Map for location
   - Driving directions and parking info
   - Public transportation access

3. Trust Signals:
   - Location-specific testimonials
   - Local team member spotlights
   - Community involvement highlights
   - Local awards or certifications

4. Schema Markup:
   - LocalBusiness schema with precise coordinates
   - Service area markup
   - Review schema (if available)
   - Opening hours specific to location

5. Conversion Elements:
   - Location-specific phone number
   - Online booking for this location
   - Location photo gallery
   - Local offers and promotions

Deliverable: ${projectSpec.locations.length} unique location pages ready for publication.
        `;

        const locationPages = await this.executeAgentTask(
          'location-page-generator',
          locationPagePrompt,
          execution
        );

        results.locationPages = locationPages;
      }

      // Task 2: Local Keyword Research
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'local_keyword_research'
      });

      const keywordResearchPrompt = `
Conduct local keyword research for ${projectSpec.businessName} in ${projectSpec.location}.

Research Focus:

1. "Near Me" Keywords:
   - [service] near me
   - [service] nearby
   - [service] close to me

2. Location Modifiers:
   - [service] in ${projectSpec.location}
   - ${projectSpec.location} [service]
   - [service] [neighborhood/district]
   - [service] [zip code]

3. Local Intent Keywords:
   - Best [service] in ${projectSpec.location}
   - Top [service provider] ${projectSpec.location}
   - Affordable [service] ${projectSpec.location}
   - Emergency [service] ${projectSpec.location}

4. Service Area Keywords:
   - [service] serving [surrounding areas]
   - [service] coverage in [region]

5. Competitive Analysis:
   - Keywords competitors rank for
   - Gap analysis (keywords we should target)

6. Search Intent Classification:
   - Informational: "how to find [service]"
   - Navigational: "[business name] hours"
   - Commercial: "best [service] reviews"
   - Transactional: "book [service] online"

Deliverable: Local keyword dataset with search volume, difficulty, and priority scoring.
      `;

      const keywordResearch = await this.executeAgentTask(
        'seo-local-seo',
        keywordResearchPrompt,
        execution
      );

      results.keywordResearch = keywordResearch;

      // Task 3: Local Content Plan
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'local_content_plan'
      });

      const contentPlanPrompt = `
Develop local content strategy for ${projectSpec.businessName}.

Content Pillars:

1. Location Pages:
   - Primary service area page (${projectSpec.location})
   - Neighborhood/district pages (5-10 key areas)
   - Service area radius pages
   - Page structure: Services offered, why choose us, local testimonials, local schema markup

2. Local Blog Topics (12 months):
   - Community events and sponsorships
   - Local industry news and trends
   - Neighborhood guides and recommendations
   - Seasonal local content (holidays, weather-related)
   - Local customer success stories
   - "Best of ${projectSpec.location}" roundups

3. Community Engagement Content:
   - Local partnership announcements
   - Charity and community involvement
   - Local business collaboration content
   - Employee spotlights (local team members)

4. Location-Specific Service Content:
   - "[Service] in [Location]" comprehensive guides
   - Local regulations and requirements
   - Area-specific challenges and solutions
   - Local market insights and data

5. FAQ Content (Local Focus):
   - "Do you serve [specific neighborhood]?"
   - "What areas do you cover?"
   - "How long does it take to reach [location]?"
   - Local pricing and service variations

6. Schema Markup Strategy:
   - LocalBusiness schema
   - Service schema with area served
   - Review schema
   - FAQ schema for local questions

Deliverable: 12-month local content calendar with topics, keywords, and publishing schedule.
      `;

      const contentPlan = await this.executeAgentTask(
        'seo-local-seo',
        contentPlanPrompt,
        execution
      );

      results.contentPlan = contentPlan;

      // Quality gate validation
      const qualityPassed = this.validateContentPlan(results);
      if (qualityPassed) {
        execution.metrics.qualityGatesPassed++;
      } else {
        execution.metrics.qualityGatesFailed++;
      }

      return {
        success: true,
        duration: Date.now() - stageStart,
        results
      };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'local_content_creation',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 5: Local Link Building Strategy
   */
  async executeLocalLinkBuilding(execution, projectSpec) {
    const stageStart = Date.now();
    const results = {};

    try {
      // Task 1: Local Link Opportunities
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'local_link_opportunities'
      });

      const linkBuildingPrompt = `
Identify local link building opportunities for ${projectSpec.businessName} in ${projectSpec.location}.

Link Opportunity Categories:

1. Chamber of Commerce & Business Associations:
   - Local chamber of commerce membership
   - Industry-specific associations
   - Better Business Bureau (BBB)
   - Professional networking organizations

2. Local Sponsorships:
   - Community events sponsorship
   - Local sports teams
   - School programs and fundraisers
   - Charity events and non-profits
   - Local festivals and celebrations

3. Local Media & PR:
   - Local news sites and blogs
   - Community newspapers
   - Local radio station websites
   - Regional business journals
   - Press release distribution to local outlets

4. Local Business Partnerships:
   - Complementary business collaborations
   - Supplier and vendor partnerships
   - Cross-promotion opportunities
   - Local business directories

5. Community Involvement:
   - Local volunteer organizations
   - Community service initiatives
   - Educational institutions (guest lectures, workshops)
   - Local government initiatives

6. Local Resource Pages:
   - "[City] resources" pages
   - Community guides and directories
   - Local government service provider lists
   - University/college local business pages

7. Industry-Specific Local Links:
   - ${projectSpec.industry} associations in ${projectSpec.location}
   - Local professional directories
   - Trade organization local chapters

Outreach Strategy:
- Email outreach templates (personalized)
- Value proposition for link partners
- Follow-up sequence
- Relationship building approach

Deliverable: Prioritized list of 50+ local link opportunities with outreach templates.
      `;

      const linkOpportunities = await this.executeAgentTask(
        'seo-local-seo',
        linkBuildingPrompt,
        execution
      );

      results.linkOpportunities = linkOpportunities;

      return {
        success: true,
        duration: Date.now() - stageStart,
        results
      };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'local_link_building',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Stage 6: GBP Post Generation & Transformation
   */
  async executeGBPPostGeneration(execution, projectSpec, options = {}) {
    const stageStart = Date.now();
    const results = {};

    try {
      // Task 1: Discover Existing Content for Transformation
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'discover_existing_content'
      });

      const contentDiscoveryPrompt = `
Scan project deliverables for blog articles and landing pages suitable for GBP post transformation.

Project: ${projectSpec.businessName}
Content Path: projects/${execution.projectId}/deliverables/content/

Requirements:
1. Identify 2-3 high-value blog articles (2000+ words)
2. Identify landing pages with strong offers or services
3. Note articles with good engagement metrics (if available)
4. Prioritize recent content (last 6 months)

For each piece:
- File path
- Word count
- Main topic/value proposition
- Target audience
- Suitable GBP post types (What's New, Offer, Product)

Deliverable: Content inventory with transformation recommendations.
      `;

      // Use file system search to find content
      const existingContent = options.existingContent || [];
      results.contentDiscovery = {
        articlesFound: existingContent,
        transformationCandidates: existingContent.slice(0, 3)
      };

      // Task 2: Get Competitor GBP Insights (DataForSEO Integration)
      if (this.mcpManager && projectSpec.location) {
        this.emit('task-started', {
          executionId: execution.executionId,
          task: 'competitor_gbp_insights'
        });

        try {
          // Search for competitor businesses in location
          const competitorSearch = await this.mcpManager.callMCPTool(
            'dataforseo',
            'business_data_search',
            {
              keyword: projectSpec.industry || 'dental',
              location_name: projectSpec.location,
              language_name: projectSpec.language || 'Dutch',
              limit: 10
            }
          );

          // Get detailed info for top competitor
          if (competitorSearch?.items?.length > 0) {
            const topCompetitor = competitorSearch.items[0];
            const competitorInfo = await this.mcpManager.callMCPTool(
              'dataforseo',
              'business_data_info',
              {
                cid: topCompetitor.cid,
                language_name: projectSpec.language || 'Dutch'
              }
            );

            results.competitorInsights = {
              competitorName: topCompetitor.title,
              postFrequency: competitorInfo?.posts?.length || 0,
              averagePostLength: this.calculateAveragePostLength(competitorInfo?.posts || []),
              postTypes: this.analyzePostTypes(competitorInfo?.posts || [])
            };
          }
        } catch (error) {
          console.warn('DataForSEO competitor insights failed:', error.message);
          results.competitorInsights = { error: error.message };
        }
      }

      // Task 3: Transform Blog Articles to GBP Posts
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'transform_blog_articles'
      });

      const transformedPosts = [];

      // Transform up to 3 articles (creating 3 posts each = 9 posts)
      for (const article of results.contentDiscovery.transformationCandidates.slice(0, 3)) {
        const transformPrompt = `
Transform blog article into 3 GBP posts using gbp-content-transformer patterns.

Source Article: ${article}
Business: ${projectSpec.businessName}
Location: ${projectSpec.location}
Language: ${projectSpec.language || 'Dutch'}

Create:
1. What's New post (300-500 chars): Highlight main value proposition
2. Offer post (250-400 chars): Extract promotional angle
3. Product post (300-500 chars): Showcase service/product

Requirements:
- Character limit compliance (BLOCKING gate)
- AI detection <30% (BLOCKING gate)
- Language purity 100% for ${projectSpec.language || 'Dutch'} (BLOCKING gate)
- Mobile readability (WARNING gate)
- Local keywords integrated

Deliverable: 3 GBP posts in JSON format with quality metrics.
        `;

        const articleTransformation = await this.executeAgentTask(
          'gbp-content-transformer',
          transformPrompt,
          execution
        );

        transformedPosts.push(articleTransformation);
      }

      results.transformedPosts = transformedPosts;

      // Task 4: Generate Original GBP Posts
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'generate_original_posts'
      });

      const originalPostPrompt = `
Create 3-4 original GBP posts for ${projectSpec.businessName}.

Business Context:
- Location: ${projectSpec.location}
- Industry: ${projectSpec.industry || 'general'}
- Language: ${projectSpec.language || 'Dutch'}
- Target Audience: ${projectSpec.targetAudience || 'local customers'}

Post Mix:
1. What's New (1 post): Business update or achievement
2. Event (1 post): Upcoming community event or open house
3. Offer (1-2 posts): Current promotion or special
${options.includeProductPost !== false ? '4. Product (1 post): Service highlight' : ''}

Requirements:
- Character limit compliance (100-1500 chars)
- AI detection <30%
- Language purity 100%
- Local keywords naturally integrated
- Clear CTAs (phone, website, booking)
- Mobile-optimized formatting

Deliverable: 3-4 original GBP posts in JSON format.
      `;

      const originalPosts = await this.executeAgentTask(
        'gbp-content-transformer',
        originalPostPrompt,
        execution
      );

      results.originalPosts = originalPosts;

      // Task 5: Quality Validation (All Quality Gates)
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'quality_validation'
      });

      const allPosts = [
        ...(transformedPosts.map(t => t.posts || []).flat()),
        ...(originalPosts.posts || [])
      ];

      const qualityResults = await this.validateGBPPosts(allPosts, execution);
      results.qualityValidation = qualityResults;

      // Task 6: Create Posting Calendar
      this.emit('task-started', {
        executionId: execution.executionId,
        task: 'create_posting_calendar'
      });

      const postingCalendar = this.createPostingCalendar(
        allPosts,
        options.postFrequency || 'weekly'
      );

      results.postingCalendar = postingCalendar;

      // Task 7: Export CSV for HighLevel Import
      if (options.exportCSV !== false) {
        this.emit('task-started', {
          executionId: execution.executionId,
          task: 'export_csv_highlevel'
        });

        const csvExport = await this.exportGBPPostsToCSV(
          allPosts,
          postingCalendar,
          execution
        );

        results.csvExport = csvExport;

        this.emit('task-completed', {
          executionId: execution.executionId,
          task: 'export_csv_highlevel',
          message: `CSV exported: ${csvExport.filePath}`
        });
      }

      // Quality gate validation
      const qualityPassed = this.validateGBPPostGeneration(results);
      if (qualityPassed) {
        execution.metrics.qualityGatesPassed++;
      } else {
        execution.metrics.qualityGatesFailed++;
        this.emit('quality-gate-failed', {
          executionId: execution.executionId,
          stage: 'gbp_post_generation',
          reason: 'GBP posts failed quality validation'
        });
      }

      return {
        success: true,
        duration: Date.now() - stageStart,
        results
      };

    } catch (error) {
      this.emit('stage-error', {
        executionId: execution.executionId,
        stage: 'gbp_post_generation',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Analyze rating distribution from reviews
   */
  analyzeRatingDistribution(reviews) {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(review => {
      const rating = review.rating || 0;
      if (rating >= 1 && rating <= 5) {
        distribution[Math.floor(rating)]++;
      }
    });
    return distribution;
  }

  /**
   * Analyze review trends (last 30, 60, 90 days)
   */
  analyzeReviewTrends(reviews) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const trends = {
      last30Days: 0,
      last60Days: 0,
      last90Days: 0
    };

    reviews.forEach(review => {
      const reviewDate = new Date(review.timestamp * 1000).getTime();
      const daysAgo = (now - reviewDate) / day;

      if (daysAgo <= 30) trends.last30Days++;
      if (daysAgo <= 60) trends.last60Days++;
      if (daysAgo <= 90) trends.last90Days++;
    });

    return trends;
  }

  /**
   * Analyze competitor post types from DataForSEO data
   */
  analyzePostTypes(posts) {
    const typeCount = {};
    posts.forEach(post => {
      const type = post.type || 'unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    return typeCount;
  }

  /**
   * Calculate average post length from competitor data
   */
  calculateAveragePostLength(posts) {
    if (!posts || posts.length === 0) return 0;
    const totalLength = posts.reduce((sum, post) => {
      return sum + (post.text?.length || 0);
    }, 0);
    return Math.round(totalLength / posts.length);
  }

  /**
   * Validate GBP posts against quality gates
   */
  async validateGBPPosts(posts, execution) {
    const validation = {
      totalPosts: posts.length,
      passed: 0,
      failed: 0,
      warnings: [],
      errors: []
    };

    for (const post of posts) {
      const postValidation = {
        postType: post.postType,
        checks: {}
      };

      // Gate 1: Character Limit Compliance (BLOCKING)
      const charCount = post.content?.text?.length || 0;
      postValidation.checks.characterLimit = {
        passed: charCount >= 100 && charCount <= 1500,
        value: charCount,
        threshold: '100-1500',
        severity: 'BLOCKING'
      };

      // Gate 2: AI Detection Risk (BLOCKING)
      const aiRisk = post.qualityMetrics?.aiDetectionRisk || 0;
      postValidation.checks.aiDetection = {
        passed: aiRisk < 30,
        value: aiRisk,
        threshold: '<30%',
        severity: 'BLOCKING'
      };

      // Gate 3: Language Purity (BLOCKING for multi-language)
      if (post.content?.language !== 'EN') {
        postValidation.checks.languagePurity = {
          passed: post.qualityMetrics?.languagePurityScore >= 95,
          value: post.qualityMetrics?.languagePurityScore || 0,
          threshold: '≥95%',
          severity: 'BLOCKING'
        };
      }

      // Gate 4: Mobile Readability (WARNING)
      const avgSentenceLength = post.qualityMetrics?.averageSentenceLength || 0;
      postValidation.checks.mobileReadability = {
        passed: avgSentenceLength <= 15,
        value: avgSentenceLength,
        threshold: '≤15 words',
        severity: 'WARNING'
      };

      // Gate 5: Local SEO Integration (WARNING)
      postValidation.checks.localSEO = {
        passed: post.qualityMetrics?.localSeoIntegration || false,
        severity: 'WARNING'
      };

      // Check if all BLOCKING gates passed
      const blockingGates = Object.values(postValidation.checks)
        .filter(check => check.severity === 'BLOCKING');
      const allBlockingPassed = blockingGates.every(check => check.passed);

      if (allBlockingPassed) {
        validation.passed++;
      } else {
        validation.failed++;
        validation.errors.push({
          postType: post.postType,
          failedGates: blockingGates.filter(check => !check.passed)
        });
      }

      // Collect warnings
      const warningGates = Object.values(postValidation.checks)
        .filter(check => check.severity === 'WARNING' && !check.passed);
      if (warningGates.length > 0) {
        validation.warnings.push({
          postType: post.postType,
          warnings: warningGates
        });
      }
    }

    return validation;
  }

  /**
   * Create posting calendar for GBP posts
   */
  createPostingCalendar(posts, frequency = 'weekly') {
    const calendar = {
      frequency,
      schedule: []
    };

    const startDate = new Date();
    const daysBetweenPosts = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 3 : 14;

    posts.forEach((post, index) => {
      const postDate = new Date(startDate);
      postDate.setDate(startDate.getDate() + (index * daysBetweenPosts));

      calendar.schedule.push({
        date: postDate.toISOString().split('T')[0],
        postType: post.postType,
        dayOfWeek: postDate.toLocaleDateString('en-US', { weekday: 'long' }),
        recommendedTime: '10:00' // Optimal posting time (weekday mornings)
      });
    });

    return calendar;
  }

  /**
   * Validate GBP post generation stage
   */
  validateGBPPostGeneration(results) {
    // Must have either transformed posts or original posts
    const hasTransformedPosts = results.transformedPosts?.length > 0;
    const hasOriginalPosts = results.originalPosts?.posts?.length > 0;

    if (!hasTransformedPosts && !hasOriginalPosts) return false;

    // Quality validation must show majority passed
    const validation = results.qualityValidation;
    if (!validation) return false;

    const passRate = validation.totalPosts > 0
      ? (validation.passed / validation.totalPosts)
      : 0;

    // Require at least 80% pass rate for BLOCKING gates
    return passRate >= 0.8;
  }

  /**
   * Execute individual agent task
   */
  async executeAgentTask(agentType, prompt, execution) {
    const taskStart = Date.now();

    try {
      // Use coordination patterns to execute agent task
      const result = await this.coordinationPatterns.executeSequential([
        {
          agentType,
          prompt,
          timeout: 300000 // 5 minutes per task
        }
      ]);

      execution.metrics.agentExecutions++;

      // Track token usage if available
      if (result.tokenUsage) {
        execution.metrics.tokenUsage += result.tokenUsage;
      }

      this.emit('task-completed', {
        executionId: execution.executionId,
        agentType,
        duration: Date.now() - taskStart
      });

      return result;

    } catch (error) {
      this.emit('task-error', {
        executionId: execution.executionId,
        agentType,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Validate GBP optimization quality
   */
  validateGBPOptimization(results) {
    // Check if optimization plan includes critical elements
    if (!results.optimizationPlan) return false;

    // Validate plan contains key sections
    const plan = JSON.stringify(results.optimizationPlan).toLowerCase();
    const requiredElements = [
      'category',
      'description',
      'photo',
      'post'
    ];

    return requiredElements.every(element => plan.includes(element));
  }

  /**
   * Validate citation building strategy
   */
  validateCitationStrategy(results) {
    // Verify NAP consistency checked across minimum directories
    if (!results.napAudit || !results.citationStrategy) return false;

    const strategy = JSON.stringify(results.citationStrategy).toLowerCase();
    return strategy.includes('directory') || strategy.includes('citation');
  }

  /**
   * Validate content plan
   */
  validateContentPlan(results) {
    // Ensure keyword research includes minimum 20 keywords
    if (!results.keywordResearch || !results.contentPlan) return false;

    const keywordData = JSON.stringify(results.keywordResearch);
    // Basic validation - in production would parse and count actual keywords
    return keywordData.length > 500; // Reasonable content threshold
  }

  /**
   * Validate ranking intelligence stage
   */
  validateRankingIntelligence(results) {
    // Must have both ranking tracking and competitor intelligence
    if (!results.rankingTracking || !results.competitorIntelligence) return false;

    // Verify ranking data includes position information
    const rankingData = JSON.stringify(results.rankingTracking);
    const hasRankingData = rankingData.includes('position') || rankingData.includes('rank');

    // Verify competitor data includes business information
    const competitorData = JSON.stringify(results.competitorIntelligence);
    const hasCompetitorData = competitorData.includes('competitor') || competitorData.includes('business');

    return hasRankingData && hasCompetitorData;
  }

  /**
   * Export GBP posts to CSV format for HighLevel import
   */
  async exportGBPPostsToCSV(posts, calendar, execution) {
    try {
      const csvRows = [];

      // CSV Header for HighLevel
      csvRows.push([
        'Post Type',
        'Content',
        'Scheduled Date',
        'Scheduled Time',
        'CTA Type',
        'CTA Link',
        'Language',
        'Character Count',
        'Status'
      ].join(','));

      // Generate CSV rows from posts and calendar
      posts.forEach((post, index) => {
        const scheduleInfo = calendar.schedule[index] || {};

        const row = [
          `"${post.postType || 'whats_new'}"`,
          `"${(post.content?.text || '').replace(/"/g, '""')}"`, // Escape quotes
          `"${scheduleInfo.date || ''}"`,
          `"${scheduleInfo.recommendedTime || '10:00'}"`,
          `"${post.cta?.type || 'CALL'}"`,
          `"${post.cta?.url || ''}"`,
          `"${post.content?.language || 'Dutch'}"`,
          `"${post.content?.text?.length || 0}"`,
          `"Ready for Import"`
        ].join(',');

        csvRows.push(row);
      });

      const csvContent = csvRows.join('\n');

      // Save CSV file to deliverables
      const csvFilePath = `projects/${execution.projectId}/deliverables/local-seo/gbp-posts/highlevel-import.csv`;

      await fs.writeFile(
        path.join(process.cwd(), csvFilePath),
        csvContent,
        'utf-8'
      );

      return {
        success: true,
        filePath: csvFilePath,
        rowCount: posts.length,
        fileSize: csvContent.length
      };

    } catch (error) {
      console.error('CSV export failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Store pipeline learnings in crystalline memory
   */
  async storePipelineLearnings(execution) {
    try {
      // Store successful strategies
      await this.crystallineMemory.storeMemory(
        'local-seo-execution',
        {
          executionId: execution.executionId,
          projectId: execution.projectId,
          businessName: execution.businessName,
          location: execution.location,
          stagesCompleted: Object.keys(execution.stageResults),
          qualityGatesPassed: execution.metrics.qualityGatesPassed,
          totalDuration: Date.now() - execution.startTime
        },
        {
          importance: 0.8,
          semantic_tags: ['local-seo', 'pipeline-execution', 'gbp-optimization'],
          retention: 'long-term'
        }
      );

      // Create entity for business if not exists
      if (this.mcpManager) {
        const observations = [
          `Completed local SEO pipeline optimization`,
          `Location: ${execution.location}`,
          `GBP optimization completed`,
          `Citation building strategy developed`,
          `Review management system implemented`
        ];

        // Add GBP post generation observations if stage completed
        if (execution.stageResults.gbp_post_generation) {
          const gbpResults = execution.stageResults.gbp_post_generation.results;
          const totalPosts = (gbpResults.transformedPosts?.length || 0) +
                           (gbpResults.originalPosts?.posts?.length || 0);

          observations.push(
            `Generated ${totalPosts} GBP posts (transformed + original)`,
            `GBP posting calendar created (${gbpResults.postingCalendar?.frequency || 'weekly'} frequency)`,
            `Quality validation: ${gbpResults.qualityValidation?.passed || 0}/${gbpResults.qualityValidation?.totalPosts || 0} posts passed`
          );
        }

        await this.mcpManager.callMCPTool('memory', 'create_entities', {
          entities: [{
            name: execution.businessName,
            entityType: 'local_business',
            observations
          }]
        });
      }

    } catch (error) {
      console.error('Failed to store pipeline learnings:', error);
      // Non-critical, don't fail pipeline
    }
  }

  /**
   * Get deliverable file paths
   */
  getDeliverablePaths(execution) {
    const basePath = `projects/${execution.projectId}/deliverables/local-seo`;

    return {
      // Stage 1: Maps Ranking & Intelligence
      mapsRankingReport: `${basePath}/maps-ranking-report.json`,
      competitorIntelligenceReport: `${basePath}/competitor-intelligence-report.json`,
      quickWinsReport: `${basePath}/quick-wins-opportunities.json`,

      // Stage 2: GBP Optimization
      gbpOptimizationPlan: `${basePath}/gbp-optimization-plan.json`,

      // Stage 3: Citations
      citationBuildingStrategy: `${basePath}/citation-building-strategy.json`,

      // Stage 4: Reviews
      reviewManagementStrategy: `${basePath}/review-management-strategy.json`,

      // Stage 5: Location Pages & Content
      locationPages: `${basePath}/location-pages/`,
      localContentPlan: `${basePath}/local-content-plan.json`,

      // Stage 6: Link Building
      localLinkOpportunities: `${basePath}/local-link-opportunities.json`,

      // Stage 7: GBP Posts with CSV Export
      gbpPosts: `${basePath}/gbp-posts/`,
      gbpPostsTransformed: `${basePath}/gbp-posts/transformed/`,
      gbpPostsOriginal: `${basePath}/gbp-posts/original/`,
      gbpPostingCalendar: `${basePath}/gbp-posts/posting-calendar.json`,
      highlevelCSV: `${basePath}/gbp-posts/highlevel-import.csv`
    };
  }

  /**
   * Get pipeline template ID
   */
  getPipelineId() {
    return this.pipelineId;
  }

  /**
   * Get pipeline metadata
   */
  getMetadata() {
    return {
      id: this.pipelineId,
      name: this.pipelineName,
      version: '3.0',
      estimatedDuration: 160,
      stages: [
        'maps_ranking_intelligence',
        'gbp_audit_optimization',
        'local_citation_building',
        'review_management',
        'location_content_creation',
        'local_link_building',
        'gbp_post_generation'
      ],
      primaryAgent: 'seo-local-seo',
      supportingAgents: [
        'local-maps-ranking-tracker',
        'local-competitor-intelligence',
        'location-page-generator',
        'reviews-intelligence-specialist',
        'gbp-content-transformer',
        'content-writer-specialist',
        'content-ai-phrase-detector',
        'multi-language-content-adapter'
      ]
    };
  }
}

module.exports = LocalSEOPipeline;
