# 🎯 ORCHESTRAI Competitive Intelligence System

**Facebook/Instagram Ad Monitoring, Analysis & Template Generation**

A comprehensive system for discovering, analyzing, and curating competitor Facebook/Instagram ads using Meta Ad Library API, Apify scraping, AI-powered creative analysis, and performance scoring to identify best-performing ads and generate launch-ready templates.

---

## 🚀 Features

### 🔍 **Multi-Source Ad Collection**
- **Meta Ad Library API Integration**: Official access to EU ads (all commercial ads)
- **Apify Scraper Integration**: Global market coverage (US, Canada, Asia)
- **Keyword Monitoring**: Search by keywords (dental implants, AI SaaS, etc.)
- **Competitor Tracking**: Monitor specific Facebook/Instagram advertiser pages
- **Automated Collection**: Daily scheduled scraping with cron jobs

### 🧠 **AI-Powered Creative Analysis**
- **Claude API**: Copy analysis - hooks, value propositions, emotional triggers, CTAs
- **GPT-4 Vision**: Visual analysis - color palettes, layouts, branding, readability
- **Pattern Detection**: Identify winning hooks, CTA patterns, creative formats
- **Sentiment Analysis**: Understand emotional tone and messaging strategies
- **Industry Classification**: Auto-categorize ads (dental B2C/B2B, AI SaaS, etc.)

### 📊 **Performance Scoring Algorithm**
- **Longevity Score** (40%): Longer-running ads = likely performing well
- **Creative Iteration Score** (25%): Testing patterns indicate optimization
- **Advertiser Quality Score** (20%): Verified pages, professional presence
- **Industry Relevance Score** (15%): Keyword match, visual relevance, targeting
- **Industry-Specific Adjustments**: Dental, AI SaaS custom scoring rules
- **0-100 Scale**: Easy-to-understand performance ratings

### 📚 **Curated Collections & Libraries**
- **Auto-Generated Collections**: "Top 50 Dental Implant Ads", "Best AI SaaS Signup Flows"
- **Custom Collections**: Save your own curated sets
- **Trending Hooks Library**: Most popular hooks by industry
- **Pattern Library**: Winning creative patterns and formulas
- **Swipe File Export**: PDF, CSV, Notion, Google Slides

### 🎨 **Launch-Ready Template Generation**
- **Fill-in-the-Blank Copy**: Customizable templates from top performers
- **Creative Guidelines**: Visual recommendations, color palettes, layouts
- **Targeting Recommendations**: Age, location, interests, behaviors
- **Budget Strategies**: Suggested budgets, CPC estimates, scaling plans
- **A/B Test Variations**: Pre-generated headline, image, CTA variations

### 🔔 **Real-Time Competitor Monitoring**
- **Track Specific Advertisers**: Monitor competitor Facebook/Instagram pages
- **New Campaign Alerts**: Email, Slack, webhook notifications
- **Historical Archive**: Complete timeline of competitor ad activity
- **Spending Patterns**: Detect campaign launches and budget changes
- **Competitive Intelligence**: Market trends and competitor strategies

### 📈 **Analytics & Insights Dashboard**
- **Industry Trends**: D3.js visualizations of ad volume, hooks, CTAs
- **Competitive Landscape**: Top advertisers, market share analysis
- **Emerging Patterns**: New hooks/strategies detected across ads
- **Format Performance**: Image vs video vs carousel effectiveness
- **Interactive Filtering**: Search, filter, sort by multiple criteria

### 🚪 **Multi-Tenant Client Portal**
- **Client Accounts**: Each client gets their own login
- **Permission Levels**: Viewer, Member, Pro with usage limits
- **White-Label Branding**: Custom logos, colors for agency use
- **Usage Tracking**: Monitor export limits per client
- **Subscription Tiers**: Starter ($97), Professional ($297), Agency ($997)

---

## 📋 Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **PostgreSQL**: Version 14+ (for ad data storage)
- **Redis**: For caching and performance (optional but recommended)
- **ORCHESTRAI**: Integration with existing ORCHESTRAI system

**External APIs Required:**
- Meta Ad Library API (free, requires Facebook app)
- Apify account ($49-99/month for scraping)
- Claude API ($50-150/month for AI analysis)
- OpenAI API ($30-100/month for visual analysis)

---

## 🛠️ Installation

### 1. **Install Dependencies**
```bash
cd orchestrai-domains/competitive-intelligence
npm install
```

### 2. **Configure Environment**

Create a `.env` file from the example:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Meta Ad Library API
META_ACCESS_TOKEN=your_token_here
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret

# Apify
APIFY_API_TOKEN=your_apify_token

# AI APIs
CLAUDE_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key

# Database
DATABASE_URL=postgresql://localhost:5432/competitive_intelligence
REDIS_URL=redis://localhost:6379

# Storage (Cloudflare R2 or AWS S3)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=facebook-ads-creative

# Email Alerts (optional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. **Set Up Database**

Create PostgreSQL database:
```bash
createdb competitive_intelligence
```

Run migrations:
```bash
npm run db:migrate
```

Optionally seed with test data:
```bash
npm run db:seed
```

### 4. **Verify Configuration**
```bash
# Test Meta Ad Library API
npm run test:meta-api

# Test Apify integration
npm run test:apify
```

---

## 🎯 Quick Start

### **Start the Domain Hub**
```bash
npm start
```

### **Start the API Server**
```bash
npm run api
```

### **Run Ad Collection Pipeline (Manual)**
```bash
npm run pipeline:collection
```

### **Run Analysis Pipeline**
```bash
npm run pipeline:analysis
```

---

## 💻 Usage Examples

### **Basic Ad Collection**
```javascript
const CompetitiveIntelligenceHub = require('./competitive-intelligence-domain-hub');

async function collectAds() {
    const hub = new CompetitiveIntelligenceHub();

    // Initialize system
    await hub.initialize();

    // Start collecting ads by keyword
    const result = await hub.collectAds({
        keywords: ['dental implants', 'teeth whitening'],
        industries: ['dental_b2c'],
        markets: ['NL', 'BE', 'DE'],
        limit: 100
    });

    console.log(`Collected ${result.totalAds} ads`);
    console.log(`Top performing: ${result.topPerformers.length}`);
}

collectAds();
```

### **Track Competitor**
```javascript
async function trackCompetitor() {
    const hub = new CompetitiveIntelligenceHub();
    await hub.initialize();

    // Start tracking a competitor's Facebook page
    const result = await hub.trackCompetitor({
        name: 'Competitor Dental Clinic',
        facebookPageId: '123456789',
        industry: 'dental_b2c',
        alertOnNewCampaign: true,
        checkFrequencyHours: 6
    });

    console.log(`Now tracking: ${result.competitor.name}`);
}
```

### **Generate Ad Template**
```javascript
async function generateTemplate() {
    const hub = new CompetitiveIntelligenceHub();
    await hub.initialize();

    // Generate template from top-performing ad
    const template = await hub.generateTemplate({
        adId: 'abc123',
        includeAbTestVariations: true,
        includeTargeting: true,
        includeBudgetStrategy: true
    });

    console.log('Copy Template:', template.copyTemplate);
    console.log('Creative Guidelines:', template.creativeGuidelines);
    console.log('Targeting:', template.targetingRecommendations);
}
```

### **Create Custom Collection**
```javascript
async function createCollection() {
    const hub = new CompetitiveIntelligenceHub();
    await hub.initialize();

    // Create curated collection
    const collection = await hub.createCollection({
        name: 'Best Dental Implant Ads Q1 2024',
        description: 'Top-performing dental implant ads for lead generation',
        filters: {
            industry: 'dental_b2c',
            subIndustry: 'dental_implants',
            minPerformanceScore: 80,
            dateRange: 'last_90_days'
        }
    });

    console.log(`Collection created with ${collection.adCount} ads`);
}
```

---

## 📚 API Reference

### **CompetitiveIntelligenceDomainHub**

#### `initialize()`
Initialize the competitive intelligence system and all agents.

**Returns:** `Promise<{ success: boolean, domain: string }>`

---

#### `collectAds(criteria)`
Collect ads based on search criteria.

**Parameters:**
```javascript
{
  keywords: ['dental implants'],     // Search keywords
  industries: ['dental_b2c'],        // Target industries
  markets: ['NL', 'BE'],             // Geographic markets
  limit: 100,                        // Max ads to collect
  dataSources: ['meta', 'apify']     // Data sources to use
}
```

**Returns:** `Promise<{ totalAds: number, newAds: number, topPerformers: Ad[] }>`

---

#### `analyzeAd(adId)`
Run AI analysis on a specific ad.

**Parameters:**
- `adId` (string): Ad ID to analyze

**Returns:** `Promise<{ copyAnalysis: object, visualAnalysis: object, performanceScore: number }>`

---

#### `trackCompetitor(competitorInfo)`
Start monitoring a competitor's Facebook/Instagram page.

**Parameters:**
```javascript
{
  name: 'Competitor Name',           // Display name
  facebookPageId: '123456789',       // Facebook Page ID
  industry: 'dental_b2c',            // Industry category
  alertOnNewCampaign: true,          // Send alerts?
  checkFrequencyHours: 6             // Check interval
}
```

**Returns:** `Promise<{ success: boolean, competitor: Competitor }>`

---

#### `generateTemplate(options)`
Generate launch-ready template from an ad.

**Parameters:**
```javascript
{
  adId: 'abc123',                      // Source ad ID
  includeAbTestVariations: true,       // Generate A/B tests?
  includeTargeting: true,              // Add targeting recommendations?
  includeBudgetStrategy: true          // Add budget suggestions?
}
```

**Returns:** `Promise<Template>`

---

#### `createCollection(collectionInfo)`
Create custom ad collection.

**Parameters:**
```javascript
{
  name: 'Collection Name',             // Collection name
  description: 'Description',          // Optional description
  filters: {                           // Filter criteria
    industry: 'dental_b2c',
    minPerformanceScore: 80,
    dateRange: 'last_90_days'
  }
}
```

**Returns:** `Promise<Collection>`

---

#### `exportCollection(collectionId, format)`
Export collection in specified format.

**Parameters:**
- `collectionId` (string): Collection ID
- `format` (string): Export format (`'pdf'`, `'csv'`, `'notion'`, `'slides'`, `'json'`, `'zip'`)

**Returns:** `Promise<{ downloadUrl: string, expiresAt: Date }>`

---

## 🔧 Configuration

### **Scoring Algorithm Weights**

Customize performance scoring in `.env`:
```env
# Must sum to 1.0
SCORE_LONGEVITY_WEIGHT=0.40
SCORE_ITERATION_WEIGHT=0.25
SCORE_ADVERTISER_QUALITY_WEIGHT=0.20
SCORE_INDUSTRY_RELEVANCE_WEIGHT=0.15
```

### **Collection Schedule**

Configure automated collection in `.env`:
```env
# Cron syntax (default: daily at 6 AM)
AD_COLLECTION_CRON=0 6 * * *
AD_ANALYSIS_CRON=0 8 * * *
LIBRARY_UPDATE_CRON=0 12 * * *
COMPETITOR_CHECK_CRON=0 */6 * * *
```

### **Industry Keywords**

Define industry-specific keywords in `.env`:
```env
DENTAL_B2C_KEYWORDS=dental implants,cosmetic dentistry,teeth whitening
DENTAL_B2B_KEYWORDS=CBCT scanner,dental 3D printer,intraoral scanner
AI_SAAS_KEYWORDS=AI chatbot,automation software,AI productivity
```

---

## 📊 Database Schema

### **Core Tables**

#### `ads`
Stores all collected ad data with metadata and scoring.

**Key Fields:**
- `id`: UUID primary key
- `ad_library_id`: Meta Ad Library unique ID
- `advertiser_name`: Facebook page name
- `headline`, `primary_text`, `cta_type`: Ad copy
- `creative_urls`: JSONB array of image/video URLs
- `performance_score`: 0-100 calculated score
- `industry`, `sub_industry`: Classification
- `start_date`, `end_date`, `is_active`: Timing

#### `ad_analysis`
AI-powered analysis results for each ad.

**Key Fields:**
- `ad_id`: Foreign key to ads table
- `hook`, `value_proposition`, `emotional_trigger`: Copy analysis
- `color_palette`, `layout_type`, `visual_quality`: Visual analysis
- `hook_pattern`, `cta_pattern`: Pattern detection

#### `collections`
Curated collections of ads.

**Key Fields:**
- `id`: UUID primary key
- `name`, `description`: Collection metadata
- `collection_type`: auto_generated, custom, client
- `ad_count`, `average_score`: Statistics

#### `competitors`
Tracked competitor pages.

**Key Fields:**
- `id`: UUID primary key
- `facebook_page_id`: Unique page identifier
- `tracking_enabled`, `check_frequency_hours`: Monitoring settings
- `total_ads`, `active_ads`: Statistics

#### `templates`
Generated ad templates.

**Key Fields:**
- `id`: UUID primary key
- `source_ad_id`: Original ad reference
- `copy_template`, `creative_guidelines`: Template content
- `targeting_recommendations`, `budget_strategy`: Launch guidance

See [database/schema.sql](database/schema.sql) for complete schema.

---

## 🧪 Testing

### **Run All Tests**
```bash
npm test
```

### **Unit Tests Only**
```bash
npm run test:unit
```

### **Integration Tests**
```bash
npm run test:integration
```

### **E2E Tests (Playwright)**
```bash
npm run test:e2e
```

### **Test Specific Integration**
```bash
# Test Meta Ad Library API
npm run test:meta-api

# Test Apify integration
npm run test:apify
```

---

## 🚨 Troubleshooting

### **Meta Ad Library API Issues**

**Problem:** "Invalid access token"
**Solution:**
1. Regenerate token at https://developers.facebook.com/tools/explorer
2. Ensure app has `ads_read` permission
3. Verify token hasn't expired

**Problem:** "Rate limit exceeded"
**Solution:**
1. Reduce `META_API_REQUESTS_PER_SECOND` in `.env`
2. Implement request queuing
3. Consider upgrading Facebook app tier

### **Apify Integration Issues**

**Problem:** "Apify actor failed"
**Solution:**
1. Check Apify dashboard for error logs
2. Verify API token is valid
3. Ensure sufficient Apify credits

**Problem:** "No results from Apify"
**Solution:**
1. Verify target URLs are correct
2. Check if Facebook changed their layout (Apify may need update)
3. Test with smaller dataset first

### **Database Connection Issues**

**Problem:** "Connection refused to PostgreSQL"
**Solution:**
1. Ensure PostgreSQL is running: `pg_isready`
2. Verify `DATABASE_URL` in `.env`
3. Check firewall settings

### **AI Analysis Failures**

**Problem:** "Claude API rate limit"
**Solution:**
1. Reduce `AI_ANALYSIS_BATCH_SIZE` in `.env`
2. Add delays between requests
3. Consider using multiple API keys

---

## 🔒 Security & Compliance

### **Data Privacy**
- **Public Data Only**: Only scrapes publicly available ads from Meta Ad Library
- **GDPR Compliant**: No personal data collected beyond public ad content
- **Data Retention**: Configurable retention periods (default: 1 year)
- **Right to Delete**: Clients can request data deletion

### **API Security**
- **JWT Authentication**: Secure client authentication
- **Rate Limiting**: Per-client rate limits to prevent abuse
- **API Keys**: Encrypted storage with rotation policy
- **CORS Protection**: Dashboard domain whitelisting

### **Best Practices**
- **Never commit `.env`**: Keep credentials out of version control
- **Rotate API keys**: Regular key rotation (quarterly)
- **Monitor usage**: Track API costs and set budget alerts
- **Backup database**: Daily automated backups

---

## 📈 Performance Optimization

### **Caching Strategy**
- **Redis for API responses**: 5-minute TTL for frequent queries
- **Ad data caching**: 1-hour TTL for ad details
- **Collection caching**: 24-hour TTL for collections
- **Invalidate on update**: Clear cache when data changes

### **Database Indexing**
- **Performance score index**: Fast sorting by score
- **Industry index**: Quick filtering by industry
- **Advertiser index**: Efficient competitor queries
- **Date indexes**: Optimize timeline queries

### **Rate Limiting**
- **Meta API**: 200 requests/hour (configurable)
- **Apify**: 3 concurrent actors (configurable)
- **AI Analysis**: 50 ads/batch (configurable)

---

## 🤝 Integration with ORCHESTRAI

### **Crystalline Memory Integration**
```javascript
// Store ad relationships in crystalline memory
await crystallineMemory.createEntity({
  type: 'facebook_ad',
  id: ad.id,
  properties: {
    performanceScore: ad.performance_score,
    industry: ad.industry
  }
});
```

### **Pipeline Sharing**
Competitive Intelligence pipelines are registered in the ORCHESTRAI pipeline registry:
```javascript
pipelineRegistry.register({
  pipelineId: 'ad-collection',
  domain: 'competitive-intelligence',
  estimatedDuration: 30
});
```

### **Shared Agent Communication**
```javascript
// Request keywords from SEO domain
const keywords = await interAgentProtocol.request({
  fromDomain: 'competitive-intelligence',
  toDomain: 'seo',
  action: 'get_keywords',
  params: { industry: 'dental' }
});
```

---

## 🤖 Claude Code Agent Integration

### **Hybrid Architecture Pattern**

This system implements a **hybrid agent architecture** that combines:
- **Infrastructure Agents** (Node.js): Handle technical operations like API calls, database, caching, scoring
- **Claude Code Agents** (existing ORCHESTRAI): Handle intelligence operations like analysis, copywriting, optimization

### **Available Claude Code Agents**

The system leverages these existing ORCHESTRAI Claude Code agents:

| Agent | Purpose | Use Case |
|-------|---------|----------|
| `meta-ads-specialist` | Facebook/Instagram ad platform expertise | Ad platform analysis, optimization strategies |
| `ad-copy-variation-generator` | Create multiple ad copy variations | A/B test generation, copy diversity |
| `direct-response-copywriter` | High-converting ad copy | Template creation, hook optimization |
| `sentiment-analysis-specialist` | Emotional tone analysis | Understand messaging strategies |
| `conversion-optimization-specialist` | CRO best practices | Improve ad performance recommendations |
| `landing-page-optimizer` | Landing page analysis | Analyze post-click experience |
| `content-ai-phrase-detector` | Detect AI-generated patterns | Ensure natural, human-like copy |
| `seo-keyword-research` | Keyword optimization | Ad copy keyword strategy |
| `client-icp-analyst` | Ideal customer profiling | Audience targeting recommendations |

### **Agent Invocation Pattern**

#### **Basic Invocation**
```javascript
const hub = new CompetitiveIntelligenceDomainHub();
await hub.initialize();

// Invoke a Claude Code agent
const analysis = await hub.invokeClaudeAgent('meta-ads-specialist', {
  prompt: `Analyze this Facebook ad for a dental clinic:

  Headline: ${ad.headline}
  Primary Text: ${ad.primaryText}
  CTA: ${ad.ctaType}

  Provide insights on:
  1. Hook effectiveness (1-10)
  2. Value proposition clarity
  3. Emotional triggers used
  4. Call-to-action strength
  5. Recommendations for improvement`,

  context: {
    industry: 'dental_b2c',
    performanceScore: 87,
    daysRunning: 45
  }
});

console.log('Hook Effectiveness:', analysis.hookEffectiveness);
console.log('Recommendations:', analysis.recommendations);
```

#### **Multi-Agent Coordination**
```javascript
async function comprehensiveAdAnalysis(ad) {
  const hub = new CompetitiveIntelligenceDomainHub();
  await hub.initialize();

  // Parallel agent invocation for efficiency
  const [metaAnalysis, sentimentAnalysis, copyVariations] = await Promise.all([
    // Agent 1: Platform-specific analysis
    hub.invokeClaudeAgent('meta-ads-specialist', {
      prompt: `Analyze this Meta ad's platform optimization:
      ${JSON.stringify(ad, null, 2)}

      Focus on: format choice, placement strategy, targeting signals`,
      context: { industry: ad.industry }
    }),

    // Agent 2: Emotional analysis
    hub.invokeClaudeAgent('sentiment-analysis-specialist', {
      prompt: `Analyze emotional tone and sentiment:

      Headline: "${ad.headline}"
      Body: "${ad.primaryText}"

      Identify: primary emotion, intensity, persuasion tactics`,
      context: { audience: 'dental patients' }
    }),

    // Agent 3: Generate variations
    hub.invokeClaudeAgent('ad-copy-variation-generator', {
      prompt: `Create 5 variations of this high-performing ad:

      Original: "${ad.headline}"
      Performance Score: ${ad.performanceScore}

      Maintain core message but test different angles`,
      context: { includeAbTests: true }
    })
  ]);

  return {
    platformOptimization: metaAnalysis,
    emotionalProfile: sentimentAnalysis,
    testingVariations: copyVariations
  };
}
```

#### **Template Generation with Agents**
```javascript
async function generateLaunchReadyTemplate(ad) {
  const hub = new CompetitiveIntelligenceDomainHub();
  await hub.initialize();

  // Step 1: Direct-response analysis
  const copyAnalysis = await hub.invokeClaudeAgent('direct-response-copywriter', {
    prompt: `Extract the direct-response formula from this ad:

    ${ad.primaryText}

    Identify: AIDA flow, pain points addressed, urgency tactics, CTA strategy`,
    context: { performanceScore: ad.performanceScore }
  });

  // Step 2: Generate customizable template
  const template = await hub.invokeClaudeAgent('ad-copy-variation-generator', {
    prompt: `Create a fill-in-the-blank template based on this successful ad:

    Hook: ${copyAnalysis.hook}
    Problem: ${copyAnalysis.painPoint}
    Solution: ${copyAnalysis.solution}
    CTA: ${copyAnalysis.cta}

    Format: [HOOK] + [PROBLEM] + [SOLUTION] + [URGENCY] + [CTA]`,
    context: { templateFormat: 'fillable' }
  });

  // Step 3: CRO optimization
  const cro = await hub.invokeClaudeAgent('conversion-optimization-specialist', {
    prompt: `Optimize this template for maximum conversions:

    ${template}

    Suggest: micro-commitments, friction reducers, trust signals`,
    context: { industry: ad.industry }
  });

  return {
    baseTemplate: template,
    directResponseFormula: copyAnalysis,
    croOptimizations: cro
  };
}
```

#### **ICP-Targeted Analysis**
```javascript
async function icpTargetedRecommendations(ad, clientIcp) {
  const hub = new CompetitiveIntelligenceDomainHub();
  await hub.initialize();

  // Analyze fit between ad and client's ICP
  const icpAnalysis = await hub.invokeClaudeAgent('client-icp-analyst', {
    prompt: `Compare this ad's targeting to our client's ICP:

    Ad Demographics: ${ad.demographics}
    Ad Messaging: ${ad.primaryText}

    Client ICP:
    - Age: ${clientIcp.age}
    - Income: ${clientIcp.income}
    - Pain Points: ${clientIcp.painPoints}
    - Values: ${clientIcp.values}

    Assess: message-market fit, demographic alignment, opportunity score (1-100)`,

    context: {
      clientIndustry: clientIcp.industry,
      competitorAd: true
    }
  });

  return icpAnalysis;
}
```

#### **AI-Generated Content Detection**
```javascript
async function detectAiGeneratedContent(ad) {
  const hub = new CompetitiveIntelligenceDomainHub();
  await hub.initialize();

  // Check if ad copy is AI-generated (and potentially improve it)
  const aiDetection = await hub.invokeClaudeAgent('content-ai-phrase-detector', {
    prompt: `Analyze this ad copy for AI-generated patterns:

    "${ad.primaryText}"

    Detect: generic phrases, unnatural transitions, overused words.
    If AI-generated, suggest humanization edits.`,

    context: { performanceScore: ad.performanceScore }
  });

  if (aiDetection.isAiGenerated && aiDetection.humanizationSuggestions) {
    console.log('⚠️  Ad appears AI-generated. Humanization suggestions:');
    console.log(aiDetection.humanizationSuggestions);
  }

  return aiDetection;
}
```

### **Event-Driven Agent Coordination**

The domain hub emits events that trigger agent coordination:

```javascript
const hub = new CompetitiveIntelligenceDomainHub();

// Listen for collection complete events
hub.on('collection-complete', async (data) => {
  console.log(`✅ Collected ${data.totalAds} ads`);

  // Automatically trigger AI analysis on high performers
  const topAds = data.ads.filter(ad => ad.performanceScore >= 80);

  for (const ad of topAds) {
    // Queue AI analysis with multiple agents
    await hub.analyzeAdWithClaudeAgents(ad);
  }
});

// Listen for analysis complete events
hub.on('analysis-complete', async (adId, analysis) => {
  console.log(`🧠 Analysis complete for ad ${adId}`);

  // Generate templates from analyzed ads
  if (analysis.copyAnalysis.hookEffectiveness >= 8) {
    await hub.generateTemplate({ adId, includeAbTestVariations: true });
  }
});

// Listen for template generation events
hub.on('template-generated', async (template) => {
  console.log(`📋 Template generated: ${template.name}`);

  // Notify client or add to library
  await notifyClient(template);
});
```

### **Best Practices for Agent Coordination**

1. **Parallel Processing**: Use `Promise.all()` for independent agent invocations
2. **Context Preservation**: Pass relevant context (industry, performance scores) to agents
3. **Error Handling**: Wrap agent calls in try-catch, agents may have rate limits
4. **Cost Optimization**: Cache agent results, avoid re-analyzing same ads
5. **Agent Selection**: Choose specialist agents based on task requirements
6. **Result Validation**: Verify agent outputs meet quality standards before storing

### **Agent Response Format**

Claude Code agents return structured responses:

```javascript
{
  success: true,
  data: {
    // Agent-specific response data
    hookEffectiveness: 9,
    recommendations: ['Use more urgency', 'Add social proof'],
    // ...
  },
  metadata: {
    agentName: 'meta-ads-specialist',
    processingTime: 2300,
    tokensUsed: 1250
  }
}
```

### **Infrastructure vs Intelligence Division**

**Infrastructure Agents Handle:**
- Meta Ad Library API calls → `meta-ad-collector-agent.js`
- Apify scraping coordination → `apify-orchestrator-agent.js`
- Database CRUD operations → `database-coordinator-agent.js`
- Performance score calculation → `performance-scorer-agent.js`
- Creative asset storage → `storage-manager-agent.js`

**Claude Code Agents Handle:**
- Ad creative analysis
- Copy optimization
- Sentiment detection
- Template generation
- ICP matching
- CRO recommendations

This separation ensures:
- **Efficient Resource Usage**: Technical operations in fast Node.js, intelligence in AI
- **Cost Optimization**: Only invoke AI agents when analysis is needed
- **Scalability**: Infrastructure agents can batch process, AI agents work on best performers
- **Reusability**: Leverage existing ORCHESTRAI agents across domains

---

## 📞 Support

### **Documentation**
- [API Reference](docs/API.md)
- [Agent Specifications](docs/AGENTS.md)
- [Performance Scoring](docs/SCORING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

### **Issues & Bugs**
Report issues at: [GitHub Issues](https://github.com/orchestrai/competitive-intelligence/issues)

### **Contributing**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Meta (Facebook)**: Ad Library API for transparency
- **Apify**: Facebook Ads Scraper for global coverage
- **Anthropic**: Claude API for copy analysis
- **OpenAI**: GPT-4 Vision for visual analysis
- **ORCHESTRAI Community**: System architecture and design

---

**Built with ❤️ by the ORCHESTRAI Team**

*Competitive Intelligence System - Monitor, Analyze, Win*
