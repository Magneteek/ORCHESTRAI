/**
 * ORCHESTRAI Competitive Intelligence System - Hybrid Orchestration Demo
 *
 * This demo showcases the hybrid architecture:
 * - Infrastructure Agents (Node.js): Handle technical operations
 * - Claude Code Agents (via Task tool): Handle AI-powered analysis
 * - Event-driven coordination: Agents communicate via events
 *
 * Run this demo to see:
 * 1. Domain hub initialization
 * 2. Ad collection from Meta Ad Library API
 * 3. Performance scoring algorithm
 * 4. Database storage
 * 5. AI analysis with Claude Code agents (simulated)
 * 6. Template generation workflow
 * 7. Competitor tracking setup
 */

require('dotenv').config();
const CompetitiveIntelligenceHub = require('./competitive-intelligence-domain-hub');

// ═══════════════════════════════════════════════════════════════════════
// Demo Configuration
// ═══════════════════════════════════════════════════════════════════════

const DEMO_CONFIG = {
    // Keywords to search for
    keywords: ['dental implants', 'teeth whitening'],

    // Target markets
    markets: ['NL', 'BE'],

    // Industries
    industries: ['dental_b2c'],

    // Collection limit
    limit: 20,

    // Enable AI analysis (simulated for demo)
    enableAiAnalysis: true,

    // Demo mode (uses mock data if Meta API not configured)
    demoMode: !process.env.META_ACCESS_TOKEN
};

// ═══════════════════════════════════════════════════════════════════════
// Main Demo Function
// ═══════════════════════════════════════════════════════════════════════

async function runDemo() {
    console.log(`
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║   ORCHESTRAI COMPETITIVE INTELLIGENCE SYSTEM                          ║
║   Hybrid Orchestration Demo                                           ║
║                                                                       ║
║   Infrastructure Agents + Claude Code Specialized Agents              ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
`);

    if (DEMO_CONFIG.demoMode) {
        console.log(`
⚠️  DEMO MODE ACTIVE
   Meta Ad Library API not configured - using mock data
   To use real API, set META_ACCESS_TOKEN in .env file
`);
    }

    try {
        // ───────────────────────────────────────────────────────────────────────
        // Step 1: Initialize Domain Hub
        // ───────────────────────────────────────────────────────────────────────

        console.log(`\n${'═'.repeat(75)}`);
        console.log(`STEP 1: INITIALIZING DOMAIN HUB`);
        console.log(`${'═'.repeat(75)}\n`);

        const hub = new CompetitiveIntelligenceHub({
            // Scoring weights
            scoringWeights: {
                longevity: 0.40,
                iteration: 0.25,
                advertiserQuality: 0.20,
                industryRelevance: 0.15
            },

            // Feature flags
            enableApifyScraping: false, // Using stub for demo
            enableAiAnalysis: DEMO_CONFIG.enableAiAnalysis
        });

        // Set up event listeners to see what's happening
        setupEventListeners(hub);

        await hub.initialize();

        console.log(`\n✅ Domain Hub initialized successfully!`);
        console.log(`   - Infrastructure agents: ${hub.infrastructureAgents.size}`);
        console.log(`   - Claude Code agents available: ${hub.claudeCodeAgents.length}`);

        // ───────────────────────────────────────────────────────────────────────
        // Step 2: Collect Ads from Meta Ad Library
        // ───────────────────────────────────────────────────────────────────────

        console.log(`\n${'═'.repeat(75)}`);
        console.log(`STEP 2: COLLECTING ADS FROM META AD LIBRARY API`);
        console.log(`${'═'.repeat(75)}\n`);

        let collectionResult;

        if (DEMO_CONFIG.demoMode) {
            // Use mock data for demo
            collectionResult = generateMockCollectionResult();
            console.log(`   Using mock data (${collectionResult.totalAds} ads)`);
        } else {
            // Real Meta API call
            collectionResult = await hub.collectAds({
                keywords: DEMO_CONFIG.keywords,
                industries: DEMO_CONFIG.industries,
                markets: DEMO_CONFIG.markets,
                limit: DEMO_CONFIG.limit,
                dataSources: ['meta'] // Only Meta for demo
            });
        }

        displayCollectionResults(collectionResult);

        // ───────────────────────────────────────────────────────────────────────
        // Step 3: Performance Scoring
        // ───────────────────────────────────────────────────────────────────────

        console.log(`\n${'═'.repeat(75)}`);
        console.log(`STEP 3: CALCULATING PERFORMANCE SCORES`);
        console.log(`${'═'.repeat(75)}\n`);

        console.log(`   Algorithm Components:`);
        console.log(`   - Longevity Score (40%): Based on days running`);
        console.log(`   - Iteration Score (25%): Based on creative variations`);
        console.log(`   - Advertiser Quality (20%): Based on verification, funding transparency`);
        console.log(`   - Industry Relevance (15%): Based on keyword matching\n`);

        // In real usage, scoring happens automatically via events
        // Here we're just showing what the scores look like

        if (DEMO_CONFIG.demoMode) {
            displayMockScoringResults();
        }

        // ───────────────────────────────────────────────────────────────────────
        // Step 4: AI Analysis with Claude Code Agents
        // ───────────────────────────────────────────────────────────────────────

        console.log(`\n${'═'.repeat(75)}`);
        console.log(`STEP 4: AI ANALYSIS WITH CLAUDE CODE SPECIALIZED AGENTS`);
        console.log(`${'═'.repeat(75)}\n`);

        console.log(`   Claude Code Agents Used for Intelligence:`);
        console.log(`   ✓ meta-ads-specialist - Platform-specific insights`);
        console.log(`   ✓ direct-response-copywriter - Hook/CTA analysis`);
        console.log(`   ✓ sentiment-analysis-specialist - Emotional triggers`);
        console.log(`   ✓ conversion-optimization-specialist - CRO insights\n`);

        console.log(`   How It Works:`);
        console.log(`   1. Infrastructure agent collects ad data (headline, copy, etc.)`);
        console.log(`   2. Domain Hub invokes Claude Code agent via Task tool`);
        console.log(`   3. Claude Code agent analyzes and returns insights`);
        console.log(`   4. Infrastructure agent stores analysis in database\n`);

        if (DEMO_CONFIG.enableAiAnalysis && DEMO_CONFIG.demoMode) {
            displayMockAiAnalysis();
        }

        // ───────────────────────────────────────────────────────────────────────
        // Step 5: Template Generation
        // ───────────────────────────────────────────────────────────────────────

        console.log(`\n${'═'.repeat(75)}`);
        console.log(`STEP 5: GENERATING LAUNCH-READY AD TEMPLATES`);
        console.log(`${'═'.repeat(75)}\n`);

        console.log(`   Template Generation Process:`);
        console.log(`   1. Select top-performing ad (score >= 80)`);
        console.log(`   2. Extract copy patterns (via direct-response-copywriter)`);
        console.log(`   3. Generate fill-in-the-blank template (via content-writer-specialist)`);
        console.log(`   4. Create A/B test variations (via ad-copy-variation-generator)`);
        console.log(`   5. Add targeting recommendations (via meta-ads-specialist)`);
        console.log(`   6. Include budget strategy (via google-ads-specialist)\n`);

        if (DEMO_CONFIG.demoMode) {
            displayMockTemplate();
        }

        // ───────────────────────────────────────────────────────────────────────
        // Step 6: Competitor Tracking
        // ───────────────────────────────────────────────────────────────────────

        console.log(`\n${'═'.repeat(75)}`);
        console.log(`STEP 6: SETTING UP COMPETITOR TRACKING`);
        console.log(`${'═'.repeat(75)}\n`);

        console.log(`   Competitor Tracking Features:`);
        console.log(`   - Monitor specific Facebook/Instagram pages`);
        console.log(`   - Check for new ads every N hours`);
        console.log(`   - Alert when competitor launches campaigns`);
        console.log(`   - Historical archive of competitor ads`);
        console.log(`   - Campaign timeline visualization\n`);

        if (DEMO_CONFIG.demoMode) {
            displayMockCompetitorTracking();
        }

        // ───────────────────────────────────────────────────────────────────────
        // Step 7: Demo Summary
        // ───────────────────────────────────────────────────────────────────────

        console.log(`\n${'═'.repeat(75)}`);
        console.log(`DEMO SUMMARY`);
        console.log(`${'═'.repeat(75)}\n`);

        console.log(`   ✅ Hybrid Architecture Demonstrated:`);
        console.log(`      - Infrastructure Agents (Node.js) handle technical operations`);
        console.log(`      - Claude Code Agents provide AI-powered intelligence`);
        console.log(`      - Event-driven coordination keeps system loosely coupled\n`);

        console.log(`   📊 Key Components Built:`);
        console.log(`      - Domain Hub orchestrator`);
        console.log(`      - Meta Ad Collector Agent (API integration)`);
        console.log(`      - Performance Scorer Agent (scoring algorithm)`);
        console.log(`      - Database Coordinator Agent (PostgreSQL)`);
        console.log(`      - Integration with 10+ Claude Code agents\n`);

        console.log(`   🚀 Next Steps:`);
        console.log(`      1. Configure Meta Ad Library API (set META_ACCESS_TOKEN)`);
        console.log(`      2. Set up PostgreSQL database (run schema.sql)`);
        console.log(`      3. Start collecting real ads (npm run pipeline:collection)`);
        console.log(`      4. View ads in dashboard (coming soon)\n`);

        // Shutdown gracefully
        await hub.shutdown();

        console.log(`\n✅ Demo completed successfully!\n`);

    } catch (error) {
        console.error(`\n❌ Demo failed:`, error);
        process.exit(1);
    }
}

// ═══════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════

/**
 * Set up event listeners to see system activity
 */
function setupEventListeners(hub) {
    hub.on('ads-collected', (ads) => {
        console.log(`   📊 Event: ${ads.length} ads collected`);
    });

    hub.on('ads-scored', (ads) => {
        console.log(`   📈 Event: ${ads.length} ads scored`);
    });

    hub.on('ai-analysis-complete', (analyses) => {
        console.log(`   🤖 Event: AI analysis complete for ${analyses.length} ads`);
    });

    hub.on('template-generated', (template) => {
        console.log(`   🎨 Event: Template generated from ad ${template.sourceAdId}`);
    });

    hub.on('competitor-new-campaign', (data) => {
        console.log(`   ⚠️  Event: ${data.competitor.name} launched ${data.newAds.length} new ads!`);
    });
}

/**
 * Generate mock collection result for demo
 */
function generateMockCollectionResult() {
    return {
        totalAds: 15,
        newAds: 15,
        sources: {
            meta: 15,
            apify: 0
        },
        topPerformers: [
            {
                adLibraryId: 'mock-ad-1',
                headline: 'Transform Your Smile in Just 24 Hours',
                advertiserName: 'Premium Dental Clinic',
                performanceScore: 87.5
            },
            {
                adLibraryId: 'mock-ad-2',
                headline: 'Are You Tired of Missing Teeth?',
                advertiserName: 'Smile Solutions NL',
                performanceScore: 84.2
            }
        ]
    };
}

/**
 * Display collection results
 */
function displayCollectionResults(result) {
    console.log(`   ✅ Collection Complete:`);
    console.log(`      Total ads: ${result.totalAds}`);
    console.log(`      New ads: ${result.newAds}`);
    console.log(`      Sources: Meta (${result.sources.meta}), Apify (${result.sources.apify || 0})\n`);

    if (result.topPerformers && result.topPerformers.length > 0) {
        console.log(`   🏆 Top Performers:`);
        result.topPerformers.forEach((ad, idx) => {
            console.log(`      ${idx + 1}. "${ad.headline}"`);
            console.log(`         Advertiser: ${ad.advertiserName}`);
            console.log(`         Score: ${ad.performanceScore}/100\n`);
        });
    }
}

/**
 * Display mock scoring results
 */
function displayMockScoringResults() {
    console.log(`   Sample Scored Ad:`);
    console.log(`   ┌─────────────────────────────────────────────────────────┐`);
    console.log(`   │ Performance Score: 87.5 / 100                          │`);
    console.log(`   ├─────────────────────────────────────────────────────────┤`);
    console.log(`   │ • Longevity Score:   95.0  (ad running 62 days)        │`);
    console.log(`   │ • Iteration Score:   80.0  (3 creative variations)     │`);
    console.log(`   │ • Advertiser Quality: 90.0  (verified page)            │`);
    console.log(`   │ • Industry Relevance: 75.0  (5/7 keywords matched)     │`);
    console.log(`   │ • Industry Bonus:    +5.0  (before/after images)       │`);
    console.log(`   └─────────────────────────────────────────────────────────┘\n`);
}

/**
 * Display mock AI analysis
 */
function displayMockAiAnalysis() {
    console.log(`   Sample AI Analysis Results:`);
    console.log(`   ┌─────────────────────────────────────────────────────────┐`);
    console.log(`   │ meta-ads-specialist:                                    │`);
    console.log(`   │   • Target Audience: Adults 35-65, income $75K+        │`);
    console.log(`   │   • Platform: Best for Facebook Feed, Instagram Stories│`);
    console.log(`   │   • Optimization: Add urgency CTA, test video format   │`);
    console.log(`   ├─────────────────────────────────────────────────────────┤`);
    console.log(`   │ direct-response-copywriter:                             │`);
    console.log(`   │   • Hook: "Are you tired of..." (question pattern)     │`);
    console.log(`   │   • Value Prop: Same-day service + lifetime warranty   │`);
    console.log(`   │   • CTA: "Book Free Consultation" (low-barrier)        │`);
    console.log(`   ├─────────────────────────────────────────────────────────┤`);
    console.log(`   │ sentiment-analysis-specialist:                          │`);
    console.log(`   │   • Primary Emotion: Desire (transformation)           │`);
    console.log(`   │   • Secondary: Trust (credibility signals)             │`);
    console.log(`   │   • Intensity: 8/10 (strong emotional appeal)          │`);
    console.log(`   └─────────────────────────────────────────────────────────┘\n`);
}

/**
 * Display mock template
 */
function displayMockTemplate() {
    console.log(`   Sample Generated Template:`);
    console.log(`   ┌─────────────────────────────────────────────────────────┐`);
    console.log(`   │ COPY TEMPLATE:                                          │`);
    console.log(`   │ Headline: "[Your Clinic Name] offers [service] that    │`);
    console.log(`   │            [benefit] in just [timeframe]"               │`);
    console.log(`   │                                                         │`);
    console.log(`   │ Primary Text: "Are you tired of [pain point]? Our      │`);
    console.log(`   │                [unique approach] helps you [outcome]..." │`);
    console.log(`   ├─────────────────────────────────────────────────────────┤`);
    console.log(`   │ A/B TEST VARIATIONS:                                    │`);
    console.log(`   │ 1. "Transform Your Smile in Just 24 Hours"             │`);
    console.log(`   │ 2. "Same-Day Dental Implants - No More Waiting"        │`);
    console.log(`   │ 3. "Get Your Confidence Back Today"                    │`);
    console.log(`   ├─────────────────────────────────────────────────────────┤`);
    console.log(`   │ TARGETING:                                              │`);
    console.log(`   │ Age: 35-65 | Location: 25km radius | Income: $75K+     │`);
    console.log(`   │ Interests: dental health, cosmetic procedures          │`);
    console.log(`   ├─────────────────────────────────────────────────────────┤`);
    console.log(`   │ BUDGET: €50-100/day | CPC: €0.80-1.50 | Scale: +10%/wk │`);
    console.log(`   └─────────────────────────────────────────────────────────┘\n`);
}

/**
 * Display mock competitor tracking
 */
function displayMockCompetitorTracking() {
    console.log(`   Sample Competitor Tracking Setup:`);
    console.log(`   ┌─────────────────────────────────────────────────────────┐`);
    console.log(`   │ Competitor: "Premium Dental Clinic Amsterdam"          │`);
    console.log(`   │ Facebook Page ID: 123456789                             │`);
    console.log(`   │ Check Frequency: Every 6 hours                          │`);
    console.log(`   │ Alert Threshold: 3+ new ads                             │`);
    console.log(`   ├─────────────────────────────────────────────────────────┤`);
    console.log(`   │ Current Stats:                                          │`);
    console.log(`   │   Total Ads: 47                                         │`);
    console.log(`   │   Active Ads: 12                                        │`);
    console.log(`   │   Avg Performance Score: 72.3                           │`);
    console.log(`   │   Last Campaign: 3 days ago (5 new ads)                 │`);
    console.log(`   └─────────────────────────────────────────────────────────┘\n`);
}

// ═══════════════════════════════════════════════════════════════════════
// Run Demo
// ═══════════════════════════════════════════════════════════════════════

if (require.main === module) {
    runDemo().catch(error => {
        console.error(`Fatal error:`, error);
        process.exit(1);
    });
}

module.exports = { runDemo };
